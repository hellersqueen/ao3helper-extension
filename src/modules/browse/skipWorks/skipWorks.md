# skipWorks

**Tab:** Browse

## À quoi ça sert

Ce module permet de cacher manuellement une fic précise depuis les listes,
avec une note optionnelle pour expliquer pourquoi ("crossover", "déjà
lu"...). Contrairement à `hideByTags`, qui cache selon les tags, ici on
cible une fic à la fois, avec un bouton "Hide".

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `displayMode` | `dim` | Comment afficher une fic cachée : bloc gris avec la note, ou suppression complète |

Les raisons rapides proposées dans la petite fenêtre, ainsi que la liste
des fics cachées, se gèrent depuis le panneau de configuration.

## Fichiers

### `skipWorks.js` — tout le module en un seul fichier

- Ajoute un bouton "Hide" sur chaque fic d'une liste
- Un clic ouvre une petite fenêtre avec des raisons rapides déjà prêtes (personnalisables), plus un champ de texte libre
- Une fic cachée s'affiche en gris avec la note, ou disparaît complètement (au choix), avec des boutons "Show" (révéler temporairement), "Edit" (changer la note) et "Unhide" (démasquer pour de bon)
- Garde en mémoire la liste des fics cachées, séparément pour chaque compte utilisateur
- Permet d'exporter ou d'importer cette liste dans un fichier

### `skipWorks.css`

- Les styles visuels du bouton, de la fenêtre de choix et du panneau de réglages

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Chercher une fic cachée par son titre ou son auteur dans la liste — il n'y a pas de barre de recherche
- Reconnaître toute seule les fics qui ont des notes d'auteur (au début ou à la fin) et les cacher ou mettre un badge d'avertissement dessus
- Garder la liste des fics cachées synchronisée automatiquement entre plusieurs appareils grâce à un autre module de sauvegarde
- Pouvoir double-cliquer sur une fic cachée pour la remontrer tout de suite
- Cacher automatiquement des fics selon des mots-clés, sans avoir à cliquer sur "Hide" soi-même
- Avoir plusieurs styles différents pour afficher la raison d'un masquage
- Choisir où placer le bouton "Hide" ou changer son texte
- Demander une confirmation avant de cacher une fic
- Des règles automatiques qui cachent une fic toute seule (par exemple par tag ou par auteur), sans avoir à cliquer sur "Hide" à chaque fois
- Écrire une note privée sur une fic sans la cacher — en ce moment, une note n'existe que collée à un masquage
- Surligner des passages ou poser des petits marque-pages dans le texte d'une fic pendant qu'on la lit

## Explicitement écarté

- Avoir une liste figée de raisons de masquage toutes prêtes, plutôt que des raisons personnalisables — jugé trop restrictif pour convenir à tout le monde
- Pouvoir cacher plusieurs fics d'un coup avec une seule action groupée — abandonné
- Fusionner ce module avec `hideByTags` — refusé explicitement : les buts sont trop différents, ici le masquage est manuel et volontaire, alors que `hideByTags` cache automatiquement selon des critères



AO3 Helper - Skip Works
    Module ID: skipWorks

    - Feature: Hide button
      - Option: Injects a "Hide" button on each work blurb in listing pages

    - Feature: Note prompt
      - Option: Opens a centered picker on hide (quick-tag chips + freetext input)
      - Option: Quick-tag chips are user-configurable and stored per-user
      - Option: Modifier key (Shift/Alt/Ctrl) skips picker and re-uses stored note

    - Feature: Hidden work display (two modes)
      - Option: Grey block — replaces blurb with note + Show / Edit / Unhide buttons
      - Option: Remove completely — blurb is hidden entirely (display:none)
      - Option: Live re-apply when displayMode setting changes in the panel

    - Feature: Blurb actions
      - Option: Show — temporary in-page reveal (not persisted, clears on reload)
      - Option: Unhide — permanent (resets isHidden flag in DB)
      - Option: Edit — re-opens picker to change the note while staying hidden

    - Feature: Persistence (IndexedDB, per-user)
      - Option: Per-user database (ao3h-hiddenWorksDB-[username])
      - Option: Re-applies hidden state on every page load
      - Option: Observer re-applies Hide buttons when list updates (AJAX / pagination)

    - Feature: Migrations
      - Option: Legacy: localStorage (ao3HiddenWorks) → IndexedDB
      - Option: Shared DB (ao3h-hiddenWorksDB) → per-user DB

    - Feature: Export / Import
      - Option: Export hidden works list as JSON file
      - Option: Import hidden works from JSON file

    - Feature: Config panel (skipWorks-config.js)
      - Option: Display mode toggle (grey block / remove)
      - Option: Quick Note Presets manager (add / remove chips)
      - Option: Skipped Works List with Unhide per entry
      - Option: Clear All, Export (JSON), Import (JSON) buttons



═══════════════════════════════════════════════════════════════════════════      
  # skipWorks
  **Tab :** Browse
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Skip Works** permet de masquer manuellement une œuvre précise depuis les listes AO3.

Contrairement à `hideByTags`, qui masque automatiquement les œuvres selon leurs tags ou leur contenu, `skipWorks` fonctionne œuvre par œuvre. L’utilisateur choisit volontairement de masquer une fic et peut enregistrer une note privée pour expliquer cette décision.

Exemples de raisons :

* crossover ;
* déjà lu ;
* abandonné ;
* ne m’intéresse pas ;
* raison personnalisée.

Une œuvre masquée peut être atténuée avec sa note visible ou être complètement retirée de la page.

---

# Réglages utilisateur

| Réglage       | Défaut | Description                                                                                             |
| ------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| `displayMode` | `dim`  | Détermine si une œuvre masquée apparaît sous forme de bloc gris avec sa note ou disparaît complètement. |

Les raisons rapides proposées dans la fenêtre de masquage sont personnalisables depuis le panneau de configuration.

La liste des œuvres masquées est également accessible depuis ce panneau.

---

# Structure du module

Le module est composé d’un seul fichier fonctionnel ainsi que d’une feuille de style.

```text
skipWorks.js
skipWorks.css
```

---

# skipWorks.js

## Rôle

Contient l’ensemble des fonctionnalités du module.

Il gère :

* l’ajout du bouton de masquage ;
* la saisie des notes ;
* l’affichage des œuvres masquées ;
* les actions de révélation, de modification et de démasquage ;
* le stockage des données ;
* les migrations ;
* l’importation et l’exportation ;
* l’intégration avec le panneau de configuration.

---

## Fonctionnalités

### Bouton de masquage

Le module ajoute un bouton **Hide** sur chaque œuvre affichée dans une liste AO3.

Ce bouton permet de masquer manuellement l’œuvre concernée.

Le module réinjecte automatiquement les boutons lorsque la liste est mise à jour dynamiquement, notamment lors :

* des changements de pagination ;
* des mises à jour AJAX ;
* de l’ajout de nouveaux blurbs dans la page.

---

### Fenêtre de sélection de la raison

Un clic sur le bouton **Hide** ouvre une fenêtre centrée.

Cette fenêtre contient :

* des raisons rapides présentées sous forme de boutons ;
* un champ de texte libre ;
* les commandes permettant de confirmer ou d’annuler le masquage.

Les raisons rapides sont personnalisables et enregistrées séparément pour chaque utilisateur.

---

### Raisons rapides

L’utilisateur peut gérer ses propres raisons prédéfinies.

Il peut notamment :

* ajouter une raison ;
* supprimer une raison ;
* sélectionner rapidement une raison lors du masquage ;
* compléter la raison avec un texte personnalisé.

Le module ne dépend donc pas d’une liste fixe de raisons imposées.

---

### Raccourci avec touche modificatrice

L’utilisation d’une touche modificatrice lors du clic permet de masquer plus rapidement une œuvre.

Touches prises en charge :

* `Shift`
* `Alt`
* `Ctrl`

Lorsque l’une de ces touches est utilisée, le module :

* n’ouvre pas la fenêtre de sélection ;
* réutilise directement la note déjà enregistrée pour l’œuvre.

---

### Modes d’affichage

Le module propose deux modes d’affichage pour les œuvres masquées.

#### Bloc gris

L’œuvre originale est remplacée par un bloc atténué contenant :

* la note enregistrée ;
* un bouton **Show** ;
* un bouton **Edit** ;
* un bouton **Unhide**.

#### Suppression complète

L’œuvre est entièrement masquée avec :

```css
display: none;
```

Le mode utilisé dépend du réglage `displayMode`.

---

### Mise à jour immédiate du mode

Lorsque le réglage `displayMode` est modifié depuis le panneau, le module réapplique immédiatement le nouvel affichage aux œuvres présentes sur la page.

Il n’est pas nécessaire de recharger la page.

---

### Action Show

Le bouton **Show** révèle temporairement l’œuvre masquée.

Cette action :

* affiche de nouveau le blurb original ;
* ne modifie pas les données enregistrées ;
* ne retire pas l’œuvre de la liste des œuvres masquées ;
* est annulée au prochain rechargement de la page.

---

### Action Edit

Le bouton **Edit** permet de modifier la note associée à une œuvre masquée.

Cette action :

* rouvre la fenêtre de sélection ;
* affiche la note existante ;
* permet de choisir une autre raison rapide ;
* permet de modifier le texte libre ;
* conserve l’œuvre dans son état masqué.

---

### Action Unhide

Le bouton **Unhide** démasque définitivement l’œuvre.

Cette action :

* réinitialise son état `isHidden` dans la base de données ;
* restaure l’affichage normal du blurb ;
* retire l’œuvre de la liste active des œuvres masquées.

---

## Détails techniques

### Stockage par utilisateur

Les œuvres masquées sont enregistrées dans une base IndexedDB propre à chaque compte AO3.

Le nom de la base suit le format :

```text
ao3h-hiddenWorksDB-[username]
```

Cette séparation empêche les listes de plusieurs comptes AO3 de se mélanger sur le même navigateur.

---

### Données persistantes

Le module conserve notamment :

* l’identifiant de l’œuvre ;
* son état masqué ;
* la note enregistrée ;
* les informations nécessaires à son affichage dans le panneau.

Les œuvres masquées sont automatiquement reconnues et réappliquées à chaque chargement de page.

---

### Observation du contenu dynamique

Le module observe les changements apportés aux listes AO3.

Lorsqu’un nouveau blurb apparaît, il :

* ajoute le bouton **Hide** ;
* vérifie si l’œuvre est déjà masquée ;
* applique immédiatement son état enregistré.

---

### Migrations

Le module prend en charge la migration d’anciennes structures de stockage.

#### Migration depuis localStorage

Les données enregistrées sous l’ancienne clé :

```text
ao3HiddenWorks
```

peuvent être transférées vers IndexedDB.

#### Migration depuis la base partagée

Les données de l’ancienne base commune :

```text
ao3h-hiddenWorksDB
```

peuvent être transférées vers la nouvelle base propre à chaque utilisateur.

---

### Exportation

Le module permet d’exporter la liste des œuvres masquées dans un fichier JSON.

L’export contient les données nécessaires pour :

* conserver une copie de sauvegarde ;
* transférer la liste vers un autre navigateur ;
* restaurer les œuvres et leurs notes.

---

### Importation

Le module permet d’importer une liste précédemment exportée au format JSON.

Les données importées sont ajoutées à la base IndexedDB de l’utilisateur actuel.

---

### Panneau de configuration

Le fichier de configuration associé, `skipWorks-config.js`, fournit les contrôles suivants :

* choix du mode d’affichage ;
* gestion des raisons rapides ;
* ajout et suppression des raisons ;
* liste complète des œuvres masquées ;
* bouton **Unhide** pour chaque œuvre ;
* bouton **Clear All** ;
* bouton **Export JSON** ;
* bouton **Import JSON**.

---

## Dépendances

Le module fonctionne de manière autonome.

Il utilise toutefois le système général de configuration d’AO3 Helper pour afficher et modifier ses réglages depuis le panneau.

Il reste volontairement séparé de `hideByTags`, qui applique un masquage automatique selon des règles plutôt qu’un masquage manuel œuvre par œuvre.

---

# skipWorks.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Skip Works**.

Il définit notamment l’apparence :

* du bouton **Hide** ;
* de la fenêtre de sélection ;
* des raisons rapides ;
* du champ de note ;
* des œuvres atténuées ;
* des blocs affichant les notes ;
* des boutons **Show**, **Edit** et **Unhide** ;
* de la liste des œuvres masquées dans le panneau de configuration.



# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou documentées ailleurs dans le projet, mais ne disposent pas encore d’une implémentation complète.

---

## Gestion des œuvres masquées

### Recherche dans la liste

Ajouter une barre de recherche dans la liste des œuvres masquées.

La recherche pourrait utiliser notamment :

* le titre de l’œuvre ;
* le nom de l’auteur ;
* le contenu de la note ;
* l’identifiant de l’œuvre.

---

### Synchronisation entre appareils

Permettre à la liste des œuvres masquées d’être synchronisée automatiquement entre plusieurs appareils grâce au module de sauvegarde et de synchronisation.

Cette synchronisation devrait préserver :

* les œuvres masquées ;
* les notes associées ;
* les raisons rapides ;
* les données propres à chaque utilisateur AO3.

---

### Double-clic pour révéler

Permettre de double-cliquer sur une œuvre masquée afin de la révéler temporairement.

Cette action fonctionnerait comme le bouton **Show** et ne modifierait pas son état enregistré.

---

### Plusieurs styles d’affichage

Ajouter plusieurs styles visuels pour présenter la raison du masquage.

Les possibilités pourraient inclure :

* un bloc gris ;
* un bandeau compact ;
* une petite note sous le titre ;
* une icône avec une infobulle ;
* une œuvre atténuée sans remplacement complet du blurb.

---

### Confirmation avant le masquage

Ajouter un réglage permettant de demander une confirmation avant de masquer une œuvre.

Cette confirmation pourrait être utilisée :

* pour tous les masquages ;
* uniquement lorsqu’aucune note n’est fournie ;
* uniquement lors de l’utilisation d’un raccourci clavier.

---

## Détection automatique

### Détection des notes d’auteur

Reconnaître automatiquement les œuvres contenant :

* des notes d’auteur au début ;
* des notes d’auteur à la fin.

Selon le réglage choisi, le module pourrait :

* masquer automatiquement l’œuvre ;
* afficher un badge d’avertissement ;
* demander à l’utilisateur s’il souhaite la masquer.

---

### Masquage par mots-clés

Permettre de masquer automatiquement une œuvre lorsqu’un mot-clé précis est détecté.

Cette fonctionnalité fonctionnerait sans avoir à cliquer manuellement sur **Hide**.

---

### Règles automatiques

Ajouter un système de règles capable de masquer automatiquement les œuvres selon certains critères.

Exemples :

* un tag précis ;
* un auteur ;
* un fandom ;
* une relation ;
* une catégorie ;
* un mot-clé.

Cette fonctionnalité resterait distincte du masquage manuel principal.

---

## Personnalisation

### Position du bouton

Permettre de choisir où afficher le bouton **Hide** dans le blurb.

Exemples :

* près du titre ;
* près des actions Bookmark et Mark for Later ;
* en bas du blurb ;
* dans un menu d’actions.

---

### Texte du bouton

Permettre de remplacer le texte **Hide** par un libellé personnalisé.

Exemples :

* Skip
* Masquer
* Ignorer
* Not for me

---

## Notes indépendantes

### Notes sans masquage

Permettre d’écrire une note privée sur une œuvre sans devoir la masquer.

La note pourrait être conservée et affichée séparément du système de masquage.

Cette fonctionnalité nécessiterait de distinguer :

* les notes associées à un masquage ;
* les notes personnelles sans masquage.

---

## Outils de lecture

### Surlignage de passages

Permettre de surligner certains passages dans le texte d’une œuvre pendant la lecture.

---

### Marque-pages internes

Permettre d’ajouter de petits marque-pages à des endroits précis dans une œuvre.

Ces outils dépassent toutefois la responsabilité principale du module et pourraient appartenir à un module de lecture séparé.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Raisons personnalisables

Le module n’utilise pas une liste fixe de raisons de masquage.

Cette approche a été écartée car une liste imposée serait trop restrictive pour convenir à tous les utilisateurs.

Les raisons rapides restent donc entièrement personnalisables.

---

## Absence de masquage groupé

Le module ne permet pas de masquer plusieurs œuvres en une seule action.

Cette fonctionnalité a été abandonnée afin de conserver un fonctionnement volontaire et précis, œuvre par œuvre.

---

## Séparation avec Hide By Tags

Le module ne sera pas fusionné avec `hideByTags`.

Les deux modules répondent à des besoins différents :

* **Skip Works** masque manuellement une œuvre précise avec une note personnelle.
* **Hide By Tags** masque automatiquement les œuvres selon des critères définis à l’avance.

Cette séparation permet de conserver des responsabilités claires.

---

## Masquage manuel comme responsabilité principale

Les systèmes de règles automatiques, de mots-clés et de détection par tags ne constituent pas la fonction centrale de ce module.

Ils peuvent être envisagés comme extensions futures, mais le comportement principal reste :

1. l’utilisateur choisit une œuvre ;
2. il clique sur **Hide** ;
3. il ajoute éventuellement une note ;
4. le module mémorise ce choix.

---

## Outils de lecture séparés

Le surlignage de passages et les marque-pages internes ne font pas directement partie du masquage d’œuvres.

Ces fonctionnalités devraient idéalement appartenir à un module spécialisé dans la lecture et les annotations.


# Résumé des responsabilités du module

Le module **Skip Works** est responsable du masquage manuel des œuvres et de la gestion des notes personnelles qui leur sont associées.

Ses responsabilités sont réparties entre les fichiers suivants :

| Fichier         | Responsabilité principale                                                                                                         |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `skipWorks.js`  | Gère l'ensemble des fonctionnalités du module : masquage, notes, stockage, migrations, import/export et panneau de configuration. |
| `skipWorks.css` | Définit l'apparence de tous les éléments visuels du module.                                                                       |

---

# Interactions internes

Le module repose sur une logique unique regroupée dans `skipWorks.js`.

Ses différentes responsabilités restent clairement séparées :

* ajout des boutons **Hide** sur les œuvres ;
* affichage de la fenêtre de sélection des raisons ;
* gestion des raisons rapides ;
* gestion des notes personnalisées ;
* application des différents modes d'affichage ;
* gestion des actions **Show**, **Edit** et **Unhide** ;
* persistance des données dans IndexedDB ;
* migrations depuis les anciens systèmes de stockage ;
* importation et exportation des données ;
* intégration avec le panneau de configuration.

Toutes ces fonctionnalités sont centralisées dans un seul fichier afin de conserver un module autonome.

---

# Dépendances externes

Le module s'appuie principalement sur les APIs natives du navigateur.

## APIs utilisées

* `IndexedDB`
* `localStorage` (migration uniquement)
* `MutationObserver`

---

## Stockage

Les œuvres masquées sont enregistrées dans une base IndexedDB propre à chaque utilisateur AO3.

Nom de la base :

```text
ao3h-hiddenWorksDB-[username]
```

Anciennes structures prises en charge lors des migrations :

```text
ao3HiddenWorks
```

```text
ao3h-hiddenWorksDB
```

---

# Données enregistrées

Pour chaque œuvre masquée, le module conserve notamment :

* l'identifiant de l'œuvre ;
* son état de masquage ;
* la note personnalisée ;
* les informations nécessaires à son affichage ;
* les données utilisées par le panneau de configuration.

Les raisons rapides sont également enregistrées séparément pour chaque utilisateur.

---

# Limites connues

Le module présente actuellement plusieurs limitations de conception.

Notamment :

* les notes ne peuvent pas exister indépendamment d'un masquage ;
* le bouton **Hide** possède un emplacement fixe ;
* son texte ne peut pas être personnalisé ;
* les œuvres sont masquées uniquement après une action volontaire de l'utilisateur ;
* les règles automatiques de masquage ne sont pas prises en charge ;
* aucune synchronisation entre appareils n'est actuellement disponible ;
* la recherche dans la liste des œuvres masquées n'est pas encore implémentée.

Ces limitations pourront évoluer avec les futures versions du module.



