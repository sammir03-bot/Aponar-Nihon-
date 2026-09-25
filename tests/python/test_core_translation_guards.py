import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'tools'))
import check_authored_static_locales as guard
from i18n_core_pipeline import core_source_catalog


class CoreTranslationGuards(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.policy = {
            'defaultLanguage': 'bn', 'sourceLanguage': 'bn',
            'coreMode': 'direct-static-html', 'supportedLanguages': ['bn', 'en'],
            'exactPages': ['n5', 'n4'], 'pagePrefixes': ['n5-'],
            'requiredCorePages': ['n5'], 'completeLocalizedPages': {'en': ['n5']},
        }

    def put(self, name, value):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(value, encoding='utf-8')

    def test_catalog_excludes_generated_and_non_core_content(self):
        self.put('assets/i18n/core-localization-manifest.json', json.dumps(self.policy))
        self.put('n5.html', '<p>পাঠ শুরু করুন</p>')
        for directory in ['_site', 'node_modules', 'archive', 'tests', 'en']:
            self.put(f'{directory}/n5.html', '<p>বাদ দিন</p>')
        self.put('contact.html', '<p>যোগাযোগ করুন</p>')
        self.assertEqual([r['source'] for r in core_source_catalog(self.root)], ['পাঠ শুরু করুন'])

    def prepare_memory_site(self, n4_text):
        self.put('_site/assets/i18n/core-localization-manifest.json', json.dumps(self.policy))
        self.put('translations/en.json', json.dumps({
            'sourceLanguage': 'bn', 'targetLanguage': 'en', 'reviewed': True,
            'entries': [{'source': 'পাঠ', 'target': 'Lesson'}],
        }))
        for page, text in [('n5', 'Lesson'), ('n4', n4_text)]:
            self.put(f'_site/{page}.html', '<html><p>পাঠ</p></html>')
            self.put(f'_site/en/{page}/index.html',
                     f'<html lang="en" data-language-preset="en"><p>{text}</p></html>')

    def test_memory_routes_outside_declared_complete_pages_are_checked(self):
        self.prepare_memory_site('অসম্পূর্ণ অনুবাদ')
        with patch.object(guard, 'ROOT', self.root), patch.object(guard, 'SITE', self.root / '_site'):
            with self.assertRaisesRegex(SystemExit, 'en/n4/index.html'):
                guard.main()

    def test_fully_localized_memory_routes_pass_without_page_packs(self):
        self.prepare_memory_site('Next lesson')
        with patch.object(guard, 'ROOT', self.root), patch.object(guard, 'SITE', self.root / '_site'):
            self.assertEqual(guard.main(), 0)


if __name__ == '__main__':
    unittest.main()
