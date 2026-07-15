# filterManager

**Tab:** Browse

## À quoi ça sert

Ce module enrichit le formulaire de filtres d'AO3 (recherche, pages de
tags, favoris, collections) avec des presets réutilisables, des filtres
rapides et des alertes.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `starredPresetsFirst` | activé | Épingle les presets favoris en haut de la liste |
| `presetHoverPreview` | activé | Aperçu des filtres au survol d'un preset |
| `rememberLastPresetByFandom` | activé | Pré-sélectionne le dernier preset utilisé pour ce fandom |
| `showExpandPreset` | activé | Affiche le bouton "Edit as chips" à côté d'Apply |
| `selectedLanguages` | (toutes) | Les langues affichées |
| `showLanguageBadge` | désactivé | Affiche un badge de langue sur les fics |
| `clickBadgeToFilter` | activé | Un clic sur le badge de langue filtre par cette langue |
| `warnExcludedWarning` | activé | Affiche une bannière si un avertissement officiel est exclu |
| `excludeWarningRemoveButton` | activé | Bouton "Remove exclusion" dans la bannière |
| `tagBundlesEnabled` | désactivé | Active les groupes de tags équivalents |
| `useBuiltinTropeBundles` | activé | Utilise les groupes de tags déjà prêts (Slow Burn, Enemies to Lovers...) |
| `quickFilterOneshot` | activé | Bouton bascule "One-shots only" |
| `quickFilterCrossover` | activé | Bouton bascule "Hide crossovers" |
| `hideKudosed` | désactivé | Cache les fics déjà kudosées |
| `hideSubscribed` | désactivé | Cache les fics déjà suivies |
| `hideBookmarked` | désactivé | Cache les fics déjà en favoris |
| `hideMFL` | désactivé | Cache les fics déjà dans "à lire plus tard" |
| `hideReadSeries` | désactivé | Cache les séries entièrement lues |
| `showHiddenCount` | activé | Affiche le compteur de fics cachées par l'historique |
| `rememberFilters` | activé | Se souvient des filtres actifs d'une session à l'autre |
| `oneshotDefault` / `crossoverDefault` | `all` | Les filtres appliqués par défaut au chargement |

## Fichiers

### 1. `_filterManager.js` — le chef d'orchestre

- Met en route les cinq autres fichiers de fonctionnalités et partage une liste de "groupes" de tags

### 2. `presetManagement.js` — presets de filtres

- Permet de sauvegarder la combinaison actuelle de filtres (tags, note, avertissements, mots-clés, tri...) sous un nom, pour la réappliquer en un clic
- Une barre d'outils avec un menu déroulant et une étoile pour les favoris
- Un mode "Éditer en chips" pour retoucher un preset avant de lancer la recherche
- Des raccourcis clavier pour appliquer ou sauvegarder rapidement un preset
- Se souvient du dernier preset utilisé pour chaque fandom
- Import/export des presets dans un fichier
- Des groupes de tags qui regroupent plusieurs variantes d'un même tag (par exemple "Slow Burn" regroupe plusieurs tags proches)

### 3. `languageBadges.js` — badges de langue

- Ajoute un badge (drapeau + nom de langue) après le titre de chaque fic, seulement s'il y a plusieurs langues différentes sur la page
- Cliquable pour filtrer directement sur cette langue

### 4. `filterWarnings.js` — bannière d'exclusion d'avertissement

- Détecte si l'adresse de la page exclut un des avertissements officiels
- Affiche une bannière avec un bouton pour retirer facilement cette exclusion

### 5. `userHistoryFilters.js` — filtres par historique

- Cache les fics déjà kudosées, déjà suivies, déjà en favoris, déjà dans "à lire plus tard", ou faisant partie d'une série entièrement lue
- Affiche un compteur du nombre de fics cachées par ces filtres

### 6. `worksFilterManager.js` — filtres rapides

- Ajoute des boutons "1️⃣ One-shots only" et "🚫 Hide crossovers" pour filtrer rapidement les résultats sans recharger la page

### 7. `filterManager.css`

- Les styles visuels de la barre de presets, des badges, de la bannière et des filtres rapides

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Pouvoir renommer un preset déjà sauvegardé
- Créer, renommer ou gérer ses propres groupes de tags équivalents (en ce moment on peut juste les sauvegarder, pas les modifier avec des boutons)
- Cacher les fics qui ont très peu de tags
- Cacher les fics trop courtes
- Cacher les fics postées anonymement
- Un bouton pour surligner les mots qu'on ne veut pas voir dans les fics — *ça existe déjà, mais dans un autre module (`hideByTags`), pas ici*
- Un bouton pour cacher ou réduire une fic individuellement, une par une
- Un bouton "Résumé présent" pour ne garder que les fics qui ont un résumé
- Cacher les fics dont l'histoire est terminée mais qu'on n'a pas encore lues (en plus de cacher juste les séries complètement lues)
- Réduire (au lieu de cacher complètement) les fics filtrées par l'historique
- Un raccourci clavier pour cacher rapidement une fic
- Remplacer les boutons one-shot/crossover par un choix à trois options (tout / seulement ça / jamais ça) au lieu d'un simple bouton on-off
- Deviner tout seul quels filtres te conviendraient, selon ton historique de lecture
- Cacher automatiquement toutes les fics déjà lues, pas seulement les séries entièrement lues
- Une logique de filtre avancée avec des règles "et / ou / sauf si" combinées
- Un mode pour construire ses propres règles de filtre avec un système visuel, plus un mode de débogage
- Filtrer selon l'ordre dans lequel les tags apparaissent
- Filtrer les fics selon leur ratio de kudos par rapport aux vues
- Filtrer par date (par exemple : mise à jour cette semaine)
- Cacher les fics abandonnées depuis plus d'un an
- Des statistiques sur les filtres qu'on utilise le plus souvent
- Partager ses presets de filtres publiquement avec les autres, avec des votes
- Des suggestions automatiques de filtres à essayer
- Regrouper les filtres par thème (longueur, contenu, découverte...) avec des raccourcis
- Programmer des filtres différents selon l'heure ou le jour
- Un historique de recherche qui montre les filtres utilisés à chaque recherche, et permet de les récupérer
- Chercher des mots-clés avec des règles compliquées (respecter les majuscules, chercher un morceau de mot, motifs spéciaux)
- Associer automatiquement des tags à un fandom précis pour tout le monde
- Filtrer par une plage de nombre de mots (un minimum ET un maximum), pas juste cacher les fics trop courtes
- Un réglage à part pour exclure aussi les one-shots qui font partie d'une série, pas juste les one-shots isolés
- Des badges visuels sur les fics one-shot dans la liste, en plus du bouton de filtre
- Exiger une longueur minimale pour le résumé, pas juste vérifier qu'il y en a un
- Organiser ses presets dans des dossiers ou des catégories, et les afficher sous forme de cartes visuelles (icône, nombre de tags, date de dernière utilisation)
- Synchroniser automatiquement ses presets de filtres entre plusieurs appareils
- Garder des réglages de filtres différents selon le type de page (recherche, tags, favoris...) au lieu d'un seul réglage valable partout
- Prévenir quand un même tag est à la fois inclus et exclu dans la recherche, ce qui crée un conflit
- Avertir avant même d'ouvrir une fic si elle contient des mots ou tags à risque, avec différents niveaux de gravité
- Étendre tous les filtres du module aux pages "Historique" et "Favoris", pas seulement aux pages de recherche et de tags
- Pouvoir régler la sensibilité de la bannière d'exclusion d'avertissement, et la fermer définitivement pour ne plus la revoir
- Un mode qui n'affiche le badge de langue que pour les langues qu'on ne préfère pas, au lieu de toutes les langues
- Revoir rapidement, type par type (kudos, abonnements, favoris...), les fics cachées par les filtres d'historique sans tout désactiver
- Pouvoir combiner deux presets de filtres pour en faire un seul d'un coup, plutôt que d'en appliquer un seul à la fois
- Avertir aussi quand on exclut un couple, un tag ou un trope qu'on a l'habitude d'inclure ou qui est très populaire, pas seulement les avertissements officiels d'AO3

## Explicitement écarté

- Appliquer un preset tout seul en arrivant sur une page, sans cliquer dessus — pour éviter les surprises
- Fusionner ce module avec `hideByTags` et d'autres modules de masquage en un seul gros module — jugé trop différent pour être réuni
- Refaire des filtres qu'AO3 propose déjà nativement (plus de 30 réglages) — jugé inutile, ce module vient compléter les filtres d'AO3, pas les remplacer
