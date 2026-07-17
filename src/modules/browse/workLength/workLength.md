# workLength

**Tab:** Browse

## À quoi ça sert

Ce module ajoute des repères de longueur sur les fics (page de la fic et
listes) pour évaluer rapidement l'ampleur d'une fic sans avoir à
interpréter le nombre de mots brut.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showPageEquiv` | désactivé | Affiche "~X pages" à côté du nombre de mots |
| `readSpeed` | `average` | La vitesse de lecture : lent (150 mots/min), moyen (250), rapide (400), ou personnalisé |
| `customWPM` | `250` | Le nombre de mots par minute utilisé si la vitesse est réglée sur "personnalisé" |
| `showEstimate` | activé | Interrupteur principal pour l'estimation du temps de lecture |
| `estimateFicPage` | activé | Affiche le temps de lecture sur la page de la fic |
| `estimatePerChapter` | activé | Affiche le temps de lecture par chapitre |
| `estimateListings` | désactivé | Affiche le temps de lecture sur les listes |
| `showLengthCategory` | activé | Affiche la catégorie de longueur (Short story/Novella/Novel) |
| `thresholdShort` | `17500` | Le nombre de mots en dessous duquel une fic est une "Short story" |
| `thresholdNovella` | `60000` | Le nombre de mots en dessous duquel une fic est une "Novella" (au-delà, c'est un "Novel") |

## Fichiers

### 1. `_workLength.js` — le chef d'orchestre

- Charge les réglages une seule fois au démarrage et met en route les deux autres fichiers

### 2. `lengthDisplay.js` — badges de longueur

- Affiche un badge de catégorie (⚡ Short story / 📄 Novella / 📖 Novel) selon le nombre de mots, avec des seuils réglables
- Compare le nombre de mots à un livre connu parmi une liste de 18 références (Harry Potter, 1984, Le Seigneur des Anneaux...)
- Peut aussi afficher une estimation du nombre de pages

### 3. `readingTime.js` — temps de lecture estimé

- Calcule un temps de lecture selon une vitesse choisie (lent, moyen, rapide, ou personnalisé)
- Peut l'afficher sur la page de la fic, par chapitre, et/ou sur les listes

### 4. `workLength.css`

- Les styles visuels des badges et indicateurs de temps

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Filtrer les fics selon "je peux la finir en une seule fois"
- Indiquer la longueur moyenne d'un chapitre
- Additionner le nombre de mots total d'une série entière
- Calculer automatiquement ta propre vitesse de lecture selon ton historique
- Adapter l'estimation de pages selon l'appareil (téléphone, tablette, ordinateur)
- Adapter l'estimation selon le genre ou le style d'écriture
- Choisir soi-même combien de mots il y a par page — en ce moment c'est toujours fixé à 275
- Un aperçu façon "impression papier"
- Différents formats d'affichage pour les pages — en ce moment il n'y a qu'un seul format
- Un mode "marathon de lecture" qui garde le temps total passé à lire plusieurs fics d'affilée
- Un indicateur du temps qu'il reste avant de finir une fic en cours
- Un chronomètre de session de lecture
- Des suggestions de pauses pendant la lecture
- Suivre l'évolution de ta vitesse de lecture au fil du temps
- Comparer à des livres choisis par soi-même, pas juste les 18 déjà prévus
- Se connecter à un site externe pour les infos de longueur, plutôt que la petite liste déjà intégrée
- Un calcul pour savoir si on a le temps de finir une fic avant une heure précise (par exemple avant de se coucher), avec un badge du genre "tu peux finir !", "peut-être" ou "trop long"
- ~~Plus de catégories de longueur (par exemple "Flash Fiction" pour les
  toutes petites ou "Epic Novel" pour les très longues), au lieu des 3
  catégories actuelles~~ ✅ Fait : 5 catégories désormais (Flash Fiction ≤
  1 000 mots, Short story, Novella, Novel, Epic Novel > 150 000 mots), tous
  les seuils réglables dans le panneau.
- Un dégradé de couleur sur les listes pour repérer d'un coup d'œil les fics plus longues ou plus courtes que les autres
- Filtrer directement les résultats selon une fourchette de nombre de mots (mini et maxi) — l'idée existe déjà, mais côté filtres (`filterManager`), pas dans ce module-ci

## Explicitement écarté

- Recevoir une recommandation sur la longueur "idéale" d'une fic — pour rester neutre
- Donner à chaque fic une note de qualité globale (genre A/B/C/D) calculée automatiquement à partir des kudos, des favoris et des commentaires — écarté, jugé trop subjectif
- Comparer deux ou trois fics côte à côte (mots, chapitres, kudos, vues, tags communs et différents) — écarté par manque d'intérêt de la part des utilisateurs

## Précision

⚠️ Les seuils des catégories de longueur (`thresholdShort`,
`thresholdNovella`) sont bel et bien réglables dans le code. Une doc
historique les présentait à tort comme "rejetés".


AO3 Helper - Work Length Module Coordinator
    Module ID: workLength
    Display Name: Work Length
    Tab: Browse

    Submodules (imported directly as ES modules):
        1. ./lengthDisplay.js -- badges, book comparisons, page count
        2. ./readingTime.js   -- time estimation (WPM), per-chapter time, listing time

    Panel config keys:
        showPageEquiv       -- show '~X pages' badge
        readSpeed           -- slow | average | fast | custom
        customWPM           -- number (used when readSpeed === 'custom')
        showEstimate        -- master toggle for reading time
        estimateFicPage     -- show time on /works/:id pages
        estimatePerChapter  -- show per-chapter time
        estimateListings    -- show time on listing blurbs


        AO3 Helper - Length Display Submodule
    Submodule ID: lengthDisplay
    Display Name: Length Display
    Parent Module: workLength

    Displays length category badges (⚡/📄/📖/📚) and famous book
    comparisons on work pages and listing blurbs. Absorbs pageCount.

    Config keys read:
        - showPageEquiv       → show "~X pages" badge
        - showLengthCategory  → show category emoji + label
        - thresholdShort      → word count ceiling for "Short story" tier
        - thresholdNovella    → word count ceiling for "Novella" tier



AO3 Helper - Reading Time Submodule
    Submodule ID: readingTime
    Display Name: Reading Time
    Parent Module: workLength

    Calculates and displays reading time estimates based on WPM settings.
    Shows time on work pages, per-chapter, and optionally on listings.

    Config keys read:
        - showEstimate        → master toggle
        - estimateFicPage     → show on work page
        - estimatePerChapter  → show per chapter
        - estimateListings    → show on listing blurbs
        - readSpeed           → 'slow' | 'average' | 'fast' | 'custom'
        - customWPM           → number (when readSpeed = 'custom')



═══════════════════════════════════════════════════════════════════════════        
  # workLength
  **Tab :** Browse
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Work Length** ajoute plusieurs indicateurs permettant d'estimer rapidement l'ampleur d'une œuvre sans devoir interpréter uniquement son nombre de mots.

Il permet notamment de :

- afficher une catégorie de longueur (Short Story, Novella ou Novel) ;
- comparer la longueur d'une œuvre à des livres connus ;
- afficher une estimation du nombre de pages ;
- calculer un temps de lecture estimé ;
- afficher ce temps sur la page d'une œuvre, par chapitre et/ou dans les listes.

---

# Réglages utilisateur

| Réglage | Défaut | Description |
|----------|--------|-------------|
| `showPageEquiv` | Désactivé | Affiche une estimation du nombre de pages. |
| `readSpeed` | `average` | Vitesse de lecture utilisée pour les estimations (`slow`, `average`, `fast` ou `custom`). |
| `customWPM` | `250` | Nombre de mots par minute utilisé lorsque `readSpeed` vaut `custom`. |
| `showEstimate` | Activé | Active l'ensemble des estimations de temps de lecture. |
| `estimateFicPage` | Activé | Affiche le temps estimé sur la page de la fic. |
| `estimatePerChapter` | Activé | Affiche un temps estimé pour chaque chapitre. |
| `estimateListings` | Désactivé | Affiche les estimations directement dans les listes de fics. |
| `showLengthCategory` | Activé | Affiche la catégorie de longueur de la fic. |
| `thresholdShort` | `17500` | Nombre maximal de mots pour la catégorie **Short Story**. |
| `thresholdNovella` | `60000` | Nombre maximal de mots pour la catégorie **Novella** (au-delà : **Novel**). |

---

# Structure du module

Le module est composé de deux sous-modules fonctionnels ainsi qu'une feuille de style.

```text
_workLength.js
lengthDisplay.js
readingTime.js
workLength.css
```

---

# _workLength.js

## Rôle

Fichier coordinateur du module.

Il charge les réglages une seule fois, initialise les sous-modules et leur transmet la configuration nécessaire à leur fonctionnement.

## Responsabilités

- Initialise les deux sous-modules.
- Charge les réglages utilisateur.
- Centralise la configuration.
- Coordonne le démarrage du module.

## Fonctions exposées

Le coordinateur :

- initialise le module ;
- transmet les réglages aux sous-modules ;
- sert de point d'entrée unique pour le reste d'AO3 Helper.

---

# lengthDisplay.js

## Rôle

Ajoute plusieurs indicateurs visuels permettant d'estimer rapidement la longueur d'une œuvre.

Le module affiche des badges de catégorie, des comparaisons avec des livres connus ainsi qu'une estimation du nombre de pages.

Il reprend également les fonctionnalités de l'ancien module **pageCount**, désormais intégré ici.

---

## Fonctionnalités

### Catégories de longueur

Le module classe automatiquement chaque œuvre dans une catégorie selon son nombre de mots.

Les catégories disponibles sont :

- ⚡ Short Story
- 📄 Novella
- 📖 Novel

Les seuils utilisés sont entièrement configurables.

---

### Seuils personnalisables

Les catégories utilisent les réglages :

- `thresholdShort`
- `thresholdNovella`

Ces valeurs peuvent être modifiées afin d'adapter les catégories aux préférences de l'utilisateur.

---

### Comparaison avec des livres connus

Le module compare automatiquement la longueur d'une œuvre avec une bibliothèque d'environ dix-huit livres célèbres.

Les comparaisons permettent d'obtenir un repère plus concret que le simple nombre de mots.

Les références comprennent notamment des œuvres comme :

- Harry Potter
- 1984
- Le Seigneur des Anneaux

---

### Estimation du nombre de pages

Le module peut afficher une estimation du nombre de pages correspondant à la longueur de l'œuvre.

Cette estimation apparaît sous la forme :

```text
~XXX pages
```

Son affichage est contrôlé par le réglage :

`showPageEquiv`

---

## Détails techniques

### Configuration utilisée

Le sous-module utilise principalement :

- `showPageEquiv`
- `showLengthCategory`
- `thresholdShort`
- `thresholdNovella`

---

### Fusion de modules

Les fonctionnalités de l'ancien module **pageCount** ont été intégrées à `lengthDisplay.js`.

Le calcul du nombre de pages fait désormais partie de ce sous-module.

---

## Dépendances

Ce sous-module est initialisé par `_workLength.js`.


# readingTime.js

## Rôle

Calcule et affiche une estimation du temps de lecture d'une œuvre en fonction de la vitesse de lecture choisie par l'utilisateur.

Les estimations peuvent être affichées sur la page d'une œuvre, pour chaque chapitre ou directement dans les listes de résultats.

---

## Fonctionnalités

### Estimation du temps de lecture

Le module calcule automatiquement le temps nécessaire pour lire une œuvre à partir de son nombre de mots.

L'estimation est basée sur une vitesse de lecture exprimée en mots par minute (WPM).

---

### Vitesses de lecture

Quatre modes sont disponibles :

- **Slow** — 150 mots/minute
- **Average** — 250 mots/minute
- **Fast** — 400 mots/minute
- **Custom** — valeur définie par l'utilisateur

Le mode utilisé est contrôlé par le réglage :

`readSpeed`

---

### Vitesse personnalisée

Lorsque `readSpeed` est réglé sur `custom`, le module utilise la valeur définie dans :

`customWPM`

L'utilisateur peut ainsi adapter les estimations à sa propre vitesse de lecture.

---

### Affichage sur la page de la fic

Le temps de lecture estimé peut être affiché directement sur la page principale d'une œuvre.

Cette fonctionnalité est contrôlée par :

`estimateFicPage`

---

### Affichage par chapitre

Le module peut calculer le temps nécessaire pour lire chaque chapitre individuellement.

Chaque chapitre reçoit sa propre estimation basée sur son nombre de mots.

Cette fonctionnalité est contrôlée par :

`estimatePerChapter`

---

### Affichage dans les listes

Le temps de lecture peut également être affiché directement sur les listes d'œuvres.

Cette fonctionnalité est contrôlée par :

`estimateListings`

Elle est désactivée par défaut afin d'éviter de surcharger visuellement les listes.

---

### Activation générale

Toutes les estimations peuvent être activées ou désactivées en une seule fois grâce au réglage :

`showEstimate`

Lorsqu'il est désactivé, aucune estimation de temps n'est calculée ni affichée.

---

## Détails techniques

### Configuration utilisée

Le sous-module utilise principalement :

- `showEstimate`
- `estimateFicPage`
- `estimatePerChapter`
- `estimateListings`
- `readSpeed`
- `customWPM`

---

### Calcul

Le temps estimé est calculé à partir :

- du nombre total de mots ;
- de la vitesse de lecture sélectionnée.

Les estimations par chapitre utilisent le même principe, mais appliqué individuellement à chaque chapitre.

---

## Dépendances

Ce sous-module est initialisé par `_workLength.js`.

Il fonctionne indépendamment de `lengthDisplay.js`, bien que les deux puissent être affichés simultanément sur une même œuvre.

---

# workLength.css

## Rôle

Contient l'ensemble des styles utilisés par le module **Work Length**.

Il définit notamment l'apparence :

- des badges de longueur ;
- des catégories (Short Story, Novella, Novel) ;
- des estimations du nombre de pages ;
- des indicateurs de temps de lecture ;
- des comparaisons avec les livres de référence.


# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou documentées ailleurs dans le projet, mais ne disposent pas encore d'une implémentation complète.

---

## Estimation de longueur

### Filtre "Je peux la finir"

Permettre de filtrer les œuvres selon qu'elles peuvent être lues en une seule session.

---

### Longueur moyenne des chapitres

Calculer automatiquement la longueur moyenne des chapitres d'une œuvre.

---

### Longueur des séries

Calculer le nombre total de mots d'une série complète.

---

### Nombre de pages personnalisable

Permettre à l'utilisateur de choisir combien de mots correspondent à une page.

La valeur est actuellement fixée à **275 mots par page**.

---

### Estimation adaptée à l'appareil

Adapter automatiquement le calcul du nombre de pages selon le type d'appareil utilisé :

- téléphone ;
- tablette ;
- ordinateur.

---

### Estimation adaptée au style

Adapter les estimations selon le genre ou le style d'écriture de l'œuvre.

---

### Aperçu papier

Afficher une prévisualisation simulant la mise en page d'un livre imprimé.

---

### Formats d'affichage

Proposer plusieurs styles d'affichage pour l'estimation du nombre de pages.

---

### Comparaisons personnalisées

Permettre à l'utilisateur de comparer les œuvres avec ses propres livres de référence plutôt qu'avec la bibliothèque intégrée.

---

### Source externe

Récupérer automatiquement les informations de comparaison depuis un service externe au lieu d'utiliser uniquement la liste intégrée.

---

### ~~Catégories supplémentaires~~ ✅ Fait (partiellement)

~~Ajouter de nouvelles catégories de longueur.~~

> Ajoutées : Flash Fiction (≤ 1 000 mots) et Epic Novel (> 150 000 mots), en
> plus des 3 catégories existantes (Short story / Novella / Novel) — tous
> les seuils sont réglables dans le panneau. "Novelette" n'a pas été ajoutée
> séparément (5 paliers déjà suffisamment fins) ; à revoir si le besoin se
> confirme.

---

### Dégradé visuel

Afficher un dégradé de couleurs permettant d'identifier rapidement les œuvres les plus courtes ou les plus longues dans les listes.

---

## Temps de lecture

### Vitesse de lecture automatique

Calculer automatiquement la vitesse de lecture réelle de l'utilisateur à partir de son historique.

---

### Temps restant

Afficher le temps restant avant la fin de la lecture d'une œuvre en cours.

---

### Marathon de lecture

Conserver le temps total passé à lire plusieurs œuvres successivement.

---

### Chronomètre

Ajouter un chronomètre de session de lecture.

---

### Suggestions de pauses

Proposer automatiquement des pauses pendant les longues sessions de lecture.

---

### Historique de vitesse

Suivre l'évolution de la vitesse de lecture de l'utilisateur au fil du temps.

---

### "Puis-je finir cette fic ?"

Calculer automatiquement si une œuvre peut être terminée avant une heure donnée.

Exemple :

- ✅ Tu peux finir
- 🟡 Peut-être
- ❌ Trop long

---

## Intégration avec les filtres

### Filtre par longueur

Filtrer directement les œuvres selon une plage de nombre de mots.

Cette idée existe déjà dans le module **Filter Manager** et ne fait donc pas partie des responsabilités de **Work Length**.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Recommandations

Le module ne recommande jamais une longueur "idéale" pour une œuvre.

Il fournit uniquement des informations objectives afin de laisser l'utilisateur libre de son interprétation.

---

## Évaluation de la qualité

Le module ne tente pas de calculer une note globale à partir :

- des kudos ;
- des bookmarks ;
- des commentaires ;
- ou d'autres statistiques.

Cette approche a été jugée trop subjective.

---

## Comparaison entre œuvres

Le module ne propose pas de comparer plusieurs œuvres côte à côte.

Les comparaisons détaillées (mots, chapitres, kudos, tags, etc.) ont été écartées car elles apportaient peu de valeur pour ce module.

---

## Seuils de longueur

Les seuils des catégories :

- `thresholdShort`
- `thresholdNovella`

sont entièrement configurables.

Une ancienne documentation indiquait à tort que ces seuils étaient fixes ou que cette fonctionnalité avait été abandonnée.

Ce n'est plus le cas : ils sont pleinement pris en charge par le module.


