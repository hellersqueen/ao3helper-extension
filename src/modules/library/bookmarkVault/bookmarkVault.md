# bookmarkVault

**Tab:** Library

## À quoi ça sert

Ce module transforme la gestion des favoris (bookmarks) AO3 en un vrai
outil d'organisation : badges de statut, notes enrichies, catégories,
tri/filtrage et navigation facilitée.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showPublicPrivateBadge` | activé | Badge ⭐/🔒 sur les favoris |
| `showNoteIcon` | activé | Icône 📝 si le favori a une note |
| `showLastReadDate` | désactivé | Affiche "Last read: X days ago" |
| `bookmarkStatusFilterEnabled` | désactivé | Active le filtre de statut sur les listes |
| `bookmarkStatusFilterDefault` | `all` | La vue par défaut : tous / favorisés / non favorisés |
| `showStatusFilterCount` | désactivé | Affiche un compteur à côté du filtre |
| `inlineNoteEditing` | activé | Modifier une note directement depuis les listes ou la page de la fic |
| `autoFillBookmarkForm` | activé | Pré-remplit titre, auteur, résumé dans le formulaire de favori |
| `createCategories` | activé | Active les catégories de favoris |
| `showCategoryLabels` | activé | Étiquettes de catégorie sur les favoris |
| `filterByCategory` | activé | Filtre les favoris par catégorie |
| `hideDeletedWorks` | désactivé | Cache (au lieu d'afficher un badge ⚠️) les fics supprimées ou restreintes |
| `pinBookmarks` | désactivé | Épingle des favoris en haut de la liste |
| `bulkSelection` | activé | Sélection multiple pour des actions groupées |
| `privateByDefault` | désactivé | Coche "Private" par défaut sur le formulaire |
| `assignToCategories` | activé | Range automatiquement les nouveaux favoris dans une catégorie (par fandom) |
| `defaultSort` | `date` | Le tri par défaut : date, titre, fandom ou note |
| `autoTagFandom` | désactivé | Ajoute le tag fandom automatiquement |
| `autoTagRating` | désactivé | Ajoute le tag de note automatiquement |
| `showAnalyticsDashboard` | désactivé | Affiche un tableau de bord avec des statistiques sur tes favoris |
| `showBackButton` | activé | Bouton "← Back to work" après avoir mis en favori |
| `showViewBookmarkLink` | activé | Lien "🔖 My Bookmark" sur les pages des fics déjà en favori |
| `showCompletionBadge` | désactivé | Badge ✓/🔄 de complétion sur les favoris |
| `showProgressRing` | désactivé | Petit anneau qui montre la progression de lecture |
| `showPersonalRating` | activé | Note personnelle ★★★★★ locale à côté des notes |
| `quickNoteOnWorkPage` | activé | Bouton 📝 de note rapide sous le titre de toute fic |
| `staleReminderMonths` | `0` (jamais) | Rappel 🔔 pour les favoris non ouverts depuis 3/6/12 mois |
| `hideBlockedUsersBookmarks` | activé | Cache les bookmarks publics des utilisateurs bloqués |

## Fichiers

### 1. `_bookmarkVault.js` — le chef d'orchestre

- Met en route tous les autres fichiers de ce module, chacun indépendamment (si l'un a un problème, les autres continuent de fonctionner)

### 1bis. Nouveaux fichiers (Chantier 4)

- `vaultTools.js` — logique pure : exports CSV/HTML, détection des favoris anciens, recherche `&&`/`||`, convention "note importante" (`!`)
- `personalRatings.js` — les étoiles personnelles locales (stockage + widget ★)
- `richTextNotes.js` — l'édition enrichie et l'historique des versions des notes personnelles (5 max par fic)
- `blockedBookmarks.js` — masque les bookmarks publics des utilisateurs de la liste de blocage

### 2. `organizationTools.js` — catégories et organisation

- Permet de créer ses propres catégories de favoris (avec un nom et une couleur)
- Affiche une étiquette de catégorie sur chaque favori, et permet de filtrer par catégorie
- Permet de sélectionner plusieurs favoris à la fois pour les supprimer d'un coup (avec confirmation)
- Permet d'épingler des favoris en haut de la liste
- Propose un tri (par date, titre, fandom)
- Peut ranger automatiquement un nouveau favori dans la bonne catégorie selon son fandom

### 3. `richTextNotes.js` — notes enrichies

- Remplit automatiquement le formulaire de favori (titre, auteur, résumé...) à partir de la page de la fic
- Permet de modifier sa note directement depuis la liste des favoris, sauvegardée automatiquement
- Comprend un peu de mise en forme dans les notes (gras, italique, code)

### 4. `bookmarkMaintenance.js` — entretien des favoris

- Peut cocher automatiquement "Private" sur le formulaire de favori
- Ajoute un bouton pour exporter tous ses favoris dans un fichier, avec un badge de couleur qui indique la fraîcheur du dernier export (vert si moins de 30 jours, orange sinon)
- Un tableau de bord optionnel avec des statistiques (nombre total, en cours/terminé, public/privé, fandoms les plus favorisés)

### 5. `bookmarkNavigation.js` — navigation

- Ajoute un bouton "← Back to work" après avoir mis une fic en favori
- Ajoute un lien "🔖 My Bookmark" sur les pages des fics déjà en favori

### 6. `noteDisplay.js` — affichage des notes

- Replie les notes trop longues avec un bouton "Show more/less"
- Affiche une bulle d'info au survol du titre
- Met en forme les notes affichées (titres, citations, listes, gras/italique, liens) — seuls les liens vers AO3 ou vers une adresse relative sont acceptés, pour la sécurité

### 7. `noteManagement.js` — gestion des notes

- Affiche un compteur de mots en direct pendant qu'on écrit une note
- Ajoute une barre de recherche dans les notes, sur la page des favoris

### 8. `sortingAndFiltering.js` — tri et filtres

- Permet de cacher ou montrer les favoris qui pointent vers des fics supprimées ou verrouillées
- Ajoute des contrôles de tri qui restent en mémoire (par date, titre, fandom, croissant/décroissant)

### 9. `bookmarkStatus/statusIndicators.js` — badges de statut

- Affiche un badge ⭐/🔒 pour dire si un favori est public ou privé
- Affiche une icône 📝 avec un aperçu de la note au survol
- Affiche la date de dernière lecture
- Affiche un badge de complétion (✓/🔄) et un petit anneau qui montre la progression de lecture
- Propose un filtre (Tous / Favorisés / Pas favorisés)

### 10. `bookmarkStatus/readingStatusTracking.js` — suivi de lecture

- Enregistre la date de dernière lecture d'une fic
- Replie les notes de plus de 200 caractères, avec un bouton pour tout voir
- Ajoute une recherche dans les notes
- Signale (ou cache) les favoris qui pointent vers des fics supprimées ou restreintes

### 11. `bookmarkVault.css`

- Les styles visuels de tous les fichiers ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

Tous les items ci-dessous sont résolus — le détail (avec les raisons des
écartés) est dans la section « Fonctionnalités non implémentées » plus bas.

- ~~Masquer les favoris des personnes qu'on a bloquées~~ ✅ `blockedBookmarks.js` (liste de blocage de User Relationships)
- ~~Exporter en CSV ou en HTML~~ ✅ sélecteur de format JSON/CSV/HTML sur le bouton Export
- ~~Des rappels pour réviser les vieux favoris (3/6/12 mois)~~ ✅ réglage `staleReminderMonths` + bandeau 🔔 avec surlignage
- ~~Une note personnelle en 5 étoiles~~ ✅ `personalRatings.js` (★ locales, listes + page de fic)
- ~~Un historique des versions d'une note~~ ✅ intégré à `richTextNotes.js` (5 versions, restaurables depuis l'éditeur)
- ~~Des modèles de notes tout prêts~~ ✅ 3 modèles dans l'éditeur (Reading log / Quotes / Reactions)
- ~~Un raccourci pour afficher les infos d'un favori sans quitter la page~~ ✅ aperçu au survol du lien "🔖 My Bookmark"
- ~~Une recherche avancée "et/ou" dans les notes~~ ✅ opérateurs `&&` et `||`
- ~~Écrire une note personnelle sur n'importe quelle fic~~ ✅ bouton 📝 sur toute page de fic (`quickNoteOnWorkPage`)
- ~~Une vue qui regroupe les favoris d'une même série~~ ✅ tri "Series"
- ~~Modifier plusieurs favoris à la fois~~ ✅ actions en masse locales 📂 Catégorie + 📌 Pin (la partie serveur AO3 reste écartée)
- ~~Un mode notes rapides pendant la lecture~~ ✅ même bouton 📝 sur la page de lecture
- ~~Mettre en évidence une note importante~~ ✅ convention : note commençant par `!` (bordure + ⚠)
- ~~Voir la date du favori en survolant la liste~~ ✅ déjà affichée nativement par AO3
- ~~Icône dans les résultats de recherche AO3 pour les fics annotées~~ ✅ déjà fait (`statusIndicators` décore toutes les listes)
- ~~Markdown + sections repliables dans les notes~~ ✅ déjà couvert (markdown simple + repli des notes longues + `<details>` de l'auto-fill)
- ~~Tag "en cours" automatique selon la complétion~~ ✅ déjà fait (auto-fill : "WIP" / "Read up to chapter X")
- ~~Note privée locale en plus de la note publique AO3~~ ✅ déjà l'architecture actuelle (note inline locale + note de bookmark AO3)
- ~~Copie du résumé et des chiffres au moment du favori~~ ✅ déjà couvert (l'auto-fill fige titre/auteur/résumé/état dans la note)
- ~~Détecter et fusionner les favoris en double~~ ❌ écarté (impossibles par construction : un favori par fic et par compte)
- ~~Un affichage "pinboard" en cartes~~ ❌ écarté (refonte UI pour un gain esthétique)
- ~~Réordonner par glisser-déposer~~ ❌ écarté (ordre contrôlé par le serveur AO3)
- ~~Des tags personnels sur n'importe quelle fic~~ ❌ écarté (rôle des notes autonomes de `skipWorks` + catégories du Vault)
- ~~Des dossiers intelligents auto-triés~~ ❌ écarté (auto-fandom existe déjà, les filtres AO3 couvrent le reste)
- ~~Modifier un favori AO3 depuis la liste~~ ❌ écarté (écriture serveur fragile — la note locale s'édite déjà en ligne)
- ~~Suggestions de tags automatiques~~ ❌ écarté (heuristique arbitraire)
- ~~Mettre en favori automatiquement selon des règles~~ ❌ écarté (pas d'écriture automatique sur AO3)
- ~~Mettre en évidence certains tags dans la liste des favoris~~ ❌ écarté (rôle du surlignage de `tagsDisplay`)
- ~~Favori automatique à 90 % de lecture~~ ❌ écarté (pas d'écriture automatique sur AO3)
- ~~Suggérer des fics similaires depuis les favoris~~ ❌ écarté (rôle du module `similarFics`)

## Explicitement écarté

- Synchroniser les favoris dans les deux sens avec un autre système, avec gestion des conflits — jugé trop compliqué pour peu d'intérêt
- Exporter les favoris sous forme d'image ou de PDF — jugé hors sujet

## Précision

⚠️ Une doc historique affirmait que presque tout le module n'était fait que
de fichiers vides ("stubs"). C'est clairement obsolète : le code réel
comporte tous les fichiers listés ci-dessus, chacun avec une implémentation
complète.



AO3 Helper — Bookmark Vault Coordinator
    Module ID:    bookmarkVault
    Display Name: Bookmark Vault
    Tab:          Library

    Components (class instantiation pattern, imported directly as ES modules):
        StatusIndicators      -- badges, status filter
        RichTextNotes         -- auto-fill, inline editing
        OrganizationTools     -- categories, bulk, pin
        ReadingStatusTracking -- last read, note collapse

    Core children (self-registering, imported for side effects):
        bookmarkNavigation, bookmarkMaintenance, noteManagement,
        noteDisplay, sortingAndFiltering

    Storage keys:
        ao3h:bookmarkVault:data        -- { [workId]: { pub, notes } }
        ao3h:bookmarkVault:inlineNotes -- { [workId]: string }
        ao3h:bookmarkVault:lastRead    -- { [workId]: timestamp }
        ao3h:bookmarkVault:lastExport  -- timestamp (ms)
        ao3h:bookmarkVault:categories  -- [{ id, name, color, workIds[] }]
        ao3h:bookmarkVault:pinned      -- [workId, ...]


        // ── Feature list ────────────────────────────────────────────────────────
// 1. Auto-tick "Private" checkbox on the AO3 bookmark form (opt-in via
//    privateByDefault setting; watches for AJAX-opened forms too)
// 2. Export badge + button on the bookmarks page — shows last export date
//    (or warns if never exported); clicking exports ao3h:bookmarkVault:data
//    as a timestamped JSON and updates the badge immediately
// 3. Analytics dashboard (collapsible) — total count, top fandoms, WIP
//    vs complete ratio, public vs private ratio (opt-in)


// ── Feature list ────────────────────────────────────────────────────────
// 1. "Back to work" button on the bookmark form page — restores context
//    after navigating to /bookmarks/new or /bookmarks/:id/edit
//    (stores the originating URL in sessionStorage on work page visit)
// 2. "My Bookmark" link in the work actions bar — visible when the work
//    is already in the user's bookmarkVault data cache


AO3 Helper — Organization Tools
    Submodule of: bookmarkVault

    - Category creation + labels on blurbs
    - Filter by category on bookmarks page
    - Bulk selection (checkboxes + batch actions with confirmation)
    - Pin bookmarks to top of list



AO3 Helper — Rich Text Notes
    Submodule of: bookmarkVault

    - Auto-fill bookmark form (title, author, summary, work ID, tags)
    - Auto-tag fandom (first fandom tag) when autoTagFandom is on
    - Auto-tag AO3 rating (General/Teen/Mature/Explicit) when autoTagRating is on
    - Inline note editing on bookmark listing blurbs
    - Auto-save while typing; Markdown-style preview


    
═══════════════════════════════════════════════════════════════════════════
  # bookmarkVault
  **Tab :** Library
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Bookmark Vault** transforme la gestion des favoris AO3 en un véritable outil d’organisation.

* Il permet notamment de :
  - afficher des badges de statut sur les favoris ;
  - enrichir et modifier les notes associées aux favoris ;
  - créer des catégories personnalisées ;
  - filtrer et trier les favoris ;
  - épingler certains favoris en haut de la liste ;
  - sélectionner plusieurs favoris pour effectuer des actions groupées ;
  - faciliter la navigation entre une œuvre et son formulaire de favori ;
  - suivre la dernière lecture et la progression ;
  - repérer les œuvres supprimées ou restreintes ;
  - exporter les données locales des favoris ;
  - afficher des statistiques générales sur la bibliothèque de favoris.

---

# Réglages utilisateur

| Réglage                       | Description                                                                                                  |
| ----------------------------- |--------------------------------------------------------------------------------------------------------------|
| `showPublicPrivateBadge`      | Affiche un badge `⭐` ou `🔒` indiquant si le favori est public ou privé.                                   |
| `showNoteIcon`                | Affiche une icône `📝` lorsqu’un favori contient une note.                                                  |
| `showLastReadDate`            | Affiche la dernière date de lecture sous la forme « Last read: X days ago ».                                 |
| `bookmarkStatusFilterEnabled` | Active le filtre de statut dans les listes.                                                                  |
| `bookmarkStatusFilterDefault` | Définit la vue par défaut du filtre : tous, favorisés ou non favorisés.                                      |
| `showStatusFilterCount`       | Affiche un compteur à côté du filtre de statut.                                                              |
| `inlineNoteEditing`           | Permet de modifier une note directement depuis une liste ou depuis la page de l’œuvre.                       |
| `autoFillBookmarkForm`        | Préremplit le titre, l’auteur, le résumé et les autres informations de l’œuvre dans le formulaire de favori. |
| `createCategories`            | Active la création de catégories personnalisées.                                                             |
| `showCategoryLabels`          | Affiche les étiquettes de catégorie sur les favoris.                                                         |
| `filterByCategory`            | Permet de filtrer les favoris selon leur catégorie.                                                          |
| `hideDeletedWorks`            | Masque les œuvres supprimées ou restreintes au lieu d’afficher un avertissement `⚠️`.                       |
| `pinBookmarks`                | Permet d’épingler des favoris en haut de la liste.                                                           |
| `bulkSelection`               | Active la sélection multiple et les actions groupées.                                                        |
| `privateByDefault`            | Coche automatiquement l’option **Private** dans le formulaire de favori.                                     |
| `assignToCategories`          | Classe automatiquement les nouveaux favoris dans une catégorie selon leur fandom.                            |
| `defaultSort`                 | Définit le tri par défaut : date, titre, fandom ou note.                                                     |
| `autoTagFandom`               | Ajoute automatiquement le premier tag de fandom au favori.                                                   |
| `autoTagRating`               | Ajoute automatiquement le rating AO3 de l’œuvre.                                                             |
| `showAnalyticsDashboard`      | Affiche un tableau de bord contenant des statistiques sur les favoris.                                       |
| `showBackButton`              | Affiche un bouton « ← Back to work » après la création ou la modification d’un favori.                       |
| `showViewBookmarkLink`        | Affiche un lien « 🔖 My Bookmark » sur les pages des œuvres déjà mises en favori.                           |
| `showCompletionBadge`         | Affiche un badge `✓` ou `🔄` indiquant si l’œuvre est terminée ou en cours.                                 |
| `showProgressRing`            | Affiche un anneau représentant la progression de lecture.                                                    |

---

# Structure du module

Le module est composé d’un fichier coordinateur, de neuf fichiers fonctionnels, de deux sous-modules regroupés dans le dossier `bookmarkStatus` et d’une feuille de style.

```text
_bookmarkVault.js
organizationTools.js
richTextNotes.js
bookmarkMaintenance.js
bookmarkNavigation.js
noteDisplay.js
noteManagement.js
sortingAndFiltering.js
bookmarkStatus/
    statusIndicators.js
    readingStatusTracking.js
bookmarkVault.css
```

Le coordinateur utilise deux modes d’intégration :

* certains composants sont importés comme classes et instanciés directement ;
* les autres sous-modules s’enregistrent eux-mêmes et sont importés pour leurs effets de bord.

---

# _bookmarkVault.js

## Rôle

Fichier coordinateur du module.

Il initialise l’ensemble des composants de **Bookmark Vault** et veille à ce que chaque partie du module puisse fonctionner indépendamment.

---

## Responsabilités

* Importe et initialise les différents composants du module.
* Isole l’initialisation de chaque composant afin qu’une erreur dans un sous-module n’empêche pas les autres de fonctionner.
* Initialise directement les composants fondés sur des classes.
* Charge les sous-modules qui s’enregistrent eux-mêmes.
* Centralise les principales clés de stockage utilisées par le module.

---

## Fonctions exposées

Le document d’origine ne décrit pas d’API publique spécifique pour ce coordinateur.

Les composants directement instanciés sont :

* `StatusIndicators`
* `RichTextNotes`
* `OrganizationTools`
* `ReadingStatusTracking`

Les sous-modules importés pour leur enregistrement automatique sont :

* `bookmarkNavigation`
* `bookmarkMaintenance`
* `noteManagement`
* `noteDisplay`
* `sortingAndFiltering`

---

## Détails techniques

Les principales clés de stockage sont :

```text
ao3h:bookmarkVault:data
ao3h:bookmarkVault:inlineNotes
ao3h:bookmarkVault:lastRead
ao3h:bookmarkVault:lastExport
ao3h:bookmarkVault:categories
ao3h:bookmarkVault:pinned
```

La clé :

```text
ao3h:bookmarkVault:data
```

contient les données principales des favoris sous une forme comparable à :

```text
{
  [workId]: {
    pub,
    notes
  }
}
```

La clé :

```text
ao3h:bookmarkVault:inlineNotes
```

contient les notes modifiées directement depuis les listes :

```text
{
  [workId]: string
}
```

La clé :

```text
ao3h:bookmarkVault:lastRead
```

contient la date de dernière lecture de chaque œuvre :

```text
{
  [workId]: timestamp
}
```

La clé :

```text
ao3h:bookmarkVault:lastExport
```

contient la date du dernier export sous forme d’un timestamp en millisecondes.

La clé :

```text
ao3h:bookmarkVault:categories
```

contient les catégories personnalisées :

```text
[
  {
    id,
    name,
    color,
    workIds[]
  }
]
```

La clé :

```text
ao3h:bookmarkVault:pinned
```

contient la liste des identifiants des œuvres épinglées :

```text
[workId, ...]
```

---

# organizationTools.js

## Rôle

Gère les outils d’organisation des favoris, notamment les catégories, l’épinglage, la sélection multiple et le tri.

---

## Fonctionnalités

### Catégories personnalisées

Permet de créer ses propres catégories de favoris.

Chaque catégorie peut contenir :

* un identifiant ;
* un nom ;
* une couleur ;
* une liste d’œuvres associées.

---

### Étiquettes de catégorie

Affiche une étiquette sur chaque favori afin d’indiquer la catégorie à laquelle il appartient.

Cette fonctionnalité dépend du réglage :

```text
showCategoryLabels
```

---

### Filtrage par catégorie

Ajoute un filtre permettant d’afficher uniquement les favoris appartenant à une catégorie choisie.

Cette fonctionnalité dépend du réglage :

```text
filterByCategory
```

---

### Attribution automatique

Peut ranger automatiquement un nouveau favori dans une catégorie correspondant à son fandom.

Cette fonctionnalité dépend du réglage :

```text
assignToCategories
```

---

### Sélection multiple

Ajoute une case de sélection à chaque favori afin de pouvoir en sélectionner plusieurs à la fois.

Les actions groupées actuelles permettent principalement de supprimer plusieurs favoris avec une demande de confirmation.

Cette fonctionnalité dépend du réglage :

```text
bulkSelection
```

---

### Épinglage

Permet d’épingler certains favoris afin qu’ils apparaissent en haut de la liste.

Les identifiants concernés sont enregistrés sous :

```text
ao3h:bookmarkVault:pinned
```

Cette fonctionnalité dépend du réglage :

```text
pinBookmarks
```

---

### Tri

Propose un tri des favoris selon différents critères, notamment :

* la date ;
* le titre ;
* le fandom.

Le réglage `defaultSort` mentionne également la note comme possibilité de tri.

---

## Détails techniques

Le sous-module est instancié directement par `_bookmarkVault.js` à partir du composant :

```text
OrganizationTools
```

Les catégories sont enregistrées sous :

```text
ao3h:bookmarkVault:categories
```

---

## Dépendances

* `_bookmarkVault.js`
* les données locales de **Bookmark Vault**
* le DOM des pages de favoris AO3

---

# richTextNotes.js

## Rôle

Gère le préremplissage des formulaires de favori, la modification directe des notes et leur mise en forme enrichie.

---

## Fonctionnalités

### Préremplissage du formulaire

Remplit automatiquement le formulaire de favori à partir des informations présentes sur la page de l’œuvre.

Les données récupérées peuvent comprendre :

* le titre ;
* l’auteur ;
* le résumé ;
* l’identifiant de l’œuvre ;
* les tags.

Cette fonctionnalité dépend du réglage :

```text
autoFillBookmarkForm
```

---

### Tag automatique du fandom

Lorsque `autoTagFandom` est activé, le sous-module ajoute automatiquement le premier tag de fandom au formulaire de favori.

---

### Tag automatique du rating

Lorsque `autoTagRating` est activé, le sous-module ajoute automatiquement le rating AO3 de l’œuvre.

Les ratings reconnus comprennent notamment :

* General ;
* Teen ;
* Mature ;
* Explicit.

---

### Modification directe des notes

Permet de modifier une note directement depuis un blurb dans la liste des favoris.

Cette fonctionnalité dépend du réglage :

```text
inlineNoteEditing
```

---

### Sauvegarde automatique

Les modifications sont sauvegardées automatiquement pendant la saisie.

Les notes modifiées directement peuvent être enregistrées sous :

```text
ao3h:bookmarkVault:inlineNotes
```

---

### Mise en forme enrichie

Les notes prennent en charge une partie de la syntaxe de type Markdown, notamment :

* le gras ;
* l’italique ;
* le code.

Le sous-module peut également afficher un aperçu du rendu de la note.

---

## Détails techniques

Le sous-module est instancié directement par `_bookmarkVault.js` à partir du composant :

```text
RichTextNotes
```

---

## Dépendances

* `_bookmarkVault.js`
* les pages d’œuvres et de favoris AO3
* le stockage local du module

---

# bookmarkMaintenance.js

## Rôle

Gère les outils d’entretien, d’exportation et d’analyse générale des favoris.

---

## Fonctionnalités

### Favoris privés par défaut

Lorsque `privateByDefault` est activé, le sous-module coche automatiquement l’option **Private** dans le formulaire de favori.

Il surveille également les formulaires ouverts dynamiquement par AJAX afin d’appliquer cette préférence.

---

### Export des favoris

Ajoute un bouton permettant d’exporter les données enregistrées sous :

```text
ao3h:bookmarkVault:data
```

L’export produit un fichier JSON dont le nom contient un horodatage.

Après l’export, la date est immédiatement enregistrée sous :

```text
ao3h:bookmarkVault:lastExport
```

---

### Badge de fraîcheur de l’export

Affiche un badge indiquant la date du dernier export.

Le badge :

* est vert lorsque le dernier export remonte à moins de 30 jours ;
* est orange lorsqu’il remonte à plus de 30 jours ;
* affiche un avertissement lorsqu’aucun export n’a encore été effectué.

---

### Tableau de bord analytique

Lorsque `showAnalyticsDashboard` est activé, le sous-module affiche un tableau de bord repliable contenant notamment :

* le nombre total de favoris ;
* les fandoms les plus favorisés ;
* le ratio entre œuvres en cours et œuvres terminées ;
* le ratio entre favoris publics et privés.

---

## Détails techniques

Le sous-module s’enregistre lui-même et est importé par `_bookmarkVault.js`.

L’export actuellement pris en charge utilise uniquement le format JSON.

---

## Dépendances

* `_bookmarkVault.js`
* `ao3h:bookmarkVault:data`
* `ao3h:bookmarkVault:lastExport`

---

# bookmarkNavigation.js

## Rôle

Facilite la navigation entre la page d’une œuvre et son formulaire de favori.

---

## Fonctionnalités

### Retour vers l’œuvre

Ajoute un bouton :

```text
← Back to work
```

après la création ou la modification d’un favori.

Cette fonctionnalité dépend du réglage :

```text
showBackButton
```

---

### Conservation de l’URL d’origine

Lorsqu’une page d’œuvre est visitée, l’URL d’origine est enregistrée dans `sessionStorage`.

Cette adresse est ensuite utilisée pour revenir à l’œuvre après une navigation vers :

```text
/bookmarks/new
```

ou :

```text
/bookmarks/:id/edit
```

---

### Lien vers le favori

Ajoute un lien :

```text
🔖 My Bookmark
```

dans la barre d’actions d’une œuvre lorsqu’elle existe déjà dans les données locales de **Bookmark Vault**.

Cette fonctionnalité dépend du réglage :

```text
showViewBookmarkLink
```

---

## Détails techniques

Le sous-module s’enregistre lui-même et est importé pour ses effets de bord par `_bookmarkVault.js`.

La présence du lien **My Bookmark** dépend des données contenues dans le cache local du module.

---

## Dépendances

* `_bookmarkVault.js`
* `sessionStorage`
* `ao3h:bookmarkVault:data`

---

# noteDisplay.js

## Rôle

Contrôle l’affichage visuel des notes dans les listes de favoris.

---

## Fonctionnalités

### Repli des notes longues

Replie les notes trop longues et ajoute un bouton permettant de les ouvrir ou de les refermer.

Les contrôles affichés sont :

```text
Show more
Show less
```

---

### Aperçu au survol

Affiche une bulle d’information lorsque l’utilisateur survole le titre d’un favori.

---

### Mise en forme des notes

Interprète certains éléments de mise en forme dans les notes affichées, notamment :

* les titres ;
* les citations ;
* les listes ;
* le gras ;
* l’italique ;
* les liens.

---

### Sécurité des liens

Seuls les liens suivants sont acceptés :

* les liens vers AO3 ;
* les liens utilisant une adresse relative.

Les autres adresses sont refusées afin de limiter les risques liés au contenu injecté.

---

## Détails techniques

Le sous-module s’enregistre lui-même et est importé par `_bookmarkVault.js`.

Le repli des notes longues complète les fonctionnalités de `readingStatusTracking.js`.

---

## Dépendances

* `_bookmarkVault.js`
* les notes présentes dans les blurbs AO3

---

# noteManagement.js

## Rôle

Ajoute des outils pratiques pour rédiger et retrouver les notes associées aux favoris.

---

## Fonctionnalités

### Compteur de mots

Affiche un compteur de mots actualisé en direct pendant la rédaction d’une note.

---

### Recherche dans les notes

Ajoute une barre de recherche sur la page des favoris afin de rechercher du texte à l’intérieur des notes.

---

## Détails techniques

Le sous-module s’enregistre lui-même et est importé par `_bookmarkVault.js`.

---

## Dépendances

* `_bookmarkVault.js`
* les pages de favoris AO3
* les notes affichées dans la liste

---

# sortingAndFiltering.js

## Rôle

Gère le tri des favoris et l’affichage des œuvres supprimées, verrouillées ou restreintes.

---

## Fonctionnalités

### Œuvres indisponibles

Détecte les favoris pointant vers des œuvres :

* supprimées ;
* verrouillées ;
* restreintes.

Selon le réglage `hideDeletedWorks`, ces entrées peuvent :

* être masquées ;
* rester visibles avec un badge d’avertissement `⚠️`.

---

### Tri persistant

Ajoute des contrôles de tri dont l’état est mémorisé.

Les critères comprennent notamment :

* la date ;
* le titre ;
* le fandom.

Le tri peut être appliqué :

* en ordre croissant ;
* en ordre décroissant.

---

## Détails techniques

Le sous-module s’enregistre lui-même et est importé par `_bookmarkVault.js`.

Le réglage général du tri par défaut est :

```text
defaultSort
```

---

## Dépendances

* `_bookmarkVault.js`
* les pages de favoris AO3
* le stockage local utilisé pour mémoriser le tri

---

# bookmarkStatus/statusIndicators.js

## Rôle

Affiche les principaux badges de statut et fournit un filtre permettant de distinguer les œuvres déjà mises en favori.

---

## Fonctionnalités

### Badge public ou privé

Affiche :

* `⭐` pour un favori public ;
* `🔒` pour un favori privé.

Cette fonctionnalité dépend du réglage :

```text
showPublicPrivateBadge
```

---

### Icône de note

Affiche une icône :

```text
📝
```

lorsqu’un favori contient une note.

Un aperçu de la note peut être affiché au survol.

Cette fonctionnalité dépend du réglage :

```text
showNoteIcon
```

---

### Dernière lecture

Affiche la dernière date de lecture sous une forme similaire à :

```text
Last read: X days ago
```

Cette fonctionnalité dépend du réglage :

```text
showLastReadDate
```

---

### Badge de complétion

Affiche un badge indiquant l’état de l’œuvre :

* `✓` lorsqu’elle est terminée ;
* `🔄` lorsqu’elle est en cours.

Cette fonctionnalité dépend du réglage :

```text
showCompletionBadge
```

---

### Anneau de progression

Affiche un petit anneau représentant la progression de lecture.

Cette fonctionnalité dépend du réglage :

```text
showProgressRing
```

---

### Filtre de statut

Ajoute un filtre proposant les vues suivantes :

* Tous ;
* Favorisés ;
* Pas favorisés.

Le filtre dépend de :

```text
bookmarkStatusFilterEnabled
bookmarkStatusFilterDefault
showStatusFilterCount
```

Le réglage `showStatusFilterCount` ajoute un compteur à côté des différentes options.

> 🐛 Bug corrigé : `bookmarkStatusFilterDefault` et `showStatusFilterCount`
> étaient invisibles en permanence dans le panneau (bloc replié sans jamais
> être dépliable), même une fois `bookmarkStatusFilterEnabled` coché.
> `lib/ui/panel/configs/library/bookmarkVault-config.js` n'avait aucun
> mécanisme de câblage pour ce module avant que ça ne soit ajouté.

---

## Détails techniques

Le sous-module est instancié directement par `_bookmarkVault.js` à partir du composant :

```text
StatusIndicators
```

Les données principales proviennent de :

```text
ao3h:bookmarkVault:data
ao3h:bookmarkVault:lastRead
```

---

## Dépendances

* `_bookmarkVault.js`
* `readingStatusTracking.js`
* les données locales des favoris

---

# bookmarkStatus/readingStatusTracking.js

## Rôle

Suit l’activité de lecture associée aux favoris et fournit plusieurs outils liés aux notes et aux œuvres indisponibles.

---

## Fonctionnalités

### Date de dernière lecture

Enregistre la dernière date à laquelle une œuvre a été consultée.

Les données sont enregistrées sous :

```text
ao3h:bookmarkVault:lastRead
```

---

### Repli des notes longues

Replie les notes dépassant 200 caractères et ajoute un bouton pour afficher leur contenu complet.

Cette fonctionnalité recoupe le système d’affichage des notes longues de `noteDisplay.js`.

---

### Recherche dans les notes

Ajoute une fonction de recherche à l’intérieur des notes.

Cette fonctionnalité complète également celle de `noteManagement.js`.

---

### Œuvres supprimées ou restreintes

Détecte les favoris associés à des œuvres supprimées ou restreintes.

Selon la configuration, ces œuvres peuvent :

* être signalées ;
* être masquées.

---

## Détails techniques

Le sous-module est instancié directement par `_bookmarkVault.js` à partir du composant :

```text
ReadingStatusTracking
```

---

## Dépendances

* `_bookmarkVault.js`
* `statusIndicators.js`
* `noteDisplay.js`
* `noteManagement.js`
* `sortingAndFiltering.js`

---

# bookmarkVault.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Bookmark Vault**.

Il définit notamment l’apparence :

* des badges publics et privés ;
* des icônes de notes ;
* des badges de complétion ;
* des anneaux de progression ;
* des catégories et de leurs couleurs ;
* des favoris épinglés ;
* des contrôles de sélection multiple ;
* des outils de tri et de filtrage ;
* des notes repliées ;
* des aperçus au survol ;
* du tableau de bord analytique ;
* du badge de fraîcheur des exports ;
* des boutons de navigation.

---

# Fonctionnalités non implémentées

## ~~Intégration avec le blocage~~ ✅ Fait

~~Masquer les favoris créés par des personnes bloquées.~~

> Ajouté : `blockedBookmarks.js` — sur les listes publiques de bookmarks,
> les blurbs créés par un utilisateur de la liste de blocage de User
> Relationships (`userBlocker:list`) sont masqués, avec réaction en direct
> aux changements de la liste. Les pages de tes propres favoris ne sont pas
> touchées. Réglage `hideBlockedUsersBookmarks` (activé par défaut).

---

## ~~Formats d'export supplémentaires~~ ✅ Fait

~~Permettre l'export des favoris en CSV et HTML.~~

> Le bouton Export propose désormais JSON / CSV / HTML (`vaultTools.js`) —
> le HTML est une page autonome avec liens vers AO3, le CSV inclut les
> notes de bookmark et les notes personnelles.

---

## ~~Rappels d'entretien~~ ✅ Fait

~~Afficher des rappels pour réviser les favoris non consultés depuis 3/6/12 mois.~~

> Réglage `staleReminderMonths` (jamais / 3 / 6 / 12) : bandeau "🔔 X
> bookmarks not opened for N+ months" sur la page des favoris, avec un
> bouton qui surligne les fics concernées de la page. Basé sur les dates de
> dernière ouverture suivies par `readingStatusTracking`.

---

## ~~Note personnelle sur cinq étoiles~~ ✅ Fait

~~Ajouter une note personnelle sur cinq étoiles, distincte des tags, des notes et du rating AO3.~~

> Ajouté : `personalRatings.js` — ★★★★★ locales à côté de chaque note
> (listes de favoris et page de la fic), recliquer la même étoile efface.
> Réglage `showPersonalRating`.

---

## ~~Détection des doublons~~ ❌ Écarté

~~Détecter et fusionner les favoris en double.~~

> Écarté : AO3 n'autorise qu'un favori par fic et par compte, et le cache
> local est indexé par identifiant de fic — les doublons sont impossibles
> par construction.

---

## ~~Historique des notes~~ ✅ Fait

~~Conserver les versions successives d'une note afin de pouvoir revenir à une version précédente.~~

> Intégré à `richTextNotes.js` — chaque sauvegarde conserve l'ancienne version
> (5 max par fic), restaurables depuis le sélecteur "↩ Previous versions"
> de l'éditeur.

---

## ~~Affichage Pinboard~~ ❌ Écarté

~~Ajouter une vue sous forme de cartes afin de parcourir visuellement les favoris et leurs notes.~~

> Écarté : refonte d'affichage complète pour un bénéfice surtout
> esthétique — la liste AO3 enrichie (aperçus de notes, étoiles, badges,
> catégories, tri) couvre déjà la consultation.

---

## ~~Modèles de notes~~ ✅ Fait

~~Proposer des modèles prêts à utiliser (carnet de lecture, citations, réactions).~~

> Ajouté : trois boutons de modèles dans l'éditeur de note (📓 Reading log,
> 💬 Quotes, 💭 Reactions), avec confirmation avant d'écraser une note
> existante.

---

## ~~Réorganisation manuelle~~ ❌ Écarté

~~Permettre de réordonner les favoris par glisser-déposer.~~

> Écarté : l'ordre des favoris est contrôlé par AO3 côté serveur et
> re-trié à chaque chargement/pagination — un ordre manuel ne survivrait
> pas. Le tri client + l'épinglage en haut couvrent le besoin.

---

## ~~Aperçu rapide~~ ✅ Fait

~~Afficher les informations détaillées d'un favori sans quitter la page actuelle.~~

> Le lien "🔖 My Bookmark" des pages de fic affiche au survol la
> visibilité du favori, un extrait de sa note AO3 et de la note
> personnelle.

---

## ~~Tags personnels globaux~~ ❌ Écarté

~~Créer des tags personnels utilisables sur n'importe quelle œuvre, même non favorite.~~

> Écarté (hors périmètre) : les annotations sur n'importe quelle fic sont
> le rôle des notes autonomes de `skipWorks` ; les catégories du Vault
> couvrent le classement des favoris. Dupliquer un troisième système de
> tags créerait de la confusion.

---

## ~~Dossiers intelligents~~ ❌ Écarté

~~Créer des catégories automatiques fondées sur des critères (fandom, longueur, statut...).~~

> Écarté : l'auto-affectation par fandom existe déjà
> (`assignToCategories`), et les filtres AO3 (tags de bookmark, y compris
> ceux posés par l'auto-fill : WIP, tranches de longueur…) couvrent les
> autres critères sans dupliquer un moteur de règles.

---

## ~~Modification rapide d'un favori~~ ❌ Écarté

~~Modifier directement toutes les informations d'un favori depuis la liste.~~

> Écarté : modifier un favori côté AO3 (tags, visibilité) exigerait de
> rejouer le formulaire AO3 avec son jeton — fragile, avec risque de perte
> du bookmark en cas d'échec. La note personnelle, elle, s'édite déjà en
> ligne dans la liste.

---

## ~~Date du favori au survol~~ ✅ Déjà couvert

~~Afficher la date de création du favori au survol dans une liste.~~

> AO3 affiche nativement la date de chaque bookmark sur les listes de
> favoris — rien à ajouter.

---

## ~~Suggestions automatiques de tags~~ ❌ Écarté

~~Suggérer des tags à partir du contenu des notes et des habitudes de lecture.~~

> Écarté : heuristique spéculative aux résultats arbitraires ; l'auto-fill
> pose déjà les tags objectifs (WIP, tranche de longueur, fandom, rating).

---

## ~~Mise en favori automatique~~ ❌ Écarté

~~Créer automatiquement un favori selon des règles personnelles (par exemple tout un auteur).~~

> Écarté : créer des favoris à l'insu de l'utilisateur exigerait des
> écritures automatiques sur AO3 — contraire à la ligne du projet (aucune
> action serveur automatique, cf. les téléchargements auto également
> écartés).

---

## ~~Recherche avancée dans les notes~~ ✅ Fait

~~Ajouter des opérateurs ET / OU pour des recherches complexes dans les notes.~~

> La recherche de notes accepte désormais `a && b` (tous les termes) et
> `a || b` (au moins un) — `noteQueryMatch` dans `vaultTools.js`.

---

## ~~Mise en évidence des tags~~ ❌ Écarté

~~Choisir certains tags à mettre visuellement en évidence dans les listes de favoris.~~

> Écarté (hors périmètre) : le surlignage de tags choisis existe déjà dans
> `tagsDisplay` (tag highlighting) et s'applique aussi aux listes de
> favoris — le dupliquer ici créerait deux réglages concurrents.

---

## ~~Notes sur les œuvres non favorites~~ ✅ Fait

~~Écrire une note personnelle sur n'importe quelle œuvre, même non favorite.~~

> Le bouton "📝 Note" des pages de fic (réglage `quickNoteOnWorkPage`)
> fonctionne pour toute fic, favorite ou non — la note reste locale. Sur
> les listes, les notes autonomes de `skipWorks` couvrent le même besoin.

---

## ~~Mise en favori selon la progression~~ ❌ Écarté

~~Créer automatiquement un favori à 90 % de lecture.~~

> Écarté : même raison que la mise en favori automatique — pas d'écriture
> automatique sur AO3.

---

## ~~Regroupement par série~~ ✅ Fait

~~Regrouper les favoris appartenant à une même série.~~

> Ajouté : option de tri "Series" — les fics d'une même série deviennent
> adjacentes dans la liste (les fics hors série passent à la fin).

---

## ~~Icône dans les résultats de recherche~~ ✅ Déjà fait (doc en retard)

~~Afficher une icône dans les résultats AO3 quand une œuvre possède déjà une note personnelle.~~

> `statusIndicators.js` décore déjà les listes générales (pas seulement
> les favoris) : icône de note (`showNoteIcon`), badge public/privé, etc.

---

## ~~Actions groupées avancées~~ ✅ Fait (partie locale) / ❌ Écarté (partie serveur)

~~Modifier plusieurs favoris à la fois (tags, note, visibilité).~~

> Ajouté : la barre de sélection multiple propose désormais "📂 Category"
> (affecter la sélection à une catégorie, créée au besoin) et "📌 Pin",
> en plus de la suppression. La modification en masse côté AO3 (tags,
> public/privé) reste écartée : écritures serveur fragiles (jeton de
> formulaire), risque de perte de bookmarks.

---

## ~~Mise en forme avancée des notes~~ ✅ Déjà couvert

~~Syntaxe Markdown plus complète, avec sections repliables.~~

> Les notes personnelles acceptent le Markdown simple (gras, italique,
> code) et `noteDisplay.js` rend les notes AO3 avec un Markdown contraint
> + repli automatique des notes longues. L'auto-fill utilise déjà des
> `<details>` repliables dans les notes AO3.

---

## ~~Tag automatique de progression~~ ✅ Déjà fait (doc en retard)

~~Ajouter automatiquement un tag "en cours" selon la complétion.~~

> L'auto-fill du formulaire pose déjà "WIP" et "Read up to chapter X" pour
> les fics inachevées, et une tranche de longueur pour les complètes. La
> personnalisation fine des libellés n'a pas été retenue (valeurs stables
> nécessaires pour que les filtres AO3 restent utiles).

---

## ~~Note locale privée distincte~~ ✅ Déjà couvert

~~Deux notes séparées : publique sur AO3, privée locale, avec bascule.~~

> C'est l'architecture actuelle : la note du bookmark AO3 (publique ou
> privée selon le réglage AO3) et la note personnelle inline (stockée
> localement, jamais envoyée à AO3) coexistent et s'affichent côte à côte
> sur les listes.

---

## ~~Mode de prise de notes rapide~~ ✅ Fait

~~Interface pour écrire rapidement des notes pendant la lecture.~~

> Le bouton "📝 Note" sous le titre de la fic (réglage
> `quickNoteOnWorkPage`) ouvre l'éditeur inline (modèles, historique,
> sauvegarde automatique) sans quitter la lecture.

---

## ~~Notes importantes~~ ✅ Fait

~~Marquer une note comme importante (couleur, icône), distinct de l'épinglage.~~

> Convention : une note personnelle commençant par `!` est mise en
> évidence (bordure orange, fond teinté, icône ⚠) partout où son aperçu
> apparaît.

---

## ~~Copie historique des métadonnées~~ ✅ Déjà couvert

~~Conserver résumé et statistiques au moment de la mise en favori.~~

> L'auto-fill fige déjà dans la note du bookmark le titre, l'auteur, le
> résumé, l'état WIP/chapitres et la tranche de mots au moment de la mise
> en favori — la comparaison avec l'état actuel se fait en rouvrant la
> fic. Un instantané chiffré complet (kudos, hits…) n'a pas été retenu :
> il ferait gonfler le stockage pour un usage marginal.

---

## ~~Suggestions d'œuvres similaires~~ ❌ Écarté

~~Utiliser les favoris pour suggérer des œuvres similaires.~~

> Écarté (hors périmètre) : la recommandation de fics est le rôle du
> module `similarFics` (onglet Explore) — le Vault reste un outil de
> gestion, pas un moteur de suggestion.

---

# Décisions de conception

## Synchronisation bidirectionnelle

Le module ne synchronise pas les favoris dans les deux sens avec un système externe.

La gestion des conflits nécessaire à cette fonctionnalité a été jugée trop complexe pour le bénéfice apporté.

---

## Export sous forme d’image ou de PDF

Le module ne permet pas d’exporter les favoris sous forme :

* d’image ;
* de PDF.

Ces formats ont été jugés hors sujet pour ce module.

---

# Précision historique

Une ancienne documentation affirmait que presque tout le module était composé de fichiers vides ou de simples structures provisoires.

Cette information est désormais obsolète.

Le code actuel contient tous les fichiers décrits dans cette documentation, chacun disposant d’une implémentation fonctionnelle.
