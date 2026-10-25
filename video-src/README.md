# Promo video source

Builds `media/after-the-demarc-intro.mp4`. Everything is code: no video editor needed.

```bash
cd video-src
npm i @napi-rs/canvas ffmpeg-static
./make-vo.sh                      # or drop your own recordings into vo/
python3 music.py mix.wav          # music + SFX + voiceover mix (needs numpy)
node render.js silent.mp4         # renders 1920x1080 @ 30fps
node_modules/ffmpeg-static/ffmpeg -y -i silent.mp4 -i mix.wav -c:v copy -c:a aac -b:a 160k -movflags +faststart -shortest ../media/after-the-demarc-intro.mp4
```

- Scene timings, on-screen text and captions live in `scenes.js` (`SCENES`, `CAPS`).
- Voice cue start times live in `music.py` (`cues`). If you re-record a line, keep it close to the same length or shift the timings.
- `node render.js --still 6,15.5` writes preview PNGs to `stills/`.
