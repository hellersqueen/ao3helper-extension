# laterShelf

**Tab:** Library

## À quoi ça sert

Ce module améliore la liste "Marked for Later" (MFL) d'AO3 : un bouton pour
ajouter rapidement une fic à lire plus tard, un badge pour repérer les
fics déjà dans cette liste, le tri et le filtrage de la liste, la
sélection de plusieurs fics à la fois, et des rappels programmés.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showQuickButton` | activé | Affiche le bouton 📌 sur les listes de fics |
| `remindersEnabled` | désactivé | Active les rappels programmés pour une fic, avec notification du navigateur |

Le panneau affiche aussi une section "Sync & Refresh" (synchroniser,
trier, actualiser) *(pas encore actif — rien n'est branché derrière)*.

## Fichiers

### 1. `_laterShelf.js` — le chef d'orchestre

- Met en route les trois autres fichiers de fonctionnalités de ce module

### 2. `laterShelfStore.js` — la mémoire partagée

- Garde en un seul endroit la liste des fics sauvegardées, pour que les autres fichiers puissent la lire et l'écrire
- Ajoute la fic actuellement affichée à la liste

### 3. `quickMarkForLaterButton.js` — bouton de sauvegarde rapide

- Ajoute un bouton "📌 Save for later" sur chaque fic d'une liste
- Le bouton change d'apparence ("📌 Saved") si la fic est déjà sauvegardée
- Un clic ajoute ou retire la fic de la liste

### 4. `markedForLaterStatus.js` — badges, tri et sélection

- Affiche un badge 📌 sur les fics déjà sauvegardées, partout où elles apparaissent
- Sur la page "Marked for Later" : affiche un compteur total et la date à laquelle chaque fic a été ajoutée
- Ajoute une barre de tri (par date, titre, nombre de mots, dernière mise à jour) et de filtre (en cours seulement, terminées seulement, par nombre de mots, par fandom)
- Permet de cocher plusieurs fics à la fois pour les retirer toutes en même temps

### 5. `workReminder.js` — rappels programmés

- Ajoute un bouton "⏰ Remind me" pour choisir une date de rappel sur une fic de la liste
- Affiche un badge ⏰ sur les fics qui ont un rappel actif (⚠️ si la fic n'est plus disponible)
- Envoie une notification du navigateur quand la date du rappel arrive

### 6. `laterShelf.css`

- Les styles visuels de tous les boutons, badges et barres ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Des niveaux de priorité pour la liste (haute/moyenne/basse)
- Écrire une raison pour laquelle on a sauvegardé une fic
- Des statistiques sur la liste (combien de fics sauvegardées sont vraiment lues ensuite)
- Réorganiser la liste à la main par glisser-déposer
- Piocher une fic au hasard directement depuis la liste
- Des groupes dans la liste (lecture du week-end, fics courtes, gros projets)
- Un message "annuler" après avoir sauvegardé ou retiré une fic
- Sélectionner plusieurs fics directement sur une page de résultats pour les ajouter toutes en même temps à la liste
- Retirer automatiquement de la liste les fics qu'on a finies de lire
- Voir le temps de lecture estimé pour toute la liste
- Des petites célébrations quand on atteint un cap, par exemple "10 fics sauvegardées"
- Des rappels intelligents qui se basent sur les moments où on lit habituellement
- Un rappel spécial pour les fics qu'on a abandonnées
- Pouvoir reporter un rappel à plus tard
- Choisir où placer le bouton de sauvegarde rapide
- Ajouter une note rapide directement depuis le bouton de sauvegarde
- Choisir parmi plusieurs listes différentes au lieu d'une seule liste "à lire plus tard"
- Trier automatiquement la liste selon des critères intelligents
- Un badge avec le nombre total de fics dans la liste, visible en permanence dans le menu du site, sur lequel on peut cliquer pour voir un aperçu rapide sans changer de page
- Un objectif de lecture hebdomadaire pour vider la liste (par exemple "5 fics par semaine"), avec une barre de progression et un message d'encouragement
- Garder une archive consultable des fics qu'on a retirées de la liste, au lieu de les perdre définitivement
- Recevoir les rappels par email, en plus des notifications du navigateur
- Des rappels pour reprendre une fic qu'on est en train de lire, même si elle n'est pas dans la liste "à lire plus tard"
- Ajouter une série entière à la liste en un clic, au lieu de fic par fic
- Un raccourci clavier pour ajouter rapidement la fic en cours à la liste
- Une vue en grille avec un aperçu visuel de chaque fic, en plus de la liste actuelle
- Des rappels qui reviennent régulièrement (tous les jours, toutes les semaines) au lieu d'un rappel ponctuel une seule fois
- Être prévenu quand une fic de la liste reçoit un nouveau chapitre ou est terminée par son auteur
- Des niveaux de priorité (haute/moyenne/basse) pour les fics de la liste
- Un rappel spécial pour les fics qui traînent depuis longtemps dans la liste sans être lues
- Pouvoir écrire son propre message personnalisé pour les rappels
- Une alerte pour ne pas casser sa série de jours de lecture consécutifs
- Faire remonter automatiquement en haut de la liste les "pépites cachées" repérées par un autre module
- Exporter la liste "à lire plus tard" dans un fichier (par exemple en CSV ou juste la liste des liens)
- Garder un historique des rappels passés (envoyés ou annulés), pas seulement les rappels en cours
- Mettre une fic en favori et l'ajouter à la liste "à lire plus tard" en un seul clic, au lieu de faire les deux actions séparément
- Utiliser la longueur des fics pour te suggérer quoi lire selon le temps que tu as devant toi (par exemple une fic courte si tu as peu de temps)

## Explicitement écarté

- Une date limite de lecture façon "deadline" — jugé trop rigide
- Partager sa liste "à lire plus tard" avec d'autres personnes — pour rester privé
- Une liste "spéciale session" encore plus temporaire que la liste "à lire plus tard" — écarté, la liste "à lire plus tard" sert déjà à ça
- Colorer les fics selon depuis combien de temps elles traînent dans la liste — écarté, jugé trop culpabilisant

## Précision

⚠️ La doc historique anglaise décrit un robot qui parcourrait en arrière-plan
les pages de la liste MFL, ainsi qu'une synchronisation entre onglets.
Aucun des deux n'existe dans le code actuel : la liste est juste stockée
sur l'ordinateur, mise à jour directement par les boutons de marquage, sans
robot ni synchronisation entre onglets.



AO3 Helper - Later Shelf Coordinator
    Module ID: laterShelf
    Display Name: Later Shelf
    Tab: Library

    - Role: Pure coordinator — no logic of its own
    - Exposes: W.AO3H_LaterShelf = { loadItems, saveItems, markCurrent, SK_ITEMS, cfg }
      (also exported as ES module bindings, imported directly by the 3 submodules
      below instead of going through the window global)

    - Submodules:
      - quickMarkForLaterButton — 📌 button on blurbs (opt-out)
      - markedForLaterStatus    — badges, date added, sort/filter, batch delete
      - workReminder            — timed reminders + browser notifications (opt-in)

    - Storage:
      - ao3h:laterShelf:items           — array of { wid, title, addedAt }
      - ao3h:mod:laterShelf:settings    — { showQuickButton, remindersEnabled }
      - ao3h:laterShelf:reminders       — { [wid]: { title, remindAt, status } }
      - ao3h:laterShelf:reminders:lastCheck — timestamp of last reminder check




      AO3 Helper - Marked for Later Status Submodule
    Submodule ID: markedForLaterStatus
    Display Name: MFL Status & List Tools
    Source Module: Later Shelf

    - Feature: 📌 badge on listing blurbs
      - Behaviour: Shown on all work/bookmark blurbs whose work is in the shelf
      - Behaviour: Badge appended to h4.heading automatically on page load
      - Behaviour: MutationObserver re-injects badges for dynamic content

    - Feature: MFL page enhancements (only on /readings?show=to-read)
      - Behaviour: Total work counter injected into page header
      - Behaviour: "Date added" label shown below each blurb's stats block
      - Behaviour: Sort toolbar (date added / title / word count / last updated)
      - Behaviour: Filter toolbar (WIP-only / Complete-only / word count range / fandom)
      - Behaviour: Per-blurb multi-select checkboxes
      - Behaviour: "Select all / Deselect all" toggle button
      - Behaviour: Batch delete — removes selected works from AO3 list + shelf storage



      AO3 Helper - Quick Mark for Later Button Submodule
    Submodule ID: quickMarkForLaterButton
    Display Name: Quick Mark for Later Button
    Source Module: Later Shelf

    - Feature: 📌 button on listing blurbs
      - Option: showQuickButton (default: true) — can be disabled in settings
      - Behaviour: Injected into h4.heading of all work/bookmark blurbs
      - Behaviour: Active state (pinned) shown when work is already in shelf
      - Behaviour: Toggle adds/removes work from shelf storage on click
      - Behaviour: Immediately updates the sibling 📌 badge (markedForLaterStatus)
      - Behaviour: MutationObserver re-injects buttons for dynamic content




AO3 Helper - Work Reminders Submodule
    Submodule ID: workReminder
    Display Name: Work Reminders
    Source Module: Later Shelf

    - Feature: Per-work timed reminders
      - Option: remindersEnabled (default: false) — opt-in
      - Behaviour: "⏰ Remind me" button on MFL page blurbs
      - Behaviour: Date picker via prompt (YYYY-MM-DD format)
      - Behaviour: Reminder stored in localStorage (ao3h:laterShelf:reminders)
      - Behaviour: ⏰ badge injected on blurbs of works with active reminder
      - Behaviour: ⚠️ badge when reminder is set but work is unavailable

    - Feature: Browser notification dispatch
      - Behaviour: Requests Notification permission on first reminder set
      - Behaviour: Fires browser notification when reminder date is reached
      - Behaviour: Graceful fallback if notifications denied (badge only)

    - Feature: Background check
      - Behaviour: Checks due reminders on page load
      - Behaviour: Re-checks every 30 minutes via setInterval
      - Behaviour: Throttled to once per 6 hours (LAST_CHECK_KEY)


      
═══════════════════════════════════════════════════════════════════════════
  # laterShelf
  **Tab :** Library
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Later Shelf** améliore la liste **Marked for Later** d’AO3 afin de faciliter l’ajout, le repérage, l’organisation et le suivi des œuvres à lire plus tard.

* Il permet notamment de :
  - ajouter ou retirer rapidement une œuvre de la liste ;
  - afficher un badge sur les œuvres déjà sauvegardées ;
  - améliorer la page **Marked for Later** avec un compteur, des dates, des tris et des filtres ;
  - sélectionner plusieurs œuvres afin de les retirer en une seule action ;
  - programmer un rappel pour une œuvre ;
  - recevoir une notification du navigateur lorsqu’un rappel arrive à échéance.

---

# Réglages utilisateur

| Réglage            | Description                                                                     |
| ------------------ |---------------------------------------------------------------------------------|
| `showQuickButton`  | Affiche le bouton `📌 Save for later` sur les œuvres présentes dans les listes.|
| `remindersEnabled` | Active les rappels programmés et les notifications du navigateur.               |

Le panneau affiche également une section **Sync & Refresh** proposant des options liées :

* à la synchronisation ;
* au tri ;
* à l’actualisation.

Ces options ne sont pas encore reliées à une fonctionnalité active.

---

# Structure du module

Le module est composé d’un fichier coordinateur, d’un fichier de stockage partagé, de trois sous-modules fonctionnels et d’une feuille de style.

```text
_laterShelf.js
laterShelfStore.js
quickMarkForLaterButton.js
markedForLaterStatus.js
workReminder.js
laterShelf.css
```

---

# _laterShelf.js

## Rôle

Fichier coordinateur du module.

Il ne contient pas de logique fonctionnelle propre. Il initialise les trois sous-modules et expose les outils partagés nécessaires à leur fonctionnement.

---

## Responsabilités

* Initialise `quickMarkForLaterButton.js`.
* Initialise `markedForLaterStatus.js`.
* Initialise `workReminder.js`.
* Expose les fonctions de lecture et d’écriture de la liste.
* Expose la fonction permettant d’ajouter l’œuvre actuellement affichée.
* Centralise l’accès à la configuration et aux principales clés de stockage.

---

## Fonctions exposées

Le coordinateur expose les éléments suivants :

```text
loadItems
saveItems
markCurrent
SK_ITEMS
cfg
```

Ils sont disponibles via :

```text
W.AO3H_LaterShelf
```

Ces mêmes éléments sont également exportés comme liaisons de module ES et importés directement par les sous-modules.

---

## Détails techniques

Les principales clés de stockage sont :

```text
ao3h:laterShelf:items
ao3h:mod:laterShelf:settings
ao3h:laterShelf:reminders
ao3h:laterShelf:reminders:lastCheck
```

La clé :

```text
ao3h:laterShelf:items
```

contient la liste des œuvres sauvegardées :

```text
[
  {
    wid,
    title,
    addedAt
  }
]
```

La clé :

```text
ao3h:mod:laterShelf:settings
```

contient les réglages utilisateur :

```text
{
  showQuickButton,
  remindersEnabled
}
```

La clé :

```text
ao3h:laterShelf:reminders
```

contient les rappels actifs :

```text
{
  [wid]: {
    title,
    remindAt,
    status
  }
}
```

La clé :

```text
ao3h:laterShelf:reminders:lastCheck
```

contient la date de la dernière vérification des rappels.

---

# laterShelfStore.js

## Rôle

Centralise le stockage partagé de la liste **Later Shelf**.

Il fournit aux autres sous-modules un point d’accès commun pour lire, modifier et enregistrer les œuvres sauvegardées.

---

## Fonctionnalités

### Chargement de la liste

Lit les œuvres enregistrées sous :

```text
ao3h:laterShelf:items
```

---

### Enregistrement de la liste

Enregistre la liste mise à jour après :

* l’ajout d’une œuvre ;
* le retrait d’une œuvre ;
* une suppression groupée.

---

### Ajout de l’œuvre actuelle

Permet d’ajouter à la liste l’œuvre actuellement affichée.

Les données enregistrées comprennent notamment :

* l’identifiant de l’œuvre ;
* son titre ;
* la date de son ajout.

---

## Détails techniques

La structure d’une entrée correspond à :

```text
{
  wid,
  title,
  addedAt
}
```

La liste est stockée uniquement sur l’ordinateur de l’utilisateur.

---

## Dépendances

Ce fichier est utilisé par :

* `_laterShelf.js`
* `quickMarkForLaterButton.js`
* `markedForLaterStatus.js`
* `workReminder.js`

---

# quickMarkForLaterButton.js

## Rôle

Ajoute un bouton permettant de sauvegarder ou de retirer rapidement une œuvre de la liste **Later Shelf**.

---

## Fonctionnalités

### Bouton sur les listes

Lorsque `showQuickButton` est activé, le sous-module ajoute dans :

```text
h4.heading
```

un bouton intitulé :

```text
📌 Save for later
```

sur les blurbs d’œuvres et de favoris.

---

### État sauvegardé

Lorsque l’œuvre est déjà présente dans la liste, le bouton affiche un état actif :

```text
📌 Saved
```

---

### Ajout et retrait

Un clic sur le bouton :

* ajoute l’œuvre à la liste si elle n’y est pas encore ;
* retire l’œuvre si elle est déjà enregistrée.

---

### Mise à jour immédiate du badge

Après une modification, le sous-module actualise immédiatement le badge `📌` géré par `markedForLaterStatus.js`.

---

### Contenu dynamique

Un `MutationObserver` surveille les nouveaux blurbs ajoutés dynamiquement à la page et réinjecte les boutons lorsque nécessaire.

---

## Détails techniques

Le sous-module est enregistré sous l’identifiant :

```text
quickMarkForLaterButton
```

Son nom d’affichage est :

```text
Quick Mark for Later Button
```

Le réglage associé est :

```text
showQuickButton
```

Sa valeur par défaut est `true`.

---

## Dépendances

* `_laterShelf.js`
* `laterShelfStore.js`
* `markedForLaterStatus.js`
* le DOM des listes AO3

---

# markedForLaterStatus.js

## Rôle

Affiche le statut **Marked for Later** sur les œuvres et améliore la page officielle de la liste avec des outils de tri, de filtrage et de sélection multiple.

---

## Fonctionnalités

### Badge sur les œuvres

Ajoute un badge :

```text
📌
```

sur tous les blurbs d’œuvres ou de favoris présents dans la liste locale.

Le badge est ajouté automatiquement dans :

```text
h4.heading
```

---

### Contenu dynamique

Un `MutationObserver` surveille les nouveaux éléments ajoutés à la page et réinjecte les badges lorsque nécessaire.

---

### Portée de la page améliorée

Les outils de gestion avancée sont ajoutés uniquement sur :

```text
/readings?show=to-read
```

---

### Compteur total

Ajoute dans l’en-tête de la page le nombre total d’œuvres présentes dans la liste.

---

### Date d’ajout

Affiche sous le bloc de statistiques de chaque œuvre la date à laquelle elle a été ajoutée.

---

### Tri

Ajoute une barre permettant de trier la liste selon :

* la date d’ajout ;
* le titre ;
* le nombre de mots ;
* la dernière mise à jour.

---

### Filtrage

Ajoute des filtres permettant d’afficher :

* uniquement les œuvres en cours ;
* uniquement les œuvres terminées ;
* les œuvres correspondant à une plage de nombre de mots ;
* les œuvres appartenant à un fandom choisi.

---

### Sélection multiple

Ajoute une case à cocher sur chaque blurb.

Le sous-module fournit également un bouton permettant de :

* tout sélectionner ;
* tout désélectionner.

---

### Suppression groupée

Permet de retirer en une seule action toutes les œuvres sélectionnées.

La suppression retire les œuvres :

* de la liste AO3 ;
* du stockage local de **Later Shelf**.

---

## Détails techniques

Le sous-module est enregistré sous l’identifiant :

```text
markedForLaterStatus
```

Son nom d’affichage est :

```text
MFL Status & List Tools
```

---

## Dépendances

* `_laterShelf.js`
* `laterShelfStore.js`
* `quickMarkForLaterButton.js`
* la page officielle **Marked for Later**

---

# workReminder.js

## Rôle

Permet de programmer un rappel pour une œuvre présente dans la liste **Marked for Later**.

---

## Fonctionnalités

### Bouton de rappel

Lorsque `remindersEnabled` est activé, le sous-module ajoute sur les blurbs de la page MFL un bouton :

```text
⏰ Remind me
```

---

### Choix de la date

Un clic ouvre une demande de date utilisant le format :

```text
YYYY-MM-DD
```

---

### Enregistrement du rappel

Le rappel est enregistré sous :

```text
ao3h:laterShelf:reminders
```

Chaque entrée peut contenir :

```text
{
  title,
  remindAt,
  status
}
```

---

### Badge de rappel actif

Une œuvre possédant un rappel actif affiche un badge :

```text
⏰
```

---

### Œuvre indisponible

Si une œuvre associée à un rappel n’est plus disponible, le sous-module affiche un badge :

```text
⚠️
```

---

### Autorisation des notifications

Lors de la création du premier rappel, le module demande l’autorisation d’envoyer des notifications du navigateur.

---

### Notification à échéance

Lorsque la date prévue est atteinte, une notification du navigateur est envoyée.

---

### Refus des notifications

Si l’autorisation est refusée, le module continue de fonctionner avec un comportement de repli.

Le badge reste affiché, mais aucune notification système n’est envoyée.

---

### Vérification au chargement

Les rappels arrivés à échéance sont vérifiés à chaque chargement de page.

---

### Vérification périodique

Le module relance également la vérification toutes les 30 minutes à l’aide de :

```text
setInterval
```

---

### Limitation des vérifications

La vérification effective est limitée à une fois toutes les six heures grâce à :

```text
ao3h:laterShelf:reminders:lastCheck
```

Cette limitation évite d’exécuter trop fréquemment le traitement complet.

---

## Détails techniques

Le sous-module est enregistré sous l’identifiant :

```text
workReminder
```

Son nom d’affichage est :

```text
Work Reminders
```

Le réglage associé est :

```text
remindersEnabled
```

Sa valeur par défaut est `false`.

---

## Dépendances

* `_laterShelf.js`
* `laterShelfStore.js`
* l’API `Notification` du navigateur
* `localStorage`

---

# laterShelf.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Later Shelf**.

Il définit notamment l’apparence :

* des boutons `📌 Save for later` et `📌 Saved` ;
* des badges `📌` ;
* du compteur total ;
* des dates d’ajout ;
* des barres de tri et de filtrage ;
* des cases de sélection multiple ;
* des contrôles de suppression groupée ;
* des boutons `⏰ Remind me` ;
* des badges de rappel ;
* des avertissements pour les œuvres indisponibles.

---

# Fonctionnalités non implémentées

## Niveaux de priorité

Ajouter trois niveaux de priorité aux œuvres :

* haute ;
* moyenne ;
* basse.

Cette idée est mentionnée plusieurs fois dans les anciennes spécifications, mais n’est pas implémentée.

---

## Raison de la sauvegarde

Permettre d’écrire une note expliquant pourquoi une œuvre a été ajoutée à la liste.

---

## Statistiques de conversion

Calculer combien d’œuvres sauvegardées sont réellement lues par la suite.

---

## Réorganisation manuelle

Permettre de réordonner les œuvres par glisser-déposer.

---

## Sélection aléatoire

Ajouter un bouton permettant de choisir une œuvre au hasard dans la liste.

---

## Groupes personnalisés

Créer des groupes comme :

* lecture du week-end ;
* fics courtes ;
* gros projets.

---

## Annulation rapide

Afficher une action **Annuler** après l’ajout ou le retrait d’une œuvre.

---

## Ajout groupé depuis les résultats

Permettre de sélectionner plusieurs œuvres sur une page de résultats et de les ajouter à la liste en une seule action.

---

## Retrait automatique après lecture

Retirer automatiquement une œuvre de la liste lorsqu’elle est terminée.

---

## Temps de lecture total

Afficher une estimation du temps nécessaire pour lire l’ensemble de la liste.

---

## Célébrations

Afficher un message lorsqu’un certain nombre d’œuvres est atteint, par exemple :

```text
10 fics sauvegardées
```

---

## Rappels intelligents

Programmer les rappels en fonction des habitudes de lecture de l’utilisateur.

---

## Rappel pour une œuvre abandonnée

Créer un type de rappel spécifique aux œuvres abandonnées.

---

## Report d’un rappel

Permettre de repousser un rappel à une date ultérieure après son déclenchement.

---

## Position du bouton rapide

Permettre de choisir où le bouton de sauvegarde est affiché dans les blurbs.

---

## Note rapide depuis le bouton

Ajouter une note au moment de sauvegarder une œuvre à partir du bouton rapide.

---

## Plusieurs listes

Permettre de choisir parmi plusieurs listes personnelles plutôt que d’utiliser une seule liste **Marked for Later**.

---

## Tri intelligent

Trier automatiquement la liste selon plusieurs critères ou habitudes de lecture.

---

## Compteur dans le menu

Afficher en permanence dans le menu AO3 un badge indiquant le nombre total d’œuvres sauvegardées.

Un clic pourrait ouvrir un aperçu sans quitter la page actuelle.

---

## Objectif hebdomadaire

Ajouter un objectif de lecture, par exemple :

```text
5 fics par semaine
```

Le module pourrait afficher :

* une barre de progression ;
* un message d’encouragement.

---

## Archive des retraits

Conserver un historique consultable des œuvres retirées de la liste.

---

## Rappels par courriel

Envoyer les rappels par courriel en complément des notifications du navigateur.

---

## Rappels de reprise

Créer un rappel pour une œuvre en cours de lecture même si elle ne se trouve pas dans **Marked for Later**.

---

## Ajout d’une série complète

Ajouter toutes les œuvres d’une série à la liste en une seule action.

---

## Raccourci clavier

Ajouter un raccourci permettant de sauvegarder rapidement l’œuvre actuellement ouverte.

---

## Vue en grille

Proposer une présentation en cartes avec un aperçu visuel de chaque œuvre.

---

## Rappels récurrents

Créer des rappels qui se répètent :

* chaque jour ;
* chaque semaine ;
* selon une fréquence personnalisée.

Le système actuel gère uniquement les rappels ponctuels.

---

## Suivi des mises à jour

Prévenir l’utilisateur lorsqu’une œuvre de la liste :

* reçoit un nouveau chapitre ;
* est terminée par son auteur.

---

## Rappel des œuvres anciennes

Signaler les œuvres présentes depuis longtemps dans la liste sans avoir été lues.

---

## Message personnalisé

Permettre d’écrire son propre texte pour une notification de rappel.

---

## Alerte de série de lecture

Afficher un rappel afin d’éviter d’interrompre une série de jours consécutifs de lecture.

---

## Intégration aux pépites cachées

Faire remonter automatiquement en haut de la liste les œuvres repérées comme pépites cachées par un autre module.

---

## Export de la liste

Exporter la liste dans un fichier, par exemple :

* CSV ;
* liste simple de liens.

---

## Historique des rappels

Conserver une liste des rappels :

* envoyés ;
* annulés ;
* expirés.

Le système actuel conserve principalement les rappels actifs.

---

## Favori et lecture ultérieure combinés

Permettre de mettre une œuvre en favori et de l’ajouter à **Marked for Later** en une seule action.

---

## Suggestion selon le temps disponible

Utiliser la longueur des œuvres pour suggérer une lecture adaptée au temps disponible.

Par exemple, proposer une œuvre courte lorsque l’utilisateur dispose de peu de temps.

---

# Décisions de conception

## Date limite de lecture

Le module ne propose pas de véritable date limite comparable à une échéance obligatoire.

Cette approche a été jugée trop rigide.

---

## Partage de la liste

La liste **Marked for Later** ne peut pas être partagée avec d’autres personnes.

Cette décision vise à préserver son caractère privé.

---

## Liste de session distincte

Le module ne crée pas de liste temporaire spéciale pour une seule session de lecture.

La liste **Marked for Later** est considérée comme suffisante pour cet usage.

---

## Coloration selon l’ancienneté

Les œuvres ne sont pas colorées selon le temps passé dans la liste.

Cette présentation a été jugée trop culpabilisante.

---

# Précision historique

Une ancienne documentation décrivait :

* un robot parcourant en arrière-plan les pages de la liste MFL ;
* une synchronisation automatique entre les onglets.

Aucune de ces fonctionnalités n’existe dans le code actuel.

La liste est stockée localement sur l’ordinateur et mise à jour directement par les boutons de marquage.

Les badges et boutons sont réinjectés dans le contenu dynamique grâce à des `MutationObserver`, mais aucun robot ne parcourt les pages AO3 et aucune synchronisation entre onglets n’est effectuée.
