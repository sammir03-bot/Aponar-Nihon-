from pathlib import Path

html = Path('n3-matome-grammar.html')
s = html.read_text()
s = s.replace('/assets/css/n3-matome.css?v=20260909.1','/assets/css/n3-matome.css?v=20260910.6')
s = s.replace('/assets/js/n3-matome-readings.js?v=20260910.3','/assets/js/n3-matome-readings.js?v=20260910.6')
s = s.replace('/assets/js/n3-matome-app.js?v=20260910.2','/assets/js/n3-matome-app.js?v=20260910.6')
html.write_text(s)

css = Path('assets/css/n3-matome.css')
c = css.read_text()
marker = '/* 2026-09-10 N3 example readability fix */'
if marker not in c:
    c += '''\n\n/* 2026-09-10 N3 example readability fix */
.examples-section .real-example,
.examples-section .real-example:first-child{border-color:var(--line);background:var(--surface);box-shadow:0 5px 16px rgba(48,31,92,.045)}
.examples-section .example-label,
.examples-section .real-example:first-child .example-label{color:#5a3aa3;background:#eee8ff}
.examples-section .example-jp{font-size:clamp(20px,4.3vw,24px);font-weight:650;line-height:2.9;padding-top:10px}
.examples-section .example-jp ruby{ruby-position:over;ruby-align:center}
.examples-section .example-jp rt{visibility:visible!important;font-size:.62em;font-weight:700;line-height:1.1;color:#8c7cc4;letter-spacing:.01em}
body[data-theme="dark"] .examples-section .real-example,
body[data-theme="dark"] .examples-section .real-example:first-child{border-color:#3d3654;background:#171523}
body[data-theme="dark"] .examples-section .example-label,
body[data-theme="dark"] .examples-section .real-example:first-child .example-label{color:#e1d5ff;background:#342750}
body[data-theme="dark"] .examples-section .example-jp rt{color:#cbbcff}
@media(max-width:600px){.example-list{grid-template-columns:1fr;gap:10px}.examples-section .real-example{padding:14px 15px}.examples-section .example-jp{font-size:21px;line-height:3.05}.examples-section .example-bn{font-size:.94rem;line-height:1.75}}
'''
css.write_text(c)
