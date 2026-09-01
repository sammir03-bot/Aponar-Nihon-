from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

import i18n_ai_pipeline as pipeline  # noqa: E402


class TranslationProtectionTests(unittest.TestCase):
    def test_protected_content_round_trips_exactly(self) -> None:
        source = "N3 ～ようにする মানে প্রতিদিন 10 বার। Aponar Nihon https://example.com/x"
        masked, replacements = pipeline.protect_for_translation(source)

        for token in ("N3", "～ようにする", "10", "Aponar Nihon", "https://example.com/x"):
            self.assertNotIn(token, masked)

        translated = masked.replace("মানে", "means").replace("প্রতিদিন", "every day").replace("বার", "times")
        restored = pipeline.restore_after_translation(translated, replacements)
        self.assertIn("N3", restored)
        self.assertIn("～ようにする", restored)
        self.assertIn("10", restored)
        self.assertIn("Aponar Nihon", restored)
        self.assertIn("https://example.com/x", restored)
        self.assertIsNone(pipeline.pair_error(source, restored))

    def test_missing_marker_is_rejected(self) -> None:
        _masked, replacements = pipeline.protect_for_translation("N3 বাংলা")
        with self.assertRaisesRegex(ValueError, "changed protected marker"):
            pipeline.restore_after_translation("English", replacements)


class BatchParsingTests(unittest.TestCase):
    def test_batch_results_are_restored_to_input_order(self) -> None:
        payload = {
            "responses": [
                {"external_reference": "1", "success": True, "result": {"translated_text": "two"}},
                {"external_reference": "0", "success": True, "result": {"translated_text": "one"}},
            ]
        }
        results = pipeline.ordered_batch_results(payload, 2)
        self.assertEqual([pipeline.translated_text(result) for result in results], ["one", "two"])

    def test_review_accepts_json_object_or_json_text(self) -> None:
        direct = {"response": {"translations": ["one", "two"]}}
        encoded = {"response": '{"translations":["one","two"]}'}
        self.assertEqual(pipeline.reviewed_array(direct, 2), ["one", "two"])
        self.assertEqual(pipeline.reviewed_array(encoded, 2), ["one", "two"])

    def test_failed_batch_item_is_rejected(self) -> None:
        payload = {"responses": [{"id": 0, "success": False, "error": "model failed"}]}
        with self.assertRaisesRegex(pipeline.WorkerRequestError, "model failed"):
            pipeline.ordered_batch_results(payload, 1)


class CheckpointTests(unittest.TestCase):
    def test_partial_checkpoint_never_becomes_publishable(self) -> None:
        catalog = [
            {"source": "পৃষ্ঠা পাওয়া যায়নি", "contexts": ["404.html"]},
            {"source": "আবার চেষ্টা করুন", "contexts": ["404.html"]},
        ]
        translations = {
            "পৃষ্ঠা পাওয়া যায়নি": "Page not found",
            "আবার চেষ্টা করুন": "Please try again",
        }
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "en.json"
            pipeline.write_memory(
                path,
                "en",
                catalog,
                translations,
                {pipeline.TRANSLATION_MODEL},
                {"পৃষ্ঠা পাওয়া যায়নি"},
            )
            payload = json.loads(path.read_text(encoding="utf-8"))
            self.assertFalse(payload["reviewed"])
            self.assertEqual(payload["reviewedCount"], 1)

            loaded, reviewed, models = pipeline.load_checkpoint(path, "en")
            self.assertEqual(loaded, translations)
            self.assertEqual(reviewed, {"পৃষ্ঠা পাওয়া যায়নি"})
            self.assertEqual(models, {pipeline.TRANSLATION_MODEL})

            pipeline.write_memory(
                path,
                "en",
                catalog,
                translations,
                {pipeline.TRANSLATION_MODEL, pipeline.REVIEW_MODEL},
                set(translations),
            )
            self.assertEqual(pipeline.validate_memory(path, "en", catalog), [])


if __name__ == "__main__":
    unittest.main()
