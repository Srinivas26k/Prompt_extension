#!/bin/sh
# Simple script to generate placeholder icons using ImageMagick
# You'll need to have ImageMagick installed for this to work

# Create a basic purple-gradient icon for the extension
for size in 16 32 48 96; do
  convert -size ${size}x${size} gradient:'#667eea-#764ba2' \
    -gravity center -pointsize $((size/3)) -fill white \
    -font "DejaVu-Sans-Bold" -annotate 0 "✨" \
    -draw "fill none stroke white stroke-width 2 roundrectangle $((size/10)),$((size/10)),$((size*9/10)),$((size*9/10)),$((size/10)),$((size/10))" \
    icons/icon-${size}.png
done
