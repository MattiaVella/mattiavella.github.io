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
  const galleryContainer = document.getElementById('portfolio-gallery');
  const mainImageEl = document.getElementById('portfolio-main-image');
  if (!galleryContainer && !mainImageEl) return;

  const params = new URLSearchParams(window.location.search);
  const idParam = params.get('id');
  const fallbackId = document.body && document.body.dataset && document.body.dataset.projectId;
  const projectId = idParam || fallbackId;
  if (!projectId) return;

  const project = portfolioData.find(p => String(p.id) === String(projectId));
  if (!project) return;

  // imposta immagine principale (se esiste l'elemento)
  if (mainImageEl) {
    mainImageEl.src = project.img;
    mainImageEl.alt = project.title;
  }

  // pulisci container
  if (galleryContainer) galleryContainer.innerHTML = '';

  // Genera dinamicamente la galleria in base alle immagini effettivamente esistenti
  const maxImages = 20; // massimo tentativi per evitare loop infiniti
  let foundImages = [];
  let loaded = 0;
  let checked = 0;

  function checkNextImage(idx) {
    if (idx > maxImages) {
      renderGallery();
      return;
    }
    const imgUrl = `assets/img/img${projectId}-${idx}.jpg`;
    const img = new window.Image();
    img.onload = function () {
      foundImages.push(imgUrl);
      checkNextImage(idx + 1);
    };
    img.onerror = function () {
      renderGallery();
    };
    img.src = imgUrl;
  }

  function renderGallery() {
    if (foundImages.length > 0 && galleryContainer) {
      const grid = document.createElement('div');
      grid.className = 'row';
      foundImages.forEach((imgUrl, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-6 mb-3';
        col.innerHTML = `
          <a href="${imgUrl}" class="portfolio-lightbox" data-gallery="portfolioGallery" title="${project.title} - ${index + 1}">
            <img src="${imgUrl}" class="img-fluid" alt="${project.title} ${index + 1}">
          </a>
        `;
        grid.appendChild(col);
      });
      galleryContainer.appendChild(grid);
      try {
        if (typeof GLightbox === 'function') {
          if (!window._portfolioLightbox) {
            window._portfolioLightbox = GLightbox({ selector: '.portfolio-lightbox' });
          } else {
            window._portfolioLightbox.reload();
          }
        }
      } catch (e) {}
    } else if (galleryContainer) {
      galleryContainer.innerHTML = '<p>Nessuna immagine aggiuntiva disponibile per questo progetto.</p>';
    }
  }

  // Avvia la ricerca delle immagini della galleria
  checkNextImage(1);
})();
