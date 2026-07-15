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
