# collapseAuthorNotes

**Tab:** Reading

## À quoi ça sert

Sur les pages d'une fic, ce module replie les notes de l'auteur (avant et
après le texte) derrière un petit bouton, pour ne pas avoir à faire
défiler la page devant de longues notes. Il peut aussi cacher les
bandeaux de collection, de cadeau ou de défi.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `autoCollapseBeginning` | désactivé | Replie automatiquement les notes de début au chargement de la page |
| `autoCollapseEnd` | désactivé | Replie automatiquement les notes de fin au chargement de la page |
| `autoExpandWarnings` | activé | Garde toujours ouvertes les notes qui contiennent un avertissement (TW, CW, trigger warning, content warning) |
| `hideCollectionBanners` | désactivé | Cache les bandeaux de collection, de cadeau ou de défi |

## Fichiers

### `collapseAuthorNotes.js` — tout le module en un seul fichier

- Replie les notes de début et de fin derrière un bouton ▼ / ▶
- Se souvient, fic par fic, si les notes étaient repliées ou non
- Si on arrive sur la page avec un lien qui pointe directement vers les notes, elles s'ouvrent automatiquement
- Garde toujours ouvertes les notes qui contiennent un avertissement, même si le repli automatique est activé
- Peut aussi cacher les bandeaux de collection, de cadeau ou de défi

### `collapseAuthorNotes.css`

- Les styles visuels du bouton et de l'état replié

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Replier automatiquement les notes seulement si elles dépassent une certaine longueur choisie par l'utilisateur
- Déplier automatiquement les notes qui contiennent des mots-clés qu'on choisit soi-même, en plus de TW/CW
- Effacer toutes les préférences sauvegardées (notes repliées ou non) quand on désactive le module
- Se combiner avec les réglages d'apparence pour proposer un vrai mode de lecture sans distraction

## Explicitement écarté

- Un bouton "Aller directement au texte" pour sauter les notes d'un coup — jugé redondant avec la navigation déjà fournie par AO3
- Montrer un aperçu de la première ligne de la note avant de la déplier — jugé trop compliqué à faire pour ce que ça apporte
- Pouvoir désactiver le fait que le module se souvienne si une note était repliée ou non — c'est toujours activé, ça fait partie du fonctionnement de base
- Pouvoir désactiver le dépliage automatique des notes quand on arrive par un lien qui pointe dessus — c'est toujours activé, c'est normal
- Personnaliser la position ou l'apparence du bouton pour replier/déplier — il n'y a qu'une seule présentation possible
