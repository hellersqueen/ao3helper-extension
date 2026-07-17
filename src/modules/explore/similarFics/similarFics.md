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


AO3 Helper - Similar Fics Module
    Module ID: similarFics
    Display Name: Similar Fics

    Key Features:
        - Metadata extraction for similarity matching
        - Same fandom/author/pairings recommendations
        - Match percentage display (visual similarity score)
        - In-work discovery ("Similar Stories" button)


═══════════════════════════════════════════════════════════════════════════
  # similarFics
  **Tab :** Explore
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Similar Fics** ajoute un bouton **Similar Stories** sur la page d’une œuvre AO3.
Ce bouton ouvre un panneau contenant des suggestions d’œuvres similaires à celle qui est actuellement consultée.

* Les recommandations sont principalement basées sur :
  - le fandom ;
  - les relations ou pairings ;
  - les tags partagés ;
  - la longueur de l’œuvre ;
  - l’auteur ;
  - certaines métadonnées générales de la fic.

Le module permet ainsi de découvrir rapidement d’autres œuvres proches sans quitter la page actuelle. Les recommandations restent entièrement locales et reposent sur les informations accessibles sur AO3. Aucun service d’intelligence artificielle externe n’est utilisé.

---

# Réglages utilisateur

| Réglage               | Ce que ça fait                                                                        |
| --------------------- | ------------------------------------------------------------------------------------- |
| `numResults`          | Définit le nombre de résultats à afficher : 5, 10 ou 15.                              |
| `showSimilarityScore` | Affiche le pourcentage de correspondance entre l’œuvre actuelle et chaque suggestion. |
| `highlightCommonTags` | Met en évidence les tags partagés avec l’œuvre actuelle.                              |
| `showSummary`         | Affiche le résumé de chaque suggestion dans le panneau.                               |
| `includeWIP`          | Inclut les œuvres en cours de publication.                                            |
| `openInNewTab`        | Ouvre les suggestions dans un nouvel onglet.                                          |

---

# Structure du module

Le module est composé d’un seul fichier fonctionnel ainsi que d’une feuille de style.

```text
similarFics.js
similarFics.css
```

---

# similarFics.js

## Rôle

Contient l’ensemble du fonctionnement du module **Similar Fics**.

Il extrait les métadonnées de l’œuvre en cours, lance des recherches sur AO3, calcule un score de similarité pour chaque résultat et affiche les meilleures recommandations dans un panneau organisé par catégories.

---

## Fonctionnalités

### Bouton Similar Stories

Le module ajoute un bouton **Similar Stories** sur la page d’une œuvre.

Ce bouton permet :

* d’ouvrir le panneau de recommandations ;
* de lancer la recherche d’œuvres proches ;
* de consulter les suggestions sans quitter la page actuelle.

---

### Extraction des métadonnées

Avant de chercher des œuvres similaires, le module récupère les informations disponibles sur la page actuelle.

Il peut notamment extraire :

* le fandom ;
* les relations ou pairings ;
* les tags principaux ;
* la note ou rating ;
* le nombre de mots ;
* l’auteur ;
* l’identifiant de l’œuvre en cours.

Ces informations servent de base au calcul de similarité.

---

### Recherche d’œuvres similaires

Le module lance des recherches sur AO3 afin de trouver :

* des œuvres appartenant au même fandom ;
* des œuvres partageant des relations ou pairings similaires ;
* des œuvres utilisant des tags proches ;
* d’autres œuvres écrites par le même auteur.

---

### Recommandations par fandom

Les œuvres du même fandom peuvent recevoir un score plus élevé que celles provenant d’un autre fandom.

Cette correspondance constitue l’un des principaux critères de similarité.

---

### Recommandations par relation

Les œuvres partageant les mêmes relations ou pairings peuvent être regroupées dans une catégorie spécifique.

Cette catégorie est affichée sous le titre :

**Similar Pairings**

---

### Recommandations par auteur

Le module cherche également d’autres œuvres du même auteur.

Elles sont regroupées dans une section semblable à :

**More by [auteur]**

---

### Recommandations générales

Les œuvres qui correspondent principalement par leurs tags, leur fandom ou leur longueur sont regroupées sous :

**Similar Stories**

---

### Calcul du score

Chaque résultat reçoit un score de ressemblance.

Le calcul tient notamment compte :

* du fandom partagé ;
* des tags en commun ;
* des relations en commun ;
* de la proximité de longueur ;
* de l’auteur.

Les œuvres sont ensuite classées selon ce score afin de conserver les meilleurs résultats.

---

### Pourcentage de correspondance

Le module peut afficher un pourcentage représentant la similarité entre l’œuvre actuelle et chaque suggestion.

Cette fonctionnalité existe dans les caractéristiques principales du module.

Le réglage `showSimilarityScore` est toutefois indiqué comme non encore relié au comportement réel.

---

### Longueur de l’œuvre

La longueur de l’œuvre actuelle est utilisée comme critère de comparaison.

Les œuvres dont le nombre de mots est proche peuvent recevoir un meilleur score.

Aucune limite stricte de proximité, comme une différence maximale de 20 %, n’est actuellement appliquée.

---

### Exclusion de l’œuvre actuelle

Le module retire automatiquement l’œuvre actuellement consultée des résultats.

Elle ne peut donc pas se recommander elle-même.

---

### Exclusion des œuvres déjà lues

Les œuvres déjà marquées comme lues sont ignorées lorsqu’elles peuvent être identifiées par le module.

Cela permet de privilégier les découvertes.

---

### Classement des résultats

Une fois les résultats récupérés et évalués, le module :

* élimine les résultats non pertinents ;
* retire les doublons ;
* classe les œuvres selon leur score ;
* conserve les meilleures suggestions ;
* répartit les résultats dans les différentes sections.

---

### Ajout à Marked for Later

Chaque suggestion peut contenir un bouton :

**+ MFL**

Ce bouton permet d’ajouter directement l’œuvre à la liste **Marked for Later** sans devoir ouvrir sa page.

---

### Découverte depuis la page d’une œuvre

Le module fonctionne directement depuis la page de l’œuvre actuellement consultée.

Il ne propose pas encore de recommandations depuis :

* les résultats de recherche ;
* les pages de tags ;
* les listes de bookmarks ;
* les autres listings AO3.

---

## Détails techniques

### Données utilisées

Le système de recommandation repose sur les métadonnées disponibles dans le DOM et dans les résultats de recherche AO3.

Il n’analyse pas le contenu complet des œuvres.

---

### Critères de similarité

Les critères principaux sont :

* fandom identique ;
* auteur identique ;
* relations ou pairings communs ;
* tags communs ;
* longueur comparable.

---

### Pondération actuelle

Les tags sont actuellement considérés de manière uniforme.

Le module ne donne pas encore plus de poids :

* aux tags de relation ;
* aux tags de personnage ;
* aux tags additionnels.

---

### Recherche locale

Les recommandations sont construites à partir des recherches AO3 et du calcul local effectué dans le navigateur.

Aucune API d’intelligence artificielle ou plateforme externe de recommandation n’est utilisée.

---

### Limites de configuration

Même si plusieurs options existent dans le panneau, le fichier utilise encore principalement son comportement interne par défaut.

Les réglages suivants ne modifient pas encore réellement l’affichage :

* `numResults`
* `showSimilarityScore`
* `highlightCommonTags`
* `showSummary`
* `includeWIP`
* `openInNewTab`

---

# similarFics.css

## Rôle

Contient l’ensemble des styles visuels utilisés par le module **Similar Fics**.

Il définit notamment l’apparence :

* du bouton **Similar Stories** ;
* du panneau de recommandations ;
* des différentes sections ;
* des cartes de résultats ;
* des scores de similarité ;
* des tags partagés ;
* des résumés ;
* des boutons **+ MFL** ;
* des états de chargement ;
* des messages d’erreur ou d’absence de résultats.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont prévues dans la conception du module ou mentionnées dans d’autres documents, mais ne disposent pas encore d’une implémentation complète.

---

## Réglages déjà présents mais inactifs

### Nombre de résultats

Connecter `numResults` au fonctionnement du module afin de permettre l’affichage de :

* 5 suggestions ;
* 10 suggestions ;
* 15 suggestions.

---

### Affichage du score

Connecter `showSimilarityScore` afin de pouvoir afficher ou masquer le pourcentage de correspondance.

---

### Tags communs

Connecter `highlightCommonTags` afin de mettre réellement en évidence les tags partagés.

---

### Résumés

Connecter `showSummary` afin de pouvoir afficher ou masquer le résumé de chaque œuvre.

---

### Œuvres en cours

Connecter `includeWIP` afin de choisir si les œuvres inachevées doivent être incluses.

---

### Nouvel onglet

Connecter `openInNewTab` afin de choisir si les suggestions doivent s’ouvrir dans la page actuelle ou dans un nouvel onglet.

---

## Filtres de similarité

### Exclusions précises

Permettre d’exclure certains types de similarité.

Exemple :

* rechercher des œuvres similaires ;
* mais exclure les univers café.

---

### Longueur différente

Permettre de chercher volontairement des œuvres :

* plus courtes ;
* plus longues ;
* de longueur semblable.

---

### Œuvres terminées uniquement

Ajouter un filtre permettant d’exclure les œuvres en cours et de ne conserver que les œuvres complètes.

---

### Rating

Permettre de filtrer les suggestions selon la note ou le rating de l’œuvre.

---

### Proximité de longueur

Ne conserver que les œuvres dont la longueur se situe dans une plage définie autour de l’œuvre actuelle.

Exemple :

* environ 20 % plus courtes ;
* environ 20 % plus longues.

---

## Contrôle de la similarité

### Curseur proximité-surprise

Ajouter un curseur permettant de choisir entre :

* des recommandations très proches ;
* des recommandations plus variées ou surprenantes.

---

### Pondération personnalisée

Permettre à l’utilisateur de définir l’importance de chaque critère.

Par exemple :

* fandom ;
* relation ;
* tags ;
* auteur ;
* longueur.

---

### Priorité des types de tags

Donner plus de poids aux tags de relation qu’aux tags de personnage ou aux tags libres.

Le système actuel traite tous les tags de manière similaire.

---

### Explication des recommandations

Afficher une explication simple pour chaque suggestion.

Exemples :

* même pairing ;
* 6 tags en commun ;
* longueur similaire ;
* même auteur.

---

## Recommandations contextuelles

### Temps de lecture disponible

Proposer des œuvres selon le temps dont dispose l’utilisateur.

Exemples :

* lecture rapide ;
* lecture moyenne ;
* longue épopée.

---

### Suites et préquelles

Reconnaître les œuvres appartenant à la même série afin de recommander en priorité :

* les suites ;
* les préquelles ;
* les œuvres connexes.

---

### Collections préparées

Créer des collections automatiques comme :

* lectures rapides ;
* grandes épopées ;
* œuvres courtes terminées ;
* longues séries.

---

### Pages de recherche et de tags

Afficher également des recommandations depuis :

* les pages de recherche ;
* les pages de tags ;
* les listings d’œuvres.

---

### Fin de lecture

Afficher automatiquement des recommandations lorsque l’utilisateur marque une œuvre comme :

* terminée ;
* abandonnée.

---

### Recommandations globales

Produire des suggestions à partir de l’ensemble des bookmarks ou favoris de l’utilisateur plutôt que seulement à partir de l’œuvre actuelle.

---

## Personnalisation et apprentissage

### Apprentissage des clics

Utiliser les suggestions ouvertes ou ignorées afin d’améliorer progressivement les résultats.

---

### Bouton Pas intéressé

Ajouter un bouton permettant d’écarter une recommandation.

Le module pourrait ensuite éviter de la proposer de nouveau.

---

### Intégration avec Trope Games

Utiliser les données du module de jeux de tropes pour affiner les suggestions.

---

## Interface

### Barre latérale

Afficher les recommandations dans une barre latérale toujours visible, plutôt que dans un panneau ouvert manuellement.

---

### Adaptation mobile

Masquer automatiquement le panneau ou utiliser une présentation différente lorsque l’écran est trop étroit.

---

### Bouton Bookmark

Ajouter un bouton permettant de créer directement un bookmark en plus du bouton **+ MFL**.

---

### Couvertures automatiques

Générer automatiquement une image de couverture pour chaque suggestion.

---

## Performance

### Cache des recommandations

Conserver les résultats déjà calculés afin d’éviter de relancer toutes les recherches à chaque ouverture du panneau.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Fonctionnement local

Les recommandations sont calculées localement à partir des métadonnées AO3.

Le module ne transmet pas les données de lecture ou de recherche à un service tiers.

---

## Absence d’intelligence artificielle externe

Les recommandations générées par intelligence artificielle ou par un service en ligne ont été explicitement écartées.

Cette décision permet :

* de conserver un fonctionnement simple ;
* de préserver la confidentialité ;
* d’éviter une dépendance à un service externe ;
* de limiter les coûts et les problèmes de disponibilité.

---

## Métadonnées plutôt que texte intégral

Le module compare principalement les métadonnées de l’œuvre.

Il ne lit pas ni n’analyse automatiquement l’intégralité du texte des œuvres recommandées.

---

## Recommandations centrées sur l’œuvre actuelle

Le fonctionnement actuel part toujours de la fic consultée.

Il ne construit pas encore un profil global des préférences de l’utilisateur à partir de toute sa bibliothèque.

---

## Bouton Marked for Later

L’action rapide proposée actuellement est **+ MFL**.

L’ajout direct aux bookmarks n’est pas encore inclus.

