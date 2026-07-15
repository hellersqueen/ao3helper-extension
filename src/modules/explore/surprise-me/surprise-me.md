# surpriseMe

**Tab:** Explore

## À quoi ça sert

Ce module ajoute un bouton "🎲 Random Work" sur toutes les listes de fics
(tags, recherche, favoris, "à lire plus tard", historique, collections),
qui choisit une fic au hasard parmi celles affichées et y amène
directement.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showPreviewBeforeOpen` | désactivé | Affiche titre/résumé/statistiques avant d'ouvrir la fic |
| `completedOnly` | désactivé | Ne choisit que parmi les fics terminées |
| `showDetails` | activé *(pas encore actif)* | Réservé pour une future section "Analysis & Recommendations" |
| `enableRecommendations` | activé *(pas encore actif)* | idem |
| `maxResults` | `10` *(pas encore actif)* | idem |

## Fichiers

### `surpriseMe.js` — tout le module en un seul fichier

- Ignore les fics déjà cachées par d'autres modules et celles déjà marquées comme lues
- Peut ne choisir que parmi les fics terminées, si le réglage est activé
- Peut montrer un aperçu (titre, auteur, mots, kudos, résumé) avant d'ouvrir vraiment la fic, avec des boutons "Open", "Reroll" et "Close"
- Peut être déclenché par le raccourci clavier Ctrl+Shift+R du module des raccourcis
- Affiche un petit message si aucune fic ne correspond aux critères

### `surpriseMe.css`

- Les styles visuels du bouton, de la carte d'aperçu et du message "liste vide"

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Une section "Analyse et recommandations" est prévue dans les réglages, mais rien n'est vraiment branché derrière pour l'instant
- Proposer une liste de 5 à 10 fics au hasard d'un coup pour choisir parmi elles, au lieu d'en tirer une seule à la fois
- Ajouter automatiquement plusieurs fics tirées au hasard dans "à lire plus tard" d'un coup
- Choisir la zone où piocher au hasard (seulement ce fandom, tous les fandoms, ou juste cette page)
- Exclure les fics qu'on a abandonnées en cours de route, pas seulement celles déjà lues jusqu'au bout
- Exclure les fics trop courtes selon un nombre de mots minimum
- Garder un historique des fics tirées au hasard précédemment

## Explicitement écarté

- Donner plus de chances à certaines fics d'être tirées au sort (selon leurs kudos, leur date ou leur longueur) — pour que ce soit vraiment aléatoire
- Piocher au hasard sur d'autres sites, pas seulement sur AO3
- Faire en sorte que le tirage au hasard tienne quand même compte de la ressemblance avec d'autres fics — pour que ce soit un vrai hasard
- Un bouton "I'm Feeling Lucky" séparé — ça ferait doublon avec le bouton dé déjà présent
- Ajouter directement la fic tirée au hasard dans une file d'attente de lecture — ce n'est pas le rôle de ce module
- Pouvoir activer ou désactiver le bouton seulement sur certaines pages — il reste disponible partout, c'est plus simple

## Précision

⚠️ Une doc historique disait que le tirage au hasard était "simulé" et pas
vraiment aléatoire. Ce n'est plus le cas : le tirage est bien réel dans le
code.
