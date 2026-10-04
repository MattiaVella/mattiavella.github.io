/**
 * Helper condivisi da tutte le pagine che leggono assets/data/content.json.
 *
 * Sta qui quello che serviva in piu' di un posto: caricamento del JSON, escape
 * dei testi, lazy loading e facade dell'embed 3D. Prima questa logica era
 * duplicata tra portfolio.js e lo script inline di case-studies.html, con il
 * risultato che una correzione copriva solo una pagina.
 *
 * Espone window.SiteContent invece di usare i moduli ES, per non cambiare il
 * modo in cui gli script sono inclusi nelle pagine.
 */
(function (global) {
  'use strict';

  /** Evita che virgolette o < nei testi di content.json rompano l'HTML generato. */
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** Carica content.json una sola volta per pagina. */
  async function loadContent() {
    if (global.__contentJSON) return global.__contentJSON;
    try {
      const res = await fetch('assets/data/content.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      global.__contentJSON = await res.json();
    } catch (err) {
      console.error('[content] Impossibile caricare content.json:', err);
      global.__contentJSON = { site: { title: 'Portfolio', portfolio: { filters: [], items: [] } } };
    }
    return global.__contentJSON;
  }

  /**
   * Isotope posiziona gli item misurandone l'altezza: con le immagini lazy
   * l'altezza e' 0 al primo layout, quindi va ricalcolato a ogni load.
   */
  function relayoutIsotope() {
    try {
      if (global._portfolioIsotope) global._portfolioIsotope.layout();
    } catch (_) {}
  }

  /**
   * Rende sicuro il lazy loading dentro un contenitore: ricalcola il layout a
   * ogni immagine caricata e fa partire i video solo quando entrano in vista.
   */
  function wireLazyMedia(container) {
    if (!container) return;

    Array.from(container.querySelectorAll('img')).forEach(img => {
      if (img.complete) return;
      img.addEventListener('load', relayoutIsotope, { once: true });
      img.addEventListener('error', relayoutIsotope, { once: true });
    });

    const videos = Array.from(container.querySelectorAll('video[data-autoplay-inview]'));
    if (!videos.length) return;

    if (!('IntersectionObserver' in global)) {
      videos.forEach(v => { try { const p = v.play(); if (p && p.catch) p.catch(() => {}); } catch (_) {} });
      return;
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const v = entry.target;
        if (entry.isIntersecting) {
          try { const p = v.play(); if (p && p.catch) p.catch(() => {}); } catch (_) {}
        } else {
          try { v.pause(); } catch (_) {}
        }
      });
    }, { rootMargin: '200px 0px' });

    videos.forEach(v => {
      v.addEventListener('loadeddata', relayoutIsotope, { once: true });
      io.observe(v);
    });
  }

  /**
   * Sostituisce il caricamento immediato di un iframe con un pulsante.
   * Il viewer 3D pesa decine di MB: senza questo parte all'apertura della
   * pagina anche per chi non lo guardera' mai.
   */
  function mountEmbedFacade(iframe, url, poster) {
    if (!iframe || !url) return;
    const wrap = iframe.closest('.embed-wrap') || iframe.parentElement;
    if (!wrap || wrap.querySelector('.embed-facade')) return;

    try { iframe.removeAttribute('src'); } catch (_) {}

    if (isVideoFile(url)) {
      mountLocalVideo(wrap, iframe, url, poster);
      return;
    }

    const video = youtubeId(url);
    const src = video
      ? `https://www.youtube-nocookie.com/embed/${video}?autoplay=1&rel=0`
      : url;

    const facade = document.createElement('button');
    facade.type = 'button';
    facade.className = 'embed-facade';
    facade.innerHTML = video
      ? '<span class="embed-facade-icon"><i class="bi bi-play-circle"></i></span>' +
        '<span class="embed-facade-text">Guarda il video</span>' +
        '<span class="embed-facade-hint">Il player YouTube si carica solo quando lo apri.</span>'
      : '<span class="embed-facade-icon"><i class="bi bi-badge-3d"></i></span>' +
        '<span class="embed-facade-text">Carica anteprima interattiva</span>' +
        '<span class="embed-facade-hint">Modello 3D pesante: parte solo quando lo apri.</span>';

    if (video) {
      // La copertina arriva da YouTube: nessuna immagine da tenere nel repo.
      facade.style.backgroundImage = `url("https://i.ytimg.com/vi/${video}/hqdefault.jpg")`;
      facade.classList.add('embed-facade-thumb');
    }

    facade.addEventListener('click', () => {
      // YouTube rifiuta la riproduzione (errore 153) se non riceve il referrer
      // e non puo' verificare il dominio che incorpora. L'iframe nasce con
      // "no-referrer" per il viewer 3D: sui video va allentato.
      if (video) iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.src = src;
      facade.remove();
    }, { once: true });

    wrap.appendChild(facade);
  }

  /** Video ospitato nel repository (es. assets/Video/spot.mp4). */
  function isVideoFile(url) {
    return /\.(mp4|webm)(?:[?#].*)?$/i.test(String(url || ''));
  }

  /**
   * Al posto dell'iframe mette un <video> nativo. Con preload="metadata" il
   * browser scarica solo l'intestazione: il resto parte quando si preme play.
   * Il riquadro prende le proporzioni reali del video, cosi' un formato piu'
   * largo del 16:9 non mostra bande nere.
   */
  function mountLocalVideo(wrap, iframe, url, poster) {
    const video = document.createElement('video');
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    if (poster) video.poster = poster;
    video.style.cssText = 'width:100%; height:100%; object-fit:cover; background:#0f0f0f;';
    video.src = url;
    video.addEventListener('loadedmetadata', () => {
      if (video.videoWidth && video.videoHeight) {
        wrap.style.setProperty('--bs-aspect-ratio', `${(video.videoHeight / video.videoWidth) * 100}%`);
      }
    }, { once: true });
    iframe.replaceWith(video);
  }

  /**
   * Estrae l'id da un link YouTube (watch, youtu.be, shorts, embed).
   * Restituisce null per qualsiasi altro url, cosi' l'embed 3D resta invariato.
   */
  function youtubeId(url) {
    const m = String(url || '').match(
      /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    return m ? m[1] : null;
  }

  /** Attributi di lazy loading: le prime immagini restano eager (sopra la piega). */
  function lazyAttrs(index, eagerCount) {
    const limit = typeof eagerCount === 'number' ? eagerCount : 3;
    return index < limit ? 'decoding="async"' : 'loading="lazy" decoding="async"';
  }

  global.SiteContent = {
    esc: esc,
    loadContent: loadContent,
    relayoutIsotope: relayoutIsotope,
    wireLazyMedia: wireLazyMedia,
    mountEmbedFacade: mountEmbedFacade,
    youtubeId: youtubeId,
    isVideoFile: isVideoFile,
    lazyAttrs: lazyAttrs
  };
})(window);
