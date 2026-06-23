/**
 * copy-research-assets.mjs
 * -------------------------------------------------------------
 * One-time curated copy of the Esports research source media into
 * frontend/public/research-assets/ so the Astro static build can
 * serve it. Filenames are normalized to lowercase, URL-safe,
 * zero-padded so the JS frame-builders can derive paths by index.
 *
 * Run:  node frontend/scripts/copy-research-assets.mjs
 *
 * Safe to re-run (overwrites). Original sources are never modified.
 * -------------------------------------------------------------
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'Esports-Research-Website-Assets');
const DEST = path.resolve(__dirname, '..', 'public', 'research-assets');

const pad3 = (n) => String(n).padStart(3, '0');

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

/** Copy every ezgif-frame-NNN.jpg from srcDir into destDir as frame-NNN.jpg
 *  (or a custom prefix), preserving numeric order. */
async function copyFrameFolder(srcDir, destDir, outPrefix = 'frame') {
  let entries = await fs.readdir(srcDir).catch(() => []);
  entries = entries
    .filter((f) => /^ezgif-frame-\d+\.jpe?g$/i.test(f))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)[0], 10);
      const nb = parseInt(b.match(/\d+/)[0], 10);
      return na - nb;
    });

  let i = 1;
  for (const file of entries) {
    const dest = path.join(destDir, `${outPrefix}-${pad3(i)}.jpg`);
    await copyFile(path.join(srcDir, file), dest);
    i++;
  }
  return entries.length;
}

async function copyTest(testId, cfg) {
  const baseSrc = path.join(SRC, cfg.folder);
  const baseDest = path.join(DEST, 'tests', testId);
  console.log(`• ${testId}`);

  // raw videos + first-frame poster
  const rawDest = path.join(baseDest, 'raw');
  if (cfg.webm) await copyFile(path.join(baseSrc, 'raw-videos', cfg.webm), path.join(rawDest, cfg.webm));
  if (cfg.mp4) await copyFile(path.join(baseSrc, 'raw-videos', cfg.mp4), path.join(rawDest, cfg.mp4));
  if (cfg.firstFrame) {
    await copyFile(
      path.join(baseSrc, cfg.firstFrame),
      path.join(rawDest, 'first-frame.png'),
    );
  }

  // transition frame folders (31 in, 31 out)
  const inCount = await copyFrameFolder(
    path.join(baseSrc, 'transitions', cfg.inFolder),
    path.join(baseDest, 'in'),
  );
  const outCount = await copyFrameFolder(
    path.join(baseSrc, 'transitions', cfg.outFolder),
    path.join(baseDest, 'out'),
  );
  console.log(`    in=${inCount} out=${outCount}`);
}

async function main() {
  console.log(`Source:  ${SRC}`);
  console.log(`Dest:    ${DEST}\n`);

  if (!(await fs.stat(SRC).catch(() => null))) {
    console.error(`Source folder not found: ${SRC}`);
    process.exit(1);
  }

  await ensureDir(DEST);

  // 1. Hero box frames (180) → hero/box-frame-001.jpg ...
  console.log('• hero (box open)');
  const heroCount = await copyFrameFolder(
    path.join(SRC, 'Research-Hero-Frames'),
    path.join(DEST, 'hero'),
    'box-frame',
  );
  console.log(`    frames=${heroCount}`);

  // 2. Genesis GX3 photos → genesis/01.jpg ...
  console.log('• genesis (GX3 photos)');
  const genSrc = path.join(SRC, 'Genesis-Research-Photos');
  const genDest = path.join(DEST, 'genesis');
  let genEntries = await fs.readdir(genSrc).catch(() => []);
  genEntries = genEntries
    .filter((f) => /\.jpe?g$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  let gi = 1;
  for (const file of genEntries) {
    await copyFile(path.join(genSrc, file), path.join(genDest, `${pad3(gi)}.jpg`));
    gi++;
  }
  console.log(`    photos=${genEntries.length}`);

  // 3. Tests
  await copyTest('rt', {
    folder: 'RT',
    webm: 'Reaction-Time-EX.webm',
    mp4: 'Reaction-Time-EX.mp4',
    firstFrame: 'Reaction-Time-First-Frame.png',
    inFolder: 'RT-Transition-In-Frames',
    outFolder: 'RT-Transition-Out-Frames',
  });
  await copyTest('gonogo', {
    folder: 'GoNoGo',
    webm: 'Go-NoGo-EX.webm',
    mp4: 'Go-NoGo-EX.mp4',
    firstFrame: 'Go-NoGo-First-Frame.png',
    inFolder: 'GoNoGo-Transition-In-Frames',
    outFolder: 'GoNoGo-Transition-Out-Frames',
  });
  await copyTest('taskswitching', {
    folder: 'TaskSwitching',
    webm: 'Task-Switching-EX.webm',
    mp4: 'Task-Switching-EX.mp4',
    firstFrame: 'Task-Switching-First-Frame.png',
    inFolder: 'TS-Transition-In-Frames',
    outFolder: 'TS-Transition-Out-Frames',
  });
  await copyTest('posner', {
    folder: 'Posner-Cueing',
    webm: 'Posner-Cueing-EX.webm',
    mp4: 'Posner-Cueing-EX.mp4',
    firstFrame: 'Posner-Cueing-First-Frame.png',
    inFolder: 'Posner-Transition-In-Frames',
    outFolder: 'Posner-Transition-Out-Frames',
  });

  // 4. Heneveld placeholder
  console.log('• heneveld (placeholder)');
  await copyFile(
    path.join(SRC, '28282b.png'),
    path.join(DEST, 'tests', 'heneveld', 'placeholder.png'),
  );

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
