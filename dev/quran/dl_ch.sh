# quran.com (qdc) whole-chapter recitations for cut.py; dl_ch.sh [CHAPTER ...] fetches only those (needs qdc/qdc-R-C.json)
cd "$(dirname "$0")/ch"
for r in 2 9; do for c in ${@:-3 8 9 17 33 48}; do
  u=$(python3 -c "import json;print(json.load(open('../qdc/qdc-$r-$c.json'))['audio_files'][0]['audio_url'])")
  n=$([ $r = 2 ] && echo b || echo m)-$c.mp3
  [ -s $n ] && [ $n != b-8.mp3 -o -s b-8.mp3 ] && continue
  (curl -s -f -m 1500 -o $n.part "$u" && mv $n.part $n || echo FAIL $n) &
done; done; wait; echo ALLDONE
