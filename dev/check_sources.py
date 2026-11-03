# dev/check_sources.py dev/sources_quotes.txt (run from a scratch dir: caches pages there) — each quote segment must be a substring of its lib.eshia.ir page(s) after normalising script, harakat and honorifics.
import re, html, subprocess, pathlib, sys
H = re.compile('[ً-ٰٟـ‌‍‏‎]')
def norm(s, src=False):
    s = html.unescape(s)
    s = s.replace('ی','ي').replace('ک','ك').replace('ى','ي').replace('ة','ه').replace('ۀ','ه')
    s = H.sub('', s)
    s = re.sub('[أإآٱ]','ا', s).replace('ؤ','و').replace('ئ','ي').replace('ء','')
    if src: s = re.sub(r'(?<![\u0621-\u064A])[صع](?![\u0621-\u064A])', ' ', s)
    s = re.sub(r'\[\d+\]', ' ', s)
    s = re.sub(r'[^\u0621-\u064A]', '', s)
    for h in ['صلى الله عليه وآله وسلم','صلى الله عليه وآله','صلى الله عليه وسلم','عليه وآله السلام','صلوات الله عليهم','عليهما السلام','عليها السلام','عليه السلام','رضي الله عنها']:
        s = s.replace(re.sub(r'[^\u0621-\u064A]','',norm_plain(h)), '')
    return s
def norm_plain(h):
    h = h.replace('ة','ه').replace('ى','ي'); h = H.sub('', h); h = re.sub('[أإآٱ]','ا', h); return h
def page(u):
    f = pathlib.Path(u.replace('/','_') + '.html')
    if not f.exists():
        for args in ([], ['--resolve','lib.eshia.ir:443:185.37.55.187']):
            subprocess.run(['curl','-s','-m','30',*args,'-o',str(f),'https://lib.eshia.ir/'+u])
            if f.exists() and f.stat().st_size > 3000: break
    s = f.read_text(encoding='utf-8', errors='ignore') if f.exists() else ''
    s = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', s, flags=re.S)
    return norm(re.sub(r'<[^>]+>', ' ', s), src=True)
Q = [l.split(' || ') for l in pathlib.Path(sys.argv[1]).read_text().strip().split('\n') if l.strip()]
bad = 0
for urls, q in Q:
    txt = ''.join(page(u.strip()) for u in urls.split(','))
    for seg in [x for x in q.split('…') if x.strip()]:
        n = norm(seg)
        ok = n in txt
        if not ok: bad += 1
        print('OK ' if ok else 'MISS', urls, '|', seg.strip()[:70])
        if not ok:
            k = max(i for i in range(len(n)+1) if n[:i] in txt); j = txt.find(n[:k])
            print('     matched', k, '/', len(n), ' page:', n[k:k+30], ' src:', txt[j+k:j+k+30])
print('misses:', bad)
