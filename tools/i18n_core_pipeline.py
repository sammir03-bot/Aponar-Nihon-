#!/usr/bin/env python3
"""Run the reviewed AI translation pipeline against static-core pages only.

The translation/review engine is versioned alongside this wrapper. This wrapper
changes only source discovery: non-core/general pages keep the existing runtime i18n
system and are never sent to the paid core translation job.
"""
from __future__ import annotations

from collections import OrderedDict
from pathlib import Path

import i18n_ai_pipeline as pipeline
from sitecore.i18n_policy import is_static_core_page, load_core_policy
from sitecore.locales import SUPPORTED_LANGUAGES, page_key


ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_HTML = {"admin.html", "refresh-site.html"}


def core_source_catalog(root: Path = ROOT) -> list[dict[str, object]]:
    policy = load_core_policy(root)
    contexts: OrderedDict[str, list[str]] = OrderedDict()

    def add(value: str, context: str) -> None:
        text = pipeline.normalize(value)
        if not pipeline.is_source(text):
            return
        files = contexts.setdefault(text, [])
        if context not in files and len(files) < 4:
            files.append(context)

    for path in sorted(root.rglob("*.html")):
        rel = path.relative_to(root)
        if (not rel.parts or rel.parts[0] in SUPPORTED_LANGUAGES
                or any(part in pipeline.EXCLUDED_PARTS for part in rel.parts)):
            continue
        if path.name in EXCLUDED_HTML:
            continue
        key = page_key(path, root)
        if not is_static_core_page(key, policy):
            continue

        document = path.read_text(encoding="utf-8", errors="ignore")
        parser = pipeline.HtmlSourceParser()
        parser.feed(document)
        parser.close()
        context = rel.as_posix()
        for item in parser.items:
            add(item, context)

        for match in pipeline.INLINE_SCRIPT_RE.finditer(document):
            if pipeline.SRC_ATTRIBUTE_RE.search(match.group("attrs")):
                continue
            for item in pipeline.extract_js_strings(match.group("body")):
                add(item, context + "#inline-script")

    return [
        {"source": source, "contexts": files}
        for source, files in contexts.items()
    ]


def main() -> int:
    pipeline.source_catalog = core_source_catalog
    return pipeline.main()


if __name__ == "__main__":
    raise SystemExit(main())
