# similarFics

**Tab:** Explore

## À quoi ça sert

Ce module ajoute un bouton "Similar Stories" sur la page d'une fic, qui
ouvre un panneau de suggestions de fics proches, basées sur le fandom, les
tags, la longueur et l'auteur de la fic en cours.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `numResults` | `10` | Le nombre de résultats affichés par section (5, 10 ou 15) |
| `showSimilarityScore` | activé | Afficher le pourcentage de correspondance |
| `highlightCommonTags` | activé | Afficher les raisons de correspondance ("shares 2 pairing tags"...) à côté du score |
| `showSummary` | activé | Afficher le résumé de la fic dans le panneau |
| `includeWIP` | désactivé | Inclure les fics en cours (pas encore terminées) |
| `openInNewTab` | désactivé | Ouvrir les suggestions dans un nouvel onglet |
| `lengthMode` | `similar` | Préférence de longueur : proche, plus courte, plus longue, lecture rapide (< 10K mots) ou épopée (100K+ mots) |
| `matchStyle` | `balanced` | Sévérité du score minimal : proche uniquement, équilibré, ou plus de variété |
| `matchRating` | activé | Ne proposer que des fics de la même note (rating) que la fic en cours |
| `cacheResults` | activé | Garde les recommandations en mémoire une heure pour éviter de tout recharger |
| `showSeriesSection` | activé | Priorise les suites/préquelles de la même série dans une section dédiée |

⚠️ Ces 6 réglages existaient dans le panneau mais n'étaient pas branchés au
code avant le Chantier 4 : `numResults`, `showSimilarityScore`,
`highlightCommonTags`, `showSummary`, `includeWIP`, `openInNewTab`. Ils sont
désormais tous actifs (voir "Specs non implémentés" plus bas pour le détail
de chacun).

## Fichiers

### `similarFics.js` — le chef d'orchestre

- Récupère le fandom, les tags principaux (relations et tags additionnels séparément), la note, le nombre de mots, l'auteur et l'appartenance à une série de la fic en cours
- Cherche sur AO3 des fics avec des tags proches, d'autres fics du même auteur, et — si la fic en cours appartient à une série — les autres œuvres de cette série
- Calcule un score de ressemblance pour chaque résultat trouvé, en donnant plus de poids aux tags de relation qu'aux tags additionnels
- Ne garde que les meilleurs résultats, classés en "More in [série]", "Similar Pairings", "Similar Stories" et "More by [auteur]"
- Ignore les fics déjà marquées comme lues, celles déjà écartées par un clic sur "✕ Not interested", et la fic en cours elle-même
- Affiche la ligne "Based on: ..." sous forme de puces retirables (fandom + tags) pour affiner la recherche sans rouvrir les réglages
- Un bouton "+ MFL" sur chaque suggestion permet de l'ajouter directement à "à lire plus tard"
- Garde les résultats en cache une heure (par fic et par combinaison de réglages actifs)

### `similarFicsHelpers.js` — logique pure

- Calcul de la fourchette de longueur recherchée selon `lengthMode`, du score de correspondance (pondéré), du seuil minimal selon `matchStyle`, du filtre de longueur stricte, du texte d'explication en langage simple, et de la liste des œuvres écartées — testé indépendamment du DOM

### `similarFics.css`

- Les styles visuels du panneau, des sections, des cartes de résultat, des puces de critères retirables et du bouton "pas intéressé"

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Exclure des types précis de similarité (par exemple "similaire mais pas les univers café")~~ ✅ Fait — la ligne "Based on: ..." affiche fandom et tags sous forme de puces retirables ; retirer une puce relance la recherche sans ce critère précis
- ~~Chercher des fics similaires mais volontairement plus longues ou plus courtes~~ ✅ Fait — réglage `lengthMode` (`shorter`/`longer`)
- ~~Filtrer pour ne garder que les fics terminées, en excluant les fics inachevées~~ ✅ Fait — c'est le comportement du réglage `includeWIP` une fois branché : `work_search[complete]=T` est ajouté à la recherche tant qu'il est désactivé (désactivé par défaut)
- ~~Un curseur pour choisir entre des suggestions très proches ou plus surprenantes~~ ✅ Fait — réglage `matchStyle` (proche/équilibré/variété), qui ajuste le score minimal requis
- ~~Des recommandations selon le temps de lecture disponible (rapide à lire vs longue épopée)~~ ✅ Fait — réglage `lengthMode` inclut `quick` (< 10K mots) et `epic` (100K+ mots)
- ~~Pouvoir régler soi-même l'importance de chaque critère de correspondance~~ ❌ Écarté — équivaudrait au vrai "Recommendation Engine" (environ 25 réglages prévus à l'origine) déjà explicitement écarté ailleurs dans le projet comme "trop ambitieux et complexe pour rester un simple module d'extension" ; `similarFics` en est justement la version volontairement simplifiée
- ~~Reconnaître les suites ou préquelles d'une série pour les recommander en priorité~~ ✅ Fait — nouvelle section "More in [série]" : le module détecte `dd.series` sur la page, récupère directement la page de la série (résultats précis, pas une recherche par tags devinée) et l'affiche en premier
- ~~Apprendre de tes clics précédents pour améliorer les suggestions au fil du temps~~ ❌ Écarté — construire un profil de goûts à partir du comportement de l'utilisateur est exactement la complexité du "Recommendation Engine" rejeté
- ~~Donner plus de poids aux tags de relation qu'aux tags de personnage ou aux tags libres — en ce moment tous les tags comptent pareil~~ ✅ Fait — un tag de relation partagé vaut désormais plus qu'un tag additionnel partagé dans le calcul du score
- ~~Travailler avec le module de "jeux de tropes" pour affiner les suggestions~~ ❌ Écarté — `tropeGames` ne conserve aucun profil de tropes préférés par utilisateur (seulement des mini-jeux locaux comme le bingo ou la roulette) ; il n'y a aucune donnée concrète à partager entre les deux modules pour l'instant
- ~~Proposer des suggestions aussi sur les pages de recherche ou de tags, pas seulement sur la page d'une fic~~ ❌ Écarté — passerait d'un bouton par page à un bouton par fic sur des listes de 20+ résultats, multipliant d'autant les requêtes réseau ; changerait aussi tout le paradigme d'affichage du module
- ~~Créer automatiquement une image de couverture pour chaque suggestion~~ ❌ Écarté — AO3 ne fournit aucune image de couverture par œuvre ; il n'existe pas de source de données à afficher
- ~~Afficher automatiquement des suggestions quand tu marques une fic comme terminée ou abandonnée~~ ❌ Écarté — dépend de statuts "terminée"/"abandonnée" qui n'existent pas encore dans `readingTracker` (spec non résolue là-bas non plus, voir son propre "Statuts de lecture multiples")
- ~~Des collections toutes prêtes ("lectures rapides", "grandes épopées")~~ ✅ Fait — mêmes options `quick`/`epic` du réglage `lengthMode`
- ~~Garder les recommandations en mémoire pour ne pas tout recharger à chaque fois~~ ✅ Fait — réglage `cacheResults`, cache d'une heure par fic et par combinaison de réglages actifs
- ~~Un bouton "pas intéressé" pour écarter une suggestion qui ne te plaît pas~~ ✅ Fait — bouton "✕" sur chaque carte, mémorisé dans `ao3h:sf:dismissed` (jusqu'à 200 entrées) et filtré à chaque recherche future
- ~~Afficher les suggestions dans une barre latérale toujours visible sur la page, plutôt que dans un panneau qu'il faut ouvrir avec un bouton~~ ❌ Écarté — le panneau n'est délibérément chargé qu'à la demande (clic sur le bouton) pour ne pas déclencher plusieurs requêtes réseau à chaque page de fic visitée, y compris pour les personnes qui ne regardent jamais les suggestions
- ~~Cacher automatiquement le panneau de suggestions sur mobile parce que l'écran est trop étroit~~ ❌ Écarté — retirer une fonctionnalité plutôt que d'adapter son affichage est une mauvaise pratique d'accessibilité ; le panneau est déjà en largeur fluide (`max-width`, pas de largeur fixe)
- ~~Ajouter un bouton pour mettre une suggestion en favori (bookmark) en un clic, en plus du bouton "+ MFL" actuel~~ ❌ Écarté — contrairement à kudos/MFL/abonnement (de vrais interrupteurs à un seul champ, déjà éprouvés en production), créer un bookmark AO3 nécessite des champs propres à l'utilisateur (pseud_id) et optionnels (notes, tags, confidentialité) qui ne sont pas fiables à deviner en aveugle ; le bouton "+ MFL" existant couvre déjà le besoin de "sauvegarder en un clic"
- ~~Filtrer les suggestions selon la note (rating) de la fic~~ ✅ Fait — réglage `matchRating` (activé par défaut ; désactive le filtre de note pour voir des suggestions toutes notes confondues)
- ~~Ne garder que les suggestions d'une longueur proche (à peu près 20% d'écart) de celle de la fic en cours~~ ✅ Fait — filtre strict appliqué uniquement en mode `lengthMode: similar` (`passesLengthFilter`, ratio ≥ 0.8 soit environ 20 % d'écart maximum)
- ~~Expliquer en langage simple pourquoi chaque fic est suggérée, en plus de pouvoir choisir combien de suggestions voir et lesquelles cacher~~ ✅ Fait — texte reformulé ("shares 2 pairing tags", "similar length"...) ; le nombre à afficher se règle via `numResults`, et masquer une suggestion précise se fait via le bouton "pas intéressé"
- ~~Proposer des suggestions basées sur tous tes favoris enregistrés, pas seulement sur la fic que tu es en train de regarder~~ ❌ Écarté — construirait un profil de goûts à partir de toute la bibliothèque de l'utilisateur, exactement le "Recommendation Engine" complet déjà écarté ailleurs dans le projet

## Explicitement écarté

- Suggestions générées par une intelligence artificielle ou un service en ligne — pour rester local et simple
- Régler soi-même l'importance de chaque critère de correspondance — équivaudrait au "Recommendation Engine" complet déjà écarté (environ 25 réglages prévus à l'origine)
- Apprendre des clics précédents pour améliorer les suggestions dans le temps — même raisonnement, construire un profil de comportement est la complexité explicitement rejetée
- Suggestions basées sur tous les favoris de l'utilisateur — même raisonnement, profil de goûts global au lieu d'une similarité locale à la fic en cours
- Suggestions sur les pages de recherche ou de tags — multiplierait les requêtes réseau (un bouton par fic sur une liste de 20+ résultats) et changerait le paradigme du module
- Image de couverture automatique par suggestion — AO3 ne fournit aucune donnée d'image par œuvre
- Barre latérale toujours visible — le chargement à la demande (clic) évite des requêtes réseau inutiles pour qui ne regarde jamais les suggestions
- Masquer automatiquement le panneau sur mobile — préférence pour un affichage fluide/adaptatif plutôt que retirer la fonctionnalité
- Bouton bookmark en un clic — contrairement à kudos/MFL/abonnement, créer un bookmark nécessite des champs propres à l'utilisateur non fiables à deviner en aveugle


AO3 Helper - Similar Fics Module
    Module ID: similarFics
    Display Name: Similar Fics

    Key Features:
        - Metadata extraction for similarity matching
        - Same fandom/author/pairings recommendations
        - Match percentage display (visual similarity score)
        - In-work discovery ("Similar Stories" button)


═══════════════════════════════════════════════════════════════════════════
  # similarFics
  **Tab :** Explore
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Similar Fics** ajoute un bouton **Similar Stories** sur la page d’une œuvre AO3.
Ce bouton ouvre un panneau contenant des suggestions d’œuvres similaires à celle qui est actuellement consultée.

* Les recommandations sont principalement basées sur :
  - le fandom ;
  - les relations ou pairings (davantage pondérées que les autres tags) ;
  - les tags additionnels partagés ;
  - la longueur de l’œuvre (selon la préférence choisie) ;
  - l’auteur ;
  - la série, le cas échéant (suites/préquelles priorisées) ;
  - certaines métadonnées générales de la fic.

Le module permet ainsi de découvrir rapidement d’autres œuvres proches sans quitter la page actuelle. Les recommandations restent entièrement locales et reposent sur les informations accessibles sur AO3. Aucun service d’intelligence artificielle externe n’est utilisé, et aucun profil de goûts n’est construit à partir du comportement de l’utilisateur.

---

# Réglages utilisateur

| Réglage               | Ce que ça fait                                                                        |
| --------------------- | ------------------------------------------------------------------------------------- |
| `numResults`          | Définit le nombre de résultats à afficher par section : 5, 10 ou 15.                  |
| `showSimilarityScore` | Affiche le pourcentage de correspondance entre l’œuvre actuelle et chaque suggestion. |
| `highlightCommonTags` | Affiche les raisons de correspondance en langage simple à côté du score.              |
| `showSummary`         | Affiche le résumé de chaque suggestion dans le panneau.                               |
| `includeWIP`          | Inclut les œuvres en cours de publication (désactivé : œuvres complètes uniquement).  |
| `openInNewTab`        | Ouvre les suggestions dans un nouvel onglet.                                          |
| `lengthMode`          | Préférence de longueur : proche, plus courte, plus longue, lecture rapide, épopée.     |
| `matchStyle`          | Sévérité du score minimal requis : proche, équilibré, ou plus de variété.             |
| `matchRating`         | Ne propose que des œuvres de la même note que l’œuvre actuelle.                       |
| `cacheResults`        | Conserve les recommandations en mémoire pendant une heure.                            |
| `showSeriesSection`   | Priorise les suites/préquelles de la même série dans une section dédiée.              |

---

# Structure du module

Le module est composé d’un fichier fonctionnel, d’un fichier de logique pure et d’une feuille de style.

```text
similarFics.js
similarFicsHelpers.js
similarFics.css
```

---

# similarFics.js

## Rôle

Contient l’ensemble du fonctionnement du module **Similar Fics**.

Il extrait les métadonnées de l’œuvre en cours, lance des recherches sur AO3, calcule un score de similarité pour chaque résultat et affiche les meilleures recommandations dans un panneau organisé par catégories.

---

## Fonctionnalités

### Bouton Similar Stories

Le module ajoute un bouton **Similar Stories** sur la page d’une œuvre.

Ce bouton permet :

* d’ouvrir le panneau de recommandations ;
* de lancer la recherche d’œuvres proches ;
* de consulter les suggestions sans quitter la page actuelle.

---

### Extraction des métadonnées

Avant de chercher des œuvres similaires, le module récupère les informations disponibles sur la page actuelle.

Il peut notamment extraire :

* le fandom ;
* les relations ou pairings ;
* les tags principaux ;
* la note ou rating ;
* le nombre de mots ;
* l’auteur ;
* l’identifiant de l’œuvre en cours.

Ces informations servent de base au calcul de similarité.

---

### Recherche d’œuvres similaires

Le module lance des recherches sur AO3 afin de trouver :

* des œuvres appartenant au même fandom ;
* des œuvres partageant des relations ou pairings similaires ;
* des œuvres utilisant des tags proches ;
* d’autres œuvres écrites par le même auteur.

---

### Recommandations par fandom

Les œuvres du même fandom peuvent recevoir un score plus élevé que celles provenant d’un autre fandom.

Cette correspondance constitue l’un des principaux critères de similarité.

---

### Recommandations par relation

Les œuvres partageant les mêmes relations ou pairings peuvent être regroupées dans une catégorie spécifique.

Cette catégorie est affichée sous le titre :

**Similar Pairings**

---

### Recommandations par auteur

Le module cherche également d’autres œuvres du même auteur.

Elles sont regroupées dans une section semblable à :

**More by [auteur]**

---

### Recommandations générales

Les œuvres qui correspondent principalement par leurs tags, leur fandom ou leur longueur sont regroupées sous :

**Similar Stories**

---

### Suites et préquelles de la même série

Lorsque l’œuvre actuelle appartient à une série (`dd.series` présent sur la page) et que `showSeriesSection` est activé, le module récupère directement la page de la série et affiche ses autres œuvres dans une section **More in [nom de la série]**, placée en premier.

Contrairement aux autres sections, celle-ci ne repose pas sur une recherche par tags devinée : elle liste les œuvres réellement présentes dans la série, donc sans score de correspondance.

---

### Calcul du score

Chaque résultat reçoit un score de ressemblance.

Le calcul tient notamment compte :

* du fandom partagé (+40) ;
* des tags de relation en commun, davantage pondérés (+15 par tag, jusqu’à +30) ;
* des tags additionnels en commun (+8 par tag, jusqu’à +24) ;
* de la proximité de longueur (+10 à +20 selon le ratio) ;
* de l’auteur (section séparée, sans influencer ce score).

Les œuvres sont ensuite classées selon ce score afin de conserver les meilleurs résultats. Seules celles dont le score dépasse le seuil minimal (voir "Style de correspondance" plus bas) sont conservées.

---

### Pourcentage de correspondance

Le module affiche, quand `showSimilarityScore` est activé, un pourcentage représentant la similarité entre l’œuvre actuelle et chaque suggestion, avec une explication en langage simple à côté (contrôlée par `highlightCommonTags`) — par exemple *"87% match · same fandom, shares 2 pairing tags, similar length"*.

---

### Style de correspondance

Le réglage `matchStyle` ajuste le score minimal requis pour qu’une suggestion soit conservée :

* `close` : 80 — uniquement des correspondances très proches ;
* `balanced` (par défaut) : 70 — le seuil historique du module ;
* `variety` : 50 — davantage de résultats, quitte à être moins précis.

---

### Préférence de longueur

Le réglage `lengthMode` détermine la fourchette de mots recherchée :

* `similar` (par défaut) : fourchette proche du nombre de mots actuel (comportement historique par palier) ;
* `shorter` / `longer` : décale la fourchette vers le bas ou vers le haut ;
* `quick` : force une fourchette de 0 à 10 000 mots (lecture rapide) ;
* `epic` : force un minimum de 100 000 mots (grande épopée), sans maximum.

En mode `similar` uniquement, un filtre supplémentaire strict écarte les résultats dont la longueur s’écarte de plus d’environ 20 % de l’œuvre actuelle (au-delà du simple bonus de score).

---

### Note (rating)

Lorsque `matchRating` est activé (par défaut), la recherche est restreinte à la même note que l’œuvre actuelle. Le désactiver permet de voir des suggestions toutes notes confondues.

---

### Œuvres en cours (WIP)

Lorsque `includeWIP` est désactivé (par défaut), la recherche ajoute `work_search[complete]=T` pour ne proposer que des œuvres terminées. L’activer inclut aussi les œuvres en cours de publication.

---

### Critères de recherche retirables

La ligne **Based on: ...** affiche le fandom et les tags utilisés pour la recherche sous forme de puces, chacune avec un bouton **✕**. Retirer une puce relance immédiatement la recherche sans ce critère précis (par exemple pour explorer au-delà d’un trope trop spécifique), sans changer les réglages globaux du module.

---

### Exclusion de l’œuvre actuelle

Le module retire automatiquement l’œuvre actuellement consultée des résultats.

Elle ne peut donc pas se recommander elle-même.

---

### Exclusion des œuvres déjà lues et des œuvres écartées

Les œuvres déjà marquées comme lues (`readingTracker`) sont ignorées lorsqu’elles peuvent être identifiées par le module. Les œuvres explicitement écartées via le bouton **✕ Not interested** de chaque carte le sont aussi, en s’appuyant sur `ao3h:sf:dismissed` (jusqu’à 200 entrées mémorisées).

Cela permet de privilégier les découvertes et de ne plus revoir une suggestion qui ne plaît pas.

---

### Classement des résultats

Une fois les résultats récupérés et évalués, le module :

* élimine les résultats non pertinents (score sous le seuil, longueur hors filtre) ;
* retire les doublons, les œuvres déjà lues et les œuvres écartées ;
* classe les œuvres selon leur score ;
* conserve les meilleures suggestions, dans la limite fixée par `numResults` ;
* répartit les résultats dans les différentes sections.

---

### Ajout à Marked for Later

Chaque suggestion peut contenir un bouton :

**+ MFL**

Ce bouton permet d’ajouter directement l’œuvre à la liste **Marked for Later** sans devoir ouvrir sa page.

---

### Découverte depuis la page d’une œuvre

Le module fonctionne directement depuis la page de l’œuvre actuellement consultée.

Il ne propose pas de recommandations depuis les résultats de recherche, les pages de tags, les listes de bookmarks ou les autres listings AO3 (voir "Décisions de conception").

---

## Détails techniques

### Données utilisées

Le système de recommandation repose sur les métadonnées disponibles dans le DOM et dans les résultats de recherche AO3 (y compris la page de série, le cas échéant).

Il n’analyse pas le contenu complet des œuvres.

---

### Critères de similarité

Les critères principaux sont :

* fandom identique ;
* auteur identique ;
* relations ou pairings communs (pondérés davantage que les tags additionnels) ;
* tags additionnels communs ;
* longueur comparable, selon la préférence choisie.

---

### Pondération des tags

Les tags de relation comptent désormais davantage que les tags additionnels dans le calcul du score (voir "Calcul du score" plus haut). Les tags de personnage isolés ne sont pas extraits séparément des tags additionnels.

---

### Recherche locale et mise en cache

Les recommandations sont construites à partir des recherches AO3 et du calcul local effectué dans le navigateur.

Lorsque `cacheResults` est activé, les résultats bruts (recherche principale, œuvres de l’auteur, œuvres de la série) sont conservés une heure sous une clé combinant l’identifiant de l’œuvre et les réglages actifs (longueur, style, note, WIP), pour éviter de tout recharger à chaque ouverture du panneau.

Aucune API d’intelligence artificielle ou plateforme externe de recommandation n’est utilisée.

---

# similarFicsHelpers.js

## Rôle

Fichier de logique pure, sans DOM ni stockage, ajouté au Chantier 4 pour rendre testable le calcul de recommandation.

## Fonctions exposées

* `getWordRangeForMode(count, mode)` — fourchette de mots à rechercher selon `lengthMode`.
* `minScoreForStyle(matchStyle)` — score minimal selon `matchStyle`.
* `scoreWork(blurb, info)` — score de correspondance, avec pondération des tags de relation.
* `passesLengthFilter(blurb, currentWords, lengthMode)` — filtre strict de longueur (~20 %) en mode `similar`.
* `buildReasonText(reasons)` — transforme les raisons brutes en phrase lisible.
* `filterDismissed(items, dismissedIds)` / `addDismissed(list, workId, cap)` — gestion des œuvres écartées.
* `parseSeriesPartOf(text)` — extrait la position "Part X of Y" d’un texte de série.

## Dépendances

Aucune — utilisé uniquement par `similarFics.js`.

---

# similarFics.css

## Rôle

Contient l’ensemble des styles visuels utilisés par le module **Similar Fics**.

Il définit notamment l’apparence :

* du bouton **Similar Stories** ;
* du panneau de recommandations ;
* des différentes sections, y compris **More in [série]** ;
* des cartes de résultats et de leur résumé ;
* des scores de similarité ;
* des puces de critères de recherche retirables ("Based on: ...") ;
* des boutons **+ MFL** et **✕ Not interested** ;
* des états de chargement ;
* des messages d’erreur ou d’absence de résultats.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou mentionnées dans d’autres documents, mais ne disposent pas encore d’une implémentation complète.

---

## Réglages déjà présents mais inactifs

### Nombre de résultats

Connecter `numResults` au fonctionnement du module afin de permettre l’affichage de :

* 5 suggestions ;
* 10 suggestions ;
* 15 suggestions.

**✅ Fait** — `maxPerSection()` lit `numResults` et limite chaque section en conséquence.

---

### Affichage du score

Connecter `showSimilarityScore` afin de pouvoir afficher ou masquer le pourcentage de correspondance.

**✅ Fait**

---

### Tags communs

Connecter `highlightCommonTags` afin de mettre réellement en évidence les tags partagés.

**✅ Fait** — affiche désormais les raisons de correspondance en langage simple à côté du score.

---

### Résumés

Connecter `showSummary` afin de pouvoir afficher ou masquer le résumé de chaque œuvre.

**✅ Fait** — le résumé est extrait des résultats de recherche AO3 et affiché sur la carte.

---

### Œuvres en cours

Connecter `includeWIP` afin de choisir si les œuvres inachevées doivent être incluses.

**✅ Fait** — ajoute `work_search[complete]=T` à la recherche tant que le réglage est désactivé.

---

### Nouvel onglet

Connecter `openInNewTab` afin de choisir si les suggestions doivent s’ouvrir dans la page actuelle ou dans un nouvel onglet.

**✅ Fait**

---

## Filtres de similarité

### Exclusions précises

Permettre d’exclure certains types de similarité.

Exemple :

* rechercher des œuvres similaires ;
* mais exclure les univers café.

**✅ Fait** — puces retirables sur la ligne "Based on: ..." (fandom et tags), chacune avec un bouton ✕ qui relance la recherche sans ce critère précis.

---

### Longueur différente

Permettre de chercher volontairement des œuvres :

* plus courtes ;
* plus longues ;
* de longueur semblable.

**✅ Fait** — réglage `lengthMode` (`shorter`/`longer`/`similar`).

---

### Œuvres terminées uniquement

Ajouter un filtre permettant d’exclure les œuvres en cours et de ne conserver que les œuvres complètes.

**✅ Fait** — conséquence directe du branchement de `includeWIP`.

---

### Rating

Permettre de filtrer les suggestions selon la note ou le rating de l’œuvre.

**✅ Fait** — réglage `matchRating`.

---

### Proximité de longueur

Ne conserver que les œuvres dont la longueur se situe dans une plage définie autour de l’œuvre actuelle.

Exemple :

* environ 20 % plus courtes ;
* environ 20 % plus longues.

**✅ Fait** — `passesLengthFilter`, appliqué en mode `lengthMode: similar`.

---

## Contrôle de la similarité

### Curseur proximité-surprise

Ajouter un curseur permettant de choisir entre :

* des recommandations très proches ;
* des recommandations plus variées ou surprenantes.

**✅ Fait** — réglage `matchStyle` (proche/équilibré/variété), un choix à trois options plutôt qu'un curseur continu.

---

### Pondération personnalisée

Permettre à l’utilisateur de définir l’importance de chaque critère.

Par exemple :

* fandom ;
* relation ;
* tags ;
* auteur ;
* longueur.

**❌ Écarté** — c'est exactement le "Recommendation Engine" complet (~25 réglages prévus à l'origine) déjà rejeté ailleurs dans le projet comme trop ambitieux pour un simple module d'extension.

---

### Priorité des types de tags

Donner plus de poids aux tags de relation qu’aux tags de personnage ou aux tags libres.

Le système actuel traite tous les tags de manière similaire.

**✅ Fait** — les tags de relation valent désormais plus que les tags additionnels dans le score.

---

### Explication des recommandations

Afficher une explication simple pour chaque suggestion.

Exemples :

* même pairing ;
* 6 tags en commun ;
* longueur similaire ;
* même auteur.

**✅ Fait** — `buildReasonText()` reformule les raisons brutes en phrases lisibles.

---

## Recommandations contextuelles

### Temps de lecture disponible

Proposer des œuvres selon le temps dont dispose l’utilisateur.

Exemples :

* lecture rapide ;
* lecture moyenne ;
* longue épopée.

**✅ Fait** — options `quick`/`epic` du réglage `lengthMode`.

---

### Suites et préquelles

Reconnaître les œuvres appartenant à la même série afin de recommander en priorité :

* les suites ;
* les préquelles ;
* les œuvres connexes.

**✅ Fait** — section "More in [série]", basée sur la page de série réelle plutôt qu'une recherche par tags devinée.

---

### Collections préparées

Créer des collections automatiques comme :

* lectures rapides ;
* grandes épopées ;
* œuvres courtes terminées ;
* longues séries.

**✅ Fait** — mêmes options `quick`/`epic` de `lengthMode`.

---

### Pages de recherche et de tags

Afficher également des recommandations depuis :

* les pages de recherche ;
* les pages de tags ;
* les listings d’œuvres.

**❌ Écarté** — multiplierait les requêtes réseau (un bouton par œuvre sur une liste de 20+ résultats) et changerait tout le paradigme d'affichage du module (bouton unique par page → bouton par blurb).

---

### Fin de lecture

Afficher automatiquement des recommandations lorsque l’utilisateur marque une œuvre comme :

* terminée ;
* abandonnée.

**❌ Écarté** — dépend de statuts "terminée"/"abandonnée" qui n'existent pas encore dans `readingTracker` ; spec non résolue là-bas non plus.

---

### Recommandations globales

Produire des suggestions à partir de l’ensemble des bookmarks ou favoris de l’utilisateur plutôt que seulement à partir de l’œuvre actuelle.

**❌ Écarté** — construirait un profil de goûts global, exactement le "Recommendation Engine" complet déjà rejeté.

---

## Personnalisation et apprentissage

### Apprentissage des clics

Utiliser les suggestions ouvertes ou ignorées afin d’améliorer progressivement les résultats.

**❌ Écarté** — apprendre du comportement de l'utilisateur pour affiner les résultats est la complexité même du "Recommendation Engine" rejeté.

---

### Bouton Pas intéressé

Ajouter un bouton permettant d’écarter une recommandation.

Le module pourrait ensuite éviter de la proposer de nouveau.

**✅ Fait** — bouton ✕ sur chaque carte, mémorisé dans `ao3h:sf:dismissed`.

---

### Intégration avec Trope Games

Utiliser les données du module de jeux de tropes pour affiner les suggestions.

**❌ Écarté** — `tropeGames` ne conserve pas de profil de tropes préférés par utilisateur, seulement des mini-jeux locaux ; aucune donnée concrète à partager pour l'instant.

---

## Interface

### Barre latérale

Afficher les recommandations dans une barre latérale toujours visible, plutôt que dans un panneau ouvert manuellement.

**❌ Écarté** — le chargement à la demande évite des requêtes réseau à chaque page de fic visitée, y compris pour qui ne regarde jamais les suggestions.

---

### Adaptation mobile

Masquer automatiquement le panneau ou utiliser une présentation différente lorsque l’écran est trop étroit.

**❌ Écarté** — retirer une fonctionnalité plutôt que l'adapter est une mauvaise pratique d'accessibilité ; le panneau est déjà en largeur fluide.

---

### Bouton Bookmark

Ajouter un bouton permettant de créer directement un bookmark en plus du bouton **+ MFL**.

**❌ Écarté** — contrairement à kudos/MFL/abonnement (des interrupteurs à un seul champ déjà éprouvés), créer un bookmark nécessite des champs propres à l'utilisateur (pseud_id) et optionnels non fiables à deviner en aveugle.

---

### Couvertures automatiques

Générer automatiquement une image de couverture pour chaque suggestion.

**❌ Écarté** — AO3 ne fournit aucune image de couverture par œuvre ; pas de source de données.

---

## Performance

### Cache des recommandations

Conserver les résultats déjà calculés afin d’éviter de relancer toutes les recherches à chaque ouverture du panneau.

**✅ Fait** — réglage `cacheResults`, cache d'une heure par œuvre et par combinaison de réglages actifs.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Fonctionnement local

Les recommandations sont calculées localement à partir des métadonnées AO3.

Le module ne transmet pas les données de lecture ou de recherche à un service tiers.

---

## Absence d’intelligence artificielle externe

Les recommandations générées par intelligence artificielle ou par un service en ligne ont été explicitement écartées.

Cette décision permet :

* de conserver un fonctionnement simple ;
* de préserver la confidentialité ;
* d’éviter une dépendance à un service externe ;
* de limiter les coûts et les problèmes de disponibilité.

---

## Métadonnées plutôt que texte intégral

Le module compare principalement les métadonnées de l’œuvre.

Il ne lit pas ni n’analyse automatiquement l’intégralité du texte des œuvres recommandées.

---

## Recommandations centrées sur l’œuvre actuelle

Le fonctionnement part toujours de la fic consultée (et, le cas échéant, de sa série).

Le module ne construit délibérément pas de profil global des préférences de l’utilisateur à partir de toute sa bibliothèque, de son historique de clics ou de ses favoris : c'est exactement la complexité du "Recommendation Engine" complet (environ 25 réglages prévus à l'origine) rejeté ailleurs dans le projet comme trop ambitieux pour un simple module d'extension. `similarFics` en reste la version volontairement simplifiée : une similarité de tags/fandom/longueur/série calculée à chaque visite, sans mémoire du comportement passé.

---

## Bouton Marked for Later plutôt que bookmark

L’action rapide proposée est **+ MFL**, pas un ajout direct aux bookmarks.

Contrairement à kudos, MFL ou l'abonnement — de vrais interrupteurs à un seul champ dont la recette POST est déjà éprouvée en production — créer un bookmark AO3 nécessite des champs propres à l'utilisateur (pseud_id) et optionnels (notes, tags, confidentialité) qui ne sont pas fiables à deviner en aveugle depuis ce panneau.

---

## Pas d'expansion vers les pages de listing

Le bouton "Similar Stories" n'apparaît que sur la page d'une œuvre, pas sur les pages de recherche, de tags ou de listing.

Proposer une similarité par œuvre sur une liste de 20+ résultats multiplierait d'autant les requêtes réseau et changerait le paradigme du module (un bouton par page → un bouton par blurb).

---

## Panneau à la demande, pas une barre latérale automatique

Le panneau de suggestions ne se charge que lorsque l'utilisateur clique sur le bouton "Similar Stories" — il n'est ni auto-affiché, ni masqué automatiquement selon la taille d'écran.

Un affichage automatique (barre latérale) déclencherait des requêtes réseau sur chaque page de fic visitée, y compris pour les personnes qui ne consultent jamais les suggestions. Masquer la fonctionnalité sur mobile plutôt que de laisser sa mise en page fluide s'adapter a aussi été jugé contraire à l'accessibilité.

