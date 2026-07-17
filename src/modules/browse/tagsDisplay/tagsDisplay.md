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

- Surligne en couleur les tags que l'utilisateur a choisis comme favoris, y compris les tags de fandom
- Un clic droit sur un tag ouvre un petit menu pour choisir une couleur parmi 6 et l'ajouter tout de suite
- Reprend aussi, une seule fois au démarrage, les fandoms mis en valeur par l'ancien module fandomHighlighting (appearance/visualPreferences), fusionné ici

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



AO3 Helper - Tags Display Module Coordinator
    Module ID: tagsDisplay
    Display Name: Tags Display
    Tab: Browse

    Submodules (Tier 2 — imported by this coordinator, self-register with
    parent: 'tagsDisplay', then boot automatically through the cascade logic
    built into core/lifecycle.js's bootOne()):
        1. archiveWarningsDisplay — compact icons for archive warnings
        2. autoHideNoiseTags      — hides self-deprecating freeform tags
        3. compactMode            — collapses tags/summaries, expand on hover
        4. tagHighlighting        — highlight favourite tags by pattern
        5. tagsReordering         — drag-and-drop reorder tags on work pages
        6. tagsVisibility         — truncate long tag lists on listing pages

    Settings (synced from panel → Flags before cascade):
        autoHideNoiseTags    bool   → mod:tagsDisplay:autoHideNoiseTags
        compactMode          bool   → mod:tagsDisplay:compactMode
        highlightFavoriteTags bool  → mod:tagsDisplay:highlightFavoriteTags
        highlightColor       int    → mod:tagsDisplay:highlightColor
        archiveWarningsStyle string → mod:tagsDisplay:archiveWarningsStyle
        maxTagsVisible       int    → mod:tagsDisplay:maxTagsVisible

    Storage key: mod:tagsDisplay:settings (JSON, written by panel)




    AO3 Helper - Archive Warnings Display Submodule
    Submodule ID: archiveWarningsDisplay
    Parent: tagsDisplay
    Display Name: Archive Warnings Display

    Replaces verbose AO3 archive warning text with compact, recognizable icons.
    This is a UX polish feature for faster scanning, not a filtering system.

    Features:
      - compactWarnings  : replace warning text with icons (master toggle)
      - archiveWarningsStyle : 'icon' | 'text' | 'badge' (default: 'icon')

    Fixed icon set (not customizable):
        ⚠️  Graphic Depictions Of Violence
        💀  Major Character Death
        🚫  Underage
        ⛔  Rape/Non-Con
        ❓  Creator Chose Not To Use Archive Warnings (always full text)
        ✓   No Archive Warnings Apply

    Accessibility: aria-label + title + tabindex=0 on every icon.
    MutationObserver: scans new nodes added to #main.



    AO3 Helper - Auto Hide Noise Tags Submodule
    Submodule ID: autoHideNoiseTags
    Parent: tagsDisplay
    Display Name: Auto Hide Noise Tags

    Hides self-deprecating / low-signal freeform tags automatically.
    Uses substring matching against a fixed default pattern list.
    Tags are hidden (display:none on the parent <li>) and can be restored.

    Features:
      - autoHideNoiseTags : master toggle (default: false)

    DOM side-effects:
      - Class `ao3h-noise-tag-hidden` on the <li> wrapping a matched tag
      - Attribute `data-ao3h-noise-checked` on each scanned <a> tag
      - Class `ao3h-noise-filter-on` on <html> while active

    MutationObserver: watches #main for new blurbs.


    AO3 Helper - Compact Mode Tags Submodule
    Submodule ID: compactMode
    Parent: tagsDisplay
    Display Name: Compact Mode

    Collapses tags and summaries in work listings. On hover, they expand
    smoothly via CSS transition. Pure CSS solution — no DOM mutation needed.

    Features:
      - compactMode : master toggle (default: false)

    DOM side-effects:
      - Class `ao3h-compact-mode-on` on <html> while active
      - CSS rules live in tagsDisplay.css (scoped to .ao3h-compact-mode-on)

    CSS behaviour:
      - Collapsed: max-height 0, opacity 0.3, overflow hidden
      - Expanded (hover): max-height 500px, opacity 1, 0.3s ease



         AO3 Helper — Tag Highlighting Submodule
   Submodule ID : tagHighlighting
   Parent        : tagsDisplay

   What it does:
     On listing pages, highlights tags the user has marked as "favourites".
     Favourite tags are stored in localStorage as an array of
     { pattern, color } objects.  Colour is one of 6 presets defined
     in the panel config.

   Settings (from tagsDisplay config.js):
     highlightFavoriteTags — master toggle (default true)

   Storage:
     ao3h:tagHighlights — JSON array [{ pattern: "Enemies to Lovers", color: "#fef08a" }, …]

   Quick-add:
     Right-click a tag → small context menu "Highlight this tag" with colour swatches.

   Fusionné avec l'ex-fandomHighlighting (appearance/visualPreferences) —
   shared.md, décision produit K4 : les deux modules surlignaient des tags
   favoris par correspondance de texte, avec deux stockages et deux UX
   (fandomHighlighting était console-only, sans entrée dans le panneau).
   Le sélecteur couvre désormais aussi les tags de fandom, et les entrées de
   l'ancienne clé ao3h:fandomHighlights sont importées une seule fois vers
   ao3h:tagHighlights au premier démarrage après mise à jour.
   ⚠️ Non testé en conditions réelles sur AO3.



   AO3 Helper - Tags Reordering Submodule
    Submodule ID: tagsReordering
    Parent: tagsDisplay
    Display Name: Tags Reordering

    On work pages, lets the user drag-and-drop tags within each tag category
    (fandom, character, relationship, freeform). Order is persisted per-work
    in localStorage and restored on next visit. A "Reset order" button appears
    when a saved order exists.

    Features:
      - tagsReordering : master toggle (default: false)

    Storage keys (per work × tag type):
      ao3h:tagsDisplay:order:[workId]:[tagType]  — array of tag names, in order

    Utilise lib/ui/drag-reorder.js (makeListReorderable) — fusionné avec
    l'implémentation de ficActions (shared.md, T1). Le bouton "Reset order"
    a nécessité d'étendre la lib avec cleanup.resetToOriginal().
    ⚠️ Non testé en conditions réelles sur AO3. La clé de stockage garde le
    même nom mais change de format (index numériques → noms de tags) ; un
    ordre déjà sauvegardé par un utilisateur ne sera pas retrouvé une fois
    (retombe sur l'ordre par défaut, pas de casse).



    AO3 Helper - Tags Visibility Submodule
    Submodule ID: tagsVisibility
    Parent: tagsDisplay
    Display Name: Tags Visibility

    On listing pages, truncates long tag lists to a configurable maximum
    (default 5). Hidden tags are the lowest-priority ones first
    (freeforms before characters, characters before relationships, etc.).
    A "+N more tags" button reveals them; "– Show less" collapses again.

    Features:
      - tagsVisibility  : master toggle (default: false)
      - maxTagsVisible  : number of tags to show per blurb (default: 5)

    MutationObserver: watches #main for newly added blurbs.


    
═══════════════════════════════════════════════════════════════════════════
  # tagsDisplay
  **Tab :** Browse
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Tags Display** regroupe plusieurs améliorations indépendantes destinées à rendre les tags d'AO3 plus lisibles, plus compacts et plus faciles à manipuler.

Il permet notamment de :

- remplacer les avertissements AO3 par des icônes plus lisibles ;
- masquer automatiquement les tags peu utiles ;
- afficher les tags en mode compact ;
- mettre en évidence les tags favoris ;
- réorganiser les tags d'une œuvre par glisser-déposer ;
- masquer les tags excédentaires sur les listes de fics.

Toutes ces fonctionnalités sont indépendantes et peuvent être activées ou désactivées séparément.

---

# Réglages utilisateur

| Réglage | Défaut | Description |
|----------|--------|-------------|
| `archiveWarningsStyle` | `badge` | Définit le style d'affichage des avertissements (icône, texte abrégé ou badge). |
| `compactWarnings` | Activé | Active l'affichage des avertissements sous forme d'icônes. |
| `autoHideNoiseTags` | Désactivé | Masque automatiquement certains tags considérés comme du bruit. |
| `compactMode` | Désactivé | Réduit la hauteur des tags et des résumés jusqu'au survol. |
| `highlightFavoriteTags` | Activé | Met en évidence les tags favoris. |
| `highlightColor` | Jaune | Couleur utilisée par défaut lors d'un surlignage rapide. |
| `maxTagsVisible` | `0` | Nombre maximum de tags affichés avant de masquer les suivants (`0` = tous). |

---

# Structure du module

Le module est composé de six sous-modules fonctionnels ainsi qu'une feuille de style.

```
_tagsDisplay.js
archiveWarningsDisplay.js
autoHideNoiseTags.js
compactModeTags.js
tagHighlighting.js
tagsReordering.js
tagsVisibility.js
tagsDisplay.css
```

---

# _tagsDisplay.js

## Rôle

Fichier coordinateur du module.

Il initialise l'ensemble des sous-modules, synchronise leurs réglages et sert de point d'entrée unique pour toutes les fonctionnalités liées à l'affichage des tags.

## Responsabilités

- Initialise les six sous-modules.
- Synchronise les réglages provenant du panneau de configuration.
- Distribue les paramètres aux différents sous-modules.
- Coordonne leur démarrage via le système de lifecycle d'AO3 Helper.

## Fonctions exposées

Le coordinateur :

- initialise le module ;
- transmet les réglages utilisateur ;
- assure la communication avec le reste de l'extension.

---

# archiveWarningsDisplay.js

## Rôle

Remplace les longs avertissements AO3 par une représentation plus compacte afin de rendre les listes de fics plus faciles à parcourir.

Cette fonctionnalité améliore uniquement la lisibilité et ne modifie jamais les avertissements eux-mêmes.

---

## Fonctionnalités

### Affichage compact

Le module remplace les avertissements standards par des représentations plus courtes.

Trois modes d'affichage sont disponibles :

- Icône seule
- Texte abrégé
- Badge (icône + texte)

Le style est contrôlé par le réglage :

`archiveWarningsStyle`

---

### Jeu d'icônes

Les avertissements utilisent un ensemble fixe d'icônes :

| Avertissement | Icône |
|---------------|-------|
| Graphic Depictions of Violence | ⚠️ |
| Major Character Death | 💀 |
| Underage | 🚫 |
| Rape / Non-Con | ⛔ |
| No Archive Warnings Apply | ✓ |

Le texte **Creator Chose Not To Use Archive Warnings** reste toujours affiché en entier et n'est jamais remplacé par une icône.

---

### Activation

L'ensemble du système peut être activé ou désactivé grâce au réglage :

`compactWarnings`

Lorsque cette option est désactivée, AO3 retrouve immédiatement son affichage d'origine.

---

### Compatibilité avec le contenu dynamique

Le module détecte automatiquement les nouvelles œuvres ajoutées à la page et applique les icônes aux avertissements nouvellement insérés.

---

## Détails techniques

### Accessibilité

Chaque icône possède :

- un `aria-label` ;
- un attribut `title` ;
- un `tabindex="0"`.

---

### Observation du DOM

Le module utilise un `MutationObserver` afin de surveiller les nouveaux éléments ajoutés sous `#main`.

---

## Dépendances

Ce sous-module est initialisé par `_tagsDisplay.js`.

Il fonctionne indépendamment des autres systèmes d'affichage des tags.

---

# autoHideNoiseTags.js

## Rôle

Masque automatiquement certains tags libres qui apportent peu d'information à la recherche ou à la lecture.

Le module repose sur une liste prédéfinie d'expressions considérées comme du bruit.

---

## Fonctionnalités

### Détection automatique

Le module compare chaque tag libre à une liste d'environ vingt-cinq expressions connues.

Exemples :

- idk
- first fic pls be nice
- unbetaed

La détection repose sur une recherche par sous-chaîne.

---

### Masquage

Lorsqu'un tag correspond à la liste :

- son élément `<li>` est masqué ;
- les autres tags restent inchangés ;
- le filtrage est entièrement réversible.

---

### Activation

Le comportement est contrôlé par le réglage :

`autoHideNoiseTags`

Lorsque cette option est désactivée, tous les tags redeviennent immédiatement visibles.

---

### Compatibilité avec le contenu dynamique

Le module détecte automatiquement les nouvelles œuvres ajoutées aux listes et applique le filtrage sans rechargement de la page.

---

## Détails techniques

### Effets sur le DOM

Le module ajoute notamment :

- la classe `ao3h-noise-tag-hidden` sur les tags masqués ;
- l'attribut `data-ao3h-noise-checked` sur les tags déjà analysés ;
- la classe `ao3h-noise-filter-on` sur `<html>` lorsque le filtre est actif.

---

### Observation du DOM

Le module utilise un `MutationObserver` afin de surveiller les nouveaux blurbs ajoutés dans `#main`.

---

## Dépendances

Ce sous-module est initialisé par `_tagsDisplay.js`.

Il fonctionne indépendamment des autres fonctionnalités du module.


# compactModeTags.js

## Rôle

Réduit temporairement l'espace occupé par les tags et les résumés dans les listes d'œuvres.

Le contenu reste présent dans la page, mais il est replié jusqu'au passage de la souris.

---

## Fonctionnalités

### Mode compact

Lorsque le mode compact est activé :

- les listes de tags sont repliées ;
- les résumés sont repliés ;
- leur hauteur devient presque nulle ;
- leur opacité est réduite ;
- l'espace occupé par chaque œuvre diminue.

---

### Déploiement au survol

Lorsqu'un utilisateur passe la souris sur une œuvre :

- les tags réapparaissent ;
- le résumé se déploie ;
- la hauteur augmente progressivement ;
- l'opacité revient à la normale.

Le déploiement utilise une transition fluide.

---

### Activation

Le comportement est contrôlé par le réglage :

`compactMode`

Lorsque cette option est désactivée, les tags et les résumés retrouvent immédiatement leur affichage normal.

---

## Détails techniques

### Fonctionnement CSS

Le sous-module repose principalement sur des règles CSS et ne modifie pas directement la structure du DOM.

Lorsque le mode est actif, la classe suivante est ajoutée à l'élément `<html>` :

`ao3h-compact-mode-on`

Les règles CSS associées sont définies dans `tagsDisplay.css`.

---

### État replié

Les éléments repliés utilisent notamment :

- `max-height: 0`
- `opacity: 0.3`
- `overflow: hidden`

---

### État déployé

Au survol, les éléments utilisent notamment :

- `max-height: 500px`
- `opacity: 1`
- une transition de `0.3s ease`

---

## Dépendances

Ce sous-module est initialisé par `_tagsDisplay.js`.

Il dépend de `tagsDisplay.css` pour l'ensemble de son comportement visuel.

---

# tagHighlighting.js

## Rôle

Met en évidence les tags que l'utilisateur considère comme favoris ou importants.

Le système fonctionne par correspondance de texte et prend également en charge les tags de fandom.

---

## Fonctionnalités

### Surlignage automatique

Le module analyse les tags affichés dans les listes d'œuvres.

Lorsqu'un tag correspond à une règle enregistrée :

- il reçoit une couleur de fond ;
- il devient plus facile à repérer ;
- le surlignage est appliqué automatiquement sur toutes les pages compatibles.

---

### Tags favoris

Les règles de surlignage sont enregistrées sous la forme suivante :

```js
{
  pattern: "Enemies to Lovers",
  color: "#fef08a"
}
```

Chaque règle contient :

- un motif de texte ;
- une couleur associée.

---

### Activation

Le comportement est contrôlé par le réglage :

`highlightFavoriteTags`

Lorsque cette option est désactivée, aucun surlignage n'est appliqué.

---

### Couleur par défaut

Le réglage :

`highlightColor`

détermine la couleur utilisée par défaut lors de l'ajout rapide d'un nouveau tag favori.

---

### Ajout rapide

Un clic droit sur un tag ouvre un petit menu contextuel.

Ce menu permet :

- de choisir une couleur parmi six couleurs prédéfinies ;
- d'ajouter immédiatement le tag à la liste des favoris ;
- d'appliquer le surlignage sans ouvrir le panneau de configuration.

---

### Prise en charge des fandoms

Le module s'applique également aux tags de fandom.

Cette fonctionnalité remplace l'ancien module `fandomHighlighting` provenant de `appearance/visualPreferences`.

Les deux systèmes remplissaient la même fonction, mais utilisaient auparavant :

- deux stockages différents ;
- deux interfaces différentes ;
- deux logiques de surlignage séparées.

Ils ont été fusionnés dans `tagHighlighting.js`.

---

### Migration des anciennes données

Lors du premier démarrage après la mise à jour, le module importe les anciennes données enregistrées sous la clé :

`ao3h:fandomHighlights`

Les données sont transférées vers :

`ao3h:tagHighlights`

Cette migration ne s'exécute qu'une seule fois.

---

## Détails techniques

### Stockage

Les règles sont enregistrées dans `localStorage` sous la clé :

`ao3h:tagHighlights`

Le format utilisé est un tableau JSON :

```js
[
  {
    pattern: "Enemies to Lovers",
    color: "#fef08a"
  }
]
```

---

### Correspondance

Le module applique les règles en comparant le texte des tags aux motifs enregistrés.

---

### État des tests

Le sous-module n'a pas encore été testé en conditions réelles sur AO3.

---

## Dépendances

Ce sous-module est initialisé par `_tagsDisplay.js`.

Il remplace également les responsabilités de l'ancien module `fandomHighlighting`.

# tagsReordering.js

## Rôle

Permet de réorganiser manuellement les tags d'une œuvre directement sur sa page grâce au glisser-déposer.

L'ordre choisi est enregistré individuellement pour chaque œuvre et est automatiquement restauré lors des prochaines visites.

---

## Fonctionnalités

### Réorganisation des tags

Le module permet de déplacer les tags à la souris.

Les tags peuvent être réorganisés indépendamment dans chacune des catégories AO3 :

- Fandoms
- Relationships
- Characters
- Freeform Tags

Chaque catégorie conserve son propre ordre.

---

### Glisser-déposer

Le système utilise un mécanisme de drag-and-drop permettant :

- de déplacer un tag ;
- de modifier sa position ;
- de mettre immédiatement l'affichage à jour.

Le comportement reste limité à la catégorie concernée : un tag ne peut pas être déplacé vers une autre catégorie.

---

### Sauvegarde automatique

Chaque modification est automatiquement enregistrée.

Le module mémorise :

- l'identifiant de l'œuvre ;
- la catégorie concernée ;
- le nouvel ordre des tags.

Cet ordre est automatiquement restauré lors des prochaines visites de la même œuvre.

---

### Réinitialisation

Lorsqu'un ordre personnalisé existe, un bouton :

**Reset order**

apparaît automatiquement.

Ce bouton :

- supprime l'ordre personnalisé ;
- restaure immédiatement l'ordre original d'AO3.

---

### Persistance

Chaque œuvre possède son propre ordre personnalisé.

Modifier les tags d'une œuvre n'a aucun effet sur les autres œuvres.

---

## Détails techniques

### Stockage

Les données sont enregistrées dans `localStorage` avec une clé construite selon le format :

```
ao3h:tagsDisplay:order:[workId]:[tagType]
```

Chaque entrée contient un tableau de noms de tags dans leur nouvel ordre.

---

### Bibliothèque partagée

Le module utilise :

`lib/ui/drag-reorder.js`

et plus précisément :

`makeListReorderable()`

La fonctionnalité **Reset order** a nécessité l'ajout de :

`cleanup.resetToOriginal()`

dans cette bibliothèque partagée.

---

### Migration

Les anciennes sauvegardes utilisaient des index numériques.

Le nouveau système enregistre directement les noms des tags.

Conséquence :

- les anciens ordres personnalisés ne sont pas récupérés après la mise à jour ;
- les utilisateurs retrouvent simplement l'ordre par défaut une seule fois.

Aucune donnée critique n'est perdue.

---

### État des tests

Le sous-module n'a pas encore été testé en conditions réelles sur AO3.

---

## Dépendances

Ce sous-module est initialisé par `_tagsDisplay.js`.

Il repose sur la bibliothèque partagée `drag-reorder.js` pour l'ensemble des opérations de glisser-déposer.

---

# tagsVisibility.js

## Rôle

Réduit automatiquement la longueur des listes de tags sur les pages contenant de nombreuses œuvres.

Lorsque le nombre de tags dépasse une limite définie par l'utilisateur, les moins importants sont masqués afin de conserver des listes plus compactes.

---

## Fonctionnalités

### Limitation du nombre de tags

Le module peut limiter le nombre de tags affichés pour chaque œuvre.

Le nombre maximal est défini par le réglage :

`maxTagsVisible`

Les valeurs proposées sont notamment :

- 0 (tous les tags)
- 5
- 10
- 15

---

### Priorité des tags

Lorsque tous les tags ne peuvent pas être affichés, le module masque les catégories dans l'ordre suivant :

1. Freeform Tags
2. Characters
3. Relationships
4. Archive Warnings

Les informations jugées les plus importantes restent donc visibles le plus longtemps possible.

---

### Affichage du bouton

Lorsque des tags sont masqués, un bouton apparaît automatiquement.

Le bouton affiche :

```
+N more tags
```

où **N** représente le nombre de tags actuellement cachés.

---

### Déploiement

Un clic sur :

```
+N more tags
```

affiche immédiatement tous les tags.

Le bouton devient alors :

```
– Show less
```

qui permet de revenir à l'affichage compact.

---

### Compatibilité avec le contenu dynamique

Le module détecte automatiquement les nouvelles œuvres ajoutées dans les listes.

Les nouvelles œuvres reçoivent automatiquement le même traitement sans rechargement de la page.

---

## Détails techniques

### Activation

Le comportement est contrôlé par deux réglages :

- `tagsVisibility`
- `maxTagsVisible`

---

### Observation du DOM

Le module utilise un `MutationObserver` afin de surveiller les nouveaux blurbs ajoutés sous `#main`.

---

### État du projet

La documentation historique indiquait que ce sous-module était uniquement prévu mais non implémenté.

Ce n'est plus le cas.

Le module est désormais entièrement développé et fonctionnel.

---

## Dépendances

Ce sous-module est initialisé par `_tagsDisplay.js`.

Il fonctionne indépendamment des autres systèmes d'affichage des tags.

# tagsDisplay.css

## Rôle

Contient l'ensemble des styles utilisés par le module **Tags Display**.

Il définit notamment l'apparence :

- des icônes d'avertissements ;
- du mode compact ;
- des tags surlignés ;
- des éléments réorganisables ;
- des boutons permettant d'afficher ou masquer les tags.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou documentées ailleurs dans le projet, mais ne disposent pas encore d'une implémentation complète.

---

## Archive Warnings

### Gravité des avertissements

Attribuer automatiquement une couleur différente selon la gravité d'un avertissement.

> Fonctionnalité volontairement abandonnée afin de conserver une présentation neutre des avertissements AO3.

---

### Confirmation avant ouverture

Afficher une fenêtre de confirmation avant l'ouverture d'une œuvre contenant certains avertissements sensibles.

---

### Affichage au survol

Permettre d'afficher uniquement une icône, puis le nom complet de l'avertissement au passage de la souris.

---

### Badges personnalisés

Permettre à l'utilisateur de créer ses propres badges d'avertissements.

---

## Noise Tags

### Liste personnalisée

Permettre à l'utilisateur de définir lui-même les expressions considérées comme du bruit.

Les fonctionnalités prévues comprennent :

- l'ajout de nouvelles expressions ;
- plusieurs niveaux de gravité ;
- des règles différentes selon l'auteur de la fic.

---

### Réaffichage individuel

Permettre de réafficher un tag masqué sans désactiver complètement le filtre.

---

### Liste communautaire

Partager ou récupérer des listes de tags "bruit" créées par d'autres utilisateurs.

---

### Exportation

Exporter ou importer une liste personnalisée de tags "bruit".

---

## Compact Mode

### Repli par catégorie

Permettre de replier séparément :

- les fandoms ;
- les relations ;
- les personnages ;
- les tags libres.

---

### Déploiement sélectif

Choisir quelles catégories doivent être agrandies automatiquement.

---

### Déploiement automatique

Déplier automatiquement les tags d'une œuvre lorsqu'elle apparaît à l'écran pendant le défilement.

---

### Raccourci clavier

Ajouter un raccourci clavier permettant de plier ou déplier instantanément les tags.

---

### Mémorisation

Conserver l'état (replié ou déplié) d'une œuvre entre deux visites.

---

### Aperçu rapide

Afficher le contenu des tags masqués dans une infobulle sans devoir les déplier complètement.

---

## Tag Highlighting

### Styles avancés

Ajouter d'autres styles de mise en évidence :

- gras ;
- italique ;
- bordure ;
- symbole devant le tag.

---

### Palettes prédéfinies

Proposer plusieurs jeux de couleurs prêts à l'emploi.

Exemples :

- Pastel
- Néon
- Classique

---

### Correspondances avancées

Utiliser des motifs (wildcards) afin de surligner plusieurs variantes d'un même tag.

---

### Import / Export

Exporter ou importer les règles de surlignage.

---

### Priorité des règles

Définir quelle règle est prioritaire lorsque plusieurs correspondent au même tag.

---

## Informations sur les tags

### Tag officiel

Différencier visuellement :

- un tag officiel AO3 ;
- un synonyme ;
- une redirection.

Le tag officiel pourrait être affiché dans une infobulle.

---

### Informations supplémentaires

Afficher des informations sur le tag ou sur son wrangler.

---

### Relations entre tags

Afficher une carte reliant les tags proches ou similaires.

---

### Intégration avec la recherche

Créer un lien entre les tags mis en évidence et les outils de recherche d'AO3 Helper.

---

### Liens externes

Ajouter des liens directs vers des ressources telles que :

- Fanlore
- TV Tropes

---

## Tags Reordering

### Tri automatique

Proposer plusieurs méthodes de tri automatique :

- alphabétique ;
- importance ;
- longueur.

---

### Import / Export

Exporter ou importer les ordres personnalisés.

---

### Réorganisation multiple

Permettre de modifier simultanément l'ordre des tags sur plusieurs œuvres.

---

## Tags Visibility

### Filtrage des catégories

Permettre d'afficher ou masquer certaines catégories uniquement.

Exemples :

- masquer les Freeform Tags ;
- conserver uniquement les Characters.

---

### Séparateurs personnalisés

Permettre de choisir le séparateur utilisé entre les tags affichés.

---

## Gestion des fandoms

### Nettoyage automatique

Fusionner automatiquement les différentes variantes d'un même fandom afin d'améliorer la lisibilité.

---

### Relation principale

Mettre automatiquement en évidence le couple principal (ship principal) d'une œuvre.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Catégorisation des tags sur les listes

Le module ne tente pas de reconstruire les catégories AO3 (Fandom, Characters, Relationships, etc.) directement sur les pages de résultats.

Cette approche a été abandonnée car il était difficile d'identifier correctement chaque catégorie de manière fiable.

---

## Identifiants techniques

Les identifiants internes des tags AO3 ne sont pas affichés.

Cette information est principalement utile aux développeurs et n'apporte que peu d'intérêt aux lecteurs.

---

## Évaluation automatique du contenu

Le module ne tente pas d'évaluer automatiquement :

- le niveau de violence ;
- le niveau de sexualité ;
- l'intensité émotionnelle.

Cette approche a été écartée afin de respecter la classification choisie par les auteurs et d'éviter toute interprétation subjective.

---

## Définitions communautaires

Le module ne permet pas aux utilisateurs d'écrire des définitions collaboratives pour les tags.

Cette fonctionnalité a été jugée trop ambitieuse pour les objectifs du module.

---

## État du module

La documentation historique indiquait que `tagsReordering.js` et `tagsVisibility.js` étaient uniquement prévus mais non implémentés.

Ce n'est plus le cas.

Ces deux sous-modules sont désormais pleinement développés et intégrés au module **Tags Display**.



