# userRelationships

**Tab:** Navigate & Interact

## À quoi ça sert

Ce module gère tout ce qui concerne les autres personnes sur AO3 : suivre
certains auteurs, leur mettre des notes personnelles, les mettre en
favori, ou au contraire bloquer un auteur pour ne plus voir ses fics, ses
commentaires et ses notes de bookmark.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `favoritesOnlyFilter` | désactivé | N'affiche que les fics des auteurs mis en favori |
| `showPlaceholder` | activé | Affiche un message "[Hidden — ...]" à la place d'un contenu caché, au lieu de le faire disparaître complètement |
| `tempRevealHidden` | désactivé | Permet de révéler temporairement un élément caché en cliquant dessus |

## Fichiers

### 1. `_userRelationships.js` — le chef d'orchestre

- Met en route les six fichiers de fonctionnalités de ce module et partage les réglages communs

### 2. `userRelationshipsSettings.js` — réglages partagés

- Garde en un seul endroit les valeurs par défaut utilisées par tous les autres fichiers de ce module

### 3. `authorTracking.js` — suivre un auteur

- Permet d'écrire une note personnelle sur un auteur, visible en survolant un petit badge 📝
- Permet de suivre un auteur, avec un badge ★
- Affiche une bannière quand un auteur suivi a publié de nouvelles œuvres depuis la dernière visite

### 4. `authorBlocking.js` — cacher les fics des auteurs bloqués

- Cache les fics des auteurs bloqués sur les listes
- Remplace la fic cachée par un message "[Hidden — Author blocked: nom]", avec un bouton pour la révéler temporairement

### 5. `authorPreference.js` — préférences par auteur

- Permet de cacher ou de mettre en favori un auteur, un par un
- Affiche combien de fics de cet auteur ont déjà été lues, si ce nombre est connu

### 6. `blockingInterface.js` — menu pour bloquer quelqu'un

- Ajoute un menu (clic droit) sur le nom d'un auteur pour le bloquer ou le débloquer
- Garde la liste officielle des personnes bloquées, utilisée par les autres fichiers de ce module

### 7. `blocklistManagement.js` — gérer sa liste de blocage

- Affiche sur la page de profil la liste complète des personnes bloquées
- Permet d'ajouter, de retirer, d'exporter, d'importer, ou de tout effacer d'un coup

### 8. `commentHiding.js` — cacher les commentaires des personnes bloquées

- Cache les commentaires écrits par une personne bloquée
- Cache aussi les notes laissées par une personne bloquée sur ses bookmarks

### 9. `userRelationships.css`

- Les styles visuels de tous les fichiers ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Se souvenir de la raison pour laquelle on a bloqué quelqu'un
- Bloquer un pseudonyme précis plutôt que tout le compte d'un auteur
- Voir des statistiques sur un auteur (total de mots écrits, nombre d'œuvres, kudos reçus)
- Voir les œuvres les plus populaires d'un auteur
- Voir combien de kudos on a donné à un auteur précis au fil du temps
- S'abonner automatiquement aux nouvelles œuvres de ses auteurs favoris
- Donner un niveau de priorité à un auteur pour sa liste de lecture
- Voir des statistiques sur son blocage : combien d'auteurs bloqués, combien de fics ou de commentaires cachés au total
- Afficher une photo de profil (avatar) à côté du nom d'un auteur
- Pouvoir ranger les auteurs par tags ou catégories personnalisées, pas juste une note en texte libre
- Voir une petite fiche apparaître quand on survole le nom d'un auteur, avec ses infos principales, sans avoir à cliquer nulle part

## Explicitement écarté

- Noter un auteur avec des étoiles (1 à 5) — les favoris suffisent
- Bloquer quelqu'un juste pour une durée limitée (1 jour, 1 semaine...)
- Être alerté quand un auteur favori publie une nouvelle œuvre, sans avoir à visiter sa page — jugé trop lourd à mettre en place
- Recevoir des suggestions d'auteurs similaires — jugé pas fiable
- Analyser le style d'écriture d'un auteur
- Des statistiques sur plusieurs années avec des graphiques — jugé trop complexe
- Un score de fiabilité de l'auteur basé sur ses habitudes de mise à jour — jugé trop proche d'une autre idée similaire et pas assez fiable en données

## Précision

⚠️ La doc historique anglaise décrit un état plus ancien du code, avec des
fichiers en double et des sous-modules vides sans vrai code. Ce n'est plus
le cas : le code actuel a exactement 6 fichiers de fonctionnalités, tous
complets et fonctionnels, sans doublon.



AO3 Helper - User Relationships Module Coordinator
    Module ID: userRelationships
    Display Name: User Relationships
    Tab: Navigate & Interact

    Submodules (Tier 2 — self-register with parent: 'userRelationships', discovered
    independently by src/modules.js's import.meta.glob, booted automatically
    by the cascade logic already built into core/lifecycle.js's bootOne()):
        authorBlocking       -- hide work blurbs by blocked authors on listing pages
        authorPreference     -- per-author hide / favourite / read-count controls
        authorTracking       -- author notes badges, follow-list badges, new-work detection
        blockingInterface    -- right-click context menu to block/unblock any username
        blocklistManagement  -- blocklist management panel on profile/preferences pages
        commentHiding        -- hide comments and bookmark notes from blocked users

    This coordinator is a pure parent — it only registers itself so the registry
    can cascade lifecycle to its children. All logic lives in the submodules.


    AO3 Helper - Author Blocking Submodule
    Submodule ID: authorBlocking
    Parent: userRelationships
    Display Name: Author Blocking

    - Feature: Works filtering
      - Option: Process work blurbs on listing pages
      - Option: Hide blurbs whose author is on the blocklist
      - Option: Case-insensitive author name matching
      - Option: Reads blocklist from storage key: `userBlocker:list`
      - Option: Dynamic observation for new content (MutationObserver)

    - Feature: Hidden work indicators
      - Option: Replace blurb with "[Hidden — Author blocked: {name}]" placeholder
      - Option: Temporary reveal button to show the blurb without unblocking
      - Option: Re-hide button after temporary reveal

    - Feature: Blocklist statistics
      - Option: Count of hidden works displayed in placeholder


      AO3 Helper - Author Preference Submodule
    Submodule ID: authorPreference
    Parent: userRelationships
    Display Name: Author Preference

    - Feature: Per-author preferences
      - Option: Store preferences per author
      - Option: Storage key: `authorPreferences:data`
      - Option: JSON object: { author: { hidden, favorite, readCount } }
      - Option: Default values: { hidden: false, favorite: false, readCount: 0 }

    - Feature: Hide/show author works
      - Option: Toggle author visibility
      - Option: Hide button: "🙈 Hide" / "👁️ Show"
      - Option: Preference persistence across pages
      - Option: Page reload after toggle to apply hiding immediately

    - Feature: Favorite authors
      - Option: Mark authors as favorites
      - Option: Toggle button: "☆" / "⭐"
      - Option: Visual favorite indicator (gold border + background on blurb)
      - Option: No page reload needed — updates in place

    - Feature: Reading statistics
      - Option: Display "(X read)" counter beside author name
      - Option: Read count sourced from stored preferences

    - Feature: Author controls in listings
      - Option: Add control buttons to work blurbs on listing pages
      - Option: Inject controls beside author name (.authors)
      - Option: Hide/Show toggle button
      - Option: Favorite toggle button
      - Option: Read count display

    - Feature: Hidden work placeholders
      - Option: Hide blurb and show "[Hidden — author preference]" message
      - Option: Temporary reveal option when showPlaceholder is enabled



AO3 Helper - Author Tracking Submodule
    Submodule ID: authorTracking
    Parent: userRelationships
    Display Name: Author Tracking

    - Feature: Author notes
      - Option: Store personal notes per author
      - Option: Storage key: `authorTracking:notes`
      - Option: Note badge (📝) shown on blurbs for authors with notes
      - Option: Note text shown on hover via title attribute

    - Feature: Follow tracking
      - Option: Maintain a followed-authors list
      - Option: Storage key: `authorTracking:followed`
      - Option: Star badge (★) shown on blurbs for followed authors

    - Feature: New work detection
      - Option: When visiting an author's works page, record current work count + timestamp
      - Option: Storage key: `authorTracking:snapshots`
      - Option: On return visit, detect if work count has increased
      - Option: Show green banner "X new works since your last visit!" at top of page

    - Feature: Author statistics snapshots
      - Option: Record { workCount, lastSeen } per author on each works-page visit
      - Option: Persists across sessions via localStorage



AO3 Helper - Blocking Interface Submodule
    Submodule ID: blockingInterface
    Parent: userRelationships
    Display Name: Blocking Interface

    - Feature: Right-click context menu blocking
      - Option: Right-click on usernames to block
      - Option: "Block this user" context menu option
      - Option: "Unblock {username}" for blocked users
      - Option: Instant blocking from any username link
      - Option: Works on author links (rel="author")
      - Option: Works on user profile links (/users/)

    - Feature: User blocking
      - Option: Add users to blocked list
      - Option: Case-insensitive username matching
      - Option: Set storage with blocked users array
      - Option: Storage key: `userBlocker:list`

    - Feature: User unblocking
      - Option: Remove users from blocked list
      - Option: Reprocess page to show content
      - Option: Update storage after unblock

    - Feature: Context menu UI
      - Option: Custom context menu on right-click
      - Option: Fixed positioning at cursor
      - Option: White background with shadow
      - Option: Hover effects on menu items
      - Option: Close menu on outside click



AO3 Helper - Blocklist Management Submodule
    Submodule ID: blocklistManagement
    Parent: userRelationships
    Display Name: Blocklist Management

    - Feature: Blocklist panel
      - Option: Injects a management UI on profile/preferences/dashboard pages
      - Option: Displays all currently blocked users with count
      - Option: Scrollable list, max-height 220px

    - Feature: Add users
      - Option: Text input + "Add" button to block a new username
      - Option: Enter key submits the input
      - Option: Lowercases and deduplicates on add

    - Feature: Remove users
      - Option: Per-user "✕ Remove" button to unblock
      - Option: List re-renders immediately after removal

    - Feature: Export / import
      - Option: Export blocklist as a JSON file download
      - Option: Import JSON file — merges with existing list, deduplicates
      - Option: Invalid files silently ignored

    - Feature: Clear all
      - Option: "Clear All" button with confirmation dialog
      - Option: Empties the entire blocklist on confirm


      AO3 Helper - Comment Hiding Submodule
    Submodule ID: commentHiding
    Parent: userRelationships
    Display Name: Comment Hiding

    - Feature: Comment hiding
      - Option: Hides comments on work pages whose author is on the blocklist
      - Option: Reads blocklist from storage key: `userBlocker:list`
      - Option: Replaces comment with "[Comment hidden — blocked user: {name}]" placeholder
      - Option: "Reveal" button lets user temporarily see the comment
      - Option: MutationObserver watches for dynamically loaded comments

    - Feature: Bookmark note hiding
      - Option: Hides the bookmark note (blockquote.userstuff) on bookmark blurbs
        whose bookmarker is on the blocklist
      - Option: Replaces note with "📝 Bookmark note hidden — blocked user: {name}"


      
═══════════════════════════════════════════════════════════════════════════
  # userRelationships
  **Tab :** Navigate & Interact
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **User Relationships** regroupe toutes les fonctionnalités liées aux autres utilisateurs d'AO3.

* Il permet notamment de :
  - suivre certains auteurs ;
  - enregistrer des notes personnelles sur un auteur ;
  - marquer des auteurs comme favoris ;
  - masquer les œuvres d'auteurs bloqués ;
  - masquer les commentaires et les notes de favoris provenant d'auteurs bloqués ;
  - gérer une liste complète des utilisateurs bloqués ;
  - filtrer les œuvres selon les auteurs favoris.

---

# Réglages utilisateur

| Réglage               | Description                                                                                   |
| --------------------- |-----------------------------------------------------------------------------------------------|
| `favoritesOnlyFilter` | N'affiche que les œuvres des auteurs marqués comme favoris.                                   |
| `showPlaceholder`     | Remplace un contenu masqué par un message explicatif plutôt que de le supprimer complètement. |
| `tempRevealHidden`    | Permet de révéler temporairement un contenu masqué en cliquant dessus.                        |

---

# Structure du module

Le module est composé d'un fichier coordinateur, de six sous-modules fonctionnels, d'un fichier de réglages communs et d'une feuille de style.

```text
_userRelationships.js
userRelationshipsSettings.js
authorTracking.js
authorBlocking.js
authorPreference.js
blockingInterface.js
blocklistManagement.js
commentHiding.js
userRelationships.css
```

---

# _userRelationships.js

## Rôle

Fichier coordinateur du module.

Il enregistre le module principal auprès d'AO3 Helper, partage les réglages communs et permet le démarrage automatique des différents sous-modules.

---

## Responsabilités

* Initialise l'ensemble des sous-modules.
* Partage les réglages communs du module.
* Sert de parent aux sous-modules dans le registre des modules.
* Laisse toute la logique métier aux sous-modules spécialisés.
* S'appuie sur le système de cascade d'AO3 Helper pour leur initialisation automatique.

---

## Détails techniques

Les sous-modules s'enregistrent avec :

```text
parent: "userRelationships"
```

Ils sont découverts automatiquement par :

```text
src/modules.js
```

au moyen de :

```text
import.meta.glob(...)
```

puis démarrés par la logique de cascade de :

```text
core/lifecycle.js
```

et notamment :

```text
bootOne()
```

---

## Dépendances

Le coordinateur dépend :

* du système de registre des modules ;
* du cycle de vie d'AO3 Helper ;
* des six sous-modules du module.

---

# userRelationshipsSettings.js

## Rôle

Centralise les réglages et les valeurs par défaut utilisés par l'ensemble des sous-modules.

---

## Fonctionnalités

### Réglages communs

Le fichier fournit un point d'accès unique aux préférences partagées afin d'éviter leur duplication dans plusieurs sous-modules.

---

## Détails techniques

Tous les autres fichiers du module utilisent ces valeurs par défaut afin de conserver un comportement cohérent.

---

# authorTracking.js

## Rôle

Permet de suivre certains auteurs, d'enregistrer des notes personnelles et de détecter leurs nouvelles publications.

---

## Fonctionnalités

### Notes personnelles

Le sous-module permet d'enregistrer une note personnelle pour chaque auteur.

Les notes sont stockées dans :

```text
authorTracking:notes
```

Un badge :

```text
📝
```

est affiché à côté des auteurs possédant une note.

Le texte de la note apparaît au survol grâce à l'attribut `title`.

---

### Auteurs suivis

Le sous-module maintient une liste des auteurs suivis.

Cette liste est enregistrée dans :

```text
authorTracking:followed
```

Les auteurs suivis sont identifiés par un badge :

```text
★
```

---

### Détection des nouvelles œuvres

Lorsqu'une page listant les œuvres d'un auteur est consultée, le module enregistre :

* le nombre d'œuvres ;
* la date de la visite.

Ces informations sont stockées dans :

```text
authorTracking:snapshots
```

Lors d'une visite ultérieure, si le nombre d'œuvres a augmenté, une bannière verte est affichée en haut de la page indiquant :

```text
X new works since your last visit!
```

---

### Instantanés de statistiques

Pour chaque auteur visité, le sous-module conserve :

* `workCount`
* `lastSeen`

Ces informations sont conservées dans `localStorage`.

---

## Dépendances

Ce sous-module est coordonné par `_userRelationships.js`.

---

# authorBlocking.js

## Rôle

Masque les œuvres des auteurs présents dans la liste de blocage.

---

## Fonctionnalités

### Masquage des œuvres

Le sous-module analyse les listes d'œuvres.

Lorsqu'un auteur appartient à la liste de blocage, sa fic est masquée.

La comparaison des noms d'auteur est insensible à la casse.

La liste de blocage est lue depuis :

```text
userBlocker:list
```

Un `MutationObserver` surveille également les nouveaux contenus ajoutés dynamiquement.

---

### Messages de remplacement

Lorsqu'une œuvre est masquée, elle est remplacée par un message du type :

```text
[Hidden — Author blocked: {nom}]
```

Le message affiche également :

* le nombre d'œuvres masquées ;
* un bouton permettant de révéler temporairement l'œuvre ;
* un bouton permettant de masquer de nouveau l'œuvre après révélation.

---

## Dépendances

Ce sous-module est coordonné par `_userRelationships.js`.

Il dépend de la liste de blocage officielle utilisée par l'ensemble du module.

---

# authorPreference.js

## Rôle

Gère les préférences enregistrées individuellement pour chaque auteur.

---

## Fonctionnalités

### Préférences par auteur

Les préférences sont enregistrées sous la clé :

```text
authorPreferences:data
```

Chaque auteur possède une structure du type :

```text
{
  hidden,
  favorite,
  readCount
}
```

Les valeurs par défaut sont :

```text
hidden: false
favorite: false
readCount: 0
```

---

### Masquage des auteurs

Chaque auteur peut être masqué ou réaffiché individuellement.

Le bouton alterne entre :

* `🙈 Hide`
* `👁️ Show`

Le changement est enregistré et la page est rechargée afin d'appliquer immédiatement le nouveau filtrage.

---

### Auteurs favoris

Chaque auteur peut être marqué comme favori.

Le bouton alterne entre :

* `☆`
* `⭐`

Les auteurs favoris bénéficient également d'un indicateur visuel composé d'une bordure et d'un fond dorés.

Contrairement au masquage, cette action est appliquée immédiatement sans rechargement de la page.

---

### Compteur de lecture

Lorsque l'information est disponible, le sous-module affiche un compteur du type :

```text
(X read)
```

à côté du nom de l'auteur.

---

### Boutons dans les listes

Le sous-module ajoute plusieurs contrôles directement à côté du nom des auteurs dans les listes d'œuvres :

* bouton masquer/afficher ;
* bouton favori ;
* compteur de lecture.

---

### Remplacement des œuvres masquées

Les œuvres masquées peuvent être remplacées par un message :

```text
[Hidden — author preference]
```

Lorsque `showPlaceholder` est activé, un bouton permet également de révéler temporairement l'œuvre.

---

## Dépendances

Ce sous-module est coordonné par `_userRelationships.js`.

---

# blockingInterface.js

## Rôle

Permet de bloquer ou débloquer rapidement un utilisateur depuis son nom affiché sur AO3.

---

## Fonctionnalités

### Menu contextuel

Un clic droit sur un nom d'utilisateur ouvre un menu contextuel personnalisé.

Selon le cas, celui-ci propose :

* **Block this user**
* **Unblock {username}**

Le menu fonctionne notamment :

* sur les liens d'auteur (`rel="author"`) ;
* sur les profils `/users/`.

---

### Blocage

Le sous-module ajoute immédiatement l'utilisateur à la liste de blocage.

Les noms sont comparés sans tenir compte de la casse.

La liste est enregistrée dans :

```text
userBlocker:list
```

---

### Déblocage

Le sous-module permet également de retirer un utilisateur de cette liste.

Après le déblocage :

* le stockage est mis à jour ;
* la page est retraitée afin de réafficher le contenu précédemment masqué.

---

### Interface

Le menu contextuel possède notamment :

* un positionnement au niveau du curseur ;
* un fond blanc ;
* une ombre portée ;
* des effets au survol ;
* une fermeture automatique lorsqu'un clic est effectué ailleurs.

---

## Dépendances

Ce sous-module est coordonné par `_userRelationships.js`.

---

# blocklistManagement.js

## Rôle

Fournit une interface complète de gestion de la liste des utilisateurs bloqués.

---

## Fonctionnalités

### Panneau de gestion

Le sous-module ajoute une interface de gestion sur les pages de profil, de préférences ou de tableau de bord.

Cette interface affiche :

* le nombre total d'utilisateurs bloqués ;
* la liste complète des utilisateurs ;
* une zone de défilement limitée à une hauteur maximale de 220 pixels.

---

### Ajout d'utilisateurs

Le panneau permet d'ajouter un nouvel utilisateur grâce :

* à un champ texte ;
* à un bouton **Add**.

La touche **Entrée** valide également l'ajout.

Les doublons sont supprimés automatiquement et les noms sont convertis en minuscules.

---

### Suppression

Chaque utilisateur possède un bouton :

```text
✕ Remove
```

La liste est immédiatement reconstruite après chaque suppression.

---

### Importation et exportation

Le sous-module permet :

* d'exporter la liste au format JSON ;
* d'importer un fichier JSON.

Lors de l'importation :

* les doublons sont supprimés ;
* les nouvelles entrées sont fusionnées avec la liste existante ;
* les fichiers invalides sont ignorés.

---

### Effacement complet

Un bouton :

```text
Clear All
```

supprime toute la liste après confirmation.

---

## Dépendances

Ce sous-module est coordonné par `_userRelationships.js`.

---

# commentHiding.js

## Rôle

Masque les commentaires et les notes de favoris provenant des utilisateurs bloqués.

---

## Fonctionnalités

### Masquage des commentaires

Le sous-module masque les commentaires publiés par un utilisateur présent dans :

```text
userBlocker:list
```

Chaque commentaire est remplacé par un message du type :

```text
[Comment hidden — blocked user: {nom}]
```

Un bouton **Reveal** permet de l'afficher temporairement.

Un `MutationObserver` surveille également les commentaires chargés dynamiquement.

---

### Masquage des notes de favoris

Le sous-module masque également les notes de favoris (`blockquote.userstuff`) rédigées par un utilisateur bloqué.

Elles sont remplacées par un message du type :

```text
📝 Bookmark note hidden — blocked user: {nom}
```

---

## Dépendances

Ce sous-module est coordonné par `_userRelationships.js`.

Il utilise la liste de blocage officielle partagée avec les autres sous-modules.

---

# userRelationships.css

## Rôle

Contient l'ensemble des styles utilisés par le module **User Relationships**.

Il définit notamment l'apparence :

* des badges de suivi ;
* des badges de notes ;
* des indicateurs d'auteurs favoris ;
* des messages de remplacement ;
* des boutons de révélation temporaire ;
* du menu contextuel ;
* du panneau de gestion de la liste de blocage ;
* des commentaires masqués ;
* des notes de favoris masquées.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont mentionnées dans d'autres documents du projet, mais ne sont pas actuellement présentes dans le module.

---

## Motif de blocage

Permettre d'enregistrer la raison pour laquelle un auteur a été bloqué.

---

## Blocage par pseudonyme

Permettre de bloquer un pseudonyme précis plutôt que l'ensemble du compte d'un auteur.

---

## Statistiques d'auteur

Afficher notamment :

* le nombre d'œuvres ;
* le nombre total de mots ;
* le nombre de kudos reçus.

---

## Œuvres les plus populaires

Afficher les œuvres les plus populaires d'un auteur.

---

## Historique des kudos

Afficher combien de kudos ont été donnés à un auteur au fil du temps.

---

## Abonnement automatique

S'abonner automatiquement aux nouvelles œuvres des auteurs favoris.

---

## Priorité de lecture

Permettre d'attribuer un niveau de priorité aux auteurs pour organiser la liste de lecture.

---

## Statistiques de blocage

Afficher des statistiques telles que :

* le nombre d'auteurs bloqués ;
* le nombre total de fics masquées ;
* le nombre total de commentaires masqués.

---

## Avatar

Afficher une photo de profil à côté du nom des auteurs.

---

## Catégories personnalisées

Permettre de classer les auteurs avec des tags ou catégories plutôt qu'une simple note libre.

---

## Fiche auteur

Afficher une fiche récapitulative au survol du nom d'un auteur contenant ses principales informations.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Aucun système de notation

Le module ne permet pas de noter les auteurs avec un système d'étoiles.

Les favoris sont considérés comme suffisants.

---

## Aucun blocage temporaire

Le module ne permet pas de bloquer un utilisateur pour une durée limitée.

---

## Aucune notification automatique

Le module ne prévient pas automatiquement lorsqu'un auteur favori publie une nouvelle œuvre.

Cette fonctionnalité a été jugée trop lourde à mettre en œuvre.

---

## Aucune recommandation d'auteurs

Le module ne propose pas de recommandations d'auteurs similaires.

Cette approche a été jugée insuffisamment fiable.

---

## Aucune analyse du style

Le module n'analyse pas le style d'écriture des auteurs.

---

## Aucune statistique avancée

Le module ne produit pas de statistiques historiques complexes accompagnées de graphiques.

---

## Aucun score de fiabilité

Le module ne calcule pas de score de fiabilité basé sur la fréquence de publication ou les habitudes de mise à jour des auteurs.

Cette idée a été jugée trop proche d'autres fonctionnalités envisagées et insuffisamment fiable.

---

# Précision historique

La documentation historique en anglais décrivait une ancienne organisation du module comportant des fichiers en double et plusieurs sous-modules vides.

Cette description n'est plus valable.

Le module est désormais composé de :

* un fichier coordinateur ;
* un fichier de réglages communs ;
* six sous-modules complets et fonctionnels ;
* une feuille de style.

Aucun doublon n'est présent dans le code actuel.
