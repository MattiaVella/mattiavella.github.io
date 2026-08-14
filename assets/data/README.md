# Come aggiungere un progetto

Tutto il sito è generato da `content.json`. Non serve toccare l'HTML: aggiungere
un progetto qui lo fa comparire nella griglia del portfolio, nella sua pagina di
dettaglio e — se ha un `caseStudy` — anche in `case-studies.html`.

## Procedura

**1. Metti le immagini in `assets/img/`**

Copiaci gli originali (JPG o PNG, anche grandi: vengono ridimensionati).

**2. Genera le versioni WebP**

```bash
npm run optimize:images
```

Crea un `.webp` accanto a ogni immagine, massimo 1920px di larghezza. Gli
originali non vengono toccati e restano nel repository come master. Sulle
immagini già convertite non rifà il lavoro.

**3. Aggiungi il progetto a `content.json`**

Copia il blocco da `content.example.jsonc` dentro `site.portfolio.items`,
togliendo i commenti (`content.json` è JSON puro e non li accetta).

Obbligatori solo `id` e `title`. Ogni altra sezione, se manca, semplicemente non
viene mostrata.

**4. Controlla prima di pubblicare**

```bash
npm run validate:content
```

**5. Pubblica**

```bash
git add -A && git commit -m "Aggiunto progetto X" && git push
```

GitHub Pages aggiorna il sito in un paio di minuti. Serve un refresh forzato
(`Ctrl+F5`) per non vedere la versione in cache.

## Le tre cose che si sbagliano più spesso

**Percorsi con i backslash.** `assets\img\foto.webp` funziona apparendo corretto
in locale su Windows, ma su GitHub Pages dà 404 e l'immagine non compare. Vanno
sempre usate le barre normali. È già successo con un video, restato rotto online
per mesi senza che nulla lo segnalasse.

**Categoria non dichiarata.** Il campo `category` va scritto senza il prefisso
`filter-` e deve corrispondere a un filtro in `site.portfolio.filters`. Se non
corrisponde, il progetto non risponde a nessun bottone.

**Puntare al JPG invece che al WebP.** Il sito servirebbe il file da svariati MB
invece di quello da un centinaio di KB.

Il validatore intercetta tutti e tre.

## File in questa cartella

| File | Cosa fa |
|---|---|
| `content.json` | I contenuti veri. È l'unico file che modifichi. |
| `content.example.jsonc` | Esempio commentato da copiare. |
| `content.schema.json` | Struttura formale, per l'autocompletamento dell'editor. |

Per l'autocompletamento in VS Code, aggiungi in cima a `content.json`:

```json
"$schema": "./content.schema.json",
```
