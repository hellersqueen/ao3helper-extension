# ficActions

**Tab:** Navigate & Interact

## À quoi ça sert

Ce module améliore les boutons d'action d'une fic (bookmark, abonnement,
partage...), à la fois sur la page d'une fic et sur les listes. On peut
réorganiser ces boutons à la souris, en cacher certains, dupliquer le
bouton d'abonnement en bas de page, et s'abonner directement depuis une
liste sans ouvrir la fic.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `buttonReordering` | désactivé | Active le glisser-déposer pour réorganiser les boutons d'action |
| `subscribeButtonBottom` | désactivé | Duplique le bouton "Subscribe" en bas de la page |
| `subscribeFromListings` | désactivé | Ajoute un bouton d'abonnement rapide sur les fics d'une liste |
| `showSubscriptionStatus` | désactivé | Affiche un badge 🔔 sur les fics déjà suivies |
| `hideShare` | désactivé | Cache le bouton "Share" |
| `hideBookmark` | désactivé | Cache le bouton "Bookmark" |
| `hideSubscribe` | désactivé | Cache le bouton "Subscribe" |

## Fichiers

### `ficActions.js` — tout le module en un seul fichier

- Ajoute une poignée (⠿) pour réorganiser les boutons d'action à la souris ; l'ordre choisi est gardé en mémoire pour les prochaines visites
- Permet de cacher les boutons Share, Bookmark ou Subscribe un par un
- Ajoute une copie du bouton "Subscribe" en bas de la page, pour s'abonner facilement après avoir fini de lire
- Ajoute un bouton 🔕/🔔 sur les listes de fics pour s'abonner sans ouvrir la fic
- Affiche un badge "🔔 Subscribed" sur les fics déjà suivies

### `ficActions.css`

- Les styles visuels des boutons cachés/réorganisés, des poignées de glisser-déposer, du bouton rapide et du badge d'abonnement

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Créer ses propres boutons d'action personnalisés, en plus de ceux déjà là
- Avoir un raccourci clavier différent pour chaque bouton individuellement
- Regrouper certains boutons ensemble visuellement
- Une disposition spécialement pensée pour mobile
- Un mode "icônes seules", sans le texte à côté
- Un menu d'actions rapides
- Personnaliser les icônes des boutons
- Choisir où placer exactement le bouton Subscribe dupliqué en bas de page (aujourd'hui il est toujours au même endroit)
- Une page ou un panneau pour voir et gérer d'un coup tous les auteurs et toutes les séries auxquels tu es abonné·e sur AO3, plutôt que de s'abonner un par un

## Explicitement écarté

- Des actions qui enchaînent plusieurs étapes automatiquement — ce module gère juste l'affichage des boutons
- Une longue liste de dizaines d'emplacements prédéfinis pour placer chaque bouton — jugé trop compliqué, le glisser-déposer suffit

## Précision

⚠️ La doc historique anglaise dit que le glisser-déposer, l'abonnement
rapide depuis les listes et le badge de statut d'abonnement n'étaient "pas
encore codés". Les trois sont bel et bien codés aujourd'hui dans
`ficActions.js`.
