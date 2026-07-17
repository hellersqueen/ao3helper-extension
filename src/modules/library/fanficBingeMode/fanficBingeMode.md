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
| `autoAdvanceDelay` | `0` (désactivé) | Le temps (en secondes) avant de passer automatiquement à une nouvelle fic, si on n'a rien annulé |
| `showHomepagePanel` | activé | Affiche un bloc "Continue Reading" sur la page d'accueil avec les dernières fics lues |
| `showPostReadingSuggestions` | activé | Affiche des suggestions de fics sous le contenu d'une œuvre terminée |
| `queueEnabled` | désactivé | Active la file d'attente de lecture (bouton "+ Queue" et panneau) |

## Fichiers

### `_fanficBingeMode.js` — tout le module en un seul fichier

- Affiche une fenêtre "Continue Reading?" quand on arrive presque à la fin du dernier chapitre d'une fic, avec des boutons "Mark as Read", "Bookmark", "Add to MFL" ou "Dismiss"
- Un compte à rebours optionnel peut rediriger automatiquement vers la page des œuvres si on ne l'annule pas
- Affiche sur la page d'accueil un bloc listant les 5 dernières fics lues
- Propose des suggestions après avoir fini une fic : d'autres fics du même auteur, d'autres fics de la même série, ou un tag au hasard
- Ajoute un bouton "+ Queue" sur les listes de fics pour les mettre dans une file d'attente personnelle
- La file d'attente s'affiche dans un panneau flottant, où on peut réordonner les fics par glisser-déposer, marquer une fic en priorité (⭐), ou la retirer

### `fanficBingeMode.css`

- Les styles visuels de la fenêtre, du panneau d'accueil, des suggestions et de la file d'attente

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Reprendre la lecture exactement là où on s'était arrêté (retour à la position précise dans le chapitre, pas juste un lien vers la fic)
- Passer automatiquement au chapitre suivant d'une série sans avoir à cliquer
- Suivre combien de temps on passe à lire, combien de fics on a lues, ou combien de mots on a consommés pendant une session
- Des objectifs de lecture pour une session (par exemple "5 fics" ou "2 heures")
- Des badges ou des paliers pour les sessions de lecture intensive
- Des rappels de pause pendant une longue session de lecture
- Un mode "playlist" pour enchaîner toute une série d'un coup
- Un mode marathon sans limite
- Utiliser les modules de suggestions "fics similaires" ou "pépites cachées" pour proposer la suite — en ce moment la suggestion de secours cherche juste par un tag au hasard
- Trois niveaux de priorité dans la file d'attente (haute/moyenne/basse) — en ce moment il n'y a que deux niveaux (normal/haute)
- Choisir l'apparence du panneau d'accueil (bannière, fenêtre ou barre latérale) — en ce moment il n'y a qu'une seule présentation
- Un raccourci clavier pour reprendre sa lecture rapidement
- Un message de bienvenue au retour sur le site, avec une petite image de la fic et un rappel du genre "Lu il y a 2 heures"
- Proposer plusieurs fics à reprendre d'un coup, pas seulement la toute dernière lue
- Choisir où le rappel de reprise doit apparaître : page d'accueil, résultats de recherche, ou partout sur le site
- Afficher une barre de progression avec le pourcentage déjà lu pour chaque fic dans la file d'attente
- Passer automatiquement à la fic suivante de la file d'attente, sans avoir à cliquer pour l'ouvrir soi-même




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
    Reads (soft dependency — graceful fallback if absent):
        ao3h:rt:history            -- readingTracker history list



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
| `autoAdvanceDelay`           | Définit le délai, en secondes, avant une redirection automatique. La valeur `0` désactive cette fonctionnalité.          |
| `showHomepagePanel`          | Affiche un bloc « Continue Reading » sur la page d’accueil avec les dernières œuvres lues.                               |
| `showPostReadingSuggestions` | Affiche des suggestions de lecture sous le contenu d’une œuvre terminée.                                                 |
| `queueEnabled`               | Active la file d’attente de lecture, le bouton « + Queue » et son panneau de gestion.                                    |

---

# Structure du module

Le module est composé d’un fichier fonctionnel unique et d’une feuille de style.

```text
_fanficBingeMode.js
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

---

### Panneau de la page d’accueil

Lorsque `showHomepagePanel` est activé, le module ajoute un bloc intitulé :

```text
Continue Reading
```

sur la page d’accueil d’AO3.

Ce bloc affiche les cinq dernières œuvres lues afin de permettre à l’utilisateur de les retrouver rapidement.

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

Une œuvre peut être marquée comme prioritaire à l’aide d’une étoile :

```text
⭐
```

Le système actuel utilise deux niveaux :

* priorité normale ;
* priorité élevée.

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

Cette dépendance est facultative.

Si l’historique du module de suivi de lecture n’est pas disponible, **Fanfic Binge Mode** continue de fonctionner avec un comportement de repli adapté.

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

## Reprise à la position précise

Permettre de reprendre la lecture exactement à l’endroit où elle a été interrompue dans un chapitre.

Le système actuel fournit uniquement un lien vers l’œuvre et ne restaure pas une position précise dans le texte.

---

## Passage automatique dans une série

Passer automatiquement au chapitre ou à l’œuvre suivante d’une série sans intervention de l’utilisateur.

---

## Statistiques de session

Suivre pendant une session de lecture intensive :

* le temps total passé à lire ;
* le nombre de fics lues ;
* le nombre de mots lus.

---

## Objectifs de session

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

Ajouter des badges ou des paliers propres aux sessions de lecture intensive.

---

## Rappels de pause

Afficher des rappels encourageant l’utilisateur à prendre une pause pendant une longue session.

---

## Mode playlist

Permettre d’enchaîner automatiquement toutes les œuvres d’une série ou d’une sélection préparée.

---

## Mode marathon

Ajouter un mode de lecture continue sans limite définie.

---

## Suggestions avancées

Utiliser les modules spécialisés dans les œuvres similaires ou les pépites cachées afin de produire des suggestions plus pertinentes.

Le système actuel utilise comme solution de secours une recherche fondée sur un tag choisi au hasard.

---

## Priorités multiples

Ajouter trois niveaux de priorité dans la file d’attente :

* haute ;
* moyenne ;
* basse.

Le système actuel ne distingue que la priorité normale et la priorité élevée.

---

## Présentation du panneau d’accueil

Permettre de choisir la présentation du rappel de continuation parmi plusieurs formats :

* bannière ;
* fenêtre ;
* barre latérale.

Une seule présentation est actuellement disponible.

---

## Raccourci clavier

Ajouter un raccourci clavier permettant de reprendre rapidement la lecture.

---

## Message de retour

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

Afficher plusieurs propositions de reprise en même temps plutôt que seulement la dernière œuvre lue.

---

## Emplacement du rappel

Permettre de choisir où afficher les rappels de reprise :

* sur la page d’accueil ;
* dans les résultats de recherche ;
* partout sur le site.

---

## Progression dans la file d’attente

Afficher une barre de progression et le pourcentage déjà lu pour chaque œuvre placée dans la file d’attente.

---

## Passage automatique à l’œuvre suivante

Ouvrir automatiquement la prochaine œuvre de la file d’attente lorsque la lecture actuelle est terminée.

Le système actuel exige que l’utilisateur sélectionne lui-même l’œuvre suivante.

---

# Décisions de conception

Aucune fonctionnalité n’est explicitement indiquée comme définitivement écartée dans la documentation actuelle.



