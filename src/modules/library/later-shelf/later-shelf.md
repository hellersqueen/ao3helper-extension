# laterShelf

**Tab:** Library

## À quoi ça sert

Ce module améliore la liste "Marked for Later" (MFL) d'AO3 : un bouton pour
ajouter rapidement une fic à lire plus tard, un badge pour repérer les
fics déjà dans cette liste, le tri et le filtrage de la liste, la
sélection de plusieurs fics à la fois, et des rappels programmés.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showQuickButton` | activé | Affiche le bouton 📌 sur les listes de fics |
| `remindersEnabled` | désactivé | Active les rappels programmés pour une fic, avec notification du navigateur |

Le panneau affiche aussi une section "Sync & Refresh" (synchroniser,
trier, actualiser) *(pas encore actif — rien n'est branché derrière)*.

## Fichiers

### 1. `_laterShelf.js` — le chef d'orchestre

- Met en route les trois autres fichiers de fonctionnalités de ce module

### 2. `laterShelfStore.js` — la mémoire partagée

- Garde en un seul endroit la liste des fics sauvegardées, pour que les autres fichiers puissent la lire et l'écrire
- Ajoute la fic actuellement affichée à la liste

### 3. `quickMarkForLaterButton.js` — bouton de sauvegarde rapide

- Ajoute un bouton "📌 Save for later" sur chaque fic d'une liste
- Le bouton change d'apparence ("📌 Saved") si la fic est déjà sauvegardée
- Un clic ajoute ou retire la fic de la liste

### 4. `markedForLaterStatus.js` — badges, tri et sélection

- Affiche un badge 📌 sur les fics déjà sauvegardées, partout où elles apparaissent
- Sur la page "Marked for Later" : affiche un compteur total et la date à laquelle chaque fic a été ajoutée
- Ajoute une barre de tri (par date, titre, nombre de mots, dernière mise à jour) et de filtre (en cours seulement, terminées seulement, par nombre de mots, par fandom)
- Permet de cocher plusieurs fics à la fois pour les retirer toutes en même temps

### 5. `workReminder.js` — rappels programmés

- Ajoute un bouton "⏰ Remind me" pour choisir une date de rappel sur une fic de la liste
- Affiche un badge ⏰ sur les fics qui ont un rappel actif (⚠️ si la fic n'est plus disponible)
- Envoie une notification du navigateur quand la date du rappel arrive

### 6. `laterShelf.css`

- Les styles visuels de tous les boutons, badges et barres ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Des niveaux de priorité pour la liste (haute/moyenne/basse)
- Écrire une raison pour laquelle on a sauvegardé une fic
- Des statistiques sur la liste (combien de fics sauvegardées sont vraiment lues ensuite)
- Réorganiser la liste à la main par glisser-déposer
- Piocher une fic au hasard directement depuis la liste
- Des groupes dans la liste (lecture du week-end, fics courtes, gros projets)
- Un message "annuler" après avoir sauvegardé ou retiré une fic
- Sélectionner plusieurs fics directement sur une page de résultats pour les ajouter toutes en même temps à la liste
- Retirer automatiquement de la liste les fics qu'on a finies de lire
- Voir le temps de lecture estimé pour toute la liste
- Des petites célébrations quand on atteint un cap, par exemple "10 fics sauvegardées"
- Des rappels intelligents qui se basent sur les moments où on lit habituellement
- Un rappel spécial pour les fics qu'on a abandonnées
- Pouvoir reporter un rappel à plus tard
- Choisir où placer le bouton de sauvegarde rapide
- Ajouter une note rapide directement depuis le bouton de sauvegarde
- Choisir parmi plusieurs listes différentes au lieu d'une seule liste "à lire plus tard"
- Trier automatiquement la liste selon des critères intelligents
- Un badge avec le nombre total de fics dans la liste, visible en permanence dans le menu du site, sur lequel on peut cliquer pour voir un aperçu rapide sans changer de page
- Un objectif de lecture hebdomadaire pour vider la liste (par exemple "5 fics par semaine"), avec une barre de progression et un message d'encouragement
- Garder une archive consultable des fics qu'on a retirées de la liste, au lieu de les perdre définitivement
- Recevoir les rappels par email, en plus des notifications du navigateur
- Des rappels pour reprendre une fic qu'on est en train de lire, même si elle n'est pas dans la liste "à lire plus tard"
- Ajouter une série entière à la liste en un clic, au lieu de fic par fic
- Un raccourci clavier pour ajouter rapidement la fic en cours à la liste
- Une vue en grille avec un aperçu visuel de chaque fic, en plus de la liste actuelle
- Des rappels qui reviennent régulièrement (tous les jours, toutes les semaines) au lieu d'un rappel ponctuel une seule fois
- Être prévenu quand une fic de la liste reçoit un nouveau chapitre ou est terminée par son auteur
- Des niveaux de priorité (haute/moyenne/basse) pour les fics de la liste
- Un rappel spécial pour les fics qui traînent depuis longtemps dans la liste sans être lues
- Pouvoir écrire son propre message personnalisé pour les rappels
- Une alerte pour ne pas casser sa série de jours de lecture consécutifs
- Faire remonter automatiquement en haut de la liste les "pépites cachées" repérées par un autre module
- Exporter la liste "à lire plus tard" dans un fichier (par exemple en CSV ou juste la liste des liens)
- Garder un historique des rappels passés (envoyés ou annulés), pas seulement les rappels en cours
- Mettre une fic en favori et l'ajouter à la liste "à lire plus tard" en un seul clic, au lieu de faire les deux actions séparément
- Utiliser la longueur des fics pour te suggérer quoi lire selon le temps que tu as devant toi (par exemple une fic courte si tu as peu de temps)

## Explicitement écarté

- Une date limite de lecture façon "deadline" — jugé trop rigide
- Partager sa liste "à lire plus tard" avec d'autres personnes — pour rester privé
- Une liste "spéciale session" encore plus temporaire que la liste "à lire plus tard" — écarté, la liste "à lire plus tard" sert déjà à ça
- Colorer les fics selon depuis combien de temps elles traînent dans la liste — écarté, jugé trop culpabilisant

## Précision

⚠️ La doc historique anglaise décrit un robot qui parcourrait en arrière-plan
les pages de la liste MFL, ainsi qu'une synchronisation entre onglets.
Aucun des deux n'existe dans le code actuel : la liste est juste stockée
sur l'ordinateur, mise à jour directement par les boutons de marquage, sans
robot ni synchronisation entre onglets.
