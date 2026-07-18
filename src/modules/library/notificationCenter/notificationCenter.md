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
| `trackBookmarks` | activé | Surveille les fics en favoris |
| `trackMFL` | activé | Surveille les fics de la liste "à lire plus tard" |
| `trackHistory` | activé | Surveille les fics de l'historique de lecture |
| `trackSubscriptions` | désactivé | Surveille aussi les œuvres auxquelles tu es abonné·e sur AO3 (vérifiées au plus toutes les 6h) |
| `digestMode` | `off` | `off` (une entrée par mise à jour), `daily` ou `weekly` (un résumé par jour/semaine) |
| `showHomepageWidget` | activé | Affiche un petit encart "What's New" sur la page d'accueil AO3 |

## Fichiers

### `notificationCenter.js` — tout le module en un seul fichier

- Suit les mises à jour de chapitres pour les fics en favoris, dans la liste "à lire plus tard", dans l'historique de lecture, et en option dans les abonnements AO3
- Montre combien de nouveaux chapitres sont parus ("+2 chapters"), avec une petite célébration "🎉 Finished!" quand une fic devient complète, et un badge "⚡ Big update" pour les gros sauts de chapitres
- Garde un historique glissant de 90 jours, avec possibilité de marquer une notification comme lue, de la reporter 24h ("Snooze"), ou de l'archiver définitivement
- Permet de trier et filtrer le flux (par date, titre ou priorité ; par origine : favoris / à lire plus tard / historique / abonnements), de cacher les fics terminées, et de regrouper l'affichage par période (aujourd'hui / hier / cette semaine / plus ancien) ou sous forme de résumé quotidien/hebdomadaire
- Ajoute une icône 🔔 avec un compteur dans le menu du site ; elle passe en rouge s'il y a du nouveau ; un clic ouvre ou ferme le flux
- Affiche aussi un petit encart "What's New" sur la page d'accueil AO3, avec les 3 dernières mises à jour non vues
- Vérifie automatiquement en arrière-plan, toutes les 15 minutes, si de nouveaux chapitres sont parus sur les fics suivies (et la liste d'abonnements AO3, au plus toutes les 6h si activée)
- Peut envoyer une vraie notification du navigateur, avec un son en option et des "heures calmes" sans aucune notification
- Détecte aussi directement un nouveau chapitre quand on visite la page d'une fic suivie

### `notificationCenterHelpers.js` — logique extraite

- `groupByBucket(items)` / `bucketLabel(ts)` : regroupement du flux par période (aujourd'hui/hier/cette semaine/plus ancien)
- `computePriority({completedNow, delta})` : priorité d'une mise à jour (`high` si l'œuvre vient de se terminer ou si le saut de chapitres est important)
- `isSnoozed(item)` / `snoozeUntil(hours)` : gestion du report d'une notification
- `buildDigest(items, mode)` / `periodKey(ts, mode)` : résumé quotidien/hebdomadaire du flux
- `parseSubscribedWorkIds(html)` : extrait les IDs de work depuis une page d'abonnements AO3

### `notificationCenter.css`

- Les styles visuels de la cloche, du panneau du flux, du widget page d'accueil et de la liste des notifications

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, avec leur statut :

- ~~Regrouper intelligemment plusieurs notifications ensemble~~ ✅ Fait
  Le flux est regroupé par période (Aujourd'hui / Hier / Cette semaine /
  Plus ancien) plutôt que par simple statut terminé/en cours.
- ~~Un résumé quotidien ou hebdomadaire des mises à jour, plutôt que chaque mise à jour affichée séparément~~ ✅ Fait
  Réglage `digestMode` (`daily`/`weekly`) : une ligne de résumé par jour ou
  semaine ("3 updates across 2 works • 🎉 1 finished") à la place du détail
  par œuvre.
- ~~Des niveaux de priorité pour les notifications~~ ✅ Fait
  Chaque mise à jour reçoit une priorité `high`/`normal` (terminaison ou gros
  saut de chapitres ≥ 3 = `high`), avec un badge "⚡ Big update" et un tri
  "Priority" dans le flux.
- ~~Pouvoir reporter une notification à plus tard~~ ✅ Fait
  Bouton "Snooze" (24h) sur chaque item ; l'entrée réapparaît automatiquement
  passé ce délai, sans job d'arrière-plan dédié (calculé à l'affichage).
- ~~Un widget de notifications directement sur la page d'accueil, en plus de la cloche dans le menu~~ ✅ Fait
  Réglage `showHomepageWidget` : encart "What's New" avec les 3 dernières
  mises à jour non vues, sur `/` et `/home`.
- ~~Choisir de recevoir des notifications seulement pour certains types d'événements (par exemple juste les favoris, pas la liste "à lire plus tard")~~ ✅ Fait
  Réglages `trackBookmarks` / `trackMFL` / `trackHistory` / `trackSubscriptions`
  (case par source, activées par défaut sauf les abonnements).
- ~~Être notifié quand quelqu'un répond à un commentaire qu'on a laissé, ou reçoit un message dans sa boîte de réception AO3~~ ❌ Écarté
  AO3 fournit déjà nativement une boîte de réception et des emails pour ça ;
  dupliquer ce suivi demanderait de scraper en continu une page
  supplémentaire pour un service déjà reçu nativement.
- ~~Suivre aussi les abonnements AO3 (auteurs ou séries suivis), pas seulement les favoris, la liste "à lire plus tard" et l'historique~~ ✅ Fait
  Réglage `trackSubscriptions` : récupère `/users/<toi>/subscriptions?type=Work`
  au plus toutes les 6h (une page de listing complète, donc vérifiée moins
  souvent que les autres sources) et ajoute les works trouvés au suivi.
- ~~Être notifié quand une fic qu'on a soi-même écrite reçoit un kudos ou un bookmark~~ ❌ Écarté
  AO3 envoie déjà un email natif à chaque kudos/bookmark reçu. Ce module
  suit les mises à jour des fics qu'on **lit**, pas l'activité sur celles
  qu'on écrit soi-même — changement de périmètre trop large pour un gain
  marginal par rapport à la notification native déjà existante.
- ~~Pouvoir archiver une notification en un clic, pas seulement la marquer comme lue~~ ✅ Fait
  Bouton "Archive" sur chaque item : supprime définitivement l'entrée du
  flux (au lieu de simplement la marquer vue).
- ~~Choisir parmi des modèles tout prêts pour changer le texte ou l'apparence des notifications~~ ❌ Écarté
  Même raisonnement que les personnalisations de bouton/icône écartées
  ailleurs dans le projet (ficActions, ficPeek) : gain cosmétique
  disproportionné par rapport à la configuration nécessaire.

## Nettoyage connexe

La section "Sync & Refresh" du panneau (`enableSync`, `sortBy`, `autoRefresh`)
n'était jamais branchée à un vrai comportement — elle a été retirée plutôt
que simulée, remplacée par les réglages réels ci-dessus (`trackBookmarks`
et consorts pour le filtrage par source, le tri du flux existe déjà bel et
bien via le sélecteur "Sort by" du panneau flottant, et l'actualisation
automatique toutes les 15 minutes était déjà un vrai comportement, pas un
placeholder).

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
      - Option: Tracks chapter updates for bookmarked, MFL, history, and (optionally) subscribed works
      - Option: Delta display ("+ 2 chapters")
      - Option: "Finished!" celebration (special badge + confetti)
      - Option: "⚡ Big update" priority badge for large chapter jumps
      - Option: 90-day rolling history (older entries auto-purged)
      - Option: Mark item as seen / Mark all seen / Snooze 24h / Archive
      - Option: Sort by date, title, or priority
      - Option: Filter by source (bookmarks / MFL / history / subscriptions)
      - Option: Hide completed works from feed
      - Option: Grouped by recency (Today/Yesterday/This week/Older), or collapsed into a daily/weekly digest

    - Feature: Navbar badge
      - Option: Bell icon with unread count in header
      - Option: Active state (red) when there are unseen updates
      - Option: Click opens the What's New feed panel

    - Feature: Homepage widget
      - Option: Compact "What's New" box on the AO3 homepage, up to 3 unseen updates

    - Feature: Auto-refresh
      - Option: Background check every 15 minutes
      - Option: Checks up to 5 unvisited WIP works per cycle
      - Option: Immediate check on page load if last refresh > 15 min ago
      - Option: AO3 subscriptions list re-fetched at most every 6h (when trackSubscriptions is on)

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

    Dépendance réseau supplémentaire (quand trackSubscriptions est actif) :
        GET /users/<username>/subscriptions?type=Work -- page AO3 native, parsée
        via lib/ao3/parsers.js (findAllBlurbs/extractWorkIdFromBlurb) ; username
        obtenu via lib/utils/user-detector.js (detectUser).




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
| `trackBookmarks`       | Surveille les œuvres en favoris.                                                                                                         |
| `trackMFL`             | Surveille les œuvres de la liste **Marked for Later**.                                                                                   |
| `trackHistory`         | Surveille les œuvres de l’historique de lecture.                                                                                         |
| `trackSubscriptions`   | Surveille aussi les œuvres auxquelles l’utilisateur est abonné sur AO3 (vérifiées au plus toutes les 6 heures).                          |
| `digestMode`           | `off` (une entrée par mise à jour), `daily` ou `weekly` (un résumé regroupé par jour ou semaine).                                        |
| `showHomepageWidget`   | Affiche un encart **What’s New** sur la page d’accueil AO3, en plus de la cloche du menu.                                                |

La section **Sync & Refresh** précédemment affichée (options `enableSync`,
`sortBy`, `autoRefresh` jamais reliées à une fonctionnalité active) a été
retirée du panneau et remplacée par les réglages réels ci-dessus.

---

# Structure du module

Le module est composé d’un fichier fonctionnel principal, d’un fichier de logique extraite et d’une feuille de style.

```text
notificationCenter.js
notificationCenterHelpers.js
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

## Regroupement intelligent ✅ Fait

Regrouper plusieurs notifications liées entre elles afin de réduire le nombre d’entrées affichées séparément.

> Le flux est désormais regroupé par période (Aujourd’hui / Hier / Cette
> semaine / Plus ancien) via `groupByBucket()`.

---

## Résumé périodique ✅ Fait

Créer un résumé quotidien ou hebdomadaire, plutôt que d’afficher chaque événement séparément.

> Réglage `digestMode` (`daily`/`weekly`), calculé par `buildDigest()` :
> une ligne par jour/semaine ("N updates across M works").

---

## Niveaux de priorité ✅ Fait

Permettre d’attribuer différents niveaux de priorité aux notifications.

> `computePriority()` : `high` pour une complétion ou un saut de ≥ 3
> chapitres, `normal` sinon. Badge "⚡ Big update" et tri "Priority" dans le
> flux.

---

## Report d’une notification ✅ Fait

Permettre de reporter une notification afin qu’elle réapparaisse plus tard.

> Bouton "Snooze" (24h, `snoozeUntil()`/`isSnoozed()`) — l’entrée redevient
> visible automatiquement à l’expiration, sans job d’arrière-plan dédié.

---

## Widget sur la page d’accueil ✅ Fait

Ajouter un bloc de notifications directement sur la page d’accueil, en complément de la cloche du menu.

> Réglage `showHomepageWidget` : encart avec les 3 dernières mises à jour
> non vues, sur `/` et `/home`.

---

## Filtrage des événements surveillés ✅ Fait

Permettre de choisir les sources qui peuvent produire des notifications.

> Réglages `trackBookmarks` / `trackMFL` / `trackHistory` /
> `trackSubscriptions`, un par source.

---

## Réponses aux commentaires et boîte de réception ❌ Écarté

Notifier l’utilisateur lorsqu’il reçoit une réponse à un commentaire ou un message dans sa boîte de réception AO3.

> Écarté : AO3 fournit déjà nativement une boîte de réception et des emails
> pour ça — dupliquer ce suivi demanderait de scraper en continu une page
> supplémentaire pour un service déjà reçu nativement.

---

## Suivi des abonnements AO3 ✅ Fait

Surveiller également les abonnements AO3 (œuvres suivies), en plus des favoris, de Marked for Later et de l’historique.

> Réglage `trackSubscriptions` : récupère `/users/<toi>/subscriptions?type=Work`
> au plus toutes les 6h (page de listing complète, donc vérifiée moins
> souvent que les autres sources) via `parseSubscribedWorkIds()`.

---

## Activité sur ses propres œuvres ❌ Écarté

Notifier l’utilisateur lorsqu’une œuvre qu’il a publiée reçoit un kudos ou un favori.

> Écarté : AO3 envoie déjà un email natif pour ça. Ce module suit les mises
> à jour des fics qu’on **lit**, pas l’activité sur celles qu’on écrit
> soi-même — changement de périmètre trop large pour un gain marginal.

---

## Archivage ✅ Fait

Ajouter une action permettant d’archiver une notification en un clic.

> Bouton "Archive" : supprime définitivement l’entrée du flux, au lieu de
> simplement la marquer vue.

---

## Modèles de notification ❌ Écarté

Proposer plusieurs modèles permettant de modifier le texte, l’apparence et la présentation des notifications.

> Écarté : même raisonnement que les personnalisations de bouton/icône
> écartées ailleurs dans le projet (ficActions, ficPeek) — gain cosmétique
> disproportionné par rapport à la configuration nécessaire.

---

# Décisions de conception

## Périmètre : ce qu'on lit, pas ce qu'on écrit

Le module notifie sur les mises à jour des œuvres qu'on suit en tant que
lecteur (favoris, Marked for Later, historique, abonnements) — pas sur
l'activité que reçoivent les œuvres qu'on a soi-même publiées (kudos,
favoris). AO3 couvre déjà ce second cas par email natif.

## Pas de doublon de la boîte de réception AO3

Les réponses aux commentaires et les messages de la boîte de réception AO3
restent gérés nativement par AO3 (page + emails) plutôt que scrapés en
continu par ce module.

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
