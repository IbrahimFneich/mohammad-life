# Builds narr-verses.json from the page's ﴿…﴾ blocks + quran.com word lists; prints word spans for cutting.
import json, re
src = json.load(open('narr-src.json'))
KEYS = {6: ['96:1'], 23: ['105:1'], 25: ['105:2'], 26: ['105:3', '105:4'], 27: ['105:5'], 38: ['93:6'], 56: ['96:1', '96:2', '96:3', '96:4', '96:5'],
        63: ['26:214'], 79: ['17:1'], 82: ['53:14', '53:15', '53:16', '53:17'], 83: ['53:9'], 97: ['2:207'], 99: ['8:30'], 100: ['9:40'], 126: ['8:9'],
        130: ['8:17'], 131: ['3:123'], 140: ['3:153'], 148: ['3:144'], 163: ['33:10'], 170: ['33:9'], 171: ['33:25'], 182: ['48:27'], 183: ['48:1'],
        200: ['48:18', '48:19'], 206: ['17:81'], 207: ['17:81'], 218: ['3:61'], 226: ['33:33'], 230: ['5:67'], 234: ['5:3'], 247: ['68:4']}
st = lambda t: re.sub(r'[ئً-ٰۖ-ۭـاٱأإآىيء\s]', '', t.replace('ؤ', 'و')).replace('ة', 'ه')
def words(k):
    try: v = json.load(open(f"w-{k.replace(':', '-')}.json"))['verse']
    except FileNotFoundError: return None
    return [w['text_imlaei_simple'] for w in v['words'] if w['char_type_name'] == 'word']
out, spans = [], []
for i, keys in KEYS.items():
    frags = re.findall('﴿([^﴾]*)﴾', src[i][1]); assert frags, i
    frag = frags[-1] if i == 207 else frags[0]
    fw = [w for w in frag.split() if st(w)]
    aw = [(k, j + 1, st(w)) for k in keys for j, w in enumerate(words(k) or [])]
    nf, na = len(fw), len(aw) or None
    pos, span = [], None
    if aw:
        fs = [st(w) for w in fw]
        for s in range(len(aw) - nf + 1):
            if [a[2] for a in aw[s:s + nf]] == fs: span = (aw[s][:2], aw[s + nf - 1][:2]); pos = [aw[s][1] - 1]; break
        assert span, (i, keys, fs, [a[2] for a in aw])
    out.append({'keys': keys, 'frag': frag, 'nf': nf, 'na': na if aw else nf, 'pos': pos})
    spans.append((i, keys, nf, na, span))
json.dump(out, open('narr-verses.json', 'w'), ensure_ascii=False, indent=0)
for s in spans: print(*s)
