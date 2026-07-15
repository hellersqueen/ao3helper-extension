# hideByTags

**Tab:** Browse

## À quoi ça sert

Ce module cache (ou atténue) les fics qui contiennent des tags que tu ne
veux pas voir, avec un système d'exceptions et un filtre de mots-clés en
texte libre pour couvrir ce que les tags ne couvrent pas.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `hideMode` | `hide` | Comment cacher un tag interdit : repli complet, ou juste une opacité réduite |
| `whitelistEnabled` | activé | Active les exceptions |
| `showWhitelistBadge` | activé | Affiche un badge 🟢 sur les fics sauvées par une exception |
| `whitelistMode` | `show` | Affiche automatiquement la fic sauvée, ou la garde repliée avec une note |
| `textFilterEnabled` | activé | Active le filtre de mots-clés interdits |
| `nopeHideMode` | `hide` | Comment cacher un mot interdit : repli complet, ou juste une opacité réduite |
| `nopeTargetSummaries` | activé | Cherche les mots interdits dans les résumés |
| `nopeTargetNotes` | activé | Cherche les mots interdits dans les notes d'auteur |
| `nopeTargetTitles` | désactivé | Cherche les mots interdits dans les titres |
| `quickAddIcon` | activé | Icône 🚫 au survol d'un tag, pour l'ajouter rapidement à la liste noire |

## Fichiers

### 1. `_hideByTags.js` — le chef d'orchestre

- Met en route les trois autres fichiers de fonctionnalités
- Revérifie toutes les fics affichées à chaque changement de page
- Se coordonne avec le module Notes pour les fics cachées par une note externe

### 2. `hiddenTags.js` — liste noire de tags

- Garde en mémoire la liste des tags à cacher, avec la possibilité de les regrouper par thème
- Ajoute une icône 🚫 au survol d'un tag pour l'ajouter en un clic à la liste noire (ou Alt+clic)
- Replie les fics cachées derrière un petit bandeau cliquable
- Un gestionnaire complet (recherche, groupes, export/import) accessible depuis un menu

### 3. `whitelistExceptions.js` — exceptions

- Une liste de tags qui "sauvent" une fic même si elle contient aussi un tag de la liste noire
- Affiche un badge 🟢 qui explique pourquoi la fic est quand même visible
- Un bouton pour la cacher quand même, juste pour cette fois

### 4. `nopeWords.js` — filtre de mots-clés

- Cherche des mots ou expressions interdits dans le résumé, les notes d'auteur ou le titre (au choix)
- Cache les fics qui contiennent un de ces mots, même si aucun tag ne le couvre

### 5. `hideByTags.css`

- Les styles visuels du gestionnaire, des groupes, du repli des fics, de la whitelist et des petits messages

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Un compteur visible qui dit "X fics cachées à cause de la liste noire de tags", affiché au-dessus des résultats
- Voir en permanence, dans le menu de l'extension, combien de tags sont dans ta liste noire
- Un bouton pour tout effacer d'un coup dans la liste noire de tags
- Choisir si un tag doit correspondre exactement ou juste "contenir" un morceau de texte — en ce moment c'est toujours une correspondance exacte
- Reconnaître automatiquement les tags qui veulent dire la même chose sur AO3, pour ne pas avoir à tous les ajouter un par un
- Faire le lien entre des tags similaires (par exemple "Harry/Draco" et "Draco/Harry") en utilisant les groupes de tags équivalents d'un autre module — prévu avec `filterManager`, mais ce lien n'est pas branché dans le code en ce moment
- Proposer des tags déjà connus pendant qu'on tape, pour aider à les ajouter plus vite
- Reconnaître un mot interdit seulement quand c'est un mot entier, pas juste un bout caché dans un mot plus long
- Chercher avec des motifs compliqués comme des jokers ou des expressions techniques
- Regrouper plusieurs tags dans un thème tout fait automatiquement (par exemple tous les tags "sombres" ensemble)
- Un mode où on ne voit QUE les fics avec certains mots ou tags, au lieu de les cacher
- Un masquage juste pour la journée, qui s'efface tout seul après
- Partager sa liste de tags cachés avec d'autres personnes, ou utiliser une liste déjà faite par la communauté
- Un module à part juste pour cacher les crossovers automatiquement (en ce moment il faut ajouter soi-même le tag "Crossover" à la liste)
- Choisir un autre format que JSON pour exporter/importer ses listes
- Ajouter un tag en cliquant n'importe où sur le résumé d'une fic, pas seulement sur le tag
- Choisir à quel point une fic est rendue transparente quand elle est atténuée — en ce moment c'est toujours pareil pour tout le monde
- Ajouter un effet flou en plus de la transparence
- Faire la différence entre majuscules et minuscules dans les tags à bloquer
- Cacher une fic seulement si plusieurs tags précis sont présents en même temps, pas juste un seul
- Cacher un tag seulement sur certaines pages ou dans certaines situations précises, pas partout
- Une liste de mots à éviter déjà toute prête par défaut, en plus de celle qu'on construit soi-même
- Un badge qui indique qu'un mot interdit a été trouvé sur une fic, en plus de la cacher ou l'atténuer
- Toujours montrer les fics déjà mises en favori ou en bookmark, même si elles ont un tag dans la liste noire
- Faire la différence entre majuscules et minuscules pour les mots interdits (en ce moment ce n'est prévu que pour les tags, pas pour les mots)
- Un bouton pour revérifier manuellement les mots interdits sur la page, sans avoir à la recharger
- Cacher automatiquement une fic dès qu'un de ses tags a été repéré comme gênant par le module qui gère l'affichage des tags, sans avoir à l'ajouter soi-même à la liste noire

## Explicitement écarté

- Fusionner ce module avec `skipWorks` (le masquage manuel avec notes) — refusé, les deux ont des buts trop différents : ici c'est automatique selon des tags, `skipWorks` c'est manuel, fic par fic, avec une note personnelle
