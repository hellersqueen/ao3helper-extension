# searchEnhancer

**Tab:** Explore

## À quoi ça sert

Ce module regroupe plusieurs améliorations de la recherche et des listes
sur AO3 : des suggestions de tags liés, un historique de recherche avec
autocomplétion, un tri par taux d'engagement, et le regroupement des
séries dans les résultats.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `tagSuggestions` | activé | Affiche les suggestions de tags liés |
| `historyBasedSuggestions` | activé | Inclut des suggestions issues de l'historique de recherche |
| `suggestionWorkCount` | activé | Affiche le nombre de fics pour chaque suggestion |
| `searchHistory` | activé | Historique de recherche (25 recherches max) |
| `tagAutocomplete` | activé *(pas encore actif)* | Autocomplétion des tags officiels d'AO3 |
| `sortByKudosRatio` | activé | Active le tri par ratio kudos/vues |
| `sortBySaveRate` | activé | Active le tri par taux de sauvegarde |
| `showRatioInline` | activé | Affiche le ratio à côté des statistiques ("12% eng.") |
| `groupSeriesInResults` | désactivé | Regroupe les séries dans les résultats de recherche |
| `fandomSortMode` | `alpha` | Le tri par défaut des groupes : alphabétique, popularité, ou historique |

## Fichiers

### 1. `_searchEnhancer.js` — le chef d'orchestre

- Met en route les quatre autres fichiers de fonctionnalités et partage des outils communs entre eux

### 2. `relatedSearches.js` — suggestions de tags liés

- Sur une page de recherche ou de tag, propose jusqu'à 8 tags souvent utilisés avec ceux déjà choisis
- Propose aussi des suggestions basées sur l'historique de recherche
- Un clic sur une suggestion l'ajoute directement à la recherche

### 3. `searchAutocomplete.js` — historique et recherche rapide

- Garde en mémoire les 25 dernières recherches, et les propose dans un menu déroulant pendant qu'on tape
- Ajoute une icône 🔍 au survol d'un tag ou d'un nom d'auteur, pour lancer une recherche rapide en un clic

### 4. `resultsSorting.js` — tri par engagement

- Ajoute une barre pour trier les résultats : ordre normal, ratio kudos/vues, taux de sauvegarde, kudos, ou vues
- Affiche un petit badge "X% eng." à côté des statistiques de chaque fic
- Se souvient du dernier tri choisi pour chaque page

### 5. `seriesGrouping.js` — regroupement des séries

- Regroupe visuellement les fics d'une même série (si au moins 2 apparaissent sur la page) sous un en-tête commun
- Les groupes peuvent être triés par ordre alphabétique, par popularité, ou par ordre d'apparition

### 6. `searchEnhancer.css`

- Les styles visuels des panneaux, suggestions, menu déroulant et barre de tri

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Trier les résultats par kudos par chapitre
- Trier selon l'activité récente d'une fic
- Trier selon un score de ressemblance avec tes favoris
- Combiner plusieurs critères de tri en même temps (par exemple kudos + mises à jour récentes)
- Exporter son historique de recherche dans un fichier
- Sauvegarder des recherches sous un nom pour les relancer plus tard en un clic
- Des modèles de recherche tout prêts à réutiliser
- Des statistiques sur ses propres habitudes de recherche
- Des suggestions de tags propres à un fandom précis
- Des suggestions de combinaisons de tags qui vont bien ensemble
- Des conseils pour affiner sa recherche
- Tolérer les fautes de frappe dans l'historique de recherche
- Se connecter au vrai système d'autocomplétion des tags d'AO3 pendant qu'on tape — un réglage existe déjà pour ça, mais rien n'est branché derrière
- Des icônes selon le type de tag
- Un système de tags "tendance"
- Des graphiques en barres pour visualiser les fandoms
- Deviner la qualité d'une fic avec de l'intelligence artificielle
- Un bouton pour effacer complètement l'historique de recherche d'un coup
- Pouvoir chercher dans plusieurs fandoms en même temps
- Afficher les résultats de la recherche rapide dans une fenêtre superposée par-dessus la page, plutôt que de changer de page à chaque fois
- Trier vraiment les groupes de séries selon tes lectures passées — le tri "historique" actuel garde juste l'ordre où les séries apparaissent sur la page, il ne regarde pas ce que tu as vraiment lu

## Explicitement écarté

- Donner une couleur aux ratios de qualité — pour rester neutre

## Précision

⚠️ Une doc historique dit que les icônes de recherche rapide 🔍 (au survol
des tags/auteurs) ont été retirées à cause d'un conflit avec un autre
module. En réalité, elles sont bel et bien codées dans
`searchAutocomplete.js`.
