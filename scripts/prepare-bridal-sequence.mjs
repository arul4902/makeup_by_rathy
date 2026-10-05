import sharp from 'sharp';
import { mkdirSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

const inputDir = 'public';
const outputDir = 'public/bridal-sequence';

if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

async function convertFrames() {
  const files = readdirSync(inputDir)
    .filter(f => /^ezgif-frame-\d+\.jpg$/i.test(f))
    .sort();

  console.log(`Found ${files.length} frames to convert into ${outputDir}...`);

  let count = 0;
  // Process in batches of 10 for speed
  const batchSize = 12;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await Promise.all(batch.map(async (file, idx) => {
      const frameNum = String(i + idx + 1).padStart(3, '0');
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, `frame_${frameNum}.webp`);

      await sharp(inputPath)
        .webp({ quality: 85, effort: 4 })
        .toFile(outputPath);
      count++;
    }));
    process.stdout.write(`Converted ${count}/${files.length} frames...\r`);
  }

  console.log(`\n✓ Successfully created ${count} frames in ${outputDir} (frame_001.webp to frame_${String(count).padStart(3, '0')}.webp)`);
}

convertFrames().catch(err => {
  console.error('Failed to convert frames:', err);
  process.exit(1);
});
