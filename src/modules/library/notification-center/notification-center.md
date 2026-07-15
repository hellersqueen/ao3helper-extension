# notificationCenter

**Tab:** Library

## À quoi ça sert

Ce module surveille les fics suivies (favoris, liste "à lire plus tard",
historique de lecture) pour repérer les nouveaux chapitres publiés. Il les
regroupe dans un flux "What's New", avec une petite cloche dans le menu du
site et des notifications du navigateur en option.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `desktopNotifications` | désactivé | Active les notifications du navigateur (demande une permission) |
| `soundEffects` | désactivé | Joue un son quand une notification arrive (seulement si les notifications du navigateur sont activées) |
| `quietHoursEnabled` | désactivé | Active une plage horaire sans notifications |
| `quietHoursStart` | `22:00` | Heure de début des heures calmes |
| `quietHoursEnd` | `08:00` | Heure de fin des heures calmes |

Le panneau affiche aussi une section "Sync & Refresh" (synchroniser, trier,
actualiser) *(pas encore actif — rien n'est branché derrière)*.

## Fichiers

### `notificationCenter.js` — tout le module en un seul fichier

- Suit les mises à jour de chapitres pour les fics en favoris, dans la liste "à lire plus tard" ou dans l'historique de lecture
- Montre combien de nouveaux chapitres sont parus ("+2 chapters"), avec une petite célébration "🎉 Finished!" quand une fic devient complète
- Garde un historique glissant de 90 jours, avec possibilité de marquer une notification (ou tout) comme lue
- Permet de trier et filtrer le flux (par date, par titre, par origine : favoris / à lire plus tard / historique), et de cacher les fics terminées
- Ajoute une icône 🔔 avec un compteur dans le menu du site ; elle passe en rouge s'il y a du nouveau ; un clic ouvre ou ferme le flux
- Vérifie automatiquement en arrière-plan, toutes les 15 minutes, si de nouveaux chapitres sont parus sur les fics suivies
- Peut envoyer une vraie notification du navigateur, avec un son en option et des "heures calmes" sans aucune notification
- Détecte aussi directement un nouveau chapitre quand on visite la page d'une fic suivie

### `notificationCenter.css`

- Les styles visuels de la cloche, du panneau du flux et de la liste des notifications

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Regrouper intelligemment plusieurs notifications ensemble
- Un résumé quotidien ou hebdomadaire des mises à jour, plutôt que chaque mise à jour affichée séparément
- Des niveaux de priorité pour les notifications
- Pouvoir reporter une notification à plus tard
- Un widget de notifications directement sur la page d'accueil, en plus de la cloche dans le menu
- Choisir de recevoir des notifications seulement pour certains types d'événements (par exemple juste les favoris, pas la liste "à lire plus tard")
- Être notifié quand quelqu'un répond à un commentaire qu'on a laissé, ou reçoit un message dans sa boîte de réception AO3
- Suivre aussi les abonnements AO3 (auteurs ou séries suivis), pas seulement les favoris, la liste "à lire plus tard" et l'historique
- Être notifié quand une fic qu'on a soi-même écrite reçoit un kudos ou un bookmark
- Pouvoir archiver une notification en un clic, pas seulement la marquer comme lue
- Choisir parmi des modèles tout prêts pour changer le texte ou l'apparence des notifications

## Précision

⚠️ La doc historique anglaise dit que le son et la petite célébration sont
"inutiles"/"rejetés" (jugés trop intrusifs), et que le lien avec les
favoris, la liste "à lire plus tard" et l'historique ne sert à rien. En
réalité, les trois sont bel et bien codés : un son est joué, la
célébration s'affiche, et les trois listes servent vraiment à construire
le flux "What's New".
