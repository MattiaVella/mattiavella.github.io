// portfolio.js — versione estesa con galleria per id = 1
// Dati portfolio (aggiungi/ modifica URL immagini come preferisci)
const portfolioData = [
  {
    id: 1,
    type: 'filter-model',
    img: 'assets/img/img1.jpg',
    title: '3D Model Example',
    subtitle: 'Modellazione 3D',
    link: 'portfolio-details.html',
    isVideo: false,
    // galleria aggiuntiva per il progetto id=1
    gallery: [
      'assets/img/img1-1.jpg',
      'assets/img/img1-2.jpg',
      'assets/img/img1-3.jpg'
    ]
  },
  {
    id: 2,
    type: 'filter-archiviz',
    img: 'assets/img/img2.jpg',
    title: 'Archiviz Example',
    subtitle: 'Visualizzazione Architettonica',
    link: 'portfolio-details.html',
    isVideo: false,
    gallery: [
      'assets/img/img2-1.jpg',
      'assets/img/img2-2.jpg'
    ]
  },
  {
    id: 3,
    type: 'filter-render',
    img: 'assets/img/img3.jpg',
    title: 'Render Example',
    subtitle: 'Rendering di Prodotto',
    link: 'portfolio-details.html',
    isVideo: false,
    gallery: [
      'assets/img/img3-1.jpg',
      'assets/img/img3-2.jpg'
    ]
  },
  {
    id: 4,
    type: 'filter-animation',
    img: 'assets/img/img4.jpg',
    title: 'Animation Example',
    subtitle: 'Animazione 3D',
    link: 'portfolio-details-video.html',
    isVideo: false,
    gallery: [
      'assets/img/img4-1.jpg'
    ]
  },
  {
    id: 5,
    type: 'filter-model',
    img: 'assets/img/img5.jpg',
    title: '3D Model 2',
    subtitle: 'Modello Organico',
    link: 'portfolio-details.html',
    isVideo: false,
    gallery: [
      'assets/img/img5-1.jpg'
    ]
  },
  {
    id: 6,
    type: 'filter-archiviz',
    img: 'assets/img/img6.jpg',
    title: 'Archiviz 2',
    subtitle: 'Interni Moderni',
    link: 'portfolio-details.html',
    isVideo: false,
    gallery: [
      'assets/img/img6-1.jpg'
    ]
  },
  {
    id: 7,
    type: 'filter-render',
    img: 'assets/img/img7.jpg',
    title: 'Render 2',
    subtitle: 'Render Esterno',
    link: 'portfolio-details.html',
    isVideo: false,
    gallery: [
      'assets/img/img7-1.jpg'
    ]
  },
  {
    id: 8,
    type: 'filter-animation',
    img: 'assets/img/img8.jpg',
    title: 'Animation 2',
    subtitle: 'Animazione Prodotto',
    link: 'portfolio-details-video.html',
    isVideo: false,
    gallery: [
      'assets/img/img8-1.jpg'
    ]
  }
];

// Esponi la struttura compatibile con portfolio-details.html (window.portfolioImages)
window.portfolioImages = portfolioData.map(item => ({
  id: item.id,
  src: item.img,
  title: item.title,
  subtitle: item.subtitle,
  link: item.link,
  isVideo: item.isVideo,
  gallery: (item.gallery || []).map(g => ({ src: g })) // array di oggetti {src: ...}
}));

/* --- Popola la index (se presente #portfolio-items) --- */
(function populateIndexIfNeeded() {
  const portfolioContainer = document.getElementById('portfolio-items');
  if (!portfolioContainer) return;

  portfolioData.forEach(item => {
    const col = document.createElement('div');
    col.className = `col-lg-4 col-md-6 portfolio-item ${item.type}`;
    const detailLink = `${item.link}?id=${item.id}`;
    col.innerHTML = `
      <div class="portfolio-wrap">
        ${item.isVideo
          ? `<video class="img-fluid" autoplay loop muted>
               <source src="${item.img}" type="video/mp4" />
             </video>`
          : `<img src="${item.img}" class="img-fluid" alt="${item.title}">`
        }
        <a href="${detailLink}" title="Portfolio Details" class="portfolio-info-link">
          <div class="portfolio-info">
            <h4>${item.title}</h4>
            <p>${item.subtitle}</p>
            <div class="portfolio-links">
              <i class="bx bx-plus"></i>
            </div>
          </div>
        </a>
      </div>
    `;
    portfolioContainer.appendChild(col);
  });
})();


/* --- Popola la pagina dei dettagli: immagine principale + galleria (se esiste #portfolio-gallery) --- */
(function populateDetailsGalleryIfNeeded() {
  const galleryContainer = document.getElementById('portfolio-gallery'); // usato nella tua pagina
  const mainImageEl = document.getElementById('portfolio-main-image'); // opzionale: immagine principale
  if (!galleryContainer && !mainImageEl) return; // non siamo sulla pagina dei dettagli

  // preleva id dalla query string: ?id=1
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id');

  // se non c'è id, prova a leggere data-id dall'HTML (es. <body data-project-id="1">)
  const fallbackId = document.body && document.body.dataset && document.body.dataset.projectId;
  const projectId = idParam || fallbackId;

  if (!projectId) return;

  const project = portfolioData.find(p => String(p.id) === String(projectId));
  if (!project) return;

  // imposta immagine principale (se esiste l'elemento)
  if (mainImageEl) {
    if (project.isVideo) {
      // se vuoi, puoi gestire il video qui; per ora mettiamo l'immagine cover
      mainImageEl.src = project.img;
      mainImageEl.alt = project.title;
    } else {
      mainImageEl.src = project.img;
      mainImageEl.alt = project.title;
    }
  }

  // pulisci container
  if (galleryContainer) galleryContainer.innerHTML = '';

  // se ci sono immagini nella galleria, popolale come miniature cliccabili (lightbox-friendly)
  const galleryImgs = project.gallery || [];
  if (galleryImgs.length > 0 && galleryContainer) {
    // crea wrapper
    const grid = document.createElement('div');
    grid.className = 'row';

    galleryImgs.forEach((imgItem, index) => {
      // Supporta sia stringhe che oggetti {src: ...}
      const imgUrl = typeof imgItem === 'string' ? imgItem : imgItem.src;
      const col = document.createElement('div');
      col.className = 'col-md-4 col-6 mb-3';

      // usa <a> con href verso immagine completa; se usi GLightbox o similare, aggiungi attributi
      col.innerHTML = `
        <a href="${imgUrl}" class="portfolio-lightbox" data-gallery="portfolioGallery" title="${project.title} - ${index + 1}">
          <img src="${imgUrl}" class="img-fluid" alt="${project.title} ${index + 1}">
        </a>
      `;
      grid.appendChild(col);
    });

    galleryContainer.appendChild(grid);

    // se hai GLightbox incluso nella pagina, inizializza (verifica che GLightbox sia caricato)
    try {
      if (typeof GLightbox === 'function') {
        // istanzia solo una volta
        if (!window._portfolioLightbox) {
          window._portfolioLightbox = GLightbox({ selector: '.portfolio-lightbox' });
        } else {
          window._portfolioLightbox.reload();
        }
      }
    } catch (e) {
      // GLightbox non disponibile: link aprirà immagine a grandezza naturale
      // non fare nulla
    }
  } else {
    // nessuna galleria definita: opzionale - mostra solo immagine principale o un messaggio
    if (galleryContainer) {
      galleryContainer.innerHTML = '<p>Nessuna immagine aggiuntiva disponibile per questo progetto.</p>';
    }
  }
})();
