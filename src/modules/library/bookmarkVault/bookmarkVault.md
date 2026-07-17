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

## Fichiers

### 1. `_bookmarkVault.js` — le chef d'orchestre

- Met en route tous les autres fichiers de ce module, chacun indépendamment (si l'un a un problème, les autres continuent de fonctionner)

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

- Masquer les favoris des personnes qu'on a bloquées — aucun lien avec le module de blocage n'existe dans le code
- Exporter en CSV ou en HTML — seul le format JSON existe
- Des rappels pour réviser les vieux favoris qu'on n'a pas consultés depuis longtemps (3/6/12 mois)
- Une note personnelle en 5 étoiles, séparée des tags et des notes de texte
- Détecter et fusionner les favoris en double
- Un historique des versions d'une note, pour pouvoir revenir en arrière
- Un affichage en tableau de cartes ("pinboard") pour parcourir les notes visuellement
- Des modèles de notes tout prêts (carnet de lecture, citations, réactions)
- Réordonner les favoris à la main par glisser-déposer
- Un raccourci pour afficher rapidement les infos d'un favori sans quitter la page en cours
- Des tags personnels séparés des tags AO3, utilisables sur n'importe quelle fic, pas seulement les favoris
- Des dossiers de favoris intelligents qui se trient tout seuls selon des critères (fandom, longueur, statut...)
- Modifier un favori rapidement directement depuis la liste, sans ouvrir sa page
- Voir la date du favori en survolant la liste
- Des suggestions de tags automatiques basées sur le contenu des notes et les habitudes de lecture
- Mettre en favori automatiquement selon des règles personnelles (par exemple toujours favoriser les fics d'un auteur précis)
- Une recherche avancée avec des opérateurs "et/ou" dans toutes les notes
- Mettre en évidence certains tags choisis directement dans la liste des favoris
- Écrire une note personnelle sur n'importe quelle fic, même si elle n'est pas mise en favori
- Mettre automatiquement une fic en favori quand tu arrives presque à la fin (par exemple à 90% de lecture), sans avoir à cliquer toi-même sur le bouton
- Une vue qui regroupe tous tes favoris d'une même série, pour voir d'un coup où tu en es dans chaque histoire de la série
- Afficher une petite icône dans les résultats de recherche AO3 (pas seulement dans la liste des favoris) pour montrer qu'une fic a déjà une note personnelle
- Modifier plusieurs favoris à la fois (changer leur tag, leur note ou les passer en privé d'un coup) — la sélection multiple ne sert aujourd'hui qu'à supprimer
- Une mise en forme plus poussée dans les notes, façon markdown, avec des sections qu'on peut replier
- Ajouter automatiquement un tag "en cours" selon que la fic est terminée ou non, avec des règles personnalisables
- Avoir une note privée gardée seulement pour toi, en plus de la note publique visible sur AO3, avec un bouton pour passer de l'une à l'autre
- Un mode spécial pour écrire des notes très vite pendant qu'on est en train de lire
- Mettre en évidence visuellement une note importante (par une couleur ou une icône d'alerte), différent de l'épingler en haut de la liste
- Garder une copie du résumé et des chiffres (mots, kudos...) de la fic au moment où tu la mets en favori, pour pouvoir comparer si elle change plus tard
- Utiliser tes favoris pour te suggérer des fics similaires, en te basant sur ce que tu as déjà mis de côté

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

Il permet notamment de :

* afficher des badges de statut sur les favoris ;
* enrichir et modifier les notes associées aux favoris ;
* créer des catégories personnalisées ;
* filtrer et trier les favoris ;
* épingler certains favoris en haut de la liste ;
* sélectionner plusieurs favoris pour effectuer des actions groupées ;
* faciliter la navigation entre une œuvre et son formulaire de favori ;
* suivre la dernière lecture et la progression ;
* repérer les œuvres supprimées ou restreintes ;
* exporter les données locales des favoris ;
* afficher des statistiques générales sur la bibliothèque de favoris.

---

# Réglages utilisateur

| Réglage                       | Défaut    | Description                                                                                                  |
| ----------------------------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| `showPublicPrivateBadge`      | Activé    | Affiche un badge `⭐` ou `🔒` indiquant si le favori est public ou privé.                                     |
| `showNoteIcon`                | Activé    | Affiche une icône `📝` lorsqu’un favori contient une note.                                                   |
| `showLastReadDate`            | Désactivé | Affiche la dernière date de lecture sous la forme « Last read: X days ago ».                                 |
| `bookmarkStatusFilterEnabled` | Désactivé | Active le filtre de statut dans les listes.                                                                  |
| `bookmarkStatusFilterDefault` | `all`     | Définit la vue par défaut du filtre : tous, favorisés ou non favorisés.                                      |
| `showStatusFilterCount`       | Désactivé | Affiche un compteur à côté du filtre de statut.                                                              |
| `inlineNoteEditing`           | Activé    | Permet de modifier une note directement depuis une liste ou depuis la page de l’œuvre.                       |
| `autoFillBookmarkForm`        | Activé    | Préremplit le titre, l’auteur, le résumé et les autres informations de l’œuvre dans le formulaire de favori. |
| `createCategories`            | Activé    | Active la création de catégories personnalisées.                                                             |
| `showCategoryLabels`          | Activé    | Affiche les étiquettes de catégorie sur les favoris.                                                         |
| `filterByCategory`            | Activé    | Permet de filtrer les favoris selon leur catégorie.                                                          |
| `hideDeletedWorks`            | Désactivé | Masque les œuvres supprimées ou restreintes au lieu d’afficher un avertissement `⚠️`.                        |
| `pinBookmarks`                | Désactivé | Permet d’épingler des favoris en haut de la liste.                                                           |
| `bulkSelection`               | Activé    | Active la sélection multiple et les actions groupées.                                                        |
| `privateByDefault`            | Désactivé | Coche automatiquement l’option **Private** dans le formulaire de favori.                                     |
| `assignToCategories`          | Activé    | Classe automatiquement les nouveaux favoris dans une catégorie selon leur fandom.                            |
| `defaultSort`                 | `date`    | Définit le tri par défaut : date, titre, fandom ou note.                                                     |
| `autoTagFandom`               | Désactivé | Ajoute automatiquement le premier tag de fandom au favori.                                                   |
| `autoTagRating`               | Désactivé | Ajoute automatiquement le rating AO3 de l’œuvre.                                                             |
| `showAnalyticsDashboard`      | Désactivé | Affiche un tableau de bord contenant des statistiques sur les favoris.                                       |
| `showBackButton`              | Activé    | Affiche un bouton « ← Back to work » après la création ou la modification d’un favori.                       |
| `showViewBookmarkLink`        | Activé    | Affiche un lien « 🔖 My Bookmark » sur les pages des œuvres déjà mises en favori.                            |
| `showCompletionBadge`         | Désactivé | Affiche un badge `✓` ou `🔄` indiquant si l’œuvre est terminée ou en cours.                                  |
| `showProgressRing`            | Désactivé | Affiche un anneau représentant la progression de lecture.                                                    |

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

## Intégration avec le blocage

Masquer les favoris créés par des personnes bloquées.

Aucune intégration avec le module de blocage n’existe actuellement.

---

## Formats d’export supplémentaires

Permettre l’export des favoris dans les formats :

* CSV ;
* HTML.

Seul le format JSON est actuellement disponible.

---

## Rappels d’entretien

Afficher des rappels pour réviser les favoris qui n’ont pas été consultés depuis :

* 3 mois ;
* 6 mois ;
* 12 mois.

---

## Note personnelle sur cinq étoiles

Ajouter une note personnelle sur cinq étoiles, distincte :

* des tags ;
* des notes textuelles ;
* du rating AO3.

---

## Détection des doublons

Détecter et fusionner les favoris en double.

---

## Historique des notes

Conserver les versions successives d’une note afin de pouvoir revenir à une version précédente.

---

## Affichage Pinboard

Ajouter une vue sous forme de cartes afin de parcourir visuellement les favoris et leurs notes.

---

## Modèles de notes

Proposer des modèles prêts à utiliser, par exemple :

* carnet de lecture ;
* citations ;
* réactions.

---

## Réorganisation manuelle

Permettre de réordonner les favoris par glisser-déposer.

---

## Aperçu rapide

Ajouter un raccourci permettant d’afficher les informations détaillées d’un favori sans quitter la page actuelle.

---

## Tags personnels globaux

Créer des tags personnels distincts des tags AO3 et utilisables sur n’importe quelle œuvre, même lorsqu’elle n’est pas mise en favori.

---

## Dossiers intelligents

Créer des catégories automatiques fondées sur des critères tels que :

* le fandom ;
* la longueur ;
* le statut de complétion ;
* d’autres métadonnées.

---

## Modification rapide d’un favori

Permettre de modifier directement toutes les informations d’un favori depuis la liste, sans ouvrir sa page.

La modification directe actuelle concerne principalement la note.

---

## Date du favori au survol

Afficher la date de création du favori lorsqu’il est survolé dans une liste.

---

## Suggestions automatiques de tags

Suggérer des tags à partir :

* du contenu des notes ;
* des habitudes de lecture ;
* des données de l’œuvre.

---

## Mise en favori automatique

Permettre de créer automatiquement un favori selon des règles personnelles, par exemple pour toutes les œuvres d’un auteur choisi.

---

## Recherche avancée dans les notes

Ajouter des opérateurs de recherche tels que :

* `ET`
* `OU`

afin d’effectuer des recherches complexes dans l’ensemble des notes.

---

## Mise en évidence des tags

Permettre de choisir certains tags à mettre visuellement en évidence dans les listes de favoris.

---

## Notes sur les œuvres non favorites

Permettre d’écrire une note personnelle sur n’importe quelle œuvre, même lorsqu’elle n’est pas mise en favori.

---

## Mise en favori selon la progression

Créer automatiquement un favori lorsque la progression de lecture atteint un seuil, par exemple 90 %.

---

## Regroupement par série

Ajouter une vue regroupant tous les favoris appartenant à une même série afin d’afficher la progression dans chaque œuvre de cette série.

---

## Icône dans les résultats de recherche

Afficher une icône dans les résultats de recherche AO3 lorsqu’une œuvre possède déjà une note personnelle.

---

## Actions groupées avancées

Permettre de modifier plusieurs favoris à la fois, notamment pour :

* changer leurs tags ;
* modifier leur note ;
* les rendre privés ;
* les rendre publics.

La sélection multiple actuelle sert uniquement à la suppression.

---

## Mise en forme avancée des notes

Ajouter une syntaxe de type Markdown plus complète, avec notamment des sections repliables.

---

## Tag automatique de progression

Ajouter automatiquement un tag comme « en cours » selon que l’œuvre est terminée ou non.

Les règles de cette attribution pourraient être personnalisables.

---

## Note locale privée distincte

Permettre de conserver deux notes séparées :

* une note publique enregistrée sur AO3 ;
* une note privée uniquement conservée localement.

Un bouton permettrait de passer de l’une à l’autre.

---

## Mode de prise de notes rapide

Ajouter une interface spéciale permettant d’écrire rapidement des notes pendant la lecture.

---

## Notes importantes

Permettre de marquer une note comme importante à l’aide :

* d’une couleur ;
* d’une icône d’avertissement ;
* d’un style particulier.

Cette fonctionnalité serait différente de l’épinglage du favori.

---

## Copie historique des métadonnées

Conserver une copie des informations de l’œuvre au moment de sa mise en favori, notamment :

* le résumé ;
* le nombre de mots ;
* le nombre de kudos ;
* les autres statistiques.

Cela permettrait de détecter les changements ultérieurs.

---

## Suggestions d’œuvres similaires

Utiliser les favoris existants pour suggérer des œuvres similaires à partir des habitudes et préférences de l’utilisateur.

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
