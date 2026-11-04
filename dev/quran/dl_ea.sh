# everyayah per-ayah files for full-ayah clips; dl_ea.sh [SSSAAA ...] fetches only those
mkdir -p "$(dirname "$0")/ea" && cd "$(dirname "$0")/ea"
for k in ${@:-053009 093006 105001 105002 105003 105004 105005 096001 096002 096003 096004 096005 053014 053015 053016 053017 008030 008009 048001 068004 015094 015095 038004 038005 005083 002142 020029 020030 020031 020032 019053 009001 009002}; do
  for d in Abdul_Basit_Murattal_192kbps:basit Minshawy_Murattal_128kbps:minshawi Parhizgar_48kbps:parhizgar; do
    f=${d%%:*}; r=${d##*:}; [ -s $r-$k.mp3 ] || curl -s -f -m 60 -o $r-$k.mp3 https://everyayah.com/data/$f/$k.mp3 || echo FAIL $r $k
  done
done
echo done
# Basit's qdc chapter 2 was re-uploaded (2024-12) and no longer matches its timings: cut.py cuts 2:143–144 from quran.com's per-ayah files and their word segments instead
for a in 143 144; do
  [ -s qc-basit-002$a.mp3 ] || curl -s -f -m 60 -o qc-basit-002$a.mp3 https://verses.quran.com/AbdulBaset/Murattal/mp3/002$a.mp3 || echo FAIL qc $a
  [ -s ../qdc/seg-2-2-$a.json ] || curl -s -f -m 60 -o ../qdc/seg-2-2-$a.json "https://api.quran.com/api/v4/verses/by_key/2:$a?audio=2" || echo FAIL seg $a
done
# 7:142 (tabuk) is cut from quran.com's per-ayah files for both reciters, with their word segments
[ -s qc-basit-007142.mp3 ] || curl -s -f -m 60 -o qc-basit-007142.mp3 https://verses.quran.com/AbdulBaset/Murattal/mp3/007142.mp3 || echo FAIL qc basit 7
[ -s qc-minshawi-007142.mp3 ] || curl -s -f -m 60 -o qc-minshawi-007142.mp3 https://verses.quran.com/Minshawi/Murattal/mp3/007142.mp3 || echo FAIL qc minshawi 7
for r in 2 9; do [ -s ../qdc/seg-$r-7-142.json ] || curl -s -f -m 60 -o ../qdc/seg-$r-7-142.json "https://api.quran.com/api/v4/verses/by_key/7:142?audio=$r" || echo FAIL seg $r 7; done
# 9:3 (baraa) is cut from quran.com's per-ayah files for both reciters, with their word segments
[ -s qc-basit-009003.mp3 ] || curl -s -f -m 60 -o qc-basit-009003.mp3 https://verses.quran.com/AbdulBaset/Murattal/mp3/009003.mp3 || echo FAIL qc basit 9:3
[ -s qc-minshawi-009003.mp3 ] || curl -s -f -m 60 -o qc-minshawi-009003.mp3 https://verses.quran.com/Minshawi/Murattal/mp3/009003.mp3 || echo FAIL qc minshawi 9:3
for r in 2 9; do [ -s ../qdc/seg-$r-9-3.json ] || curl -s -f -m 60 -o ../qdc/seg-$r-9-3.json "https://api.quran.com/api/v4/verses/by_key/9:3?audio=$r" || echo FAIL seg $r 9:3; done
