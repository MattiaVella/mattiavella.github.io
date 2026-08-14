/**
 * Rendering della pagina Case Studies a partire da assets/data/content.json.
 *
 * Era uno script inline dentro case-studies.html: spostato qui per condividere
 * gli helper con portfolio.js (assets/js/site-content.js) invece di
 * riscriverli. Il caso concreto: la facade dell'embed 3D esisteva solo nel
 * portfolio, quindi questa pagina scaricava 83 MB all'apertura.
 */
(function () {
  'use strict';

  const { esc, loadContent, wireLazyMedia, mountEmbedFacade, lazyAttrs } = window.SiteContent;

  function metaList(meta) {
    if (!meta) return '';
    const parts = [];
    if (meta.client) parts.push(`<li class="list-inline-item me-3"><i class="bi bi-building me-1"></i>${esc(meta.client)}</li>`);
    if (meta.role) parts.push(`<li class="list-inline-item me-3"><i class="bi bi-person-badge me-1"></i>${esc(meta.role)}</li>`);
    if (meta.date) parts.push(`<li class="list-inline-item me-3"><i class="bi bi-calendar-event me-1"></i>${esc(meta.date)}</li>`);
    if (Array.isArray(meta.tags) && meta.tags.length) {
      parts.push(`<li class="list-inline-item">${meta.tags.map(t => `<span class="badge rounded-pill bg-secondary-subtle text-secondary me-1">${esc(t)}</span>`).join('')}</li>`);
    }
    return parts.join('');
  }

  function mediaBlock(item) {
    if (!item || !item.media || !item.media.src) return '';
    const alt = esc(item.title || 'Media');
    if (item.media.type === 'video') {
      return `
        <div class="ratio ratio-16x9 mb-3">
          <video controls preload="metadata">
            <source src="${esc(item.media.src)}" type="video/mp4">
          </video>
        </div>
      `;
    }
    return `<img src="${esc(item.media.src)}" alt="${alt}" class="img-fluid mb-3" loading="lazy" decoding="async">`;
  }

  /**
   * L'iframe viene creato senza src: ci pensa mountEmbedFacade dopo il mount,
   * leggendo l'url da data-embed-url.
   */
  function embedBlock(item) {
    const e = item && item.embed;
    const url = (typeof e === 'string') ? e : (e && e.url);
    const label = (e && e.label) ? e.label : 'Apri a schermo intero';
    if (!url) return '';
    return `
      <div class="mt-2">
        <h4 class="h6 text-uppercase text-secondary"><i class="bi bi-aspect-ratio me-1"></i>Anteprima interattiva</h4>
        <div class="embed-wrap ratio ratio-16x9 shadow-lg" style="border-radius:12px; overflow:hidden;">
          <iframe data-embed-url="${esc(url)}" title="Anteprima interattiva" loading="lazy" referrerpolicy="no-referrer" style="border:0; width:100%; height:100%; background:#0f0f0f;" allowfullscreen></iframe>
        </div>
        <div class="text-end mt-2">
          <a href="${esc(url)}" target="_blank" rel="noopener" class="small text-secondary">
            <i class="bi bi-box-arrow-up-right me-1"></i><span>${esc(label)}</span>
          </a>
        </div>
      </div>
    `;
  }

  function linksBlock(links) {
    if (!Array.isArray(links) || !links.length) return '';
    return `
      <div class="row g-3 mt-1">
        ${links.map(l => {
          if (!l || !l.url) return '';
          const icon = l.icon ? `bi ${esc(l.icon)}` : 'bi bi-link-45deg';
          return `
            <div class="col-12 col-sm-6 col-lg-4">
              <a class="card link-card h-100" href="${esc(l.url)}" target="_blank" rel="noopener">
                <div class="card-body d-flex align-items-center">
                  <i class="${icon} me-1"></i><span>${esc(l.label || l.url)}</span>
                </div>
              </a>
            </div>`;
        }).join('')}
      </div>
    `;
  }

  function galleryBlock(item) {
    const gallery = Array.isArray(item.gallery) ? item.gallery : [];
    if (!gallery.length) return '';
    const gid = `cs-${item.id || Math.random().toString(36).slice(2)}`;
    return `
      <div class="portfolio section-bg mt-4">
        <div class="row portfolio-container" data-aos="fade-up" data-aos-delay="100">
          ${gallery.map((g, idx) => `
            <div class="col-lg-4 col-md-6 portfolio-item ${item.category ? 'filter-' + esc(item.category) : ''}">
              <div class="portfolio-wrap">
                <img src="${esc(g)}" class="img-fluid" alt="${esc(item.title)} ${idx + 1}" ${lazyAttrs(idx, 0)}>
                <a href="${esc(g)}" data-gallery="${gid}" class="portfolio-lightbox portfolio-info-link" aria-label="Apri immagine ${idx + 1}">
                  <div class="portfolio-info">
                    <h4>${esc(item.title)}</h4>
                  </div>
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function csQuoteBlock(cs) {
    if (!cs || !cs.heroQuote) return '';
    return `
      <figure class="mt-3">
        <blockquote class="blockquote">
          <p class="mb-0">“${esc(cs.heroQuote)}”</p>
        </blockquote>
      </figure>
    `;
  }

  function csListSection(title, items, icon) {
    if (!Array.isArray(items) || !items.length) return '';
    const ico = icon ? `<i class="bi ${icon} me-1"></i>` : '';
    return `
      <div class="mb-3">
        <h4 class="h6 text-uppercase text-secondary">${ico}${title}</h4>
        <ul class="mb-0 ps-3">
          ${items.map(i => `<li>${esc(i)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  function csResultsGrid(results) {
    if (!Array.isArray(results) || !results.length) return '';
    return `
      <div class="row g-3 mt-2">
        ${results.map(r => `
          <div class="col-6 col-md-4">
            <div class="p-3 rounded-3 bg-dark border border-dark-subtle h-100">
              <div class="text-uppercase small text-secondary">${esc(r.label)}</div>
              <div class="h4 mb-0">${esc(r.value)}</div>
              ${r.caption ? `<div class="small text-muted">${esc(r.caption)}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function csTools(tags) {
    if (!Array.isArray(tags) || !tags.length) return '';
    return `
      <div class="mt-3">
        <h4 class="h6 text-uppercase text-secondary"><i class="bi bi-tools me-1"></i>Strumenti</h4>
        <div>
          ${tags.map(t => `<span class="badge rounded-pill bg-secondary-subtle text-secondary me-1">${esc(t)}</span>`).join('')}
        </div>
      </div>
    `;
  }

  function renderCaseStudy(item) {
    const longText = item.longDescription || item.aboutText || item.description || '';
    const detailText = item.details || '';
    const kicker = (item.meta && Array.isArray(item.meta.tags) && item.meta.tags[0]) || item.category || 'Project';
    const cs = item.caseStudy || null;

    return `
      <article id="cs-${esc(item.id)}" class="mb-5 pb-5 border-bottom border-dark-subtle" data-aos="fade-up">
        <div class="row g-4 align-items-start">
          <div class="col-12 col-lg-5">
            <div class="text-muted small mb-2 text-uppercase">${esc(kicker)}</div>
            <h2 class="h1 mb-2">${esc(item.title)}</h2>
            ${item.subtitle ? `<h3 class="h5 text-secondary mb-3">${esc(item.subtitle)}</h3>` : ''}
            <ul class="list-inline mb-3">${metaList(item.meta)}</ul>
            ${mediaBlock(item)}
            ${embedBlock(item)}
            ${linksBlock(item.links)}
          </div>
          <div class="col-12 col-lg-7">
            ${cs && cs.overview ? `<p class="lead">${esc(cs.overview)}</p>` : (longText ? `<p class="lead">${esc(longText)}</p>` : '')}
            ${csQuoteBlock(cs)}
            <div class="row g-3">
              <div class="col-12 col-md-6">${csListSection('Obiettivi', cs && cs.goals, 'bi-bullseye')}</div>
              <div class="col-12 col-md-6">${csListSection('Sfide', cs && cs.challenges, 'bi-exclamation-triangle')}</div>
            </div>
            ${csListSection('Soluzione', cs && cs.solution, 'bi-lightbulb')}
            ${csResultsGrid(cs && cs.results)}
            ${csTools(cs && cs.tools)}
            ${!cs && detailText ? `<p>${esc(detailText)}</p>` : ''}
            <div class="mt-3">
              <a class="btn btn-primary btn-sm" href="PortfolioPost.html?id=${encodeURIComponent(item.id)}"><i class="bi bi-journal-text me-1"></i> Vedi pagina dettagli</a>
            </div>
            ${galleryBlock(item)}
          </div>
        </div>
      </article>
    `;
  }

  async function init() {
    const mount = document.getElementById('case-studies-container');
    if (!mount) return;

    const data = await loadContent();
    const items = (data && data.site && data.site.portfolio && data.site.portfolio.items) || [];
    if (!items.length) {
      mount.innerHTML = '<p style="color:#888">Nessun progetto disponibile.</p>';
      return;
    }

    // Piu' recenti in cima.
    items.sort((a, b) => {
      const ad = (a.meta && a.meta.date) ? String(a.meta.date) : '';
      const bd = (b.meta && b.meta.date) ? String(b.meta.date) : '';
      return bd.localeCompare(ad);
    });

    mount.innerHTML = items.map(renderCaseStudy).join('');

    // Gli embed diventano facade: nessun download finche' non si clicca.
    Array.from(mount.querySelectorAll('iframe[data-embed-url]')).forEach(iframe => {
      mountEmbedFacade(iframe, iframe.getAttribute('data-embed-url'));
    });

    wireLazyMedia(mount);

    try { GLightbox({ selector: '.portfolio-lightbox' }); } catch (_) {}
    try { AOS.refresh(); } catch (_) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
