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
| `iconOnlyButtons` | désactivé | Remplace le texte des boutons par une icône (le libellé complet reste disponible pour les lecteurs d'écran) |
| `subscribeButtonBottom` | désactivé | Duplique le bouton "Subscribe" en bas de la page |
| `bottomSubscribePosition` | `nearKudos` | Où placer ce bouton dupliqué : à côté du bouton kudos, ou tout en bas de la page |
| `subscribeFromListings` | désactivé | Ajoute un bouton d'abonnement rapide sur les fics d'une liste |
| `showSubscriptionStatus` | désactivé | Affiche un badge 🔔 sur les fics déjà suivies |
| `hideShare` | désactivé | Cache le bouton "Share" |
| `hideBookmark` | désactivé | Cache le bouton "Bookmark" |
| `hideSubscribe` | désactivé | Cache le bouton "Subscribe" |

## Fichiers

### `ficActions.js` — tout le module en un seul fichier

- Ajoute une poignée (⠿) pour réorganiser les boutons d'action à la souris ; l'ordre choisi est gardé en mémoire pour les prochaines visites
- Permet de cacher les boutons Share, Bookmark ou Subscribe un par un
- Peut remplacer le texte des boutons d'action par une icône (le libellé complet reste lisible par les lecteurs d'écran)
- Ajoute une copie du bouton "Subscribe" en bas de la page (à côté du bouton kudos, ou tout en bas de la page au choix), pour s'abonner facilement après avoir fini de lire
- Ajoute un bouton 🔕/🔔 sur les listes de fics pour s'abonner sans ouvrir la fic
- Affiche un badge "🔔 Subscribed" sur les fics déjà suivies

### Logique interne intégrée à `ficActions.js`

- `getActionIcon(key)` : l'icône associée à un bouton d'action (mode icônes seules)
- `resolveBottomSubscribeContainer(doc, position)` : trouve le conteneur où insérer le bouton Subscribe dupliqué quand la position choisie est "tout en bas de la page"

### `ficActions.css`

- Les styles visuels des boutons cachés/réorganisés, des poignées de glisser-déposer, des icônes seules (avec libellé accessible masqué visuellement), du bouton rapide et du badge d'abonnement

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, avec leur statut :

- ~~Créer ses propres boutons d'action personnalisés, en plus de ceux déjà là~~ ❌ Écarté
  Autoriser des boutons définis par l'utilisateur (URL/action arbitraire)
  ouvrirait une surface d'injection sans bénéfice clair ; ce module se
  limite à améliorer les boutons déjà fournis par AO3.
- ~~Avoir un raccourci clavier différent pour chaque bouton individuellement~~ ❌ Écarté
  Rôle du module `keyboardShortcuts`, pas de `ficActions` — éviter deux
  systèmes de raccourcis clavier concurrents dans l'extension.
- ~~Regrouper certains boutons ensemble visuellement~~ ❌ Écarté
  Le glisser-déposer déjà en place permet déjà de rapprocher les boutons
  qu'on veut voir ensemble ; un système de groupes explicite ajouterait de
  la complexité pour un gain marginal.
- ~~Une disposition spécialement pensée pour mobile~~ ✅ Fait
  Le layout flexible (`ao3h-better-buttons`, `flex-wrap: wrap`) s'adapte
  déjà aux petits écrans : les boutons passent à la ligne suivante au lieu
  de déborder. Pas de disposition dédiée séparée nécessaire.
- ~~Un mode "icônes seules", sans le texte à côté~~ ✅ Fait
  Réglage `iconOnlyButtons` : chaque bouton d'action affiche une icône, le
  texte original reste présent mais visuellement masqué (`.ao3h-sr-only`)
  pour les lecteurs d'écran.
- ~~Un menu d'actions rapides~~ ❌ Écarté
  Redondant avec la réorganisation, le masquage et le mode icônes seules
  déjà proposés — un second point d'entrée pour les mêmes actions
  n'apporterait pas de valeur claire.
- ~~Personnaliser les icônes des boutons~~ ❌ Écarté
  Même raisonnement que les boutons personnalisés : la personnalisation
  icône par icône ajoute de la configuration pour un gain marginal ; le jeu
  d'icônes fixe du mode icônes seules couvre le besoin pratique.
- ~~Choisir où placer exactement le bouton Subscribe dupliqué en bas de page (aujourd'hui il est toujours au même endroit)~~ ✅ Fait
  Réglage `bottomSubscribePosition` : à côté du bouton kudos (comportement
  historique, par défaut) ou tout en bas de la page (`#main`).
- ~~Une page ou un panneau pour voir et gérer d'un coup tous les auteurs et toutes les séries auxquels tu es abonné·e sur AO3, plutôt que de s'abonner un par un~~ ❌ Écarté
  AO3 fournit déjà une page native pour ça (`/users/<user>/subscriptions`) ;
  la dupliquer dans l'extension (appels réseau, pagination) coûterait plus
  qu'elle n'apporterait — même raisonnement que le concept `collectionBrowser`
  jamais construit (voir `docs/never-built-modules.md`).

## Explicitement écarté

- Des actions qui enchaînent plusieurs étapes automatiquement — ce module gère juste l'affichage des boutons
- Une longue liste de dizaines d'emplacements prédéfinis pour placer chaque bouton — jugé trop compliqué, le glisser-déposer suffit
- Des boutons d'action personnalisés définis par l'utilisateur — risque d'injection pour un gain marginal (cf. Specs non implémentés)
- Des raccourcis clavier par bouton — rôle du module `keyboardShortcuts`
- Un menu d'actions rapides séparé — redondant avec réorganisation + masquage + icônes seules
- Personnalisation des icônes bouton par bouton — configuration disproportionnée par rapport au besoin
- Une page de gestion globale des abonnements — AO3 en fournit déjà une (`/users/<user>/subscriptions`)

## Précision

⚠️ La doc historique anglaise dit que le glisser-déposer, l'abonnement
rapide depuis les listes et le badge de statut d'abonnement n'étaient "pas
encore codés". Les trois sont bel et bien codés aujourd'hui dans
`ficActions.js`.
