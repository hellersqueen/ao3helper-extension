# readingTracker

**Tab:** Reading

## À quoi ça sert

Ce module suit ton historique de lecture sur AO3 : il retient les fics que
tu as déjà visitées, ta progression de lecture (défilement et chapitre), et
te permet de marquer les fics déjà vues.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `seenMode` | `mark` | Comment afficher les fics déjà vues : `mark` (les estompe) ou `hide` (les cache) |
| `exceptBookmarks` | activé | Ne jamais marquer comme vues les fics dans mes favoris |
| `exceptSubscribed` | activé | Ne jamais marquer comme vues les fics auxquelles je suis abonné |
| `exceptMFL` | activé | Ne jamais marquer comme vues les fics de ma liste "à lire plus tard" |
| `searchHistory` | activé | Active la recherche dans l'historique |
| `deleteEntry` | activé | Permet de supprimer une entrée de l'historique |
| `exportHistory` | activé | Permet d'exporter l'historique en JSON |
| `resumeToast` | activé | Affiche un petit message quand on reprend une lecture |
| `chapterBadge` | activé | Affiche un badge cliquable "Ch X/Y" sur les fics en cours |
| `resumeBanner` | activé | Affiche une bannière "📍 Reprendre au chapitre X" quand on revient sur une fic |
| `lastReadTime` | activé | Affiche depuis combien de temps on n'a pas lu, dans la bannière |
| `positionMarker` | activé | Affiche un repère à l'endroit exact où on s'était arrêté de lire |
| `floatingBadge` | activé | Affiche un badge flottant avec le pourcentage lu pendant la lecture |
| `seenWorksOpacity` | `0.4` | La transparence des fics marquées comme vues |
| `historyClearAll` | activé | Affiche le bouton "Tout effacer l'historique" |
| `showClearProgressButton` | activé | Affiche le bouton "Effacer la progression" pour une fic |
| `updatedBadge` | activé | Affiche un badge "Updated" sur les fics récemment mises à jour |
| `updatedOnlyMode` | désactivé | N'affiche que les fics mises à jour, sur la page des abonnements |

## Fichiers

### 1. `_readingTracker.js` — le chef d'orchestre

- Garde en mémoire l'historique et la progression de lecture, partagés avec les autres fichiers de ce module
- Donne accès à ces informations pour le reste de l'extension

### 2. `seenTracking.js` — enregistrer les visites

- Note chaque fic visitée dans l'historique
- Affiche sur les listes un badge "🆕 Updated" coloré selon la date, si une fic déjà vue a été mise à jour depuis
- Un mode permet de n'afficher que les fics mises à jour (utile sur la page des abonnements)

### 3. `visualMarkers.js` — marquer les fics déjà vues

- Sur les listes, estompe ou cache les fics déjà vues (au choix)
- Ne touche jamais aux favoris, aux abonnements, ni à la liste "à lire plus tard"
- Ajoute un badge cliquable "Ch X/Y" qui amène directement au dernier chapitre lu

### 4. `readingProgress.js` — suivre la progression de lecture

- Suit où on en est dans une fic pendant qu'on lit
- Affiche un badge flottant avec le pourcentage lu
- Affiche une bannière "📍 Reprendre au chapitre X" avec l'ancienneté de la dernière lecture
- Affiche un petit message de bienvenue quand on rouvre une fic déjà commencée
- Ajoute un repère dans le texte à l'endroit exact où on s'était arrêté

### 5. `viewHistory.js` — gérer l'historique

- Permet de chercher dans l'historique, de supprimer une entrée, ou de tout exporter en JSON
- Peut importer l'historique officiel d'AO3 depuis sa propre page d'historique
- Fait fonctionner les boutons du panneau de réglages liés à l'historique

### 6. `readingTracker.css`

- Les styles visuels des badges, bannières, messages et repères ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Détecter et suivre les relectures d'une même fic
- Marquer une fic comme "abandonnée" avec une raison
- Écrire une note personnelle sur une session de lecture
- Suivre la durée réelle de chaque session de lecture (pause/reprise)
- Marquer plusieurs fics comme "vues" d'un coup
- Des statistiques sur les moments où tu lis le plus (heures de pointe)
- Une alerte quand tu es en train de faire un marathon de lecture
- Savoir sur quel appareil tu as lu une fic
- Noter son humeur pendant une session de lecture
- Cliquer directement sur la barre de progression pour sauter à un pourcentage précis
- De petites notifications aux étapes importantes (25%, 50%, 75% lus)
- Poser plusieurs marque-pages à l'intérieur d'un même chapitre, pas juste un seul repère automatique
- Deviner automatiquement comment tu as lu une fic (juste essayé, survolée en diagonale...) d'après ta façon de faire défiler la page, pas seulement si tu l'as relue
- Afficher combien de fics sont cachées et un bouton pour les faire réapparaître temporairement
- D'autres façons d'afficher les fics déjà vues (un effet flou, un titre barré, ou une intensité d'atténuation réglable), en plus d'estomper ou de cacher
- Afficher l'historique sous forme de ligne du temps, groupée par période (aujourd'hui, hier, cette semaine)
- Épingler certaines entrées de l'historique tout en haut de la liste
- Nettoyer l'historique automatiquement selon des critères choisis, pas juste tout effacer ou une entrée à la fois
- Empêcher certaines fics d'apparaître dans l'historique, pour plus de confidentialité
- Afficher les dates de mise à jour sous forme relative ("il y a 2 jours") avec une couleur selon l'ancienneté, et pouvoir choisir entre dates relatives ou exactes
- Un anneau de progression circulaire coloré (comme un petit donut) qui change de couleur selon l'avancement de la lecture
- Un panneau fixe sur le côté de l'écran avec le chapitre en cours, la progression, le temps de lecture et la vitesse
- Basculer l'affichage des fics déjà vues avec un raccourci clavier
- Trier l'historique (par exemple par date ou par titre)
- Suivre sa vitesse de lecture en temps réel (mots par minute), calculée à partir de son propre historique
- Un panneau "Continuer la lecture" sur la page d'accueil avec les fics récemment lues
- Passer automatiquement à l'œuvre suivante d'une série, avec un bouton "Suivant dans la série"
- Synchroniser automatiquement l'endroit où on s'est arrêté de lire entre plusieurs appareils (téléphone, ordinateur...)
- Avoir plusieurs statuts possibles pour une fic (à lire, en cours, en pause, terminée, abandonnée, à relire) avec des badges et un petit tableau de bord, plutôt que juste "vue" ou pas
- Voir la date exacte à laquelle chaque fic a été lue, dans l'historique

## Explicitement écarté

- Pouvoir choisir à partir de quel pourcentage de défilement un chapitre est considéré comme lu — c'est fixé à 90%, ça ne se change pas
- Pouvoir régler le temps d'attente avant que la position de lecture soit sauvegardée automatiquement — c'est fixé à 2 secondes, ça ne se change pas

## Précision

⚠️ La doc historique anglaise décrit `readingProgress.js`, `viewHistory.js`
et `visualMarkers.js` comme des fichiers presque vides, sans vrai code
fonctionnel. Ce n'est plus le cas : les trois sont aujourd'hui pleinement
codés et fonctionnels, au même titre que `seenTracking.js`.
