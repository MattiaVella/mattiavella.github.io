# Idee video AI per il portfolio — appunti

Nota: questo file non fa parte del sito (non è collegato da `content.json`),
è solo un promemoria di lavoro. Non pubblicarlo online così com'è.

---

## 1. Foto animate — luoghi/architettura (idea validata, da fare per prima)

Scatti propri di Torino animati con image-to-video. Vantaggio: materiale
di partenza tuo, nessun problema di diritti.

**Tre varianti possibili:**
- *"Torino che non dorme"* — 60-90s, più luoghi (portici, Mole, Lingotto,
  razionalismo, Falchera). Showreel d'autore.
- *Ritratto di un singolo edificio* — 40-60s su un solo soggetto forte
  (Palazzo Nuovo, Lingotto, Cappella della Sindone). Più coeso, più simile
  a un incarico reale da studio di architettura. **Consigliato come primo
  progetto.**
- *Prima/dopo con archivio storico* — stessa inquadratura, foto storica vs
  foto di oggi, entrambe animate. Sfrutta lo slider `beforeAfter` già
  presente in `PortfolioPost.html`. Verificare licenza se si usa un
  archivio comunale/Biblioteca Civica.

**Regole di scatto per far funzionare l'animazione:**
- profondità a strati (primo piano / soggetto / sfondo)
- linee verticali dritte (correggere la prospettiva prima)
- alta risoluzione, poco rumore
- luce laterale radente (mattina presto / golden hour), non luce piatta

**Pipeline:** Lightroom (raddrizza, grada) → image-to-video (Runway per
reference image + motion brush; Kling per le prove economiche) → scarto
~50% → Topaz (upscale 4K, stabilizzazione flicker) → Premiere (montaggio,
grading di raccordo, sound design).

**Regole tecniche:** movimenti minimi (push-in lento, parallasse), clip
corte (3-4s, non oltre 5s). Sound design con audio originale registrato
sul posto (portici, passi, traffico) invece di libreria generica.

**Numeri da mettere nel case study:** scatti totali / clip generate / clip
usate / durata finale / tempo di produzione totale.

---

## 2. Video di sensibilizzazione ai pericoli dell'AI (concept preferito)

Nato dal bisogno di rifare un lavoro tipo "video di sensibilizzazione a
norme comportamentali" (come quello fatto su igiene in terapia intensiva,
non pubblicabile: co-prodotto con un'altra casa di produzione, riservato).
Soluzione: stesso genere, tema diverso, produzione 100% propria.

### Concept: "Non fidarti di questo video" (100-120s)

Il video comincia credibile (un'intervista/messaggio intimo) e via via
mostra micro-anomalie che rivelano che è generato, fino a uno strappo
esplicito, prima di richiudersi come se niente fosse. Il messaggio arriva
alla fine, non spiegato a voce.

- **Atto 1 (0-40s) — La fiducia:** persona in camera fissa, racconto
  intimo e credibile, tutto perfetto (luce naturale, sguardo, imperfezioni
  del parlato).
- **Atto 2 (40-75s) — La crepa:** dettagli che stridono uno alla volta,
  sempre più ravvicinati nel tempo (mano con dita sbagliate un istante,
  orecchino che cambia forma, riflesso che non torna, micro-artefatto
  nella voce sulle consonanti).
- **Atto 3 (75-100s) — Lo strappo:** il volto si "apre" (morphing
  esplicito, quasi errore di rendering portato all'estremo), si intravede
  il "sotto", poi torna tutto normale.
- **Chiusura (100-120s):** schermo nero, testo essenziale tipo *"Hai
  creduto a tutto quello che hai appena visto. Niente di questo è
  reale."* Poi, in piccolo, elenco onesto degli strumenti usati — la
  trasparenza finale è ciò che lo rende un lavoro serio e non solo un
  trucco inquietante.

**Perché funziona:** è meta (un video sui pericoli dell'AI fatto con
l'AI), dimostra controllo tecnico fine (imperfezioni credibili e dosate,
più difficile che generare qualcosa di pulito), zero problemi di
riservatezza o coautori da citare, comprensibile subito anche sui social.

**Attenzione:** se si usa un volto reale (tuo o di un attore) per il
deepfake, serve consenso esplicito e scritto — ironico non averlo, dato
il tema. Alternativa pulita: generare fin dall'inizio un volto interamente
sintetico, nessuna persona reale coinvolta.

**Precedenti trovati in rete (riferimento, non da copiare):**
- Ishan Sharma, video virale (~23s) in cui si trasforma in volti pubblici
  (Sitharaman, Shah Rukh Khan, Trump, ecc.) dicendo "non puoi più fidarti
  di niente online", chiude con "manda questo video a un amico".
  https://www.storyboard18.com/brand-makers/this-viral-deepfake-ai-video-featuring-taylor-swift-ranveer-singh-shows-why-you-cant-trust-anything-online-89271.htm
- *In Event of Moon Disaster* (MIT Center for Advanced Virtuality, Emmy
  2021): deepfake di Nixon che annuncia il disastro dell'Apollo 11 mai
  avvenuto, prodotto esplicitamente per educare su deepfake e
  disinformazione. Riferimento più "istituzionale" e ben documentato sul
  making-of.
  https://www.csail.mit.edu/news/event-moon-disaster-produced-mit-center-advanced-virtuality-wins-emmy-award
- *"This Is Not Morgan Freeman – A Deepfake Singularity"* (2021, di Bob de
  Jong): apre subito dichiarando "non sono Morgan Freeman, quello che vedi
  non è reale" e passa il resto del video a dimostrare quanto sia
  convincente pur sapendolo falso — direzione opposta al concept "Non
  fidarti di questo video" (che rivela solo alla fine). Diventato
  riferimento standard nelle discussioni su deepfake; ha anche un video
  making-of separato.
  https://www.youtube.com/watch?v=oxXpB9pSETo (making-of:
  https://www.youtube.com/watch?v=F4G6GNFz0O8)

---

## 3. Altri concept emotivi discussi (validi, non scelti per ora)

- **"La memoria è imprecisa"** — ricordo d'infanzia narrato a voce, in cui
  le immagini generate derivano (volto che cambia, oggetti incoerenti):
  i difetti tipici dell'AI diventano il linguaggio del ricordo stesso.
  90s. Concept più originale e distintivo, ma richiede pipeline già rodata
  per riuscire a "dosare" l'incoerenza invece di subirla.
- **Il paese che si spopola** — riprese reali del vuoto oggi (Piemonte,
  borghi spopolati) intercalate a foto d'archivio animate di quando c'era
  vita. Serve permesso scritto per foto d'archivio con persone
  riconoscibili (pro loco, associazioni ex abitanti di solito
  disponibili).
- **La casa che si svuota** — casa di famiglia in vendita, stanze vuote
  oggi vs. foto animate della stanza piena nello stesso punto. Il più
  facile da realizzare (location unica, materiale personale, zero
  permessi).

---

## Idee scartate (contesto: troppo aziendali/da cliente, non emotive)

Prima di arrivare ai concept sopra erano stati proposti spot/casi studio
più "commerciali" (spot per birrificio, archviz abitato, varianti
performance-marketing, video istituzionale multilingua con avatar,
restauro archivio, animatic/previz, sigla evento) e un filone
"formazione sicurezza sul lavoro" (D.Lgs. 81/08: cantiere, magazzino,
evacuazione, HACCP). Scartati perché troppo "da cliente" e poco emotivi
per l'obiettivo attuale (dimostrare padronanza tecnica/autoriale). Restano
un'opzione valida per un secondo momento se si vuole un progetto pensato
per attrarre clienti aziendali invece che per il portfolio autoriale.
