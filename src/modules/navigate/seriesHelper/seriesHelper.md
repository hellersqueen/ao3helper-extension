# seriesHelper

**Tab:** Navigate & Interact

## À quoi ça sert

Ce module améliore la navigation dans les séries de fics sur AO3 : il
affiche la progression dans une série, des badges d'info, une bannière de
navigation entre les épisodes, et regroupe les fics d'une même série sur
les listes de résultats.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `epicSeriesWarning` | désactivé | Affiche un badge d'avertissement sur les séries de 20 fics ou plus |
| `groupSeriesInSearch` | désactivé | Regroupe les fics d'une même série dans les résultats de recherche |
| `enableShortcuts` | activé *(pas encore actif)* | Réservé pour une future fonctionnalité de raccourcis |
| `enableFilters` | activé *(pas encore actif)* | Réservé pour une future fonctionnalité de filtres |

## Fichiers

### 1. `_seriesHelper.js` — le chef d'orchestre

- Partage des outils communs (lecture/écriture de données) utilisés par les deux autres fichiers

### 2. `seriesProgress.js` — progression et infos de série

- Ajoute une barre de progression sur chaque lien "Part X of Y"
- Affiche un badge d'avertissement pour les séries très longues (20 fics ou plus)
- Affiche un badge indiquant si la série est plutôt une suite d'histoires liées ou une anthologie, quand l'info est connue
- Affiche un badge si on est déjà abonné à la série
- Affiche un badge "terminée" ou "en cours"
- Sur la page d'une fic qui fait partie d'une série, ajoute une bannière avec la progression et des liens vers l'épisode précédent/suivant

### 3. `seriesOrganization.js` — regroupement dans les listes

- Sur les listes de fics, regroupe sous un même en-tête les fics qui appartiennent à la même série
- Chaque groupe propose d'aller directement à la page de la série, de tout masquer d'un coup, ou de replier/déplier le groupe

### 4. `seriesHelper.css`

- Les styles visuels des barres de progression, badges, bannière et groupes

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Suggestions d'ordre de lecture (par exemple l'ordre chronologique de l'histoire plutôt que l'ordre de publication)
- Passer directement à la prochaine fic non lue d'une série
- Comparer plusieurs séries entre elles
- Voir le nombre total de mots et le temps de lecture total d'une série entière
- Synchroniser le statut de lecture de la série avec celui des fics individuelles
- Prévenir quand un numéro manque dans une série (par exemple "Part 3" absent d'une série qui en a 5)
- Voir à quelle vitesse on avance dans une série, avec une date de fin estimée
- Un petit rappel quand il ne reste plus que quelques fics à lire dans une série
- Un panneau récapitulatif une fois une série terminée
- Un vrai tableau de bord de statistiques sur toutes tes séries
- Une vue consolidée de tous les favoris d'une même série, avec un bouton pour mettre toute la série en favori d'un coup
- Choisir soi-même à partir de combien de fics une série se replie automatiquement dans les listes de résultats (aujourd'hui le seuil est fixe)
- Voir la date de la dernière mise à jour d'une série
- Un bouton pour se désabonner rapidement d'une série, directement depuis le badge d'abonnement
- Cacher les liens vers des séries vides, sans aucune fic visible
- Un badge "Part X de Y" affiché directement sur chaque fic dans les résultats de recherche, avec un lien vers la page de la série
- Deviner automatiquement si une série est plutôt une suite d'histoires à lire dans l'ordre ou une anthologie d'histoires indépendantes : le badge existe dans le code, mais rien ne calcule vraiment cette information aujourd'hui, donc il ne s'affiche jamais

## Explicitement écarté

- Un mode "enchaînement automatique" qui ouvre la fic suivante d'une série tout seul — jugé trop intrusif
- Des recommandations de séries à lire — ce n'est pas le rôle de ce module
- Modifier à la main l'ordre des fics dans une série — l'ordre choisi par l'auteur·ice est toujours respecté
- Télécharger une série entière d'un coup — c'est un autre module qui s'en charge
- Changer soi-même à partir de combien de fics une série est considérée "Epic" — le seuil est fixé à 20
- De simples boutons précédent/suivant dans une série — écarté car AO3 les propose déjà nativement ("Next Work in Series") ; ce module sert à suivre la progression, pas à refaire la navigation



AO3 Helper - Series Helper Module Coordinator
    Module ID: seriesHelper
    Display Name: Series Helper
    Tab: Navigate & Interact

    Submodules (Tier 2 — imported by this coordinator, self-register with
    parent: 'seriesHelper', then boot automatically through the cascade logic
    built into core/lifecycle.js's bootOne()):
        seriesOrganization
        seriesProgress

    Shared API (W.AO3H_SeriesHelper, set before submodule cascade):
        W.AO3H_SeriesHelper.lsGet(key)
        W.AO3H_SeriesHelper.lsSet(key, val)
        W.AO3H_SeriesHelper.NS

    Config keys:
        epicSeriesWarning   -- warning badge for large series (20+ works) — key: epicSeriesWarning
        groupSeriesInSearch -- group series works in search results


═══════════════════════════════════════════════════════════════════════════
  # seriesHelper
  **Tab :** Navigate & Interact
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Series Helper** améliore la navigation et le suivi des séries d’œuvres sur AO3.

* Il permet notamment de :
  - afficher la progression dans une série ;
  - signaler les séries particulièrement longues ;
  - afficher différents badges d’information sur les séries ;
  - indiquer si une série est terminée, en cours ou déjà suivie ;
  - ajouter une bannière de progression sur les pages d’œuvres appartenant à une série ;
  - regrouper les œuvres d’une même série dans les listes de résultats ;
  - fournir des actions communes pour gérer ces groupes.

---

# Réglages utilisateur

| Réglage               | Description                                                                           |
| --------------------- |---------------------------------------------------------------------------------------|
| `epicSeriesWarning`   | Affiche un badge d’avertissement sur les séries contenant au moins 20 œuvres.         |
| `groupSeriesInSearch` | Regroupe les œuvres appartenant à une même série dans les résultats de recherche.     |
| `enableShortcuts`     | Réservé à une future fonctionnalité de raccourcis. Ce réglage n’est pas encore actif. |
| `enableFilters`       | Réservé à une future fonctionnalité de filtres. Ce réglage n’est pas encore actif.    |

---

# Structure du module

Le module est composé d’un fichier coordinateur, de deux sous-modules fonctionnels et d’une feuille de style.

```text
_seriesHelper.js
seriesProgress.js
seriesOrganization.js
seriesHelper.css
```

---

# _seriesHelper.js

## Rôle

Fichier coordinateur du module.

Il initialise l’API commune utilisée par les sous-modules, partage les outils de stockage nécessaires et permet leur démarrage automatique dans le système de cycle de vie d’AO3 Helper.

---

## Responsabilités

* Définit l’API commune du module avant l’initialisation des sous-modules.
* Fournit des fonctions partagées de lecture et d’écriture dans le stockage local.
* Expose l’espace de noms utilisé par les sous-modules.
* Importe et coordonne :

  * `seriesProgress.js` ;
  * `seriesOrganization.js`.
* Permet aux deux sous-modules de s’enregistrer comme enfants de `seriesHelper`.
* S’appuie sur la logique de cascade de `core/lifecycle.js` pour leur démarrage automatique.

---

## Fonctions exposées

L’API partagée est accessible via :

```text
W.AO3H_SeriesHelper
```

Elle expose :

```text
W.AO3H_SeriesHelper.lsGet(key)
W.AO3H_SeriesHelper.lsSet(key, val)
W.AO3H_SeriesHelper.NS
```

Ces fonctions permettent respectivement :

* de lire une valeur dans le stockage local ;
* d’enregistrer une valeur dans le stockage local ;
* d’accéder à l’espace de noms commun du module.

---

## Détails techniques

### Sous-modules

Les sous-modules de niveau 2 sont :

```text
seriesOrganization
seriesProgress
```

Ils s’enregistrent avec :

```text
parent: 'seriesHelper'
```

Leur démarrage est ensuite pris en charge automatiquement par la logique de cascade intégrée à :

```text
core/lifecycle.js
```

et plus précisément à la fonction :

```text
bootOne()
```

### Clés de configuration principales

| Clé                   | Description                                                                           |
| --------------------- | ------------------------------------------------------------------------------------- |
| `epicSeriesWarning`   | Contrôle l’affichage du badge d’avertissement pour les séries de 20 œuvres ou plus.   |
| `groupSeriesInSearch` | Contrôle le regroupement des œuvres d’une même série dans les résultats de recherche. |

---

## Dépendances

Le coordinateur dépend :

* du système de cycle de vie d’AO3 Helper ;
* de `core/lifecycle.js` ;
* du stockage local ;
* de `seriesProgress.js` ;
* de `seriesOrganization.js`.

---

# seriesProgress.js

## Rôle

Affiche la progression et les principales informations relatives aux séries.

Le sous-module intervient à la fois sur les liens de série présents dans les pages AO3 et sur les pages individuelles des œuvres appartenant à une série.

---

## Fonctionnalités

### Barre de progression

Le sous-module détecte les liens de série utilisant une indication de type :

```text
Part X of Y
```

Il ajoute une barre de progression représentant la position actuelle de l’œuvre dans la série.

Cette barre permet de visualiser rapidement :

* le numéro de l’œuvre actuelle ;
* le nombre total d’œuvres dans la série ;
* la proportion déjà atteinte dans la série.

---

### Avertissement pour les séries longues

Lorsque `epicSeriesWarning` est activé, le sous-module affiche un badge d’avertissement sur les séries contenant au moins 20 œuvres.

Le seuil est fixé à :

```text
20
```

Une série atteignant ou dépassant ce seuil est considérée comme une série **Epic**.

---

### Badge de type de série

Le sous-module peut afficher un badge indiquant si une série correspond plutôt à :

* une suite d’histoires liées à lire dans l’ordre ;
* une anthologie d’histoires plus indépendantes.

Ce badge n’apparaît que lorsque cette information est déjà connue.

Le code permet son affichage, mais aucune logique actuelle ne détermine automatiquement le type de série.

---

### Badge d’abonnement

Le sous-module affiche un badge lorsqu’un utilisateur est déjà abonné à la série.

Cet indicateur permet de connaître le statut d’abonnement sans devoir ouvrir séparément la page de gestion correspondante.

---

### Statut de la série

Le sous-module peut afficher un badge indiquant si la série est :

* terminée ;
* en cours.

---

### Bannière sur les pages d’œuvres

Lorsqu’une œuvre appartient à une série, le sous-module ajoute une bannière de navigation et de progression sur la page de la fic.

Cette bannière affiche notamment :

* la position de l’œuvre dans la série ;
* la progression globale ;
* un lien vers l’épisode précédent ;
* un lien vers l’épisode suivant.

---

## Détails techniques

### Sources d’information

Le sous-module utilise les informations déjà présentes dans les pages AO3, notamment :

* les liens de série ;
* les indications `Part X of Y` ;
* les données de statut accessibles ;
* les informations d’abonnement lorsqu’elles sont connues.

### Seuil Epic

Le seuil des séries longues est fixe.

Une série est considérée comme **Epic** à partir de 20 œuvres.

### Type de série

Le badge distinguant les suites narratives des anthologies existe dans le code.

Cependant, aucune fonction actuelle n’analyse automatiquement la série pour déterminer sa catégorie.

En l’absence d’une information déjà connue, le badge ne s’affiche donc pas.

---

## Dépendances

Ce sous-module est coordonné par `_seriesHelper.js`.

Il dépend :

* de l’API `W.AO3H_SeriesHelper` ;
* du DOM des pages AO3 ;
* des informations de série fournies par AO3 ;
* des styles définis dans `seriesHelper.css`.

---

# seriesOrganization.js

## Rôle

Organise les œuvres appartenant à une même série dans les listes de résultats.

Il regroupe les œuvres liées sous un en-tête commun et fournit plusieurs actions pour gérer le groupe.

---

## Fonctionnalités

### Regroupement des séries

Lorsque `groupSeriesInSearch` est activé, le sous-module repère les œuvres appartenant à une même série dans une liste.

Il les rassemble sous un seul groupe afin de réduire les répétitions et de mieux montrer leur relation.

---

### En-tête de groupe

Chaque groupe de série possède un en-tête commun.

Cet en-tête permet notamment :

* d’identifier la série ;
* d’accéder directement à sa page ;
* de masquer toutes les œuvres du groupe ;
* de replier le groupe ;
* de déplier le groupe.

---

### Accès à la page de la série

Le groupe fournit un lien direct vers la page AO3 de la série concernée.

---

### Masquage du groupe

Une action permet de masquer toutes les œuvres d’une série en une seule fois.

---

### Repli et dépliage

Chaque groupe peut être replié ou déplié.

Cette fonctionnalité permet de réduire la place occupée par les séries contenant plusieurs œuvres dans les résultats.

Le seuil à partir duquel un groupe peut être automatiquement replié est actuellement fixe et ne peut pas être personnalisé.

---

## Détails techniques

### Condition d’activation

La fonctionnalité dépend du réglage :

```text
groupSeriesInSearch
```

### Portée

Le sous-module agit sur les listes d’œuvres, notamment les résultats de recherche compatibles.

### Identification des groupes

Les œuvres sont regroupées à partir des informations de série présentes dans leurs entrées de liste.

---

## Dépendances

Ce sous-module est coordonné par `_seriesHelper.js`.

Il dépend :

* de l’API `W.AO3H_SeriesHelper` ;
* du DOM des listes AO3 ;
* des liens et identifiants de série présents dans les résultats ;
* des styles définis dans `seriesHelper.css`.

---

# seriesHelper.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Series Helper**.

Il définit notamment l’apparence :

* des barres de progression ;
* des badges de série longue ;
* des badges de type de série ;
* des badges d’abonnement ;
* des badges de statut ;
* de la bannière affichée sur les pages d’œuvres ;
* des groupes de séries dans les résultats ;
* des états repliés et dépliés ;
* des actions associées aux groupes.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont mentionnées dans d’autres documents du projet, mais ne sont pas actuellement présentes dans le module.

---

## Suggestions d’ordre de lecture

Proposer un ordre alternatif pour lire une série.

Cela pourrait notamment permettre de suivre :

* l’ordre chronologique de l’histoire ;
* un ordre recommandé différent de l’ordre de publication.

---

## Prochaine œuvre non lue

Permettre de passer directement à la prochaine œuvre non lue d’une série.

---

## Comparaison de séries

Permettre de comparer plusieurs séries entre elles.

---

## Statistiques globales d’une série

Afficher pour une série entière :

* le nombre total de mots ;
* le temps de lecture total estimé.

---

## Synchronisation du statut de lecture

Synchroniser le statut de lecture global d’une série avec celui de chacune de ses œuvres.

---

## Détection des parties manquantes

Signaler lorsqu’un numéro semble manquer dans une série.

Par exemple, avertir lorsque la partie 3 est absente d’une série contenant cinq parties.

---

## Vitesse de progression

Calculer la vitesse à laquelle l’utilisateur avance dans une série.

Cette fonctionnalité pourrait également estimer une date de fin.

---

## Rappel de fin de série

Afficher un rappel lorsqu’il ne reste plus que quelques œuvres à lire dans une série.

---

## Récapitulatif de fin

Ajouter un panneau récapitulatif lorsqu’une série est terminée.

---

## Tableau de bord des séries

Créer un tableau de bord regroupant les statistiques de toutes les séries suivies ou commencées.

---

## Gestion consolidée des favoris

Afficher une vue regroupant tous les favoris appartenant à une même série.

Cette interface pourrait également proposer un bouton permettant d’ajouter toute la série aux favoris en une seule fois.

---

## Seuil de repli personnalisable

Permettre à l’utilisateur de choisir à partir de combien d’œuvres un groupe de série se replie automatiquement dans les listes de résultats.

Le seuil actuel est fixe.

---

## Date de dernière mise à jour

Afficher la date de la dernière mise à jour d’une série.

---

## Désabonnement rapide

Ajouter un bouton permettant de se désabonner directement depuis le badge d’abonnement de la série.

---

## Séries vides

Masquer les liens menant vers des séries ne contenant aucune œuvre visible.

---

## Badge Part X of Y dans les résultats

Afficher directement sur chaque œuvre d’une liste un badge du type :

```text
Part X of Y
```

Ce badge fournirait également un lien vers la page de la série.

---

## Détection automatique du type de série

Analyser automatiquement une série afin de déterminer si elle correspond plutôt à :

* une suite narrative à lire dans l’ordre ;
* une anthologie d’histoires indépendantes.

Le badge correspondant existe déjà dans le code, mais aucune logique actuelle ne calcule cette information.

Il ne s’affiche donc jamais automatiquement.

---

## Raccourcis

Activer réellement le réglage `enableShortcuts` et ajouter les raccourcis prévus pour le module.

Le réglage existe actuellement, mais aucune fonctionnalité n’y est reliée.

---

## Filtres

Activer réellement le réglage `enableFilters` et ajouter les filtres prévus pour les séries.

Le réglage existe actuellement, mais aucune fonctionnalité n’y est reliée.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Aucun enchaînement automatique

Le module n’ouvre pas automatiquement l’œuvre suivante lorsqu’une fic est terminée.

Ce comportement a été jugé trop intrusif.

---

## Aucune recommandation de séries

Le module ne recommande pas de nouvelles séries à lire.

Cette fonction ne correspond pas à son rôle, qui est d’organiser et de suivre les séries déjà rencontrées.

---

## Ordre de l’auteur respecté

Le module ne permet pas de modifier manuellement l’ordre des œuvres dans une série.

L’ordre défini par l’auteur ou l’autrice est toujours conservé.

---

## Aucun téléchargement complet

Le module ne permet pas de télécharger une série entière en une seule fois.

Cette responsabilité appartient à un autre module.

---

## Seuil Epic fixe

L’utilisateur ne peut pas modifier le seuil à partir duquel une série est considérée comme **Epic**.

Ce seuil est fixé à 20 œuvres.

---

## Aucun remplacement de la navigation native

Le module n’ajoute pas de simples boutons précédent et suivant destinés uniquement à reproduire la navigation entre les œuvres d’une série.

AO3 fournit déjà nativement une action de type :

```text
Next Work in Series
```

La bannière du module sert principalement à afficher la progression et les informations de la série, pas à remplacer la navigation native.
