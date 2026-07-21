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
| `addNavLinks` | activé | Ajoute des liens Bookmarks / Marked for Later / Historique dans le menu (Historique pointe vers le tableau de bord de lecture si `readingDashboard` est activé) |
| `menuActivation` | `hover` | Comment les menus s'ouvrent : au survol de la souris, ou seulement au clic — les flèches du clavier fonctionnent dans les deux modes |
| `backToSearch` | activé | Un lien "← Back to search" sur les pages de fics, vers la dernière page de résultats visitée (filtres conservés) |
| `breadcrumbs` | désactivé | Un fil d'Ariane sous l'en-tête, construit depuis l'URL |
| `quickLinksEnabled` | désactivé | Active les liens rapides personnalisés (jusqu'à 5, avec un nom et une adresse — un emoji en début de nom fait office d'icône) |
| `quickLinksDropdown` | désactivé | Regroupe les liens rapides sous un menu déroulant "☆ Quick Links" |
| `quickLink1Label` … `quickLink5Label` | (vide) | Le nom du lien rapide N |
| `quickLink1Url` … `quickLink5Url` | (vide) | L'adresse du lien rapide N |

Le panneau de réglages propose aussi une recherche Fandom/Pairing
(autocomplete AO3) qui remplit automatiquement le premier lien rapide vide.

## Fichiers

### 1. `_mainNavigation.js` — le chef d'orchestre

- Met en route les trois autres fichiers de ce module
- Retrouve le nom d'utilisateur pour savoir vers quelles pages pointer les liens
- Ne s'active pas sur la page d'historique des kudos, pour éviter les conflits avec le menu propre à cette page

### 2. `addNavLinks.js` — liens rapides vers ton activité

- Ajoute trois liens dans le menu : 🔖 Bookmarks, 📌 Marked for Later, 📚 Historique
- N'affiche que les liens qui peuvent vraiment fonctionner (il faut être connecté)
- Le lien Historique pointe vers la page personnelle (où s'affiche le tableau de bord de lecture) quand le module `readingDashboard` est activé

### 3. `menuActivation.js` — mode d'ouverture des menus

- Bascule entre l'ouverture au survol de la souris (comportement normal d'AO3) et l'ouverture au clic uniquement
- En mode "clic", un seul menu peut être ouvert à la fois, et il se ferme si on clique ailleurs
- Navigation au clavier dans les deux modes : ←/→ entre les menus, ↓/↑ dans un menu ouvert, Échap pour fermer

### 4. `quickLinks.js` — liens personnalisés

- Permet d'ajouter jusqu'à 5 liens personnalisés (avec un nom et une adresse) dans le menu
- Vérifie que l'adresse est valide avant de l'ajouter
- Peut regrouper les liens sous un menu déroulant "☆ Quick Links" (réglage `quickLinksDropdown`)

### 5. `backToSearch.js` — retour vers la recherche (ajouté au passage chantier 4)

- Mémorise la dernière page de listing/recherche visitée dans l'onglet (URL complète, filtres inclus)
- Sur les pages de fics, affiche un lien "← Back to search" vers cette page

### 6. `breadcrumbs.js` — fil d'Ariane (ajouté au passage chantier 4)

- Affiche un petit fil d'Ariane sous l'en-tête, construit depuis l'URL (aucune requête)

### Calculs de navigation — intégrés à `_mainNavigation.js`

- Reconnaissance des pages "origine de recherche" (`isSearchOrigin`, s'appuie sur `lib/ao3/parsers.js`)
- Décomposition d'un chemin AO3 en segments de fil d'Ariane (`buildBreadcrumbs`, avec décodage des tags `*s*`/`*a*`/`*d*`)

### 8. `mainNavigation.css`

- Les styles visuels des liens ajoutés, du mode "menu au clic", du lien de retour à la recherche et du fil d'Ariane

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs. État après le passage
chantier 4 (2026-07-18) :

- ~~Un bouton "← Retour à la recherche" sur les pages de fics, qui ramène intelligemment à la page de résultats précédente en gardant les filtres actifs~~ ✅ Fait — `backToSearch.js` : la dernière page de listing/recherche visitée dans l'onglet est mémorisée (sessionStorage, URL complète donc filtres inclus) et un lien "← Back to search" apparaît au-dessus du texte sur les pages de work. Réglage `backToSearch` (activé par défaut)
- ~~Voir plusieurs pages précédentes dans une liste déroulante~~ ❌ Écarté — le navigateur offre déjà exactement ça (appui long sur le bouton Retour) ; le réimplémenter en userscript ne couvrirait que les pages du même onglet, en moins bien
- ~~Un bouton "Suivant" pour compléter le retour en arrière~~ ❌ Écarté — même raison : c'est le bouton Suivant du navigateur
- ~~Garder en mémoire les pages fermées récemment pour pouvoir les rouvrir~~ ❌ Écarté — un userscript n'a aucun accès aux onglets du navigateur (pas d'API tabs), il ne peut pas savoir qu'un onglet a été fermé ; les navigateurs le font déjà (Ctrl+Shift+T, menu historique)
- ~~Un raccourci plus malin vers la page "parente" (série, collection, page auteur)~~ ❌ Écarté — AO3 affiche déjà tous ces liens sur chaque page de work (byline de l'auteur, bloc "Part X of Y" de la série, collections) ; un doublon dans la barre de navigation n'apporte rien
- ~~Accès rapide à des tags ou fandoms personnalisés~~ ✅ Fait (déjà couvert) — c'est exactement ce que permettent les quick links (URL libre : n'importe quelle page de tag/fandom/pairing), désormais aidés par la recherche autocomplete ci-dessous
- ~~Une liste des liens récemment visités~~ ❌ Écarté — doublon de l'historique du navigateur ; pour les fics spécifiquement, `readingTracker` (historique), `readingDashboard` et `fanficBingeMode` (blocs "Continue Reading") couvrent déjà ce besoin
- ~~Des menus déroulants personnalisés dans la barre de navigation~~ ✅ Fait — réglage `quickLinksDropdown` : les quick links se regroupent sous un menu déroulant "☆ Quick Links" qui reprend la structure native des menus AO3 (survol et mode clic fonctionnent dessus sans code particulier)
- ~~Personnaliser les icônes des liens~~ ✅ Fait (déjà possible) — le libellé d'un quick link est du texte libre : commencer le libellé par un emoji donne une "icône" au lien ; le placeholder du panneau le suggère désormais. Les icônes des 3 liens intégrés restent fixes (cohérent avec la décision "un seul réglage pour le groupe")
- ~~Cacher les éléments du menu qu'on ne veut pas voir~~ ❌ Écarté — extension directe de la décision déjà prise pour la recherche ("jugée risquée, elle pourrait casser la navigation") : masquer des entrées natives du menu porte le même risque
- ~~Un historique de navigation "intelligent" qui ignore les redirections~~ ❌ Écarté — doublon de l'historique du navigateur ; un userscript ne voit pas les redirections de façon fiable
- ~~Un fil d'Ariane (breadcrumb) pour se repérer~~ ✅ Fait — `breadcrumbs.js` : petit fil d'Ariane sous l'en-tête (Works › Work 123 › Chapter…), construit uniquement depuis l'URL (`_mainNavigation.js` → `buildBreadcrumbs`), aucune requête. Réglage `breadcrumbs` (désactivé par défaut)
- ~~Un lien rapide vers l'historique des kudos donnés~~ ✅ Fait, mais pas ici — la route virtuelle `/kudos-history` n'était un vestige que tant que rien ne la rendait ; `ficAppreciation/kudosHistoryPage.js` la rend maintenant (page "My Kudos" listant les fics kudosées, avec recherche). Le lien lui-même est injecté par `ficAppreciation`, pas par `mainNavigation` — ce module n'a pas de mécanisme générique permettant à un autre module d'enregistrer un lien dans sa nav, donc chaque module qui a besoin d'un lien l'injecte lui-même (même pattern que ce fichier utilise déjà en interne). `mainNavigation` continue de se désactiver entièrement sur cette route (`isKudosHistoryPage()` dans `_mainNavigation.js`) — pas de breadcrumb/quick links dessus, hors périmètre de ce changement
- ~~Un petit chiffre sur les liens Historique et Mark for Later pour indiquer combien de nouveautés il y a~~ ❌ Écarté — demanderait de récupérer et parser ces pages à chaque chargement (coût réseau permanent) ; `notificationCenter` fournit déjà des notifications de mise à jour des œuvres suivies
- ~~Quand on ajoute un lien personnalisé, pouvoir chercher un fandom ou un pairing dans une liste plutôt que de devoir taper l'adresse à la main~~ ✅ Fait — le panneau de réglages a maintenant une recherche Fandom/Pairing branchée sur l'autocomplete natif d'AO3 (`/autocomplete/fandom`, `/autocomplete/relationship`) ; choisir un résultat remplit le premier emplacement de lien vide (libellé + URL de la page de works du tag)
- ~~Faire pointer le lien Historique vers le tableau de bord de lecture (si ce module-là est activé) plutôt que toujours vers la page historique classique d'AO3~~ ✅ Fait — automatique : quand le module `readingDashboard` est activé (vérifié via ses flags), le lien 📚 History pointe vers la page personnelle `/users/{user}` où ce tableau de bord s'affiche
- ~~Se déplacer dans les menus du haut avec les flèches du clavier, pour les personnes qui n'utilisent pas la souris~~ ✅ Fait — dans `menuActivation.js` : ←/→ passe d'un menu à l'autre, ↓ ouvre le menu et descend dans ses entrées, ↑ remonte, Échap ferme et rend le focus au titre du menu. Actif dans les deux modes (survol et clic)

## Explicitement écarté

- Des raccourcis clavier globaux comme Alt+flèche gauche, Ctrl+H, Alt+B ou Alt+M pour naviguer — abandonné car ça entre en collision avec des raccourcis déjà utilisés par le navigateur
- Une barre de liens sur le côté de la page (sidebar) — le menu du haut suffit déjà
- Une option pour cacher complètement la recherche du menu — jugée risquée, elle pourrait casser la navigation
- Un interrupteur séparé pour chaque lien du menu (Bookmarks, Marked for Later, Historique) un par un — inutile, un seul interrupteur pour le groupe suffit

## Précision

⚠️ Les docs historiques présentaient un bouton "← Back to Search" comme un
comportement automatique central de ce module, alors qu'il n'existait pas
dans le code. Depuis le passage chantier 4 (2026-07-18), la fonctionnalité
existe réellement (`backToSearch.js`) — la doc et le code sont désormais
d'accord.

## Détails techniques

- `backToSearch.js` mémorise la dernière page de listing/recherche visitée
  dans la clé `sessionStorage` `ao3h:nav:lastSearchUrl`.
- `_mainNavigation.js` expose `isSearchOrigin()` (reconnaissance des pages
  "origine de recherche", via `lib/ao3/parsers.js`) et `buildBreadcrumbs()`
  (décomposition d'un chemin AO3 en segments, avec décodage des tags
  `*s*`/`*a*`/`*d*`).
