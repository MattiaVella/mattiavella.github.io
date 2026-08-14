#!/usr/bin/env node
/**
 * Genera una versione WebP di ogni immagine in assets/img e assets/images.
 *
 * Usa ffmpeg invece di sharp: nessuna dipendenza npm da installare, nessun
 * node_modules da tenere aggiornato. Gli originali non vengono mai toccati,
 * il .webp viene scritto accanto al file di partenza.
 *
 *   node scripts/optimize-images.mjs           genera i mancanti
 *   node scripts/optimize-images.mjs --force   rigenera tutto
 *   node scripts/optimize-images.mjs --quality 75
 */

import { readdir, stat, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join, extname, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIRS = ['assets/img', 'assets/images'];
const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

// Oltre questa larghezza l'immagine viene ridimensionata: nessuno schermo
// mostra un thumbnail di portfolio a 6000px.
const MAX_WIDTH = 1920;

const args = process.argv.slice(2);
const force = args.includes('--force');
const qualityArg = args.indexOf('--quality');
const quality = qualityArg !== -1 ? Number(args[qualityArg + 1]) : 82;

function run(cmd, cmdArgs) {
  return new Promise((resolve, reject) => {
    // Niente shell: gli argomenti passano a ffmpeg senza doverli quotare a mano
    // (i percorsi possono contenere spazi).
    const child = spawn(cmd, cmdArgs, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', d => { stderr += d; });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim().split('\n').slice(-3).join('\n')));
    });
  });
}

async function ffmpegAvailable() {
  try {
    await run('ffmpeg', ['-version']);
    return true;
  } catch {
    return false;
  }
}

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // cartella assente: semplicemente non c'e' nulla da fare
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (EXTENSIONS.has(extname(entry.name).toLowerCase())) yield full;
  }
}

const kb = bytes => (bytes / 1024).toFixed(0).padStart(6) + ' KB';

async function main() {
  if (!(await ffmpegAvailable())) {
    console.error('ffmpeg non trovato nel PATH. Installalo con:  winget install Gyan.FFmpeg');
    process.exit(1);
  }

  let totalBefore = 0;
  let totalAfter = 0;
  let converted = 0;
  let skipped = 0;

  for (const dir of SOURCE_DIRS) {
    for await (const src of walk(join(ROOT, dir))) {
      const dest = src.replace(/\.(jpe?g|png)$/i, '.webp');
      const srcStat = await stat(src);

      if (!force && existsSync(dest)) {
        const destStat = await stat(dest);
        if (destStat.mtimeMs >= srcStat.mtimeMs) {
          skipped++;
          continue;
        }
      }

      await mkdir(dirname(dest), { recursive: true });
      await run('ffmpeg', [
        '-y', '-loglevel', 'error',
        '-i', src,
        '-vf', `scale='min(${MAX_WIDTH},iw)':-2:flags=lanczos`,
        '-c:v', 'libwebp', '-quality', String(quality), '-compression_level', '6',
        dest
      ]);

      const destStat = await stat(dest);
      totalBefore += srcStat.size;
      totalAfter += destStat.size;
      converted++;

      const saved = 100 - (destStat.size / srcStat.size) * 100;
      console.log(
        `${kb(srcStat.size)} -> ${kb(destStat.size)}  (-${saved.toFixed(0).padStart(2)}%)  ${relative(ROOT, dest)}`
      );
    }
  }

  console.log('');
  if (converted === 0) {
    console.log(`Nulla da fare (${skipped} immagini gia' aggiornate). Usa --force per rigenerarle.`);
    return;
  }
  const saved = 100 - (totalAfter / totalBefore) * 100;
  console.log(
    `${converted} immagini convertite, ${skipped} gia' aggiornate.\n` +
    `Totale: ${kb(totalBefore)} -> ${kb(totalAfter)}  (-${saved.toFixed(0)}%)`
  );
}

main().catch(err => {
  console.error('Errore:', err.message);
  process.exit(1);
});
