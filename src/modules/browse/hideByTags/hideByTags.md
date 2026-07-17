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

### 5. `hiddenCounter.js` — compteur de fics cachées

- Compte les fics actuellement repliées ou atténuées sur la page
- Affiche (ou retire) un petit bandeau "🚫 X fics cachées" au-dessus des résultats
- Le bandeau porte un bouton "↻ Re-scan" pour revérifier la page sans la recharger

### 6. `tempHides.js` — masquages du jour

- Garde les tags cachés temporairement (Shift+clic sur l'icône 🚫) avec leur heure d'expiration : la fin de la journée en cours
- Purge automatiquement les entrées expirées à chaque lecture

### 7. `hideByTags.css`

- Les styles visuels du gestionnaire, des groupes, du repli des fics, de la whitelist et des petits messages

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
  Fait : réglage `tagMatchMode` (exact / contient) dans le panneau.

- ~~Reconnaître un mot interdit seulement quand c'est un mot entier, pas juste un bout caché dans un mot plus long~~ ✅
  Fait : réglage `nopeWholeWords` — "art" ne matche plus "heart".

- ~~Chercher avec des motifs compliqués comme des jokers ou des expressions techniques~~ ✅
  Fait : un mot interdit peut contenir `*` (joker) ou être écrit `/…/`
  (expression régulière, insensible à la casse ; un motif invalide retombe
  sur la recherche simple).

- ~~Un masquage juste pour la journée, qui s'efface tout seul après~~ ✅
  Fait : Shift+clic sur l'icône 🚫 d'un tag le cache jusqu'à la fin de la
  journée, sans l'ajouter à la liste noire (`tempHides.js`).

- ~~Choisir à quel point une fic est rendue transparente quand elle est atténuée — en ce moment c'est toujours pareil pour tout le monde~~ ✅
  Fait : réglage `dimOpacity` (5–90 %).

- ~~Ajouter un effet flou en plus de la transparence~~ ✅
  Fait : réglage `dimBlur` — le contenu atténué est flouté (le bandeau de
  raison reste net, le survol rétablit la lecture).

- ~~Cacher une fic seulement si plusieurs tags précis sont présents en même temps, pas juste un seul~~ ✅
  Fait : une entrée de la liste noire comme "tag A + tag B" ne cache une fic
  que si tous les tags de la combinaison sont présents.

- ~~Un badge qui indique qu'un mot interdit a été trouvé sur une fic, en plus de la cacher ou l'atténuer~~ ✅
  Déjà couvert : le bandeau de repli affiche ⛔ "mot" en mode masquage, et le
  bandeau d'atténuation affiche "⛔ Soft-hidden — NOPE word: mot".

- ~~Toujours montrer les fics déjà mises en favori ou en bookmark, même si elles ont un tag dans la liste noire~~ ✅
  Fait : réglage `protectBookmarked` — les fics enregistrées dans Bookmark
  Vault (le suivi local des favoris) ne sont jamais cachées.

- ~~Un bouton pour revérifier manuellement les mots interdits sur la page, sans avoir à la recharger~~ ✅
  Fait : bouton "↻ Re-scan" sur le bandeau compteur + commande de menu
  Tampermonkey "Re-scan page for hidden tags/words".

- ~~Cacher automatiquement une fic dès qu'un de ses tags a été repéré comme gênant par le module qui gère l'affichage des tags, sans avoir à l'ajouter soi-même à la liste noire~~ ✅
  Fait : réglage `hideNoiseTaggedWorks` — les fics portant un tag "bruit"
  (détection de Tags Display : motifs intégrés + mots personnalisés) sont
  cachées comme si le tag était en liste noire.

---

~~- Faire le lien entre des tags similaires (par exemple "Harry/Draco" et "Draco/Harry") en utilisant les groupes de tags équivalents d'un autre module — prévu avec `filterManager`, mais ce lien n'est pas branché dans le code en ce moment~~
~~- Proposer des tags déjà connus pendant qu'on tape, pour aider à les ajouter plus vite~~
~~- Regrouper plusieurs tags dans un thème tout fait automatiquement (par exemple tous les tags "sombres" ensemble)~~
~~- Un mode où on ne voit QUE les fics avec certains mots ou tags, au lieu de les cacher~~
~~- Faire la différence entre majuscules et minuscules pour les mots interdits (en ce moment ce n'est prévu que pour les tags, pas pour les mots)~~
~~- Cacher un tag seulement sur certaines pages ou dans certaines situations précises, pas partout~~
~~- Faire la différence entre majuscules et minuscules dans les tags à bloquer~~
~~- Partager sa liste de tags cachés avec d'autres personnes, ou utiliser une liste déjà faite par la communauté~~
~~- Un module à part juste pour cacher les crossovers automatiquement (en ce moment il faut ajouter soi-même le tag "Crossover" à la liste)~~
~~- Choisir un autre format que JSON pour exporter/importer ses listes~~


## Explicitement écarté

- Fusionner ce module avec `skipWorks` (le masquage manuel avec notes) — refusé, les deux ont des buts trop différents : ici c'est automatique selon des tags, `skipWorks` c'est manuel, fic par fic, avec une note personnelle
- Reconnaître automatiquement les tags qui veulent dire la même chose sur AO3 — écarté : AO3 n'expose pas les synonymes d'un tag sur les pages de listes, il faudrait une requête réseau par tag pour les découvrir (coûteux pour les serveurs et fragile) ; le mode "contient" et les groupes de tags couvrent déjà la plupart des variantes
- Ajouter un tag en cliquant n'importe où sur le résumé d'une fic — écarté : le résumé sert à lire, sélectionner du texte et suivre des liens ; un clic "n'importe où" provoquerait des ajouts accidentels, et on ne saurait pas quel tag ajouter ; l'icône 🚫 par tag (ou Alt+clic) reste le geste explicite
- Une liste de mots à éviter déjà toute prête par défaut — écarté : choisir à la place de l'utilisateur ce qui doit être filtré est un choix éditorial ; la liste doit rester personnelle (même logique de neutralité que les autres modules)



AO3 Helper - Hide By Tags Module Coordinator
    Module ID: hideByTags
    Display Name: Hide By Tags
    Tab: Browse

    Submodules (imported directly as ES modules):
        1. hiddenTags          → ./hiddenTags.js
        2. nopeWords           → ./nopeWords.js
        3. whitelistExceptions → ./whitelistExceptions.js

    Storage keys:
        ao3h:hideByTags:list       — tag blacklist
        ao3h:hideByTags:whitelist  — whitelist tags
        ao3h:hideByTags:nope       — NOPE words


           AO3 Helper — HideByTags › HiddenTags sub-module
   Responsibilities:
     • Tag blacklist storage (get / set / add)
     • Group-map storage (get / set)
     • Tag canonicalisation & matching
     • Inline 🚫 icon injection on tag links
     • Hidden Tags Manager panel (open/close UI, export/import)

        AO3 Helper — HideByTags › NopeWords sub-module
   Responsibilities:
     • NOPE word list storage (get / set / add / remove)
     • Text-based matching against blurb content (summary, notes, title)
     • NOPE Words Manager panel (open/close UI, export/import)

        AO3 Helper — HideByTags › WhitelistExceptions sub-module
   Responsibilities:
     • Whitelist tag storage (get / set / add / remove)
     • Whitelist matching: given a blurb's tags + blacklist reasons, decide
       whether the work should be rescued and how to present it
     • Whitelist Manager panel (open/close UI, export/import)


     

═══════════════════════════════════════════════════════════════════════════
  # hideByTags
  **Tab :** Browse
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Hide By Tags** masque ou atténue automatiquement les œuvres contenant des tags ou des mots-clés que l'utilisateur ne souhaite pas voir.

* Il combine trois systèmes complémentaires :
  - une liste noire de tags ;
  - une liste blanche permettant de sauver certaines œuvres malgré la présence d'un tag interdit ;
  - un filtre de mots-clés capable d'analyser le contenu des blurbs lorsque les tags ne suffisent pas.

Le module permet également d'ajouter rapidement de nouveaux tags à la liste noire directement depuis les pages AO3.

---

# Réglages utilisateur

| Réglage               | Description                                                                                                     |
|-----------------------|-----------------------------------------------------------------------------------------------------------------|
| `hideMode`            |  Détermine si les œuvres sont complètement repliées ou simplement atténuées lorsqu'un tag interdit est trouvé.  |
| `whitelistEnabled`    | Active le système d'exceptions basé sur la liste blanche.                                                       |
| `showWhitelistBadge`  |  Affiche un badge 🟢 sur les œuvres sauvées par une exception.                                                 |
| `whitelistMode`       | Affiche automatiquement les œuvres sauvées ou les laisse repliées avec une indication.                          |
| `textFilterEnabled`   |  Active le filtre de mots-clés.                                                                                 |
| `nopeHideMode`        | Détermine le comportement lorsqu'un mot interdit est détecté.                                                   |
| `nopeTargetSummaries` | Analyse les résumés.                                                                                            |
| `nopeTargetNotes`     | Analyse les notes d'auteur.                                                                                     |
| `nopeTargetTitles`    | Analyse les titres des œuvres.                                                                                  |
| `quickAddIcon`        | Affiche une icône 🚫 au survol des tags afin de les ajouter rapidement à la liste noire.                       |

---

# Structure du module

Le module est composé de trois sous-modules fonctionnels ainsi qu'une feuille de style.

```
_hideByTags.js
hiddenTags.js
whitelistExceptions.js
nopeWords.js
hideByTags.css
```

---

# _hideByTags.js

## Rôle

Fichier coordinateur du module.

Il initialise les différents sous-modules, applique les règles de masquage aux œuvres affichées et coordonne les interactions entre les systèmes de liste noire, de liste blanche et de filtrage textuel.

## Responsabilités

- Initialise les trois sous-modules.
- Réanalyse les œuvres lorsqu'une nouvelle page ou de nouveaux blurbs apparaissent.
- Coordonne les décisions de masquage ou d'affichage.
- Communique avec le module de notes lorsque des œuvres sont déjà masquées par un autre système.
- Sert de point d'entrée unique pour le reste d'AO3 Helper.

## Fonctions exposées

Le coordinateur permet notamment :

- d'initialiser le système de filtrage ;
- de déclencher une nouvelle analyse des œuvres affichées ;
- de coordonner les différents systèmes de masquage ;
- de partager les fonctionnalités avec les autres modules.

---

# hiddenTags.js

## Rôle

Gère entièrement la liste noire de tags.

Le sous-module stocke les tags interdits, applique les règles de masquage, fournit les outils de gestion de la liste noire et permet d'ajouter rapidement de nouveaux tags directement depuis AO3.

---

## Fonctionnalités

### Liste noire de tags

Le module conserve la liste complète des tags à masquer.

Il permet notamment :

- d'ajouter un tag ;
- de supprimer un tag ;
- de modifier la liste ;
- d'organiser les tags par groupes.

Les données sont enregistrées sous la clé :

`ao3h:hideByTags:list`

---

### Gestion des groupes

Les tags peuvent être regroupés par catégories afin de faciliter leur organisation.

Le module permet :

- de créer des groupes ;
- de modifier leur contenu ;
- d'associer plusieurs tags à un même thème.

---

### Correspondance des tags

Avant toute comparaison, le module normalise les tags afin d'améliorer leur reconnaissance.

Il est responsable :

- de la canonicalisation des tags ;
- de leur comparaison avec ceux présents sur une œuvre ;
- de déterminer si un tag interdit est présent.

---

### Ajout rapide depuis AO3

Lorsque l'option est activée, une icône 🚫 apparaît au survol de chaque tag.

L'utilisateur peut :

- ajouter immédiatement le tag à la liste noire ;
- utiliser **Alt + clic** pour certaines actions rapides.

Cette fonctionnalité évite d'ouvrir le gestionnaire pour ajouter un nouveau tag.

---

### Masquage des œuvres

Lorsqu'un tag interdit est détecté, le module applique le mode de masquage choisi.

Selon les réglages, l'œuvre peut :

- être complètement repliée ;
- être simplement atténuée.

Les œuvres repliées restent accessibles grâce à un bandeau permettant de les réafficher temporairement.

---

### Gestionnaire de la liste noire

Le module fournit une interface complète permettant de gérer les tags.

Le gestionnaire comprend notamment :

- la recherche de tags ;
- la gestion des groupes ;
- l'importation ;
- l'exportation ;
- l'ouverture et la fermeture du panneau de gestion.

---

## Détails techniques

### Stockage

Le sous-module gère :

- la liste noire ;
- les groupes de tags.

---

### Données enregistrées

Principales clés utilisées :

- `ao3h:hideByTags:list`

---

## Dépendances

Ce sous-module est initialisé par `_hideByTags.js`.

Il fournit les informations de masquage utilisées par `whitelistExceptions.js`, qui peut ensuite décider de sauver certaines œuvres malgré la présence d'un tag interdit.


# whitelistExceptions.js

## Rôle

Gère les exceptions à la liste noire de tags.

Le sous-module décide si une œuvre contenant un tag interdit doit quand même rester visible grâce à la présence d'un tag autorisé.

Il permet également d'expliquer à l'utilisateur pourquoi une œuvre a été sauvée et de la masquer malgré tout pour la session en cours.

---

## Fonctionnalités

### Liste blanche de tags

Le module conserve une liste de tags considérés comme des exceptions.

Lorsqu'une œuvre contient à la fois :

- un tag présent dans la liste noire ;
- un tag présent dans la liste blanche ;

le module peut empêcher son masquage automatique.

Les données sont enregistrées sous la clé :

`ao3h:hideByTags:whitelist`

---

### Activation des exceptions

Le système de liste blanche peut être activé ou désactivé avec le réglage :

`whitelistEnabled`

Lorsque cette option est désactivée :

- les tags de la liste blanche ne sont pas pris en compte ;
- les œuvres sont traitées uniquement selon la liste noire et le filtre de mots-clés.

---

### Analyse des œuvres

Le module reçoit :

- les tags présents sur l'œuvre ;
- les raisons pour lesquelles elle devrait être masquée ;
- les règles de présentation choisies par l'utilisateur.

Il détermine ensuite si l'œuvre doit être sauvée.

---

### Mode d'affichage

Le réglage `whitelistMode` détermine comment présenter une œuvre sauvée.

Selon la configuration, le module peut :

- afficher normalement l'œuvre ;
- la conserver repliée avec une indication expliquant qu'une exception a été trouvée.

---

### Badge d'exception

Lorsque l'option `showWhitelistBadge` est activée, le module affiche un badge 🟢 sur les œuvres sauvées.

Le badge indique :

- qu'une exception a été appliquée ;
- quel tag de la liste blanche a permis de conserver l'œuvre visible ;
- pourquoi elle n'a pas été masquée malgré la présence d'un tag interdit.

---

### Masquage temporaire

Même lorsqu'une œuvre est sauvée par une exception, l'utilisateur peut choisir de la masquer quand même pour cette fois.

Cette action :

- ne retire pas le tag de la liste blanche ;
- ne modifie pas les réglages permanents ;
- s'applique uniquement à l'œuvre concernée dans le contexte actuel.

---

### Gestionnaire de la liste blanche

Le module fournit une interface dédiée permettant de gérer les exceptions.

Le gestionnaire permet notamment :

- d'ajouter un tag ;
- de supprimer un tag ;
- de consulter la liste ;
- d'importer les données ;
- d'exporter les données ;
- d'ouvrir et fermer le panneau de gestion.

---

## Détails techniques

### Stockage

Le sous-module gère la liste des tags autorisés.

Clé utilisée :

`ao3h:hideByTags:whitelist`

---

### Décision de sauvetage

Le module compare les tags d'une œuvre avec :

- la liste noire ;
- la liste blanche ;
- les raisons de masquage déjà détectées.

Il retourne ensuite une décision indiquant :

- si l'œuvre doit être sauvée ;
- comment elle doit être présentée ;
- quelle exception a été utilisée.

---

## Dépendances

Ce sous-module est initialisé par `_hideByTags.js`.

Il dépend des résultats produits par `hiddenTags.js`, puisqu'il intervient uniquement après la détection d'un tag interdit.

---

# nopeWords.js

## Rôle

Gère le filtre de mots-clés interdits.

Le sous-module analyse le contenu textuel des œuvres afin de détecter des mots ou expressions indésirables qui ne sont pas nécessairement présents dans les tags AO3.

---

## Fonctionnalités

### Liste de mots interdits

Le module conserve une liste de mots et d'expressions à rechercher.

Il permet notamment :

- d'ajouter un mot ;
- de supprimer un mot ;
- de modifier la liste ;
- d'importer la liste ;
- d'exporter la liste.

Les données sont enregistrées sous la clé :

`ao3h:hideByTags:nope`

---

### Activation du filtre textuel

Le filtre est contrôlé par le réglage :

`textFilterEnabled`

Lorsque cette option est désactivée :

- aucun contenu textuel n'est analysé ;
- seules les règles basées sur les tags continuent de s'appliquer.

---

### Zones analysées

Le module peut rechercher les mots interdits dans plusieurs zones.

Selon les réglages, il analyse :

- les résumés avec `nopeTargetSummaries` ;
- les notes d'auteur avec `nopeTargetNotes` ;
- les titres avec `nopeTargetTitles`.

---

### Correspondance textuelle

Le module recherche les mots ou expressions enregistrés dans le contenu sélectionné.

Lorsqu'une correspondance est trouvée, il identifie :

- le mot détecté ;
- la zone dans laquelle il a été trouvé ;
- l'œuvre concernée.

La recherche ne dépend pas des tags AO3.

---

### Masquage des œuvres

Lorsqu'un mot interdit est détecté, le module applique le réglage :

`nopeHideMode`

Selon la configuration, l'œuvre peut :

- être complètement repliée ;
- être simplement atténuée.

---

### Gestionnaire des mots interdits

Le module fournit un panneau complet de gestion.

Le gestionnaire permet notamment :

- de consulter les mots enregistrés ;
- d'en ajouter ;
- d'en supprimer ;
- d'importer une liste ;
- d'exporter une liste ;
- d'ouvrir ou fermer l'interface.

---

## Détails techniques

### Stockage

Clé utilisée :

`ao3h:hideByTags:nope`

---

### Analyse du DOM

Le module extrait le texte des différentes parties du blurb selon les réglages activés.

Il analyse ensuite ce contenu à partir de la liste de mots enregistrée.

---

### Résultat de l'analyse

Lorsqu'une correspondance est trouvée, le module fournit au coordinateur :

- le mot détecté ;
- la source du texte ;
- la raison du masquage.

---

## Dépendances

Ce sous-module est initialisé par `_hideByTags.js`.

Il fonctionne parallèlement à `hiddenTags.js` et peut masquer une œuvre même lorsqu'aucun tag interdit n'est présent.

---

# hideByTags.css

## Rôle

Contient l'ensemble des styles utilisés par le module **Hide By Tags**.

Il définit notamment l'apparence :

- du gestionnaire de tags ;
- des groupes ;
- des icônes d'ajout rapide ;
- des œuvres repliées ;
- des œuvres atténuées ;
- des bandeaux de masquage ;
- des badges de liste blanche ;
- des messages explicatifs ;
- des panneaux de gestion des mots interdits.


# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou documentées ailleurs dans le projet, mais ne disposent pas encore d'une implémentation complète.

---

## Liste noire de tags

### ~~Compteur d'œuvres masquées~~ ✅ Fait

~~Afficher au-dessus des résultats un compteur d'œuvres masquées/atténuées.~~

> Bandeau "🚫 X works hidden because of your tag filters" au-dessus de
> `#main` (`hiddenCounter.js`), désactivable via `showHiddenCounter`.

---

### ~~Compteur dans le menu~~ ✅ Fait

~~Afficher en permanence, dans le menu d'AO3 Helper, le nombre de tags de la
liste noire et de mots interdits enregistrés.~~

> Les titres de sections du panneau affichent en continu "X hidden",
> "X exceptions" et "X words" (`updateSectionCounts`).

---

### ~~Suppression complète~~ ✅ Fait

~~Ajouter un bouton permettant de vider entièrement la liste noire en une seule opération.~~

> Bouton "Clear All" (avec confirmation) dans le gestionnaire, qui vide
> aussi les groupes associés.

---

### ~~Modes de correspondance~~ ✅ Fait

~~Permettre de choisir la méthode de comparaison : exacte ou partielle ("contient").~~

> Réglage global `tagMatchMode` (exact / contains) dans le panneau, câblé
> dans `reasonsFor()`. Le choix par tag individuel n'a pas été retenu (une
> entrée "contient" globale suffit, et le réglage par tag compliquerait le
> gestionnaire).

---

### ~~Équivalences de tags AO3~~ ❌ Écarté

~~Reconnaître automatiquement les tags équivalents utilisés par AO3.~~

> Écarté : AO3 n'expose pas les synonymes sur les pages de listes — il
> faudrait une requête réseau par tag (coûteux et fragile). Le mode
> "contient" et les groupes de tags couvrent la plupart des variantes.

---

### ~~Ajout rapide étendu~~ ❌ Écarté

~~Permettre d'ajouter un tag interdit depuis d'autres éléments du blurb.~~

> Écarté : un clic "n'importe où" (résumé…) entrerait en conflit avec la
> lecture, la sélection de texte et les liens, et l'intention (quel tag ?)
> serait ambiguë. L'icône 🚫 par tag et Alt+clic restent les gestes
> explicites.

---

### ~~Masquage conditionnel~~ ✅ Fait

~~Pouvoir masquer une œuvre uniquement lorsqu'une combinaison précise de plusieurs tags est présente (Tag A ET Tag B).~~

> Une entrée de liste noire "tag a + tag b" ne masque que les œuvres
> portant tous les tags de la combinaison (fonctionne aussi en mode
> "contient").

---

## Filtre de mots-clés

### ~~Correspondance par mot entier~~ ✅ Fait

~~Permettre de détecter uniquement des mots complets plutôt que de simples portions de texte.~~

> Réglage `nopeWholeWords` : "art" ne matche plus "heart".

---

### ~~Expressions avancées~~ ✅ Fait

~~Ajouter un moteur de recherche plus puissant (jokers, motifs avancés, expressions techniques).~~

> Un mot interdit peut contenir `*` (joker) ou être écrit `/…/` (expression
> régulière, insensible à la casse). Un motif invalide retombe sans erreur
> sur la recherche de sous-chaîne.

---

### ~~Liste prédéfinie~~ ❌ Écarté

~~Fournir une liste de mots interdits par défaut afin d'aider les nouveaux utilisateurs.~~

> Écarté : présélectionner ce qui doit être filtré est un choix éditorial ;
> la liste doit rester personnelle (même principe de neutralité que le
> reste du projet).

---

### ~~Badge de détection~~ ✅ Déjà couvert

~~Afficher un badge indiquant quel mot interdit a été détecté sur une œuvre.~~

> Le bandeau de repli affiche ⛔ "mot" (mode masquage) et le bandeau
> d'atténuation affiche "⛔ Soft-hidden — NOPE word: mot" — le mot détecté
> est donc toujours visible.

---

### ~~Vérification manuelle~~ ✅ Fait

~~Ajouter un bouton permettant de relancer l'analyse textuelle de la page sans devoir la recharger.~~

> Bouton "↻ Re-scan" sur le bandeau compteur + commande de menu
> Tampermonkey "Re-scan page for hidden tags/words".

---

## Apparence

### ~~Intensité de l'atténuation~~ ✅ Fait

~~Permettre de choisir précisément le niveau d'opacité appliqué aux œuvres atténuées.~~

> Réglage `dimOpacity` (5–90 %), appliqué via une variable CSS.

---

### ~~Effet de flou~~ ✅ Fait

~~Ajouter un effet de flou pouvant être utilisé à la place ou en complément de l'opacité réduite.~~

> Réglage `dimBlur` : le contenu atténué est flouté (2.5px), le bandeau de
> raison reste net et le survol rétablit la lecture.

---

## Intégration avec d'autres modules

### ~~Protection des favoris~~ ✅ Fait

~~Toujours laisser visibles les bookmarks et œuvres favorites, même lorsqu'elles correspondent à un tag interdit.~~

> Réglage `protectBookmarked` : les œuvres présentes dans le suivi local de
> Bookmark Vault (`ao3h:bookmarkVault:data`) ne sont jamais masquées ni
> atténuées.

---

### ~~Détection automatique depuis Tags Display~~ ✅ Fait

~~Masquer automatiquement une œuvre lorsqu'un autre module identifie un tag problématique.~~

> Réglage `hideNoiseTaggedWorks` : les œuvres portant un tag "bruit"
> (détection de Tags Display — motifs intégrés + mots personnalisés de
> l'utilisateur) sont traitées comme si le tag était en liste noire.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Module indépendant

Le module ne sera pas fusionné avec `skipWorks`.

Les deux modules poursuivent des objectifs différents :

- **Hide By Tags** applique un masquage automatique basé sur des règles.
- **Skip Works** permet un masquage manuel accompagné de notes personnelles.

Cette séparation permet de conserver des responsabilités claires et indépendantes.

---

## Fonctionnalités retirées

Les fonctionnalités suivantes ont été étudiées mais volontairement abandonnées ou déplacées vers d'autres modules :

- liaison automatique avec les groupes de tags équivalents de `filterManager` ;
- suggestions automatiques de tags pendant la saisie ;
- regroupements automatiques de tags par thèmes ;
- mode "afficher uniquement" au lieu de masquer ;
- gestion de la casse pour les mots interdits ;
- gestion de la casse pour les tags ;
- règles limitées à certaines pages ;
- partage communautaire des listes de tags ;
- module dédié au masquage automatique des crossovers ;
- formats d'import/export autres que JSON.

Ces fonctionnalités pourront être réévaluées ultérieurement, mais ne font actuellement pas partie du périmètre du module.


# Résumé des responsabilités du module

Le module **Hide By Tags** est responsable du masquage automatique des œuvres selon leurs tags et leur contenu textuel.

Ses responsabilités sont réparties entre les sous-modules suivants :

| Sous-module | Responsabilité principale |
|-------------|---------------------------|
| `_hideByTags.js` | Initialise et coordonne l'ensemble du module. |
| `hiddenTags.js` | Gère la liste noire, les groupes de tags, le masquage automatique et le gestionnaire de tags. |
| `whitelistExceptions.js` | Gère les exceptions permettant à certaines œuvres d'être affichées malgré la présence d'un tag interdit. |
| `nopeWords.js` | Analyse les résumés, notes et titres afin de détecter des mots ou expressions interdits. |
| `hideByTags.css` | Définit l'apparence de l'ensemble des éléments visuels du module. |

---

# Interactions entre les sous-modules

Le coordinateur `_hideByTags.js` initialise les différents sous-modules et centralise les décisions de masquage.

Les responsabilités sont volontairement séparées :

- **`hiddenTags.js`** détermine si une œuvre doit être masquée à partir de ses tags.
- **`whitelistExceptions.js`** intervient uniquement lorsqu'une œuvre possède déjà un motif de masquage afin de déterminer si une exception doit être appliquée.
- **`nopeWords.js`** effectue une analyse indépendante du contenu textuel et peut masquer une œuvre même lorsqu'aucun tag interdit n'est présent.
- **`hideByTags.css`** applique les styles communs aux interfaces et aux éléments de masquage.

Chaque sous-module possède une responsabilité unique afin de limiter les dépendances et de faciliter la maintenance du module.

---

# Dépendances externes

Le module repose principalement sur les APIs natives du navigateur.

## APIs utilisées

- `localStorage`
- `MutationObserver`

---

## Stockage

Le module utilise les clés suivantes :

- `ao3h:hideByTags:list` — liste noire des tags ;
- `ao3h:hideByTags:whitelist` — liste blanche des exceptions ;
- `ao3h:hideByTags:nope` — liste des mots interdits.

---

# Limites connues

Le module applique actuellement plusieurs limitations de conception.

Notamment :

- les tags utilisent uniquement une correspondance exacte ;
- les mots interdits utilisent une recherche textuelle simple ;
- aucune reconnaissance automatique des synonymes ou des tags équivalents d'AO3 n'est effectuée ;
- les règles s'appliquent globalement à toutes les pages compatibles ;
- les listes sont importées et exportées uniquement au format JSON.

Ces limitations pourront évoluer avec les futures versions du module.


