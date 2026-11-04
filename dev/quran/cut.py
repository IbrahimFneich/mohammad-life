# Cuts partial-ayah clips from quran.com (qdc) chapter recitations by word timings, snapping each cut into the nearest pause.
# cut.py OUT [CLIP ...] — with clip names, cuts only those (the others keep their files).
import json, subprocess, sys, numpy as np, pathlib
OUT = pathlib.Path(sys.argv[1]); SR = 44100; FR = 0.01
REC = {'basit': (2, 'b'), 'minshawi': (9, 'm')}
SPANS = {  # clip: ((sura, ayah, first word), (sura, ayah, last word))
    '17-1a': ((17, 1, 1), (17, 1, 17)), '9-40a': ((9, 40, 1), (9, 40, 15)), '8-17a': ((8, 17, 6), (8, 17, 12)),
    '3-123a': ((3, 123, 1), (3, 123, 6)), '3-153a': ((3, 153, 1), (3, 153, 10)), '3-144a': ((3, 144, 1), (3, 144, 9)),
    '33-10a': ((33, 10, 1), (33, 10, 13)), '33-9a': ((33, 9, 1), (33, 9, 16)), '33-25a': ((33, 25, 9), (33, 25, 12)),
    '48-27a': ((48, 27, 7), (48, 27, 13)), '48-18_19a': ((48, 18, 17), (48, 19, 3)), '19-25_26a': ((19, 25, 1), (19, 26, 4)),
    '2-144a': ((2, 144, 1), (2, 144, 14)), '2-143a': ((2, 143, 13), (2, 143, 40)), '7-142a': ((7, 142, 12), (7, 142, 23)),
    '9-3a': ((9, 3, 1), (9, 3, 15))}
STALE = {('basit', 2), ('basit', 7), ('minshawi', 7)}  # chapter file re-uploaded (2024-12), its qdc timings no longer fit: per-ayah file ea/qc-* + word segments qdc/seg-* (dl_ea.sh); sura 7 the same way, to spare a whole-chapter download for one fragment
QC = {('basit', 9, 3), ('minshawi', 9, 3)}  # baraa: 9:3 from quran.com's per-ayah files + word segments (dl_ea.sh), keyed per ayah so 9-40a still cuts from the chapter file
qc = lambda r, su, ay: (r, su) in STALE or (r, su, ay) in QC
SHIFT = {('2-143a', 'minshawi'): (2.05, 0)}  # s added to the span's start/end where qdc's segments run early (the waqf pause after 2:143 w12 sits inside w13)
def timings(r, su):
    d = json.load(open(f'qdc/qdc-{REC[r][0]}-{su}.json'))['audio_files'][0]
    return {v['verse_key']: v for v in d['verse_timings']}
def nwords(k): return sum(w['char_type_name'] == 'word' for w in json.load(open(f"w-{k.replace(':', '-')}.json"))['verse']['words'])
def segs(v): return [tuple(s[-3:]) for s in v['segments']]
def word_t(r, su, ay, w, edge):
    """start (edge=0) or end (edge=1) of word w in ms; (t, estimated?)"""
    if qc(r, su, ay): return {x[1]: x for x in json.load(open(f'qdc/seg-{REC[r][0]}-{su}-{ay}.json'))['verse']['audio']['segments']}[w][2 + edge], False
    k = f'{su}:{ay}'; v = timings(r, su)[k]; n = nwords(k)
    if edge == 0 and w == 1: return v['timestamp_from'], False
    if edge == 1 and w == n: return v['timestamp_to'], False
    hits = [x for x in segs(v) if x[0] == w]
    if hits and all(b - a < 6000 for _, a, b in hits) and all(b - a < 6000 for _, a, b in segs(v)):
        return (min(h[1] for h in hits) if edge == 0 else max(h[2] for h in hits)), False
    o = [x for x in REC if x != r][0]; vo = timings(o, su)[k]; to, _ = word_t(o, su, ay, w, edge)  # broken timings: the other reciter's proportion
    f = (to - vo['timestamp_from']) / (vo['timestamp_to'] - vo['timestamp_from'])
    return v['timestamp_from'] + f * (v['timestamp_to'] - v['timestamp_from']), True
def load(r, su, t0, t1, ay):
    a = ['ffmpeg', '-v', 'error', '-ss', f'{t0:.3f}', '-i', f'ea/qc-{r}-{su:03d}{ay:03d}.mp3' if qc(r, su, ay) else f'ch/{REC[r][1]}-{su}.mp3', '-t', f'{t1 - t0:.3f}', '-ac', '1', '-ar', str(SR), '-f', 's16le', '-']
    return np.frombuffer(subprocess.run(a, capture_output=True, check=True).stdout, np.int16).astype(np.float32) / 32768
def env(x):
    n = int(SR * FR); m = len(x) // n
    return 20 * np.log10(np.sqrt((x[:m * n].reshape(m, n) ** 2).mean(1)) + 1e-6)
def quiet_runs(e, thr, minlen):
    q = e < thr; runs, i = [], 0
    while i < len(q):
        if q[i]:
            j = i
            while j < len(q) and q[j]: j += 1
            if j - i >= minlen: runs.append((i, j))
            i = j
        else: i += 1
    return runs
report = []
for clip, ((su, ay, w0), (_, ay1, w1)) in SPANS.items():
    if sys.argv[2:] and clip not in sys.argv[2:]: continue
    for r in REC:
        ts, es = word_t(r, su, ay, w0, 0); te, ee = word_t(r, su, ay1, w1, 1); ts = ts / 1000 + SHIFT.get((clip, r), (0, 0))[0]; te = te / 1000 + SHIFT.get((clip, r), (0, 0))[1]
        base = max(0, ts - 3); x = load(r, su, base, te + 3, ay); e = env(x); peak = np.percentile(e[int((ts - base) / FR):int((te - base) / FR)], 95)
        thr = peak - 25; runs = quiet_runs(e, thr, 8)  # a pause = >=80 ms at least 25 dB under the voice
        fs, fe = (ts - base) / FR, (te - base) / FR
        W = (2.5 if (es or ee) else 0.8) / FR
        cand = [(a, b) for a, b in runs if fs - W <= b <= fs + W and a <= fs + 0.1 / FR]  # a pause straddling/preceding the first word
        s_snap = bool(cand)
        if cand: a, b = min(cand, key=lambda p: abs(p[1] - fs)); s = max(a, b - 0.05 / FR)
        else: lo = max(0, int(fs - 0.05 / FR)); s = lo + int(np.argmin(e[lo:int(fs + 0.05 / FR) + 1]))  # no pause: the quietest point within 50 ms of the word boundary
        cand = [(a, b) for a, b in runs if fe - W <= a <= fe + W and b >= fe - 0.1 / FR]  # a pause straddling/following the last word
        e_snap = bool(cand)
        if cand: a, b = min(cand, key=lambda p: abs(p[0] - fe)); en = a + min(0.3 / FR, (b - a) * 0.6)
        else: lo = int(fe - 0.05 / FR); en = lo + int(np.argmin(e[lo:int(fe + 0.05 / FR) + 1]))
        s, en = max(0, int(s)), min(len(e) - 1, int(en))
        on = s + int(np.argmax(e[s:en] > peak - 30)); s = max(s, on - int(0.4 / FR))  # at most 0.4 s of silence before the voice
        y = x[int(s * FR * SR):int(en * FR * SR)].copy()
        fi, fo = int((.015 if s_snap else .06) * SR), int((.06 if e_snap else .15) * SR)  # no pause at a cut: a longer fade; y[:fi] *= np.linspace(0, 1, fi); y[-fo:] *= np.linspace(1, 0, fo)
        out = OUT / f'{clip}-{r}.mp3'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-', '-b:a', '64k', str(out)], input=y.tobytes(), check=True)
        edge_in, edge_out = e[s:s + 5].max() - peak, e[en - 5:en].max() - peak
        report.append(dict(clip=clip, r=r, words=f'{w0}..{w1}', want=round(te - ts, 2), got=round(len(y) / SR, 2), start=round(base + s * FR, 2),
                           snap=f"{'S' if s_snap else 's'}{'E' if e_snap else 'e'}", ds=round(base + s * FR - ts, 2), de=round(base + en * FR - te, 2), est='EST' if es or ee else '', head_db=round(float(edge_in)), tail_db=round(float(edge_out))))
for d in report: print(d)
print('NO-PAUSE boundaries:'); [print(' ', d['clip'], d['r'], 'start' if d['snap'][0] == 's' else '', 'end' if d['snap'][1] == 'e' else '', d['ds'], d['de'], d['est']) for d in report if d['snap'] != 'SE']
json.dump(report, open('cut-report.json' if not sys.argv[2:] else 'cut-report-' + '-'.join(sys.argv[2:]) + '.json', 'w'), indent=0)
