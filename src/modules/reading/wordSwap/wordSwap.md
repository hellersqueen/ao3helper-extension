# wordSwap

**Tab:** Reading

## À quoi ça sert

Ce module remplace des mots ou expressions dans le texte des fics selon des
règles que tu définis toi-même — utile par exemple pour les fics à
insertion de lecteur, pour remplacer "Y/N" par ton propre prénom. Les
remplacements ne touchent jamais l'interface d'AO3, seulement le texte de
la fic.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `yourFirstName` | (vide) | Le prénom utilisé pour le raccourci rapide "Y/N → Prénom" |

Les règles de remplacement elles-mêmes (quel mot remplacer par quoi) se
gèrent directement dans le panneau — ce n'est pas une simple case à
cocher.

## Fichiers

### `wordSwap.js` — tout le module en un seul fichier

- Un raccourci rapide pour remplacer "Y/N" par ton prénom
- Permet de créer ses propres règles de remplacement, avec des options (respecter les majuscules, mot entier seulement, motif avancé)
- Permet de ranger ses règles par catégories (par exemple par fandom)
- Propose un aperçu en direct dans le panneau, avec une zone de texte de test
- Permet d'exporter ou d'importer toutes ses règles dans un fichier
- Toute la gestion des règles (ajouter, modifier, supprimer, activer) se fait directement dans le panneau

### `wordSwap.css`

- Les styles visuels du bouton d'import de fichier

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Des modèles tout prêts pour normaliser automatiquement les variantes d'un nom de personnage
- Un modèle spécial tout prêt pour remplacer un deadname
- Remplacer directement des mots sensibles dans le texte par autre chose, au lieu de cacher toute la fic
- Des modèles tout prêts pour corriger des fautes de frappe qui reviennent souvent, ou pour adapter l'orthographe britannique vers l'américaine (ou l'inverse)

## Explicitement écarté

- Des variantes toutes prêtes du raccourci Y/N pour d'autres genres — Y/N suffit
- Choisir si une règle s'applique seulement à cette fic, à tout le site, ou à certains fandoms précis — volontairement simplifié, une règle s'applique toujours partout
- Un bouton séparé pour activer ou désactiver les remplacements en plus du module lui-même — non retenu, c'est déjà tout le module qui fait ça
- Demander une confirmation à chaque fois avant de remplacer Y/N — jugé pas assez utile


AO3 Helper - Word Swap
    Module ID: wordSwap
    Display Name: Word Swap
    Tab: Reading

    Replaces words or phrases in work text using user-defined rules.
    Rules are applied only inside #workskin (.userstuff) — never in AO3 UI.

    Features:
        - Y/N → Name quick preset (reader-insert fics)
        - Per-rule options: case-sensitive, whole-word, regex
        - Rule categories for organisation
        - Live preview in panel
        - Export / import rules as JSON
        - MutationObserver for lazy-loaded chapters
        - Full text restoration on cleanup

    Config keys (localStorage ao3h:mod:wordSwap:settings):
        yourFirstName -- used for the Y/N quick-swap preset (default: '')

    Rule storage (localStorage ao3h:ws:rules):
        Array of { id, name, find, replace, enabled, regex,
                   caseSensitive, wholeWord, category }






                
                   
═══════════════════════════════════════════════════════════════════════════
  # wordSwap
  **Tab :** Reading
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Word Swap** remplace automatiquement des mots ou des expressions à l'intérieur du texte des œuvres selon des règles définies par l'utilisateur.

Il permet notamment de :

* remplacer rapidement `Y/N` par son propre prénom ;
* créer des règles de remplacement personnalisées ;
* organiser les règles par catégories ;
* tester les remplacements dans un aperçu en direct ;
* importer ou exporter toutes les règles ;
* appliquer automatiquement les remplacements aux chapitres chargés dynamiquement.

Les remplacements s'appliquent uniquement au texte des œuvres et ne modifient jamais l'interface d'AO3.

---

# Réglages utilisateur

| Réglage         | Défaut | Description                                                                             |
| --------------- | ------ | --------------------------------------------------------------------------------------- |
| `yourFirstName` | Vide   | Prénom utilisé par le raccourci rapide remplaçant `Y/N` par le prénom de l'utilisateur. |

Les règles de remplacement ne sont pas gérées par des cases à cocher.

Elles sont créées, modifiées, activées ou supprimées directement depuis le panneau du module.

---

# Structure du module

Le module est composé d'un fichier fonctionnel unique et d'une feuille de style.

```text
wordSwap.js
wordSwap.css
```

---

# wordSwap.js

## Rôle

Gère l'ensemble des fonctionnalités de remplacement de texte dans les œuvres.

Le module applique les règles définies par l'utilisateur, met à jour automatiquement les nouveaux chapitres chargés sur la page, fournit un système complet de gestion des règles et restaure le texte d'origine lorsque le module est désactivé.

---

## Fonctionnalités

### Remplacement de texte

Le module remplace automatiquement les mots ou expressions correspondant aux règles actives.

Les remplacements sont appliqués uniquement dans le contenu des œuvres.

La portée est limitée à :

```text
#workskin (.userstuff)
```

Aucun élément de l'interface d'AO3 n'est modifié.

---

### Préréglage rapide Y/N

Le module fournit un raccourci permettant de remplacer automatiquement :

```text
Y/N
```

par le prénom défini dans :

```text
yourFirstName
```

Cette fonctionnalité est principalement destinée aux fictions de type *reader insert*.

---

### Règles personnalisées

L'utilisateur peut créer autant de règles qu'il le souhaite.

Chaque règle permet notamment de définir :

* le texte à rechercher ;
* le texte de remplacement ;
* son état (activée ou désactivée) ;
* sa catégorie.

---

### Options des règles

Chaque règle peut utiliser plusieurs options indépendantes.

Les options disponibles sont :

* respect de la casse (`caseSensitive`) ;
* correspondance sur un mot entier uniquement (`wholeWord`) ;
* utilisation d'une expression régulière (`regex`).

Ces options permettent de contrôler précisément le comportement de chaque remplacement.

---

### Catégories

Les règles peuvent être regroupées par catégories.

Cette organisation permet notamment de séparer différents ensembles de remplacements, par exemple selon :

* un fandom ;
* une série ;
* un univers particulier.

Les catégories servent uniquement à organiser les règles.

Toutes les règles actives continuent de s'appliquer globalement.

---

### Aperçu en direct

Le panneau du module propose une zone de texte de test.

L'utilisateur peut y vérifier immédiatement le résultat des règles avant leur utilisation sur une œuvre.

---

### Gestion des règles

Toutes les opérations sont réalisées directement depuis le panneau.

L'utilisateur peut notamment :

* créer une règle ;
* modifier une règle ;
* supprimer une règle ;
* activer ou désactiver une règle.

---

### Import et export

Le module permet :

* d'exporter toutes les règles au format JSON ;
* d'importer un ensemble de règles précédemment enregistré.

Cette fonctionnalité facilite :

* les sauvegardes ;
* le transfert des règles entre plusieurs installations ;
* le partage de collections de remplacements.

---

### Détection des chapitres chargés dynamiquement

Le module surveille automatiquement les nouveaux contenus ajoutés à la page.

Lorsqu'un nouveau chapitre apparaît sans rechargement complet de la page, les règles de remplacement sont appliquées automatiquement.

Cette fonctionnalité repose sur un :

```text
MutationObserver
```

---

### Restauration du texte

Lorsque le module est désactivé ou nettoyé, le texte d'origine est entièrement restauré.

Les modifications apportées au contenu de la page ne deviennent donc jamais permanentes.

---

## Détails techniques

### Portée

Les remplacements sont volontairement limités au contenu des œuvres.

Ils sont appliqués uniquement dans :

```text
#workskin (.userstuff)
```

Les menus, boutons, formulaires et autres éléments de l'interface AO3 ne sont jamais modifiés.

---

### Configuration

Les préférences du module sont enregistrées sous :

```text
ao3h:mod:wordSwap:settings
```

La clé actuellement utilisée est :

| Réglage         | Description                                   |
| --------------- | --------------------------------------------- |
| `yourFirstName` | Prénom utilisé par le raccourci rapide `Y/N`. |

---

### Stockage des règles

Les règles sont enregistrées dans :

```text
ao3h:ws:rules
```

Chaque règle possède la structure suivante :

```text
{
    id,
    name,
    find,
    replace,
    enabled,
    regex,
    caseSensitive,
    wholeWord,
    category
}
```

---

### Fonctionnement

Le module applique les règles uniquement au texte affiché dans le navigateur.

Le contenu d'origine de la page n'est jamais modifié définitivement.

Lors du nettoyage du module, l'ensemble du texte est restauré dans son état initial.

---

## Dépendances

Le module fonctionne de manière autonome.

Il utilise principalement :

* `localStorage` ;
* le DOM des pages de lecture AO3 ;
* `MutationObserver` pour détecter les chapitres ajoutés dynamiquement.

---

# wordSwap.css

## Rôle

Contient les styles utilisés par le module **Word Swap**.

Il définit notamment l'apparence :

* du bouton d'importation de fichier utilisé pour importer un ensemble de règles.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont mentionnées dans d'autres documents du projet, mais ne sont pas actuellement présentes dans le module.

---

## Modèles de personnages

Fournir des modèles prêts à l'emploi permettant de normaliser automatiquement les différentes variantes d'un nom de personnage.

---

## Modèle de remplacement de deadname

Ajouter un modèle prédéfini destiné au remplacement automatique d'un deadname.

---

## Remplacement des mots sensibles

Permettre de remplacer directement certains mots sensibles par d'autres expressions, plutôt que de masquer entièrement une œuvre.

---

## Modèles de correction

Fournir des modèles prêts à l'emploi permettant notamment :

* de corriger automatiquement des fautes de frappe fréquentes ;
* de convertir automatiquement l'orthographe britannique vers l'orthographe américaine ;
* de convertir automatiquement l'orthographe américaine vers l'orthographe britannique.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Portée globale des règles

Les règles ne peuvent pas être limitées :

* à une œuvre particulière ;
* à un fandom précis ;
* à une partie seulement du site.

Toute règle active s'applique systématiquement à l'ensemble des œuvres compatibles.

Ce choix simplifie le fonctionnement du module.

---

## Raccourci Y/N unique

Le module ne propose pas de variantes prédéfinies du remplacement `Y/N` pour différents genres ou formulations.

Le raccourci unique `Y/N` a été jugé suffisant.

---

## Activation du module

Le module ne possède pas de bouton indépendant permettant d'activer ou de désactiver tous les remplacements.

L'activation ou la désactivation du module contrôle déjà l'ensemble de cette fonctionnalité.

---

## Remplacement immédiat

Le module ne demande pas de confirmation avant d'appliquer le remplacement rapide de `Y/N`.

Cette étape supplémentaire a été jugée inutile au regard de la simplicité de cette fonctionnalité.
