# mainNavigation

**Tab:** Navigate & Interact

## À quoi ça sert

Ce module améliore la barre de navigation principale d'AO3 (le menu en
haut de la page) : des liens rapides vers ton activité personnelle, un
choix entre menus qui s'ouvrent au survol ou au clic, et jusqu'à 5 liens
personnalisés.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `addNavLinks` | activé | Ajoute des liens Bookmarks / Marked for Later / Historique dans le menu |
| `menuActivation` | `hover` | Comment les menus s'ouvrent : au survol de la souris, ou seulement au clic |
| `quickLinksEnabled` | désactivé | Active les liens rapides personnalisés (jusqu'à 5, avec un nom et une adresse) |
| `quickLink1Label` … `quickLink5Label` | (vide) | Le nom du lien rapide N |
| `quickLink1Url` … `quickLink5Url` | (vide) | L'adresse du lien rapide N |

## Fichiers

### 1. `_mainNavigation.js` — le chef d'orchestre

- Met en route les trois autres fichiers de ce module
- Retrouve le nom d'utilisateur pour savoir vers quelles pages pointer les liens
- Ne s'active pas sur la page d'historique des kudos, pour éviter les conflits avec le menu propre à cette page

### 2. `addNavLinks.js` — liens rapides vers ton activité

- Ajoute trois liens dans le menu : 🔖 Bookmarks, 📌 Marked for Later, 📚 Historique
- N'affiche que les liens qui peuvent vraiment fonctionner (il faut être connecté)

### 3. `menuActivation.js` — mode d'ouverture des menus

- Bascule entre l'ouverture au survol de la souris (comportement normal d'AO3) et l'ouverture au clic uniquement
- En mode "clic", un seul menu peut être ouvert à la fois, et il se ferme si on clique ailleurs

### 4. `quickLinks.js` — liens personnalisés

- Permet d'ajouter jusqu'à 5 liens personnalisés (avec un nom et une adresse) dans le menu
- Vérifie que l'adresse est valide avant de l'ajouter

### 5. `mainNavigation.css`

- Les styles visuels des liens ajoutés et du mode "menu au clic"

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Un bouton "← Retour à la recherche" sur les pages de fics, qui ramène intelligemment à la page de résultats précédente en gardant les filtres actifs
- Voir plusieurs pages précédentes dans une liste déroulante
- Un bouton "Suivant" pour compléter le retour en arrière
- Garder en mémoire les pages fermées récemment pour pouvoir les rouvrir
- Un raccourci plus malin vers la page "parente" (série, collection, page auteur)
- Accès rapide à des tags ou fandoms personnalisés
- Une liste des liens récemment visités
- Des menus déroulants personnalisés dans la barre de navigation
- Personnaliser les icônes des liens
- Cacher les éléments du menu qu'on ne veut pas voir
- Un historique de navigation "intelligent" qui ignore les redirections
- Un fil d'Ariane (breadcrumb) pour se repérer
- Un lien rapide vers l'historique des kudos donnés
- Un petit chiffre sur les liens Historique et Mark for Later pour indiquer combien de nouveautés il y a
- Quand on ajoute un lien personnalisé, pouvoir chercher un fandom ou un pairing dans une liste plutôt que de devoir taper l'adresse à la main
- Faire pointer le lien Historique vers le tableau de bord de lecture (si ce module-là est activé) plutôt que toujours vers la page historique classique d'AO3
- Se déplacer dans les menus du haut avec les flèches du clavier, pour les personnes qui n'utilisent pas la souris

## Explicitement écarté

- Des raccourcis clavier globaux comme Alt+flèche gauche, Ctrl+H, Alt+B ou Alt+M pour naviguer — abandonné car ça entre en collision avec des raccourcis déjà utilisés par le navigateur
- Une barre de liens sur le côté de la page (sidebar) — le menu du haut suffit déjà
- Une option pour cacher complètement la recherche du menu — jugée risquée, elle pourrait casser la navigation
- Un interrupteur séparé pour chaque lien du menu (Bookmarks, Marked for Later, Historique) un par un — inutile, un seul interrupteur pour le groupe suffit

## Précision

⚠️ Les docs historiques présentent un bouton "← Back to Search" (retour
intelligent vers la recherche) comme un comportement automatique central
de ce module. Il n'y a pourtant aucune trace de ce bouton dans le code
actuel — ni dans les 3 fichiers de fonctionnalités, ni ailleurs dans le
dossier. Cette fonctionnalité n'existe pas.
