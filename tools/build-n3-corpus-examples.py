#!/usr/bin/env python3
"""Build source-backed N3 vocabulary examples from Tatoeba's Japanese export.

The generated browser asset intentionally contains only sentences with a safe,
exact match for the displayed headword. Words without a trustworthy corpus match
fall back to the page's labelled practice sentences instead of receiving a guessed
quotation. Tatoeba sentences are linked individually for attribution.
"""

from __future__ import annotations

import argparse
import bz2
import json
import re
from collections import defaultdict
from dataclasses import dataclass
from datetime import date
from html.parser import HTMLParser
from pathlib import Path


NEGATIVE_TAG_WORDS = (
    "ambiguous",
    "archaic",
    "incorrect",
    "machine translation",
    "needs native check",
    "nonstandard",
    "not a sentence",
    "poor",
    "unnatural",
)
PARTICLES = set("はがをにへとでのもやかねよぞさなてばし")
END_PUNCTUATION = set("。！？!?…」』）)\"'")
SENSITIVE_TERMS = (
    "ブラジャー",
    "ブス",
    "ノーパン",
    "証拠隠滅",
    "息を引き取",
    "亡くな",
    "戦争",
    "戦場",
    "爆発",
    "脅して",
    "肥えた人",
    "馬鹿",
    "セックス",
    "レイプ",
    "自殺",
    "殺す",
    "殺した",
    "殺され",
    "死ね",
    "死ぬ",
    "死んだ",
    "麻薬",
    "拳銃",
    "爆弾",
)
SENSE_REQUIREMENTS: dict[str, re.Pattern[str]] = {
    "コード": re.compile(r"電気|コンセント|プラグ|ケーブル|配線|延長|束ね|絡ま|差し込"),
    "ラップ": re.compile(r"食品|料理|冷蔵|包|皿|電子レンジ|容器|保存"),
    "ライト": re.compile(r"車|点灯|点け|つけ|消し|照ら|明る|ヘッドライト|前照灯"),
    "キー": re.compile(r"車|鍵|ドア|エンジン|差し|回す|なくし|見つか"),
    "指定席": re.compile(r"電車|列車|新幹線|座席|予約|自由席|切符|車両"),
    "国語": re.compile(r"授業|教科|学校|先生|成績|勉強|作文|漢字|日本語|国語辞典"),
    "引く": re.compile(r"計算|引き算|差を引|数字|足す|算数|[0-9０-９一二三四五六七八九十百]+から.+を引く"),
    "かける": re.compile(r"掛け算|計算|数字|倍|[×x]|[0-9０-９一二三四五六七八九十百]+(?:に|を).+かける"),
    "割る": re.compile(r"計算|割り算|数字|算数|商|余り|で割"),
    "落ちる": re.compile(r"試験|受験|大学|高校|面接|選考|不合格|単位"),
    "おごり": re.compile(r"私のおごり|僕のおごり|おごりで|おごりだ|おごりです|今日はおごり"),
    "どうか": re.compile(r"どうか(?:、|お願い|許|ください|ますよう|助け|聞いて|見逃)"),
    "パンツ": re.compile(r"ズボン|長パンツ|短パンツ|スーツ|ジーンズ|サイズ"),
    "外側": re.compile(r"箱|壁|建物|窓|ドア|線|円|容器|内側|外側(?:に|を|は|が)"),
    "吐く": re.compile(r"吐き気|食べ|飲み|胃|気分|嘔吐|戻し|もどし|船酔|車酔|血を吐"),
    "外す": re.compile(r"眼鏡|メガネ|マスク|ボタン|指輪|ネクタイ|ベルト|時計|鍵|蓋|ふた|イヤホン|ヘッドホン|シートベルト|を外す"),
}
# Known malformed or contextually misleading rows in the public corpus export.
# Keeping these IDs explicit makes the build deterministic and reviewable.
BLOCKED_SENTENCE_IDS = {
    179972,   # 勤務時間: broken subject marking
    236522,   # 子育て: distressed/needlessly negative context
    1165433,  # 電子レンジ: intentionally poetic fragment, poor teaching example
    1544465,  # 道路が混んでいる: malformed locative sentence
    4562163,  # のんきな: unnatural predicate choice
    8928516,  # 蛇口: typo (流れいてる)
    11518338, # 中古: redundant/unnatural phrasing
}


@dataclass(frozen=True)
class Word:
    word: str
    reading: str

    @property
    def key(self) -> str:
        return f"{self.word}\u241f{self.reading}"


class VocabularyParser(HTMLParser):
    """Extract word/readings from the generated vocabulary document."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.words: list[Word] = []
        self.row_depth = 0
        self.role_stack: list[str | None] = []
        self.in_rt = 0
        self.word_text: list[str] = []
        self.reading_text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = dict(attrs)
        classes = set((attr.get("class") or "").split())
        if tag == "div" and "data-vocab-row" in attr:
            self.row_depth = 1
            self.word_text = []
            self.reading_text = []
        elif self.row_depth and tag == "div":
            self.row_depth += 1

        role = None
        if self.row_depth and "word-jp" in classes:
            role = "word"
        self.role_stack.append(role)
        if self.row_depth and tag == "rt":
            self.in_rt += 1

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        if self.row_depth and tag == "rt":
            self.in_rt = max(0, self.in_rt - 1)
        if self.role_stack:
            self.role_stack.pop()
        if self.row_depth and tag == "div":
            self.row_depth -= 1
            if self.row_depth == 0:
                raw_word = "".join(self.word_text).strip()
                raw_reading = "".join(self.reading_text).strip() or raw_word
                word, reading = normalise_target(raw_word, raw_reading)
                if word:
                    self.words.append(Word(word, reading))

    def handle_data(self, data: str) -> None:
        if not self.row_depth or "word" not in self.role_stack:
            return
        if self.in_rt:
            self.reading_text.append(data)
        else:
            self.word_text.append(data)


def normalise_target(word: str, reading: str) -> tuple[str, str]:
    def clean(value: str) -> str:
        value = re.sub(r"（([^）]+)）", r"\1", value)
        value = re.sub(r"\(([^)]+)\)", r"\1", value)
        return re.split(r"[／/]", value, maxsplit=1)[0].strip()

    word, reading = clean(word), clean(reading)
    if word.startswith("～"):
        word = "３" + word[1:]
        reading = "さん" + reading.removeprefix("～")
    return word, reading


def is_kanji(char: str) -> bool:
    return bool(char) and ("\u3400" <= char <= "\u9fff" or char in "々〆ヶ")


def is_hiragana(char: str) -> bool:
    return bool(char) and "\u3040" <= char <= "\u309f"


def is_katakana(char: str) -> bool:
    return bool(char) and ("\u30a0" <= char <= "\u30ff" or char == "ー")


def safe_occurrence(sentence: str, term: str, start: int) -> bool:
    """Reject matches embedded inside a larger Japanese lexical item."""
    before = sentence[start - 1] if start else ""
    end = start + len(term)
    after = sentence[end] if end < len(sentence) else ""
    first, last = term[0], term[-1]

    if is_kanji(first) and is_kanji(before):
        return False
    if is_kanji(last) and is_kanji(after):
        return False
    if is_katakana(first) and is_katakana(before):
        return False
    if is_katakana(last) and is_katakana(after):
        return False
    if all(is_katakana(char) for char in term) and sentence[end:].startswith(("さん", "氏", "先生", "君", "ちゃん")):
        return False

    if all(is_hiragana(char) for char in term) and len(term) < 3:
        return False
    if is_hiragana(first) and (is_hiragana(before) or is_katakana(before) or is_kanji(before)):
        return False
    if is_hiragana(last) and is_hiragana(after) and after not in PARTICLES:
        return False
    return True


def sense_matches(word: Word, sentence: str) -> bool:
    requirement = SENSE_REQUIREMENTS.get(word.word)
    return not requirement or bool(requirement.search(sentence))


def find_safe_match(sentence: str, term: str) -> int | None:
    start = sentence.find(term)
    while start >= 0:
        if safe_occurrence(sentence, term, start):
            return start
        start = sentence.find(term, start + 1)
    return None


def sentence_score(sentence: str, tagged_ok: bool, username: str) -> float:
    length = len(sentence)
    score = 40 - abs(24 - min(length, 48))
    if 9 <= length <= 38:
        score += 10
    if sentence and sentence[-1] in END_PUNCTUATION:
        score += 4
    if tagged_ok:
        score += 12
    if username and username != r"\N":
        score += 2
    if "「" in sentence or "」" in sentence:
        score += 1
    return score


def acceptable_sentence(sentence: str) -> bool:
    if not (5 <= len(sentence) <= 58):
        return False
    if re.search(r"https?://|www\.|\S+@\S+", sentence, re.I):
        return False
    if re.search(r"[A-Za-z]{9,}", sentence):
        return False
    if any(term in sentence for term in SENSITIVE_TERMS):
        return False
    if sentence.count("（") != sentence.count("）"):
        return False
    return True


def read_tags(path: Path) -> tuple[set[int], set[int]]:
    ok: set[int] = set()
    rejected: set[int] = set()
    with bz2.open(path, "rt", encoding="utf-8") as handle:
        for line in handle:
            raw_id, tag = line.rstrip("\n").split("\t", 1)
            sentence_id = int(raw_id)
            folded = tag.casefold()
            if tag == "OK":
                ok.add(sentence_id)
            if any(word in folded for word in NEGATIVE_TAG_WORDS):
                rejected.add(sentence_id)
    return ok, rejected


def reading_from_transcription(value: str) -> str:
    def replace(match: re.Match[str]) -> str:
        return "".join(match.group(1).split("|")[1:])

    value = re.sub(r"\[([^\]]+)\]", replace, value)
    value = re.sub(r"[{}~=]", "", value)
    return value.strip()


def read_transcriptions(path: Path, wanted_ids: set[int] | None = None) -> dict[int, str]:
    readings: dict[int, str] = {}
    with bz2.open(path, "rt", encoding="utf-8") as handle:
        for line in handle:
            fields = line.rstrip("\n").split("\t", 4)
            if len(fields) != 5:
                continue
            sentence_id = int(fields[0])
            if wanted_ids is None or sentence_id in wanted_ids:
                reading = reading_from_transcription(fields[4])
                if reading:
                    readings[sentence_id] = reading
    return readings


def kana_fold(value: str) -> str:
    folded: list[str] = []
    for char in value:
        code = ord(char)
        if 0x30A1 <= code <= 0x30F6:
            folded.append(chr(code - 0x60))
        elif is_hiragana(char) or char == "ー":
            folded.append(char)
    return "".join(folded)


def build_examples(
    words: list[Word],
    sentences_path: Path,
    tags_path: Path,
    transcriptions: dict[int, str] | None = None,
) -> tuple[dict[str, dict[str, object]], set[int]]:
    transcriptions = transcriptions or {}
    unique_words = list(dict.fromkeys(words))
    terms: dict[str, list[Word]] = defaultdict(list)
    for word in unique_words:
        term = word.word
        if (
            len(term) < 2
            or term.startswith("３")
            or any(mark in term for mark in "「」『』\n")
            or (all(is_hiragana(char) for char in term) and len(term) < 3)
        ):
            continue
        terms[term[0]].append(word)

    ok_ids, rejected_ids = read_tags(tags_path)
    candidates: dict[Word, list[tuple[float, int, str, str, str]]] = defaultdict(list)
    with bz2.open(sentences_path, "rt", encoding="utf-8") as handle:
        for line in handle:
            fields = line.rstrip("\n").split("\t")
            if len(fields) < 4:
                continue
            sentence_id = int(fields[0])
            sentence = fields[2].strip()
            username = fields[3].strip()
            if sentence_id in rejected_ids or sentence_id in BLOCKED_SENTENCE_IDS or not acceptable_sentence(sentence):
                continue

            present_initials = set(sentence)
            for initial in present_initials.intersection(terms):
                for word in terms[initial]:
                    start = find_safe_match(sentence, word.word)
                    if start is None:
                        continue
                    if not sense_matches(word, sentence):
                        continue
                    full_reading = transcriptions.get(sentence_id)
                    if full_reading and any(is_kanji(char) for char in word.word):
                        expected = kana_fold(word.reading)
                        if expected and expected not in kana_fold(full_reading):
                            continue
                    score = sentence_score(sentence, sentence_id in ok_ids, username)
                    score += min(len(word.word), 12) * 1.3
                    # Short targets are safer when visually separated.
                    before = sentence[start - 1] if start else ""
                    after_at = start + len(word.word)
                    after = sentence[after_at] if after_at < len(sentence) else ""
                    if not before or before in "「『（、。！？ ":
                        score += 2
                    if not after or after in END_PUNCTUATION or after in PARTICLES:
                        score += 2
                    candidates[word].append((score, sentence_id, sentence, username, word.word))

    # Prefer a different corpus sentence for every unique headword.
    chosen: dict[str, dict[str, object]] = {}
    used_ids: set[int] = set()
    ranked_words = sorted(
        candidates,
        key=lambda item: (len(candidates[item]), -len(item.word)),
    )
    for word in ranked_words:
        ranked = sorted(candidates[word], key=lambda item: (-item[0], item[1]))
        selected = next((item for item in ranked if item[1] not in used_ids), ranked[0])
        _, sentence_id, sentence, username, match = selected
        used_ids.add(sentence_id)
        chosen[word.key] = {
            "id": sentence_id,
            "text": sentence,
            "author": username if username and username != r"\N" else "Tatoeba contributor",
            "match": match,
        }
    return chosen, used_ids


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--vocabulary", required=True, type=Path)
    parser.add_argument("--sentences", required=True, type=Path)
    parser.add_argument("--tags", required=True, type=Path)
    parser.add_argument("--transcriptions", type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    extractor = VocabularyParser()
    extractor.feed(args.vocabulary.read_text(encoding="utf-8"))
    readings = read_transcriptions(args.transcriptions) if args.transcriptions else {}
    examples, used_ids = build_examples(extractor.words, args.sentences, args.tags, readings)
    if readings:
        for example in examples.values():
            reading = readings.get(int(example["id"]))
            if reading:
                example["reading"] = reading

    payload = json.dumps(examples, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    header = (
        "/* Source-backed N3 vocabulary examples generated from Tatoeba's Japanese export.\n"
        "   Sentence pages credit the named contributor; reuse follows each sentence's licence.\n"
        "   Dataset: https://tatoeba.org/en/downloads */\n"
        f"window.N3_VOCAB_CORPUS_META=Object.freeze({{count:{len(examples)},generated:'{date.today().isoformat()}'}});\n"
        f"window.N3_VOCAB_CORPUS_EXAMPLES=Object.freeze({payload});\n"
    )
    args.output.write_text(header, encoding="utf-8")
    print(
        f"Parsed {len(extractor.words)} rows; wrote {len(examples)} source-backed examples "
        f"({len(examples) / len(extractor.words):.1%} coverage)."
    )


if __name__ == "__main__":
    main()
