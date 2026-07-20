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
| `autoCollapseMinChars` | `0` | Ne replie automatiquement que les notes plus longues que ce seuil (0 = toujours) |
| `autoExpandWarnings` | activé | Garde toujours ouvertes les notes qui contiennent un avertissement (TW, CW, trigger warning, content warning) |
| `autoExpandKeywords` | (vide) | Tes propres mots-clés (séparés par des virgules) qui gardent une note ouverte |
| `hideCollectionBanners` | désactivé | Cache les bandeaux de collection, de cadeau ou de défi |
| `clearStatesOnDisable` | désactivé | Oublie les choix repli/dépli sauvegardés quand le module est désactivé |

## Fichiers

### `collapseAuthorNotes.js` — le module

- Fonctionne uniquement sur les pages de lecture des œuvres.
- Détecte les notes de début (`div.notes.module`) et de fin
  (`div.end.notes.module`) et ajoute à chacune un bouton de repli/dépli
  (`▼`/`▲` quand la note est ouverte, `▶` quand elle est repliée) — une
  seule présentation du bouton est utilisée dans le module.
- Se souvient, fic par fic, si les notes étaient repliées ou non. L'état
  est enregistré séparément dans `localStorage`, sous
  `ao3h:notes:{workId}:pre` pour les notes de début et
  `ao3h:notes:{workId}:end` pour les notes de fin ; il est restauré
  automatiquement à chaque nouvelle visite de l'œuvre.
- Si on arrive sur la page avec un lien qui pointe directement vers les
  notes (`#notes` ou `#endnotes`), la section ciblée s'ouvre
  automatiquement, quel que soit l'état enregistré ou le réglage de repli
  automatique — ce comportement n'est pas désactivable.
- Garde toujours ouvertes les notes qui contiennent un avertissement
  reconnu (TW, CW, Trigger Warning, Content Warning), même si le repli
  automatique est activé.
- Détecte aussi les mots-clés personnels (`autoExpandKeywords`) et le
  seuil minimal de longueur (`autoCollapseMinChars`).
- Ordre de priorité appliqué à l'état final d'une note : 1) une ancre
  `#notes`/`#endnotes` force l'ouverture, 2) un avertissement reconnu peut
  forcer l'ouverture, 3) l'état précédemment enregistré est restauré,
  4) le réglage de repli automatique ne s'applique que s'il n'y a pas
  encore d'état enregistré.
- Peut aussi cacher les bandeaux de collection, de cadeau ou de défi.
- Les réglages sont lus depuis la configuration du module, actuellement
  accessible directement à partir de `localStorage`.
- Module autonome : il n'utilise que la configuration du module,
  `localStorage` et le DOM des pages AO3.

### `collapseAuthorNotes.css`

- Les styles visuels du bouton, des icônes directionnelles, des notes
  ouvertes/repliées et des éléments masqués.

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Replier automatiquement les notes seulement si elles dépassent une certaine longueur choisie par l'utilisateur~~ ✅
  Fait : réglage `autoCollapseMinChars` — en dessous du seuil, la note reste
  visible même avec le repli automatique activé (0 = comportement historique).
- ~~Déplier automatiquement les notes qui contiennent des mots-clés qu'on choisit soi-même, en plus de TW/CW~~ ✅
  Fait : réglage `autoExpandKeywords` (liste de mots séparés par des
  virgules, insensible à la casse), prioritaire sur le repli automatique
  comme les avertissements.
- ~~Effacer toutes les préférences sauvegardées (notes repliées ou non) quand on désactive le module~~ ✅
  Fait : réglage `clearStatesOnDisable` (désactivé par défaut pour ne pas
  perdre les choix lors d'une désactivation temporaire) — `clearAllStates()`
  existait déjà mais n'était jamais appelé.

## Explicitement écarté

- Se combiner avec les réglages d'apparence pour proposer un vrai mode de lecture sans distraction — écarté : le mode lecture (mise en page, typographie, plein écran) est le rôle de `readingFormatter` ; les deux modules s'activent déjà ensemble librement, un couplage explicite n'apporterait qu'une dépendance de plus
- Un bouton "Aller directement au texte" pour sauter les notes d'un coup — jugé redondant avec la navigation déjà fournie par AO3
- Montrer un aperçu de la première ligne de la note avant de la déplier — jugé trop compliqué à faire pour ce que ça apporte
- Pouvoir désactiver le fait que le module se souvienne si une note était repliée ou non — c'est toujours activé, ça fait partie du fonctionnement de base
- Pouvoir désactiver le dépliage automatique des notes quand on arrive par un lien qui pointe dessus — c'est toujours activé, nécessaire pour respecter les liens directs vers une section précise
- Personnaliser la position ou l'apparence du bouton pour replier/déplier — il n'y a qu'une seule présentation possible, pour garder un comportement simple et uniforme
