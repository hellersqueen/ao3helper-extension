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

- Met en route les sept fichiers de fonctionnalités de ce module et partage les réglages communs
- Centralise la logique commune d'identification, de blocage, de priorité, de tags et de tri par kudos

### 2. Réglages partagés intégrés à `_userRelationships.js`

- Garde en un seul endroit les valeurs par défaut utilisées par tous les autres fichiers de ce module

### 3. Compteurs de blocage intégrés à `_userRelationships.js`

- Garde un compteur global (toutes sessions confondues) du nombre d'œuvres et de commentaires masqués parce que leur auteur est bloqué

### 4. `authorTracking.js` — suivre un auteur

- Permet d'écrire une note personnelle sur un auteur, visible en survolant un petit badge 📝
- Permet de suivre un auteur, avec un badge ★
- Affiche une bannière quand un auteur suivi a publié de nouvelles œuvres depuis la dernière visite
- Sur la page des œuvres d'un auteur, ajoute un lien "🏆 Sort by kudos" (tri natif AO3, pour voir ses œuvres les plus populaires)

### 5. `authorBlocking.js` — cacher les fics des auteurs bloqués

- Cache les fics des auteurs bloqués sur les listes, y compris quand seul un pseudonyme précis est bloqué
- Remplace la fic cachée par un message "[Hidden — Author blocked: nom]", avec un bouton pour la révéler temporairement
- Compte chaque œuvre masquée dans les statistiques de blocage globales

### 6. `authorPreference.js` — préférences par auteur

- Permet de cacher ou de mettre en favori un auteur, un par un
- Permet de donner un niveau de priorité de lecture (🔥 high / 💤 low / normal, sans icône) à un auteur
- Permet de ranger un auteur par tags personnalisés (séparés par des virgules), affichés en petites étiquettes
- Affiche combien de fics de cet auteur ont déjà été lues, si ce nombre est connu

### 7. `authorCard.js` — fiche auteur au survol

- Affiche une petite fiche en survolant le nom d'un auteur : suivi, favori, priorité, tags, note, nombre lu
- Purement en lecture : n'écrit jamais rien, se contente d'agréger ce que les autres sous-modules savent déjà

### Blocage et gestion de la liste — intégrés à `_userRelationships.js`

- Ajoute un menu (clic droit) sur le nom d'un auteur pour le bloquer ou le débloquer
- Quand l'auteur a plusieurs pseudonymes, propose de bloquer soit tout le compte, soit seulement le pseudonyme affiché
- Demande (optionnellement) une raison au moment du blocage
- Garde la liste officielle des personnes bloquées, utilisée par les autres fichiers de ce module

- Affiche sur la page de profil la liste complète des personnes bloquées, avec leur raison de blocage si renseignée
- Affiche des statistiques globales : nombre de personnes bloquées, œuvres et commentaires masqués au total
- Permet d'ajouter (avec une raison optionnelle), de retirer, d'exporter, d'importer, ou de tout effacer d'un coup

### 8. `commentHiding.js` — cacher les commentaires des personnes bloquées

- Cache les commentaires écrits par une personne bloquée, y compris quand seul un pseudonyme précis est bloqué
- Cache aussi les notes laissées par une personne bloquée sur ses bookmarks
- Compte chaque commentaire masqué dans les statistiques de blocage globales

### 9. `userRelationships.css`

- Les styles visuels de tous les fichiers ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, avec leur statut :

- ~~Se souvenir de la raison pour laquelle on a bloqué quelqu'un~~ ✅ Fait
  Une raison optionnelle peut être saisie au blocage (menu contextuel ou
  panneau de gestion), stockée dans `userBlocker:reasons` et affichée dans
  la liste de blocage.
- ~~Bloquer un pseudonyme précis plutôt que tout le compte d'un auteur~~ ✅ Fait
  Le menu contextuel propose "Block (all pseuds)" et, quand un pseudonyme
  est détecté dans le lien, "Block this pseud only". Un blocage de compte
  entier couvre toujours tous ses pseudonymes.
- ~~Voir des statistiques sur un auteur (total de mots écrits, nombre d'œuvres, kudos reçus)~~ ❌ Écarté
  Nécessiterait de parcourir toutes les pages de l'index d'œuvres d'un
  auteur pour additionner mots/kudos (potentiellement des dizaines de
  requêtes pour un auteur prolifique) — contrairement à la détection de
  nouvelles œuvres, qui ne lit qu'un seul instantané par visite.
- ~~Voir les œuvres les plus populaires d'un auteur~~ ✅ Fait
  Lien "🏆 Sort by kudos" sur la page des œuvres d'un auteur, qui réutilise
  le tri natif d'AO3 (`work_search[sort_column]=kudos_count`) — aucune
  requête supplémentaire.
- ~~Voir combien de kudos on a donné à un auteur précis au fil du temps~~ ❌ Écarté
  Le stockage des kudos donnés (`ficAppreciation:kudosed`, propriété du
  module Fic Appreciation) ne conserve que l'ID du work et la date, pas
  l'auteur ; reconstituer cette association demanderait de re-télécharger
  chaque œuvre kudos'd ou de dupliquer un mapping work→auteur quelque part.
- ~~S'abonner automatiquement aux nouvelles œuvres de ses auteurs favoris~~ ❌ Écarté
  Confirme la décision déjà prise ("Aucune notification automatique",
  jugée trop lourde). Même en déléguant à l'abonnement natif AO3, il
  faudrait scraper un formulaire non documenté sur la page de profil de
  l'auteur pour en tirer un identifiant numérique — fragile, et le projet
  a déjà tranché sur l'idée elle-même.
- ~~Donner un niveau de priorité à un auteur pour sa liste de lecture~~ ✅ Fait
  Bouton cyclique normal → 🔥 high → 💤 low sur chaque auteur, affiché
  aussi dans la fiche au survol.
- ~~Voir des statistiques sur son blocage : combien d'auteurs bloqués, combien de fics ou de commentaires cachés au total~~ ✅ Fait
  Ligne de statistiques dans le panneau de gestion : nombre de personnes
  bloquées, œuvres masquées, commentaires masqués (compteurs cumulés,
  `_userRelationships.js`).
- ~~Afficher une photo de profil (avatar) à côté du nom d'un auteur~~ ❌ Écarté
  Nécessiterait une requête réseau par auteur distinct affiché dans une
  liste (AO3 n'inclut pas l'avatar dans le HTML d'un blurb) — ne passe pas
  à l'échelle sur une page de résultats avec des dizaines d'auteurs
  différents.
- ~~Pouvoir ranger les auteurs par tags ou catégories personnalisées, pas juste une note en texte libre~~ ✅ Fait
  Champ de tags (séparés par des virgules) par auteur dans
  `authorPreference.js`, affichés en étiquettes.
- ~~Voir une petite fiche apparaître quand on survole le nom d'un auteur, avec ses infos principales, sans avoir à cliquer nulle part~~ ✅ Fait
  Nouveau sous-module `authorCard.js` : fiche au survol (suivi, favori,
  priorité, tags, note, nombre lu), purement en lecture.

## Explicitement écarté

- Noter un auteur avec des étoiles (1 à 5) — les favoris suffisent
- Bloquer quelqu'un juste pour une durée limitée (1 jour, 1 semaine...)
- Être alerté quand un auteur favori publie une nouvelle œuvre, sans avoir à visiter sa page, y compris via un abonnement AO3 automatique — jugé trop lourd/fragile à mettre en place
- Recevoir des suggestions d'auteurs similaires — jugé pas fiable
- Analyser le style d'écriture d'un auteur
- Des statistiques sur plusieurs années avec des graphiques — jugé trop complexe
- Un score de fiabilité de l'auteur basé sur ses habitudes de mise à jour — jugé trop proche d'une autre idée similaire et pas assez fiable en données
- Statistiques d'auteur agrégées (mots/œuvres/kudos reçus) — nécessiterait de parcourir toutes les pages de son index d'œuvres
- Historique des kudos donnés à un auteur précis — l'information (l'auteur d'un work kudos'd) n'est pas conservée par le module qui suit les kudos donnés
- Avatar à côté du nom d'un auteur — une requête réseau par auteur affiché ne passe pas à l'échelle

## Point relevé pendant la revue (hors périmètre des 11 items)

✅ Fait — `authorTracking.js` affichait des badges ★ (auteur suivi) et 📝
(note) sur les listes, mais **aucune interface n'existait pour suivre un
auteur ou écrire une note** — les clés `authorTracking:followed` et
`authorTracking:notes` n'étaient jamais écrites nulle part dans le code.
Réparé : les badges sont devenus de vrais boutons cliquables (`setFollowed()`
/ `setNote()`), style repris de `authorPreference.js`.

`authorPreference.js`'s `readCount` avait le même problème : affiché s'il
était positif, mais jamais incrémenté. Réparé : branché sur l'événement
`ao3h:workFinished` déjà émis par `ficAppreciation` quand une œuvre est
marquée terminée (dépendance douce, auteur lu directement sur la page via
`lib/ao3/work-page.js`'s `getWorkAuthor()`).

Le panneau de gestion de la liste (ajouter/retirer/importer/tout effacer) ne
déclenchait jamais l'événement `ao3h:blocking-changed` que le menu clic-droit
déclenche bien, lui. Or
`authorBlocking.js` et `commentHiding.js` écoutent précisément cet événement
pour rafraîchir en direct le contenu masqué. Modifier la liste de blocage
via le panneau de gestion ne prenait donc effet qu'après un rechargement
complet de la page. Réparé : le panneau déclenche désormais le même
événement après chaque écriture.

`authorCard.js` cherchait les préférences d'un auteur (favori, priorité,
tags, nombre lu) sous une clé en minuscules, alors que `authorPreference.js`
les stocke sous le nom exact tel qu'affiché sur la page (pas en minuscules)
— tout auteur dont le pseudo contient une majuscule (la majorité) ne
montrait donc jamais ces informations dans la fiche au survol, même après
les avoir explicitement réglées. Réparé en passant par le même lecteur
partagé que `authorPreference.js` (voir Détails techniques), avec la même
clé exacte.

## Précision

⚠️ La doc historique anglaise décrit un état plus ancien du code, avec des
fichiers en double et des sous-modules vides sans vrai code. Ce n'est plus
le cas : le code actuel a exactement 5 fichiers de fonctionnalités, tous
complets et fonctionnels, sans doublon.

## Détails techniques

Chaque clé de stockage a un seul sous-module *propriétaire* (qui lit et
écrit) ; les autres sous-modules qui n'ont besoin que de la lire passent
par un lecteur partagé exposé sur le coordinateur (`W.AO3H_UserRelationships`)
plutôt que de relire `localStorage` eux-mêmes :
- `userBlocker:list` — liste des personnes bloquées ; propriétaire `_userRelationships.js` (menu clic-droit et panneau de gestion) ; lue par `authorBlocking.js`/`commentHiding.js` via `getBlockedList()`
- `userBlocker:reasons` — raison de blocage optionnelle par personne ; même propriétaire, via `getBlockReasons()`/`saveBlockReasons()`
- `authorPreferences:data` — `{ [author]: { hidden, favorite, readCount, priority, tags } }`, clé = nom exact tel qu'affiché (pas en minuscules) ; propriétaire `authorPreference.js` ; lue par `authorCard.js` via `getAuthorPrefsFor(author)` (défauts déjà appliqués)
- `authorTracking:notes` — note personnelle par auteur (clé en minuscules) ; propriétaire `authorTracking.js` ; lue par `authorCard.js` via `getAuthorNotes()`
- `authorTracking:followed` — liste des auteurs suivis (clé en minuscules) ; propriétaire `authorTracking.js` ; lue par `authorCard.js` via `getFollowedAuthors()`
- `authorTracking:snapshots` — `{ [author]: { workCount, lastSeen } }`, utilisé pour détecter les nouvelles œuvres à la revisite ; propriétaire exclusif `authorTracking.js`, jamais lu ailleurs

`authorBlocking.js` et `commentHiding.js` observent le contenu ajouté
dynamiquement via `MutationObserver`, et écoutent aussi `ao3h:blocking-changed`
(déclenché par les deux interfaces du coordinateur) pour se
rafraîchir dès qu'un blocage change, sans attendre un rechargement de page.
Le panneau de gestion du coordinateur a une hauteur de liste plafonnée à
220px (défilement), et son import JSON fusionne avec la liste existante en
dédupliquant (fichiers invalides ignorés silencieusement).
