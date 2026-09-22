#!/usr/bin/env python3
"""Generate reviewed static translation memories from public Aponar Nihon copy.

Only learner-facing Bangla strings from public HTML/JavaScript assets are sent to a
short-lived, secret-protected Workers AI job. No account, profile, or private user
data is read. Translation checkpoints are resumable and are never marked reviewed
until both the dedicated translation and independent review passes succeed.
"""
from __future__ import annotations

import argparse
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from collections import OrderedDict
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Iterable, Sequence

ROOT = Path(__file__).resolve().parents[1]
LANGUAGES = OrderedDict(
    (
        ("ja", "Japanese (日本語)"),
        ("en", "English"),
        ("vi", "Vietnamese (Tiếng Việt)"),
        ("ne", "Nepali (नेपाली)"),
        ("hi", "Hindi (हिन्दी)"),
        ("ur", "Urdu (اردو)"),
        ("my", "Burmese (မြန်မာ)"),
        ("zh", "Simplified Chinese (中文)"),
        ("si", "Sinhala (සිංහල)"),
        ("fil", "Filipino"),
    )
)
MODEL_LANGUAGE_CODES = {
    "ja": "ja",
    "en": "en",
    "vi": "vi",
    "ne": "ne",
    "hi": "hi",
    "ur": "ur",
    "my": "my",
    "zh": "zh",
    "si": "si",
    "fil": "tl",
}
TRANSLATION_MODEL = "@cf/meta/m2m100-1.2b"
REVIEW_MODEL = "@cf/openai/gpt-oss-20b"
BANGLA_RE = re.compile(r"[\u0980-\u09ff]")
WHITESPACE_RE = re.compile(r"\s+")
JAPANESE_TOKEN_RE = re.compile(r"[一-龯々〆ヵヶぁ-ゖァ-ヺー]+")
PROTECTED_TOKEN_RE = re.compile(
    r"https?://[^\s\"'<>]+|www\.[^\s\"'<>]+|"
    r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|"
    r"\bN[1-5]\b|\{\{[^{}]+\}\}|\$\x7b[^{}]+\}|\{[A-Za-z0-9_.-]+\}|%[sd]"
)
FIXED_BRANDS = ("আপনার নিহোন", "Aponar Nihon")
FIXED_EXACT_TEXT = {
    "আপনার নিহোন",
    "APONAR NIHON",
    "JAPANESE LEARNING HUB",
}
EXCLUDED_HTML = {"admin.html", "refresh-site.html"}
EXCLUDED_PARTS = {
    ".git",
    "_site",
    "node_modules",
    "tools",
    "tests",
    "workers",
    "android",
    "play-store",
    "archive",
    "playwright-report",
    "test-results",
}
SKIP_TAGS = {
    "script",
    "style",
    "noscript",
    "template",
    "code",
    "pre",
    "textarea",
    "svg",
    "ruby",
    "rt",
}
VOID_TAGS = {
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
}
TRANSLATABLE_ATTRIBUTES = {"aria-label", "placeholder", "title", "alt"}
INPUT_VALUE_TYPES = {"button", "submit", "reset"}
DEFAULT_TIMEOUT_SECONDS = 1_800
DEFAULT_POLL_INTERVAL_SECONDS = 5.0
DEFAULT_BATCH_ITEMS = 5_000
DEFAULT_REVIEW_GROUP_ITEMS = 12
MAX_BATCH_BODY_BYTES = 8_500_000
SENTINEL_PREFIX = "ZXQKEEP"
SENTINEL_SUFFIX = "QXZ"


def normalize(value: str) -> str:
    return WHITESPACE_RE.sub(" ", html.unescape(str(value or ""))).strip()


def is_source(value: str) -> bool:
    text = normalize(value)
    return bool(text and BANGLA_RE.search(text) and text not in FIXED_EXACT_TEXT)


class HtmlSourceParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.items: list[str] = []
        self.stack: list[tuple[str, bool]] = []
        self.skip_depth = 0

    @staticmethod
    def _must_preserve(tag: str, attrs: list[tuple[str, str | None]]) -> bool:
        if tag in SKIP_TAGS:
            return True
        attributes = {name.lower(): (value or "") for name, value in attrs}
        if attributes.get("lang", "").lower().startswith("ja"):
            return True
        classes = set(attributes.get("class", "").split())
        return "jp" in classes or "data-i18n-no-content" in attributes

    def _append(self, value: str | None) -> None:
        if value is None:
            return
        text = normalize(value)
        if is_source(text):
            self.items.append(text)

    def _attributes(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = {name.lower(): value for name, value in attrs}
        for name in TRANSLATABLE_ATTRIBUTES:
            self._append(attributes.get(name))
        if tag == "input" and (attributes.get("type") or "").lower() in INPUT_VALUE_TYPES:
            self._append(attributes.get("value"))
        if tag == "meta" and (attributes.get("name") or "").lower() == "description":
            self._append(attributes.get("content"))

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        lower = tag.lower()
        skip_here = self._must_preserve(lower, attrs)
        if not self.skip_depth and not skip_here:
            self._attributes(lower, attrs)
        if lower not in VOID_TAGS:
            self.stack.append((lower, skip_here))
            if skip_here:
                self.skip_depth += 1

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        lower = tag.lower()
        if not self.skip_depth and not self._must_preserve(lower, attrs):
            self._attributes(lower, attrs)

    def handle_endtag(self, tag: str) -> None:
        lower = tag.lower()
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] != lower:
                continue
            removed = self.stack[index:]
            del self.stack[index:]
            self.skip_depth -= sum(1 for _name, skipped in removed if skipped)
            self.skip_depth = max(0, self.skip_depth)
            break

    def handle_data(self, data: str) -> None:
        if not self.skip_depth:
            self._append(data)


def _decode_js_escape(text: str, index: int) -> tuple[str, int]:
    if index >= len(text):
        return "\\", index
    char = text[index]
    common = {"n": "\n", "r": "\r", "t": "\t", "b": "\b", "f": "\f", "v": "\v"}
    if char in common:
        return common[char], index + 1
    if char in "\n\r":
        if char == "\r" and index + 1 < len(text) and text[index + 1] == "\n":
            return "", index + 2
        return "", index + 1
    if char == "u":
        offset = index + 1
        if offset < len(text) and text[offset] == "{":
            end = text.find("}", offset + 1)
            if end > offset:
                try:
                    return chr(int(text[offset + 1 : end], 16)), end + 1
                except (ValueError, OverflowError):
                    pass
        digits = text[offset : offset + 4]
        if len(digits) == 4 and re.fullmatch(r"[0-9A-Fa-f]{4}", digits):
            return chr(int(digits, 16)), offset + 4
    if char == "x":
        digits = text[index + 1 : index + 3]
        if len(digits) == 2 and re.fullmatch(r"[0-9A-Fa-f]{2}", digits):
            return chr(int(digits, 16)), index + 3
    return char, index + 1


def _regex_can_start(source: str, index: int) -> bool:
    previous = index - 1
    while previous >= 0 and source[previous].isspace():
        previous -= 1
    if previous < 0 or source[previous] in "([{,:;=!?&|+*%^~<>":
        return True
    end = previous + 1
    while previous >= 0 and (source[previous].isalnum() or source[previous] in "_$"):
        previous -= 1
    return source[previous + 1 : end] in {"return", "throw", "case", "delete", "typeof", "void", "yield"}


def _skip_regex_literal(source: str, index: int) -> int:
    index += 1
    in_class = False
    while index < len(source):
        char = source[index]
        if char == "\\":
            index += 2
            continue
        if char == "[":
            in_class = True
        elif char == "]":
            in_class = False
        elif char == "/" and not in_class:
            index += 1
            while index < len(source) and source[index].isalpha():
                index += 1
            return index
        elif char in "\n\r":
            return index
        index += 1
    return index


def extract_js_strings(source: str) -> list[str]:
    items: list[str] = []
    index = 0
    length = len(source)
    while index < length:
        char = source[index]
        if char == "/" and index + 1 < length and source[index + 1] == "/":
            end = source.find("\n", index + 2)
            index = length if end < 0 else end + 1
            continue
        if char == "/" and index + 1 < length and source[index + 1] == "*":
            end = source.find("*/", index + 2)
            index = length if end < 0 else end + 2
            continue
        if char == "/" and _regex_can_start(source, index):
            index = _skip_regex_literal(source, index)
            continue
        if char not in {"'", '"', "\x60"}:
            index += 1
            continue

        start = index
        quote = char
        index += 1
        buffer: list[str] = []
        dynamic_template = False
        closed = False
        while index < length:
            char = source[index]
            if char == "\\":
                decoded, index = _decode_js_escape(source, index + 1)
                buffer.append(decoded)
                continue
            if char == quote:
                index += 1
                closed = True
                break
            if quote == "\x60" and char == "$" and index + 1 < length and source[index + 1] == "{":
                dynamic_template = True
            buffer.append(char)
            index += 1
            if len(buffer) > 2_000:
                break
        if not closed:
            index = start + 1
            continue
        if not dynamic_template:
            text = normalize("".join(buffer))
            if is_source(text):
                items.append(text)
    return items


INLINE_SCRIPT_RE = re.compile(
    r"<script\b(?P<attrs>[^>]*)>(?P<body>.*?)</script\s*>",
    flags=re.IGNORECASE | re.DOTALL,
)
SRC_ATTRIBUTE_RE = re.compile(r"\bsrc\s*=", flags=re.IGNORECASE)


def source_catalog(root: Path = ROOT) -> list[dict[str, object]]:
    contexts: OrderedDict[str, list[str]] = OrderedDict()

    def add(value: str, context: str) -> None:
        text = normalize(value)
        if not is_source(text):
            return
        files = contexts.setdefault(text, [])
        if context not in files and len(files) < 3:
            files.append(context)

    for path in sorted(root.glob("*.html")):
        if path.name in EXCLUDED_HTML:
            continue
        document = path.read_text(encoding="utf-8", errors="ignore")
        parser = HtmlSourceParser()
        parser.feed(document)
        parser.close()
        for item in parser.items:
            add(item, path.name)
        for match in INLINE_SCRIPT_RE.finditer(document):
            if SRC_ATTRIBUTE_RE.search(match.group("attrs")):
                continue
            for item in extract_js_strings(match.group("body")):
                add(item, path.name + "#inline-script")

    for path in sorted(root.rglob("*.js")):
        rel = path.relative_to(root)
        if any(part in EXCLUDED_PARTS for part in rel.parts):
            continue
        for item in extract_js_strings(path.read_text(encoding="utf-8", errors="ignore")):
            add(item, rel.as_posix())

    return [
        {"source": source, "contexts": files}
        for source, files in contexts.items()
    ]


def existing_reviewed(language: str, root: Path = ROOT) -> dict[str, str]:
    translations: dict[str, str] = {}
    memory = root / "translations" / f"{language}.json"
    paths = list((root / "assets" / "i18n" / "pages").glob(f"*.{language}.json"))
    if memory.exists():
        paths.append(memory)
    for path in sorted(paths):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, UnicodeDecodeError, json.JSONDecodeError):
            continue
        if payload.get("reviewed") is not True or payload.get("targetLanguage") != language:
            continue
        for entry in payload.get("entries", []):
            if not isinstance(entry, dict):
                continue
            source = normalize(entry.get("source", ""))
            target = str(entry.get("target", "")).strip()
            if source and target and source not in translations:
                translations[source] = target
    return translations


def load_checkpoint(path: Path, language: str) -> tuple[dict[str, str], set[str], set[str]]:
    """Load valid draft/review progress from the requested output path."""

    if not path.exists():
        return {}, set(), set()
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError):
        return {}, set(), set()
    if payload.get("sourceLanguage") != "bn" or payload.get("targetLanguage") != language:
        return {}, set(), set()
    complete = payload.get("reviewed") is True
    translations: dict[str, str] = {}
    reviewed_sources: set[str] = set()
    for entry in payload.get("entries", []):
        if not isinstance(entry, dict):
            continue
        source = normalize(entry.get("source", ""))
        target = str(entry.get("target", "")).strip()
        if not source or not target or source in translations or pair_error(source, target):
            continue
        translations[source] = target
        if complete or entry.get("reviewed") is True:
            reviewed_sources.add(source)
    models = {str(model) for model in payload.get("models", []) if isinstance(model, str) and model}
    return translations, reviewed_sources, models


def japanese_tokens(value: str) -> list[str]:
    return JAPANESE_TOKEN_RE.findall(value)


def protected_tokens(value: str) -> list[str]:
    tokens = PROTECTED_TOKEN_RE.findall(value)
    tokens.extend(brand for brand in FIXED_BRANDS if brand in value)
    tokens.extend(re.findall(r"(?<!\w)\d+(?:[.,:/-]\d+)*(?!\w)", value))
    return tokens


def protection_spans(value: str) -> list[tuple[int, int, str]]:
    """Return non-overlapping spans that machine translation must not alter."""

    candidates: list[tuple[int, int, str]] = []
    for regex in (JAPANESE_TOKEN_RE, PROTECTED_TOKEN_RE):
        candidates.extend((match.start(), match.end(), match.group(0)) for match in regex.finditer(value))
    candidates.extend(
        (match.start(), match.end(), match.group(0))
        for match in re.finditer(r"(?<!\w)\d+(?:[.,:/-]\d+)*(?!\w)", value)
    )
    for brand in FIXED_BRANDS:
        start = 0
        while True:
            index = value.find(brand, start)
            if index < 0:
                break
            candidates.append((index, index + len(brand), brand))
            start = index + len(brand)

    selected: list[tuple[int, int, str]] = []
    for start, end, token in sorted(candidates, key=lambda item: (item[0], -(item[1] - item[0]))):
        if any(start < chosen_end and end > chosen_start for chosen_start, chosen_end, _ in selected):
            continue
        selected.append((start, end, token))
    return sorted(selected)


def protect_for_translation(value: str) -> tuple[str, dict[str, str]]:
    """Replace immutable Japanese/brand/URL tokens with deterministic sentinels."""

    spans = protection_spans(value)
    if not spans:
        return value, {}
    parts: list[str] = []
    replacements: dict[str, str] = {}
    cursor = 0
    for index, (start, end, token) in enumerate(spans):
        marker = f"{SENTINEL_PREFIX}{index:04d}{SENTINEL_SUFFIX}"
        if marker in value:
            raise ValueError(f"Source already contains reserved translation marker: {marker}")
        parts.append(value[cursor:start])
        parts.append(marker)
        replacements[marker] = token
        cursor = end
    parts.append(value[cursor:])
    return "".join(parts), replacements


def restore_after_translation(value: str, replacements: dict[str, str]) -> str:
    restored = value.strip()
    for marker, token in replacements.items():
        if restored.count(marker) != 1:
            raise ValueError(f"Translation changed protected marker: {marker}")
        restored = restored.replace(marker, token)
    if SENTINEL_PREFIX in restored:
        raise ValueError("Translation returned an unknown protected marker")
    return restored


def pair_error(source: str, target: str) -> str | None:
    target = target.strip()
    if not target:
        return "empty target"
    without_fixed_brand = target
    for brand in FIXED_BRANDS:
        without_fixed_brand = without_fixed_brand.replace(brand, "")
    if BANGLA_RE.search(without_fixed_brand):
        return "Bangla remains in target"
    for token in japanese_tokens(source):
        if target.count(token) < source.count(token):
            return f"Japanese token changed: {token}"
    for token in protected_tokens(source):
        if target.count(token) < source.count(token):
            return f"protected token changed: {token}"
    return None


def parse_translation_array(raw: str, expected: int) -> list[str]:
    candidates = [raw.strip()]
    fence = re.search(r"\`\`\`(?:json)?\s*(.*?)\s*\`\`\`", raw, flags=re.IGNORECASE | re.DOTALL)
    if fence:
        candidates.insert(0, fence.group(1).strip())
    decoder = json.JSONDecoder()
    for candidate in candidates:
        starts = [index for index, char in enumerate(candidate) if char in "[{"]
        for start in starts:
            try:
                value, _end = decoder.raw_decode(candidate[start:])
            except json.JSONDecodeError:
                continue
            if isinstance(value, dict):
                value = value.get("translations")
            if (
                isinstance(value, list)
                and len(value) == expected
                and all(isinstance(item, str) and item.strip() for item in value)
            ):
                return [item.strip() for item in value]
    raise ValueError(
        f"AI response did not contain exactly {expected} translations; "
        f"response={raw[:800]!r}"
    )


class WorkerRequestError(RuntimeError):
    """A protected translation Worker request could not be completed safely."""


def make_worker_batches(
    rows: Sequence[dict[str, object]],
    max_items: int,
    drafts: dict[str, str] | None = None,
) -> list[list[dict[str, object]]]:
    batches: list[list[dict[str, object]]] = []
    current: list[dict[str, object]] = []
    current_bytes = 2
    for row in rows:
        source = str(row["source"])
        estimate: dict[str, object] = {"source": source, "contexts": row.get("contexts") or []}
        if drafts is not None:
            estimate["draft"] = drafts[source]
        row_bytes = len(json.dumps(estimate, ensure_ascii=False).encode("utf-8")) + 2
        if row_bytes > MAX_BATCH_BODY_BYTES:
            raise ValueError(f"One translation item exceeds the safe batch size: {source[:120]!r}")
        if current and (len(current) >= max_items or current_bytes + row_bytes > MAX_BATCH_BODY_BYTES):
            batches.append(current)
            current = []
            current_bytes = 2
        current.append(row)
        current_bytes += row_bytes
    if current:
        batches.append(current)
    return batches


def _response_index(entry: dict[str, Any], fallback: int) -> int:
    candidate = entry.get("external_reference", entry.get("id", fallback))
    try:
        return int(candidate)
    except (TypeError, ValueError):
        return fallback


def ordered_batch_results(payload: object, expected: int) -> list[object]:
    if not isinstance(payload, dict) or not isinstance(payload.get("responses"), list):
        raise WorkerRequestError(f"Batch result did not contain responses: {str(payload)[:500]}")
    indexed: dict[int, object] = {}
    for fallback, raw_entry in enumerate(payload["responses"]):
        if not isinstance(raw_entry, dict):
            raise WorkerRequestError(f"Batch response {fallback} is not an object")
        index = _response_index(raw_entry, fallback)
        if raw_entry.get("success") is False:
            raise WorkerRequestError(
                f"Batch response {index} failed: {str(raw_entry.get('error') or raw_entry)[:500]}"
            )
        if index in indexed:
            raise WorkerRequestError(f"Batch response index {index} was duplicated")
        indexed[index] = raw_entry.get("result")
    missing = [index for index in range(expected) if index not in indexed]
    if missing or len(indexed) != expected:
        raise WorkerRequestError(
            f"Expected {expected} batch responses, received {len(indexed)}; missing={missing[:10]}"
        )
    return [indexed[index] for index in range(expected)]


def translated_text(result: object) -> str:
    if isinstance(result, str) and result.strip():
        return result.strip()
    if isinstance(result, dict):
        for key in ("translated_text", "translation_text", "translation"):
            value = result.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
    raise WorkerRequestError(f"Translation result was missing translated_text: {str(result)[:500]}")


def reviewed_array(result: object, expected: int) -> list[str]:
    response_value = result.get("response") if isinstance(result, dict) else result
    if isinstance(response_value, dict):
        values = response_value.get("translations")
        if isinstance(values, list) and len(values) == expected and all(
            isinstance(value, str) and value.strip() for value in values
        ):
            return [str(value).strip() for value in values]
    if isinstance(response_value, str):
        return parse_translation_array(response_value, expected)
    raise WorkerRequestError(f"Review result was not a valid translation array: {str(result)[:500]}")


class WorkerClient:
    def __init__(
        self,
        worker_url: str,
        token: str,
        timeout_seconds: int,
        poll_interval_seconds: float,
    ) -> None:
        if not worker_url.strip() or not token.strip():
            raise ValueError("APONAR_I18N_WORKER_URL and APONAR_I18N_JOB_TOKEN are required")
        self.worker_url = worker_url.rstrip("/")
        self.token = token
        self.timeout_seconds = timeout_seconds
        self.poll_interval_seconds = max(1.0, poll_interval_seconds)
        self.models: set[str] = set()

    def _post(self, path: str, payload: dict[str, object], attempts: int = 4) -> object:
        body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        if len(body) > MAX_BATCH_BODY_BYTES:
            raise WorkerRequestError(f"Protected Worker payload is too large: {len(body)} bytes")
        last_error = "unknown Worker error"
        for attempt in range(1, attempts + 1):
            request = urllib.request.Request(
                f"{self.worker_url}{path}",
                data=body,
                method="POST",
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "X-I18n-Job-Token": self.token,
                    "User-Agent": "Aponar-Nihon-i18n-pipeline/2.0",
                },
            )
            try:
                with urllib.request.urlopen(request, timeout=min(self.timeout_seconds, 180)) as response:
                    decoded = json.loads(response.read().decode("utf-8"))
                if not isinstance(decoded, dict) or decoded.get("ok") is not True:
                    raise WorkerRequestError(f"Worker rejected request: {str(decoded)[:800]}")
                return decoded.get("result")
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", errors="replace")[:1_500]
                last_error = f"HTTP {exc.code}: {detail}"
                quota_blocked = "4006" in detail or "daily free allocation" in detail.lower()
                if quota_blocked or exc.code in {400, 401, 403, 404, 413}:
                    raise WorkerRequestError(last_error) from exc
                if attempt < attempts:
                    time.sleep(min(20.0, 2.0 * attempt))
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
                last_error = str(exc)
                if attempt < attempts:
                    time.sleep(min(20.0, 2.0 * attempt))
            except WorkerRequestError:
                raise
        raise WorkerRequestError(last_error)

    def _queue_and_poll(self, path: str, payload: dict[str, object]) -> object:
        # Never retry an ambiguous queue submission: a lost response could otherwise
        # create a duplicate paid batch. The resumable checkpoint makes a rerun safe.
        queued = self._post(path, payload, attempts=1)
        if isinstance(queued, dict) and isinstance(queued.get("responses"), list):
            return queued
        if not isinstance(queued, dict) or not isinstance(queued.get("request_id"), str):
            raise WorkerRequestError(f"Worker did not return a batch request_id: {str(queued)[:500]}")
        request_id = str(queued["request_id"])
        deadline = time.monotonic() + self.timeout_seconds
        while time.monotonic() < deadline:
            time.sleep(self.poll_interval_seconds)
            result = self._post(path, {"request_id": request_id})
            if isinstance(result, dict) and isinstance(result.get("responses"), list):
                return result
            status = result.get("status") if isinstance(result, dict) else None
            if status in {"failed", "error", "cancelled"}:
                raise WorkerRequestError(f"Batch {request_id} ended with status={status}: {result}")
            if status not in {"queued", "running", "processing", None}:
                raise WorkerRequestError(f"Batch {request_id} returned an unknown status: {result}")
        raise WorkerRequestError(f"Batch {request_id} did not finish within {self.timeout_seconds}s")

    def translate_rows(
        self,
        language: str,
        rows: Sequence[dict[str, object]],
    ) -> dict[str, str]:
        protected: list[tuple[str, dict[str, str]]] = [
            protect_for_translation(str(row["source"])) for row in rows
        ]
        final = self._queue_and_poll(
            "/translate",
            {
                "target_lang": MODEL_LANGUAGE_CODES[language],
                "texts": [value for value, _replacements in protected],
            },
        )
        results = ordered_batch_results(final, len(rows))
        translations: dict[str, str] = {}
        for row, result, (_masked, replacements) in zip(rows, results, protected):
            source = str(row["source"])
            target = restore_after_translation(translated_text(result), replacements)
            problem = pair_error(source, target)
            if problem:
                raise WorkerRequestError(f"Draft validation failed for {source[:120]!r}: {problem}")
            translations[source] = target
        self.models.add(TRANSLATION_MODEL)
        return translations

    def review_rows(
        self,
        language: str,
        rows: Sequence[dict[str, object]],
        drafts: dict[str, str],
        group_items: int,
    ) -> dict[str, str]:
        groups: list[list[dict[str, str]]] = []
        for start in range(0, len(rows), group_items):
            group: list[dict[str, str]] = []
            for row in rows[start : start + group_items]:
                source = str(row["source"])
                group.append(
                    {
                        "source": source,
                        "draft": drafts[source],
                        "context": ", ".join(str(value) for value in list(row.get("contexts") or [])[:2]),
                    }
                )
            groups.append(group)
        final = self._queue_and_poll(
            "/review",
            {"target_lang": language, "groups": groups},
        )
        results = ordered_batch_results(final, len(groups))
        reviewed: dict[str, str] = {}
        row_offset = 0
        for group, result in zip(groups, results):
            targets = reviewed_array(result, len(group))
            for item, target in zip(group, targets):
                source = item["source"]
                problem = pair_error(source, target)
                if problem:
                    raise WorkerRequestError(
                        f"Review validation failed at item {row_offset + 1} for {source[:120]!r}: {problem}"
                    )
                reviewed[source] = target
                row_offset += 1
        self.models.add(REVIEW_MODEL)
        return reviewed


def write_memory(
    path: Path,
    language: str,
    catalog: Sequence[dict[str, object]],
    translations: dict[str, str],
    models: Iterable[str],
    reviewed_sources: set[str],
) -> None:
    missing = [str(row["source"]) for row in catalog if str(row["source"]) not in translations]
    expected = {str(row["source"]) for row in catalog}
    reviewed_sources = reviewed_sources & expected
    complete = not missing and reviewed_sources == expected
    entries = [
        {
            "source": str(row["source"]),
            "target": translations[str(row["source"])],
            "reviewed": str(row["source"]) in reviewed_sources,
        }
        for row in catalog
        if str(row["source"]) in translations
    ]
    payload = {
        "schemaVersion": 2,
        "sourceLanguage": "bn",
        "targetLanguage": language,
        "reviewed": complete,
        "stage": "complete" if complete else ("review" if reviewed_sources else "draft"),
        "reviewMethod": (
            "M2M100 AI draft, independent GPT-OSS AI review, and automated Japanese/token/script integrity checks"
            if complete
            else "resumable AI translation checkpoint; incomplete entries are not approved for publication"
        ),
        "generatedAt": datetime.now(timezone.utc).replace(microsecond=0).isoformat(),
        "models": sorted(set(models)),
        "sourceCount": len(entries),
        "reviewedCount": len(reviewed_sources),
        "entries": entries,
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    temporary.replace(path)


def validate_memory(path: Path, language: str, catalog: Sequence[dict[str, object]]) -> list[str]:
    errors: list[str] = []
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        return [f"{path}: invalid JSON: {exc}"]
    if payload.get("sourceLanguage") != "bn":
        errors.append(f"{path}: sourceLanguage must be bn")
    if payload.get("targetLanguage") != language:
        errors.append(f"{path}: targetLanguage mismatch")
    if payload.get("reviewed") is not True:
        errors.append(f"{path}: reviewed must be true")
    if int(payload.get("schemaVersion") or 0) < 2:
        errors.append(f"{path}: schemaVersion must be at least 2")
    entries = payload.get("entries")
    if not isinstance(entries, list):
        return errors + [f"{path}: entries must be an array"]

    expected = {str(row["source"]) for row in catalog}
    actual: dict[str, str] = {}
    for index, entry in enumerate(entries, start=1):
        if not isinstance(entry, dict):
            errors.append(f"{path}: entry {index} is invalid")
            continue
        source = normalize(entry.get("source", ""))
        target = str(entry.get("target", "")).strip()
        if not source or source in actual:
            errors.append(f"{path}: missing or duplicate source at entry {index}")
            continue
        if entry.get("reviewed") is not True:
            errors.append(f"{path}: entry {index} is not independently reviewed")
        actual[source] = target
        problem = pair_error(source, target)
        if problem:
            errors.append(f"{path}: entry {index}: {problem}")
    missing = expected - set(actual)
    extra = set(actual) - expected
    if missing:
        errors.append(f"{path}: {len(missing)} catalog source(s) missing")
    if extra:
        errors.append(f"{path}: {len(extra)} stale source(s) present")
    return errors


def generate(args: argparse.Namespace) -> int:
    language = args.language
    catalog = source_catalog()
    if args.limit:
        catalog = catalog[: args.limit]
    print(
        f"Catalog: {len(catalog)} unique public Bangla strings; target={language}",
        flush=True,
    )

    output = Path(args.output) if args.output else ROOT / "translations" / f"{language}.json"
    if not output.is_absolute():
        output = (ROOT / output).resolve()

    allowed = {str(row["source"]) for row in catalog}
    checkpoint, checkpoint_reviewed, checkpoint_models = load_checkpoint(output, language)
    translations = {
        source: target
        for source, target in checkpoint.items()
        if source in allowed and pair_error(source, target) is None
    }
    reviewed_sources = checkpoint_reviewed & set(translations)
    reviewed_seed = existing_reviewed(language)
    for source, target in reviewed_seed.items():
        if source in allowed and pair_error(source, target) is None:
            translations[source] = target
            reviewed_sources.add(source)
    translations = {
        source: target
        for source, target in translations.items()
        if source in allowed and pair_error(source, target) is None
    }
    reviewed_sources &= set(translations)
    models = set(checkpoint_models)

    if reviewed_sources == allowed and set(translations) == allowed:
        write_memory(output, language, catalog, translations, models, reviewed_sources)
        problems = validate_memory(output, language, catalog)
        if problems:
            for problem in problems[:30]:
                print(f"ERROR: {problem}", file=sys.stderr)
            return 1
        print(f"Completed {language}: existing reviewed memory is current", flush=True)
        return 0

    client = WorkerClient(
        args.worker_url,
        args.worker_token,
        args.timeout_seconds,
        args.poll_interval_seconds,
    )
    missing_rows = [row for row in catalog if str(row["source"]) not in translations]
    draft_batches = make_worker_batches(missing_rows, args.batch_items)
    print(
        f"Draft: {len(translations)} checkpoint/seed(s), {len(missing_rows)} missing, "
        f"{len(draft_batches)} protected Worker batch(es)",
        flush=True,
    )
    for index, batch in enumerate(draft_batches, start=1):
        translations.update(client.translate_rows(language, batch))
        models.update(client.models)
        print(
            f"Draft progress: {index}/{len(draft_batches)} batches, "
            f"{len(translations)}/{len(catalog)} strings",
            flush=True,
        )
        write_memory(output, language, catalog, translations, models, reviewed_sources)

    if args.no_review:
        write_memory(output, language, catalog, translations, models, reviewed_sources)
        print(
            f"Draft checkpoint saved for {language}: {len(translations)} strings; reviewed=false",
            flush=True,
        )
        return 0

    review_rows = [row for row in catalog if str(row["source"]) not in reviewed_sources]
    review_batches = make_worker_batches(review_rows, args.batch_items, translations)
    print(
        f"Review: {len(reviewed_sources)} reviewed seed(s), {len(review_rows)} pending, "
        f"{len(review_batches)} independent AI batch(es)",
        flush=True,
    )
    for index, batch in enumerate(review_batches, start=1):
        reviewed_targets = client.review_rows(
            language,
            batch,
            translations,
            args.review_group_items,
        )
        translations.update(reviewed_targets)
        reviewed_sources.update(reviewed_targets)
        models.update(client.models)
        print(
            f"Review progress: {index}/{len(review_batches)} batches, "
            f"{len(reviewed_sources)}/{len(catalog)} strings",
            flush=True,
        )
        write_memory(output, language, catalog, translations, models, reviewed_sources)

    write_memory(output, language, catalog, translations, models, reviewed_sources)
    problems = validate_memory(output, language, catalog)
    if problems:
        for problem in problems[:30]:
            print(f"ERROR: {problem}", file=sys.stderr)
        return 1
    print(
        f"Completed {language}: {len(catalog)} strings; models={sorted(models)}; reviewed=true",
        flush=True,
    )
    return 0


def validate_directory(path: Path) -> int:
    catalog = source_catalog()
    errors: list[str] = []
    for language in LANGUAGES:
        errors.extend(validate_memory(path / f"{language}.json", language, catalog))
    if errors:
        for error in errors[:100]:
            print(f"ERROR: {error}", file=sys.stderr)
        print(f"Validation failed with {len(errors)} error(s)", file=sys.stderr)
        return 1
    print(
        f"Translation memories OK: {len(LANGUAGES)} languages × "
        f"{len(catalog)} public Bangla strings",
        flush=True,
    )
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Draft, review and validate static multilingual translation memories."
    )
    parser.add_argument("--language", choices=tuple(LANGUAGES))
    parser.add_argument("--output")
    parser.add_argument("--validate-dir")
    parser.add_argument(
        "--worker-url",
        default=os.environ.get("APONAR_I18N_WORKER_URL", ""),
        help="Base URL of the temporary secret-protected translation Worker",
    )
    parser.add_argument(
        "--worker-token",
        default=os.environ.get("APONAR_I18N_JOB_TOKEN", ""),
        help="Temporary Worker credential (prefer APONAR_I18N_JOB_TOKEN)",
    )
    parser.add_argument("--timeout-seconds", type=int, default=DEFAULT_TIMEOUT_SECONDS)
    parser.add_argument(
        "--poll-interval-seconds",
        type=float,
        default=DEFAULT_POLL_INTERVAL_SECONDS,
    )
    parser.add_argument("--batch-items", type=int, default=DEFAULT_BATCH_ITEMS)
    parser.add_argument("--review-group-items", type=int, default=DEFAULT_REVIEW_GROUP_ITEMS)
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--no-review", action="store_true")
    args = parser.parse_args()
    if bool(args.language) == bool(args.validate_dir):
        parser.error("choose exactly one of --language or --validate-dir")
    if args.timeout_seconds < 60:
        parser.error("--timeout-seconds must be at least 60")
    if args.poll_interval_seconds < 1:
        parser.error("--poll-interval-seconds must be at least 1")
    if args.batch_items < 1 or args.batch_items > 5_000:
        parser.error("--batch-items must be between 1 and 5000")
    if args.review_group_items < 1 or args.review_group_items > 25:
        parser.error("--review-group-items must be between 1 and 25")
    return args


def main() -> int:
    args = parse_args()
    if args.validate_dir:
        path = Path(args.validate_dir)
        if not path.is_absolute():
            path = (ROOT / path).resolve()
        return validate_directory(path)
    try:
        return generate(args)
    except (WorkerRequestError, ValueError, RuntimeError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
