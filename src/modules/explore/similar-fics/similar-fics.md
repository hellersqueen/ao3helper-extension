# similarFics

**Tab:** Explore

## À quoi ça sert

Ce module ajoute un bouton "Similar Stories" sur la page d'une fic, qui
ouvre un panneau de suggestions de fics proches, basées sur le fandom, les
tags, la longueur et l'auteur de la fic en cours.

## Réglages utilisateur

Ces 6 réglages existent dans le panneau, mais aucun n'est vraiment branché
au code — rien ne change vraiment quand on les modifie :

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `numResults` | `10` *(pas encore actif)* | Le nombre de résultats affichés (5, 10 ou 15) |
| `showSimilarityScore` | activé *(pas encore actif)* | Afficher le pourcentage de correspondance |
| `highlightCommonTags` | activé *(pas encore actif)* | Mettre en avant les tags partagés avec la fic en cours |
| `showSummary` | activé *(pas encore actif)* | Afficher le résumé de la fic dans le panneau |
| `includeWIP` | désactivé *(pas encore actif)* | Inclure les fics en cours (pas encore terminées) |
| `openInNewTab` | désactivé *(pas encore actif)* | Ouvrir les suggestions dans un nouvel onglet |

## Fichiers

### `similarFics.js` — tout le module en un seul fichier

- Récupère le fandom, les tags principaux, la note, le nombre de mots et l'auteur de la fic en cours
- Cherche sur AO3 des fics avec des tags proches, et d'autres fics du même auteur
- Calcule un score de ressemblance pour chaque résultat trouvé, basé sur le fandom, les tags en commun et la longueur
- Ne garde que les meilleurs résultats, classés en "Similar Pairings", "Similar Stories" et "More by [auteur]"
- Ignore les fics déjà marquées comme lues, et la fic en cours elle-même
- Un bouton "+ MFL" sur chaque suggestion permet de l'ajouter directement à "à lire plus tard"

### `similarFics.css`

- Les styles visuels du panneau, des sections et des cartes de résultat

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Exclure des types précis de similarité (par exemple "similaire mais pas les univers café")
- Chercher des fics similaires mais volontairement plus longues ou plus courtes
- Filtrer pour ne garder que les fics terminées, en excluant les fics inachevées
- Un curseur pour choisir entre des suggestions très proches ou plus surprenantes
- Des recommandations selon le temps de lecture disponible (rapide à lire vs longue épopée)
- Pouvoir régler soi-même l'importance de chaque critère de correspondance
- Reconnaître les suites ou préquelles d'une série pour les recommander en priorité
- Apprendre de tes clics précédents pour améliorer les suggestions au fil du temps
- Donner plus de poids aux tags de relation qu'aux tags de personnage ou aux tags libres — en ce moment tous les tags comptent pareil
- Travailler avec le module de "jeux de tropes" pour affiner les suggestions
- Proposer des suggestions aussi sur les pages de recherche ou de tags, pas seulement sur la page d'une fic
- Créer automatiquement une image de couverture pour chaque suggestion
- Afficher automatiquement des suggestions quand tu marques une fic comme terminée ou abandonnée
- Des collections toutes prêtes ("lectures rapides", "grandes épopées")
- Garder les recommandations en mémoire pour ne pas tout recharger à chaque fois
- Un bouton "pas intéressé" pour écarter une suggestion qui ne te plaît pas
- Afficher les suggestions dans une barre latérale toujours visible sur la page, plutôt que dans un panneau qu'il faut ouvrir avec un bouton
- Cacher automatiquement le panneau de suggestions sur mobile parce que l'écran est trop étroit
- Ajouter un bouton pour mettre une suggestion en favori (bookmark) en un clic, en plus du bouton "+ MFL" actuel
- Filtrer les suggestions selon la note (rating) de la fic
- Ne garder que les suggestions d'une longueur proche (à peu près 20% d'écart) de celle de la fic en cours
- Expliquer en langage simple pourquoi chaque fic est suggérée, en plus de pouvoir choisir combien de suggestions voir et lesquelles cacher
- Proposer des suggestions basées sur tous tes favoris enregistrés, pas seulement sur la fic que tu es en train de regarder

## Explicitement écarté

- Suggestions générées par une intelligence artificielle ou un service en ligne — pour rester local et simple
