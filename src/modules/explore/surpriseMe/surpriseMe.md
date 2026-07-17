# surpriseMe

**Tab:** Explore

## À quoi ça sert

Ce module ajoute un bouton "🎲 Random Work" sur toutes les listes de fics
(tags, recherche, favoris, "à lire plus tard", historique, collections),
qui choisit une fic au hasard parmi celles affichées et y amène
directement.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showPreviewBeforeOpen` | désactivé | Affiche titre/résumé/statistiques avant d'ouvrir la fic (ignoré si plusieurs fics sont tirées d'un coup) |
| `completedOnly` | désactivé | Ne choisit que parmi les fics terminées |
| `resultCount` | `1` | Nombre de fics tirées d'un coup (1 à 10) ; au-delà de 1, affiche une liste au lieu d'un aperçu unique ✅ |
| `minWords` | `0` | Longueur minimale en mots ; `0` = pas de minimum ✅ |
| `drawScope` | `page` | `page` = cette page seulement, `allPages` = cette page + jusqu'à 4 pages suivantes de la même liste ✅ |

## Fichiers

### `surpriseMe.js` — coordinateur : bouton, tirage, aperçu(s), API partagée

- Ignore les fics déjà cachées par d'autres modules et celles déjà marquées comme lues
- Peut ne choisir que parmi les fics terminées et/ou au-dessus d'un nombre de mots minimum, si les réglages sont activés
- Peut élargir le tirage aux pages suivantes de la même liste (`drawScope: allPages`)
- Tire une seule fic (aperçu "Open"/"Reroll"/"Close"/"Add to Later Shelf") ou plusieurs à la fois (liste à cocher avec ajout groupé à "à lire plus tard")
- Évite de retirer une fic tirée récemment (fenêtre glissante des 20 derniers tirages), via `drawHistory.js`
- Peut être déclenché par le raccourci clavier Ctrl+Shift+R du module des raccourcis
- Affiche un petit message si aucune fic ne correspond aux critères

### `candidateSelection.js` — sélection des candidates (pur, testable)

- Détection des fics terminées, extraction du nombre de mots, filtrage par ces deux critères
- Échantillonnage aléatoire sans doublon (`pickRandomSample`), utilisé pour le tirage simple comme pour le tirage multiple

### `drawHistory.js` — historique des tirages (localStorage)

- Enregistre chaque fic tirée (id, titre, lien, date), plafonné à 50 entrées
- Expose l'ensemble des IDs tirés récemment (20 derniers) pour éviter les répétitions immédiates
- Relu par le panneau de réglages (`lib/ui/panel/configs/explore/surpriseMe-config.js`) pour afficher/vider l'historique

### `surpriseMe.css`

- Les styles visuels du bouton, de la carte d'aperçu simple, de la liste de tirage multiple et du message "liste vide"
- Les styles de la section "Recent draws" du panneau de réglages

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Une section "Analyse et recommandations" est prévue dans les réglages, mais rien n'est vraiment branché derrière pour l'instant~~ ✅ Retirée des réglages plutôt qu'implémentée — voir "Explicitement écarté"
- ~~Proposer une liste de 5 à 10 fics au hasard d'un coup pour choisir parmi elles, au lieu d'en tirer une seule à la fois~~ ✅ Réglage `resultCount` (1 à 10) : au-delà de 1, une liste à cocher remplace l'aperçu unique
- ~~Ajouter automatiquement plusieurs fics tirées au hasard dans "à lire plus tard" d'un coup~~ ✅ Bouton "Add checked to Later Shelf" dans la liste de tirage multiple (et "Add to Later Shelf" sur l'aperçu simple)
- ~~Choisir la zone où piocher au hasard (seulement ce fandom, tous les fandoms, ou juste cette page)~~ ✅ Réglage `drawScope` : `page` (cette page) ou `allPages` (cette page + jusqu'à 4 pages suivantes de la même liste) — voir précision ci-dessous
- ~~Exclure les fics trop courtes selon un nombre de mots minimum~~ ✅ Réglage `minWords`
- ~~Garder un historique des fics tirées au hasard précédemment~~ ✅ `drawHistory.js` + section "Recent draws" dans le panneau (avec bouton "Clear History")

## Explicitement écarté

- Donner plus de chances à certaines fics d'être tirées au sort (selon leurs kudos, leur date ou leur longueur) — pour que ce soit vraiment aléatoire
- Piocher au hasard sur d'autres sites, pas seulement sur AO3
- Faire en sorte que le tirage au hasard tienne quand même compte de la ressemblance avec d'autres fics — pour que ce soit un vrai hasard
- Un bouton "I'm Feeling Lucky" séparé — ça ferait doublon avec le bouton dé déjà présent
- Ajouter directement la fic tirée au hasard dans une file d'attente de lecture — ce n'est pas le rôle de ce module
- Pouvoir activer ou désactiver le bouton seulement sur certaines pages — il reste disponible partout, c'est plus simple
- **La section "Analyse et recommandations" prévue dans les réglages** (`showDetails`, `enableRecommendations`, `maxResults`) — un vrai moteur de recommandations demanderait de pondérer les fics (par ressemblance, popularité...), ce qui contredit directement les décisions déjà prises pour ce module ("Absence de pondération", "Absence de similarité" ci-dessous). Les trois réglages fantômes ont été retirés du panneau plutôt que branchés à un comportement qui n'a pas sa place ici.
- **Exclure les fics abandonnées en cours de route** — aucun module de l'extension ne suit aujourd'hui un statut "abandonné" (le suivi de lecture, `readingTracker`, liste lui-même cette fonctionnalité comme non implémentée). Sans producteur de cette donnée, il n'y a rien à lire pour exclure ces fics. À revisiter si `readingTracker` ajoute un jour ce statut.

## Précision — zone de tirage (`drawScope`)

Techniquement, AO3 ne propose pas de vraie distinction "ce fandom / tous les
fandoms" depuis une page de listing : la page affichée EST déjà la liste
d'un fandom, d'une recherche ou d'une étagère précise. `allPages` élargit
donc le tirage aux pages suivantes de cette même liste (jusqu'à 4 pages
en plus de la page courante), ce qui correspond en pratique à "tout le
fandom/toute la recherche affichée" plutôt qu'à une page seule. Sur ces
pages récupérées en plus, seuls les filtres qui ne dépendent pas de
l'affichage (déjà lue, terminée, mots) s'appliquent — le masquage par
tags/mots interdits d'autres modules ne peut pas être vérifié puisque ces
fics ne sont jamais affichées sur la page courante.

## Précision

⚠️ Une doc historique disait que le tirage au hasard était "simulé" et pas
vraiment aléatoire. Ce n'est plus le cas : le tirage est bien réel dans le
code.



   AO3 Helper — Surprise Me
   Module ID : surpriseMe

   Adds a "🎲 Random Work" button on any listing page (tag works, search
   results, bookmarks, marked-for-later, history). Clicking it picks one
   visible work blurb at random and navigates to it.

   Settings (from config.js):
     showPreviewBeforeOpen  – show title/summary/stats before opening
     completedOnly          – skip incomplete works


═══════════════════════════════════════════════════════════════════════════     
  # surpriseMe
  **Tab :** Explore
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Surprise Me** ajoute un bouton **🎲 Random Work** sur les listes d’œuvres AO3.
Lorsqu’il est utilisé, le module choisit au hasard une œuvre parmi celles actuellement affichées sur la page, puis ouvre directement sa page.

Il fonctionne notamment sur :
  - les pages de tags ;
  - les résultats de recherche ;
  - les bookmarks ;
  - la liste **Marked for Later** ;
  - l’historique ;
  - les collections ;
  - les autres listings compatibles.

Le tirage est réellement aléatoire parmi les œuvres admissibles présentes sur la page.

---

# Réglages utilisateur

| Réglage                 |  Ce que ça fait                                                  |
|-------------------------|------------------------------------------------------------------|
| `showPreviewBeforeOpen` | Affiche un aperçu de l’œuvre avant de l’ouvrir (ignoré si `resultCount` > 1). |
| `completedOnly`         | Limite le tirage aux œuvres terminées.                           |
| `resultCount`           | Nombre d’œuvres tirées d’un coup (1 à 10).                       |
| `minWords`              | Longueur minimale en mots (`0` = pas de minimum).                |
| `drawScope`             | `page` (cette page) ou `allPages` (cette page + pages suivantes de la même liste). |

---

# Structure du module

Le module est composé de trois fichiers fonctionnels ainsi que d’une feuille de style.

```text
surpriseMe.js            (coordinateur : bouton, tirage, aperçus, API partagée)
candidateSelection.js    (filtrage/échantillonnage des candidates — pur, testable)
drawHistory.js           (historique des tirages, localStorage)
surpriseMe.css
```

---

# surpriseMe.js

## Rôle

Contient l’ensemble du fonctionnement du module **Surprise Me**.

Il ajoute le bouton de tirage aléatoire, construit la liste des œuvres admissibles, choisit une œuvre au hasard et gère éventuellement l’affichage d’un aperçu avant l’ouverture.

---

## Fonctionnalités

### Bouton Random Work

Le module ajoute un bouton :

**🎲 Random Work**

sur les pages contenant une liste d’œuvres.

Ce bouton permet de sélectionner rapidement une œuvre sans avoir à choisir manuellement parmi les résultats.

---

### Tirage aléatoire

Lorsqu’il est déclenché, le module :

* récupère les fiches d’œuvres actuellement visibles ;
* retire les œuvres qui ne respectent pas les critères ;
* choisit une entrée au hasard ;
* ouvre la page correspondante.

Le tirage est réellement aléatoire dans le code actuel.

---

### Œuvres visibles

Par défaut (`drawScope: page`), le module choisit uniquement parmi les œuvres présentes sur la page courante.

Avec `drawScope: allPages`, il récupère aussi jusqu’à 4 pages suivantes de la même liste (même recherche, même fandom, même étagère) avant de tirer — voir "Zone du tirage élargie" plus bas.

Il ne parcourt jamais :

* d’autres fandoms ou recherches que ceux de la page courante ;
* toute la bibliothèque AO3.

---

### Exclusion des œuvres cachées

Les œuvres déjà masquées par d’autres modules sont ignorées.

Elles ne peuvent donc pas être sélectionnées tant qu’elles ne sont pas visibles et admissibles.

---

### Exclusion des œuvres déjà lues

Les œuvres déjà marquées comme lues sont également retirées de la sélection.

Le module privilégie ainsi les œuvres qui n’ont pas encore été terminées par l’utilisateur.

---

### Filtre des œuvres terminées

Lorsque `completedOnly` est activé, le module exclut les œuvres encore en cours de publication.

Le tirage se fait uniquement parmi les œuvres terminées visibles sur la page.

---

### Aperçu avant ouverture

Lorsque `showPreviewBeforeOpen` est activé, le module n’ouvre pas immédiatement l’œuvre tirée.

Il affiche d’abord une carte d’aperçu contenant notamment :

* le titre ;
* l’auteur ;
* le nombre de mots ;
* le nombre de kudos ;
* le résumé.

---

### Actions de l’aperçu

La carte d’aperçu propose plusieurs actions :

* **Open** : ouvre l’œuvre sélectionnée ;
* **Reroll** : effectue un nouveau tirage ;
* **Close** : ferme l’aperçu sans ouvrir d’œuvre.

---

### Nouveau tirage

L’action **Reroll** relance la sélection parmi les œuvres admissibles de la page.

Elle permet d’obtenir une autre proposition sans quitter l’interface.

---

### Raccourci clavier

Le module peut être déclenché avec le raccourci :

`Ctrl + Shift + R`

Ce raccourci est fourni par le module consacré aux raccourcis clavier.

---

### Liste vide

Lorsqu’aucune œuvre ne correspond aux critères, le module affiche un message au lieu de tenter une navigation invalide.

Cela peut arriver lorsque :

* toutes les œuvres visibles sont déjà lues ;
* toutes les œuvres sont masquées ;
* le filtre `completedOnly` ou `minWords` exclut tous les résultats ;
* aucune fiche d’œuvre compatible n’est présente.

---

### Tirage multiple (`resultCount`)

Quand `resultCount` est réglé au-dessus de 1, le module ne tire plus une
seule œuvre mais un lot (jusqu’à 10), affiché sous forme de liste avec, pour
chacune : titre (lien direct), auteur, mots, kudos, et une case à cocher.

La liste propose trois actions groupées : **Add checked to Later Shelf**,
**Reroll** (retire un nouveau lot) et **Close**.

---

### Ajout à Later Shelf

Aussi bien l’aperçu simple (bouton **📌 Add to Later Shelf**) que la liste
multiple (bouton **📌 Add checked to Later Shelf**) peuvent ajouter une ou
plusieurs œuvres tirées directement à l’étagère "à lire plus tard", sans
avoir à ouvrir chaque œuvre pour cliquer son propre bouton.

---

### Zone du tirage élargie (`drawScope`)

Avec `drawScope: allPages`, le module récupère (par requête réseau vers la
même URL avec un `page` différent) jusqu’à 4 pages suivantes de la liste
courante avant de tirer, en plus de la page affichée.

---

### Longueur minimale (`minWords`)

Un réglage numérique exclut les œuvres en dessous d’un nombre de mots donné.
`0` (par défaut) désactive ce filtre.

---

### Historique des tirages

Chaque œuvre tirée (simple ou dans un lot) est enregistrée avec son id, son
titre, son lien et la date du tirage — jusqu’à 50 entrées conservées.

Les 20 tirages les plus récents ne peuvent pas être retirés à nouveau
immédiatement, ce qui évite de proposer deux fois de suite la même œuvre.

L’historique est consultable et vidable depuis le panneau de réglages du
module, section "Recent draws".

---

## Détails techniques

### Sélection des candidates

Le module parcourt les fiches d’œuvres présentes dans le DOM et construit une liste de candidates admissibles.

---

### Filtres appliqués

Avant le tirage, il peut retirer :

* les fiches masquées (page courante seulement) ;
* les œuvres déjà lues ;
* les œuvres incomplètes lorsque `completedOnly` est activé ;
* les œuvres en dessous du seuil `minWords` ;
* les œuvres tirées parmi les 20 derniers tirages (`drawHistory.js`), pour éviter une répétition immédiate.

---

### Tirage

Une entrée est choisie aléatoirement parmi les candidates restantes.

---

### Navigation

Lorsque l’aperçu est désactivé, le module navigue directement vers l’URL de l’œuvre choisie.

Lorsque l’aperçu est activé, la navigation attend l’action **Open**.

---

### Intégration avec les raccourcis

Le module peut recevoir un déclenchement externe depuis le système de raccourcis clavier.

---

# surpriseMe.css

## Rôle

Contient l’ensemble des styles visuels utilisés par le module **Surprise Me**.

Il définit notamment l’apparence :

* du bouton **🎲 Random Work** ;
* de la carte d’aperçu ;
* du titre et des métadonnées ;
* du résumé ;
* des boutons **Open**, **Reroll** et **Close** ;
* du message indiquant qu’aucune œuvre n’est disponible ;
* des différents états interactifs.

---

# Fonctionnalités non implémentées

Cette section listait des idées prévues dans la conception du module mais
sans implémentation. Statut à jour ci-dessous ; le détail de chaque
fonctionnalité livrée est décrit plus haut, dans "Fonctionnalités".

---

## ~~Analyse et recommandations~~ ✅ Écartée (voir Décisions de conception)

Une section **Analysis & Recommendations** était prévue dans les réglages,
avec `showDetails`, `enableRecommendations` et `maxResults` réservés mais
inactifs. Un vrai moteur de recommandations demanderait de pondérer les
œuvres (ressemblance, popularité...), ce qui contredit "Absence de
pondération" et "Absence de similarité" ci-dessous. Les trois réglages
fantômes ont été retirés du panneau plutôt que branchés à un comportement
hors-sujet pour ce module.

---

## ~~Sélection multiple~~ ✅ Implémentée

Réglage `resultCount` (1 à 10) — voir "Tirage multiple" plus haut.

---

## ~~Ajout multiple à Marked for Later~~ ✅ Implémentée

Boutons **Add to Later Shelf** / **Add checked to Later Shelf** — voir
"Ajout à Later Shelf" plus haut.

---

## ~~Zone du tirage~~ ✅ Implémentée (partiellement, par nécessité technique)

Réglage `drawScope` (`page` / `allPages`) — voir "Zone du tirage élargie"
plus haut et la précision en tête de fichier sur la correspondance
"fandom/recherche affichée" plutôt qu’un multi-fandom au sens strict.

---

## ~~Exclusion des œuvres abandonnées~~ ✅ Écartée (faute de donnée source)

Aucun module ne suit aujourd’hui un statut "abandonné" — `readingTracker`
liste lui-même cette fonctionnalité comme non implémentée. Rien à lire pour
exclure ces œuvres tant que ce statut n’existe nulle part dans l’extension.

---

## ~~Longueur minimale~~ ✅ Implémentée

Réglage `minWords` — voir "Longueur minimale" plus haut.

---

## ~~Historique des tirages~~ ✅ Implémentée

`drawHistory.js` + section "Recent draws" du panneau de réglages — voir
"Historique des tirages" plus haut.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Tirage réellement aléatoire

Une ancienne documentation indiquait que le tirage était simulé.

Ce n’est plus le cas.

Le module choisit réellement une œuvre au hasard parmi les candidates admissibles présentes sur la page.

---

## Absence de pondération

Toutes les œuvres admissibles ont la même probabilité d’être choisies.

Le module ne donne pas plus de chances à une œuvre selon :

* son nombre de kudos ;
* sa date de publication ;
* sa longueur ;
* sa popularité ;
* ses statistiques.

Cette décision préserve un tirage réellement aléatoire.

---

## AO3 uniquement

Le module ne cherche pas d’œuvres aléatoires sur d’autres sites.

Il reste limité aux listings AO3.

---

## Absence de similarité

Le tirage ne tient pas compte de la ressemblance avec les œuvres déjà lues ou appréciées.

Cette décision évite de transformer le module en système de recommandations.

---

## Bouton unique

Aucun bouton séparé **I’m Feeling Lucky** n’est prévu.

Il ferait doublon avec le bouton **🎲 Random Work** déjà présent.

---

## Aucune file de lecture

Le module n’ajoute pas automatiquement l’œuvre tirée à une file d’attente de lecture.

Cette responsabilité appartient à d’autres modules.

---

## Présence sur toutes les listes

Le bouton n’est pas configurable page par page.

Lorsqu’il est activé, il reste disponible sur toutes les pages de listings compatibles afin de conserver un comportement simple et prévisible.

---

## Aucune section "Analyse et recommandations"

Les réglages `showDetails`, `enableRecommendations` et `maxResults`,
existants mais inactifs, ont été retirés plutôt qu’implémentés.

Un vrai moteur de recommandations demanderait de pondérer les œuvres selon
leur ressemblance, leur popularité ou leurs statistiques — ce qui contredit
directement "Absence de pondération" et "Absence de similarité" ci-dessus.

---

## Aucune exclusion des œuvres abandonnées

Aucun module de l’extension ne suit aujourd’hui un statut "abandonné" des
œuvres — `readingTracker` liste lui-même cette fonctionnalité comme non
implémentée.

Sans producteur de cette donnée, il n’y a rien à lire pour exclure ces
œuvres du tirage. À revisiter si `readingTracker` ajoute un jour ce statut.


