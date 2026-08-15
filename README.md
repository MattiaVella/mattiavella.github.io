# mattiavella.github.io

Portfolio 3D di Mattia Vella (archiviz, render, modellazione, animazione).
Sito statico pubblicato con GitHub Pages, basato sul template Bootstrap
*MyResume*.

Online: **https://mattiavella.github.io**

---

## Il principio: un solo file di contenuti

Nessun progetto è scritto nell'HTML. Tutto viene da **`assets/data/content.json`**,
che le pagine leggono e trasformano in griglie, gallerie e case study.

```
assets/data/content.json
        │
        ├── site.title, site.contact, site.social ──► hero, contatti, footer
        │
        └── site.portfolio
              ├── filters ──► bottoni di filtro del portfolio
              └── items   ──► card, pagine di dettaglio, case study
```

Aggiungere un progetto significa aggiungere un oggetto a `items`. Non serve
toccare l'HTML.

La procedura completa sta in **[`assets/data/README.md`](assets/data/README.md)**.

---

## Le pagine

| Pagina | A cosa serve | Stato |
|---|---|---|
| `index.html` | Home: hero video, griglia portfolio filtrabile, contatti | **In uso** |
| `case-studies.html` | Elenco esteso dei progetti che hanno un `caseStudy` | **In uso** |
| `PortfolioPost.html` | Pagina di dettaglio completa di un progetto | **In uso** |
| `portfolio-details.html` | Dettaglio, layout alternativo più essenziale | Funzionante, non collegata |
| `portfolio-details-video.html` | Dettaglio pensato per i progetti video | Da rifare, contenuti finti |
| `torreManfriaPulita.html` | Viewer 3D SuperSplat (gaussian splat) | In uso, incorporato via iframe |

### index.html

Il video di sfondo dell'hero non ha un `<source>` nell'HTML: lo sceglie
`main.js` a runtime tra `Video.mp4` (1080p) e `Video_Mobile.mp4` (720p), in base
a dimensione schermo, `Save-Data` e velocità di rete. Rispetta anche
`prefers-reduced-motion`, nel qual caso resta fermo sul poster.

La griglia sotto è generata da `portfolio.js` e filtrata da Isotope.

### case-studies.html

Mostra solo i progetti che hanno il blocco `caseStudy` in `content.json`,
ordinati per `meta.date` dal più recente. Ogni scheda espone obiettivi, sfide,
soluzione, risultati numerici e strumenti.

### PortfolioPost.html

È la pagina di dettaglio **attualmente collegata**: tutte le card del portfolio
puntano qui, come `PortfolioPost.html?id=<id>`.

È anche la più ricca. Ogni sezione compare solo se i dati corrispondenti
esistono in `content.json`, altrimenti resta nascosta:

- copertina, titolo, sottotitolo, kicker
- meta (cliente, ruolo, data, tag)
- slider **Prima / Dopo** — se c'è `beforeAfter`
- **anteprima interattiva** in iframe — se c'è `embed`
- riferimenti esterni e collaboratori
- galleria a tutta larghezza con lightbox

### portfolio-details.html

Stesso meccanismo (`?id=<id>`), **layout diverso**: immagine a sinistra con il
titolo in grande sovrapposto, descrizione e galleria a destra. Nessun blocco
meta, prima/dopo, embed, link o collaboratori.

Funziona: aprendola con `?id=1` si popola correttamente. Semplicemente nessuna
pagina la linka. È il candidato naturale per i progetti che vogliono una scheda
visiva e asciutta, senza l'apparato del case study.

### portfolio-details-video.html

Pensata per i progetti video: il posto della copertina è preso da un `<video>` a
tutta larghezza.

**Va rifatta prima di usarla.** A differenza delle altre due non è guidata dai
dati: titolo, testo e galleria sono scritti a mano, con lorem ipsum, "RENDER
MOLTO BELLO" e "Titolo1". Le immagini puntano a `source.unsplash.com`, servizio
dismesso da Unsplash: oggi risponde **503**, quindi sono tutte rotte.

Il supporto lato codice però esiste già: quando un progetto ha
`media.type: "video"`, `portfolio.js` cerca un `<video>` dentro `section#about`
e ne imposta la sorgente. Basterebbe sostituire il contenuto fisso con gli
stessi `id` usati dalle altre pagine.

---

## Il routing per tipo di progetto (previsto, mai attivato)

Ogni progetto in `content.json` ha un campo **`contentType`** con tre valori
possibili: `Work`, `Post`, `Video`. Le tre pagine di dettaglio corrispondono a
questi tre casi.

L'intenzione era chiaramente indirizzare ogni progetto alla pagina giusta in
base al tipo. Il collegamento però non è mai stato scritto: `portfolio.js` legge
`contentType`, lo salva come `kind`, **e non lo usa mai**. Tutti i link portano
a `PortfolioPost.html`:

```js
function computeDetailLink(item) {
  return `PortfolioPost.html?id=${item.id}`;   // sempre la stessa pagina
}
```

Per attivare il routing basterebbe far dipendere questa funzione da
`item.kind` — ma prima va sistemata `portfolio-details-video.html`, altrimenti i
progetti video finirebbero su una pagina di segnaposto rotti.

---

## Struttura

```
├── index.html                    home
├── case-studies.html             elenco case study
├── PortfolioPost.html            dettaglio completo (in uso)
├── portfolio-details.html        dettaglio essenziale (non collegata)
├── portfolio-details-video.html  dettaglio video (da rifare)
├── torreManfriaPulita.html       viewer 3D SuperSplat (83 MB)
│
├── assets/
│   ├── data/
│   │   ├── content.json          ← l'unico file da modificare
│   │   ├── content.example.jsonc esempio commentato da copiare
│   │   ├── content.schema.json   schema per l'editor
│   │   └── README.md             come aggiungere un progetto
│   ├── js/
│   │   ├── site-content.js       helper condivisi (caricamento, escape, lazy, facade)
│   │   ├── portfolio.js          griglia + pagine di dettaglio
│   │   ├── case-studies.js       pagina case study
│   │   └── main.js               template + video hero adattivo
│   ├── css/style.css
│   ├── img/                      immagini (.jpg master + .webp servito)
│   ├── images/                   video dei progetti
│   └── Video/                    video dell'hero
│
├── scripts/
│   ├── optimize-images.mjs       genera i WebP con ffmpeg
│   └── validate-content.mjs      controlla content.json
└── .githooks/pre-commit          valida prima del commit
```

---

## Comandi

```bash
npm run optimize:images    # genera i .webp mancanti (serve ffmpeg)
npm run validate:content   # controlla content.json prima di pubblicare
npm run build:sitemap      # rigenera sitemap.xml dai progetti in content.json
npm run setup:hooks        # attiva l'hook pre-commit (una volta sola)
```

Nessuna dipendenza da installare: gli script usano solo Node e ffmpeg.

**Requisiti:** Node 18+ e [ffmpeg](https://ffmpeg.org/) nel PATH
(`winget install Gyan.FFmpeg`).

### Anteprima locale

Va usato un server HTTP: aprendo i file con `file://` il browser blocca il
`fetch` di `content.json` e il portfolio resta vuoto.

```bash
npx serve .
```

---

## Pubblicazione

GitHub Pages pubblica da `main`: **ogni push va online**, di solito entro un paio
di minuti.

```bash
npm run validate:content
git add -A && git commit -m "..." && git push
```

Dopo il deploy serve un refresh forzato (`Ctrl+F5`) per non vedere CSS e JS in
cache.

---

## Trappole note

Sono tutte cose che hanno già causato un bug su questo sito.

**Percorsi con i backslash.** `assets\images\render2.mp4` funziona in locale su
Windows ma dà 404 su GitHub Pages. Un video è rimasto rotto online per mesi
senza che nulla lo segnalasse. Il validatore ora lo intercetta.

**`background-color` su `#hero`.** Il video di sfondo ha `z-index: -1` e `#hero`
non crea uno stacking context, quindi il video viene dipinto nel contesto
radice: qualunque sfondo su `#hero` lo copre e il video sparisce. Il fondo scuro
lo mette già `body`.

**Punto e virgola dopo gli IIFE in `main.js`.** Senza, la parentesi del blocco
successivo viene letta come chiamata di funzione e quel blocco non viene mai
eseguito. È così che l'anno nel footer è rimasto vuoto a lungo.

**Immagini lazy dentro Isotope.** Isotope calcola le posizioni misurando le
altezze: se le immagini non sono ancora caricate misura 0 e la griglia si
sovrappone. Per questo `site-content.js` rilancia il layout a ogni `load`.

**La bio esiste in due posti.** Il testo è scritto sia in `index.html` sia in
`site.about` dentro `content.json`. Non è una svista: nell'HTML serve perché i
crawler e le anteprime dei link lo leggano senza eseguire JavaScript, nel JSON
perché resti modificabile dai contenuti. Il JSON vince a runtime, quindi
**modificando solo il JSON il sito appare giusto ma i motori continuano a
leggere il testo vecchio.** Vanno aggiornati entrambi.

Attenzione allo stesso schema per i contatti: lì l'HTML contiene segnaposto, non
testo vero, e vengono nascosti se il dato manca in `content.json`.

---

## Stato dei contenuti

`content.json` contiene ancora dati di esempio: email `email@example.com`,
telefono `+39 000 000 000`, social che puntano a `#` e due progetti segnaposto
con lorem ipsum. `npm run validate:content` li elenca come avvisi.

I filtri **Render** e **Animation** sono dichiarati ma nessun progetto usa quelle
categorie: cliccandoli la griglia resta vuota.
