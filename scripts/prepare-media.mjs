import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
for(let i=1;i<=6;i++) {
 const src=`public/media/look-${i}.png`;
 await sharp(src).webp({quality:87}).toFile(`public/media/look-${i}.webp`);
 await sharp(src).resize({width:320}).webp({quality:80}).toFile(`public/media/look-${i}-small.webp`);
}
mkdirSync('.sites-runtime/contact-sheets',{recursive:true});
for(let i=1;i<=5;i++) {
 execFileSync('node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe',['-y','-ss','2','-i',`public/media/film-${i}.mp4`,'-frames:v','1','-vf','scale=420:-1',`public/media/film-${i}.jpg`],{stdio:'ignore'});
 execFileSync('node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe',['-y','-i',`public/media/film-${i}.mp4`,'-vf','fps=1/5,scale=180:-1,tile=5x2','-frames:v','1',`.sites-runtime/contact-sheets/film-${i}.jpg`],{stdio:'ignore'});
}
console.log('Optimized six portraits and extracted five film posters and contact sheets.');
