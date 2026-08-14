#!/usr/bin/env node
/**
 * Controlla assets/data/content.json prima di pubblicare.
 *
 * Il sito e' interamente guidato da quel file: un id duplicato, una categoria
 * che non esiste tra i filtri o un percorso immagine sbagliato non danno errore
 * da nessuna parte, semplicemente il progetto non compare o la card resta
 * vuota. Questo script li trova subito.
 *
 *   node scripts/validate-content.mjs
 *
 * Esce con codice 1 se trova errori, 0 se ci sono solo avvisi.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'assets/data/content.json');

const errors = [];
const warnings = [];

const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

/** Verifica che un percorso referenziato nel JSON esista davvero su disco. */
function checkAsset(where, relPath, { required = true } = {}) {
  if (!relPath) {
    if (required) err(where, 'percorso mancante');
    return;
  }
  if (/^https?:\/\//i.test(relPath)) return; // risorsa esterna, non verificabile
  if (relPath.includes('\\')) {
    err(where, `"${relPath}" usa i backslash: su GitHub Pages da' 404, servono le barre normali`);
    return;
  }
  if (!existsSync(join(ROOT, relPath))) {
    err(where, `"${relPath}" non esiste`);
    return;
  }
  // Se esiste la versione WebP ma il JSON punta al JPG, il sito serve il file pesante.
  const ext = extname(relPath).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
    const webp = relPath.replace(/\.(jpe?g|png)$/i, '.webp');
    if (existsSync(join(ROOT, webp))) {
      warn(where, `"${relPath}" ha gia' una versione WebP: usa "${webp}"`);
    } else {
      warn(where, `"${relPath}" non e' WebP: lancia "npm run optimize:images"`);
    }
  }
}

function validateItem(item, index, validCategories) {
  const where = `progetto #${index + 1}${item && item.title ? ` ("${item.title}")` : ''}`;

  if (item.id == null || item.id === '') {
    err(where, 'manca "id" (serve per i link PortfolioPost.html?id=...)');
  }
  if (!item.title) err(where, 'manca "title"');

  if (!item.category) {
    warn(where, 'manca "category": il progetto non risponde ai filtri del portfolio');
  } else if (validCategories.length && !validCategories.includes(item.category)) {
    err(where, `categoria "${item.category}" non presente tra i filtri (${validCategories.join(', ')})`);
  }

  if (!item.media || !item.media.src) {
    warn(where, 'nessun media: la card compare senza immagine');
  } else {
    checkAsset(`${where} > media.src`, item.media.src);
    const type = item.media.type;
    if (type && type !== 'image' && type !== 'video') {
      err(where, `media.type "${type}" non valido (ammessi: image, video)`);
    }
    if (type === 'video' && extname(item.media.src).toLowerCase() !== '.mp4') {
      warn(where, 'media di tipo video ma il file non e\' .mp4');
    }
  }

  (item.gallery || []).forEach((g, i) => checkAsset(`${where} > gallery[${i}]`, g));

  if (item.beforeAfter) {
    checkAsset(`${where} > beforeAfter.before`, item.beforeAfter.before);
    checkAsset(`${where} > beforeAfter.after`, item.beforeAfter.after);
  }

  if (item.embed) {
    const url = typeof item.embed === 'string' ? item.embed : item.embed.url;
    checkAsset(`${where} > embed.url`, url);
  }

  (item.links || []).forEach((l, i) => {
    if (!l || !l.url) err(`${where} > links[${i}]`, 'manca "url"');
  });

  if (item.caseStudy) {
    const cs = item.caseStudy;
    ['goals', 'challenges', 'solution', 'tools'].forEach(key => {
      if (cs[key] != null && !Array.isArray(cs[key])) {
        err(`${where} > caseStudy.${key}`, 'deve essere una lista');
      }
    });
    if (cs.results != null) {
      if (!Array.isArray(cs.results)) err(`${where} > caseStudy.results`, 'deve essere una lista');
      else cs.results.forEach((r, i) => {
        if (!r || !r.label || !r.value) warn(`${where} > caseStudy.results[${i}]`, 'label o value mancante');
      });
    }
  }
}

async function main() {
  let raw;
  try {
    raw = await readFile(CONTENT, 'utf8');
  } catch {
    console.error(`Non trovo ${CONTENT}`);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('content.json non e\' JSON valido:\n  ' + e.message);
    console.error('\nCausa piu\' frequente: una virgola di troppo prima di } oppure ].');
    process.exit(1);
  }

  const site = data.site;
  if (!site) {
    console.error('Manca la chiave radice "site".');
    process.exit(1);
  }

  const contact = site.contact || {};
  if (!contact.email || /example\.com$/i.test(contact.email)) {
    warn('site.contact.email', `ancora un segnaposto ("${contact.email || 'vuoto'}")`);
  }
  if (!contact.phone || /^\+39\s*0+$/.test(String(contact.phone).replace(/\s/g, ''))) {
    warn('site.contact.phone', `ancora un segnaposto ("${contact.phone || 'vuoto'}")`);
  }
  Object.entries(site.social || {}).forEach(([rete, url]) => {
    if (!url || url === '#') warn(`site.social.${rete}`, 'link non impostato (punta a "#")');
  });

  const portfolio = site.portfolio || {};
  const filters = Array.isArray(portfolio.filters) ? portfolio.filters : [];
  const validCategories = filters
    .map(f => f && f.filter)
    .filter(f => typeof f === 'string' && f !== '*')
    .map(f => f.replace(/^\.?filter-/, ''));

  const items = Array.isArray(portfolio.items) ? portfolio.items : [];
  if (!items.length) err('site.portfolio.items', 'nessun progetto');

  const seen = new Map();
  items.forEach((item, i) => {
    if (item && item.id != null) {
      if (seen.has(String(item.id))) {
        err(`progetto #${i + 1}`, `id "${item.id}" gia' usato dal progetto #${seen.get(String(item.id)) + 1}`);
      } else {
        seen.set(String(item.id), i);
      }
    }
    validateItem(item || {}, i, validCategories);
  });

  // Categorie dichiarate ma ancora senza progetti: il filtro non viene mostrato
  // (portfolio.js nasconde le voci vuote), quindi e' solo un promemoria.
  const catUsate = validCategories.filter(cat => items.some(it => it && it.category === cat));
  validCategories.forEach(cat => {
    if (!catUsate.includes(cat)) {
      warn(`filtro "${cat}"`, 'ancora nessun progetto: la voce resta nascosta finche\' non ne aggiungi uno');
    }
  });
  if (catUsate.length === 1) {
    warn('filtri', `un'unica categoria in uso ("${catUsate[0]}"): la barra dei filtri resta nascosta`);
  }

  console.log(`Controllati ${items.length} progetti.\n`);

  if (warnings.length) {
    console.log(`Avvisi (${warnings.length}):`);
    warnings.forEach(w => console.log('  ! ' + w));
    console.log('');
  }

  if (errors.length) {
    console.log(`Errori (${errors.length}):`);
    errors.forEach(e => console.log('  x ' + e));
    console.log('\nQuesti impediscono al sito di funzionare correttamente.');
    process.exit(1);
  }

  console.log(warnings.length ? 'Nessun errore bloccante.' : 'Tutto a posto.');
}

main().catch(e => {
  console.error('Errore inatteso:', e.message);
  process.exit(1);
});
