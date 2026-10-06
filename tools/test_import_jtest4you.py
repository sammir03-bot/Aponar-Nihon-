"""Regression checks for the licensed source importer (no network calls).

Run: PYTHONPATH=tools python3 -m unittest discover -s tools -p 'test_import_jtest4you.py'
Requires beautifulsoup4, as does the importer.
"""
import unittest
from unittest.mock import patch
import import_jtest4you as importer


def exercise(category, body, keys, level='n4'):
    answer_key=' '.join(f'Question {number}: {answer}' for number, answer in keys.items())
    return f'<title>JLPT {level.upper()} – {category.title()} Exercise 99</title><div class="entry">{body}<h3>Answer Key</h3><p>{answer_key}</p></div>'


def question(number, prompt, options, radio=None, leading_break=False):
    choices='<br/>'.join(f'<input type="radio" name="quest{radio or number}" value="{i+1}"/>'+('<br/>' if leading_break else '')+option for i,option in enumerate(options))
    return f'<p>{number}. {prompt}<br/>{choices}</p>'


class ImportRegressionTests(unittest.TestCase):
    def parse(self, category, body, keys, level='n4'):
        html=exercise(category,body,keys,level)
        with patch.object(importer,'fetch',return_value=html):
            return importer.parse_with_report(importer.ORIGIN+'/fixture/',level,category)

    def test_answer_diagram_keeps_shared_reading_text(self):
        body='<p>Reading passage 1</p><p>すずきさんは時計を別々の場所に置きます。</p>'
        body+=question(1,'何を置きますか。',['時計','本','花','服'])
        body+='<figure><img src="/image/answer-diagram.gif"/></figure>'
        body+=question(2,'どこに置きますか。',['1','2','3','4'])
        rows,_=self.parse('reading',body,{1:1,2:4})
        self.assertIn('時計を別々の場所',rows[1]['passage'])
        self.assertIn('answer-diagram.gif',rows[1]['passage'])
        self.assertNotIn('answer-diagram.gif',rows[0]['passage'])

    def test_numbered_new_passage_resets_previous_context(self):
        body='<p>Reading passage 1</p><p>前の文章です。</p>'+question(1,'どれですか。',['1','2','3','4'])
        body+='<p>Reading passage 2</p><figure><img src="/image/new-passage.gif"/></figure>'+question(2,'どれですか。',['1','2','3','4'])
        rows,_=self.parse('reading',body,{1:1,2:2})
        self.assertNotIn('前の文章',rows[1]['passage'])
        self.assertIn('new-passage.gif',rows[1]['passage'])

    def test_one_ambiguous_item_does_not_discard_valid_neighbors(self):
        body=question(1,'あ',['あ','あ','い','う'])+question(2,'い',['あ','い','う','え'])
        rows,rejections=self.parse('grammar',body,{1:1,2:2})
        self.assertEqual([q['sourceQuestion'] for q in rows],[2])
        self.assertEqual(rejections[0]['sourceQuestion'],1)

    def test_leading_linebreak_and_katakana_spelling(self):
        rows,_=self.parse('kanji',question(1,'れぽーと',['レポート','レポト','レポウト','レポイト'],leading_break=True),{1:1},'n5')
        self.assertEqual(rows[0]['options'][0],'レポート')
        self.assertEqual(rows[0]['kind'],'表記')

    def test_visible_numbers_resolve_misnumbered_source_radios(self):
        body=question(8,'ことば',['あ','い','う','え'],radio=9)+question(9,'ことば',['お','か','き','く'],radio=10)
        rows,_=self.parse('grammar',body,{8:2,9:3},'n3')
        self.assertEqual([(q['sourceQuestion'],q['answer']) for q in rows],[(8,1),(9,2)])

    def test_source_text_only_options_and_cloze_classification(self):
        body='<p>Reading passage 1</p><p>田中さんは（ア）行きました。</p><p>「1」（ア）には、何を入れますか。</p><p>学校へ<br/>学校が<br/>学校を<br/>学校の</p>'
        rows,_=self.parse('reading',body,{1:1},'n5')
        self.assertEqual(rows[0]['options'],['学校へ','学校が','学校を','学校の'])
        self.assertEqual(rows[0]['category'],'grammar')
        self.assertEqual(rows[0]['sourceCategory'],'reading')
        self.assertEqual(rows[0]['kind'],'文章文法')

    def test_sanitizer_removes_controls_and_untrusted_markup(self):
        cleaned=importer.clean('<p onclick="alert(1)">本\u008f</p><script>alert(1)</script><img src="https://example.com/x"/>')
        self.assertEqual(cleaned,'<p>本</p>')


if __name__=='__main__':unittest.main()
