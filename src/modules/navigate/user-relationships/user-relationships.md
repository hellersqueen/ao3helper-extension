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
