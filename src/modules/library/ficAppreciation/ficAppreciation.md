# ficAppreciation

**Tab:** Library

## À quoi ça sert

Ce module regroupe tout ce qui permet de suivre son appréciation
personnelle d'une fic : la marquer comme terminée, lui donner des kudos
plus facilement, la noter par étoiles, et lui donner un statut de lecture
parmi plusieurs choix (à lire, en cours, terminée, abandonnée...). Il
remplace trois anciens modules qui faisaient chacun une seule de ces
choses.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showManualCheckButton` | désactivé | Bouton pour vérifier soi-même si on a déjà donné des kudos, sur la page de la fic |
| `statusNotes` | activé | Permet d'écrire une petite note personnelle avec le statut de lecture |
| `hideStatusFilter` | (aucun) | Les statuts de lecture à cacher sur les listes de fics |
| `completionNotes` | désactivé | Permet d'écrire une note en marquant une fic comme terminée |
| `filterCompletedWorks` | activé | Cache les fics déjà terminées sur les listes |
| `quickKudosButton` | désactivé | Ajoute un bouton pour donner des kudos directement depuis la liste, sans ouvrir la fic |
| `commentAssistOnRevisit` | désactivé | Propose de laisser un commentaire quand on revient sur une fic déjà kudosée |
| `hideKudosedFilter` | désactivé | Cache les fics déjà kudosées sur les listes |
| `showRatingOnBlurbs` | activé | Affiche la note en étoiles directement sur les listes |
| `ratingNotes` | désactivé | Permet d'écrire une note avec chaque notation en étoiles |
| `kudosIcon` | 🧡 | L'icône utilisée pour le bouton et le badge de kudos |
| `tooltipDateFormat` | `long` | Comment la date du kudos est affichée (complète, courte, ou "il y a...") |

Le panneau affiche aussi une section "Sync & Refresh" (synchroniser, trier,
actualiser) *(pas encore actif — rien n'est branché derrière)*.

## Fichiers

### 1. `_ficAppreciation.js` — le chef d'orchestre

- Met en route tous les autres fichiers de ce module
- S'adapte selon qu'on est sur la page d'une fic ou sur une liste de fics
- Donne accès à des actions simples pour le reste de l'extension (par exemple, marquer une fic comme lue)

### 2. `markAsFinished.js` — marquer une fic comme terminée

- Ajoute un bouton "✓ Mark as Finished" sur la page d'une fic
- Ajoute un badge et un bouton rapide sur les listes de fics
- Permet d'écrire une petite note en marquant une fic comme terminée

### 3. `kudosTracker.js` — repérer et donner des kudos

- Détecte si on a déjà donné des kudos à une fic
- Grise le bouton de kudos si c'est déjà fait
- Ajoute un badge sur les listes pour les fics déjà kudosées
- Propose un bouton pour donner des kudos rapidement, sans ouvrir la fic

### 4. `kudosDisplay.js` — afficher les infos de kudos

- Affiche la date à laquelle on a donné des kudos
- Affiche une petite bulle d'info au survol du badge, avec la date dans différents formats
- Affiche un message pendant que le module vérifie si des kudos ont déjà été donnés

### 5. `kudosTracking.js` — garder les kudos à jour entre onglets

- Met à jour le badge de kudos si on a donné un kudos depuis un autre onglet
- Ajoute un bouton pour vérifier soi-même si des kudos ont été donnés

### 6. `kudosManager.js` — chef d'orchestre des kudos

- Fait fonctionner ensemble les trois fichiers précédents liés aux kudos (détection, affichage, synchronisation entre onglets)

### 7. `kudosExtendedFeatures.js` — statistiques de kudos

- Montre le nombre total de kudos donnés, réparti par mois
- Montre la plus longue série de jours consécutifs avec au moins un kudos donné
- Permet d'exporter ses statistiques de kudos en JSON ou en CSV

### 8. `starRatings.js` — noter les fics par étoiles

- Ajoute une notation personnelle de 1 à 5 étoiles sur la page d'une fic
- Affiche aussi la note sur les listes de fics
- Permet d'écrire une note avec chaque notation

### 9. `multiStatusTracker.js` — statut de lecture

- Permet de choisir un statut parmi 7 : à lire, en cours, terminé, abandonné, pas aimé, en pause, relu
- Affiche le statut avec un badge et un menu déroulant, sur la page de la fic et sur les listes
- Permet d'écrire une note quand on marque une fic "abandonnée" ou "pas aimée"
- Permet de cacher certains statuts sur les listes
- Montre des statistiques (par exemple le pourcentage de fics terminées) et permet de les exporter

### 10. `ficAppreciation.css`

- Les styles visuels de tous les boutons, badges et panneaux ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Recevoir un rappel pour les fics qu'on a lues mais qu'on n'a jamais kudosées
- Scanner tout un fandom pour repérer ses fics favorites qui n'ont pas encore reçu de kudos
- Voir ses statistiques de kudos réparties par fandom ou par auteur — en ce moment ce n'est que par mois
- Transférer ses kudos d'un ancien compte AO3 vers un autre
- Trouver les fics qu'on a kudosées mais jamais mises en favoris
- Des catégories pour les notes en étoiles (intrigue / personnages / écriture), pas juste une note libre
- Voir comment une note en étoiles a changé si on la remet à jour plus tard
- Redonner des kudos en masse à partir d'un ancien compte
- Découvrir d'autres lecteurs qui kudosent les mêmes fics que toi
- Voir l'évolution de tes notes en étoiles au fil du temps, pas juste leur répartition actuelle
- Comparer tes notes personnelles aux statistiques d'engagement de la communauté
- Ajouter des tags d'humeur ou d'émotion à une fic (drôle, triste, réconfortant...)
- Un pourcentage de progression au lieu du simple statut "terminé"
- Quand on essaie de redonner un kudos à une fic déjà kudosée, transformer
  automatiquement cette tentative en petit commentaire (par exemple
  "toujours autant fan !")
- Limiter le nombre de kudos qu'on peut donner par minute, pour éviter les
  abus
- Un historique chronologique de tous les kudos donnés, qu'on pourrait
  filtrer ou dans lequel on pourrait chercher
- Un score personnel unique qui combine plusieurs notes par catégories,
  affiché directement sur les listes de fics
- Une fenêtre de confirmation avant d'envoyer un kudos, pour éviter les
  clics accidentels
- Proposer de noter la fic en étoiles au moment où on la marque comme terminée
- Compter combien de fois on a relu une fic, pas juste marquer qu'on l'a relue
- De petites félicitations quand on atteint un cap de fics terminées (par exemple la 50e)
- Des demi-étoiles pour noter plus précisément
- Des statistiques sur les notes en étoiles (note moyenne, répartition, nombre total de fics notées)
- Garder la date exacte à laquelle tu as fini de lire une fic, pas juste le statut "terminé"
- Analyser tes habitudes de kudos avec le tableau de bord d'activité (par exemple, à quels moments tu donnes le plus de kudos)

## Explicitement écarté

- Partager ses statistiques de complétion avec d'autres — la lecture reste privée
- Un vrai système de critiques longues — les commentaires AO3 suffisent déjà
- Un moteur de recommandations basé sur tes appréciations — jugé trop subjectif
- Partager ses listes de recommandations avec d'autres — pour rester privé
- Deviner si une fic risque d'être abandonnée pour lui coller un badge
  "à risque" — écarté pour des raisons éthiques, ça porterait un jugement
  sur le travail de l'auteur
- Modifier directement le vrai système de notes ou de kudos d'AO3 — écarté, ça ne respecte pas la règle de l'extension qui ajoute des infos par-dessus le site sans jamais toucher au site original

## Précision

⚠️ La doc historique anglaise disait que le statut de lecture à plusieurs
valeurs avait été rejeté ("trop compliqué") et que le bouton de kudos
rapide n'existait pas. En réalité, les 7 statuts de lecture
(`multiStatusTracker.js`) et le bouton de kudos rapide sont bel et bien
codés aujourd'hui. Elle disait aussi que le rappel de commentaire à la
revisite d'une fic était à peine commencé — en réalité c'est une bannière
complète, avec la date du kudos et un lien direct vers les commentaires.


AO3 Helper — Fic Appreciation Coordinator
    Module ID:    ficAppreciation
    Display Name: Fic Appreciation
    Tab:          Library

    Submodules (instantiated by this coordinator, imported directly as ES modules):
        MarkAsFinished      -- completion tracker
        KudosTracker        -- kudos detection & badges
        KudosDisplay        -- kudos badge display layer
        KudosTracking       -- cross-tab sync & manual check
        KudosManager        -- orchestrates kudos submodules
        KudosExtendedFeatures -- kudos analytics & export
        StarRatings         -- 1-5 star personal ratings
        MultiStatusTracker  -- 7-status reading tracker

    Storage keys (read/written through AO3H.store.lsGet/lsSet — the Core's storage
    helper, equivalent to localStorage.getItem/setItem('ao3h:' + key) ; despite
    AO3H.store being a "per-user" wrapper, its lsGet/lsSet pass through to the
    same raw synchronous localStorage as everywhere else — only the async
    get/set/del (GM-value backed) are namespaced per detected AO3 username):
        ficAppreciation:finished  -- { [workId]: { date, note? } }
        ficAppreciation:kudosed   -- { [workId]: { date } }
        ficAppreciation:ratings   -- { [workId]: { stars, note? } }
        ficAppreciation:status    -- { [workId]: { status, date, note? } }

    Public API (AO3H.ficAppreciation):
        isFinished(workId), hasGivenKudos(workId), getRating(workId),
        getStatus(workId), markFinished(workId, note?), recordKudos(workId),
        getKudosStats(), getStatusStats(), exportKudos(format), exportStatuses(format)



        AO3 Helper — Fic Appreciation › KudosDisplay sub-module
    Complements KudosTracker (which handles: detection, recording,
    greying out the kudos button, 🧡 badge on blurbs, quick-kudos button).
    KudosDisplay adds the richer display layer on top.

    - Feature: "Kudos given" badge on work pages
      - Option: Formatted date display (long / short / relative)
      - Option: Custom icon via cfg('kudosIcon')
      - Option: Injected after the kudos section

    - Feature: Rich tooltip on kudos badges (listings)
      - Option: Hover tooltip with formatted kudos date
      - Option: Date format: 'long' (default), 'short', 'relative'

    - Feature: Custom icon on kudos badges (listings)
      - Option: Replace default 🧡 with user-configured icon

    - Feature: Loading state indicator
      - Option: "Checking kudos status…" inline text near kudos section
      - Option: Shown during async detection, removed when done

═══════════════════════════════════════════════════════════════════════════ */

/**
 * KudosDisplay — enhanced display layer on top of KudosTracker.
 * KudosTracker handles: detection, recording, graying out button, 🧡 badge on blurbs.
 * KudosDisplay handles: formatted "Kudos given" badge on work page, rich tooltips,
 *                       loading indicator, custom icon via cfg.



 AO3 Helper — Fic Appreciation › KudosExtendedFeatures sub-module
    Extended analytics and export on top of KudosTracker storage.
    Re-kudos comment assist is implemented in KudosTracker._injectRevisitPrompt.

    - Feature: Kudos statistics
      - Total kudos count
      - Distribution by month/year (from stored dates)
      - Longest streak (consecutive days with a kudos)

    - Feature: Export kudos list
      - Option: JSON export — { workId, date } array
      - Option: CSV export  — workId,date columns
      - Option: Filename includes today's date
      - Option: Triggered via exportKudos(format)

    - Feature: Bulk-view helper
      - buildStatsHTML() — returns an HTML string summarising the stats
        for embedding in a panel or injected UI element

    - Feature: Re-kudos comment assist (see KudosTracker._injectRevisitPrompt)
      - Already implemented there; this file does not duplicate it



      AO3 Helper — Fic Appreciation › KudosManager helper class
    Orchestrates KudosTracker + KudosDisplay + KudosTracking together.
    Instantiated by the ficAppreciation coordinator.

    - Feature: Work page kudos wiring
      - Detects kudos (KudosTracker), shows loading state (KudosDisplay),
        injects badge after kudos section (KudosDisplay), injects manual
        check button (KudosTracking)

    - Feature: Listing blurbs kudos wiring
      - Applies 🧡 badge (KudosTracker), enriches with tooltip + custom
        icon (KudosDisplay), injects quick-kudos button when configured

    - Feature: Cross-tab sync
      - Starts tab sync (KudosTracking) so badges stay current when kudos
        are recorded in another tab

    - Feature: Cleanup
      - Disconnects all injected elements and listeners


      AO3 Helper — Fic Appreciation › KudosTracker sub-module
    Storage key: ficAppreciation:kudosed  — { [workId]: { date } }
    Methods: hasGivenKudos, recordKudos, detectKudosOnWorkPage,
             applyKudosStateOnWorkPage, applyKudosBadge



AO3 Helper — Fic Appreciation › KudosTracking sub-module
    Complements KudosTracker (which handles: detection, recording,
    greying out the kudos button, badges, quick-kudos button).
    KudosTracking adds the cross-session coordination layer.

    - Feature: Cross-tab sync
      - Option: Listens to storage events from other tabs
      - Option: Re-applies kudos badges when kudos are recorded elsewhere
      - Option: Calls onKudosChange(workId) callback on change

    - Feature: Manual "Check Kudos" button on work pages
      - Option: Injected into ul.actions alongside the kudos form
      - Option: Triggers KudosTracker.detectKudosOnWorkPage() on click
      - Option: Shows result inline (found / not found)
      - Option: Removed on cleanup

    - Feature: Hide-kudosed filter persistence
      - Option: Saves the hideKudosedFilter toggle state across sessions
      - Option: Integration with coordinator cfg




AO3 Helper — Fic Appreciation › MarkAsFinished sub-module
    Storage key: ficAppreciation:finished  — { [workId]: { date, note? } }
    Methods: isFinished, markFinished, unmarkFinished,
             injectFinishButton, applyFinishedBadge



AO3 Helper — Fic Appreciation › MultiStatusTracker sub-module
    Storage key: ficAppreciation:status  — { [workId]: { status, date, note? } }
    Methods: getStatus, setStatus, clearStatus,
             applyStatusBadge, injectStatusToggle,
             injectWorkPageStatusToggle,
             shouldHide, getStats, exportStatuses

    - Feature: Multiple reading status options
      - To-Read 📚, Reading 📖, Finished ✅, Dropped ❌,
        Disliked 💔, On-Hold ⏸️, Re-read 🔁
      - Each status stored with date and optional note

    - Feature: Status badges on work blurbs
      - Icon badge appended to h4.heading
      - Tooltip shows status label + date + note

    - Feature: Quick status toggle on blurbs
      - Dropdown injected into .stats area
      - Updates badge immediately on change

    - Feature: Status toggle on work pages
      - Dropdown injected into ul.actions
      - Shows current status; updates on selection

    - Feature: Status notes
      - Optional prompt for note on Dropped/Disliked
      - Note stored alongside status

    - Feature: Status filtering (hide by status)
      - shouldHide(workId, statusesToHide) helper
      - Called by coordinator for active filter cfg

    - Feature: Statistics
      - getStats() — count per status, completionRate, dropRate

    - Feature: Export
      - exportStatuses('json'|'csv') — downloads all statuses



      AO3 Helper — Fic Appreciation › StarRatings sub-module
    Storage key: ficAppreciation:ratings  — { [workId]: { stars, date, note? } }
    Methods: getRating, setRating,
             buildStarWidget, refreshStarWidget,
             injectStarWidgetOnWorkPage, applyRatingBadge


═══════════════════════════════════════════════════════════════════════════    
  # ficAppreciation
  **Tab :** Library
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Fic Appreciation** regroupe les outils permettant de suivre son appréciation personnelle d’une œuvre.

* Il remplace trois anciens modules qui géraient séparément :
  - la complétion d’une fic ;
  - le suivi des kudos ;
  - la notation personnelle.

* Le module permet notamment de :
  - marquer une œuvre comme terminée ;
  - vérifier si un kudos a déjà été donné ;
  - donner rapidement un kudos depuis une liste ;
  - afficher la date d’un kudos ;
  - synchroniser les informations de kudos entre plusieurs onglets ;
  - attribuer une note personnelle de une à cinq étoiles ;
  - associer une note écrite à une notation ;
  - choisir parmi sept statuts de lecture ;
  - cacher certaines œuvres selon leur statut ;
  - afficher des statistiques de complétion, de kudos et de statuts ;
  - exporter les données personnelles liées aux kudos et aux statuts.

---

# Réglages utilisateur

| Réglage                  | Description                                                                                                |
| ------------------------ |------------------------------------------------------------------------------------------------------------|
| `showManualCheckButton`  | Ajoute sur la page d’une œuvre un bouton permettant de vérifier manuellement si un kudos a déjà été donné. |
| `statusNotes`            | Permet d’ajouter une note personnelle à certains statuts de lecture.                                       |
| `hideStatusFilter`       | Définit les statuts de lecture à masquer dans les listes d’œuvres.                                         |
| `completionNotes`        | Permet d’écrire une note lorsqu’une œuvre est marquée comme terminée.                                      |
| `filterCompletedWorks`   | Masque dans les listes les œuvres déjà marquées comme terminées.                                           |
| `quickKudosButton`       | Ajoute un bouton permettant de donner un kudos directement depuis une liste, sans ouvrir l’œuvre.          |
| `commentAssistOnRevisit` | Propose de laisser un commentaire lorsqu’une œuvre déjà kudosée est consultée de nouveau.                  |
| `hideKudosedFilter`      | Masque dans les listes les œuvres auxquelles un kudos a déjà été donné.                                    |
| `showRatingOnBlurbs`     | Affiche la note personnelle en étoiles directement dans les listes.                                        |
| `ratingNotes`            | Permet d’associer une note écrite à chaque notation en étoiles.                                            |
| `kudosIcon`              | Définit l’icône utilisée pour les boutons et badges de kudos.                                              |
| `tooltipDateFormat`      | Définit le format de la date du kudos : complet, court ou relatif.                                         |

Le panneau affiche également une section **Sync & Refresh** proposant des options liées :

* à la synchronisation ;
* au tri ;
* à l’actualisation.

Ces options ne sont pas encore reliées à une fonctionnalité active.

---

# Structure du module

Le module est composé d’un fichier coordinateur, de huit sous-modules fonctionnels et d’une feuille de style.

```text
_ficAppreciation.js
markAsFinished.js
kudosTracker.js
kudosDisplay.js
kudosTracking.js
kudosManager.js
kudosExtendedFeatures.js
starRatings.js
multiStatusTracker.js
ficAppreciation.css
```

Les sous-modules sont importés directement comme modules ES et instanciés par le coordinateur.

---

# _ficAppreciation.js

## Rôle

Fichier coordinateur du module.

Il initialise tous les sous-modules, adapte leur fonctionnement selon le type de page affiché et expose une API publique utilisable par le reste d’AO3 Helper.

---

## Responsabilités

* Initialise les sous-modules de complétion, de kudos, de notation et de statut.
* Détermine si l’utilisateur se trouve sur une page d’œuvre ou sur une liste.
* Applique les boutons et badges appropriés selon le contexte.
* Coordonne les différents composants liés aux kudos.
* Applique les filtres de complétion, de kudos et de statuts.
* Expose les principales actions du module au reste de l’extension.
* Centralise l’accès aux données personnelles enregistrées.

---

## Fonctions exposées

L’API publique est accessible via :

```text
AO3H.ficAppreciation
```

Elle expose notamment les fonctions suivantes :

```text
isFinished(workId)
hasGivenKudos(workId)
getRating(workId)
getStatus(workId)
markFinished(workId, note?)
recordKudos(workId)
getKudosStats()
getStatusStats()
exportKudos(format)
exportStatuses(format)
```

---

## Détails techniques

Les données sont lues et enregistrées à l’aide de :

```text
AO3H.store.lsGet
AO3H.store.lsSet
```

Ces fonctions utilisent le même stockage synchrone que `localStorage`, avec le préfixe général `ao3h:`.

Même si `AO3H.store` possède également un système asynchrone séparé par utilisateur AO3, les méthodes `lsGet` et `lsSet` utilisées ici accèdent directement au stockage local partagé.

Les principales clés sont :

```text
ficAppreciation:finished
ficAppreciation:kudosed
ficAppreciation:ratings
ficAppreciation:status
```

La clé :

```text
ficAppreciation:finished
```

contient les œuvres terminées :

```text
{
  [workId]: {
    date,
    note?
  }
}
```

La clé :

```text
ficAppreciation:kudosed
```

contient les œuvres kudosées :

```text
{
  [workId]: {
    date
  }
}
```

La clé :

```text
ficAppreciation:ratings
```

contient les évaluations personnelles :

```text
{
  [workId]: {
    stars,
    date,
    note?
  }
}
```

La clé :

```text
ficAppreciation:status
```

contient les statuts de lecture :

```text
{
  [workId]: {
    status,
    date,
    note?
  }
}
```

---

# markAsFinished.js

## Rôle

Gère le marquage des œuvres terminées.

---

## Fonctionnalités

### Bouton sur les pages d’œuvres

Ajoute un bouton :

```text
✓ Mark as Finished
```

sur la page d’une œuvre.

Le bouton permet de marquer ou de démarquer l’œuvre comme terminée.

---

### Badge dans les listes

Ajoute un badge sur les blurbs des œuvres déjà terminées.

---

### Bouton rapide

Ajoute également une action rapide dans les listes afin de modifier l’état de complétion sans ouvrir l’œuvre.

---

### Note de complétion

Lorsque `completionNotes` est activé, l’utilisateur peut écrire une note au moment de marquer l’œuvre comme terminée.

Cette note est enregistrée avec :

* la date de complétion ;
* l’identifiant de l’œuvre.

---

### Filtrage des œuvres terminées

Lorsque `filterCompletedWorks` est activé, les œuvres déjà terminées peuvent être masquées dans les listes.

---

## Détails techniques

Les données sont enregistrées sous :

```text
ficAppreciation:finished
```

Le sous-module expose notamment les méthodes suivantes :

```text
isFinished(workId)
markFinished(workId, note?)
unmarkFinished(workId)
injectFinishButton()
applyFinishedBadge()
```

---

## Dépendances

* `_ficAppreciation.js`
* le stockage partagé du module
* les pages d’œuvres et les listes AO3

---

# kudosTracker.js

## Rôle

Détecte, enregistre et affiche l’état principal des kudos.

Il constitue la couche de base du système de suivi des kudos.

---

## Fonctionnalités

### Détection des kudos

Détermine si l’utilisateur a déjà donné un kudos à une œuvre.

La détection peut être effectuée sur la page de l’œuvre.

---

### Enregistrement

Lorsqu’un kudos est détecté ou donné, le sous-module enregistre :

* l’identifiant de l’œuvre ;
* la date du kudos.

---

### État du bouton AO3

Lorsque l’œuvre a déjà reçu un kudos, le bouton de kudos est grisé afin d’indiquer son état.

---

### Badge dans les listes

Ajoute un badge `🧡` sur les blurbs correspondant à des œuvres déjà kudosées.

L’icône peut être remplacée par la valeur de :

```text
kudosIcon
```

---

### Bouton de kudos rapide

Lorsque `quickKudosButton` est activé, ajoute un bouton permettant de donner un kudos directement depuis une liste.

L’utilisateur n’a alors pas besoin d’ouvrir la page complète de l’œuvre.

---

### Filtre des œuvres kudosées

Lorsque `hideKudosedFilter` est activé, les œuvres déjà kudosées peuvent être masquées dans les listes.

---

### Aide au commentaire lors d’une revisite

Lorsque `commentAssistOnRevisit` est activé, le sous-module affiche une bannière lorsqu’une œuvre déjà kudosée est visitée de nouveau.

La bannière contient notamment :

* la date du kudos ;
* un lien direct vers la section des commentaires ;
* une invitation à laisser un commentaire.

---

## Détails techniques

Les données sont enregistrées sous :

```text
ficAppreciation:kudosed
```

Le sous-module expose notamment les méthodes suivantes :

```text
hasGivenKudos(workId)
recordKudos(workId)
detectKudosOnWorkPage()
applyKudosStateOnWorkPage()
applyKudosBadge()
```

La fonctionnalité d’aide au commentaire est implémentée dans :

```text
KudosTracker._injectRevisitPrompt
```

---

## Dépendances

* `_ficAppreciation.js`
* `kudosDisplay.js`
* `kudosTracking.js`
* `kudosManager.js`

---

# kudosDisplay.js

## Rôle

Ajoute une couche d’affichage enrichie au système principal de suivi des kudos.

Il complète `kudosTracker.js`, qui reste responsable de la détection, de l’enregistrement et de l’état principal des boutons et badges.

---

## Fonctionnalités

### Badge sur les pages d’œuvres

Ajoute un badge **Kudos given** après la section des kudos.

Ce badge peut afficher :

* l’icône configurée ;
* la date à laquelle le kudos a été donné.

---

### Format de la date

Le réglage `tooltipDateFormat` permet de choisir entre :

* `long` : date complète ;
* `short` : date courte ;
* `relative` : date relative, par exemple « il y a 3 jours ».

---

### Bulle d’information

Ajoute une bulle au survol des badges de kudos présents dans les listes.

Cette bulle affiche la date du kudos selon le format choisi.

---

### Icône personnalisée

Remplace l’icône par défaut `🧡` par la valeur définie dans :

```text
kudosIcon
```

Cette personnalisation s’applique notamment :

* au badge de la page d’œuvre ;
* aux badges des listes.

---

### Indicateur de chargement

Affiche temporairement le message :

```text
Checking kudos status…
```

près de la section des kudos pendant la vérification asynchrone.

Le message est retiré lorsque la détection est terminée.

---

## Détails techniques

Le sous-module intervient uniquement sur l’affichage.

Il ne remplace pas les responsabilités de `kudosTracker.js`.

---

## Dépendances

* `kudosTracker.js`
* `kudosManager.js`
* la configuration `kudosIcon`
* la configuration `tooltipDateFormat`

---

# kudosTracking.js

## Rôle

Gère la synchronisation des kudos entre les onglets et ajoute la vérification manuelle.

---

## Fonctionnalités

### Synchronisation entre onglets

Écoute les événements de stockage provenant des autres onglets.

Lorsqu’un kudos est enregistré ailleurs, le sous-module :

* réapplique les badges de kudos ;
* actualise l’état visible ;
* appelle le callback `onKudosChange(workId)` lorsqu’il est défini.

---

### Vérification manuelle

Lorsque `showManualCheckButton` est activé, ajoute un bouton **Check Kudos** dans :

```text
ul.actions
```

près du formulaire de kudos.

Un clic sur le bouton déclenche :

```text
KudosTracker.detectKudosOnWorkPage()
```

Le résultat est ensuite affiché directement sur la page :

* kudos trouvé ;
* kudos non trouvé.

Le bouton et le résultat sont supprimés lors du nettoyage du sous-module.

---

### Persistance du filtre

Mémorise l’état du réglage :

```text
hideKudosedFilter
```

afin de conserver le choix de l’utilisateur entre les sessions.

---

## Détails techniques

La synchronisation repose sur les événements natifs de stockage du navigateur.

---

## Dépendances

* `kudosTracker.js`
* `kudosManager.js`
* `_ficAppreciation.js`

---

# kudosManager.js

## Rôle

Coordonne le fonctionnement des trois principales couches du système de kudos :

* `kudosTracker.js`
* `kudosDisplay.js`
* `kudosTracking.js`

---

## Fonctionnalités

### Coordination sur les pages d’œuvres

Sur une page d’œuvre, le gestionnaire :

* lance la détection avec `KudosTracker` ;
* affiche l’état de chargement avec `KudosDisplay` ;
* injecte le badge après la section des kudos ;
* ajoute le bouton de vérification manuelle avec `KudosTracking`.

---

### Coordination dans les listes

Sur les blurbs, le gestionnaire :

* applique le badge de kudos ;
* ajoute la bulle d’information ;
* applique l’icône personnalisée ;
* ajoute le bouton de kudos rapide lorsqu’il est activé.

---

### Synchronisation entre onglets

Démarre la synchronisation afin que les badges restent à jour lorsqu’un kudos est enregistré dans un autre onglet.

---

### Nettoyage

Supprime :

* les éléments injectés ;
* les écouteurs d’événements ;
* les mécanismes de synchronisation.

---

## Détails techniques

Le sous-module est une classe d’assistance instanciée directement par `_ficAppreciation.js`.

---

## Dépendances

* `kudosTracker.js`
* `kudosDisplay.js`
* `kudosTracking.js`

---

# kudosExtendedFeatures.js

## Rôle

Ajoute des statistiques et des fonctions d’export au système de suivi des kudos.

---

## Fonctionnalités

### Nombre total de kudos

Calcule le nombre total de kudos enregistrés.

---

### Répartition mensuelle

Regroupe les kudos selon :

* le mois ;
* l’année.

Cette répartition est calculée à partir des dates enregistrées.

---

### Série de kudos

Calcule la plus longue série de jours consécutifs pendant lesquels au moins un kudos a été donné.

---

### Export JSON

Permet d’exporter les kudos sous forme d’une liste contenant :

```text
workId
date
```

---

### Export CSV

Permet également un export avec les colonnes :

```text
workId,date
```

---

### Nom du fichier

Le nom du fichier exporté contient la date du jour.

---

### Résumé HTML

La fonction :

```text
buildStatsHTML()
```

retourne une chaîne HTML résumant les statistiques.

Ce contenu peut être intégré :

* dans un panneau ;
* dans un élément injecté sur une page.

---

## Détails techniques

L’export est déclenché à l’aide de :

```text
exportKudos(format)
```

Les formats pris en charge sont :

```text
json
csv
```

La fonctionnalité d’aide au commentaire lors d’une revisite est déjà implémentée dans `kudosTracker.js` et n’est pas dupliquée ici.

---

## Dépendances

* `kudosTracker.js`
* `ficAppreciation:kudosed`

---

# starRatings.js

## Rôle

Permet d’attribuer une note personnelle de une à cinq étoiles à une œuvre.

---

## Fonctionnalités

### Notation sur les pages d’œuvres

Ajoute un widget de notation personnelle permettant de choisir entre :

* 1 étoile ;
* 2 étoiles ;
* 3 étoiles ;
* 4 étoiles ;
* 5 étoiles.

---

### Affichage dans les listes

Lorsque `showRatingOnBlurbs` est activé, la note est également affichée directement sur les blurbs.

---

### Note associée

Lorsque `ratingNotes` est activé, l’utilisateur peut ajouter une note écrite à sa notation en étoiles.

---

### Actualisation du widget

Le widget est actualisé immédiatement lorsqu’une nouvelle note est choisie.

---

## Détails techniques

Les données sont enregistrées sous :

```text
ficAppreciation:ratings
```

Chaque entrée peut contenir :

```text
{
  stars,
  date,
  note?
}
```

Le sous-module expose notamment les méthodes suivantes :

```text
getRating(workId)
setRating(workId, stars, note?)
buildStarWidget()
refreshStarWidget()
injectStarWidgetOnWorkPage()
applyRatingBadge()
```

---

## Dépendances

* `_ficAppreciation.js`
* le stockage partagé du module
* les pages d’œuvres et les blurbs AO3

---

# multiStatusTracker.js

## Rôle

Permet d’attribuer à chaque œuvre un statut de lecture parmi sept possibilités.

---

## Fonctionnalités

### Statuts disponibles

Les statuts proposés sont :

| Statut   | Icône |
| -------- | ----- |
| To-Read  | `📚`  |
| Reading  | `📖`  |
| Finished | `✅`   |
| Dropped  | `❌`   |
| Disliked | `💔`  |
| On-Hold  | `⏸️`  |
| Re-read  | `🔁`  |

Chaque statut est enregistré avec :

* sa date ;
* une note facultative.

---

### Badge dans les listes

Ajoute un badge dans :

```text
h4.heading
```

sur les blurbs.

La bulle d’information du badge peut afficher :

* le nom du statut ;
* sa date ;
* la note associée.

---

### Sélecteur rapide dans les listes

Ajoute un menu déroulant dans :

```text
.stats
```

afin de modifier rapidement le statut.

Le badge est actualisé immédiatement après la sélection.

---

### Sélecteur sur les pages d’œuvres

Ajoute également un menu déroulant dans :

```text
ul.actions
```

sur les pages d’œuvres.

Le menu affiche le statut actuel et permet de le modifier.

---

### Notes de statut

Lorsque `statusNotes` est activé, une note facultative peut être demandée pour les statuts :

* Dropped ;
* Disliked.

La note est enregistrée avec le statut.

---

### Filtrage par statut

Le réglage `hideStatusFilter` permet de masquer certains statuts dans les listes.

Le sous-module utilise pour cela la fonction :

```text
shouldHide(workId, statusesToHide)
```

---

### Statistiques

Calcule notamment :

* le nombre d’œuvres par statut ;
* le taux de complétion ;
* le taux d’abandon.

---

### Export

Permet d’exporter tous les statuts dans les formats :

* JSON ;
* CSV.

---

## Détails techniques

Les données sont enregistrées sous :

```text
ficAppreciation:status
```

Chaque entrée peut contenir :

```text
{
  status,
  date,
  note?
}
```

Le sous-module expose notamment les méthodes suivantes :

```text
getStatus(workId)
setStatus(workId, status, note?)
clearStatus(workId)
applyStatusBadge()
injectStatusToggle()
injectWorkPageStatusToggle()
shouldHide(workId, statusesToHide)
getStats()
exportStatuses(format)
```

---

## Dépendances

* `_ficAppreciation.js`
* le stockage partagé du module
* les pages d’œuvres et les listes AO3

---

# ficAppreciation.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Fic Appreciation**.

Il définit notamment l’apparence :

* des boutons de complétion ;
* des badges d’œuvres terminées ;
* des boutons et badges de kudos ;
* de l’indicateur de vérification des kudos ;
* des bulles affichant la date du kudos ;
* de la bannière d’aide au commentaire ;
* des widgets de notation en étoiles ;
* des badges de statut ;
* des menus déroulants de statut ;
* des panneaux de statistiques et d’export.

---

# Fonctionnalités non implémentées

## Rappel de kudos

Afficher un rappel pour les œuvres déjà lues auxquelles aucun kudos n’a encore été donné.

---

## Analyse complète d’un fandom

Scanner toutes les œuvres d’un fandom afin de repérer les œuvres favorites de l’utilisateur qui n’ont pas encore reçu de kudos.

---

## Statistiques de kudos par fandom ou auteur

Répartir les kudos selon :

* le fandom ;
* l’auteur.

Les statistiques actuelles sont uniquement regroupées par mois et année.

---

## Transfert entre comptes

Transférer les kudos enregistrés d’un ancien compte AO3 vers un nouveau compte.

---

## Œuvres kudosées non favorites

Identifier les œuvres auxquelles un kudos a été donné mais qui n’ont jamais été ajoutées aux favoris.

---

## Catégories de notation

Permettre de noter séparément plusieurs aspects d’une œuvre, par exemple :

* l’intrigue ;
* les personnages ;
* l’écriture.

Le système actuel utilise une seule note générale et une note textuelle facultative.

---

## Historique des évaluations

Conserver les anciennes valeurs d’une notation lorsqu’elle est modifiée.

---

## Kudos en masse depuis un ancien compte

Permettre de redonner en masse des kudos à partir d’une liste provenant d’un ancien compte.

---

## Lecteurs aux goûts similaires

Identifier d’autres lecteurs ayant donné des kudos aux mêmes œuvres.

---

## Évolution des évaluations

Afficher l’évolution des notes en étoiles au fil du temps plutôt que leur seule répartition actuelle.

---

## Comparaison avec l’engagement communautaire

Comparer les notes personnelles avec les statistiques publiques d’engagement des œuvres.

---

## Tags d’humeur

Ajouter des tags personnels décrivant l’émotion ou l’ambiance d’une œuvre, par exemple :

* drôle ;
* triste ;
* réconfortante.

---

## Pourcentage de progression

Remplacer ou compléter les statuts par un pourcentage précis de lecture.

---

## Transformation d’un second kudos en commentaire

Lorsqu’un utilisateur tente de donner un second kudos à une œuvre déjà kudosée, transformer automatiquement cette tentative en commentaire, par exemple :

```text
Toujours autant fan !
```

---

## Limitation du rythme des kudos

Limiter le nombre de kudos pouvant être donnés par minute afin d’éviter les abus.

---

## Historique complet des kudos

Créer une vue chronologique de tous les kudos donnés avec :

* une recherche ;
* des filtres ;
* un classement.

---

## Score personnel combiné

Calculer une note générale à partir de plusieurs catégories d’évaluation et l’afficher directement dans les listes.

---

## Confirmation avant kudos

Afficher une fenêtre de confirmation avant l’envoi d’un kudos afin d’éviter les clics accidentels.

---

## Suggestion de notation après complétion

Proposer d’attribuer une note en étoiles au moment où une œuvre est marquée comme terminée.

---

## Nombre de relectures

Compter combien de fois une œuvre a été relue au lieu de conserver uniquement le statut **Re-read**.

---

## Félicitations de complétion

Afficher une petite célébration lorsqu’un certain nombre d’œuvres terminées est atteint, par exemple la cinquantième.

---

## Demi-étoiles

Permettre des évaluations plus précises avec des demi-étoiles.

---

## Statistiques de notation

Calculer notamment :

* la note moyenne ;
* la répartition des notes ;
* le nombre total d’œuvres notées.

---

## Date exacte de complétion

Conserver et afficher explicitement la date à laquelle une œuvre a été terminée.

La structure de stockage contient déjà une date, mais aucune fonctionnalité dédiée complète n’est décrite pour son affichage et son analyse.

---

## Intégration au tableau de bord d’activité

Analyser les habitudes de kudos dans **Activity Panel**, par exemple les moments de la journée où l’utilisateur donne le plus souvent des kudos.

---

# Décisions de conception

## Partage des statistiques de complétion

Le module ne permet pas de partager ses statistiques de complétion avec d’autres personnes.

Les données de lecture restent privées.

---

## Critiques longues

Le module ne remplace pas les commentaires AO3 par un véritable système de critiques longues.

Les commentaires fournis par AO3 sont considérés comme suffisants.

---

## Recommandations basées sur l’appréciation

Le module ne crée pas de moteur de recommandations fondé sur les notes, statuts ou kudos personnels.

Cette approche a été jugée trop subjective.

---

## Partage de listes de recommandations

Le module ne permet pas de partager des listes de recommandations personnelles.

Cette décision vise à conserver les données privées.

---

## Prédiction d’abandon

Le module ne tente pas de prédire qu’une œuvre risque d’être abandonnée et ne lui attribue pas de badge « à risque ».

Cette fonctionnalité a été écartée pour des raisons éthiques, puisqu’elle porterait un jugement sur le travail de l’auteur.

---

## Modification des données AO3

Le module ne modifie jamais directement le véritable système de kudos, de notes ou de statistiques d’AO3.

Il ajoute uniquement des informations personnelles par-dessus l’interface existante, conformément au principe général de l’extension.

---

# Précision historique

Une ancienne documentation anglaise indiquait que :

* le système de statuts multiples avait été rejeté comme trop complexe ;
* le bouton de kudos rapide n’existait pas ;
* l’aide au commentaire lors d’une revisite était à peine commencée.

Ces informations sont désormais obsolètes.

Le code actuel comprend bien :

* les sept statuts de lecture gérés par `multiStatusTracker.js` ;
* le bouton de kudos rapide ;
* une bannière complète lors de la revisite d’une œuvre déjà kudosée, contenant la date du kudos et un lien direct vers les commentaires.
