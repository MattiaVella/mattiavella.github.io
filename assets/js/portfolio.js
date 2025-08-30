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
    return (items || []).map(it => {
      // Supporto nuove chiavi più chiare mantenendo compatibilità con le vecchie
      const category = it.category || (typeof it.filter === 'string' ? it.filter.replace(/^filter-/, '') : undefined);
      const filterClass = category ? `filter-${category}` : it.filter;
      const contentType = it.contentType || it.kind || 'Work';
      const description = it.description || it.about || it.aboutText || '';
      const longDescription = it.longDescription || it.aboutText || it.about || it.description || '';
      const details = it.details || it.dynamicParagraph || '';
      const media = it.media || {};
  const beforeAfter = it.beforeAfter || (it.before && it.after ? { before: it.before, after: it.after } : null);

      return {
        id: it.id,
        type: filterClass, // classe filtro Isotope, es: 'filter-model'
        img: media && media.src ? media.src : '',
        mediaType: media && media.type ? media.type : 'image',
        title: it.title || '',
        subtitle: it.subtitle || '',
        about: description,
        aboutText: longDescription,
        dynamicParagraph: details,
        kind: contentType, // Work | Post | Video
        gallery: Array.isArray(it.gallery) ? it.gallery : [],
        meta: it.meta || null, // { client, date, role, tags: [] }
        links: Array.isArray(it.links) ? it.links : [], // [{label, url, icon?}]
  collaborators: Array.isArray(it.collaborators) ? it.collaborators : [], // [{name, role?, url?}]
  beforeAfter
      };
    });
  }

  function computeDetailLink(item) {
  return `PortfolioPost.html?id=${item.id}`;
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

    // Sottotitolo
    const subtitleEl = document.getElementById('dynamic-subtitle');
    if (subtitleEl) subtitleEl.textContent = project.subtitle || '';

    // Kicker (categoria/tag breve)
    const kickerEl = document.getElementById('project-kicker');
    if (kickerEl) {
      let kicker = '';
      // Prova dai tag meta
      if (project.meta && Array.isArray(project.meta.tags) && project.meta.tags.length) {
        kicker = project.meta.tags[0];
      }
      // In fallback usa la classe filtro
      if (!kicker && project.type) {
        const map = {
          'filter-model': '3D Model',
          'filter-archiviz': 'Archiviz',
          'filter-render': 'Render',
          'filter-animation': 'Animation'
        };
        kicker = map[project.type] || 'Project';
      }
      kickerEl.textContent = kicker;
      kickerEl.style.display = kicker ? '' : 'none';
    }

    // Meta
    const metaUl = document.getElementById('project-meta');
    if (metaUl) {
      metaUl.innerHTML = '';
      const m = project.meta || {};
      const parts = [];
      if (m.client) parts.push(`<li class="list-inline-item me-3"><i class="bi bi-building me-1"></i><span>${m.client}</span></li>`);
      if (m.role) parts.push(`<li class="list-inline-item me-3"><i class="bi bi-person-badge me-1"></i><span>${m.role}</span></li>`);
      if (m.date) parts.push(`<li class="list-inline-item me-3"><i class="bi bi-calendar-event me-1"></i><span>${m.date}</span></li>`);
      if (Array.isArray(m.tags) && m.tags.length) {
        const tags = m.tags.map(t => `<span class="badge rounded-pill bg-secondary-subtle text-secondary me-1">${t}</span>`).join('');
        parts.push(`<li class="list-inline-item">${tags}</li>`);
      }
      metaUl.innerHTML = parts.join('');
    }

    // Links
    // Case Study deep-link
    const csBtn = document.getElementById('case-study-link');
    if (csBtn && project && project.id != null) {
      csBtn.href = `case-studies.html#cs-${project.id}`;
      csBtn.style.display = '';
    } else if (csBtn) {
      csBtn.style.display = 'none';
    }
    const linksRow = document.getElementById('project-links');
    if (linksRow) {
      linksRow.innerHTML = '';
      (project.links || []).forEach(link => {
        if (!link || !link.url) return;
        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-lg-4';
        const icon = link.icon ? `<i class="bi ${link.icon} me-1"></i>` : '<i class="bi bi-link-45deg me-1"></i>';
        col.innerHTML = `
          <a class="card link-card h-100" href="${link.url}" target="_blank" rel="noopener">
            <div class="card-body d-flex align-items-center">
              ${icon}
              <span>${link.label || link.url}</span>
            </div>
          </a>
        `;
        linksRow.appendChild(col);
      });
      if (!linksRow.children.length) {
        const wrapper = linksRow.parentElement; // contains heading + row
        if (wrapper) wrapper.style.display = 'none';
      }
    }

    // Collaborators
    const collabRow = document.getElementById('project-collaborators');
    if (collabRow) {
      collabRow.innerHTML = '';
      (project.collaborators || []).forEach(c => {
        if (!c || !c.name) return;
        const col = document.createElement('div');
        col.className = 'col-12 col-sm-6 col-lg-4';
        const inner = document.createElement(c.url ? 'a' : 'div');
        inner.className = 'card collaborator-card h-100';
        if (c.url) { inner.href = c.url; inner.target = '_blank'; inner.rel = 'noopener'; }
        inner.innerHTML = `
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="avatar-circle me-3"><i class="bi bi-person"></i></div>
              <div>
                <div class="fw-semibold">${c.name}</div>
                ${c.role ? `<div class="text-muted small">${c.role}</div>` : ''}
              </div>
            </div>
          </div>
        `;
        col.appendChild(inner);
        collabRow.appendChild(col);
      });
      if (!collabRow.children.length) {
        const wrapper = collabRow.parentElement;
        if (wrapper) wrapper.style.display = 'none';
      }
    }
  }

  function populateEmbed(project) {
    const section = document.getElementById('project-embed-section');
    const iframe = document.getElementById('project-embed-iframe');
    const link = document.getElementById('project-embed-link');
    const label = document.getElementById('project-embed-label');
    if (!section || !iframe || !link || !label) return;
    const e = project && project.embed;
    if (e && e.url) {
      iframe.src = e.url;
      link.href = e.url;
      label.textContent = e.label || 'Apri a schermo intero';
      section.style.display = '';
    } else {
      section.style.display = 'none';
      iframe.removeAttribute('src');
    }
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
    const gallerySection = document.getElementById('portfolio-fullwidth') || galleryContainer.closest('section');
    galleryContainer.innerHTML = '';

    const imgs = (project.gallery && project.gallery.length > 0) ? project.gallery : [];
    if (imgs.length === 0) {
      if (gallerySection) gallerySection.style.display = 'none';
      return;
    }

    // Ensure section is visible if there are images
    if (gallerySection) gallerySection.style.display = '';

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

  // Before/After slider
  function populateBeforeAfter(project) {
    const section = document.getElementById('before-after-section');
    const mount = document.getElementById('before-after');
    if (!section || !mount) return;

    // Render only if explicit before/after provided in content.json
    if (!(project && project.beforeAfter && project.beforeAfter.before && project.beforeAfter.after)) {
      section.style.display = 'none';
      mount.innerHTML = '';
      return;
    }

    const beforeSrc = project.beforeAfter.before;
    const afterSrc = project.beforeAfter.after;

    section.style.display = '';

    mount.innerHTML = `
      <img class="ba-img ba-before" src="${beforeSrc}" alt="Prima" />
      <img class="ba-img ba-after" src="${afterSrc}" alt="Dopo" />
      <span class="ba-label before">Prima</span>
      <span class="ba-label after">Dopo</span>
      <div class="ba-handle" aria-hidden="true"></div>
      <div class="ba-grip" aria-hidden="true"><i class="bi bi-arrows-left-right"></i></div>
      <input class="ba-range" type="range" min="0" max="100" value="50" aria-label="Slider Prima/Dopo" />
    `;

    const afterImg = mount.querySelector('.ba-after');
    const handle = mount.querySelector('.ba-handle');
    const grip = mount.querySelector('.ba-grip');
    const range = mount.querySelector('.ba-range');

    const setSplit = (pct) => {
      const p = Math.max(0, Math.min(100, Number(pct)));
      afterImg.style.clipPath = `inset(0 0 0 ${p}%)`;
      handle.style.left = p + '%';
      grip.style.left = p + '%';
    };

    range.addEventListener('input', (e) => setSplit(e.target.value));

    let dragging = false;
    const updateFromPointer = (clientX) => {
      const rect = mount.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      setSplit(pct);
      range.value = String(Math.max(0, Math.min(100, pct)));
    };
    const start = (e) => {
      dragging = true;
      try { mount.setPointerCapture(e.pointerId); } catch(_) {}
      updateFromPointer(e.clientX);
    };
    const move = (e) => { if (dragging) updateFromPointer(e.clientX); };
    const end = (e) => { dragging = false; try { mount.releasePointerCapture(e.pointerId); } catch(_) {} };

    mount.addEventListener('pointerdown', start);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);

    // Initialize position
    setSplit(50);
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

    // Contatti dinamici
    const contact = site.contact || {};
    const locVal = document.getElementById('contact-location-value');
    const locLink = document.getElementById('contact-location-link');
    if (contact.location && locVal) locVal.textContent = contact.location;
    if (contact.locationUrl && locLink) {
      locLink.href = contact.locationUrl;
      locLink.setAttribute('aria-label', 'Apri mappa per ' + (contact.location || ''));
      locLink.target = '_blank';
      locLink.rel = 'noopener';
    }
    const emailVal = document.getElementById('contact-email-value');
    const emailLink = document.getElementById('contact-email-link');
    if (contact.email && emailVal) emailVal.textContent = contact.email;
    if (contact.email && emailLink) {
      emailLink.href = 'mailto:' + contact.email;
      emailLink.setAttribute('aria-label', 'Scrivi a ' + contact.email);
    }
    const phoneVal = document.getElementById('contact-phone-value');
    const phoneLink = document.getElementById('contact-phone-link');
    if (contact.phone && phoneVal) phoneVal.textContent = contact.phone;
    if (contact.phone && phoneLink) {
      const tel = String(contact.phone).replace(/\s+/g, '');
      phoneLink.href = 'tel:' + tel;
      phoneLink.setAttribute('aria-label', 'Chiama ' + contact.phone);
    }
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
        // Prima/Dopo (mostra solo se specificato nel content.json)
        try { populateBeforeAfter(project); } catch(_) {}
        populateDetailsGallery(project);
  // Iframe embed opzionale
  try { populateEmbed(project); } catch(_) {}
      }
    }
  })();
})();
