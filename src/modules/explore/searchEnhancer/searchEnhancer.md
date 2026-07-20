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
| `searchTemplates` | activé | Modèles de recherche rapide (kudos, mis à jour, terminé, plus long) |
| `searchInsights` | activé | Statistiques personnelles de recherche (termes, tendance, fandoms) |
| `refinementTips` | activé | Astuce d'affinage quand une recherche renvoie 0 ou beaucoup de résultats |
| `searchHistory` | activé | Historique de recherche (25 recherches max) |
| `historyTypoTolerance` | activé | Tolère une faute de frappe dans la recherche de l'historique |
| `tagAutocomplete` | activé | Fusionne les suggestions officielles `/autocomplete/tag` d'AO3 dans le menu déroulant |
| `sortByKudosRatio` | activé | Active le tri par ratio kudos/vues |
| `sortBySaveRate` | activé | Active le tri par taux de sauvegarde |
| `sortByKudosPerChapter` | activé | Active le tri par kudos par chapitre |
| `sortByRecentActivity` | activé | Active le tri par activité récente (date de mise à jour) |
| `sortByBalanced` | activé | Active le tri équilibré (ratio kudos + récence) |
| `showRatioInline` | activé | Affiche le ratio à côté des statistiques ("12% eng.") |
| `groupSeriesInResults` | désactivé | Regroupe les séries dans les résultats de recherche |
| `fandomSortMode` | `alpha` | Le tri par défaut des groupes : alphabétique, popularité, ou historique (désormais un vrai tri par lectures passées) |

## Fichiers

### 1. `_searchEnhancer.js` — le chef d'orchestre

- Met en route les quatre autres fichiers de fonctionnalités et partage des outils communs entre eux
- Contient aussi le calcul propre au tri des groupes de séries selon l'historique de lecture
- Calcule les scores de récence et d'engagement utilisés pour trier les résultats
- Centralise la recherche tolérante aux fautes, les statistiques d'historique et les modèles de recherche rapide

### 2. `relatedSearches.js` — suggestions de tags liés

- Sur une page de recherche ou de tag, propose jusqu'à 8 tags souvent utilisés avec ceux déjà choisis
- Propose aussi des suggestions basées sur l'historique de recherche
- Un clic sur une suggestion l'ajoute directement à la recherche
- Modèles de recherche rapide en un clic (kudos, mis à jour, terminé, plus long)
- Panneau "Vos statistiques de recherche" (termes les plus recherchés, tendance personnelle, fandoms les plus recherchés) — dérivé uniquement de l'historique local, sans réseau
- Astuce d'affinage selon le nombre de résultats trouvés

### 3. `searchAutocomplete.js` — historique et recherche rapide

- Garde en mémoire les 25 dernières recherches, et les propose dans un menu déroulant pendant qu'on tape
- Tolère une faute de frappe dans la recherche de l'historique (repli seulement si aucune correspondance exacte)
- Fusionne les suggestions officielles `/autocomplete/tag` d'AO3 dans ce même menu, avec une icône selon le type de tag
- Ajoute une icône 🔍 au survol d'un tag ou d'un nom d'auteur, pour lancer une recherche rapide en un clic

### 4. `resultsSorting.js` — tri par engagement

- Ajoute une barre pour trier les résultats : ordre normal, ratio kudos/vues, taux de sauvegarde, kudos, vues, kudos par chapitre, activité récente, ou équilibré
- Affiche un petit badge "X% eng." à côté des statistiques de chaque fic
- Se souvient du dernier tri choisi pour chaque page

### 5. `seriesGrouping.js` — regroupement des séries

- Regroupe visuellement les fics d'une même série (si au moins 2 apparaissent sur la page) sous un en-tête commun
- Les groupes peuvent être triés par ordre alphabétique, par popularité, ou par un vrai historique de lecture (via `readingTracker`)

### 6. `searchEnhancer.css`

- Les styles visuels des panneaux, suggestions, menu déroulant, barre de tri, modèles, statistiques et barres de fandoms

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Trier les résultats par kudos par chapitre~~ ✅ Fait — mode de tri `kudos_per_chapter` dans `resultsSorting.js`, réglage `sortByKudosPerChapter`
- ~~Trier selon l'activité récente d'une fic~~ ✅ Fait — mode de tri `recent` (basé sur la date de mise à jour déjà affichée sur le blurb), réglage `sortByRecentActivity`
- ~~Trier selon un score de ressemblance avec tes favoris~~ ❌ Écarté — ça reviendrait à un vrai moteur de recommandation par similarité, déjà explicitement écarté ailleurs dans le projet (`docs/never-built-modules.md` › "Recommendation Engine")
- ~~Combiner plusieurs critères de tri en même temps (par exemple kudos + mises à jour récentes)~~ ✅ Fait — mode de tri `balanced` (ratio kudos pondéré + récence), réglage `sortByBalanced`
- ~~Exporter son historique de recherche dans un fichier~~ ✅ Fait — bouton "Export history (JSON)" dans le panneau de réglages
- ~~Sauvegarder des recherches sous un nom pour les relancer plus tard en un clic~~ ✅ Fait (déjà couvert ailleurs) — c'est exactement ce que fait `filterManager`/`presetManagement.js` (les presets capturent tous les champs du formulaire, y compris les mots-clés, et se relancent en un clic) ; l'historique de *ce* module reste un journal automatique des recherches passées, pas des presets nommés
- ~~Des modèles de recherche tout prêts à réutiliser~~ ✅ Fait — section "⚡ Quick templates" du panneau de suggestions (les vrais presets personnalisés restent le rôle de `filterManager`, voir ci-dessus)
- ~~Des statistiques sur ses propres habitudes de recherche~~ ✅ Fait — section "📊 Your search insights" (termes les plus recherchés)
- ~~Des suggestions de tags propres à un fandom précis~~ ❌ Écarté — nécessiterait de connaître les tags populaires *au sein* d'un fandom donné, ce qui suppose de crawler de nombreuses œuvres de ce fandom ; coût réseau jugé excessif
- ~~Des suggestions de combinaisons de tags qui vont bien ensemble~~ ✅ Fait (déjà le cas) — c'est exactement ce que fait la bibliothèque `CO_TAGS` de `relatedSearches.js` (ex: Slow Burn → Mutual Pining, Enemies to Lovers…), déjà affichée sous "🏷 You might also like"
- ~~Des conseils pour affiner sa recherche~~ ✅ Fait — astuce d'affinage basée sur le nombre de résultats, réglage `refinementTips`
- ~~Tolérer les fautes de frappe dans l'historique de recherche~~ ✅ Fait — réglage `historyTypoTolerance`, repli sur une distance d'édition de 1 quand aucune correspondance exacte n'est trouvée
- ~~Se connecter au vrai système d'autocomplétion des tags d'AO3 pendant qu'on tape — un réglage existe déjà pour ça, mais rien n'est branché derrière~~ ✅ Fait — le champ de recherche libre interroge désormais `/autocomplete/tag?term=` (même origine) et fusionne les résultats avec l'historique local
- ~~Des icônes selon le type de tag~~ ✅ Fait — icône selon la catégorie renvoyée par AO3 (🌐 fandom, 👤 personnage, 💞 relation, # tag additionnel, 🏷 par défaut)
- ~~Un système de tags "tendance"~~ ✅ Fait (recentré) — "tendance" au sens site-entier nécessiterait de crawler AO3 (coût réseau excessif) ; recentré sur une tendance *personnelle* dérivée de l'historique local (termes recherchés plus souvent récemment que par le passé), dans le panneau "📊 Your search insights"
- ~~Des graphiques en barres pour visualiser les fandoms~~ ✅ Fait — barres proportionnelles aux fandoms les plus recherchés localement, même panneau
- ~~Deviner la qualité d'une fic avec de l'intelligence artificielle~~ ❌ Écarté — même principe de neutralité que la décision déjà prise dans ce module de ne pas colorer les ratios d'engagement ("pour rester neutre") : un score de qualité automatique serait présenté comme une mesure objective qu'il n'est pas
- ~~Un bouton pour effacer complètement l'historique de recherche d'un coup~~ ✅ Fait (déjà le cas) — l'action "Clear history" existe déjà en bas du menu déroulant d'autocomplétion (`searchAutocomplete.js`), simplement absente de cette liste
- ~~Pouvoir chercher dans plusieurs fandoms en même temps~~ ❌ Écarté — AO3 le permet déjà nativement : le champ Fandoms du formulaire de recherche avancée (`work_search[fandom_names]`) accepte plusieurs noms séparés par des virgules
- ~~Afficher les résultats de la recherche rapide dans une fenêtre superposée par-dessus la page, plutôt que de changer de page à chaque fois~~ ❌ Écarté — reproduire une page de résultats AO3 complète (avec pagination, tri, filtres) dans une fenêtre superposée dupliquerait une grande partie de l'interface native d'AO3 côté client ; complexité et fragilité jugées excessives par rapport à l'ouverture dans un nouvel onglet déjà possible (Ctrl+clic)
- ~~Trier vraiment les groupes de séries selon tes lectures passées — le tri "historique" actuel garde juste l'ordre où les séries apparaissent sur la page, il ne regarde pas ce que tu as vraiment lu~~ ✅ Fait — le mode `history` compare désormais les œuvres de chaque groupe à `ao3h:rt:history` (readingTracker) et trie par nombre réel d'œuvres déjà visitées

## Explicitement écarté

- Donner une couleur aux ratios de qualité — pour rester neutre
- Trier selon un score de ressemblance avec les favoris — reviendrait à un moteur de recommandation par similarité, déjà écarté ailleurs dans le projet
- Suggestions de tags propres à un fandom précis — nécessiterait de crawler de nombreuses œuvres du fandom, coût réseau excessif
- Deviner la qualité d'une fic avec de l'IA — même principe de neutralité que pour les ratios de qualité
- Chercher dans plusieurs fandoms en même temps — AO3 le permet déjà nativement (champ Fandoms multi-valeurs)
- Recherche rapide en fenêtre superposée — dupliquerait une grande partie de l'interface de résultats native d'AO3, trop complexe et fragile pour le bénéfice

## Précision

⚠️ Une doc historique dit que les icônes de recherche rapide 🔍 (au survol
des tags/auteurs) ont été retirées à cause d'un conflit avec un autre
module. En réalité, elles sont bel et bien codées dans
`searchAutocomplete.js`.

## Détails techniques

Le module s'applique sur `/works/search`, `/tags/{tag}/works`, et tout
listing comportant un formulaire de recherche.

Stockage :
- `ao3h:se:history` — `[{ query, ts, fandom }]`, 25 entrées max, dédupliqué LIFO
- `ao3h:se:sort` — dernier mode de tri choisi, par chemin de page
- `ao3h:se:sugcache` — `{ [tagKey]: { tags, ts } }`, cache 7 jours des suggestions liées

**Bug corrigé (chantier 4) :** `seriesGrouping.js`'s propre `isListingPage()`
ne reconnaissait que `/works` ou `/tags/*/works`, jamais `/works/search` —
l'URL de résultats la plus courante. Le regroupement de séries (et donc le
tri par historique réel) ne s'exécutait donc jamais sur cette page. D'abord
corrigé en ajoutant `/^\/works\/search/` au regex local, puis `seriesGrouping.js`
et `resultsSorting.js` sont tous deux passés à l'`isListingPage()` canonique
de `lib/ao3/parsers.js`, qui couvre aussi bookmarks/collections/pages user.
