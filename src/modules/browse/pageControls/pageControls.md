# pageControls

**Tab:** Browse

## À quoi ça sert

Ce module améliore la navigation entre les pages de résultats sur AO3
(fics, tags, favoris, historique, collections) : sauter directement à une
page, choisir combien de fics afficher par page, et des boutons de
navigation supplémentaires.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showPlusMinus10Buttons` | activé | Affiche les boutons de saut rapide (±N pages) |
| `quickJumpStep` | `10` | De combien de pages sautent les boutons rapides |
| `showBigJumpButtons` | désactivé | Affiche en plus des boutons de grand saut |
| `bigJumpStep` | `50` | De combien de pages sautent les boutons de grand saut |
| `showRandomPageButton` | activé | Affiche le bouton 🎲 "page au hasard" |
| `showPercentJumpButtons` | activé | Affiche les sauts ¼ / ½ / ¾ |
| `rememberRecentPages` | activé | Mémorise les pages visitées et propose "Resume"/"Recent" |
| `pageInputPosition` | `below` | Position du champ de saisie (sous ou au-dessus de la pagination) |
| `showPaginationProgressBar` | activé | Affiche une fine barre de progression dans la liste de pages |
| `stickyEnhancedNav` | désactivé | Garde la barre de navigation du haut collée à l'écran en scrollant |
| `worksPerPageEnabled` | activé | Active le menu pour choisir 20, 50 ou 100 fics par page |
| `worksPerPage` | `20` | Le nombre de fics affichées par page, par défaut |
| `infiniteScrollEnabled` | désactivé | Active le défilement infini (remplace les contrôles de saut de page) |
| `showBackToTopButton` | activé | Affiche le bouton flottant "remonter en haut" |

## Fichiers

### 1. `_pageControls.js` — le chef d'orchestre

- Ne s'active que sur les pages qui affichent une liste de fics
- Met en route les fichiers de fonctionnalités ; quand le défilement infini est activé, il remplace les contrôles de saut de page

### 2. `coreNavigation.js` — sauter directement à une page

- Ajoute un petit champ ("Page [_] / N") sous (ou au-dessus, au choix) de la pagination, pour taper un numéro de page et y aller directement ; détecte la page actuelle et le nombre total de pages, puis construit l'URL correspondante
- Un bouton 🎲 ouvre une page au hasard (en évitant de retomber sur la page courante), et des liens ¼ / ½ / ¾ sautent à une fraction de la liste (numéro de page calculé automatiquement)
- Mémorise les pages visitées de chaque liste et propose des liens "Resume"/"Recent" pour y revenir

### 3. `worksPerPage.js` — nombre de fics par page

- Un menu pour choisir d'afficher 20, 50 ou 100 fics par page (valeurs fixes, pas de nombre personnalisé)
- Se souvient du choix et l'applique automatiquement la prochaine fois, en essayant de conserver la position logique de l'utilisateur dans les résultats quand la densité change

### 4. `enhancedNavigation.js` — navigation enrichie

- Ajoute une rangée de boutons "First / −N / Prev / Next / +N / Last" au-dessus de la pagination normale (pas de saut réglable, gros sauts ±50 optionnels)
- Les boutons se désactivent tout seuls quand on est déjà à la première page (First/Prev/−N) ou à la dernière (Next/+N/Last)
- Une fine barre de progression (4px) montre où on en est dans la liste de pages, remplie proportionnellement à page courante / dernière page
- La rangée du haut peut rester collée à l'écran pendant le défilement (option `stickyEnhancedNav`) ; seule la rangée du haut colle, une barre collante en bas masquerait la liste

  > Note : une des versions antérieures de cette doc décrivait aussi une insertion des boutons *en dessous* de la pagination, en plus d'au-dessus. Non confirmé ailleurs dans le fichier — à vérifier si besoin.

### 5. `infiniteScroll.js` — défilement infini

- Charge automatiquement la page suivante quand on approche du bas de la liste (à ~600px, via IntersectionObserver), et ajoute ses fics à la suite
- Cache la pagination pendant qu'il est actif, affiche l'avancement ("Page X / N — scroll for more") et s'arrête à la dernière page

### 6. `backToTop.js` — remonter en haut

- Un bouton flottant (en bas à droite) qui apparaît après ~400px de défilement et remonte la page en douceur ; réglage `showBackToTopButton`

### Logique de saut et mémoire — intégrées à `_pageControls.js`

- `_pageControls.js` contient les calculs de destination (page au hasard, pourcentage, bornes, pas de saut valides) et la mémoire des pages visitées par liste, persistante dans `localStorage` ; une liste est identifiée par son chemin + ses filtres, sans le numéro de page ; la mémoire est plafonnée à 5 pages "Recent" par liste et 30 listes au total.

### 8. `pageControls.css`

- Les styles visuels des widgets ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Le défilement infini (charger automatiquement la suite pendant qu'on descend la page, sans changer de page) — un réglage porte ce nom, mais rien ne le fait vraiment~~ ✅
  Fait : `infiniteScroll.js` — le réglage `infiniteScrollEnabled` charge la
  page suivante à l'approche du bas de la liste et ajoute ses fics à la
  suite, cache la pagination et s'arrête à la dernière page.
- ~~Se souvenir de la dernière page où on était pour pouvoir y retourner plus tard~~ ✅
  Fait : chaque visite est mémorisée par liste (`_pageControls.js`,
  persistant dans `localStorage`) ; en revenant sur la page 1, un lien
  "Resume" ramène à la dernière page vue.
- ~~Aller à une page complètement au hasard~~ ✅
  Fait : bouton 🎲 à côté du champ de saut de page.
- ~~Sauter à un pourcentage de la liste, par exemple "aller au quart" ou "à la moitié"~~ ✅
  Fait : liens ¼ / ½ / ¾ à côté du champ de saut de page.
- ~~Des boutons pour sauter 50 pages d'un coup, en plus des boutons qui sautent 10 pages~~ ✅
  Fait : réglage `showBigJumpButtons` (+ pas réglable `bigJumpStep`, 50 par défaut).
- ~~Choisir soi-même de combien de pages sautent les boutons rapides~~ ✅
  Fait : réglage `quickJumpStep` (10 par défaut).
- ~~Se souvenir des pages visitées récemment, ou proposer des pages à revisiter~~ ✅
  Fait : liens "Recent" vers les dernières pages visitées de la liste (5 max
  par liste, 30 listes max, les plus anciennes évincées).
- ~~Choisir où positionner le champ pour taper le numéro de page~~ ✅
  Fait : réglage `pageInputPosition` (sous ou au-dessus de la pagination).
  L'option "dans la barre de navigation enrichie" n'a pas été retenue : les
  deux widgets restent indépendants et désactivables séparément.
- ~~Une barre de progression visuelle qui montre où on en est dans la liste de pages~~ ✅
  Fait : fine barre sous la rangée de navigation enrichie (désactivable).
- ~~Une barre de navigation qui reste collée en haut de l'écran même en scrollant~~ ✅
  Fait : réglage `stickyEnhancedNav` — la rangée du haut devient collante
  (position: sticky).
- ~~Un bouton pour remonter tout en haut de la page en un clic~~ ✅
  Fait : `backToTop.js`, bouton flottant après ~400px de défilement.

## Explicitement écarté

- Suggérer automatiquement des pages "intéressantes" à visiter — jugé trop compliqué pour le bénéfice apporté, nécessiterait une analyse complexe des habitudes de navigation
- Deviner tout seul le nombre idéal de fics à afficher selon la situation — écarté : aucune heuristique objective ("idéal" est subjectif), un réglage qui change tout seul serait imprévisible ; le choix manuel 20/50/100 reste la référence
- Avoir des réglages de pagination différents selon le type de page (recherche, tags, favoris...) — écarté : cela triplerait chaque réglage du panneau pour un bénéfice marginal ; les réglages actuels s'appliquent partout

## Dépendances et limites

- Le module s'appuie sur les mécanismes de pagination natifs d'AO3 et sur
  `localStorage`, `URL`/`URLSearchParams` pour la navigation et la mémoire
  des pages visitées.
- Portée volontairement limitée à la navigation : le module ne modifie ni
  les œuvres affichées, ni les filtres de recherche, ni les systèmes de
  tri, ni le contenu des résultats — ces responsabilités appartiennent à
  d'autres modules.
- Le nombre de fics par page reste limité aux trois valeurs proposées
  (20/50/100), pas de valeur personnalisée.
- Les préférences de navigation sont globales : elles ne varient pas selon
  le type de page (voir "Explicitement écarté" ci-dessus).
