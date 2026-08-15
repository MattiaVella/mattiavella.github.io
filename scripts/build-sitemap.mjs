#!/usr/bin/env node
/**
 * Genera sitemap.xml dalle pagine fisse piu' i progetti in content.json.
 *
 * Scritta a mano diventerebbe obsoleta al primo progetto aggiunto: qui le
 * schede vengono elencate leggendo gli stessi dati che le producono.
 *
 *   node scripts/build-sitemap.mjs
 */

import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'https://mattiavella.github.io';

// Pagine fisse. Le due schede di dettaglio non collegate restano fuori:
// senza un id in query non mostrano alcun contenuto.
const PAGINE = [
  { path: '/', priority: '1.0', changefreq: 'monthly' },
  { path: '/case-studies.html', priority: '0.8', changefreq: 'monthly' }
];

const oggi = new Date().toISOString().slice(0, 10);

const escapeXml = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

function url({ path, priority, changefreq }) {
  return [
    '  <url>',
    `    <loc>${escapeXml(BASE + path)}</loc>`,
    `    <lastmod>${oggi}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>'
  ].join('\n');
}

async function main() {
  const dati = JSON.parse(await readFile(join(ROOT, 'assets/data/content.json'), 'utf8'));
  const progetti = dati?.site?.portfolio?.items || [];

  const voci = [...PAGINE];
  progetti.forEach(p => {
    if (p && p.id != null) {
      voci.push({
        path: `/PortfolioPost.html?id=${encodeURIComponent(p.id)}`,
        priority: '0.6',
        changefreq: 'yearly'
      });
    }
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    voci.map(url).join('\n'),
    '</urlset>',
    ''
  ].join('\n');

  await writeFile(join(ROOT, 'sitemap.xml'), xml, 'utf8');
  console.log(`sitemap.xml aggiornata: ${voci.length} URL (${PAGINE.length} pagine fisse, ${progetti.length} progetti).`);
}

main().catch(e => {
  console.error('Errore:', e.message);
  process.exit(1);
});
