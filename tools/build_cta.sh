#!/bin/zsh
# Vídeo de cierre (plano abierto del olivar) en 1920 y 1280. Uso: tools/build_cta.sh <dir_temporal>
set -e
T=${1:-/tmp/ayala-cta}
python3 tools/render_drone.py source-assets/satelite/pnoa-z19.jpg $T/fr-cta 1920 1080 10 3200 2176 5200 4300 2 -5
rm -rf $T/seq-cta; mkdir -p $T/seq-cta; k=0
for i in $(seq 0 249); do ln -sf $T/fr-cta/f$(printf %04d $i).png $T/seq-cta/s$(printf %04d $k).png; k=$((k+1)); done
for i in $(seq 248 -1 1); do ln -sf $T/fr-cta/f$(printf %04d $i).png $T/seq-cta/s$(printf %04d $k).png; k=$((k+1)); done
G="eq=contrast=1.05:saturation=1.05,colorbalance=rs=.04:bs=-.04"
ffmpeg -loglevel error -y -framerate 25 -i $T/seq-cta/s%04d.png -vf "$G" -c:v libx264 -preset slow -tune film -crf 34 -pix_fmt yuv420p -movflags +faststart -an assets/video/ayala-olivar-1080.mp4
ffmpeg -loglevel error -y -framerate 25 -i $T/seq-cta/s%04d.png -vf "$G,scale=1280:-2" -c:v libx264 -preset slow -tune film -crf 31 -pix_fmt yuv420p -movflags +faststart -an assets/video/ayala-olivar-720.mp4
ffmpeg -loglevel error -y -i $T/fr-cta/f0000.png -vf "$G" -f image2pipe -vcodec png - | cwebp -quiet -q 74 -o assets/img/ayala-olivar-poster.webp -- -
ls -la assets/video
