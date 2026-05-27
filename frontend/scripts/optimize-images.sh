#!/bin/bash
set -euo pipefail

DIR="$(cd "$(dirname "$0")/../src/assets/images" && pwd)"
TMP="$DIR/.tmp-opt"
mkdir -p "$TMP"

convert_file() {
  local src="$1"
  local max="$2"
  local quality="$3"
  local base
  base="$(basename "$src")"
  local name="${base%.*}"
  local dst="$DIR/${name}.webp"
  local tmp="$TMP/${name}.src"

  cp "$src" "$tmp"
  if [ "$max" -gt 0 ]; then
    sips -Z "$max" "$tmp" >/dev/null
  fi
  cwebp -quiet -q "$quality" "$tmp" -o "$dst"
  echo "$(du -h "$src" | awk '{print $1}') -> $(du -h "$dst" | awk '{print $1}')  $name"
}

convert_file "$DIR/city-rostov.png" 1400 80
convert_file "$DIR/city-spb.png" 1400 80
convert_file "$DIR/city-krasnodar.png" 1400 80
convert_file "$DIR/city-donetsk.png" 1400 80
convert_file "$DIR/city-crimea.png" 1400 80
convert_file "$DIR/city-lugansk.png" 1400 80

convert_file "$DIR/hero-car.png" 1200 82
convert_file "$DIR/logo-dark.png" 840 90
convert_file "$DIR/logo-light.png" 840 90
convert_file "$DIR/icon-mail.png" 0 90
convert_file "$DIR/icon-telegram.png" 0 90

convert_file "$DIR/car-solaris.png" 1216 82
convert_file "$DIR/kia-rio.jpg" 1216 82
convert_file "$DIR/skoda-rapid.jpg" 1216 82
convert_file "$DIR/hyundai-elantra.jpg" 1216 82
convert_file "$DIR/belgee-x50.jpg" 1216 82
convert_file "$DIR/chery-tiggo.jpg" 1216 82
convert_file "$DIR/toyota-camry.jpg" 1216 82
convert_file "$DIR/kia-optima.jpg" 1216 82
convert_file "$DIR/belgee-x70.jpg" 1216 82
convert_file "$DIR/chery-arrizo8.jpg" 1216 82
convert_file "$DIR/mercedes-vito.jpg" 1216 82
convert_file "$DIR/mercedes-sprinter.jpg" 1216 82

rm -rf "$TMP"
