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
