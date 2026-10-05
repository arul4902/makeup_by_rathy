import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { existsSync, writeFileSync } from 'node:fs';

const ffmpeg = path.resolve('node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe');

async function main() {
  console.log('1. Preparing bridal final shot with bindi & gold tikka...');
  const svgBindi = `
<svg width="1376" height="768" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bindiGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#9E1B24" />
      <stop offset="70%" stop-color="#7B0B13" />
      <stop offset="100%" stop-color="#4B0007" />
    </radialGradient>
    <radialGradient id="goldDot" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFE5B8" />
      <stop offset="70%" stop-color="#C9A86A" />
      <stop offset="100%" stop-color="#8C6F34" />
    </radialGradient>
  </defs>
  <!-- Traditional South Indian bridal bindi between brows -->
  <circle cx="707" cy="250" r="7.5" fill="url(#bindiGlow)" />
  <circle cx="707" cy="250" r="2.2" fill="url(#goldDot)" />
  <!-- Delicate gold maang tikka pendant chain hint -->
  <circle cx="707" cy="218" r="3.5" fill="url(#goldDot)" />
  <line x1="707" y1="165" x2="707" y2="218" stroke="#C9A86A" stroke-width="1.2" opacity="0.75" />
</svg>
`;

  await sharp('public/media/transform-5-saree-drape.jpg')
    .composite([
      { input: Buffer.from(svgBindi), blend: 'over' }
    ])
    .jpeg({ quality: 95 })
    .toFile('public/media/transform-6-final-bride.jpg');

  console.log('✓ Created public/media/transform-6-final-bride.jpg');

  // Shot plan matching exact user specifications:
  // 1. Natural Bare Face: 0.0 - 1.2s (Push forward)
  // 2. Brush & Skin: 1.2 - 2.4s (Brush across cheekbone, radiance appears)
  // 3. Eyeliner & Eyes: 2.4 - 3.8s (Macro eyeliner drawn on lid)
  // 4. Hair & Jasmine & Earring: 3.8 - 5.0s (Jasmine & antique gold jhumka)
  // 5. Saree Draping & Necklace: 5.0 - 6.4s (Temple necklace & saree sweeps across lens)
  // 6. Complete Bride Final Reveal: 6.4 - 8.5s (Full bridal splendor in golden light)
  const shots = [
    { img: 'public/media/transform-1-bare.jpg', out: '.sites-runtime/t_shot1.mp4', frames: 38, zoom: 'min(zoom+0.001,1.12)' },
    { img: 'public/media/transform-2-brush.jpg', out: '.sites-runtime/t_shot2.mp4', frames: 40, zoom: 'min(zoom+0.0008,1.1)' },
    { img: 'public/media/transform-3-eyeliner.jpg', out: '.sites-runtime/t_shot3.mp4', frames: 44, zoom: 'min(zoom+0.0012,1.15)' },
    { img: 'public/media/transform-4-jasmine-earring.jpg', out: '.sites-runtime/t_shot4.mp4', frames: 40, zoom: 'min(zoom+0.0008,1.1)' },
    { img: 'public/media/transform-5-saree-drape.jpg', out: '.sites-runtime/t_shot5.mp4', frames: 44, zoom: 'min(zoom+0.001,1.12)' },
    { img: 'public/media/transform-6-final-bride.jpg', out: '.sites-runtime/t_shot6.mp4', frames: 75, zoom: 'min(zoom+0.0003,1.05)' },
  ];

  console.log('2. Rendering 16:9 desktop transformation shots...');
  for (const [i, s] of shots.entries()) {
    const dur = s.frames / 30;
    const fadeOutDur = 0.25;
    const fadeOutStart = Math.max(0, dur - fadeOutDur);
    // Warm ivory / diffused sunlight cross-transition between scenes
    const fadeIn = i > 0 ? `fade=t=in:st=0:d=${fadeOutDur}:color=0xFBF8F3,` : '';
    // Last shot stays crystal clear without fade out
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

  // Concatenate desktop shots into public/media/bridal-transformation.mp4
  const concatList = shots.map(s => `file '${path.basename(s.out)}'`).join('\n');
  writeFileSync('.sites-runtime/concat-transform.txt', concatList);

  execFileSync(ffmpeg, [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', '.sites-runtime/concat-transform.txt',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    'public/media/bridal-transformation.mp4'
  ], { stdio: 'inherit' });
  console.log('✓ Master desktop MP4 created: public/media/bridal-transformation.mp4');

  // Also export optimized WebM version for modern browsers
  console.log('3. Exporting optimized WebM version...');
  execFileSync(ffmpeg, [
    '-y',
    '-i', 'public/media/bridal-transformation.mp4',
    '-c:v', 'libvpx-vp9',
    '-crf', '28',
    '-b:v', '0',
    '-deadline', 'realtime',
    '-cpu-used', '4',
    'public/media/bridal-transformation.webm'
  ], { stdio: 'inherit' });
  console.log('✓ Master desktop WebM created: public/media/bridal-transformation.webm');

  // 4. Create separate 9:16 vertical safe mobile composition
  console.log('4. Rendering 9:16 mobile vertical shots...');
  const mobileShots = shots.map((s, i) => {
    const mOut = `.sites-runtime/mt_shot${i + 1}.mp4`;
    const dur = s.frames / 30;
    const fadeOutDur = 0.25;
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
    console.log(`✓ Rendered mobile ${mOut}`);
    return mOut;
  });

  const mobileConcatList = mobileShots.map(m => `file '${path.basename(m)}'`).join('\n');
  writeFileSync('.sites-runtime/concat-transform-mobile.txt', mobileConcatList);

  execFileSync(ffmpeg, [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', '.sites-runtime/concat-transform-mobile.txt',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    'public/media/bridal-transformation-mobile.mp4'
  ], { stdio: 'inherit' });
  console.log('✓ Master mobile MP4 created: public/media/bridal-transformation-mobile.mp4');

  // Mobile WebM version
  execFileSync(ffmpeg, [
    '-y',
    '-i', 'public/media/bridal-transformation-mobile.mp4',
    '-c:v', 'libvpx-vp9',
    '-crf', '30',
    '-b:v', '0',
    '-deadline', 'realtime',
    '-cpu-used', '4',
    'public/media/bridal-transformation-mobile.webm'
  ], { stdio: 'inherit' });
  console.log('✓ Master mobile WebM created: public/media/bridal-transformation-mobile.webm');

  console.log('All transformation videos generated successfully!');
}

main().catch(err => {
  console.error('Error generating transformation videos:', err);
  process.exit(1);
});
