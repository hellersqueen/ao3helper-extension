# ficEngagement

**Tab:** Browse

## À quoi ça sert

Ce module ajoute des indicateurs sur les listes de fics (et sur la page
d'une fic) pour repérer rapidement les œuvres qui valent le coup, au-delà
du simple nombre de kudos ou de vues.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `colorCodeMetrics` | désactivé | Colore les badges selon leur niveau d'engagement |
| `hideLowEngagement` | désactivé | Cache les fics dont le taux de kudos est dans la tranche "faible" (< 8 %) |
| `gemMinRatio` | `5` (%) | Ratio minimum kudos/vues pour être une pépite cachée |
| `gemMaxKudos` | `100` | Nombre de kudos maximum pour rester "peu populaire" |
| `gemMaxBookmarks` | `10` | Nombre de favoris maximum pour rester "peu populaire" |
| `gemMinHits` | `50` | Nombre de vues minimum pour avoir assez de données |
| `gemCompareToPageAverage` | désactivé | Repère aussi les pépites par rapport à la moyenne de la page affichée, en plus des seuils fixes |

## Fichiers

### 1. `_ficEngagement.js` — le chef d'orchestre

- Met en route les deux autres fichiers de fonctionnalités de ce module (`engagementMetrics.js` et `hiddenGems.js`) et leur applique les indicateurs sur les œuvres affichées

### 2. `ficEngagementHelpers.js` — logique extraite

- `commentRate`/`classifyLevel` : calcul et classement (haut/moyen/faible) des ratios
- `isGem`/`gemMedal` : détection de pépite cachée et son niveau de médaille (seuils personnalisables)
- `averageRatio`/`isGemRelativeToPageAverage` : détection relative à la moyenne des œuvres affichées sur la page

### 3. `engagementMetrics.js` — badges de métriques

- Calcule et affiche quatre badges sous les statistiques de chaque fic, sur les listes d'œuvres comme sur la page individuelle d'une fic :
  - **Kudos Ratio** (`kudos / hits × 100`) → `X.X% ❤️/👁️`
  - **Kudos Density** (`kudos / mots × 1000`) → `X.X /1Kw`
  - **Save Rate** (`favoris / kudos × 100`) → `X.X% 💾`
  - **Comment Rate** (`commentaires / kudos × 100`) → `X.X% 💬`
- Seuils fixes (non réglables) utilisés pour classer chaque ratio en haut/moyen/faible :
  - Kudos Ratio : haut ≥ 20 % · moyen 8–20 % · faible < 8 %
  - Kudos Density : haut ≥ 50 · moyen 20–50 · faible < 20
  - Save Rate : haut ≥ 20 % · moyen 10–20 % · faible < 10 %
  - Comment Rate : haut ≥ 15 % · moyen 5–15 % · faible < 5 %
- Un badge "ⓘ" explique en survol comment interpréter chaque ratio, avec ces seuils exacts
- Chaque badge montre les chiffres bruts si on passe la souris dessus
- Peut colorer les badges (vert/jaune/rouge) selon le niveau d'engagement (réglage `colorCodeMetrics`)
- Peut cacher entièrement les fics à faible engagement, sur la base du kudos ratio (réglage `hideLowEngagement`)

### 4. `hiddenGems.js` — pépites cachées

- Repère les fics peu populaires mais avec un très bon taux d'engagement, et leur ajoute un badge médaille (💎 diamant / 🥇 or / 🥈 argent) selon la force du ratio
- Critères de détection, réglables dans le panneau au lieu d'être figés (`gemMinRatio` / `gemMaxKudos` / `gemMaxBookmarks` / `gemMinHits`) :
  - Ratio kudos/vues ≥ 5 % (défaut)
  - Kudos ≤ 100 (faible popularité)
  - Favoris ≤ 10 (ou kudos ≤ 100)
  - Vues minimum ≥ 50 (assez de données)
  - Kudos minimum ≥ 5 (assez de données)
- Niveaux de médaille : argent au seuil de base, or à 2× ce seuil, diamant à 3×
- Peut aussi repérer une pépite par comparaison avec la moyenne des œuvres affichées sur la page courante (réglage `gemCompareToPageAverage`) : une œuvre est signalée si son ratio est ≥ 1,5× la moyenne de la page, même si elle ne franchit pas le seuil fixe — une approximation de "comparer au fandom", puisque l'extension ne voit que les œuvres affichées, pas tout le catalogue d'un fandom
- Le badge apparaît sur les listes d'œuvres et sur la page individuelle de la fic ; son infobulle explique le choix ("Under the radar: low kudos but high ratio") et indique le ratio obtenu, le nombre de kudos, le nombre de vues, et la moyenne de page le cas échéant

### 5. `ficEngagement.css`

- Les styles visuels des badges, y compris les variantes par médaille et les infobulles

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, avec leur statut :

- ~~Une note personnelle qu'on pourrait donner à une fic~~ ✅ Fait (déjà couvert ailleurs)
  Le module `ficAppreciation` propose déjà `starRatings.js` : une note
  personnelle de 1 à 5 étoiles (avec note libre optionnelle), sur la page
  d'une œuvre et dans les listes. Pas de duplication ici.
- ~~Compter combien de fois une fic est mise en favori ou commentée, par rapport à ses kudos~~ ✅ Fait
  Nouveau badge "taux de commentaires" (`comments / kudos × 100`) — le
  taux de favoris existait déjà (Save Rate).
- ~~Un filtre pour ne montrer que les fics avec un très bon ratio~~ ✅ Fait
  Réglage `hideLowEngagement` : cache les fics dont le taux de kudos est
  dans la tranche "faible".
- ~~Des catégories de "pépites cachées" (nouveaux auteurs, vieux classiques, couples rares)~~ ❌ Écarté
  Nécessiterait des données indisponibles sans requêtes supplémentaires par
  auteur (ancienneté du compte, nombre total d'œuvres) ou une base de
  fréquence des tags par fandom (couples rares) — hors de portée d'un badge
  calculé localement à partir des stats déjà affichées.
- ~~Des niveaux de pépites, comme des médailles (diamant/or/argent)~~ ✅ Fait
  `gemMedal()` : diamant (ratio ≥ 3× le seuil minimum), or (≥ 2×), argent
  (le seuil de base).
- ~~Une version plus poussée du détecteur de pépites cachées~~ ✅ Fait (déjà couvert)
  Cette demande générique est couverte par la combinaison des points
  ci-dessous : niveaux de médaille, seuils personnalisables, et comparaison
  à la moyenne de la page.
- ~~Mettre automatiquement les pépites cachées en haut de la liste "à lire plus tard"~~ ❌ Écarté
  Nécessiterait que ce module modifie l'ordre d'affichage d'un autre module
  (Later Shelf) — un couplage entre modules que le projet évite (voir E7
  dans l'audit `shared.md`). Le badge reste une information sur les
  listings, pas une action sur une autre liste.
- ~~Montrer le classement d'une fic parmi tout le fandom (en %)~~ ❌ Écarté
  Nécessiterait de connaître les statistiques de toutes les œuvres d'un
  fandom pour calculer un centile — des dizaines ou centaines de requêtes
  par fandom.
- ~~Un petit guide qui explique comment interpréter chaque ratio (bon, moyen, faible)~~ ✅ Fait
  Badge "ⓘ" à côté des métriques, avec les seuils exacts en info-bulle.
- ~~Pouvoir changer soi-même les seuils utilisés pour repérer une pépite cachée, au lieu de seuils fixes~~ ✅ Fait
  Réglages `gemMinRatio` / `gemMaxKudos` / `gemMaxBookmarks` / `gemMinHits`.
- ~~Repérer les pépites cachées en les comparant à la moyenne de leur propre fandom, plutôt qu'avec les mêmes seuils fixes pour tout le monde~~ ✅ Fait (approximation)
  Réglage `gemCompareToPageAverage` : compare à la moyenne des œuvres
  affichées sur la page courante, pas au fandom entier (voir "classement
  dans le fandom" ci-dessus pour pourquoi une vraie moyenne de fandom est
  hors de portée).
- ~~Un score qui essaie de deviner si une fic en cours risque d'être abandonnée et jamais terminée, en regardant les habitudes de publication passées de l'auteur~~ ❌ Écarté
  Concept déjà explicitement rejeté à l'échelle du projet (voir
  "updateLikelihood" dans `docs/never-built-modules.md`) : juger
  publiquement qu'une fic risque d'être abandonnée est injuste envers
  l'auteur·ice.

Une ancienne liste d'idées brutes, trouvée plus loin dans ce document sans
statut assigné, mentionnait aussi ces pistes — jamais triées, donc gardées
ici telles quelles plutôt que de leur inventer un statut :

- Voir si une fic devient de plus en plus populaire au fil du temps, avec des graphiques et un historique (aucune analyse historique n'est faite actuellement, voir "Limites connues" plus bas)
- Voir si le ratio d'une fic monte ou descend avec le temps (même remarque)
- Suivre si les commentaires qu'on écrit soi-même ont un effet
- Trier les résultats par engagement — *ça existe déjà, mais dans un autre module (`searchEnhancer`), pas ici*
- Afficher le ratio "collé" en haut de la page pendant qu'on lit
- Pouvoir cacher certains badges un par un, ou choisir combien de chiffres après la virgule
- Repérer quels fandoms entiers sont en train de devenir tendance, pas seulement fic par fic
- Calculer les kudos par chapitre au lieu du total

## Explicitement écarté

- Une note de qualité unique et globale pour chaque fic (calculée à partir des kudos, des vues, des favoris et des commentaires, avec des grades du type S/A/B/C/D) — jugée trop subjective, trop présomptueuse et insuffisamment représentative de la qualité réelle d'une œuvre ; le module préfère fournir plusieurs indicateurs indépendants plutôt qu'une note globale
- Des catégories de pépites cachées par type d'auteur/couple — données indisponibles sans requêtes supplémentaires
- Priorisation automatique dans une autre liste (Later Shelf) — couplage entre modules évité
- Classement précis dans le fandom (%) — nécessiterait de crawler tout le fandom
- Score de risque d'abandon — déjà rejeté à l'échelle du projet ("updateLikelihood")

## Dépendances et limites

- Le module ne dépend d'aucun service externe : il s'appuie uniquement sur
  les données déjà affichées par AO3 (kudos, vues, mots, favoris,
  commentaires), calculées localement.
- Les seuils des quatre badges d'engagement (kudos ratio, densité, save
  rate, comment rate) restent fixes ; seuls les seuils des Hidden Gems sont
  personnalisables.
- La comparaison "à la moyenne" (`gemCompareToPageAverage`) reste une
  approximation limitée aux œuvres affichées sur la page courante, pas au
  fandom entier.
- Aucune analyse historique ou prédictive n'est réalisée : les ratios ne
  décrivent que l'état des statistiques au moment de l'affichage.
