# tagsDisplay

**Tab:** Browse

## À quoi ça sert

Ce module regroupe plusieurs petites améliorations indépendantes pour
l'affichage des tags, sur les listes de fics et sur les pages d'œuvre : des
icônes plus lisibles pour les avertissements, la possibilité de cacher les
tags qui ne servent à rien, un mode compact, le surlignage des tags
favoris, le réordonnancement à la souris, et le masquage des tags en trop.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `archiveWarningsStyle` | `badge` | Comment les avertissements sont affichés : icône seule, texte abrégé, ou icône + texte |
| `compactWarnings` | activé | Active ou coupe complètement l'affichage des avertissements en icônes |
| `autoHideNoiseTags` | désactivé | Cache automatiquement les petits tags qui ne servent à rien (ex. "pls be nice") |
| `compactMode` | désactivé | Replie les tags et les résumés, qui s'agrandissent au passage de la souris |
| `highlightFavoriteTags` | activé | Surligne les tags favoris avec une couleur |
| `highlightColor` | Jaune | La couleur utilisée par défaut pour surligner un tag rapidement |
| `maxTagsVisible` | `0` (tous affichés) | Le nombre maximum de tags affichés par fic avant de cacher le reste (`0`, `5`, `10`, `15`) |

## Fichiers

### 1. `archiveWarningsDisplay.js` — icônes pour les avertissements

- Remplace le texte long des avertissements par des icônes compactes (⚠️ Violence, 💀 MCD, 🚫 Underage, ⛔ Non-Con, ✓ No Warnings)
- Propose 3 styles d'affichage : icône seule, texte abrégé, ou icône + texte
- "Creator Chose Not To Use Archive Warnings" reste toujours écrit en entier, jamais remplacé par une icône
- Peut être complètement désactivé pour revenir au texte d'origine

### 2. `autoHideNoiseTags.js` — cacher les tags inutiles

- Repère et cache automatiquement les petits tags qui ne veulent rien dire (par exemple "idk", "first fic pls be nice", "unbetaed")
- Compare chaque tag à une liste d'environ 25 expressions connues

### 3. `compactModeTags.js` — mode compact

- Replie les tags et les résumés pour qu'ils prennent moins de place
- Les fait réapparaître automatiquement quand on passe la souris dessus
- Ne change que l'apparence de la page, rien d'autre

### 4. `tagHighlighting.js` — surligner ses tags favoris

- Surligne en couleur les tags que l'utilisateur a choisis comme favoris
- Un clic droit sur un tag ouvre un petit menu pour choisir une couleur parmi 6 et l'ajouter tout de suite

### 5. `tagsReordering.js` — réordonner les tags à la souris

- Sur les pages d'œuvre, permet de glisser-déposer les tags pour changer leur ordre, catégorie par catégorie (fandom, personnages, relations, tags libres)
- Se souvient de l'ordre choisi pour chaque fic
- Un bouton "Reset order" apparaît pour remettre l'ordre d'origine si on a changé quelque chose

### 6. `tagsVisibility.js` — cacher les tags en trop

- Sur les listes de fics, cache les tags en trop quand il y en a trop pour tenir sur une ligne
- Cache en priorité les tags les moins importants (tags libres avant personnages, avant relations, avant avertissements)
- Un bouton "+N more tags" permet de tout revoir, et "– Show less" de tout recacher

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Replier chaque catégorie de tags séparément (fandom, personnages, relations, tags libres) au lieu de tout replier en bloc
- Remonter automatiquement les tags les plus importants en premier
- Flouter les tags "spoiler" au lieu de simplement les cacher
- Choisir soi-même ses propres mots à considérer comme du "bruit", avec différents niveaux de gravité
- Avoir des règles de masquage de tags différentes selon l'auteur de la fic
- Pouvoir réafficher un tag caché par le filtre anti-bruit, un par un, sans tout désactiver
- Choisir d'agrandir seulement certains types de tags (par exemple juste les relations) plutôt que tout en même temps
- Agrandir automatiquement les tags d'une fic dès qu'elle apparaît en scrollant, sans avoir à passer la souris dessus
- Voir en couleur si un tag est le tag "officiel" ou juste une variante/synonyme, avec une bulle qui montre le tag officiel à côté
- Se souvenir si on avait déplié les tags sur une page précise, pour ne pas avoir à recommencer à chaque visite
- Un raccourci clavier pour plier/déplier les tags d'un coup
- Voir un aperçu du tag caché en survolant, sans tout déplier
- Signaler un tag "bruit" à la communauté, ou utiliser une liste de mots "bruit" faite par d'autres utilisateurs
- Des styles de surlignage plus riches (gras, italique, bordure, petit symbole devant le tag), pas juste une couleur de fond
- Voir des informations ou des statistiques sur la personne qui gère un tag
- Voir une carte des liens entre tags proches ou similaires
- Faire le lien entre la recherche et les tags mis en avant ici
- Des façons toutes faites de trier les tags (alphabétique, par importance, par longueur), pas seulement à la main
- Sauvegarder ou récupérer ses réglages d'ordre des tags dans un fichier, et pouvoir réordonner plusieurs fics d'un coup
- Donner une couleur différente selon la gravité d'un avertissement — *volontairement pas fait, pour rester neutre*
- Une fenêtre d'avertissement à lire et à valider avant d'ouvrir une fic avec un tag sensible
- Des liens vers des sites externes (comme TV Tropes ou Fanlore) directement depuis un tag
- Nettoyer et regrouper automatiquement les noms de fandoms qui existent sous plusieurs variantes ou en double dans les listes
- Mettre en valeur automatiquement le tag de la relation principale (le ship) d'une fic, sans avoir à le choisir soi-même
- Un mode où le nom complet d'un avertissement apparaît seulement au survol, plutôt que d'être toujours affiché
- Créer ses propres badges d'avertissement personnalisés, en plus des catégories déjà prévues
- Exporter ou importer sa liste de mots "bruit" personnalisés dans un fichier
- Des jeux de couleurs prêts à l'emploi (pastel, néon, classique) pour surligner les tags, au lieu de choisir chaque couleur soi-même
- Utiliser des motifs (comme des jokers) pour surligner plusieurs tags similaires d'un coup
- Exporter/importer ses règles de surlignage de tags, et choisir laquelle gagne quand plusieurs s'appliquent au même tag
- Filtrer quels types de tags sont affichés (par exemple cacher les tags libres mais garder les personnages)
- Choisir son propre séparateur entre les tags affichés

## Explicitement écarté

- Regrouper les tags par catégorie AO3 directement sur les listes (fandom, personnages, relations...) — abandonné, car repérer fiablement la catégorie de chaque tag s'est révélé trop compliqué et donnait des résultats peu fiables
- Afficher l'identifiant technique (ID) des tags sur la page — jugé utile seulement pour les développeurs, pas pour les lecteurs
- Afficher des jauges d'intensité (niveau de sexe, de violence, de tristesse...) à côté de la note officielle AO3, ou remplacer l'affichage de la note par des icônes maison — écarté pour des raisons éthiques, ça ne respecterait pas le choix de classification fait par l'auteur, et deviner ces niveaux serait trop subjectif
- Faire écrire les définitions des tags par la communauté des utilisateurs — jugé trop ambitieux pour ce module

## Précision

⚠️ La doc historique anglaise décrivait `tagsReordering.js` et
`tagsVisibility.js` comme des stubs vides ("planned, not implemented"). Ce
n'est plus le cas : les deux sont aujourd'hui pleinement codés dans ce
module.
