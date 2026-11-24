#!/bin/zsh
# Regenera los vídeos cenitales. Uso: tools/build_videos.sh <dir_temporal>
set -e
T=${1:-/tmp/ayala-frames}
M=source-assets/satelite/pnoa-z19.jpg
G="eq=contrast=1.06:saturation=1.08:gamma=0.98,colorbalance=rs=.03:gs=.01:bs=-.03:rm=.02:bm=-.02"
seq_link() { # crea la secuencia ida y vuelta para que el bucle no salte
  local src=$1 dst=$2 n=$3 k=0
  rm -rf $dst; mkdir -p $dst
  for i in $(seq 0 $((n-1))); do ln -sf $src/f$(printf %04d $i).png $dst/s$(printf %04d $k).png; k=$((k+1)); done
  for i in $(seq $((n-2)) -1 1); do ln -sf $src/f$(printf %04d $i).png $dst/s$(printf %04d $k).png; k=$((k+1)); done
}
python3 tools/render_drone.py $M $T/fr-desk 1920 1080 12 2900 2100 3400 2300 -9 3 &
python3 tools/render_drone.py $M $T/fr-mob 720 1280 12 3200 2330 1700 1150 -6 4 &
wait
seq_link $T/fr-desk $T/seq-desk 300
seq_link $T/fr-mob $T/seq-mob 300
ffmpeg -loglevel error -y -framerate 25 -i $T/seq-desk/s%04d.png -vf "$G" -c:v libx264 -preset slow -crf 30 -pix_fmt yuv420p -movflags +faststart -an assets/video/ayala-cenital-1080.mp4
ffmpeg -loglevel error -y -framerate 25 -i $T/seq-desk/s%04d.png -vf "$G,scale=1280:-2" -c:v libx264 -preset slow -crf 29 -pix_fmt yuv420p -movflags +faststart -an assets/video/ayala-cenital-720.mp4
ffmpeg -loglevel error -y -framerate 25 -i $T/seq-mob/s%04d.png -vf "$G" -c:v libx264 -preset slow -crf 32 -pix_fmt yuv420p -movflags +faststart -an assets/video/ayala-cenital-movil.mp4
ffmpeg -loglevel error -y -i $T/fr-desk/f0000.png -vf "$G" -f image2pipe -vcodec png - | cwebp -quiet -q 72 -o assets/img/ayala-cenital-poster.webp -- -
ffmpeg -loglevel error -y -i $T/fr-mob/f0000.png -vf "$G" -f image2pipe -vcodec png - | cwebp -quiet -q 72 -o assets/img/ayala-cenital-poster-movil.webp -- -
echo ok
