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

## Fichiers

### 1. `_povTracker.js` — le chef d'orchestre

- Met en route les deux autres fichiers et partage les réglages avec eux

### 2. `povAnalysis.js` — détection du point de vue

- Analyse les tags et le résumé d'une fic pour deviner son point de vue
- Garde le résultat en mémoire pendant 7 jours, pour ne pas refaire l'analyse à chaque fois

### 3. `povPresentation.js` — badges et filtres

- Affiche un badge coloré sur chaque fic d'une liste, selon son point de vue
- Ajoute une barre de filtres cliquables pour cacher ou montrer les fics selon leur point de vue
- Peut afficher un petit résumé de la répartition des points de vue rencontrés

### 4. `povTracker.css`

- Les styles visuels des badges, de la barre de filtres et de la barre de statistiques

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Deviner le point de vue en lisant vraiment le texte de l'histoire (en comptant des mots comme "je", "tu", "il/elle") — en ce moment, ça regarde seulement les tags et le résumé, pas le texte réel de la fic
- Suivre le point de vue chapitre par chapitre à l'intérieur d'une même fic
- Un panneau sur la page de la fic qui montre un résumé global et une liste chapitre par chapitre du point de vue
- Vérifier qu'il y a assez de texte avant de se lancer dans une analyse
- Prévenir quand le point de vue change en cours de route dans une fic
- Vérifier si le point de vue reste cohérent du début à la fin
- Enregistrer sa préférence de point de vue une bonne fois pour toutes, et filtrer automatiquement selon elle
- Deviner le style d'écriture habituel d'un auteur selon les points de vue qu'il utilise
- Recommander des fics selon le point de vue préféré
- Mieux repérer les fics qui mélangent plusieurs points de vue en même temps



AO3 Helper - POV Tracker Module Coordinator
    Module ID: povTracker
    Display Name: POV Tracker
    Tab: Explore

    Submodules (imported directly as ES modules):
        PovAnalysis (povAnalysis.js)         -- pronoun heuristics + cache
        PovPresentation (povPresentation.js) -- badge injection + filter controls

    Coordinator role:
        - Registers as 'povTracker'
        - Defines shared DEFAULTS + cfg()
        - Exposes W.AO3H_PovTracker API for helper files
        - Instantiates Analysis and Presentation helpers
        - Returns cleanup that cascades to both instances

    Storage keys:
        ao3h:mod:povTracker:settings  -- user settings (JSON)
        ao3h_pov_tracker_data_v1      -- analysis cache { [workId]: { pov, confidence, lastUpdated } }


AO3 Helper - POV Tracker: Analysis
    Module ID: povTracker (helper — instantiated by _povTracker.js)
    Class:     PovAnalysis
    Role:      Pronoun heuristics from tag/summary text + localStorage cache

    POV detection strategy:
        1. Parse the work's tags + summary DOM for pronoun signals
        2. Classify as: 'first', 'second', 'third', 'mixed', 'multi', 'unknown'
        3. Cache result in ao3h_pov_tracker_data_v1 keyed by workId

    Cache schema (per entry):
        { pov: string, confidence: 'high'|'low', lastUpdated: number }


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

Il peut classer une œuvre comme étant écrite à la :

* première personne ;
* deuxième personne ;
* troisième personne ;
* personne mixte ;
* avec plusieurs points de vue ;
* avec un point de vue inconnu.

Le résultat peut ensuite être utilisé pour :

* afficher un badge sur les œuvres présentes dans les listes ;
* filtrer les œuvres selon leur point de vue ;
* afficher des statistiques personnelles sur les points de vue rencontrés.

La détection est expérimentale.

Elle repose sur des motifs de texte simples et sur des heuristiques liées aux pronoms. Elle ne lit pas réellement le texte complet de l’œuvre.

Sa précision est estimée à environ **60 %**, ce qui la rend utile comme indication générale, mais insuffisante pour garantir un résultat exact.

---

# Réglages utilisateur

| Réglage              | Par défaut | Ce que ça fait                                                                    |
| -------------------- | ---------- | --------------------------------------------------------------------------------- |
| `showBadgesOnBlurbs` | Activé     | Affiche les badges de point de vue sur les œuvres déjà analysées dans les listes. |
| `badgeFirst`         | Activé     | Affiche les badges associés à la première personne.                               |
| `badgeSecond`        | Désactivé  | Affiche les badges associés à la deuxième personne.                               |
| `badgeThird`         | Activé     | Affiche les badges associés à la troisième personne.                              |
| `badgeMixed`         | Désactivé  | Affiche les badges associés aux points de vue mixtes.                             |
| `badgeMulti`         | Désactivé  | Affiche les badges associés aux œuvres comportant plusieurs points de vue.        |
| `badgeUnknown`       | Désactivé  | Affiche les badges associés aux œuvres dont le point de vue est inconnu.          |
| `enablePovFilters`   | Activé     | Ajoute des contrôles permettant de filtrer les listes par point de vue.           |
| `autoAnalyze`        | Activé     | Analyse automatiquement l’œuvre à l’ouverture de sa page.                         |
| `showStats`          | Désactivé  | Affiche un résumé personnel de la répartition des points de vue.                  |

---

# Structure du module

Le module est composé d’un fichier coordinateur, de deux sous-modules fonctionnels et d’une feuille de style.

```text
_povTracker.js
povAnalysis.js
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

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou mentionnées dans d’autres documents, mais ne disposent pas encore d’une implémentation complète.

---

## Analyse du texte complet

Analyser directement le texte de l’histoire plutôt que de se limiter aux tags et au résumé.

Cette analyse pourrait notamment compter ou comparer des mots comme :

* je ;
* nous ;
* tu ;
* vous ;
* il ;
* elle ;
* ils ;
* elles.

---

## Analyse chapitre par chapitre

Déterminer séparément le point de vue de chaque chapitre d’une œuvre.

Cela permettrait de repérer les changements de narrateur ou de perspective au fil de la lecture.

---

## Panneau détaillé sur l’œuvre

Ajouter un panneau directement sur la page d’une œuvre.

Il pourrait afficher :

* le point de vue global détecté ;
* le niveau de confiance ;
* une liste chapitre par chapitre ;
* les changements de point de vue repérés.

---

## Quantité minimale de texte

Vérifier qu’une quantité suffisante de texte est disponible avant de lancer l’analyse.

Cela éviterait de produire un résultat à partir d’un échantillon trop petit.

---

## Avertissement de changement

Prévenir l’utilisateur lorsque le point de vue change en cours d’histoire.

---

## Vérification de cohérence

Analyser si le point de vue reste cohérent du début à la fin de l’œuvre.

---

## Préférence personnelle

Permettre à l’utilisateur d’enregistrer ses points de vue préférés ou indésirables.

Le module pourrait ensuite appliquer automatiquement les filtres correspondants.

---

## Profil des auteurs

Analyser les œuvres d’un auteur afin d’estimer les points de vue qu’il utilise le plus souvent.

---

## Recommandations

Recommander des œuvres selon les préférences de point de vue de l’utilisateur.

---

## Détection améliorée des œuvres multiples

Améliorer la détection des œuvres qui alternent ou mélangent plusieurs points de vue.

La détection actuelle repose uniquement sur des indices simples présents dans les tags et le résumé.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Détection expérimentale

Le résultat doit être considéré comme une estimation et non comme une information certaine.

Le module privilégie une détection légère et rapide à partir des données déjà visibles sur AO3.

---

## Analyse limitée aux métadonnées

Le module n’analyse actuellement que les tags et le résumé.

Il ne télécharge pas automatiquement le texte complet de chaque œuvre, ce qui permet :

* de réduire les requêtes ;
* de limiter les traitements ;
* d’éviter d’analyser inutilement des œuvres que l’utilisateur n’ouvre pas.

---

## Badges réservés aux œuvres analysées

Les badges ne sont pas générés automatiquement pour toutes les œuvres d’une liste.

Ils apparaissent uniquement lorsque le résultat existe déjà dans le cache, notamment après l’analyse de la page de l’œuvre.

---

## Durée du cache

Les résultats sont conservés pendant **7 jours**.

Cette durée réduit les analyses répétées tout en permettant une mise à jour périodique des résultats.
