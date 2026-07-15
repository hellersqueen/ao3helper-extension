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
