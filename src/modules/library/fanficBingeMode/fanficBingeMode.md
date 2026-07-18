# fanficBingeMode

**Tab:** Library

## À quoi ça sert

Ce module accompagne les sessions de lecture intensive ("binge") en
proposant un enchaînement fluide entre les fics : une fenêtre pour
continuer à lire, des suggestions de fics suivantes, et une file d'attente
personnelle de fics à lire.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `continueReadingModal` | activé | Affiche une fenêtre "Continue Reading?" quand on arrive à la fin d'une fic |
| `autoAdvanceDelay` | `0` (désactivé) | Le temps (en secondes) avant de passer automatiquement à une nouvelle fic, si on n'a rien annulé — ouvre la fic prioritaire de la file d'attente si elle contient des fics, sinon `/works` |
| `showHomepagePanel` | activé | Affiche un bloc "Continue Reading" sur la page d'accueil avec les fics pas encore terminées |
| `resumeCount` | `5` | Le nombre de fics affichées dans ce bloc |
| `homepagePanelStyle` | `list` | La présentation du bloc : `list`, `banner` (juste la plus récente) ou `sidebar` (panneau flottant) |
| `reminderScope` | `home` | Où afficher le rappel de reprise : `home`, `home+search` (+ pages de listing) ou `everywhere` (pastille compacte ailleurs) |
| `breakReminderMinutes` | `0` (désactivé) | Un rappel de pause discret toutes les N minutes pendant la lecture d'une œuvre (30/45/60) |
| `showPostReadingSuggestions` | activé | Affiche des suggestions de fics sous le contenu d'une œuvre terminée |
| `queueEnabled` | désactivé | Active la file d'attente de lecture (bouton "+ Queue" et panneau, priorité low/medium/high, barre de progression) |

Raccourci clavier (pas un réglage de ce module — fourni par `keyboardShortcuts`,
dépendance optionnelle) : `Alt+R` ouvre la fic la plus récente pas encore
terminée.

## Fichiers

### `_fanficBingeMode.js` — tout le module en un seul fichier

- Affiche une fenêtre "Continue Reading?" quand on arrive presque à la fin du dernier chapitre d'une fic, avec des boutons "Mark as Read", "Bookmark", "Add to MFL" ou "Dismiss"
- Un compte à rebours optionnel peut rediriger automatiquement vers la fic prioritaire de la file d'attente (ou vers la page des œuvres si la file est vide), si on ne l'annule pas
- Affiche sur la page d'accueil un bloc listant les fics pas encore terminées (nombre et présentation réglables), avec le temps écoulé depuis la dernière lecture
- En dehors de la page d'accueil, peut afficher une pastille compacte de reprise (réglage `reminderScope`)
- Un rappel de pause discret pendant la lecture, si activé
- Un raccourci clavier (`Alt+R`, via `keyboardShortcuts`) pour reprendre la fic la plus récente
- Propose des suggestions après avoir fini une fic : d'autres fics du même auteur, d'autres fics de la même série, ou un tag au hasard
- Ajoute un bouton "+ Queue" sur les listes de fics pour les mettre dans une file d'attente personnelle
- La file d'attente s'affiche dans un panneau flottant, où on peut réordonner les fics par glisser-déposer, cycler leur priorité (⚪/⭐/🌟), voir leur progression de lecture, ou les retirer

### `fanficBingeMode.css`

- Les styles visuels de la fenêtre, du panneau d'accueil (et ses variantes list/banner/sidebar), de la pastille de reprise compacte, des suggestions et de la file d'attente (dont la barre de progression par fic)

### `fanficBingeModeHelpers.js` — calculs purs (ajouté au passage chantier 4)

- Cycle de priorité de la file (`nextPriority`, low → medium → high → low, avec repli des anciennes valeurs `normal` vers `medium`)
- Choix de la prochaine fic de la file à ouvrir automatiquement (`pickNextQueueEntry`, priorité la plus haute d'abord)
- Détection qu'une entrée d'historique est encore "à reprendre" (`isResumable`, `resumableEntries`)

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs. État après le passage
chantier 4 (2026-07-18) :

- ~~Reprendre la lecture exactement là où on s'était arrêté (retour à la position précise dans le chapitre, pas juste un lien vers la fic)~~ ✅ Fait (déjà couvert ailleurs) — `readingTracker`'s `readingProgress.js` possède déjà tout ça : sauvegarde du scroll + pourcentage (`ao3h:rt:progress:{workId}`), bannière "Resume at Chapter X", et un repère visuel (`<hr>`) au dernier paragraphe lu. Ce module se contente déjà de lier vers le bon chapitre (`chapterHref`), ce qui, combiné au repère de readingTracker, donne l'expérience demandée
- ~~Passer automatiquement au chapitre suivant d'une série sans avoir à cliquer~~ ❌ Écarté — `seriesHelper` a déjà explicitement rejeté un "mode enchaînement automatique" pour la même raison ("jugé trop intrusif"), voir sa section "Explicitement écarté". Même raisonnement ici
- ~~Suivre combien de temps on passe à lire, combien de fics on a lues, ou combien de mots on a consommés pendant une session~~ ❌ Écarté — `readingDashboard` a déjà écarté le calcul de la vitesse de lecture ("jugé peu fiable sans vraie mesure du temps de lecture") ; une statistique de "session" serait encore moins fiable (onglets multiples, pauses, etc.)
- ~~Des objectifs de lecture pour une session (par exemple "5 fics" ou "2 heures")~~ ❌ Écarté — `readingDashboard` a déjà écarté les objectifs de lecture chiffrés ("la lecture reste un loisir, pas un objectif chiffré"), même raisonnement
- ~~Des badges ou des paliers pour les sessions de lecture intensive~~ ❌ Écarté — `readingDashboard` a déjà écarté badges et séries de jours consécutifs ("pour ne pas trop transformer la lecture en jeu"), même raisonnement
- ~~Des rappels de pause pendant une longue session de lecture~~ ✅ Fait — réglage `breakReminderMinutes` (off/30/45/60), un toast discret pendant qu'on lit une œuvre, tant que l'onglet reste visible. Ne mesure rien à long terme (pas de stat persistée) : simple minuteur remis à zéro à chaque chargement de page, donc pas concerné par la réserve ci-dessus sur la fiabilité des statistiques
- ~~Un mode "playlist" pour enchaîner toute une série d'un coup~~ ❌ Écarté — même raison que l'enchaînement automatique de série ci-dessus (déjà rejeté par `seriesHelper`)
- ~~Un mode marathon sans limite~~ ❌ Écarté — reviendrait au même enchaînement automatique jugé trop intrusif ; combiner `continueReadingModal` désactivé et un `autoAdvanceDelay` long donne déjà une lecture ininterrompue pour qui le souhaite
- ~~Utiliser les modules de suggestions "fics similaires" ou "pépites cachées" pour proposer la suite — en ce moment la suggestion de secours cherche juste par un tag au hasard~~ ❌ Écarté — `ficEngagement`'s `hiddenGems.js` et `similarFics` n'annotent que des éléments déjà présents sur la page ; aucun des deux ne récupère et n'analyse une autre page. Une vraie intégration demanderait à ce module de charger et parser une page de recherche côté client, un changement d'architecture disproportionné par rapport à ses suggestions actuelles (simples liens)
- ~~Trois niveaux de priorité dans la file d'attente (haute/moyenne/basse) — en ce moment il n'y a que deux niveaux (normal/haute)~~ ✅ Fait — cycle low/medium/high (⚪/⭐/🌟) au clic sur l'étoile, `fanficBingeModeHelpers.js` → `nextPriority()` ; les anciennes entrées `normal` sont traitées comme `medium`
- ~~Choisir l'apparence du panneau d'accueil (bannière, fenêtre ou barre latérale) — en ce moment il n'y a qu'une seule présentation~~ ✅ Fait — réglage `homepagePanelStyle` (list/banner/sidebar)
- ~~Un raccourci clavier pour reprendre sa lecture rapidement~~ ✅ Fait — `Alt+R`, enregistré via l'API publique de `keyboardShortcuts` (`W.AO3H_Keyboard.register`, dépendance optionnelle : n'existe que si ce module est aussi activé)
- ~~Un message de bienvenue au retour sur le site, avec une petite image de la fic et un rappel du genre "Lu il y a 2 heures"~~ ✅ Fait (partiel) — le temps relatif est affiché (`lib/utils/format-date.js` → `relativeDate()`, déjà utilisé par `readingTracker`) ; pas d'image, AO3 n'a pas de notion de couverture/illustration pour une œuvre
- ~~Proposer plusieurs fics à reprendre d'un coup, pas seulement la toute dernière lue~~ ✅ Fait — le panneau affichait déjà jusqu'à 5 entrées ; désormais filtrées aux œuvres réellement pas terminées (`isResumable()`) et le nombre est réglable (`resumeCount`)
- ~~Choisir où le rappel de reprise doit apparaître : page d'accueil, résultats de recherche, ou partout sur le site~~ ✅ Fait — réglage `reminderScope` (home/home+search/everywhere) ; en dehors de la page d'accueil, une pastille compacte "📖 Continue: …" apparaît à la place du panneau complet
- ~~Afficher une barre de progression avec le pourcentage déjà lu pour chaque fic dans la file d'attente~~ ✅ Fait — lit `ao3h:rt:progress:{workId}` (readingTracker, dépendance optionnelle) et affiche une mini barre si la donnée existe
- ~~Passer automatiquement à la fic suivante de la file d'attente, sans avoir à cliquer pour l'ouvrir soi-même~~ ✅ Fait — quand le compte à rebours d'auto-avance (déjà optionnel, `autoAdvanceDelay`) arrive à zéro, il ouvre la fic de plus haute priorité de la file si elle n'est pas vide, sinon `/works` comme avant




AO3 Helper — Fanfic Binge Mode
    Module ID:    fanficBingeMode
    Display Name: Fanfic Binge Mode
    Tab:          Standalone (outside 6-tab UI)

    Features (each gated by a cfg key):
        continueReadingModal      -- modal at 95% scroll on last chapter
        showHomepagePanel         -- "Continue Reading" panel on AO3 homepage
        showPostReadingSuggestions -- suggestions block below work content
        queueEnabled              -- per-blurb Add to Queue button + queue panel
        autoAdvanceDelay          -- countdown auto-advance in modal (0 = off)

    Storage keys:
        ao3h:mod:fanficBingeMode:settings  -- user settings
        ao3h:fbm:queue                     -- [{ id, title, href, addedAt, priority }]
                                              (priority: low | medium | high,
                                              chantier 4 — legacy 'normal' still
                                              read as medium)
    Reads (soft dependency — graceful fallback if absent):
        ao3h:rt:history            -- readingTracker history list
        ao3h:rt:progress:{workId}  -- readingTracker per-work scroll/progress
                                      (chantier 4 — powers the queue's progress
                                      bar and the resumable-only homepage filter)
    External API used (soft dependency — no-op if the module isn't active):
        W.AO3H_Keyboard.register('fbmResume', 'Alt+R', fn)  -- keyboardShortcuts



═══════════════════════════════════════════════════════════════════════════
  # fanficBingeMode
  **Tab :** Library
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Fanfic Binge Mode** accompagne les sessions de lecture intensive en facilitant l’enchaînement entre plusieurs fics.

* Il permet notamment de :
  - afficher une fenêtre de continuation à la fin d’une œuvre ;
  - effectuer rapidement des actions après la lecture ;
  - rediriger automatiquement l’utilisateur après un compte à rebours ;
  - retrouver les dernières œuvres lues depuis la page d’accueil ;
  - proposer des œuvres à lire ensuite ;
  - créer une file d’attente personnelle ;
  - réorganiser et prioriser les œuvres placées dans cette file.

---

# Réglages utilisateur

| Réglage                      | Description                                                                                                              |
| ---------------------------- |--------------------------------------------------------------------------------------------------------------------------|
| `continueReadingModal`       | Affiche une fenêtre « Continue Reading? » lorsque l’utilisateur arrive presque à la fin du dernier chapitre d’une œuvre. |
| `autoAdvanceDelay`           | Définit le délai, en secondes, avant une redirection automatique. La valeur `0` désactive cette fonctionnalité. Redirige vers la fic prioritaire de la file d'attente si elle en contient (chantier 4). |
| `showHomepagePanel`          | Affiche un bloc « Continue Reading » sur la page d’accueil avec les œuvres pas encore terminées.                          |
| `resumeCount`                | Nombre d'œuvres affichées dans ce bloc (chantier 4).                                                                     |
| `homepagePanelStyle`         | Présentation du bloc : liste, bannière (la plus récente seulement), ou barre latérale flottante (chantier 4).            |
| `reminderScope`              | Où afficher le rappel de reprise : accueil seul, accueil + listes, ou partout (pastille compacte) (chantier 4).          |
| `breakReminderMinutes`       | Rappel de pause discret toutes les N minutes pendant la lecture (chantier 4).                                            |
| `showPostReadingSuggestions` | Affiche des suggestions de lecture sous le contenu d’une œuvre terminée.                                                 |
| `queueEnabled`               | Active la file d’attente de lecture, le bouton « + Queue » et son panneau de gestion (priorité low/medium/high, barre de progression — chantier 4). |

---

# Structure du module

Le module est composé d’un fichier fonctionnel unique, d'un fichier de calculs
purs (`fanficBingeModeHelpers.js`, ajouté au passage chantier 4), et d’une
feuille de style.

```text
_fanficBingeMode.js
fanficBingeModeHelpers.js
fanficBingeMode.css
```

---

# _fanficBingeMode.js

## Rôle

Gère l’ensemble des fonctionnalités liées aux sessions de lecture intensive.

Il détecte la fin d’une œuvre, affiche les outils de continuation, propose des lectures suivantes et gère une file d’attente personnelle.

---

## Fonctionnalités

### Fenêtre « Continue Reading? »

Lorsque `continueReadingModal` est activé, le module surveille la progression de lecture sur les pages d’œuvres.

La fenêtre est affichée lorsque l’utilisateur atteint environ 95 % du défilement du dernier chapitre.

Elle propose plusieurs actions :

* **Mark as Read** ;
* **Bookmark** ;
* **Add to MFL** ;
* **Dismiss**.

La fenêtre apparaît uniquement lorsqu’il s’agit du dernier chapitre de l’œuvre.

---

### Redirection automatique

Lorsque `autoAdvanceDelay` contient une valeur supérieure à `0`, la fenêtre peut afficher un compte à rebours.

À la fin du délai, le module redirige automatiquement l’utilisateur vers la page des œuvres si le compte à rebours n’a pas été annulé.

La valeur :

```text
0
```

désactive complètement la redirection automatique.

Depuis le passage chantier 4, si la file d'attente contient des œuvres, la
redirection ouvre celle de plus haute priorité plutôt que la page générique
des œuvres.

---

### Panneau de la page d’accueil

Lorsque `showHomepagePanel` est activé, le module ajoute un bloc intitulé :

```text
Continue Reading
```

sur la page d’accueil d’AO3.

Ce bloc affiche les œuvres pas encore terminées (jusqu'à `resumeCount`
d'entre elles, 5 par défaut), avec le temps écoulé depuis la dernière
lecture, afin de permettre à l’utilisateur de les retrouver rapidement.

Sa présentation dépend de `homepagePanelStyle` : liste (par défaut),
bannière (une seule œuvre mise en avant), ou barre latérale flottante.

En dehors de la page d’accueil, une pastille compacte de reprise peut
apparaître selon `reminderScope` (pages de listing, ou partout).

Les données sont récupérées depuis l’historique du module de suivi de lecture lorsqu’il est disponible.

---

### Suggestions après la lecture

Lorsque `showPostReadingSuggestions` est activé, le module ajoute un bloc de suggestions sous le contenu d’une œuvre terminée.

Les suggestions peuvent comprendre :

* d’autres œuvres du même auteur ;
* d’autres œuvres appartenant à la même série ;
* une recherche fondée sur un tag choisi au hasard.

La recherche par tag sert de solution de secours lorsqu’aucune suggestion plus directement liée à l’œuvre n’est disponible.

---

### Ajout à la file d’attente

Lorsque `queueEnabled` est activé, le module ajoute un bouton :

```text
+ Queue
```

sur les œuvres affichées dans les listes AO3.

Ce bouton permet d’ajouter une œuvre à une file d’attente personnelle.

Chaque entrée peut contenir notamment :

* l’identifiant de l’œuvre ;
* son titre ;
* son adresse ;
* la date de son ajout ;
* son niveau de priorité.

---

### Panneau de la file d’attente

La file d’attente est affichée dans un panneau flottant.

Depuis ce panneau, l’utilisateur peut :

* ouvrir une œuvre ;
* réorganiser les œuvres par glisser-déposer ;
* marquer une œuvre comme prioritaire ;
* retirer une œuvre de la file.

---

### Priorité des œuvres

Chaque œuvre de la file a un niveau de priorité, affiché sous forme d'icône
et modifiable en cliquant dessus. Depuis le passage chantier 4, trois
niveaux existent, dans cet ordre cyclique :

* ⚪ basse (`low`) ;
* ⭐ moyenne (`medium`) ;
* 🌟 haute (`high`).

Les entrées créées avant ce changement (`normal`) sont traitées comme une
priorité moyenne.

C'est également la priorité qui détermine quelle œuvre de la file est
ouverte automatiquement par le compte à rebours d'auto-avance : celle de
plus haut niveau, à égalité l'œuvre ajoutée en premier.

---

### Progression de lecture dans la file

Quand la donnée est disponible (module de suivi de lecture actif et œuvre
déjà commencée), chaque entrée de la file affiche une petite barre indiquant
le pourcentage déjà lu.

---

## Détails techniques

### Activation des fonctionnalités

Chaque fonctionnalité principale est contrôlée par sa propre clé de configuration :

```text
continueReadingModal
showHomepagePanel
showPostReadingSuggestions
queueEnabled
autoAdvanceDelay
```

---

### Détection de fin de lecture

La fenêtre de continuation est déclenchée lorsque :

* l’utilisateur se trouve sur une page d’œuvre ;
* il consulte le dernier chapitre ;
* il atteint environ 95 % du défilement de la page.

---

### Stockage des réglages

Les préférences utilisateur sont enregistrées sous :

```text
ao3h:mod:fanficBingeMode:settings
```

---

### Stockage de la file d’attente

La file d’attente est enregistrée sous :

```text
ao3h:fbm:queue
```

Sa structure correspond à une liste d’objets semblables à :

```text
[
  {
    id,
    title,
    href,
    addedAt,
    priority
  }
]
```

---

### Position dans l’interface

La documentation fonctionnelle classe le module dans l’onglet **Library**.

Les métadonnées techniques le décrivent toutefois comme un module autonome situé en dehors de l’interface principale à six onglets.

---

## Dépendances

Le module peut lire l’historique enregistré sous :

```text
ao3h:rt:history
```

et, depuis le passage chantier 4, la progression de lecture par œuvre
enregistrée sous :

```text
ao3h:rt:progress:{workId}
```

Ces deux dépendances sont facultatives : elles proviennent du module de
suivi de lecture (**readingTracker**).

Depuis le passage chantier 4, le module peut aussi enregistrer un raccourci
clavier via l'API publique de **keyboardShortcuts** (`W.AO3H_Keyboard`),
également une dépendance facultative.

Si l'une de ces dépendances n'est pas disponible, **Fanfic Binge Mode**
continue de fonctionner avec un comportement de repli adapté (pas de
raccourci, pas de barre de progression, filtrage "à reprendre" toujours actif
en traitant une complétion inconnue comme non terminée).

---

# fanficBingeMode.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Fanfic Binge Mode**.

Il définit notamment l’apparence :

* de la fenêtre « Continue Reading? » ;
* du compte à rebours ;
* des boutons d’action ;
* du panneau de la page d’accueil ;
* des suggestions après la lecture ;
* des boutons « + Queue » ;
* du panneau flottant de la file d’attente ;
* des œuvres prioritaires ;
* des contrôles de réorganisation et de suppression.

---

# Fonctionnalités non implémentées

État après le passage chantier 4 (2026-07-18) — chaque sous-section garde sa
description d'origine, complétée par une note de résolution.

## Reprise à la position précise

> ✅ Fait (déjà couvert ailleurs) — `readingTracker`'s `readingProgress.js`
> sauvegarde déjà le scroll et le pourcentage (`ao3h:rt:progress:{workId}`),
> affiche une bannière "Resume at Chapter X" et un repère `<hr>` au dernier
> paragraphe lu. Ce module se contente déjà de lier vers le bon chapitre.

Permettre de reprendre la lecture exactement à l’endroit où elle a été interrompue dans un chapitre.

Le système actuel fournit uniquement un lien vers l’œuvre et ne restaure pas une position précise dans le texte.

---

## Passage automatique dans une série

> ❌ Écarté — `seriesHelper` a déjà rejeté un mode d'enchaînement
> automatique de série ("jugé trop intrusif"). Même raisonnement ici.

Passer automatiquement au chapitre ou à l’œuvre suivante d’une série sans intervention de l’utilisateur.

---

## Statistiques de session

> ❌ Écarté — `readingDashboard` a déjà écarté le calcul de la vitesse de
> lecture ("jugé peu fiable sans vraie mesure du temps de lecture") ; une
> statistique de session serait encore moins fiable.

Suivre pendant une session de lecture intensive :

* le temps total passé à lire ;
* le nombre de fics lues ;
* le nombre de mots lus.

---

## Objectifs de session

> ❌ Écarté — `readingDashboard` a déjà écarté les objectifs de lecture
> chiffrés ("la lecture reste un loisir, pas un objectif chiffré").

Permettre de définir un objectif pour une session, par exemple :

```text
5 fics
```

ou :

```text
2 heures
```

---

## Accomplissements de session

> ❌ Écarté — `readingDashboard` a déjà écarté badges et séries de jours
> consécutifs ("pour ne pas trop transformer la lecture en jeu").

Ajouter des badges ou des paliers propres aux sessions de lecture intensive.

---

## Rappels de pause

> ✅ Fait — réglage `breakReminderMinutes` (off/30/45/60), toast discret
> pendant qu'on lit une œuvre et que l'onglet reste visible ; minuteur simple
> remis à zéro à chaque chargement de page, pas une statistique persistée.

Afficher des rappels encourageant l’utilisateur à prendre une pause pendant une longue session.

---

## Mode playlist

> ❌ Écarté — même raison que le passage automatique dans une série
> ci-dessus (déjà rejeté par `seriesHelper`).

Permettre d’enchaîner automatiquement toutes les œuvres d’une série ou d’une sélection préparée.

---

## Mode marathon

> ❌ Écarté — reviendrait au même enchaînement automatique jugé trop
> intrusif ; désactiver `continueReadingModal` et régler un `autoAdvanceDelay`
> long donne déjà une lecture ininterrompue pour qui le souhaite.

Ajouter un mode de lecture continue sans limite définie.

---

## Suggestions avancées

> ❌ Écarté — `hiddenGems.js` (dans `ficEngagement`) et `similarFics`
> n'annotent que des éléments déjà présents sur la page ; aucun des deux ne
> récupère et n'analyse une autre page. Une vraie intégration demanderait à
> ce module de charger et parser une page de recherche côté client, hors de
> proportion avec ses suggestions actuelles (simples liens).

Utiliser les modules spécialisés dans les œuvres similaires ou les pépites cachées afin de produire des suggestions plus pertinentes.

Le système actuel utilise comme solution de secours une recherche fondée sur un tag choisi au hasard.

---

## Priorités multiples

> ✅ Fait — cycle low/medium/high (⚪/⭐/🌟) au clic sur l'étoile
> (`fanficBingeModeHelpers.js` → `nextPriority()`) ; les anciennes entrées
> `normal` sont traitées comme `medium`.

Ajouter trois niveaux de priorité dans la file d’attente :

* haute ;
* moyenne ;
* basse.

Le système actuel ne distingue que la priorité normale et la priorité élevée.

---

## Présentation du panneau d’accueil

> ✅ Fait — réglage `homepagePanelStyle` (list/banner/sidebar).

Permettre de choisir la présentation du rappel de continuation parmi plusieurs formats :

* bannière ;
* fenêtre ;
* barre latérale.

Une seule présentation est actuellement disponible.

---

## Raccourci clavier

> ✅ Fait — `Alt+R`, enregistré via l'API publique de `keyboardShortcuts`
> (dépendance optionnelle).

Ajouter un raccourci clavier permettant de reprendre rapidement la lecture.

---

## Message de retour

> ✅ Fait (partiel) — le temps relatif est affiché (`relativeDate()`,
> réutilisé depuis `lib/utils/format-date.js`) ; pas d'image, AO3 n'a pas de
> notion de couverture/illustration pour une œuvre.

Afficher au retour sur AO3 un message de bienvenue contenant :

* une petite image de l’œuvre ;
* son titre ;
* une indication du temps écoulé depuis la dernière lecture.

Exemple :

```text
Lu il y a 2 heures
```

---

## Plusieurs œuvres à reprendre

> ✅ Fait — le panneau affichait déjà jusqu'à 5 entrées ; désormais filtrées
> aux œuvres réellement pas terminées et le nombre est réglable (`resumeCount`).

Afficher plusieurs propositions de reprise en même temps plutôt que seulement la dernière œuvre lue.

---

## Emplacement du rappel

> ✅ Fait — réglage `reminderScope` (home/home+search/everywhere) ; en
> dehors de la page d'accueil, une pastille compacte remplace le panneau complet.

Permettre de choisir où afficher les rappels de reprise :

* sur la page d’accueil ;
* dans les résultats de recherche ;
* partout sur le site.

---

## Progression dans la file d’attente

> ✅ Fait — lit `ao3h:rt:progress:{workId}` (readingTracker, dépendance
> optionnelle) et affiche une mini barre si la donnée existe.

Afficher une barre de progression et le pourcentage déjà lu pour chaque œuvre placée dans la file d’attente.

---

## Passage automatique à l’œuvre suivante

> ✅ Fait — quand le compte à rebours d'auto-avance (déjà optionnel) arrive
> à zéro, il ouvre la fic de plus haute priorité de la file si elle n'est pas
> vide, sinon `/works` comme avant.

Ouvrir automatiquement la prochaine œuvre de la file d’attente lorsque la lecture actuelle est terminée.

Le système actuel exige que l’utilisateur sélectionne lui-même l’œuvre suivante.

---

# Décisions de conception

Plusieurs idées ont été écartées lors du passage chantier 4 (2026-07-18) en
s'alignant sur des décisions déjà prises par des modules voisins plutôt qu'en
les retranchant isolément :

- L'enchaînement automatique (série, playlist, mode marathon) reste écarté
  pour la même raison que `seriesHelper` : jugé trop intrusif.
- Les statistiques de session, objectifs chiffrés et badges restent écartés
  pour la même raison que `readingDashboard` : peu fiables à mesurer
  correctement, et le risque de trop transformer la lecture en jeu.
- Les suggestions basées sur `similarFics`/`hiddenGems` restent écartées car
  elles demanderaient à ce module de récupérer et analyser une autre page,
  un changement d'architecture hors de proportion avec sa conception actuelle
  (suggestions sous forme de simples liens).



