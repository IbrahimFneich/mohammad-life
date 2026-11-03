# dev/fill_todo.py KEY FILE.html — replace the element carrying data-todo="KEY" in index.src.html (and scenes/*.html)
# with the HTML in FILE (one or more elements). The element is matched from its opening tag to its closing tag.
import pathlib, re, sys
key, frag = sys.argv[1], pathlib.Path(sys.argv[2]).read_text().strip()
root = pathlib.Path(__file__).resolve().parent.parent
hit = 0
for p in [root / 'index.src.html', *sorted((root / 'scenes').glob('*.html'))]:
    s = p.read_text()
    m = re.search(r'<(\w+)([^>]*)\bdata-todo="' + re.escape(key) + r'"[^>]*>', s)
    if not m: continue
    tag, depth, i = m.group(1), 0, m.start()
    for t in re.finditer(r'<' + tag + r'\b|</' + tag + r'>', s[i:]):
        depth += -1 if t.group().startswith('</') else 1
        if depth == 0: j = i + t.end(); break
    p.write_text(s[:i] + frag + s[j:]); hit += 1; print('filled', key, 'in', p.name)
if not hit: sys.exit(f'no data-todo="{key}"')
