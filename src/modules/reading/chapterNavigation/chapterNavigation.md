# chapterNavigation

**Tab:** Reading

## À quoi ça sert

Ce module regroupe tous les outils pour naviguer entre les chapitres d'une
fic, sur la page de lecture comme sur les listes : une barre de navigation
qui reste visible, des boutons pour reprendre là où on s'était arrêté, un
défilement automatique, et un compteur de mots par chapitre.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `stickyNav` | désactivé | La barre de navigation Précédent/Suivant reste toujours visible pendant la lecture |
| `resumeButton` | activé | Bouton "Start"/"Continue" adapté sur les listes de fics |
| `lastChapterBtn` | activé | Bouton "Last (Ch Y)" sur les listes de fics |
| `autoScrollShowControls` | activé | Affiche les boutons de vitesse et de pause du défilement automatique |
| `autoScrollSpeed` | `50` | La vitesse de défilement par défaut (en pixels par seconde) |
| `autoScrollAutoAdvance` | désactivé | Passe automatiquement au chapitre suivant en arrivant en bas de la page |
| `chapterPanel` | activé | Bouton flottant "📑 Chapters" : recherche, mini-carte lu/actuel/non lu, favoris, notes, chapitres récents |
| `showBreadcrumb` | activé | Fil d'Ariane "Œuvre > Chapitre X > Titre" au-dessus du texte |
| `tabTitleChapter` | désactivé | Affiche la position du chapitre dans le titre de l'onglet du navigateur |
| `emphasizeChapterTitle` | désactivé | Rend le titre du chapitre en cours plus grand et plus visible |
| `prefetchNextChapter` | activé | Précharge la page du chapitre suivant en arrière-plan |

## Fichiers

### 1. `_chapterNavigation.js` — le chef d'orchestre

- Vérifie sur quel type de page on se trouve (détection de listing centralisée via `lib/ao3/parsers.js`'s `isListingPage()`) et met en route les bons fichiers de fonctionnalités
- Centralise et injecte les calculs du panneau, du fil d'Ariane et du titre d'onglet, ainsi que le parsing "Chapter X/Y" (`parseChapterInfo`) et la lecture de progression via `readingTracker` (`getReadingProgress`), partagés par `navigationControls.js`, `blurbNavigation.js` et `chaptersPanel.js`

### 2. `navigationControls.js` — barre de navigation et raccourcis

- Une barre Précédent/Suivant qui peut rester collée en haut de l'écran pendant la lecture
- Un petit texte "Chapter X of Y" au-dessus du menu déroulant des chapitres
- Garde en mémoire le dernier chapitre visité (`{ id, num }` dans `localStorage`, sous `ao3h:cn:lastchap:{workId}`), réutilisé par `blurbNavigation.js`
- Des raccourcis clavier (Ctrl+Flèche gauche/droite pour changer de chapitre ; Ctrl+Maj+Origine/Fin pour sauter au premier chapitre non lu / au dernier chapitre), via le bridge `W.AO3H_KeyboardShortcuts` : la logique elle-même est migrée en ES Modules (Phase 21, `navigate/keyboardShortcuts`), mais le bridge `window` reste le contrat d'intégration jusqu'à la Phase 26
- Un fil d'Ariane, le titre du chapitre dans l'onglet du navigateur (optionnel), une mise en avant du titre du chapitre (optionnel), et un préchargement du chapitre suivant

### 3. `chaptersPanel.js` — panneau flottant des chapitres

- Un bouton "📑 Chapters" ouvre un panneau avec une recherche par numéro ou titre
- Une mini-carte de progression (✓ lu, 📍 en cours, non lu) et des raccourcis "premier non lu" / "dernier chapitre"
- Étoile "favori/à relire" et note personnelle par chapitre, stockées par fic sous `ao3h:cn:marks:{workId}` (format `{ [chapterId]: { starred, note } }`, `localStorage`)
- Liste des chapitres récemment consultés (le temps de la session, plafonnée à 8 entrées) et bouton pour copier le lien direct d'un chapitre, stockée sous `ao3h:cn:recent:{workId}` (`sessionStorage`)

### 4. `blurbNavigation.js` — boutons de reprise sur les listes

- Ajoute un bouton "Start" sur les fics jamais commencées, ou "Continue (Ch X)" sur celles déjà en cours
- Signale s'il y a de nouveaux chapitres parus depuis la dernière lecture
- Ajoute un bouton "Last (Ch Y)" pour sauter directement au dernier chapitre
- Lit la progression via `W.AO3H_ReadingTracker.getProgress()` (ou un repli `localStorage`) ; `readingTracker` n'étant pas encore migré en ES Modules (Étape 239), ce module garde temporairement un bridge global (`window`) — Phase 18 : on ne migre pas une dépendance dont la cible n'est pas prête

### 5. `autoScroll.js` — défilement automatique

- Ajoute un petit widget flottant avec plusieurs vitesses de défilement (0.5×, 1×, 2×, 4×) et un bouton stop
- Le défilement se met en pause dès qu'on touche la souris, le clavier ou l'écran, et reprend après une courte pause
- Peut passer automatiquement au chapitre suivant en arrivant en bas de la page

### 6. `chapterWordCount.js` — compteur de mots par chapitre

- Affiche un badge "~ X.XK words" indiquant le nombre de mots de chaque chapitre, sans compter le résumé ni les notes
- Le temps de lecture estimé partage ce même badge, mais est calculé par `workLength`/`readingTime.js` (module séparé)
- Réessaie plusieurs fois pour gérer les insertions tardives dans le DOM et certains skins personnalisés

### 7. `chapterNavigation.css`

- Les styles visuels de la barre, du texte, des boutons, du widget de défilement, du fil d'Ariane et du panneau de chapitres

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Un menu déroulant de chapitres avec les titres et des mini-aperçus, pas juste les numéros~~ ✅ Fait (partiel) : le panneau "📑 Chapters" liste chaque chapitre avec son numéro et son titre (déjà présents dans le `<select>` natif d'AO3, donc sans coût réseau) ; les "mini-aperçus" de contenu ont été écartés, voir Explicitement écarté
- ~~Chercher un chapitre par son titre ou son numéro~~ ✅ Fait — champ de recherche dans le panneau "📑 Chapters" (`chaptersPanel.js`, `filterChapters`)
- ~~Marquer certains chapitres comme favoris ou "à relire"~~ ✅ Fait — bouton étoile ☆/★ par chapitre dans le panneau, stocké sous `ao3h:cn:marks:{workId}`
- ~~Ajouter une note personnelle à un chapitre précis~~ ✅ Fait — icône 📝 par chapitre dans le panneau, ouvre un champ de texte ; stocké dans la même clé que les favoris
- ~~Voir la liste des chapitres consultés récemment~~ ✅ Fait — section "Recent" du panneau, limitée à la session en cours (`sessionStorage`, `ao3h:cn:recent:{workId}`) : ça n'a de sens que pour les allers-retours de la session de lecture actuelle
- ~~Naviguer entre les chapitres à la voix, mains libres~~ ❌ Écarté — nécessiterait un accès micro toujours actif et peu fiable, pour un bénéfice limité en lecture ; même famille de raisons que les autres fonctionnalités à base de reconnaissance vocale/IA écartées ailleurs
- ~~Se fixer des objectifs de lecture basés sur le nombre de chapitres~~ ❌ Écarté — même raisonnement que `readingDashboard`, qui a déjà écarté objectifs/stats de session comme peu fiables à mesurer et anti-gamification
- ~~Un fil d'Ariane qui montre où on est (Œuvre > Chapitre 5 > Titre)~~ ✅ Fait — ligne "Œuvre > Chapitre X > Titre" au-dessus du texte (réglage `showBreadcrumb`)
- ~~Un lien direct copiable vers chaque chapitre~~ ✅ Fait — icône 🔗 par chapitre dans le panneau, copie l'URL du chapitre dans le presse-papiers
- ~~Des petits points visuels (lu/non lu) et une mini-carte de la progression sur laquelle on peut cliquer pour sauter~~ ✅ Fait — mini-carte intégrée à la liste du panneau (✓ lu / 📍 en cours / vide = non lu), chaque ligne est cliquable ; le statut "lu" est approximé à partir du dernier chapitre connu de `readingTracker`
- ~~Un repère "tu es ici" dans cette mini-carte~~ ✅ Fait — icône 📍 sur la ligne du chapitre courant, avec surlignage
- ~~Des marques de complétion (✓) sur chaque chapitre déjà lu~~ ✅ Fait — icône ✓ sur chaque ligne dont le numéro est ≤ au dernier chapitre lu
- ~~Comparer la longueur des chapitres entre eux (le plus long, le plus court, la moyenne) avec un petit graphique~~ ❌ Écarté — nécessiterait de télécharger chaque chapitre séparément pour compter ses mots (AO3 n'affiche que le chapitre courant par défaut), coût réseau jugé excessif pour un simple comparatif
- ~~Afficher le titre du chapitre en cours dans le titre de l'onglet du navigateur~~ ✅ Fait — réglage `tabTitleChapter` (désactivé par défaut, car ça remplace le titre affiché par le navigateur)
- ~~Un bouton flottant "📑 Chapters" sur les pages de fic, avec un raccourci pour sauter directement au premier chapitre non lu, et un raccourci clavier pour aller directement au dernier chapitre~~ ✅ Fait — c'est le panneau lui-même (`chaptersPanel.js`), avec ses boutons "▶ First unread" / "⏭ Last chapter" et les raccourcis clavier ci-dessous
- ~~Une estimation du temps de lecture pour chaque chapitre~~ ✅ Fait (déjà couvert ailleurs) — `workLength`/`readingTime.js` calcule et affiche déjà "~X min" par chapitre, sur le même badge partagé (`lib/ui/badges.js`) que le compteur de mots de `chapterWordCount.js`
- ~~Rendre le titre du chapitre en cours plus visible ou plus grand sur la page~~ ✅ Fait — réglage `emphasizeChapterTitle`
- ~~Plus d'options de raccourcis clavier pour se déplacer entre les chapitres~~ ✅ Fait — Ctrl+Maj+Origine (premier chapitre non lu) et Ctrl+Maj+Fin (dernier chapitre), en plus de Ctrl+Flèches existants
- ~~Des effets d'animation ou de transition personnalisés en changeant de chapitre~~ ❌ Écarté — changer de chapitre est un vrai rechargement de page AO3 (pas une SPA) ; animer une transition entre deux pages différentes nécessiterait d'intercepter la navigation du site, trop fragile et invasif pour le bénéfice
- ~~Charger le chapitre suivant en arrière-plan pour qu'il s'ouvre instantanément~~ ✅ Fait — indice `<link rel="prefetch">` vers le chapitre suivant (réglage `prefetchNextChapter`), coût minime car c'est juste un indice laissé au navigateur
- ~~Combiner le défilement automatique avec un journal de lecture pour avoir un résumé détaillé de chaque session de lecture~~ ❌ Écarté — dépend d'un "journal de lecture" qui n'existe pas encore : `readingTracker` n'a pas de suivi de durée/notes de session, cette spec n'y est pas résolue non plus

## Explicitement écarté

- Charger automatiquement l'œuvre entière d'un coup selon sa longueur
- Un tableau de bord avec des statistiques de lecture — ce n'est pas le rôle de ce module, qui sert à naviguer, pas à faire des statistiques
- Pouvoir déplacer les boutons de navigation où on veut sur l'écran — jugé trop compliqué à régler pour peu d'intérêt
- Des aperçus de contenu dans le menu des chapitres (extrait du texte de chaque chapitre) — nécessiterait de télécharger chaque chapitre séparément (AO3 n'affiche que le chapitre courant par défaut), jugé trop coûteux en requêtes réseau pour ce que ça apporte ; le panneau affiche uniquement numéro et titre, déjà présents dans le `<select>` natif
- Naviguer entre les chapitres à la voix — accès micro permanent peu fiable pour un bénéfice limité
- Se fixer des objectifs de lecture basés sur le nombre de chapitres — même raisonnement que `readingDashboard` (anti-gamification, peu fiable à mesurer)
- Comparer la longueur des chapitres avec un graphique — nécessiterait de télécharger chaque chapitre, coût réseau excessif
- Des animations de transition entre chapitres — changement de chapitre = vraie navigation de page, pas une SPA
- Un journal de lecture combiné au défilement automatique — dépend d'une fonctionnalité de suivi de session qui n'existe pas encore dans `readingTracker`

## Précision

⚠️ Les docs historiques présentent `navigationControls` (barre collante,
raccourcis) et `autoScroll` (défilement automatique) comme des fichiers
jamais créés. C'est faux aujourd'hui : les deux sont pleinement codés dans
`navigationControls.js` et `autoScroll.js`.
