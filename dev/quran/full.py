# Full-ayah clips from everyayah per-ayah files (concatenated for ranges); Parhizgar's ayah-1 files open with the basmala, trimmed off.
# full.py OUT [CLIP ...] — with clip names, makes only those.
import subprocess, sys, pathlib
OUT = pathlib.Path(sys.argv[1])
FULL = {'96-1': [(96, 1)], '105-1': [(105, 1)], '105-2': [(105, 2)], '105-3_4': [(105, 3), (105, 4)], '105-5': [(105, 5)], '93-6': [(93, 6)],
        '96-1_5': [(96, a) for a in range(1, 6)], '53-14_17': [(53, a) for a in range(14, 18)], '53-9': [(53, 9)], '8-30': [(8, 30)], '8-9': [(8, 9)],
        '48-1': [(48, 1)], '68-4': [(68, 4)], '15-94': [(15, 94)], '15-95': [(15, 95)], '38-4_5': [(38, 4), (38, 5)], '5-83': [(5, 83)], '2-142': [(2, 142)],
        '20-29_32': [(20, a) for a in range(29, 33)], '19-53': [(19, 53)], '9-1_2': [(9, 1), (9, 2)], '22-27': [(22, 27)]}
BASMALA = {(96, 1): 4.20, (105, 1): 4.24, (48, 1): 4.04}  # parhizgar: end of the pause after the basmala (silencedetect)
for clip, ayat in FULL.items():
    if sys.argv[2:] and clip not in sys.argv[2:]: continue
    for r in ('basit', 'minshawi', 'parhizgar'):
        ins, flt = [], []
        for n, (su, ay) in enumerate(ayat):
            ins += ['-i', f'ea/{r}-{su:03d}{ay:03d}.mp3']
            ss = BASMALA.get((su, ay), 0) if r == 'parhizgar' else 0
            flt.append(f'[{n}:a]atrim=start={ss},asetpts=PTS-STARTPTS,aresample=44100,pan=mono|c0=c0[a{n}]')
        fc = ';'.join(flt) + ';' + ''.join(f'[a{n}]' for n in range(len(ayat))) + f'concat=n={len(ayat)}:v=0:a=1[o]'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', fc, '-map', '[o]', '-ac', '1', '-ar', '44100', '-b:a', '64k', str(OUT / f'{clip}-{r}.mp3')], check=True)
        print(clip, r)
