const { createCanvas } = require('@napi-rs/canvas');
const { spawn } = require('child_process');
const fs = require('fs');
const ffmpeg = require('ffmpeg-static');
const { render, W, H, DURATION } = require('./scenes');

const args = process.argv.slice(2);
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

if (args[0] === '--still') {
  fs.mkdirSync('stills', { recursive: true });
  for (const s of args[1].split(',')) {
    const t = parseFloat(s);
    render(ctx, t);
    fs.writeFileSync(`stills/t${s}.png`, canvas.toBuffer('image/png'));
  }
  console.log('stills written');
} else {
  const FPS = 30, out = args[0] || 'silent.mp4';
  const ff = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', `${FPS}`, '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  (async () => {
    const n = Math.round(DURATION * FPS);
    for (let i = 0; i < n; i++) {
      render(ctx, i / FPS);
      const buf = canvas.data();
      if (!ff.stdin.write(Buffer.from(buf))) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 300 === 0) console.log(`frame ${i}/${n}`);
    }
    ff.stdin.end();
    ff.on('close', c => console.log('done', c));
  })();
}
