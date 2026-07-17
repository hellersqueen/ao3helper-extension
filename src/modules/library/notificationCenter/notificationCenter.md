# notificationCenter

**Tab:** Library

## À quoi ça sert

Ce module surveille les fics suivies (favoris, liste "à lire plus tard",
historique de lecture) pour repérer les nouveaux chapitres publiés. Il les
regroupe dans un flux "What's New", avec une petite cloche dans le menu du
site et des notifications du navigateur en option.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `desktopNotifications` | désactivé | Active les notifications du navigateur (demande une permission) |
| `soundEffects` | désactivé | Joue un son quand une notification arrive (seulement si les notifications du navigateur sont activées) |
| `quietHoursEnabled` | désactivé | Active une plage horaire sans notifications |
| `quietHoursStart` | `22:00` | Heure de début des heures calmes |
| `quietHoursEnd` | `08:00` | Heure de fin des heures calmes |

Le panneau affiche aussi une section "Sync & Refresh" (synchroniser, trier,
actualiser) *(pas encore actif — rien n'est branché derrière)*.

## Fichiers

### `notificationCenter.js` — tout le module en un seul fichier

- Suit les mises à jour de chapitres pour les fics en favoris, dans la liste "à lire plus tard" ou dans l'historique de lecture
- Montre combien de nouveaux chapitres sont parus ("+2 chapters"), avec une petite célébration "🎉 Finished!" quand une fic devient complète
- Garde un historique glissant de 90 jours, avec possibilité de marquer une notification (ou tout) comme lue
- Permet de trier et filtrer le flux (par date, par titre, par origine : favoris / à lire plus tard / historique), et de cacher les fics terminées
- Ajoute une icône 🔔 avec un compteur dans le menu du site ; elle passe en rouge s'il y a du nouveau ; un clic ouvre ou ferme le flux
- Vérifie automatiquement en arrière-plan, toutes les 15 minutes, si de nouveaux chapitres sont parus sur les fics suivies
- Peut envoyer une vraie notification du navigateur, avec un son en option et des "heures calmes" sans aucune notification
- Détecte aussi directement un nouveau chapitre quand on visite la page d'une fic suivie

### `notificationCenter.css`

- Les styles visuels de la cloche, du panneau du flux et de la liste des notifications

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Regrouper intelligemment plusieurs notifications ensemble
- Un résumé quotidien ou hebdomadaire des mises à jour, plutôt que chaque mise à jour affichée séparément
- Des niveaux de priorité pour les notifications
- Pouvoir reporter une notification à plus tard
- Un widget de notifications directement sur la page d'accueil, en plus de la cloche dans le menu
- Choisir de recevoir des notifications seulement pour certains types d'événements (par exemple juste les favoris, pas la liste "à lire plus tard")
- Être notifié quand quelqu'un répond à un commentaire qu'on a laissé, ou reçoit un message dans sa boîte de réception AO3
- Suivre aussi les abonnements AO3 (auteurs ou séries suivis), pas seulement les favoris, la liste "à lire plus tard" et l'historique
- Être notifié quand une fic qu'on a soi-même écrite reçoit un kudos ou un bookmark
- Pouvoir archiver une notification en un clic, pas seulement la marquer comme lue
- Choisir parmi des modèles tout prêts pour changer le texte ou l'apparence des notifications

## Précision

⚠️ La doc historique anglaise dit que le son et la petite célébration sont
"inutiles"/"rejetés" (jugés trop intrusifs), et que le lien avec les
favoris, la liste "à lire plus tard" et l'historique ne sert à rien. En
réalité, les trois sont bel et bien codés : un son est joué, la
célébration s'affiche, et les trois listes servent vraiment à construire
le flux "What's New".



AO3 Helper - Notification Center
    Module ID: notificationCenter

    - Feature: What's New feed
      - Option: Tracks chapter updates for bookmarked, MFL, and history works
      - Option: Delta display ("+ 2 chapters")
      - Option: "Finished!" celebration (special badge + confetti)
      - Option: 90-day rolling history (older entries auto-purged)
      - Option: Mark item as seen / Mark all seen
      - Option: Sort by date or title
      - Option: Filter by source (bookmarks / MFL / history)
      - Option: Hide completed works from feed

    - Feature: Navbar badge
      - Option: Bell icon with unread count in header
      - Option: Active state (red) when there are unseen updates
      - Option: Click opens the What's New feed panel

    - Feature: Auto-refresh
      - Option: Background check every 15 minutes
      - Option: Checks up to 5 unvisited WIP works per cycle
      - Option: Immediate check on page load if last refresh > 15 min ago

    - Feature: Desktop notifications
      - Option: Browser Notification API (requires permission)
      - Option: Sound effect via AudioContext on notification fire
      - Option: Quiet hours (start/end time — no notifications in window)

    - Feature: Work page integration
      - Option: Detects new chapters when visiting a tracked work page directly

    Dépendances croisées en lecture seule (par clé localStorage directe, pas d'import —
    contrat volontairement découplé, indépendant de l'état de migration des modules) :
        ao3h:bookmarkVault:data  -- bookmarkVault (Library, migré Phase 23)
        ao3h:laterShelf:items    -- laterShelf (Library, migré Phase 23)
        ao3h:rt:history          -- readingTracker (Reading, migré Phase 20)




═══════════════════════════════════════════════════════════════════════════        
  # notificationCenter
  **Tab :** Library
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Notification Center** surveille les œuvres suivies afin de repérer la publication de nouveaux chapitres.

* Les œuvres surveillées peuvent provenir :
  - des favoris ;
  - de la liste **Marked for Later** ;
  - de l’historique de lecture.

Les mises à jour détectées sont regroupées dans un flux intitulé **What’s New**.

* Le module permet notamment de :
  - détecter les nouveaux chapitres publiés ;
  - indiquer le nombre de chapitres ajoutés ;
  - signaler lorsqu’une œuvre devient terminée ;
  - conserver un historique des mises à jour pendant 90 jours ;
  - marquer une notification comme lue ;
  - marquer toutes les notifications comme lues ;
  - trier et filtrer le flux ;
  - afficher une cloche avec un compteur dans le menu AO3 ;
  - vérifier automatiquement les œuvres suivies ;
  - envoyer des notifications du navigateur ;
  - désactiver les notifications pendant une plage horaire choisie.

---

# Réglages utilisateur

| Réglage                | Description                                                                                                                              |
| ---------------------- |------------------------------------------------------------------------------------------------------------------------------------------|
| `desktopNotifications` | Active les notifications du navigateur. Une autorisation du navigateur est nécessaire.                                                   |
| `soundEffects`         | Joue un son lorsqu’une notification est envoyée. Ce réglage fonctionne uniquement lorsque les notifications du navigateur sont activées. |
| `quietHoursEnabled`    | Active une plage horaire pendant laquelle aucune notification du navigateur n’est envoyée.                                               |
| `quietHoursStart`      | Définit l’heure de début des heures calmes.                                                                                              |
| `quietHoursEnd`        | Définit l’heure de fin des heures calmes.                                                                                                |

Le panneau affiche également une section **Sync & Refresh** proposant des options liées :

* à la synchronisation ;
* au tri ;
* à l’actualisation.

Ces options ne sont pas encore reliées à une fonctionnalité active.

---

# Structure du module

Le module est composé d’un fichier fonctionnel unique et d’une feuille de style.

```text
notificationCenter.js
notificationCenter.css
```

---

# notificationCenter.js

## Rôle

Gère l’ensemble du système de détection et d’affichage des mises à jour des œuvres suivies.

Il construit le flux **What’s New**, actualise la cloche du menu, vérifie périodiquement les œuvres et peut envoyer des notifications du navigateur.

---

## Fonctionnalités

### Sources surveillées

Le module suit les œuvres provenant de trois sources :

* les favoris ;
* la liste **Marked for Later** ;
* l’historique de lecture.

Ces trois listes servent à construire le flux **What’s New**.

---

### Détection des nouveaux chapitres

Le module compare les informations connues d’une œuvre avec son état actuel afin de détecter l’ajout de chapitres.

Lorsqu’une mise à jour est trouvée, il affiche le nombre de nouveaux chapitres sous une forme similaire à :

```text
+2 chapters
```

---

### Détection de complétion

Lorsque l’ajout d’un chapitre correspond également à la fin de l’œuvre, le module affiche une célébration spéciale :

```text
🎉 Finished!
```

Cette célébration peut comprendre :

* un badge particulier ;
* une animation de confettis.

---

### Flux « What’s New »

Les mises à jour sont regroupées dans un panneau intitulé :

```text
What’s New
```

Chaque entrée représente une mise à jour détectée pour une œuvre suivie.

---

### Historique glissant

Le module conserve les notifications pendant 90 jours.

Les entrées plus anciennes sont automatiquement supprimées.

---

### État de lecture

Chaque notification peut être marquée comme vue individuellement.

Le module permet également de marquer toutes les notifications comme vues en une seule action.

---

### Tri

Le flux peut être trié selon :

* la date ;
* le titre de l’œuvre.

---

### Filtrage par origine

Les notifications peuvent être filtrées selon leur source :

* favoris ;
* Marked for Later ;
* historique de lecture.

---

### Masquage des œuvres terminées

Le module permet de masquer dans le flux les œuvres déjà terminées.

---

### Cloche dans le menu

Ajoute une icône :

```text
🔔
```

dans l’en-tête d’AO3.

La cloche affiche un compteur correspondant au nombre de notifications non vues.

---

### État actif de la cloche

Lorsque de nouvelles mises à jour non vues sont disponibles, la cloche passe dans un état actif rouge.

---

### Ouverture du flux

Un clic sur la cloche ouvre ou ferme le panneau **What’s New**.

---

### Vérification automatique

Le module vérifie automatiquement les œuvres suivies toutes les 15 minutes.

Lors de chaque cycle, il peut vérifier jusqu’à cinq œuvres en cours qui n’ont pas été visitées récemment.

---

### Vérification au chargement

Au chargement d’une page, le module lance immédiatement une vérification lorsque la dernière actualisation remonte à plus de 15 minutes.

---

### Intégration aux pages d’œuvres

Lorsqu’une œuvre suivie est visitée directement, le module analyse sa page afin de détecter immédiatement un nouveau chapitre.

Cette détection ne dépend pas uniquement du cycle de vérification périodique.

---

### Notifications du navigateur

Lorsque `desktopNotifications` est activé et que l’autorisation a été accordée, le module utilise l’API `Notification` du navigateur.

Une notification peut être envoyée lorsqu’une nouvelle mise à jour est détectée.

---

### Effet sonore

Lorsque `soundEffects` est activé, un son est joué au moment de l’envoi d’une notification.

Le son est produit à l’aide de `AudioContext`.

Cette fonctionnalité nécessite également que `desktopNotifications` soit activé.

---

### Heures calmes

Lorsque `quietHoursEnabled` est activé, aucune notification du navigateur n’est envoyée entre :

```text
quietHoursStart
```

et :

```text
quietHoursEnd
```

Par défaut, cette période s’étend de :

```text
22:00
```

à :

```text
08:00
```

Les mises à jour peuvent toujours être enregistrées dans le flux pendant cette période, mais aucune notification système n’est envoyée.

---

## Détails techniques

### Fréquence de vérification

La vérification automatique utilise un intervalle de 15 minutes.

À chaque cycle, le module limite le travail à un maximum de cinq œuvres en cours non récemment visitées.

---

### Nettoyage de l’historique

Les notifications datant de plus de 90 jours sont automatiquement supprimées.

---

### Dépendances croisées

Le module lit directement plusieurs clés de `localStorage` :

```text
ao3h:bookmarkVault:data
ao3h:laterShelf:items
ao3h:rt:history
```

La clé :

```text
ao3h:bookmarkVault:data
```

provient du module **Bookmark Vault**.

La clé :

```text
ao3h:laterShelf:items
```

provient du module **Later Shelf**.

La clé :

```text
ao3h:rt:history
```

provient du module de suivi de lecture.

---

### Découplage des dépendances

Ces données sont lues directement depuis leurs clés de stockage.

Le module n’importe pas les autres modules et ne dépend pas de leur état d’activation ou de migration.

Ce contrat en lecture seule permet de conserver un fonctionnement découplé.

---

## Dépendances

Le module utilise principalement :

* `localStorage` ;
* l’API `Notification` du navigateur ;
* `AudioContext` ;
* le DOM des pages AO3 ;
* les données enregistrées par **Bookmark Vault** ;
* les données enregistrées par **Later Shelf** ;
* l’historique du module de suivi de lecture.

---

# notificationCenter.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Notification Center**.

Il définit notamment l’apparence :

* de la cloche du menu ;
* du compteur de notifications ;
* de l’état actif rouge ;
* du panneau **What’s New** ;
* de la liste des notifications ;
* des notifications vues et non vues ;
* des filtres et contrôles de tri ;
* du badge de nouveaux chapitres ;
* de la célébration **Finished!** ;
* des confettis.

---

# Fonctionnalités non implémentées

## Regroupement intelligent

Regrouper plusieurs notifications liées entre elles afin de réduire le nombre d’entrées affichées séparément.

---

## Résumé périodique

Créer un résumé :

* quotidien ;
* hebdomadaire.

Ce résumé regrouperait les mises à jour plutôt que d’afficher chaque événement séparément.

---

## Niveaux de priorité

Permettre d’attribuer différents niveaux de priorité aux notifications.

---

## Report d’une notification

Permettre de reporter une notification afin qu’elle réapparaisse plus tard.

---

## Widget sur la page d’accueil

Ajouter un bloc de notifications directement sur la page d’accueil, en complément de la cloche du menu.

---

## Filtrage des événements surveillés

Permettre de choisir les sources qui peuvent produire des notifications.

Par exemple :

* recevoir uniquement les mises à jour des favoris ;
* ignorer les œuvres de **Marked for Later** ;
* ignorer les œuvres provenant de l’historique.

---

## Réponses aux commentaires et boîte de réception

Notifier l’utilisateur lorsqu’il :

* reçoit une réponse à un commentaire ;
* reçoit un nouveau message dans sa boîte de réception AO3.

---

## Suivi des abonnements AO3

Surveiller également les abonnements AO3, notamment :

* les auteurs ;
* les séries ;
* les œuvres suivies.

Le système actuel utilise uniquement :

* les favoris ;
* Marked for Later ;
* l’historique de lecture.

---

## Activité sur ses propres œuvres

Notifier l’utilisateur lorsqu’une œuvre qu’il a publiée reçoit :

* un kudos ;
* un favori.

---

## Archivage

Ajouter une action permettant d’archiver une notification en un clic.

Le système actuel permet uniquement de la marquer comme vue.

---

## Modèles de notification

Proposer plusieurs modèles permettant de modifier :

* le texte des notifications ;
* leur apparence ;
* leur présentation.

---

# Décisions de conception

Aucune fonctionnalité n’est explicitement indiquée comme définitivement écartée dans la documentation actuelle.

---

# Précision historique

Une ancienne documentation indiquait que :

* les effets sonores avaient été rejetés comme trop intrusifs ;
* la célébration de fin d’œuvre avait été jugée inutile ;
* les liens avec les favoris, la liste **Marked for Later** et l’historique n’étaient pas réellement utilisés.

Ces informations sont désormais obsolètes.

Le code actuel comprend bien :

* un effet sonore optionnel lors de l’envoi d’une notification ;
* une célébration **Finished!** avec un badge spécial et des confettis ;
* une lecture réelle des données provenant des favoris, de **Marked for Later** et de l’historique afin de construire le flux **What’s New**.
