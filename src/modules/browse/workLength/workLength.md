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
| `wordsPerPage` | `275` | Combien de mots comptent pour une page |
| `pageFormat` | `compact` | Format d'affichage des pages : "~123 pg" ou "~123 pages" |
| `readSpeed` | `average` | La vitesse de lecture : lent (150 mots/min), moyen (250), rapide (400), ou personnalisé |
| `customWPM` | `250` | Le nombre de mots par minute utilisé si la vitesse est réglée sur "personnalisé" |
| `showEstimate` | activé | Interrupteur principal pour l'estimation du temps de lecture |
| `estimateFicPage` | activé | Affiche le temps de lecture sur la page de la fic |
| `estimatePerChapter` | activé | Affiche le temps de lecture par chapitre |
| `estimateListings` | désactivé | Affiche le temps de lecture sur les listes |
| `showRemainingTime` | activé | Affiche "⏳ ~Xh left" sur les pages de chapitre (temps restant estimé) |
| `showOneSitting` | désactivé | Marque "🛋 One sitting" les fics lisibles d'une traite |
| `oneSittingMinutes` | `60` | Le seuil (minutes) pour le badge "une seule traite" |
| `finishByTime` | (vide) | Heure cible "HH:MM" — badge ✅/🤏/⏰ "finissable avant cette heure" |
| `showLengthCategory` | activé | Affiche la catégorie de longueur (Flash/Short story/Novella/Novel/Epic) |
| `thresholdFlash` | `1000` | Seuil "Flash Fiction" |
| `thresholdShort` | `17500` | Le nombre de mots en dessous duquel une fic est une "Short story" |
| `thresholdNovella` | `60000` | Le nombre de mots en dessous duquel une fic est une "Novella" |
| `thresholdEpic` | `150000` | Au-delà, c'est un "Epic Novel" |
| `showAvgChapterLength` | désactivé | Affiche "📊 ~X w/ch" (longueur moyenne d'un chapitre) sur la page de la fic |
| `showSeriesTotal` | activé | Affiche le total de mots d'une série en haut de sa page |
| `lengthGradient` | désactivé | Teinte les compteurs de mots des listes selon la longueur relative |
| `customBooks` | (vide) | Tes propres livres de comparaison, un par ligne : "Titre: 50000" |

## Fichiers

### 1. `_workLength.js` — le chef d'orchestre

- Charge les réglages une seule fois au démarrage et met en route les deux autres fichiers

### 2. `lengthDisplay.js` — badges de longueur

- Affiche un badge de catégorie (🔥 Flash / ⚡ Short story / 📄 Novella / 📖 Novel / 📚 Epic) selon le nombre de mots, avec des seuils réglables
- Compare le nombre de mots à un livre connu parmi 18 références (Harry Potter, 1984, Le Seigneur des Anneaux...), plus tes propres livres ajoutés dans le panneau
- Peut aussi afficher une estimation du nombre de pages (mots/page et format réglables)
- Peut afficher la longueur moyenne d'un chapitre sur la page d'une fic multi-chapitres
- Sur une page de série, affiche le total de mots de toute la série
- Peut teinter les compteurs de mots des listes (plus la fic est longue par rapport aux autres de la page, plus la teinte est marquée)

### 3. `readingTime.js` — temps de lecture estimé

- Calcule un temps de lecture selon une vitesse choisie (lent, moyen, rapide, ou personnalisé)
- Peut l'afficher sur la page de la fic, par chapitre, et/ou sur les listes
- Peut marquer "🛋 One sitting" les fics lisibles d'une traite (seuil réglable)
- Sur une page de chapitre, estime le temps restant avant la fin de la fic ("⏳ ~2h left")
- Peut dire si la fic est finissable avant une heure cible ("⏰ by 23:00" : ✅ / 🤏 / ⏰)

### 4. `lengthMath.js` — calculs extraits

- Les calculs purs derrière les badges : progression de chapitres, moyenne par chapitre, mots restants, verdict "finissable avant l'heure", teinte du dégradé, parsing des livres personnalisés, format des pages

### 5. `workLength.css`

- Les styles visuels des badges et indicateurs de temps

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Filtrer les fics selon "je peux la finir en une seule fois"~~ ✅
  Fait (sous forme de repère plutôt que de filtre) : badge "🛋 One sitting"
  sur les fics dont le temps de lecture tient dans un seuil réglable
  (`showOneSitting` + `oneSittingMinutes`, 60 min par défaut). Le masquage
  des autres fics relève des filtres (`filterManager`), pas de ce module.
- ~~Indiquer la longueur moyenne d'un chapitre~~ ✅
  Fait : badge "📊 ~X w/ch" sur la page d'une fic multi-chapitres
  (`showAvgChapterLength`).
- ~~Additionner le nombre de mots total d'une série entière~~ ✅
  Fait : bandeau "Σ X words across N works" en haut des pages de série
  (`showSeriesTotal`), avec équivalent en pages si activé.
- ~~Choisir soi-même combien de mots il y a par page — en ce moment c'est toujours fixé à 275~~ ✅
  Fait : réglage `wordsPerPage` (275 par défaut).
- ~~Différents formats d'affichage pour les pages — en ce moment il n'y a qu'un seul format~~ ✅
  Fait : réglage `pageFormat` — compact ("~123 pg") ou complet ("~123 pages").
- ~~Un indicateur du temps qu'il reste avant de finir une fic en cours~~ ✅
  Fait : badge "⏳ ~Xh left" sur les pages de chapitre, estimé d'après les
  chapitres restants (`showRemainingTime`).
- ~~Comparer à des livres choisis par soi-même, pas juste les 18 déjà prévus~~ ✅
  Fait : champ `customBooks` dans le panneau (un livre par ligne,
  "Titre: 50000"), fusionné avec la liste intégrée pour la comparaison.
- ~~Un calcul pour savoir si on a le temps de finir une fic avant une heure précise (par exemple avant de se coucher), avec un badge du genre "tu peux finir !", "peut-être" ou "trop long"~~ ✅
  Fait : réglage `finishByTime` ("HH:MM") — badge ✅ "you can finish it" /
  🤏 "it will be tight" (jusqu'à 20 % de dépassement) / ⏰ "too long", basé
  sur le temps restant si on est en cours de fic.
- ~~Plus de catégories de longueur (par exemple "Flash Fiction" pour les
  toutes petites ou "Epic Novel" pour les très longues), au lieu des 3
  catégories actuelles~~ ✅ Fait : 5 catégories désormais (Flash Fiction ≤
  1 000 mots, Short story, Novella, Novel, Epic Novel > 150 000 mots), tous
  les seuils réglables dans le panneau.
- ~~Un dégradé de couleur sur les listes pour repérer d'un coup d'œil les fics plus longues ou plus courtes que les autres~~ ✅
  Fait : réglage `lengthGradient` — le compteur de mots de chaque fic est
  teinté proportionnellement à sa longueur par rapport aux autres fics de la
  page (teinte neutre, sans connotation bien/mal).

## Explicitement écarté

- Recevoir une recommandation sur la longueur "idéale" d'une fic — pour rester neutre
- Donner à chaque fic une note de qualité globale (genre A/B/C/D) calculée automatiquement à partir des kudos, des favoris et des commentaires — écarté, jugé trop subjectif
- Comparer deux ou trois fics côte à côte (mots, chapitres, kudos, vues, tags communs et différents) — écarté par manque d'intérêt de la part des utilisateurs
- Calculer automatiquement ta propre vitesse de lecture selon ton historique — écarté : mesurer une vraie vitesse exigerait de suivre le temps de lecture actif (le temps de page ouverte surestime énormément) ; résultat peu fiable, le réglage `customWPM` couvre le besoin
- Adapter l'estimation de pages selon l'appareil (téléphone, tablette, ordinateur) — écarté : c'est exactement ce que permet le réglage `wordsPerPage`, sans détection d'appareil fragile
- Adapter l'estimation selon le genre ou le style d'écriture — écarté : aucun signal fiable du "style" dans les métadonnées AO3, résultat arbitraire
- Un aperçu façon "impression papier" — écarté : hors du périmètre d'un module de statistiques ; le téléchargement PDF (`ficDownloader`) donne déjà une version imprimable
- Un mode "marathon de lecture" (temps total passé à lire plusieurs fics d'affilée) — écarté : le suivi de sessions de lecture est le rôle de `readingTracker`, pas d'un module d'affichage de longueur
- Un chronomètre de session de lecture — écarté : même raison (rôle de `readingTracker`)
- Des suggestions de pauses pendant la lecture — écarté : intrusif et subjectif, hors périmètre
- Suivre l'évolution de ta vitesse de lecture au fil du temps — écarté : dépend de la mesure automatique de vitesse, elle-même écartée comme peu fiable
- Se connecter à un site externe pour les infos de longueur — écarté : dépendance réseau externe (vie privée + fragilité) pour un gain marginal, la liste locale + les livres personnalisés suffisent
- Filtrer directement les résultats selon une fourchette de nombre de mots (mini et maxi) — écarté ici : c'est le rôle du module de filtres (`filterManager`), où l'idée est déjà répertoriée

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

* Il permet notamment de :
    - afficher une catégorie de longueur (Short Story, Novella ou Novel) ;
    - comparer la longueur d'une œuvre à des livres connus ;
    - afficher une estimation du nombre de pages ;
    - calculer un temps de lecture estimé ;
    - afficher ce temps sur la page d'une œuvre, par chapitre et/ou dans les listes.

---

# Réglages utilisateur

| Réglage               | Description                                                                               |
|-----------------------|-------------------------------------------------------------------------------------------|
| `showPageEquiv`       | Affiche une estimation du nombre de pages.                                                |
| `readSpeed`           | Vitesse de lecture utilisée pour les estimations (`slow`, `average`, `fast` ou `custom`). |
| `customWPM`           | Nombre de mots par minute utilisé lorsque `readSpeed` vaut `custom`.                      |
| `showEstimate`        | Active l'ensemble des estimations de temps de lecture.                                    |
| `estimateFicPage`     | Affiche le temps estimé sur la page de la fic.                                            |
| `estimatePerChapter`  | Affiche un temps estimé pour chaque chapitre.                                             |
| `estimateListings`    | Affiche les estimations directement dans les listes de fics.                              |
| `showLengthCategory`  | Affiche la catégorie de longueur de la fic.                                               |
| `thresholdShort`      | Nombre maximal de mots pour la catégorie **Short Story**.                                 |
| `thresholdNovella`    | Nombre maximal de mots pour la catégorie **Novella** (au-delà : **Novel**).               |

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

### ~~Filtre "Je peux la finir"~~ ✅ Fait (en badge)

~~Permettre de filtrer les œuvres selon qu'elles peuvent être lues en une seule session.~~

> Badge "🛋 One sitting" quand le temps de lecture tient dans le seuil
> réglable (`oneSittingMinutes`). Le filtrage par masquage reste du ressort
> de Filter Manager.

---

### ~~Longueur moyenne des chapitres~~ ✅ Fait

~~Calculer automatiquement la longueur moyenne des chapitres d'une œuvre.~~

> Badge "📊 ~X w/ch" sur la page des fics multi-chapitres
> (`showAvgChapterLength`).

---

### ~~Longueur des séries~~ ✅ Fait

~~Calculer le nombre total de mots d'une série complète.~~

> Bandeau "Σ X words across N works" en haut des pages de série
> (`showSeriesTotal`).

---

### ~~Nombre de pages personnalisable~~ ✅ Fait

~~Permettre à l'utilisateur de choisir combien de mots correspondent à une page.~~

> Réglage `wordsPerPage` (275 par défaut, 50–1000).

---

### ~~Estimation adaptée à l'appareil~~ ❌ Écarté

~~Adapter automatiquement le calcul du nombre de pages selon le type d'appareil.~~

> Écarté : `wordsPerPage` couvre exactement ce besoin, sans détection
> d'appareil fragile ni comportement qui change tout seul.

---

### ~~Estimation adaptée au style~~ ❌ Écarté

~~Adapter les estimations selon le genre ou le style d'écriture de l'œuvre.~~

> Écarté : aucun signal fiable du "style" dans les métadonnées AO3 — le
> résultat serait arbitraire.

---

### ~~Aperçu papier~~ ❌ Écarté

~~Afficher une prévisualisation simulant la mise en page d'un livre imprimé.~~

> Écarté : hors du périmètre d'un module de statistiques ; le
> téléchargement PDF (`ficDownloader`) fournit déjà une version imprimable.

---

### ~~Formats d'affichage~~ ✅ Fait

~~Proposer plusieurs styles d'affichage pour l'estimation du nombre de pages.~~

> Réglage `pageFormat` : compact ("~123 pg") ou complet ("~123 pages").

---

### ~~Comparaisons personnalisées~~ ✅ Fait

~~Permettre à l'utilisateur de comparer les œuvres avec ses propres livres de référence.~~

> Champ `customBooks` du panneau (un livre par ligne, "Titre: 50000"),
> fusionné avec les 18 références intégrées.

---

### ~~Source externe~~ ❌ Écarté

~~Récupérer automatiquement les informations de comparaison depuis un service externe.~~

> Écarté : dépendance réseau externe (vie privée + fragilité) pour un gain
> marginal — la liste locale plus les livres personnalisés suffisent.

---

### ~~Catégories supplémentaires~~ ✅ Fait (partiellement)

~~Ajouter de nouvelles catégories de longueur.~~

> Ajoutées : Flash Fiction (≤ 1 000 mots) et Epic Novel (> 150 000 mots), en
> plus des 3 catégories existantes (Short story / Novella / Novel) — tous
> les seuils sont réglables dans le panneau. "Novelette" n'a pas été ajoutée
> séparément (5 paliers déjà suffisamment fins) ; à revoir si le besoin se
> confirme.

---

### ~~Dégradé visuel~~ ✅ Fait

~~Afficher un dégradé de couleurs permettant d'identifier rapidement les œuvres les plus courtes ou les plus longues dans les listes.~~

> Réglage `lengthGradient` : teinte proportionnelle à la longueur relative
> sur la page (teinte unique neutre, intensité croissante — pas de code
> couleur bien/mal).

---

## Temps de lecture

### ~~Vitesse de lecture automatique~~ ❌ Écarté

~~Calculer automatiquement la vitesse de lecture réelle de l'utilisateur à partir de son historique.~~

> Écarté : mesurer une vitesse réelle exigerait de suivre le temps de
> lecture actif (le temps de page ouverte surestime énormément). Résultat
> peu fiable — `customWPM` couvre le besoin.

---

### ~~Temps restant~~ ✅ Fait

~~Afficher le temps restant avant la fin de la lecture d'une œuvre en cours.~~

> Badge "⏳ ~Xh left" sur les pages de chapitre, estimé au prorata des
> chapitres restants (`showRemainingTime`).

---

### ~~Marathon de lecture~~ ❌ Écarté

~~Conserver le temps total passé à lire plusieurs œuvres successivement.~~

> Écarté : le suivi de sessions de lecture est le rôle de `readingTracker` ;
> dupliquer ce suivi ici créerait deux vérités concurrentes.

---

### ~~Chronomètre~~ ❌ Écarté

~~Ajouter un chronomètre de session de lecture.~~

> Écarté : même raison — rôle de `readingTracker`.

---

### ~~Suggestions de pauses~~ ❌ Écarté

~~Proposer automatiquement des pauses pendant les longues sessions de lecture.~~

> Écarté : intrusif et subjectif, hors du périmètre d'un module
> d'affichage de statistiques.

---

### ~~Historique de vitesse~~ ❌ Écarté

~~Suivre l'évolution de la vitesse de lecture de l'utilisateur au fil du temps.~~

> Écarté : dépend de la mesure automatique de vitesse, elle-même écartée
> comme peu fiable.

---

### ~~"Puis-je finir cette fic ?"~~ ✅ Fait

~~Calculer automatiquement si une œuvre peut être terminée avant une heure donnée.~~

> Réglage `finishByTime` ("HH:MM") : badge ✅ "you can finish it" /
> 🤏 "it will be tight" (jusqu'à 20 % de dépassement) / ⏰ "too long",
> calculé sur le temps restant quand on est en cours de fic. Une heure déjà
> passée vise le lendemain.

---

## Intégration avec les filtres

### ~~Filtre par longueur~~ ❌ Écarté (hors périmètre)

~~Filtrer directement les œuvres selon une plage de nombre de mots.~~

> Cette idée existe déjà dans le module **Filter Manager** et ne fait donc
> pas partie des responsabilités de **Work Length**.

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


