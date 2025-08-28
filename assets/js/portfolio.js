// Placeholder per le diverse sezioni del portfolio
const portfolioData = [
  {
    id: 1,
    type: 'filter-model',
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    title: '3D Model Example',
    subtitle: 'Modellazione 3D',
    link: 'portfolio-details.html',
    isVideo: false
  },
  {
    id: 2,
    type: 'filter-archiviz',
    img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80',
    title: 'Archiviz Example',
    subtitle: 'Visualizzazione Architettonica',
    link: 'portfolio-details.html',
    isVideo: false
  },
  {
    id: 3,
    type: 'filter-render',
    img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    title: 'Render Example',
    subtitle: 'Rendering di Prodotto',
    link: 'portfolio-details.html',
    isVideo: false
  },
  {
    id: 4,
    type: 'filter-animation',
    img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
    title: 'Animation Example',
    subtitle: 'Animazione 3D',
    link: 'portfolio-details-video.html',
    isVideo: false
  },
  // Altri placeholder per mostrare più anteprime per sezione
  {
    id: 5,
    type: 'filter-model',
    img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
    title: '3D Model 2',
    subtitle: 'Modello Organico',
    link: 'portfolio-details.html',
    isVideo: false
  },
  {
    id: 6,
    type: 'filter-archiviz',
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    title: 'Archiviz 2',
    subtitle: 'Interni Moderni',
    link: 'portfolio-details.html',
    isVideo: false
  },
  {
    id: 7,
    type: 'filter-render',
    img: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
    title: 'Render 2',
    subtitle: 'Render Esterno',
    link: 'portfolio-details.html',
    isVideo: false
  },
  {
    id: 8,
    type: 'filter-animation',
    img: 'https://images.unsplash.com/photo-1468421870903-4df1664ac249?auto=format&fit=crop&w=400&q=80',
    title: 'Animation 2',
    subtitle: 'Animazione Prodotto',
    link: 'portfolio-details-video.html',
    isVideo: false
  }
];

const portfolioContainer = document.getElementById('portfolio-items');
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
        : `<img src="${item.img}" class="img-fluid" alt="">`
      }
      <a href="${detailLink}" data-glightbox="type: external" title="Portfolio Details" class="portfolio-info-link">
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
