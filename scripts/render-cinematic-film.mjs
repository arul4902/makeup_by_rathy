import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { existsSync, statSync, writeFileSync } from 'node:fs';

const ffmpeg = path.resolve('node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe');

const shots = [
  { img: 'public/media/cinematic-1-particle.jpg', out: '.sites-runtime/shot1.mp4', frames: 45, zoom: 'min(zoom+0.0008,1.1)' },
  { img: 'public/media/cinematic-2-pigment.jpg', out: '.sites-runtime/shot2.mp4', frames: 48, zoom: 'min(zoom+0.0008,1.12)' },
  { img: 'public/media/cinematic-3-silk.jpg', out: '.sites-runtime/shot3.mp4', frames: 45, zoom: 'min(zoom+0.0007,1.1)' },
  { img: 'public/media/cinematic-4-jasmine.jpg', out: '.sites-runtime/shot4.mp4', frames: 45, zoom: 'min(zoom+0.0007,1.1)' },
  { img: 'public/media/cinematic-5-eye.jpg', out: '.sites-runtime/shot5.mp4', frames: 42, zoom: 'min(zoom+0.0008,1.12)' },
  { img: 'public/media/cinematic-6-bride.jpg', out: '.sites-runtime/shot6.mp4', frames: 75, zoom: 'min(zoom+0.0004,1.05)' },
];

console.log('Checking desktop shots...');
for (const [i, s] of shots.entries()) {
  if (existsSync(s.out) && statSync(s.out).size > 10000) {
    console.log(`✓ Exists: ${s.out}`);
    continue;
  }
  const dur = s.frames / 30;
  const fadeOutDur = 0.28;
  const fadeOutStart = Math.max(0, dur - fadeOutDur);
  const fadeIn = i > 0 ? `fade=t=in:st=0:d=${fadeOutDur}:color=0xFBF8F3,` : '';
  const fadeOut = i < shots.length - 1 ? `,fade=t=out:st=${fadeOutStart}:d=${fadeOutDur}:color=0xFBF8F3` : '';

  execFileSync(ffmpeg, [
    '-y',
    '-i', s.img,
    '-vf', `zoompan=z='${s.zoom}':d=${s.frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30,${fadeIn}format=yuv420p${fadeOut}`,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'veryfast',
    '-crf', '19',
    s.out
  ], { stdio: 'inherit' });
  console.log(`✓ Rendered ${s.out}`);
}

// Concat list with relative basename inside .sites-runtime
const concatList = shots.map(s => `file '${path.basename(s.out)}'`).join('\n');
writeFileSync('.sites-runtime/concat.txt', concatList);

// Concatenate into final master video
execFileSync(ffmpeg, [
  '-y',
  '-f', 'concat',
  '-safe', '0',
  '-i', '.sites-runtime/concat.txt',
  '-c:v', 'libx264',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  'public/media/birth-of-a-bridal-look.mp4'
], { stdio: 'inherit' });

console.log('✓ Master video created: public/media/birth-of-a-bridal-look.mp4');

// Also create mobile vertical 1080x1920 video
console.log('Rendering mobile vertical shots...');
const mobileShots = shots.map((s, i) => {
  const mOut = `.sites-runtime/mshot${i + 1}.mp4`;
  if (existsSync(mOut) && statSync(mOut).size > 10000) {
    console.log(`✓ Exists: ${mOut}`);
    return mOut;
  }
  const dur = s.frames / 30;
  const fadeOutDur = 0.28;
  const fadeOutStart = Math.max(0, dur - fadeOutDur);
  const fadeIn = i > 0 ? `fade=t=in:st=0:d=${fadeOutDur}:color=0xFBF8F3,` : '';
  const fadeOut = i < shots.length - 1 ? `,fade=t=out:st=${fadeOutStart}:d=${fadeOutDur}:color=0xFBF8F3` : '';

  execFileSync(ffmpeg, [
    '-y',
    '-i', s.img,
    '-vf', `zoompan=z='${s.zoom}':d=${s.frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30,${fadeIn}format=yuv420p${fadeOut}`,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'veryfast',
    '-crf', '20',
    mOut
  ], { stdio: 'ignore' });
  return mOut;
});

const mobileConcatList = mobileShots.map(m => `file '${path.basename(m)}'`).join('\n');
writeFileSync('.sites-runtime/concat-mobile.txt', mobileConcatList);

execFileSync(ffmpeg, [
  '-y',
  '-f', 'concat',
  '-safe', '0',
  '-i', '.sites-runtime/concat-mobile.txt',
  '-c:v', 'libx264',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  'public/media/birth-of-a-bridal-look-mobile.mp4'
], { stdio: 'inherit' });

console.log('✓ Mobile video created: public/media/birth-of-a-bridal-look-mobile.mp4');
