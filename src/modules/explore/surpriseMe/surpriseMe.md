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
- Évite de retirer une fic tirée récemment (fenêtre glissante des 20 derniers tirages), via la logique intégrée à `surpriseMe.js`
- Peut être déclenché par le raccourci clavier Ctrl+Shift+R du module des raccourcis
- Affiche un petit message si aucune fic ne correspond aux critères

### Sélection des candidates intégrée à `surpriseMe.js`

- Détection des fics terminées, extraction du nombre de mots, filtrage par ces deux critères
- Échantillonnage aléatoire sans doublon (`pickRandomSample`), utilisé pour le tirage simple comme pour le tirage multiple

### Historique des tirages intégré à `surpriseMe.js`

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
- ~~Garder un historique des fics tirées au hasard précédemment~~ ✅ `surpriseMe.js` + section "Recent draws" dans le panneau (avec bouton "Clear History")

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
en plus de la page courante, récupérées par une requête réseau vers la
même URL avec un paramètre `page` différent), ce qui correspond en pratique
à "tout le fandom/toute la recherche affichée" plutôt qu'à une page seule.
Sur ces pages récupérées en plus, seuls les filtres qui ne dépendent pas de
l'affichage (déjà lue, terminée, mots) s'appliquent — le masquage par
tags/mots interdits d'autres modules ne peut pas être vérifié puisque ces
fics ne sont jamais affichées sur la page courante.

## Précision

⚠️ Une doc historique disait que le tirage au hasard était "simulé" et pas
vraiment aléatoire. Ce n'est plus le cas : le tirage est bien réel dans le
code, sans aucune pondération par kudos, date, longueur ou ressemblance
avec d'autres fics — toutes les œuvres admissibles ont la même probabilité
d'être choisies, pour préserver un tirage réellement aléatoire.
