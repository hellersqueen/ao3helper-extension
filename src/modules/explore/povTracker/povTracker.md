# povTracker

**Tab:** Explore

## À quoi ça sert

Ce module devine automatiquement le point de vue narratif (1ère, 2e, 3e
personne, mixte ou multi) d'une fic à partir de ses tags et de son résumé.
Il affiche ensuite un badge sur les listes et propose des filtres pour ne
voir que certains points de vue.

C'est une détection expérimentale, basée sur des motifs de texte simples
(pas une vraie lecture de la fic) : elle est juste assez fiable pour être
utile, mais pas parfaite (autour de 60% de bonnes réponses).

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showBadgesOnBlurbs` | activé | Affiche les badges de point de vue sur les listes (seulement pour les fics déjà analysées) |
| `badgeFirst` | activé | Affiche le badge 1ère personne |
| `badgeSecond` | désactivé | Affiche le badge 2e personne |
| `badgeThird` | activé | Affiche le badge 3e personne |
| `badgeMixed` | désactivé | Affiche le badge point de vue mixte |
| `badgeMulti` | désactivé | Affiche le badge multi-points de vue |
| `badgeUnknown` | désactivé | Affiche le badge point de vue inconnu |
| `enablePovFilters` | activé | Ajoute des cases à cocher pour filtrer les listes par point de vue |
| `autoAnalyze` | activé | Analyse automatiquement à l'ouverture de la page d'une fic |
| `showStats` | désactivé | Affiche un résumé personnel de la répartition des points de vue |
| `analyzeFullText` | activé | Analyse le texte intégral du chapitre affiché (pronoms), plus fiable que les tags/résumé seuls |
| `showDetailPanel` | activé | Affiche un panneau sur la page d'une œuvre : verdict global + détail chapitre par chapitre |
| `autoApplyPreferredFilter` | désactivé | Masque automatiquement les fics hors de tes points de vue préférés |
| `preferredPovs` | (vide) | Tes points de vue préférés, séparés par des virgules ("first,third") |

## Fichiers

### 1. `_povTracker.js` — le chef d'orchestre

- Met en route les autres fichiers et partage les réglages avec eux

### 2. `povAnalysis.js` — détection du point de vue

- Analyse les tags et le résumé d'une fic pour deviner son point de vue (utilisé sur les listes)
- Garde en mémoire, par fic, les analyses de texte intégral faites chapitre par chapitre (`recordChapterAnalysis`) au fur et à mesure de la lecture
- Calcule un verdict combiné (`getCombinedResult`) : utilise les analyses de texte intégral quand elles existent (plus fiables), sinon retombe sur le résultat tags/résumé ; détecte "multi" quand les chapitres lus ne s'accordent pas
- Garde le résultat en mémoire pendant 7 jours, pour ne pas refaire l'analyse à chaque fois

### 3. `povTextAnalysis.js` — analyse du texte intégral

- Compte les pronoms de 1ère/2e/3e personne dans un texte
- Classe le résultat (dominante nette, faible, ou "mixed" si deux personnes sont fortement représentées)
- Refuse de conclure si le texte est trop court (`MIN_ANALYZABLE_CHARS`) ou sans aucun pronom détecté

### 4. `povPreferences.js` — préférences utilisateur

- Découpe le réglage `preferredPovs` ("first,third") en liste de clés valides

### 5. `povDetailPanel.js` — panneau sur la page d'une œuvre

- Analyse le texte du chapitre actuellement affiché et l'enregistre via `povAnalysis`
- Affiche un panneau : verdict global, cohérence entre les chapitres déjà lus (avec avertissement si le point de vue change), et la liste des chapitres analysés

### 6. `povPresentation.js` — badges et filtres

- Affiche un badge coloré sur chaque fic d'une liste, selon son point de vue
- Ajoute une barre de filtres cliquables pour cacher ou montrer les fics selon leur point de vue
- Peut afficher un petit résumé de la répartition des points de vue rencontrés
- Applique automatiquement un filtre sur les points de vue préférés si `autoApplyPreferredFilter` est activé

### 7. `povTracker.css`

- Les styles visuels des badges, de la barre de filtres, de la barre de statistiques et du panneau détaillé

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, avec leur statut :

- ~~Deviner le point de vue en lisant vraiment le texte de l'histoire (en comptant des mots comme "je", "tu", "il/elle") — en ce moment, ça regarde seulement les tags et le résumé, pas le texte réel de la fic~~ ✅ Fait
  Réglage `analyzeFullText` : compte les pronoms 1ère/2e/3e personne dans le
  texte du chapitre affiché (`povTextAnalysis.js`), plus fiable que les tags
  et le résumé. N'analyse que les chapitres réellement ouverts (pas de
  pré-chargement des autres chapitres).
- ~~Suivre le point de vue chapitre par chapitre à l'intérieur d'une même fic~~ ✅ Fait (partiellement)
  Chaque chapitre visité est analysé et mémorisé séparément
  (`recordChapterAnalysis`). Limite assumée : seuls les chapitres que
  l'utilisateur ouvre réellement sont suivis, pas l'ensemble de la fic d'un
  coup (éviterait des requêtes réseau supplémentaires par chapitre).
- ~~Un panneau sur la page de la fic qui montre un résumé global et une liste chapitre par chapitre du point de vue~~ ✅ Fait
  Réglage `showDetailPanel` (`povDetailPanel.js`) : verdict global + liste
  des chapitres déjà analysés, affichée dès que plus d'un chapitre a été lu.
- ~~Vérifier qu'il y a assez de texte avant de se lancer dans une analyse~~ ✅ Fait
  `MIN_ANALYZABLE_CHARS` (200 caractères) dans `povTextAnalysis.js` : en
  dessous, ou sans aucun pronom détecté, l'analyse retourne "pas de verdict"
  plutôt qu'un résultat peu fiable.
- ~~Prévenir quand le point de vue change en cours de route dans une fic~~ ✅ Fait
  Le panneau détaillé affiche "⚠️ POV change detected across chapters read"
  dès que deux chapitres analysés divergent.
- ~~Vérifier si le point de vue reste cohérent du début à la fin~~ ✅ Fait (partiellement)
  Le panneau affiche "Consistent across N chapters read" quand tous les
  chapitres analysés jusqu'ici concordent — seulement sur les chapitres
  déjà lus, pas une vérification de la fic entière d'un coup.
- ~~Enregistrer sa préférence de point de vue une bonne fois pour toutes, et filtrer automatiquement selon elle~~ ✅ Fait
  Réglages `preferredPovs` + `autoApplyPreferredFilter` : masque
  automatiquement les fics dont le point de vue détecté n'est pas dans la
  liste préférée, sans avoir à recliquer les filtres à chaque page.
- ~~Deviner le style d'écriture habituel d'un auteur selon les points de vue qu'il utilise~~ ❌ Écarté
  Nécessiterait de télécharger et analyser toutes les œuvres d'un auteur
  (requêtes réseau supplémentaires, fiabilité incertaine) pour un bénéfice
  marginal par rapport à l'analyse par fic déjà en place.
- ~~Recommander des fics selon le point de vue préféré~~ ❌ Écarté
  Couvert autrement : le filtre automatique sur les POV préférés (ci-dessus)
  répond déjà au besoin pratique. Un vrai moteur de recommandation a été
  explicitement écarté à l'échelle du projet (voir "Recommendation Engine"
  dans `docs/never-built-modules.md`).
- ~~Mieux repérer les fics qui mélangent plusieurs points de vue en même temps~~ ✅ Fait
  Le verdict combiné (`getCombinedResult`) classe une fic "multi" dès que
  ses chapitres analysés en texte intégral divergent, même si la fic n'est
  pas explicitement taguée comme multi-POV — plus fiable que la détection
  par tags seule.



AO3 Helper - POV Tracker Module Coordinator
    Module ID: povTracker
    Display Name: POV Tracker
    Tab: Explore

    Submodules (imported directly as ES modules):
        PovAnalysis (povAnalysis.js)         -- pronoun heuristics + cache
        PovPresentation (povPresentation.js) -- badge injection + filter controls
        PovDetailPanel (povDetailPanel.js)   -- work-page full-text analysis + panel
    Pure helpers:
        povTextAnalysis.js -- full-text pronoun counting/classification
        povPreferences.js  -- preferredPovs setting parsing

    Coordinator role:
        - Registers as 'povTracker'
        - Defines shared DEFAULTS + cfg()
        - Exposes W.AO3H_PovTracker API for helper files
        - Instantiates Analysis, Presentation, and DetailPanel helpers
        - Returns cleanup that cascades to all three instances

    Storage keys:
        ao3h:mod:povTracker:settings  -- user settings (JSON)
        ao3h_pov_tracker_data_v1      -- analysis cache { [workId]: { pov, confidence, lastUpdated, chapters? } }

    ⚠️ Précision (mise à jour) : le cache contient désormais, en plus du
    résultat tags/résumé, un tableau optionnel `chapters` — les analyses de
    texte intégral faites chapitre par chapitre au fil de la lecture (voir
    PovDetailPanel). `getCombinedResult(workId)` retourne le meilleur
    verdict disponible : basé sur `chapters` quand il existe, sinon sur le
    résultat tags/résumé.


AO3 Helper - POV Tracker: Analysis
    Module ID: povTracker (helper — instantiated by _povTracker.js)
    Class:     PovAnalysis
    Role:      Pronoun heuristics from tag/summary text + localStorage cache

    POV detection strategy:
        1. Parse the work's tags + summary DOM for pronoun signals
        2. Classify as: 'first', 'second', 'third', 'mixed', 'multi', 'unknown'
        3. Cache result in ao3h_pov_tracker_data_v1 keyed by workId

    Cache schema (per entry):
        { pov: string, confidence: 'high'|'low', lastUpdated: number,
          chapters?: Array<{ chapterId, label, pov, confidence, sampleSize, lastUpdated }> }


        AO3 Helper - POV Tracker: Presentation
    Module ID: povTracker (helper — instantiated by _povTracker.js)
    Class:     PovPresentation
    Role:      Badge injection on work blurbs + optional filter bar + stats panel

    Badge config keys (one per POV type, controlled via panel settings):
        badgeFirst | badgeSecond | badgeThird | badgeMixed | badgeMulti | badgeUnknown
    Toggle keys:
        showBadgesOnBlurbs  -- master switch for badge injection
        enablePovFilters    -- inject filter buttons above work listings
        showStats           -- inject a mini stats bar (counts by POV type)

    Badge anatomy:
        <span class="ao3h-pov-badge ao3h-pov-{type}" title="POV: {label}">
            POV label text
        </span>
        Appended to h4.heading inside the work blurb.

    Filter bar:
        <div id="ao3h-pov-filter-bar"> contains toggle buttons per POV type.
        Clicking hides/shows blurbs that have that POV.


═══════════════════════════════════════════════════════════════════════════
  # povTracker
  **Tab :** Explore
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **POV Tracker** tente de déterminer automatiquement le point de vue narratif d’une œuvre AO3 à partir de ses tags et de son résumé.

* Il peut classer une œuvre comme étant écrite à la :
    - première personne ;
    - deuxième personne ;
    - troisième personne ;
    - personne mixte ;
    - avec plusieurs points de vue ;
    - avec un point de vue inconnu.

* Le résultat peut ensuite être utilisé pour :
    - afficher un badge sur les œuvres présentes dans les listes ;
    - filtrer les œuvres selon leur point de vue ;
    - afficher des statistiques personnelles sur les points de vue rencontrés.

Sur les listes, la détection reste basée sur des motifs de texte simples et des heuristiques liées aux pronoms trouvés dans les tags et le résumé (précision estimée à environ **60 %**). Sur la page d’une œuvre, le module peut désormais aussi lire le texte intégral du chapitre affiché (`analyzeFullText`) pour un verdict plus fiable, chapitre par chapitre, au fil de la lecture — sans jamais télécharger ou pré-analyser les chapitres non ouverts.

---

# Réglages utilisateur

| Réglage              | Ce que ça fait                                                                    |
| -------------------- | --------------------------------------------------------------------------------- |
| `showBadgesOnBlurbs` | Affiche les badges de point de vue sur les œuvres déjà analysées dans les listes. |
| `badgeFirst`         | Affiche les badges associés à la première personne.                               |
| `badgeSecond`        | Affiche les badges associés à la deuxième personne.                               |
| `badgeThird`         | Affiche les badges associés à la troisième personne.                              |
| `badgeMixed`         | Affiche les badges associés aux points de vue mixtes.                             |
| `badgeMulti`         | Affiche les badges associés aux œuvres comportant plusieurs points de vue.        |
| `badgeUnknown`       | Affiche les badges associés aux œuvres dont le point de vue est inconnu.          |
| `enablePovFilters`   | Ajoute des contrôles permettant de filtrer les listes par point de vue.           |
| `autoAnalyze`        | Analyse automatiquement l’œuvre à l’ouverture de sa page.                         |
| `showStats`          | Affiche un résumé personnel de la répartition des points de vue.                  |
| `analyzeFullText`    | Analyse le texte intégral du chapitre affiché plutôt que les tags/résumé seuls.   |
| `showDetailPanel`    | Affiche le panneau détaillé (verdict global + détail par chapitre) sur la page d’une œuvre. |
| `autoApplyPreferredFilter` | Masque automatiquement les œuvres hors des points de vue préférés.        |
| `preferredPovs`      | Liste des points de vue préférés, séparés par des virgules.                       |

---

# Structure du module

Le module est composé d’un fichier coordinateur, de quatre sous-modules fonctionnels et d’une feuille de style.

```text
_povTracker.js
povAnalysis.js
povTextAnalysis.js
povPreferences.js
povDetailPanel.js
povPresentation.js
povTracker.css
```

---

# _povTracker.js

## Rôle

Fichier coordinateur du module.

Il enregistre le module **POV Tracker**, initialise les sous-modules d’analyse et de présentation, partage les réglages communs et expose une API globale au reste d’AO3 Helper.

---

## Responsabilités

* Enregistre le module sous l’identifiant `povTracker`.
* Définit les réglages par défaut partagés.
* Fournit une fonction commune de lecture de la configuration.
* Initialise `PovAnalysis`.
* Initialise `PovPresentation`.
* Partage les réglages entre les deux sous-modules.
* Expose une API globale pour les fichiers auxiliaires.
* Nettoie les deux instances lorsque le module est désactivé ou détruit.

---

## Fonctions exposées

Le coordinateur expose une API sous :

`window.AO3H_PovTracker`

Cette API permet aux fichiers auxiliaires et au reste de l’extension d’accéder aux fonctionnalités du module.

---

## Détails techniques

### Sous-modules importés

Le coordinateur importe directement les classes suivantes sous forme de modules ES :

* `PovAnalysis` depuis `povAnalysis.js`
* `PovPresentation` depuis `povPresentation.js`

---

### Nettoyage

La fonction de nettoyage du coordinateur transmet l’opération aux deux instances afin de supprimer leurs éléments, observateurs et comportements actifs.

---

### Clés de stockage

Le module utilise les clés suivantes :

```text
ao3h:mod:povTracker:settings
ao3h_pov_tracker_data_v1
```

La première contient les réglages utilisateur au format JSON.

La seconde contient le cache des analyses, organisé par identifiant d’œuvre.

---

# povAnalysis.js

## Rôle

Analyse les tags et le résumé d’une œuvre afin d’estimer son point de vue narratif.

Il utilise des heuristiques fondées sur les pronoms et conserve les résultats dans `localStorage` afin d’éviter de refaire les mêmes analyses inutilement.

---

## Fonctionnalités

### Analyse du point de vue

Le module récupère le texte disponible dans :

* les tags de l’œuvre ;
* le résumé de l’œuvre.

Il recherche ensuite des indices linguistiques pouvant correspondre à différents points de vue narratifs.

---

### Catégories détectées

Une œuvre peut être classée dans l’une des catégories suivantes :

* `first`
* `second`
* `third`
* `mixed`
* `multi`
* `unknown`

Ces valeurs correspondent respectivement à :

* première personne ;
* deuxième personne ;
* troisième personne ;
* point de vue mixte ;
* plusieurs points de vue ;
* point de vue inconnu.

---

### Analyse automatique

Lorsque `autoAnalyze` est activé, le module lance automatiquement l’analyse à l’ouverture de la page d’une œuvre.

Le résultat peut ensuite être utilisé dans les listes lorsqu’une œuvre déjà analysée réapparaît.

---

### Niveau de confiance

Chaque analyse contient également un niveau de confiance.

Les valeurs possibles sont :

* `high`
* `low`

Ce niveau indique si les indices trouvés sont considérés comme relativement clairs ou incertains.

---

### Mise en cache

Le résultat de chaque analyse est conservé pendant **7 jours**.

Cela permet :

* d’éviter de refaire l’analyse à chaque visite ;
* de réduire les traitements inutiles ;
* de réutiliser le résultat sur les listes AO3.

---

### Actualisation du cache

Chaque entrée contient une date de dernière mise à jour.

Lorsqu’un résultat devient trop ancien, le module peut refaire l’analyse et remplacer l’entrée existante.

---

## Détails techniques

### Stratégie de détection

La détection suit principalement les étapes suivantes :

1. récupérer les tags et le résumé dans le DOM ;
2. rechercher des signaux associés aux pronoms et aux formulations narratives ;
3. calculer la catégorie la plus probable ;
4. attribuer un niveau de confiance ;
5. enregistrer le résultat dans le cache.

---

### Limites de l’analyse

Le module ne lit pas le texte complet de l’œuvre.

Il se base seulement sur les informations accessibles dans les tags et le résumé.

Il ne peut donc pas garantir :

* que le point de vue détecté est celui réellement utilisé dans le texte ;
* que le point de vue reste identique dans tous les chapitres ;
* qu’une œuvre comportant plusieurs narrateurs sera toujours correctement identifiée.

---

### Structure du cache

Les résultats sont stockés sous la clé :

`ao3h_pov_tracker_data_v1`

Chaque entrée est associée à l’identifiant d’une œuvre.

```js
{
  [workId]: {
    pov: "first",
    confidence: "high",
    lastUpdated: 0
  }
}
```

Chaque entrée contient :

* `pov` : la catégorie détectée ;
* `confidence` : le niveau de confiance ;
* `lastUpdated` : la date de la dernière analyse sous forme de timestamp.

---

## Dépendances

Ce sous-module est initialisé par `_povTracker.js`.

Ses résultats sont utilisés par `povPresentation.js` pour afficher les badges, les filtres et les statistiques.

---

# povPresentation.js

## Rôle

Gère l’affichage des résultats produits par `povAnalysis.js`.

Il ajoute les badges sur les œuvres, crée les contrôles de filtrage et peut afficher un résumé statistique des points de vue rencontrés.

---

## Fonctionnalités

### Badges de point de vue

Le module peut ajouter un badge coloré à chaque œuvre déjà analysée.

Le badge est inséré dans le titre de la fiche de l’œuvre.

Il indique visuellement la catégorie détectée.

---

### Types de badges

Chaque catégorie possède son propre réglage d’affichage :

* `badgeFirst`
* `badgeSecond`
* `badgeThird`
* `badgeMixed`
* `badgeMulti`
* `badgeUnknown`

Le réglage `showBadgesOnBlurbs` agit comme interrupteur principal pour tous les badges.

---

### Emplacement des badges

Les badges sont ajoutés dans :

```text
h4.heading
```

à l’intérieur de la fiche de l’œuvre.

---

### Structure d’un badge

Un badge suit une structure semblable à :

```html
<span
  class="ao3h-pov-badge ao3h-pov-{type}"
  title="POV: {label}"
>
  POV label
</span>
```

La classe spécifique dépend du type détecté.

Exemples :

* `ao3h-pov-first`
* `ao3h-pov-second`
* `ao3h-pov-third`
* `ao3h-pov-mixed`
* `ao3h-pov-multi`
* `ao3h-pov-unknown`

---

### Barre de filtres

Lorsque `enablePovFilters` est activé, le module ajoute une barre de filtres au-dessus des listes d’œuvres.

Cette barre contient des contrôles pour chaque type de point de vue.

Elle utilise un conteneur semblable à :

```html
<div id="ao3h-pov-filter-bar">
```

---

### Filtrage des œuvres

Lorsqu’un filtre est activé ou désactivé, le module masque ou affiche les fiches associées à ce point de vue.

Les filtres permettent notamment de :

* ne voir que certaines catégories ;
* masquer les catégories non désirées ;
* combiner plusieurs types de points de vue.

---

### Statistiques

Lorsque `showStats` est activé, le module peut afficher une petite barre de statistiques.

Elle présente la répartition des œuvres analysées selon leur point de vue.

Les statistiques peuvent inclure le nombre d’œuvres classées comme :

* première personne ;
* deuxième personne ;
* troisième personne ;
* mixtes ;
* multi-points de vue ;
* inconnues.

---

## Détails techniques

### Données utilisées

Le module récupère les résultats déjà présents dans le cache d’analyse.

Il n’analyse pas lui-même le texte des œuvres.

---

### Conditions d’affichage

Un badge est affiché seulement lorsque :

* `showBadgesOnBlurbs` est activé ;
* l’œuvre possède déjà une analyse ;
* le réglage spécifique correspondant au type détecté est activé.

---

### Comportement des filtres

Les filtres agissent directement sur les fiches d’œuvres présentes dans le DOM.

Chaque interaction actualise leur visibilité selon les catégories sélectionnées.

---

## Dépendances

Ce sous-module est initialisé par `_povTracker.js`.

Il dépend des résultats produits et enregistrés par `povAnalysis.js`.

---

# povTracker.css

## Rôle

Contient l’ensemble des styles visuels utilisés par le module **POV Tracker**.

Il définit notamment l’apparence :

* des badges de point de vue ;
* des couleurs associées à chaque catégorie ;
* de la barre de filtres ;
* des boutons de filtrage ;
* des états actifs et inactifs ;
* de la barre de statistiques ;
* des œuvres masquées par les filtres.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou mentionnées dans d’autres documents. Statut après revue :

---

## Analyse du texte complet ✅ Fait

Analyser directement le texte de l’histoire plutôt que de se limiter aux tags et au résumé.

> Réglage `analyzeFullText` (`povTextAnalysis.js`) : compte les pronoms de
> 1ère, 2e et 3e personne dans le texte du chapitre affiché.

---

## Analyse chapitre par chapitre ✅ Fait (partiellement)

Déterminer séparément le point de vue de chaque chapitre d’une œuvre.

> Chaque chapitre visité est analysé et mémorisé séparément
> (`recordChapterAnalysis`). Limite assumée : seuls les chapitres réellement
> ouverts sont suivis — pas de pré-chargement de la fic entière.

---

## Panneau détaillé sur l’œuvre ✅ Fait

Ajouter un panneau directement sur la page d’une œuvre.

> Réglage `showDetailPanel` (`povDetailPanel.js`) : verdict global, niveau
> de confiance, cohérence entre les chapitres lus et liste chapitre par
> chapitre.

---

## Quantité minimale de texte ✅ Fait

Vérifier qu’une quantité suffisante de texte est disponible avant de lancer l’analyse.

> `MIN_ANALYZABLE_CHARS` (200 caractères) dans `povTextAnalysis.js` — en
> dessous, ou sans aucun pronom détecté, l’analyse ne retourne aucun verdict.

---

## Avertissement de changement ✅ Fait

Prévenir l’utilisateur lorsque le point de vue change en cours d’histoire.

> Le panneau détaillé affiche "⚠️ POV change detected across chapters read"
> dès que deux chapitres analysés divergent.

---

## Vérification de cohérence ✅ Fait (partiellement)

Analyser si le point de vue reste cohérent du début à la fin de l’œuvre.

> Le panneau affiche "Consistent across N chapters read" quand tous les
> chapitres analysés jusqu’ici concordent — seulement sur les chapitres déjà
> lus, pas une vérification de la fic entière en une fois.

---

## Préférence personnelle ✅ Fait

Permettre à l’utilisateur d’enregistrer ses points de vue préférés ou indésirables.

> Réglages `preferredPovs` + `autoApplyPreferredFilter` : filtre
> automatiquement les fics hors de la liste préférée.

---

## Profil des auteurs ❌ Écarté

Analyser les œuvres d’un auteur afin d’estimer les points de vue qu’il utilise le plus souvent.

> Écarté : nécessiterait de télécharger et analyser toutes les œuvres d’un
> auteur (requêtes réseau supplémentaires, fiabilité incertaine) pour un
> bénéfice marginal par rapport à l’analyse par fic déjà en place.

---

## Recommandations ❌ Écarté

Recommander des œuvres selon les préférences de point de vue de l’utilisateur.

> Écarté : couvert autrement par le filtre automatique sur les POV préférés
> ci-dessus. Un vrai moteur de recommandation a été explicitement écarté à
> l’échelle du projet (voir "Recommendation Engine" dans
> `docs/never-built-modules.md`).

---

## Détection améliorée des œuvres multiples ✅ Fait

Améliorer la détection des œuvres qui alternent ou mélangent plusieurs points de vue.

> Le verdict combiné (`getCombinedResult`) classe une fic "multi" dès que
> ses chapitres analysés en texte intégral divergent, même sans tag
> multi-POV explicite.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Détection expérimentale

Le résultat doit être considéré comme une estimation et non comme une information certaine.

Le module privilégie une détection légère et rapide à partir des données déjà visibles sur AO3.

---

## Analyse limitée aux métadonnées, sauf sur la page d’une œuvre

Sur les listes, le module n’analyse que les tags et le résumé — il ne télécharge jamais le texte complet d’œuvres qu’on n’ouvre pas, ce qui permet :

* de réduire les requêtes ;
* de limiter les traitements ;
* d’éviter d’analyser inutilement des œuvres que l’utilisateur n’ouvre pas.

Sur la page d’une œuvre déjà ouverte, en revanche, le texte du chapitre affiché est analysé (`analyzeFullText`) puisqu’il est déjà chargé dans la page — cela n’ajoute aucune requête réseau.

---

## Badges réservés aux œuvres analysées

Les badges ne sont pas générés automatiquement pour toutes les œuvres d’une liste.

Ils apparaissent uniquement lorsque le résultat existe déjà dans le cache, notamment après l’analyse de la page de l’œuvre.

---

## Durée du cache

Les résultats sont conservés pendant **7 jours**.

Cette durée réduit les analyses répétées tout en permettant une mise à jour périodique des résultats.
