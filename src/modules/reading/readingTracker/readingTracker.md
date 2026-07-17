# readingTracker

**Tab:** Reading

## À quoi ça sert

Ce module suit ton historique de lecture sur AO3 : il retient les fics que
tu as déjà visitées, ta progression de lecture (défilement et chapitre), et
te permet de marquer les fics déjà vues.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `seenMode` | `mark` | Comment afficher les fics déjà vues : `mark` (les estompe) ou `hide` (les cache) |
| `exceptBookmarks` | activé | Ne jamais marquer comme vues les fics dans mes favoris |
| `exceptSubscribed` | activé | Ne jamais marquer comme vues les fics auxquelles je suis abonné |
| `exceptMFL` | activé | Ne jamais marquer comme vues les fics de ma liste "à lire plus tard" |
| `searchHistory` | activé | Active la recherche dans l'historique |
| `deleteEntry` | activé | Permet de supprimer une entrée de l'historique |
| `exportHistory` | activé | Permet d'exporter l'historique en JSON |
| `resumeToast` | activé | Affiche un petit message quand on reprend une lecture |
| `chapterBadge` | activé | Affiche un badge cliquable "Ch X/Y" sur les fics en cours |
| `resumeBanner` | activé | Affiche une bannière "📍 Reprendre au chapitre X" quand on revient sur une fic |
| `lastReadTime` | activé | Affiche depuis combien de temps on n'a pas lu, dans la bannière |
| `positionMarker` | activé | Affiche un repère à l'endroit exact où on s'était arrêté de lire |
| `floatingBadge` | activé | Affiche un badge flottant avec le pourcentage lu pendant la lecture |
| `seenWorksOpacity` | `0.4` | La transparence des fics marquées comme vues |
| `historyClearAll` | activé | Affiche le bouton "Tout effacer l'historique" |
| `showClearProgressButton` | activé | Affiche le bouton "Effacer la progression" pour une fic |
| `updatedBadge` | activé | Affiche un badge "Updated" sur les fics récemment mises à jour |
| `updatedOnlyMode` | désactivé | N'affiche que les fics mises à jour, sur la page des abonnements |

## Fichiers

### 1. `_readingTracker.js` — le chef d'orchestre

- Garde en mémoire l'historique et la progression de lecture, partagés avec les autres fichiers de ce module
- Donne accès à ces informations pour le reste de l'extension

### 2. `seenTracking.js` — enregistrer les visites

- Note chaque fic visitée dans l'historique
- Affiche sur les listes un badge "🆕 Updated" coloré selon la date, si une fic déjà vue a été mise à jour depuis
- Un mode permet de n'afficher que les fics mises à jour (utile sur la page des abonnements)

### 3. `visualMarkers.js` — marquer les fics déjà vues

- Sur les listes, estompe ou cache les fics déjà vues (au choix)
- Ne touche jamais aux favoris, aux abonnements, ni à la liste "à lire plus tard"
- Ajoute un badge cliquable "Ch X/Y" qui amène directement au dernier chapitre lu

### 4. `readingProgress.js` — suivre la progression de lecture

- Suit où on en est dans une fic pendant qu'on lit
- Affiche un badge flottant avec le pourcentage lu
- Affiche une bannière "📍 Reprendre au chapitre X" avec l'ancienneté de la dernière lecture
- Affiche un petit message de bienvenue quand on rouvre une fic déjà commencée
- Ajoute un repère dans le texte à l'endroit exact où on s'était arrêté

### 5. `viewHistory.js` — gérer l'historique

- Permet de chercher dans l'historique, de supprimer une entrée, ou de tout exporter en JSON
- Peut importer l'historique officiel d'AO3 depuis sa propre page d'historique
- Fait fonctionner les boutons du panneau de réglages liés à l'historique

### 6. `readingTracker.css`

- Les styles visuels des badges, bannières, messages et repères ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Détecter et suivre les relectures d'une même fic
- Marquer une fic comme "abandonnée" avec une raison
- Écrire une note personnelle sur une session de lecture
- Suivre la durée réelle de chaque session de lecture (pause/reprise)
- Marquer plusieurs fics comme "vues" d'un coup
- Des statistiques sur les moments où tu lis le plus (heures de pointe)
- Une alerte quand tu es en train de faire un marathon de lecture
- Savoir sur quel appareil tu as lu une fic
- Noter son humeur pendant une session de lecture
- Cliquer directement sur la barre de progression pour sauter à un pourcentage précis
- De petites notifications aux étapes importantes (25%, 50%, 75% lus)
- Poser plusieurs marque-pages à l'intérieur d'un même chapitre, pas juste un seul repère automatique
- Deviner automatiquement comment tu as lu une fic (juste essayé, survolée en diagonale...) d'après ta façon de faire défiler la page, pas seulement si tu l'as relue
- Afficher combien de fics sont cachées et un bouton pour les faire réapparaître temporairement
- D'autres façons d'afficher les fics déjà vues (un effet flou, un titre barré, ou une intensité d'atténuation réglable), en plus d'estomper ou de cacher
- Afficher l'historique sous forme de ligne du temps, groupée par période (aujourd'hui, hier, cette semaine)
- Épingler certaines entrées de l'historique tout en haut de la liste
- Nettoyer l'historique automatiquement selon des critères choisis, pas juste tout effacer ou une entrée à la fois
- Empêcher certaines fics d'apparaître dans l'historique, pour plus de confidentialité
- Afficher les dates de mise à jour sous forme relative ("il y a 2 jours") avec une couleur selon l'ancienneté, et pouvoir choisir entre dates relatives ou exactes
- Un anneau de progression circulaire coloré (comme un petit donut) qui change de couleur selon l'avancement de la lecture
- Un panneau fixe sur le côté de l'écran avec le chapitre en cours, la progression, le temps de lecture et la vitesse
- Basculer l'affichage des fics déjà vues avec un raccourci clavier
- Trier l'historique (par exemple par date ou par titre)
- Suivre sa vitesse de lecture en temps réel (mots par minute), calculée à partir de son propre historique
- Un panneau "Continuer la lecture" sur la page d'accueil avec les fics récemment lues
- Passer automatiquement à l'œuvre suivante d'une série, avec un bouton "Suivant dans la série"
- Synchroniser automatiquement l'endroit où on s'est arrêté de lire entre plusieurs appareils (téléphone, ordinateur...)
- Avoir plusieurs statuts possibles pour une fic (à lire, en cours, en pause, terminée, abandonnée, à relire) avec des badges et un petit tableau de bord, plutôt que juste "vue" ou pas
- Voir la date exacte à laquelle chaque fic a été lue, dans l'historique

## Explicitement écarté

- Pouvoir choisir à partir de quel pourcentage de défilement un chapitre est considéré comme lu — c'est fixé à 90%, ça ne se change pas
- Pouvoir régler le temps d'attente avant que la position de lecture soit sauvegardée automatiquement — c'est fixé à 2 secondes, ça ne se change pas

## Précision

⚠️ La doc historique anglaise décrit `readingProgress.js`, `viewHistory.js`
et `visualMarkers.js` comme des fichiers presque vides, sans vrai code
fonctionnel. Ce n'est plus le cas : les trois sont aujourd'hui pleinement
codés et fonctionnels, au même titre que `seenTracking.js`.



AO3 Helper - Reading Tracker Module Coordinator
    Module ID: readingTracker
    Display Name: Reading Tracker
    Tab: Reading

    Seen Works Marker:
        seenMode (mark|hide), exceptBookmarks, exceptSubscribed, exceptMFL
        Fades or hides already-opened works in listings.

    History:
        Records work-page visits in localStorage (LRU cap 2000).
        ao3h:rt:history -- array of { id, title, author, href, seenAt,
                           chapter, chapterId, chapterHref, totalChapters,
                           lastReadAt, progress }

    Reading Progress:
        Auto-saves scroll position + chapter (debounced 2s).
        ao3h:rt:progress:{workId} -- { chapter, chapterId, chapterHref,
                                       totalChapters, scrollY, progress,
                                       lastReadAt, title, author }

    Public API (W.AO3H_ReadingTracker):
        getProgress(workId), markSeen(workId), getHistory()

    Submodules (imported directly as ES modules):
        ./seenTracking.js    -- work visit recording, updated-since badges (listing pages)
        ./visualMarkers.js   -- seen marks, chapter badges (listing pages)
        ./readingProgress.js -- scroll tracking, progress badge, position marker, resume banner (work pages)
        ./viewHistory.js     -- history clear/export/import, panel actions

    Integration (loose coupling):
        chapterNavigation reads W.AO3H_ReadingTracker?.getProgress(workId) (Étape 237)
        readingDashboard, readingTimeline, notificationCenter — migrés (Phase 23), lisent
        les données via clés localStorage / bridges window (conservés jusqu'à la Phase 26)
        backupAndSync — migré (Phase 24, étape 291), lit les mêmes clés localStorage



// ── SeenTracking ─────────────────────────────────────────────────────────
// Submodule of: readingTracker — work visit recording + updated-since badges
//
// Features:
//   - Record work visits in history (recordVisit, parseWorkMeta, parseWorkId)
//   - "Updated since last visit" badge on listing blurbs
//       Color-coded by recency: recent (<7d) / medium (<30d) / old (>=30d)
//   - "Only show updated works" filter mode (cfg: updatedOnlyMode)
//   - Count notification: "X works updated since your last visit"



═══════════════════════════════════════════════════════════════════════════
  # readingTracker
  **Tab :** Reading
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Reading Tracker** suit l’historique et la progression de lecture sur AO3.

* Il permet notamment de :
    - enregistrer les œuvres déjà visitées ;
    - conserver la position de lecture dans une œuvre ;
    - suivre le chapitre en cours ;
    - estomper ou masquer les œuvres déjà vues dans les listes ;
    - exclure du marquage les favoris, les abonnements et les œuvres marquées pour plus tard ;
    - signaler les œuvres mises à jour depuis la dernière visite ;
    - reprendre une lecture au dernier chapitre ou à la dernière position enregistrée ;
    - rechercher, importer, exporter et nettoyer l’historique de lecture ;
    - fournir les données de lecture aux autres modules d’AO3 Helper.

---

# Réglages utilisateur

| Réglage                   | Description                                                                              |
| ------------------------- |------------------------------------------------------------------------------------------|
| `seenMode`                | Définit comment afficher les œuvres déjà vues : `mark` les estompe et `hide` les masque. |
| `exceptBookmarks`         | Ne marque jamais comme vues les œuvres présentes dans les favoris.                       |
| `exceptSubscribed`        | Ne marque jamais comme vues les œuvres auxquelles l’utilisateur est abonné.              |
| `exceptMFL`               | Ne marque jamais comme vues les œuvres présentes dans la liste **Marked for Later**.     |
| `searchHistory`           | Active la recherche dans l’historique.                                                   |
| `deleteEntry`             | Permet de supprimer une entrée individuelle de l’historique.                             |
| `exportHistory`           | Permet d’exporter l’historique au format JSON.                                           |
| `resumeToast`             | Affiche un court message lorsqu’une lecture déjà commencée est reprise.                  |
| `chapterBadge`            | Affiche un badge cliquable `Ch X/Y` sur les œuvres en cours de lecture.                  |
| `resumeBanner`            | Affiche une bannière `📍 Reprendre au chapitre X` lors du retour sur une œuvre.         |
| `lastReadTime`            | Affiche depuis combien de temps l’œuvre n’a pas été lue dans la bannière de reprise.     |
| `positionMarker`          | Ajoute un repère à l’endroit exact où la lecture s’était arrêtée.                        |
| `floatingBadge`           | Affiche un badge flottant indiquant le pourcentage lu.                                   |
| `seenWorksOpacity`        | Définit l’opacité des œuvres estompées lorsqu’elles sont marquées comme vues.            |
| `historyClearAll`         | Affiche le bouton permettant d’effacer tout l’historique.                                |
| `showClearProgressButton` | Affiche un bouton permettant d’effacer la progression enregistrée pour une œuvre.        |
| `updatedBadge`            | Affiche un badge **Updated** sur les œuvres récemment mises à jour.                      |
| `updatedOnlyMode`         | N’affiche que les œuvres mises à jour, notamment sur la page des abonnements.            |

---

# Structure du module

Le module est composé d’un fichier coordinateur, de quatre sous-modules fonctionnels et d’une feuille de style.

```text
_readingTracker.js
seenTracking.js
visualMarkers.js
readingProgress.js
viewHistory.js
readingTracker.css
```

---

# _readingTracker.js

## Rôle

Fichier coordinateur du module.

Il centralise l’historique des œuvres visitées et les données de progression de lecture, puis expose ces informations aux sous-modules et au reste d’AO3 Helper.

---

## Responsabilités

* Importe directement les quatre sous-modules fonctionnels.
* Enregistre les visites des pages d’œuvres dans l’historique.
* Conserve la progression individuelle de chaque œuvre.
* Centralise les structures de données partagées.
* Limite l’historique à 2 000 entrées selon un fonctionnement de type LRU.
* Expose une API publique permettant de consulter ou modifier les données de lecture.
* Assure la compatibilité avec les autres modules utilisant les mêmes données.

---

## Fonctions exposées

L’API publique est accessible via :

```text
W.AO3H_ReadingTracker
```

Elle expose notamment :

```text
W.AO3H_ReadingTracker.getProgress(workId)
W.AO3H_ReadingTracker.markSeen(workId)
W.AO3H_ReadingTracker.getHistory()
```

Ces fonctions permettent respectivement :

* de récupérer la progression enregistrée pour une œuvre ;
* de marquer une œuvre comme vue ;
* d’obtenir l’historique complet de lecture.

---

## Détails techniques

### Sous-modules importés

Le coordinateur importe directement :

```text
./seenTracking.js
./visualMarkers.js
./readingProgress.js
./viewHistory.js
```

### Historique

L’historique est enregistré sous la clé :

```text
ao3h:rt:history
```

Il contient un tableau d’objets de la forme :

```text
{
  id,
  title,
  author,
  href,
  seenAt,
  chapter,
  chapterId,
  chapterHref,
  totalChapters,
  lastReadAt,
  progress
}
```

L’historique est limité à 2 000 entrées selon un système LRU, qui retire les données les plus anciennes lorsque la limite est dépassée.

### Progression par œuvre

La progression d’une œuvre est enregistrée sous une clé de la forme :

```text
ao3h:rt:progress:{workId}
```

Chaque entrée contient :

```text
{
  chapter,
  chapterId,
  chapterHref,
  totalChapters,
  scrollY,
  progress,
  lastReadAt,
  title,
  author
}
```

### Sauvegarde automatique

La position de défilement et le chapitre actuel sont sauvegardés automatiquement avec un délai fixe de deux secondes.

---

## Dépendances

Le coordinateur dépend :

* du système de stockage local ;
* du DOM des pages AO3 ;
* des quatre sous-modules fonctionnels ;
* des données de chapitre et d’œuvre disponibles dans les pages.

---

# seenTracking.js

## Rôle

Enregistre les visites des pages d’œuvres et détecte les œuvres mises à jour depuis leur dernière consultation.

---

## Fonctionnalités

### Enregistrement des visites

Lorsqu’une page d’œuvre est ouverte, le sous-module récupère les principales métadonnées de la fic et l’ajoute à l’historique.

Les opérations principales comprennent :

* `recordVisit`
* `parseWorkMeta`
* `parseWorkId`

Les données enregistrées comprennent notamment :

* l’identifiant de l’œuvre ;
* le titre ;
* l’auteur ;
* l’adresse ;
* la date de visite ;
* le chapitre actuel ;
* le nombre total de chapitres ;
* la progression connue.

---

### Badge Updated

Sur les listes d’œuvres, le sous-module compare les informations actuelles avec la dernière visite enregistrée.

Lorsqu’une œuvre déjà vue a été mise à jour, il affiche un badge :

```text
🆕 Updated
```

La couleur du badge varie selon l’ancienneté de la mise à jour :

| Catégorie | Ancienneté          |
| --------- | ------------------- |
| Récente   | Moins de 7 jours    |
| Moyenne   | Entre 7 et 29 jours |
| Ancienne  | 30 jours ou plus    |

---

### Mode œuvres mises à jour uniquement

Lorsque `updatedOnlyMode` est activé, les œuvres qui n’ont pas été mises à jour depuis la dernière visite sont masquées.

Ce mode est notamment utile sur la page des abonnements.

---

### Compteur de mises à jour

Le sous-module peut afficher une notification indiquant le nombre d’œuvres mises à jour depuis la dernière visite.

Le message utilise une forme du type :

```text
X works updated since your last visit
```

---

## Détails techniques

### Portée

Le sous-module intervient :

* sur les pages individuelles des œuvres pour enregistrer les visites ;
* sur les listes d’œuvres pour comparer les mises à jour.

### Données utilisées

La détection repose sur les informations présentes dans :

```text
ao3h:rt:history
```

et sur les métadonnées actuelles affichées par AO3.

---

## Dépendances

Ce sous-module est initialisé par `_readingTracker.js`.

Il partage les données d’historique avec les autres sous-modules du module.

---

# visualMarkers.js

## Rôle

Modifie l’apparence des œuvres déjà vues dans les listes et affiche leur progression en chapitre.

---

## Fonctionnalités

### Marquage des œuvres déjà vues

Lorsqu’une œuvre est présente dans l’historique, le sous-module peut :

* l’estomper ;
* la masquer complètement.

Le comportement dépend de :

```text
seenMode
```

Les valeurs reconnues sont :

* `mark`
* `hide`

En mode `mark`, l’opacité est contrôlée par :

```text
seenWorksOpacity
```

---

### Exceptions

Le sous-module ne modifie jamais les œuvres appartenant aux catégories protégées activées dans les réglages.

Les exceptions possibles sont :

* les œuvres présentes dans les favoris ;
* les œuvres auxquelles l’utilisateur est abonné ;
* les œuvres présentes dans **Marked for Later**.

Elles sont contrôlées par :

* `exceptBookmarks`
* `exceptSubscribed`
* `exceptMFL`

---

### Badge de chapitre

Lorsque `chapterBadge` est activé, un badge cliquable est affiché sur les œuvres en cours de lecture.

Le badge utilise la forme :

```text
Ch X/Y
```

Il indique :

* le dernier chapitre lu ;
* le nombre total de chapitres.

Un clic ouvre directement le dernier chapitre enregistré.

---

## Détails techniques

### Portée

Le sous-module agit sur les entrées d’œuvres présentes dans les listes AO3.

### Données utilisées

Le marquage repose sur :

* l’historique des œuvres vues ;
* la progression enregistrée ;
* les états de favoris, d’abonnement et de lecture ultérieure.

---

## Dépendances

Ce sous-module est initialisé par `_readingTracker.js`.

Il dépend des données produites par :

* `seenTracking.js` ;
* `readingProgress.js`.

---

# readingProgress.js

## Rôle

Suit précisément la progression pendant la lecture d’une œuvre et restaure cette progression lors d’une visite ultérieure.

---

## Fonctionnalités

### Suivi du chapitre

Le sous-module enregistre le chapitre actuellement consulté.

Les données conservées comprennent notamment :

* le numéro du chapitre ;
* l’identifiant du chapitre ;
* l’adresse du chapitre ;
* le nombre total de chapitres.

---

### Suivi du défilement

Le sous-module enregistre la position verticale de la page et calcule le pourcentage de lecture.

La sauvegarde est automatiquement déclenchée avec un délai fixe de deux secondes afin d’éviter des écritures trop fréquentes.

---

### Badge flottant

Lorsque `floatingBadge` est activé, un badge flottant affiche le pourcentage lu pendant la lecture.

---

### Bannière de reprise

Lorsque `resumeBanner` est activé, le sous-module affiche une bannière lors du retour sur une œuvre déjà commencée.

La bannière utilise une forme du type :

```text
📍 Reprendre au chapitre X
```

Elle permet de retourner au chapitre enregistré.

Lorsque `lastReadTime` est activé, elle affiche également depuis combien de temps l’œuvre n’a pas été consultée.

---

### Message de reprise

Lorsque `resumeToast` est activé, un court message de bienvenue apparaît au retour sur une œuvre déjà commencée.

---

### Repère de position

Lorsque `positionMarker` est activé, le sous-module place un repère dans le texte à l’endroit correspondant à la position de lecture précédemment enregistrée.

---

### Effacement de la progression

Lorsque `showClearProgressButton` est activé, un bouton permet de supprimer les données de progression de l’œuvre actuelle.

---

### Seuil de lecture

Un chapitre est considéré comme lu lorsque l’utilisateur atteint 90 % de son contenu.

Ce seuil est fixe.

---

## Détails techniques

### Clé de stockage

Les données sont enregistrées sous :

```text
ao3h:rt:progress:{workId}
```

### Délai de sauvegarde

La sauvegarde automatique utilise un délai fixe de :

```text
2 secondes
```

### Progression enregistrée

Les données comprennent :

* le chapitre ;
* la position verticale ;
* le pourcentage lu ;
* la date de dernière lecture ;
* les informations générales de l’œuvre.

---

## Dépendances

Ce sous-module est initialisé par `_readingTracker.js`.

Il fournit notamment les données utilisées par `visualMarkers.js` pour afficher les badges de chapitre.

---

# viewHistory.js

## Rôle

Fournit les outils permettant de consulter, rechercher, importer, exporter et nettoyer l’historique de lecture.

---

## Fonctionnalités

### Recherche dans l’historique

Lorsque `searchHistory` est activé, l’utilisateur peut rechercher une œuvre dans l’historique enregistré.

---

### Suppression individuelle

Lorsque `deleteEntry` est activé, chaque entrée peut être supprimée séparément.

---

### Effacement complet

Lorsque `historyClearAll` est activé, un bouton permet d’effacer l’ensemble de l’historique.

---

### Exportation

Lorsque `exportHistory` est activé, l’historique peut être exporté dans un fichier JSON.

---

### Importation de l’historique AO3

Le sous-module peut importer l’historique officiel d’AO3 directement depuis la page d’historique du site.

Les données récupérées sont ensuite intégrées au système local du module.

---

### Actions du panneau de réglages

Le sous-module relie les boutons du panneau de configuration aux opérations correspondantes sur l’historique.

Il gère notamment :

* la recherche ;
* la suppression ;
* l’effacement complet ;
* l’importation ;
* l’exportation.

---

## Détails techniques

### Données utilisées

Le sous-module travaille principalement avec :

```text
ao3h:rt:history
```

### Importation

L’importation de l’historique officiel dépend du contenu disponible sur la page d’historique AO3.

---

## Dépendances

Ce sous-module est initialisé par `_readingTracker.js`.

Il dépend :

* du stockage local ;
* des données d’historique centralisées ;
* du panneau de configuration d’AO3 Helper ;
* de la page d’historique officielle d’AO3.

---

# readingTracker.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Reading Tracker**.

Il définit notamment l’apparence :

* des œuvres estompées ;
* des œuvres masquées ;
* des badges `Ch X/Y` ;
* des badges **Updated** ;
* du badge flottant de progression ;
* des bannières de reprise ;
* des messages de reprise ;
* des repères de position ;
* des boutons de gestion de l’historique.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont mentionnées dans d’autres documents du projet, mais ne sont pas actuellement présentes dans le module.

---

## Suivi des relectures

Détecter et enregistrer les différentes relectures d’une même œuvre.

---

## Statut abandonné

Permettre de marquer une œuvre comme abandonnée et d’enregistrer une raison.

---

## Notes de session

Permettre d’écrire une note personnelle associée à une session de lecture précise.

---

## Durée des sessions

Suivre la durée réelle de chaque session de lecture, y compris les pauses et les reprises.

---

## Marquage multiple

Permettre de marquer plusieurs œuvres comme vues en une seule opération.

---

## Heures de lecture

Afficher des statistiques sur les périodes de la journée durant lesquelles l’utilisateur lit le plus.

---

## Détection des marathons

Afficher une alerte lorsqu’une longue session ou un marathon de lecture est détecté.

---

## Appareil utilisé

Enregistrer l’appareil sur lequel chaque œuvre a été lue.

---

## Humeur de lecture

Permettre d’enregistrer une humeur pour chaque session de lecture.

---

## Navigation par pourcentage

Permettre de cliquer directement sur une barre de progression afin d’atteindre un pourcentage précis de l’œuvre.

---

## Étapes de progression

Afficher des notifications lors de certaines étapes de lecture, par exemple :

* 25 % ;
* 50 % ;
* 75 %.

---

## Plusieurs marque-pages internes

Permettre de placer plusieurs repères manuels dans un même chapitre au lieu d’un seul repère automatique.

---

## Détection du type de lecture

Analyser la manière dont une œuvre a été parcourue afin d’estimer si elle a été :

* simplement essayée ;
* survolée rapidement ;
* lue complètement ;
* relue.

---

## Compteur d’œuvres masquées

Afficher le nombre d’œuvres actuellement masquées et proposer un bouton permettant de les révéler temporairement.

---

## Styles supplémentaires pour les œuvres vues

Ajouter d’autres modes d’affichage, notamment :

* un effet flou ;
* un titre barré ;
* une intensité d’atténuation personnalisable.

---

## Ligne du temps

Afficher l’historique sous forme chronologique, regroupé par périodes comme :

* aujourd’hui ;
* hier ;
* cette semaine.

---

## Épinglage

Permettre d’épingler certaines entrées en haut de l’historique.

---

## Nettoyage automatique

Nettoyer automatiquement l’historique selon des critères définis par l’utilisateur.

---

## Exclusions privées

Permettre d’empêcher certaines œuvres d’apparaître dans l’historique.

---

## Dates de mise à jour enrichies

Afficher les dates de mise à jour :

* sous forme relative ;
* sous forme exacte ;
* avec une couleur variant selon leur ancienneté.

---

## Anneau de progression

Afficher un indicateur circulaire coloré de type anneau ou donut dont l’apparence varie selon la progression.

---

## Panneau latéral de lecture

Ajouter un panneau fixe contenant :

* le chapitre actuel ;
* la progression ;
* le temps de lecture ;
* la vitesse de lecture.

---

## Raccourci de visibilité

Permettre d’afficher ou masquer les œuvres déjà vues à l’aide d’un raccourci clavier.

---

## Tri de l’historique

Permettre de trier l’historique, notamment :

* par date ;
* par titre.

---

## Vitesse de lecture personnelle

Calculer la vitesse de lecture en temps réel, en mots par minute, à partir de l’historique propre à l’utilisateur.

---

## Continuer la lecture

Ajouter sur la page d’accueil un panneau regroupant les œuvres récemment lues.

---

## Série suivante

Permettre de passer automatiquement à l’œuvre suivante d’une série au moyen d’un bouton **Suivant dans la série**.

---

## Synchronisation entre appareils

Synchroniser automatiquement la progression entre plusieurs appareils.

---

## Statuts de lecture multiples

Ajouter plusieurs statuts possibles pour une œuvre :

* à lire ;
* en cours ;
* en pause ;
* terminée ;
* abandonnée ;
* à relire.

Ces statuts seraient accompagnés de badges et d’un tableau de bord.

---

## Date exacte de lecture

Afficher dans l’historique la date précise à laquelle chaque œuvre a été lue.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Seuil de lecture fixe

L’utilisateur ne peut pas choisir à partir de quel pourcentage un chapitre est considéré comme lu.

Ce seuil est fixé à :

```text
90 %
```

---

## Délai de sauvegarde fixe

L’utilisateur ne peut pas modifier le délai avant l’enregistrement automatique de la position.

Ce délai est fixé à :

```text
2 secondes
```

---

# Précision historique

La documentation historique en anglais décrivait les fichiers suivants comme presque vides et dépourvus de fonctionnalités réelles :

* `readingProgress.js`
* `viewHistory.js`
* `visualMarkers.js`

Cette description n’est plus valable.

Ces trois sous-modules sont aujourd’hui entièrement codés et fonctionnels, au même titre que `seenTracking.js`.

---

# Intégrations avec les autres modules

Le module expose ses données à plusieurs autres composants d’AO3 Helper selon un système de dépendances souples.

---

## chapterNavigation

Le module `chapterNavigation` consulte la progression au moyen de :

```text
W.AO3H_ReadingTracker?.getProgress(workId)
```

Cette intégration correspond à l’étape 237 du projet.

---

## Modules migrés pendant la phase 23

Les modules suivants utilisent les données de lecture :

* `readingDashboard`
* `readingTimeline`
* `notificationCenter`

Ils ont été migrés durant la phase 23.

Ils lisent encore les données au moyen :

* des clés `localStorage` ;
* de ponts exposés sur `window`.

Ces mécanismes sont conservés jusqu’à la phase 26.

---

## backupAndSync

Le module `backupAndSync` a été migré pendant la phase 24, à l’étape 291.

Il lit les mêmes clés `localStorage` afin d’inclure les données du **Reading Tracker** dans les sauvegardes.
