# bookmarkVault

**Tab:** Library

## À quoi ça sert

Ce module transforme la gestion des favoris (bookmarks) AO3 en un vrai
outil d'organisation. Il permet notamment de :

- afficher des badges de statut sur les favoris (public/privé, note, complétion, progression de lecture) ;
- enrichir et modifier les notes associées aux favoris (mise en forme, historique de versions, recherche) ;
- créer des catégories personnalisées et filtrer par catégorie ;
- trier et filtrer les favoris ;
- épingler certains favoris en haut de la liste ;
- sélectionner plusieurs favoris pour effectuer des actions groupées ;
- faciliter la navigation entre une œuvre et son formulaire de favori ;
- suivre la dernière lecture et repérer les œuvres supprimées ou restreintes ;
- exporter les données locales des favoris (JSON/CSV/HTML) ;
- afficher un tableau de bord de statistiques sur la bibliothèque de favoris.

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

## Structure du module

Le module est composé d'un fichier coordinateur, de plusieurs fichiers
fonctionnels, de deux sous-modules regroupés dans le dossier
`bookmarkStatus/`, et d'une feuille de style :

```text
_bookmarkVault.js
organizationTools.js
richTextNotes.js
bookmarkMaintenance.js
bookmarkNavigation.js
noteDisplay.js
noteManagement.js
sortingAndFiltering.js
vaultTools.js            (Chantier 4)
personalRatings.js       (Chantier 4)
blockedBookmarks.js      (Chantier 4)
bookmarkStatus/
    statusIndicators.js
    readingStatusTracking.js
bookmarkVault.css
```

Le coordinateur utilise deux modes d'intégration : certains composants
(`StatusIndicators`, `RichTextNotes`, `OrganizationTools`,
`ReadingStatusTracking`) sont importés comme classes et instanciés
directement ; les autres sous-modules (`bookmarkNavigation`,
`bookmarkMaintenance`, `noteManagement`, `noteDisplay`,
`sortingAndFiltering`, et les ajouts du Chantier 4) s'enregistrent
eux-mêmes et sont importés pour leurs effets de bord — si l'un a un
problème, les autres continuent de fonctionner.

Principales clés de stockage utilisées par le module :

```text
ao3h:bookmarkVault:data        -- { [workId]: { pub, notes } }
ao3h:bookmarkVault:inlineNotes -- { [workId]: string }
ao3h:bookmarkVault:lastRead    -- { [workId]: timestamp }
ao3h:bookmarkVault:lastExport  -- timestamp (ms)
ao3h:bookmarkVault:categories  -- [{ id, name, color, workIds[] }]
ao3h:bookmarkVault:pinned      -- [workId, ...]
```

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

> ⚠️ Le réglage `defaultSort` mentionne aussi la note comme critère de tri
> possible, alors que la description ci-dessus ne cite que date/titre/fandom
> — incohérence relevée dans une version antérieure de cette doc, non
> tranchée ici.

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

> 🐛 Bug corrigé : `bookmarkStatusFilterDefault` et `showStatusFilterCount`
> étaient invisibles en permanence dans le panneau (bloc replié sans jamais
> être dépliable), même une fois `bookmarkStatusFilterEnabled` coché.
> `lib/ui/panel/configs/library/bookmarkVault-config.js` n'avait aucun
> mécanisme de câblage pour ce module avant que ça ne soit ajouté.

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

## Fonctionnalités non implémentées

Détail des items de la section « Specs non implémentés » ci-dessus, avec
les raisons pour les items écartés.

### ~~Intégration avec le blocage~~ ✅ Fait

~~Masquer les favoris créés par des personnes bloquées.~~

> Ajouté : `blockedBookmarks.js` — sur les listes publiques de bookmarks,
> les blurbs créés par un utilisateur de la liste de blocage de User
> Relationships (`userBlocker:list`) sont masqués, avec réaction en direct
> aux changements de la liste. Les pages de tes propres favoris ne sont pas
> touchées. Réglage `hideBlockedUsersBookmarks` (activé par défaut).

### ~~Formats d'export supplémentaires~~ ✅ Fait

~~Permettre l'export des favoris en CSV et HTML.~~

> Le bouton Export propose désormais JSON / CSV / HTML (`vaultTools.js`) —
> le HTML est une page autonome avec liens vers AO3, le CSV inclut les
> notes de bookmark et les notes personnelles.

### ~~Rappels d'entretien~~ ✅ Fait

~~Afficher des rappels pour réviser les favoris non consultés depuis 3/6/12 mois.~~

> Réglage `staleReminderMonths` (jamais / 3 / 6 / 12) : bandeau "🔔 X
> bookmarks not opened for N+ months" sur la page des favoris, avec un
> bouton qui surligne les fics concernées de la page. Basé sur les dates de
> dernière ouverture suivies par `readingStatusTracking`.

### ~~Note personnelle sur cinq étoiles~~ ✅ Fait

~~Ajouter une note personnelle sur cinq étoiles, distincte des tags, des notes et du rating AO3.~~

> Ajouté : `personalRatings.js` — ★★★★★ locales à côté de chaque note
> (listes de favoris et page de la fic), recliquer la même étoile efface.
> Réglage `showPersonalRating`.

### ~~Détection des doublons~~ ❌ Écarté

~~Détecter et fusionner les favoris en double.~~

> Écarté : AO3 n'autorise qu'un favori par fic et par compte, et le cache
> local est indexé par identifiant de fic — les doublons sont impossibles
> par construction.

### ~~Historique des notes~~ ✅ Fait

~~Conserver les versions successives d'une note afin de pouvoir revenir à une version précédente.~~

> Intégré à `richTextNotes.js` — chaque sauvegarde conserve l'ancienne version
> (5 max par fic), restaurables depuis le sélecteur "↩ Previous versions"
> de l'éditeur.

### ~~Affichage Pinboard~~ ❌ Écarté

~~Ajouter une vue sous forme de cartes afin de parcourir visuellement les favoris et leurs notes.~~

> Écarté : refonte d'affichage complète pour un bénéfice surtout
> esthétique — la liste AO3 enrichie (aperçus de notes, étoiles, badges,
> catégories, tri) couvre déjà la consultation.

### ~~Modèles de notes~~ ✅ Fait

~~Proposer des modèles prêts à utiliser (carnet de lecture, citations, réactions).~~

> Ajouté : trois boutons de modèles dans l'éditeur de note (📓 Reading log,
> 💬 Quotes, 💭 Reactions), avec confirmation avant d'écraser une note
> existante.

### ~~Réorganisation manuelle~~ ❌ Écarté

~~Permettre de réordonner les favoris par glisser-déposer.~~

> Écarté : l'ordre des favoris est contrôlé par AO3 côté serveur et
> re-trié à chaque chargement/pagination — un ordre manuel ne survivrait
> pas. Le tri client + l'épinglage en haut couvrent le besoin.

### ~~Aperçu rapide~~ ✅ Fait

~~Afficher les informations détaillées d'un favori sans quitter la page actuelle.~~

> Le lien "🔖 My Bookmark" des pages de fic affiche au survol la
> visibilité du favori, un extrait de sa note AO3 et de la note
> personnelle.

### ~~Tags personnels globaux~~ ❌ Écarté

~~Créer des tags personnels utilisables sur n'importe quelle œuvre, même non favorite.~~

> Écarté (hors périmètre) : les annotations sur n'importe quelle fic sont
> le rôle des notes autonomes de `skipWorks` ; les catégories du Vault
> couvrent le classement des favoris. Dupliquer un troisième système de
> tags créerait de la confusion.

### ~~Dossiers intelligents~~ ❌ Écarté

~~Créer des catégories automatiques fondées sur des critères (fandom, longueur, statut...).~~

> Écarté : l'auto-affectation par fandom existe déjà
> (`assignToCategories`), et les filtres AO3 (tags de bookmark, y compris
> ceux posés par l'auto-fill : WIP, tranches de longueur…) couvrent les
> autres critères sans dupliquer un moteur de règles.

### ~~Modification rapide d'un favori~~ ❌ Écarté

~~Modifier directement toutes les informations d'un favori depuis la liste.~~

> Écarté : modifier un favori côté AO3 (tags, visibilité) exigerait de
> rejouer le formulaire AO3 avec son jeton — fragile, avec risque de perte
> du bookmark en cas d'échec. La note personnelle, elle, s'édite déjà en
> ligne dans la liste.

### ~~Date du favori au survol~~ ✅ Déjà couvert

~~Afficher la date de création du favori au survol dans une liste.~~

> AO3 affiche nativement la date de chaque bookmark sur les listes de
> favoris — rien à ajouter.

### ~~Suggestions automatiques de tags~~ ❌ Écarté

~~Suggérer des tags à partir du contenu des notes et des habitudes de lecture.~~

> Écarté : heuristique spéculative aux résultats arbitraires ; l'auto-fill
> pose déjà les tags objectifs (WIP, tranche de longueur, fandom, rating).

### ~~Mise en favori automatique~~ ❌ Écarté

~~Créer automatiquement un favori selon des règles personnelles (par exemple tout un auteur).~~

> Écarté : créer des favoris à l'insu de l'utilisateur exigerait des
> écritures automatiques sur AO3 — contraire à la ligne du projet (aucune
> action serveur automatique, cf. les téléchargements auto également
> écartés).

### ~~Recherche avancée dans les notes~~ ✅ Fait

~~Ajouter des opérateurs ET / OU pour des recherches complexes dans les notes.~~

> La recherche de notes accepte désormais `a && b` (tous les termes) et
> `a || b` (au moins un) — `noteQueryMatch` dans `vaultTools.js`.

### ~~Mise en évidence des tags~~ ❌ Écarté

~~Choisir certains tags à mettre visuellement en évidence dans les listes de favoris.~~

> Écarté (hors périmètre) : le surlignage de tags choisis existe déjà dans
> `tagsDisplay` (tag highlighting) et s'applique aussi aux listes de
> favoris — le dupliquer ici créerait deux réglages concurrents.

### ~~Notes sur les œuvres non favorites~~ ✅ Fait

~~Écrire une note personnelle sur n'importe quelle œuvre, même non favorite.~~

> Le bouton "📝 Note" des pages de fic (réglage `quickNoteOnWorkPage`)
> fonctionne pour toute fic, favorite ou non — la note reste locale. Sur
> les listes, les notes autonomes de `skipWorks` couvrent le même besoin.

### ~~Mise en favori selon la progression~~ ❌ Écarté

~~Créer automatiquement un favori à 90 % de lecture.~~

> Écarté : même raison que la mise en favori automatique — pas d'écriture
> automatique sur AO3.

### ~~Regroupement par série~~ ✅ Fait

~~Regrouper les favoris appartenant à une même série.~~

> Ajouté : option de tri "Series" — les fics d'une même série deviennent
> adjacentes dans la liste (les fics hors série passent à la fin).

### ~~Icône dans les résultats de recherche~~ ✅ Déjà fait (doc en retard)

~~Afficher une icône dans les résultats AO3 quand une œuvre possède déjà une note personnelle.~~

> `statusIndicators.js` décore déjà les listes générales (pas seulement
> les favoris) : icône de note (`showNoteIcon`), badge public/privé, etc.

### ~~Actions groupées avancées~~ ✅ Fait (partie locale) / ❌ Écarté (partie serveur)

~~Modifier plusieurs favoris à la fois (tags, note, visibilité).~~

> Ajouté : la barre de sélection multiple propose désormais "📂 Category"
> (affecter la sélection à une catégorie, créée au besoin) et "📌 Pin",
> en plus de la suppression. La modification en masse côté AO3 (tags,
> public/privé) reste écartée : écritures serveur fragiles (jeton de
> formulaire), risque de perte de bookmarks.

### ~~Mise en forme avancée des notes~~ ✅ Déjà couvert

~~Syntaxe Markdown plus complète, avec sections repliables.~~

> Les notes personnelles acceptent le Markdown simple (gras, italique,
> code) et `noteDisplay.js` rend les notes AO3 avec un Markdown contraint
> + repli automatique des notes longues. L'auto-fill utilise déjà des
> `<details>` repliables dans les notes AO3.

### ~~Tag automatique de progression~~ ✅ Déjà fait (doc en retard)

~~Ajouter automatiquement un tag "en cours" selon la complétion.~~

> L'auto-fill du formulaire pose déjà "WIP" et "Read up to chapter X" pour
> les fics inachevées, et une tranche de longueur pour les complètes. La
> personnalisation fine des libellés n'a pas été retenue (valeurs stables
> nécessaires pour que les filtres AO3 restent utiles).

### ~~Note locale privée distincte~~ ✅ Déjà couvert

~~Deux notes séparées : publique sur AO3, privée locale, avec bascule.~~

> C'est l'architecture actuelle : la note du bookmark AO3 (publique ou
> privée selon le réglage AO3) et la note personnelle inline (stockée
> localement, jamais envoyée à AO3) coexistent et s'affichent côte à côte
> sur les listes.

### ~~Mode de prise de notes rapide~~ ✅ Fait

~~Interface pour écrire rapidement des notes pendant la lecture.~~

> Le bouton "📝 Note" sous le titre de la fic (réglage
> `quickNoteOnWorkPage`) ouvre l'éditeur inline (modèles, historique,
> sauvegarde automatique) sans quitter la lecture.

### ~~Notes importantes~~ ✅ Fait

~~Marquer une note comme importante (couleur, icône), distinct de l'épinglage.~~

> Convention : une note personnelle commençant par `!` est mise en
> évidence (bordure orange, fond teinté, icône ⚠) partout où son aperçu
> apparaît.

### ~~Copie historique des métadonnées~~ ✅ Déjà couvert

~~Conserver résumé et statistiques au moment de la mise en favori.~~

> L'auto-fill fige déjà dans la note du bookmark le titre, l'auteur, le
> résumé, l'état WIP/chapitres et la tranche de mots au moment de la mise
> en favori — la comparaison avec l'état actuel se fait en rouvrant la
> fic. Un instantané chiffré complet (kudos, hits…) n'a pas été retenu :
> il ferait gonfler le stockage pour un usage marginal.

### ~~Suggestions d'œuvres similaires~~ ❌ Écarté

~~Utiliser les favoris pour suggérer des œuvres similaires.~~

> Écarté (hors périmètre) : la recommandation de fics est le rôle du
> module `similarFics` (onglet Explore) — le Vault reste un outil de
> gestion, pas un moteur de suggestion.

## Précision

⚠️ Une doc historique affirmait que presque tout le module n'était fait que
de fichiers vides ("stubs"). C'est clairement obsolète : le code réel
comporte tous les fichiers listés ci-dessus, chacun avec une implémentation
complète.
