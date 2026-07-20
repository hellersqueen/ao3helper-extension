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
| `archiveWarningsStyle` | `badge` | Comment les avertissements sont affichés : icône seule (avec nom complet au survol), texte abrégé, ou icône + texte |
| `compactWarnings` | activé | Active ou coupe complètement l'affichage des avertissements en icônes |
| `confirmSensitiveWarnings` | désactivé | Demande confirmation avant d'ouvrir une fic taguée Violence/MCD/Underage/Non-Con |
| `autoHideNoiseTags` | désactivé | Cache automatiquement les petits tags qui ne servent à rien (ex. "pls be nice") |
| `noiseTagStyle` | `hide` | `hide` (masquage complet) ou `blur` (flouté, cliquable pour révéler) |
| `tagExternalLinks` | désactivé | Ajoute des liens de recherche 📖 Fanlore / 🌀 TV Tropes après chaque tag |
| `compactMode` | désactivé | Replie chaque catégorie de tags (+ le résumé) séparément, dépliée au survol |
| `compactCatWarnings`, `compactCatRelationships`, `compactCatCharacters`, `compactCatFreeforms`, `compactCatSummary` | activés | Quelles catégories participent au repli du mode compact — décochée = toujours affichée en entier |
| `compactModeAutoExpandScroll` | désactivé | Déplie automatiquement une fic dès qu'elle entre dans l'écran, sans survol |
| `highlightFavoriteTags` | activé | Surligne les tags favoris avec une couleur |
| `highlightColor` | Jaune | La couleur utilisée par défaut pour surligner un tag rapidement |
| `highlightPalette` | `default` | Jeu de couleurs pour le surlignage : `default`, `pastel`, `neon`, `classic` |
| `highlightStyle` | `fill` | Style visuel du surlignage : `fill` (fond plein), `border`, `bold`, `italic`, `symbol` (★) |
| `promoteHighlightedTags` | désactivé | Sur les listes, remonte les tags surlignés en tête de leur catégorie |
| `maxTagsVisible` | `0` (tous affichés) | Le nombre maximum de tags affichés par fic avant de cacher le reste (`0`, `5`, `10`, `15`) |
| `hideTagsWarnings`, `hideTagsRelationships`, `hideTagsCharacters`, `hideTagsFreeforms` | désactivés | Masquent une catégorie de tags en entier sur les listes, indépendamment de `maxTagsVisible` |
| `tagSeparator` | `", "` | Texte utilisé entre les tags affichés, à la place de la virgule AO3 par défaut |

## Fichiers

### 1. `archiveWarningsDisplay.js` — icônes pour les avertissements

- Remplace le texte long des avertissements par des icônes compactes (⚠️ Violence, 💀 MCD, 🚫 Underage, ⛔ Non-Con, ✓ No Warnings)
- Propose 3 styles d'affichage : icône seule (nom complet au survol via `title`), texte abrégé, ou icône + texte
- "Creator Chose Not To Use Archive Warnings" reste toujours écrit en entier, jamais remplacé par une icône
- Peut être complètement désactivé pour revenir au texte d'origine
- Demande confirmation avant d'ouvrir une œuvre taguée Violence/MCD/Underage/Non-Con si `confirmSensitiveWarnings` est activé (indépendant du reste : fonctionne même si les icônes sont désactivées) — logique de détection dans `archiveWarningsDisplay.js`
- Chaque icône porte un `aria-label`, un `title` et `tabindex="0"` pour rester accessible

### 2. `autoHideNoiseTags.js` — cacher les tags inutiles

- Repère et cache automatiquement les petits tags qui ne veulent rien dire (par exemple "idk", "first fic pls be nice", "unbetaed") — correspondance dans `noiseTagUtils.js`
- Compare chaque tag à une liste d'environ 25 expressions connues, plus les mots ajoutés par l'utilisateur (`noiseTagUtils.js`)
- Deux styles de masquage (`noiseTagStyle`) : caché complètement, ou flouté et cliquable pour révéler
- Chaque tag masqué peut être révélé individuellement via une puce "show hidden tag" (`autoHideNoiseTags.js`), avec un aperçu du texte caché au survol
- Les auteurs ajoutés à la liste d'exceptions gardent tous leurs tags visibles, même s'ils matchent une expression "bruit" (`autoHideNoiseTags.js`)

### 3. `compactModeTags.js` — mode compact

- Replie chaque catégorie de tags et le résumé séparément — `compactModeTags.js` décide lesquelles participent, selon les réglages `compactCat*`.
- Les fait réapparaître au survol/focus, à l'arrivée dans le viewport en scrollant (optionnel), ou toutes en même temps avec le raccourci **Alt+T** (`compactModeTags.js`) — ce dernier choix est mémorisé par page (URL)
- Ne change que l'apparence de la page (classes CSS + un peu de JS pour le raccourci et le scroll), pas la structure

### 4. `tagHighlighting.js` — surligner ses tags favoris

- Surligne en couleur les tags que l'utilisateur a choisis comme favoris, y compris les tags de fandom
- Un clic droit sur un tag ouvre un petit menu pour choisir une couleur parmi 6 et l'ajouter tout de suite
- Reprend aussi, une seule fois au démarrage, les fandoms mis en valeur par l'ancien module fandomHighlighting (appearance/visualPreferences), fusionné ici
- Les motifs supportent un joker `*` (ex. `"Alternate Universe -*"`) — la première règle qui correspond dans la liste gagne (`tagRules.js`)
- 4 palettes de couleurs prêtes à l'emploi et 5 styles visuels (fond plein/bordure/gras/italique/★) au lieu d'une seule couleur de fond (`tagHighlighting.js`)
- Export/import des règles en JSON, et un bouton pour lancer une recherche AO3 avec tous les tags surlignés (panneau de configuration)

### 5. `tagsReordering.js` — réordonner les tags à la souris

- Sur les pages d'œuvre, permet de glisser-déposer les tags pour changer leur ordre, catégorie par catégorie (fandom, personnages, relations, tags libres)
- Se souvient de l'ordre choisi pour chaque fic
- Un bouton "Reset order" apparaît pour remettre l'ordre d'origine si on a changé quelque chose
- 3 boutons de tri automatique par catégorie : alphabétique, par longueur, ou "★ Important first" (tags surlignés en premier) — logique dans `tagRules.js`
- Export/import de l'ordre complet d'une œuvre (toutes catégories) dans un fichier JSON
- Utilise `lib/ui/drag-reorder.js` (`makeListReorderable`), étendue avec `cleanup.resetToOriginal()` pour le bouton "Reset order"

### 6. `tagsVisibility.js` — cacher les tags en trop

- Sur les listes de fics, cache les tags en trop quand il y en a trop pour tenir sur une ligne
- Cache en priorité les tags les moins importants (tags libres avant personnages, avant relations, avant avertissements)
- Un bouton "+N more tags" permet de tout revoir, et "– Show less" de tout recacher
- Des catégories entières peuvent être masquées en permanence (indépendamment de la limite ci-dessus) via les réglages `hideTags*` — logique dans `tagRules.js`

### 7. `externalTagLinks.js` — liens externes depuis un tag

- Ajoute deux petites icônes de recherche après chaque tag : 📖 Fanlore et 🌀 TV Tropes (`externalTagLinks.js`)
- Purement additif : n'altère jamais le tag original, discret (opacité réduite) sauf au survol

### 8. `tagSeparatorStyle.js` — séparateur de tags personnalisé

- Remplace la virgule `", "` générée par AO3 (`.commas li::after`) par le texte choisi dans `tagSeparator`
- Ne s'active pas du tout si le séparateur choisi est celui par défaut (`tagSeparatorStyle.js`)

### 9. `tagImportancePromotion.js` — remonter les tags importants

- Sur les listes de fics, remonte les tags surlignés en tête de leur catégorie (un tag relation surligné reste parmi les relations, mais en premier) — réutilise `tagRules.js` et les règles de `tagHighlighting.js`
- L'ordre d'origine AO3 est mémorisé par liste de tags pour être restauré si la fonctionnalité est désactivée

## Specs non implémentés

Toutes les idées de cette liste ont été traitées : soit codées (✅, détails dans
la section Fichiers ci-dessus), soit déplacées dans « Explicitement écarté »
avec la raison. Gardée ici pour l'historique — voir "Fichiers" pour le détail
technique de chaque ✅.

- ~~Replier chaque catégorie de tags séparément~~ ✅ — `compactModeTags.js` (réglages `compactCat*`)
- ~~Remonter automatiquement les tags les plus importants en premier~~ ✅ — `tagImportancePromotion.js`
- ~~Flouter les tags "spoiler" au lieu de simplement les cacher~~ ✅ — `noiseTagStyle: 'blur'` dans `autoHideNoiseTags.js`
- ~~Choisir soi-même ses propres mots à considérer comme du "bruit"~~ ✅ — `noiseTagUtils.js`.
  **Pas fait** : les niveaux de gravité (jugé disproportionné pour ~25 mots-clés — voir plus bas)
- ~~Avoir des règles de masquage différentes selon l'auteur~~ ✅ *(scope réduit)* — implémenté comme une
  liste d'exceptions (`autoHideNoiseTags.js`) : un auteur ajouté garde tous ses tags visibles.
  Pas de générateur de règles complet (« masquer tel tag seulement pour tel auteur ») — l'exception
  couvre le cas d'usage réel (« ne jamais filtrer les tags de mes auteurs de confiance »).
- ~~Pouvoir réafficher un tag caché par le filtre anti-bruit, un par un, sans tout désactiver~~ ✅ — `autoHideNoiseTags.js`
- ~~Choisir d'agrandir seulement certains types de tags~~ ✅ — réglages `compactCat*` (décoché = jamais replié)
- ~~Agrandir automatiquement au scroll~~ ✅ — réglage `compactModeAutoExpandScroll`
- ~~Se souvenir si on avait déplié les tags sur une page précise~~ ✅ *(scope réduit)* — le raccourci
  Alt+T ("tout ouvrir") est mémorisé par page (URL) ; l'expansion au survol individuelle reste
  volontairement transitoire (elle n'a pas vocation à être "mémorisée", c'est un survol)
- ~~Un raccourci clavier pour plier/déplier les tags d'un coup~~ ✅ — **Alt+T** (`compactModeTags.js`)
- ~~Voir un aperçu du tag caché en survolant, sans tout déplier~~ ✅ — `title` sur la puce de réaffichage
- ~~Des styles de surlignage plus riches (gras, italique, bordure, symbole)~~ ✅ — réglage `highlightStyle`
- ~~Faire le lien entre la recherche et les tags mis en avant~~ ✅ *(scope réduit)* — bouton "Search AO3
  with these tags" dans le panneau, construit une recherche AO3 avec tous les tags surlignés
- ~~Des façons toutes faites de trier les tags (alphabétique, importance, longueur)~~ ✅ — boutons de tri dans `tagsReordering.js`
- ~~Sauvegarder/récupérer l'ordre des tags dans un fichier~~ ✅ — export/import JSON par œuvre.
  **Pas fait** : réordonner plusieurs fics d'un coup (voir "Explicitement écarté")
- Donner une couleur différente selon la gravité d'un avertissement — *volontairement pas fait, pour rester neutre*
- ~~Une fenêtre de confirmation avant d'ouvrir une fic avec un tag sensible~~ ✅ — réglage `confirmSensitiveWarnings`
- ~~Des liens vers des sites externes (TV Tropes, Fanlore) depuis un tag~~ ✅ — `externalTagLinks.js`
- ~~Un mode où le nom complet d'un avertissement apparaît seulement au survol~~ ✅ — c'est déjà le
  comportement du style `icon` existant (icône seule + `title` = nom complet natif du navigateur)
- ~~Exporter/importer sa liste de mots "bruit" personnalisés~~ ✅ — boutons Import/Export JSON
- ~~Des jeux de couleurs prêts à l'emploi (pastel, néon, classique)~~ ✅ — réglage `highlightPalette`
- ~~Utiliser des motifs (jokers) pour surligner plusieurs tags similaires~~ ✅ — joker `*` dans `tagRules.js`
- ~~Exporter/importer ses règles de surlignage, choisir laquelle gagne~~ ✅ — export/import JSON ;
  priorité = ordre du tableau, la première règle qui correspond gagne
- ~~Filtrer quels types de tags sont affichés~~ ✅ — réglages `hideTags*` dans `tagsVisibility.js`
- ~~Choisir son propre séparateur entre les tags affichés~~ ✅ — réglage `tagSeparator`

## Explicitement écarté

- Regrouper les tags par catégorie AO3 directement sur les listes (fandom, personnages, relations...) — abandonné, car repérer fiablement la catégorie de chaque tag s'est révélé trop compliqué et donnait des résultats peu fiables
- Afficher l'identifiant technique (ID) des tags sur la page — jugé utile seulement pour les développeurs, pas pour les lecteurs
- Afficher des jauges d'intensité (niveau de sexe, de violence, de tristesse...) à côté de la note officielle AO3, ou remplacer l'affichage de la note par des icônes maison — écarté pour des raisons éthiques, ça ne respecterait pas le choix de classification fait par l'auteur, et deviner ces niveaux serait trop subjectif
- Faire écrire les définitions des tags par la communauté des utilisateurs — jugé trop ambitieux pour ce module
- Niveaux de gravité pour les mots "bruit" personnalisés — jugé disproportionné : c'est un filtre pour ~25 expressions anodines ("idk", "pls be nice"), pas un système de modération ; un simple oui/non par mot suffit
- Voir en couleur si un tag est "officiel" ou une variante/synonyme, avec une bulle montrant le tag officiel — **pas possible sans requête réseau supplémentaire par tag** : AO3 n'expose pas ce statut sur les pages de listing ou d'œuvre, seulement sur ses pages de recherche/wrangling internes (`/tags/search`), qu'il faudrait interroger une par une
- Voir des informations ou statistiques sur la personne qui gère (wrangle) un tag — même limite : cette information n'est pas exposée publiquement sur les pages où le module s'exécute
- Voir une carte des liens entre tags proches ou similaires — nécessiterait une base de données de relations entre tags qui n'existe nulle part côté client ; hors de portée d'une extension de navigateur
- Signaler un tag "bruit" à la communauté, ou utiliser une liste "bruit" faite par d'autres utilisateurs — nécessiterait un serveur/backend partagé ; AO3 Helper reste une extension 100% côté client, sans service en ligne à elle
- Nettoyer et regrouper automatiquement les noms de fandoms en double ou en variantes — risque réel de fusionner par erreur des fandoms réellement différents (ex. deux adaptations distinctes d'une même œuvre) ; la correspondance de texte n'est pas assez fiable pour une action automatique et irréversible sur l'affichage
- Mettre en valeur automatiquement le tag de la relation "principale" (le ship) d'une fic — AO3 ne marque nulle part quelle relation est "principale" dans le HTML d'un blurb ; l'ordre des tags n'est pas garanti signifiant ; deviner serait souvent faux
- Créer ses propres badges d'avertissement personnalisés — les Archive Warnings sont une taxonomie officielle fixe d'AO3 ; laisser inventer de nouvelles catégories de badges brouillerait la frontière entre un avertissement officiel et une étiquette personnelle (même raisonnement éthique que les jauges d'intensité ci-dessus)
- Réordonner les tags de plusieurs fics d'un coup — pas de UI naturelle pour ça (l'ordre se choisit sur la page de l'œuvre elle-même, et chaque œuvre a des tags différents) ; l'export/import JSON par œuvre couvre déjà le besoin de sauvegarde/transfert

## Précision

⚠️ La doc historique anglaise décrivait `tagsReordering.js` et
`tagsVisibility.js` comme des stubs vides ("planned, not implemented"). Ce
n'est plus le cas : les deux sont aujourd'hui pleinement codés dans ce
module.

## Détails techniques

- Coordinateur : réglages synchronisés depuis le panneau sous la clé `mod:tagsDisplay:settings`
- `tagHighlighting.js` : règles stockées dans `ao3h:tagHighlights` (tableau `[{ pattern, color }]`) ; migration unique depuis l'ancienne clé `ao3h:fandomHighlights` (ex-module `fandomHighlighting`) au premier démarrage après mise à jour
- `tagsReordering.js` : ordre stocké sous `ao3h:tagsDisplay:order:[workId]:[tagType]` (tableau de noms de tags). Ancien format basé sur des index numériques remplacé par les noms des tags eux-mêmes : un ordre personnalisé sauvegardé avant cette migration n'est pas récupéré (repli silencieux sur l'ordre par défaut, aucune perte de données critique)
- Plusieurs sous-modules (`archiveWarningsDisplay.js`, `autoHideNoiseTags.js`, `tagsVisibility.js`) observent le contenu ajouté dynamiquement sous `#main` via `MutationObserver`, pour traiter les nouveaux blurbs sans recharger la page
