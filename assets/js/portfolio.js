// portfolio.js — contenuti da assets/data/content.json
(function () {
  "use strict";

  // Utils
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  async function loadContent() {
    if (window.__contentJSON) return window.__contentJSON;
    try {
      const res = await fetch('assets/data/content.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      window.__contentJSON = json;
      return json;
    } catch (err) {
      console.error('[portfolio] Impossibile caricare content.json:', err);
      const fallback = { site: { portfolio: { filters: [{ label: 'All', filter: '*' }], items: [] }, title: 'Portfolio' } };
      window.__contentJSON = fallback;
      return fallback;
    }
  }

  function normalizeItems(items) {
    return (items || []).map(it => ({
      id: it.id,
      type: it.filter, // classe filtro Isotope, es: 'filter-model'
      img: it.media && it.media.src ? it.media.src : '',
      mediaType: it.media && it.media.type ? it.media.type : 'image',
      title: it.title || '',
      subtitle: it.subtitle || '',
      about: it.about || it.aboutText || '',
      aboutText: it.aboutText || it.about || '',
      dynamicParagraph: it.dynamicParagraph || '',
      kind: it.kind || 'Work', // Work | Post | Video
      gallery: Array.isArray(it.gallery) ? it.gallery : []
    }));
  }

  function computeDetailLink(item) {
    let page = 'portfolio-details.html';
    if (item.kind === 'Post') page = 'PortfolioPost.html';
    if (item.kind === 'Video') page = 'portfolio-details-video.html';
    return `${page}?id=${item.id}`;
  }

  function populateFilters(filters) {
    const ul = $('#portfolio-flters');
    if (!ul) return;
    ul.innerHTML = '';
    const base = document.createElement('li');
    base.textContent = 'All';
    base.dataset.filter = '*';
    base.className = 'filter-active';
    ul.appendChild(base);
    (filters || []).filter(f => f.filter !== '*').forEach(f => {
      const li = document.createElement('li');
      li.textContent = f.label;
      li.dataset.filter = f.filter;
      ul.appendChild(li);
    });
  }

  function populateIndex(items) {
    const container = document.getElementById('portfolio-items');
    if (!container) return;
    container.innerHTML = '';
    items.forEach(item => {
      const col = document.createElement('div');
      col.className = `col-lg-4 col-md-6 portfolio-item ${item.type || ''}`;
      const detailLink = computeDetailLink(item);
      const mediaHTML = item.mediaType === 'video'
        ? `<video class="img-fluid" autoplay loop muted><source src="${item.img}" type="video/mp4" /></video>`
        : `<img src="${item.img}" class="img-fluid" alt="${item.title}">`;
      col.innerHTML = `
        <div class="portfolio-wrap">
          ${mediaHTML}
          <a href="${detailLink}" title="Portfolio Details" class="portfolio-info-link">
            <div class="portfolio-info">
              <h4>${item.title}</h4>
            </div>
          </a>
        </div>
      `;
      container.appendChild(col);
    });

    // Prova a notificare Isotope (sia subito che onload)
    const notify = () => {
      try {
        const first = document.querySelector('#portfolio-flters li.filter-active') || document.querySelector('#portfolio-flters li');
        if (first) first.dispatchEvent(new Event('click'));
      } catch (_) {}
    };
    notify();
    window.addEventListener('load', notify, { once: true });
  }

  function initIsotopeAndFiltersIfNeeded() {
    try {
      const container = document.querySelector('.portfolio-container');
      if (!container || typeof Isotope === 'undefined') return;
      if (!window._portfolioIsotope) {
        window._portfolioIsotope = new Isotope(container, { itemSelector: '.portfolio-item' });
      } else {
        window._portfolioIsotope.reloadItems();
        window._portfolioIsotope.arrange();
      }
      const filterEls = $$('#portfolio-flters li');
      if (filterEls.length) {
        // Rimuovi eventuali listener duplicati ricreando i nodi (opzionale) oppure usa capture unique
        filterEls.forEach(li => {
          li.addEventListener('click', function (e) {
            e.preventDefault();
            filterEls.forEach(x => x.classList.remove('filter-active'));
            this.classList.add('filter-active');
            window._portfolioIsotope.arrange({ filter: this.getAttribute('data-filter') });
            try { AOS.refresh(); } catch (_) {}
          }, { once: false });
        });
      }
    } catch (_) {}
  }

  function getProjectId() {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    const fallbackId = document.body && document.body.dataset && document.body.dataset.projectId;
    return idParam || fallbackId;
  }

  function populateDetailsBasics(project) {
    const mainImageEl = document.getElementById('portfolio-main-image');
    if (mainImageEl && project) {
      if (project.mediaType === 'video') {
        // sostituisci l'immagine con un video con controls
        const video = document.createElement('video');
        video.style.width = '100%';
        video.style.display = 'block';
        video.style.objectFit = 'cover';
        video.style.maxHeight = mainImageEl.style.maxHeight || '480px';
        video.controls = true;
        const src = document.createElement('source');
        src.src = project.img;
        src.type = 'video/mp4';
        video.appendChild(src);
        mainImageEl.replaceWith(video);
      } else {
        mainImageEl.src = project.img;
        mainImageEl.alt = project.title;
        mainImageEl.style.width = '100%';
        mainImageEl.style.display = 'block';
        mainImageEl.style.objectFit = 'cover';
        mainImageEl.style.maxHeight = mainImageEl.style.maxHeight || '480px';
        mainImageEl.style.height = 'auto';
      }
    } else if (project && project.mediaType === 'video') {
      // Pagina video: prova a impostare un video principale esistente
      const mainVideo = document.getElementById('portfolio-main-video') || document.querySelector('section#about video');
      if (mainVideo) {
        let source = mainVideo.querySelector('source');
        if (!source) {
          source = document.createElement('source');
          mainVideo.appendChild(source);
        }
        source.src = project.img;
        source.type = 'video/mp4';
        try { mainVideo.load(); } catch(_) {}
      }
    }

    const titleEl = document.getElementById('dynamic-title') || document.getElementById('portfolio-title');
    if (titleEl) titleEl.textContent = project ? (project.title || '') : '';

    const aboutTextEl = document.getElementById('portfolio-about-text');
    if (aboutTextEl) aboutTextEl.textContent = project ? (project.aboutText || project.about || '') : '';

    const descEl = document.getElementById('portfolio-description');
    if (descEl) descEl.textContent = project ? (project.subtitle || '') : '';

    if (project && project.title) document.title = project.title + ' - Portfolio Details';
  }

  function initLightbox() {
    try {
      if (typeof GLightbox === 'function') {
        if (!window._portfolioLightbox) {
          window._portfolioLightbox = GLightbox({ selector: '.portfolio-lightbox' });
        } else if (window._portfolioLightbox.reload) {
          window._portfolioLightbox.reload();
        }
      }
    } catch (_) {}
  }

  function populateDetailsGallery(project) {
    const galleryContainer = document.getElementById('portfolio-gallery');
    if (!galleryContainer || !project) return;
    galleryContainer.innerHTML = '';

    const imgs = (project.gallery && project.gallery.length > 0) ? project.gallery : [];
    if (imgs.length === 0) {
      galleryContainer.innerHTML = '<p>Nessuna immagine aggiuntiva disponibile per questo progetto.</p>';
      return;
    }

    imgs.forEach((imgUrl, index) => {
      const col = document.createElement('div');
      const colClass = 'col-lg-4 col-md-6';
      col.className = `${colClass} portfolio-item ${project.type || 'filter-app'}`;
      col.innerHTML = `
        <div class="portfolio-wrap">
          <img src="${imgUrl}" class="img-fluid" alt="${project.title} ${index + 1}">
          <div class="portfolio-info">
            <h4>${project.title}</h4>
            <p>Galleria</p>
            <div class="portfolio-links">
              <a href="${imgUrl}" data-gallery="portfolioGallery" class="portfolio-lightbox"><i class="bx bx-plus"></i></a>
            </div>
          </div>
        </div>
      `;
      galleryContainer.appendChild(col);
    });

    initLightbox();
  }

  function applySiteMeta(site) {
    if (!site) return;
    if (site.title) {
      const heroH1 = $('#hero h1');
      if (heroH1) heroH1.textContent = site.title;
      const footerH3 = $('#footer h3');
      if (footerH3) footerH3.textContent = site.title;
      if (!/ - /.test(document.title)) document.title = site.title;
    }
    const social = site.social || {};
    const setHref = (cls, url) => {
      if (!url) return;
      $$("a." + cls).forEach(a => { a.href = url; a.target = '_blank'; });
    };
    setHref('facebook', social.facebook);
    setHref('instagram', social.instagram);
    setHref('linkedin', social.linkedin);
  }

  (async function init() {
    const content = await loadContent();
    applySiteMeta(content?.site);

    const items = normalizeItems(content?.site?.portfolio?.items);

    // Compat per script inline esistenti
    window.portfolioImages = items.map(item => ({
      id: item.id,
      src: item.img,
      title: item.title,
      subtitle: item.subtitle,
      about: item.about,
      aboutText: item.aboutText,
      dynamicParagraph: item.dynamicParagraph,
      type: item.type,
      gallery: (item.gallery || []).map(g => ({ src: g }))
    }));

    // Home
    populateFilters(content?.site?.portfolio?.filters || []);
  populateIndex(items);
  initIsotopeAndFiltersIfNeeded();

    // Messaggio utile se non ci sono item (es. fetch bloccato in file://)
    if ((items || []).length === 0) {
      const container = document.getElementById('portfolio-items');
      if (container) {
        const msg = document.createElement('div');
        msg.className = 'col-12';
        msg.style.color = '#888';
        msg.style.textAlign = 'center';
        msg.style.padding = '1rem 0';
        msg.innerText = 'Nessun item trovato. Se stai aprendo il file direttamente, avvia un server locale per consentire il caricamento di assets/data/content.json.';
        container.appendChild(msg);
      }
    }

    // Dettagli
    const projectId = getProjectId();
    if (projectId) {
      const project = items.find(p => String(p.id) === String(projectId));
      if (project) {
        populateDetailsBasics(project);
        const paraEl = document.getElementById('dynamic-paragraph') || document.getElementById('portfolio-dynamic-paragraph');
        if (paraEl) paraEl.textContent = project.dynamicParagraph || project.about || '';
        populateDetailsGallery(project);
      }
    }
  })();
})();
