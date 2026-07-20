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
| `nopeWholeWords` | désactivé | Ne reconnaît un mot interdit que s'il est entier ("art" ≠ "heart") |
| `tagMatchMode` | `exact` | Correspondance des tags : exacte, ou "le tag contient le texte" |
| `dimOpacity` | `25` | Opacité (%) des fics atténuées |
| `dimBlur` | désactivé | Floute en plus le contenu des fics atténuées |
| `protectBookmarked` | désactivé | Ne cache jamais les fics enregistrées dans Bookmark Vault |
| `hideNoiseTaggedWorks` | désactivé | Cache les fics portant un tag "bruit" détecté par Tags Display |
| `quickAddIcon` | activé | Icône 🚫 au survol d'un tag, pour l'ajouter rapidement à la liste noire (Shift+clic : caché seulement pour la journée) |
| `showHiddenCounter` | activé | Affiche un bandeau "X fics cachées" au-dessus des résultats, avec un bouton "↻ Re-scan" |

## Fichiers

### 1. `_hideByTags.js` — le chef d'orchestre

- Met en route les trois autres fichiers de fonctionnalités (`hiddenTags`, `whitelistExceptions`, `nopeWords`, importés directement comme modules ES)
- Revérifie toutes les fics affichées à chaque changement de page
- Se coordonne avec le module Notes pour les fics cachées par une note externe
- Gère les masquages temporaires et le compteur de fics cachées
- Sert de point d'entrée unique pour le reste d'AO3 Helper

### 2. `hiddenTags.js` — liste noire de tags

- Garde en mémoire la liste des tags à cacher (clé `ao3h:hideByTags:list`), avec la possibilité de les regrouper par thème
- Canonicalise et compare les tags pour détecter la présence d'un tag interdit
- Ajoute une icône 🚫 au survol d'un tag pour l'ajouter en un clic à la liste noire (ou Alt+clic)
- Replie les fics cachées derrière un petit bandeau cliquable
- Un gestionnaire complet (recherche, groupes, export/import) accessible depuis un menu
- Fournit les informations de masquage ensuite utilisées par `whitelistExceptions.js`

### 3. `whitelistExceptions.js` — exceptions

- Une liste de tags (clé `ao3h:hideByTags:whitelist`) qui "sauvent" une fic même si elle contient aussi un tag de la liste noire — n'intervient qu'après qu'un motif de masquage a déjà été détecté par `hiddenTags.js`
- Affiche un badge 🟢 indiquant quel tag de la liste blanche a sauvé la fic et pourquoi elle est quand même visible
- Un bouton pour la cacher quand même, juste pour cette fois — n'enlève pas le tag de la liste blanche ni ne modifie les réglages permanents, ça s'applique seulement à cette fic dans le contexte actuel

### 4. `nopeWords.js` — filtre de mots-clés

- Cherche des mots ou expressions interdits (clé `ao3h:hideByTags:nope`) dans le résumé, les notes d'auteur ou le titre (au choix)
- Cache les fics qui contiennent un de ces mots, même si aucun tag ne le couvre — fonctionne en parallèle de `hiddenTags.js`, indépendamment des tags

### Compteur de fics cachées — intégré à `_hideByTags.js`

- Compte les fics actuellement repliées ou atténuées sur la page
- Affiche (ou retire) un petit bandeau "🚫 X fics cachées" au-dessus des résultats
- Le bandeau porte un bouton "↻ Re-scan" pour revérifier la page sans la recharger

### Masquages du jour — intégrés à `_hideByTags.js`

- Garde les tags cachés temporairement (Shift+clic sur l'icône 🚫) avec leur heure d'expiration : la fin de la journée en cours
- Purge automatiquement les entrées expirées à chaque lecture

### 5. `hideByTags.css`

- Les styles visuels du gestionnaire, des groupes, du repli des fics, de la whitelist et des petits messages

## Détails techniques

- APIs natives du navigateur utilisées : `localStorage` et `MutationObserver`.
- Clés de stockage : `ao3h:hideByTags:list` (liste noire), `ao3h:hideByTags:whitelist` (liste blanche), `ao3h:hideByTags:nope` (mots interdits).

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Un compteur visible qui dit "X fics cachées à cause de la liste noire de tags", affiché au-dessus des résultats~~ ✅
  Fait : bandeau "🚫 X fics cachées" injecté au-dessus de `#main`, mis à jour
  à chaque passage de `processList()` ; réglage `showHiddenCounter` pour le
  désactiver.

- ~~Voir en permanence, dans le menu de l'extension, combien de tags sont dans ta liste noire~~ ✅
  Fait (déjà présent, doc en retard) : les titres des sections du panneau
  affichent en permanence "X hidden", "X exceptions", "X words".

- ~~Un bouton pour tout effacer d'un coup dans la liste noire de tags~~ ✅
  Fait : bouton "Clear All" dans le gestionnaire de tags cachés (avec
  confirmation), vide aussi les groupes associés.

- ~~Choisir si un tag doit correspondre exactement ou juste "contenir" un morceau de texte — en ce moment c'est toujours une correspondance exacte~~ ✅
  Fait : réglage `tagMatchMode` (exact / contient) dans le panneau, câblé
  dans `reasonsFor()`. Le choix par tag individuel n'a pas été retenu (une
  entrée "contient" globale suffit, et le réglage par tag compliquerait le
  gestionnaire).

- ~~Reconnaître un mot interdit seulement quand c'est un mot entier, pas juste un bout caché dans un mot plus long~~ ✅
  Fait : réglage `nopeWholeWords` — "art" ne matche plus "heart".

- ~~Chercher avec des motifs compliqués comme des jokers ou des expressions techniques~~ ✅
  Fait : un mot interdit peut contenir `*` (joker) ou être écrit `/…/`
  (expression régulière, insensible à la casse ; un motif invalide retombe
  sans erreur sur la recherche de sous-chaîne).

- ~~Un masquage juste pour la journée, qui s'efface tout seul après~~ ✅
  Fait : Shift+clic sur l'icône 🚫 d'un tag le cache jusqu'à la fin de la
  journée, sans l'ajouter à la liste noire (`_hideByTags.js`).

- ~~Choisir à quel point une fic est rendue transparente quand elle est atténuée — en ce moment c'est toujours pareil pour tout le monde~~ ✅
  Fait : réglage `dimOpacity` (5–90 %), appliqué via une variable CSS.

- ~~Ajouter un effet flou en plus de la transparence~~ ✅
  Fait : réglage `dimBlur` — le contenu atténué est flouté (2.5px, le
  bandeau de raison reste net, le survol rétablit la lecture).

- ~~Cacher une fic seulement si plusieurs tags précis sont présents en même temps, pas juste un seul~~ ✅
  Fait : une entrée de la liste noire comme "tag A + tag B" ne cache une fic
  que si tous les tags de la combinaison sont présents (fonctionne aussi en
  mode "contient").

- ~~Un badge qui indique qu'un mot interdit a été trouvé sur une fic, en plus de la cacher ou l'atténuer~~ ✅
  Déjà couvert : le bandeau de repli affiche ⛔ "mot" en mode masquage, et le
  bandeau d'atténuation affiche "⛔ Soft-hidden — NOPE word: mot".

- ~~Toujours montrer les fics déjà mises en favori ou en bookmark, même si elles ont un tag dans la liste noire~~ ✅
  Fait : réglage `protectBookmarked` — les fics enregistrées dans Bookmark
  Vault (`ao3h:bookmarkVault:data`, le suivi local des favoris) ne sont
  jamais cachées ni atténuées.

- ~~Un bouton pour revérifier manuellement les mots interdits sur la page, sans avoir à la recharger~~ ✅
  Fait : bouton "↻ Re-scan" sur le bandeau compteur + commande de menu
  Tampermonkey "Re-scan page for hidden tags/words".

- ~~Cacher automatiquement une fic dès qu'un de ses tags a été repéré comme gênant par le module qui gère l'affichage des tags, sans avoir à l'ajouter soi-même à la liste noire~~ ✅
  Fait : réglage `hideNoiseTaggedWorks` — les fics portant un tag "bruit"
  (détection de Tags Display : motifs intégrés + mots personnalisés) sont
  cachées comme si le tag était en liste noire.

## Explicitement écarté

- Fusionner ce module avec `skipWorks` (le masquage manuel avec notes) — refusé, les deux ont des buts trop différents : ici c'est automatique selon des tags, `skipWorks` c'est manuel, fic par fic, avec une note personnelle
- Reconnaître automatiquement les tags qui veulent dire la même chose sur AO3 — écarté : AO3 n'expose pas les synonymes d'un tag sur les pages de listes, il faudrait une requête réseau par tag pour les découvrir (coûteux pour les serveurs et fragile) ; le mode "contient" et les groupes de tags couvrent déjà la plupart des variantes
- Ajouter un tag en cliquant n'importe où sur le résumé d'une fic — écarté : le résumé sert à lire, sélectionner du texte et suivre des liens ; un clic "n'importe où" provoquerait des ajouts accidentels, et on ne saurait pas quel tag ajouter ; l'icône 🚫 par tag (ou Alt+clic) reste le geste explicite
- Une liste de mots à éviter déjà toute prête par défaut — écarté : choisir à la place de l'utilisateur ce qui doit être filtré est un choix éditorial ; la liste doit rester personnelle (même logique de neutralité que les autres modules)
- Faire le lien entre des tags similaires (par exemple "Harry/Draco" et "Draco/Harry") en utilisant les groupes de tags équivalents d'un autre module — prévu avec `filterManager`, mais ce lien n'a jamais été branché dans le code
- Proposer des tags déjà connus pendant qu'on tape, pour aider à les ajouter plus vite
- Regrouper automatiquement plusieurs tags dans un thème tout fait (par exemple tous les tags "sombres" ensemble)
- Un mode où on ne voit QUE les fics avec certains mots ou tags, au lieu de les cacher
- Gérer la casse (majuscules/minuscules) pour les mots interdits
- Gérer la casse (majuscules/minuscules) pour les tags à bloquer
- Cacher un tag seulement sur certaines pages ou dans certaines situations précises, pas partout
- Partager sa liste de tags cachés avec d'autres personnes, ou utiliser une liste déjà faite par la communauté
- Un module à part juste pour cacher les crossovers automatiquement (en ce moment il faut ajouter soi-même le tag "Crossover" à la liste)
- Choisir un autre format que JSON pour exporter/importer ses listes
