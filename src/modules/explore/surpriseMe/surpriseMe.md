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



   AO3 Helper — Surprise Me
   Module ID : surpriseMe

   Adds a "🎲 Random Work" button on any listing page (tag works, search
   results, bookmarks, marked-for-later, history). Clicking it picks one
   visible work blurb at random and navigates to it.

   Settings (from config.js):
     showPreviewBeforeOpen  – show title/summary/stats before opening
     completedOnly          – skip incomplete works


═══════════════════════════════════════════════════════════════════════════     
  # surpriseMe
  **Tab :** Explore
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Surprise Me** ajoute un bouton **🎲 Random Work** sur les listes d’œuvres AO3.

Lorsqu’il est utilisé, le module choisit au hasard une œuvre parmi celles actuellement affichées sur la page, puis ouvre directement sa page.

Il fonctionne notamment sur :

* les pages de tags ;
* les résultats de recherche ;
* les bookmarks ;
* la liste **Marked for Later** ;
* l’historique ;
* les collections ;
* les autres listings compatibles.

Le tirage est réellement aléatoire parmi les œuvres admissibles présentes sur la page.

---

# Réglages utilisateur

| Réglage                 | Par défaut                  | Ce que ça fait                                                   |
| ----------------------- | --------------------------- | ---------------------------------------------------------------- |
| `showPreviewBeforeOpen` | Désactivé                   | Affiche un aperçu de l’œuvre avant de l’ouvrir.                  |
| `completedOnly`         | Désactivé                   | Limite le tirage aux œuvres terminées.                           |
| `showDetails`           | Activé *(pas encore actif)* | Réservé à une future section d’analyse et de recommandations.    |
| `enableRecommendations` | Activé *(pas encore actif)* | Réservé à une future section d’analyse et de recommandations.    |
| `maxResults`            | `10` *(pas encore actif)*   | Définit une future limite de résultats pour les recommandations. |

---

# Structure du module

Le module est composé d’un seul fichier fonctionnel ainsi que d’une feuille de style.

```text
surpriseMe.js
surpriseMe.css
```

---

# surpriseMe.js

## Rôle

Contient l’ensemble du fonctionnement du module **Surprise Me**.

Il ajoute le bouton de tirage aléatoire, construit la liste des œuvres admissibles, choisit une œuvre au hasard et gère éventuellement l’affichage d’un aperçu avant l’ouverture.

---

## Fonctionnalités

### Bouton Random Work

Le module ajoute un bouton :

**🎲 Random Work**

sur les pages contenant une liste d’œuvres.

Ce bouton permet de sélectionner rapidement une œuvre sans avoir à choisir manuellement parmi les résultats.

---

### Tirage aléatoire

Lorsqu’il est déclenché, le module :

* récupère les fiches d’œuvres actuellement visibles ;
* retire les œuvres qui ne respectent pas les critères ;
* choisit une entrée au hasard ;
* ouvre la page correspondante.

Le tirage est réellement aléatoire dans le code actuel.

---

### Œuvres visibles

Le module choisit uniquement parmi les œuvres présentes sur la page courante.

Il ne parcourt pas automatiquement :

* les autres pages de résultats ;
* l’ensemble du fandom ;
* toute la bibliothèque AO3.

---

### Exclusion des œuvres cachées

Les œuvres déjà masquées par d’autres modules sont ignorées.

Elles ne peuvent donc pas être sélectionnées tant qu’elles ne sont pas visibles et admissibles.

---

### Exclusion des œuvres déjà lues

Les œuvres déjà marquées comme lues sont également retirées de la sélection.

Le module privilégie ainsi les œuvres qui n’ont pas encore été terminées par l’utilisateur.

---

### Filtre des œuvres terminées

Lorsque `completedOnly` est activé, le module exclut les œuvres encore en cours de publication.

Le tirage se fait uniquement parmi les œuvres terminées visibles sur la page.

---

### Aperçu avant ouverture

Lorsque `showPreviewBeforeOpen` est activé, le module n’ouvre pas immédiatement l’œuvre tirée.

Il affiche d’abord une carte d’aperçu contenant notamment :

* le titre ;
* l’auteur ;
* le nombre de mots ;
* le nombre de kudos ;
* le résumé.

---

### Actions de l’aperçu

La carte d’aperçu propose plusieurs actions :

* **Open** : ouvre l’œuvre sélectionnée ;
* **Reroll** : effectue un nouveau tirage ;
* **Close** : ferme l’aperçu sans ouvrir d’œuvre.

---

### Nouveau tirage

L’action **Reroll** relance la sélection parmi les œuvres admissibles de la page.

Elle permet d’obtenir une autre proposition sans quitter l’interface.

---

### Raccourci clavier

Le module peut être déclenché avec le raccourci :

`Ctrl + Shift + R`

Ce raccourci est fourni par le module consacré aux raccourcis clavier.

---

### Liste vide

Lorsqu’aucune œuvre ne correspond aux critères, le module affiche un message au lieu de tenter une navigation invalide.

Cela peut arriver lorsque :

* toutes les œuvres visibles sont déjà lues ;
* toutes les œuvres sont masquées ;
* le filtre `completedOnly` exclut tous les résultats ;
* aucune fiche d’œuvre compatible n’est présente.

---

## Détails techniques

### Sélection des candidates

Le module parcourt les fiches d’œuvres présentes dans le DOM et construit une liste de candidates admissibles.

---

### Filtres appliqués

Avant le tirage, il peut retirer :

* les fiches masquées ;
* les œuvres déjà lues ;
* les œuvres incomplètes lorsque `completedOnly` est activé.

---

### Tirage

Une entrée est choisie aléatoirement parmi les candidates restantes.

---

### Navigation

Lorsque l’aperçu est désactivé, le module navigue directement vers l’URL de l’œuvre choisie.

Lorsque l’aperçu est activé, la navigation attend l’action **Open**.

---

### Intégration avec les raccourcis

Le module peut recevoir un déclenchement externe depuis le système de raccourcis clavier.

---

# surpriseMe.css

## Rôle

Contient l’ensemble des styles visuels utilisés par le module **Surprise Me**.

Il définit notamment l’apparence :

* du bouton **🎲 Random Work** ;
* de la carte d’aperçu ;
* du titre et des métadonnées ;
* du résumé ;
* des boutons **Open**, **Reroll** et **Close** ;
* du message indiquant qu’aucune œuvre n’est disponible ;
* des différents états interactifs.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou mentionnées dans d’autres documents, mais ne disposent pas encore d’une implémentation complète.

---

## Analyse et recommandations

Une future section **Analysis & Recommendations** est prévue dans les réglages.

Les options suivantes lui sont réservées :

* `showDetails`
* `enableRecommendations`
* `maxResults`

Elles existent actuellement dans la configuration, mais aucun comportement réel n’est encore branché derrière elles.

---

## Sélection multiple

Proposer plusieurs œuvres tirées au hasard en une seule fois.

Par exemple :

* 5 œuvres ;
* 10 œuvres.

L’utilisateur pourrait ensuite choisir parmi cette sélection.

---

## Ajout multiple à Marked for Later

Ajouter automatiquement plusieurs œuvres tirées au hasard à **Marked for Later** en une seule opération.

---

## Zone du tirage

Permettre de choisir la portée du tirage.

Exemples :

* seulement la page actuelle ;
* tout le fandom ;
* plusieurs fandoms ;
* une autre zone définie par l’utilisateur.

---

## Exclusion des œuvres abandonnées

Exclure les œuvres marquées comme abandonnées, et pas seulement celles déjà lues jusqu’au bout.

---

## Longueur minimale

Ajouter un filtre permettant d’ignorer les œuvres trop courtes.

Le seuil pourrait être défini en nombre minimal de mots.

---

## Historique des tirages

Conserver la liste des œuvres tirées précédemment.

Cela permettrait notamment :

* d’éviter les répétitions ;
* de retrouver une œuvre proposée plus tôt ;
* de consulter l’historique des tirages.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Tirage réellement aléatoire

Une ancienne documentation indiquait que le tirage était simulé.

Ce n’est plus le cas.

Le module choisit réellement une œuvre au hasard parmi les candidates admissibles présentes sur la page.

---

## Absence de pondération

Toutes les œuvres admissibles ont la même probabilité d’être choisies.

Le module ne donne pas plus de chances à une œuvre selon :

* son nombre de kudos ;
* sa date de publication ;
* sa longueur ;
* sa popularité ;
* ses statistiques.

Cette décision préserve un tirage réellement aléatoire.

---

## AO3 uniquement

Le module ne cherche pas d’œuvres aléatoires sur d’autres sites.

Il reste limité aux listings AO3.

---

## Absence de similarité

Le tirage ne tient pas compte de la ressemblance avec les œuvres déjà lues ou appréciées.

Cette décision évite de transformer le module en système de recommandations.

---

## Bouton unique

Aucun bouton séparé **I’m Feeling Lucky** n’est prévu.

Il ferait doublon avec le bouton **🎲 Random Work** déjà présent.

---

## Aucune file de lecture

Le module n’ajoute pas automatiquement l’œuvre tirée à une file d’attente de lecture.

Cette responsabilité appartient à d’autres modules.

---

## Présence sur toutes les listes

Le bouton n’est pas configurable page par page.

Lorsqu’il est activé, il reste disponible sur toutes les pages de listings compatibles afin de conserver un comportement simple et prévisible.


