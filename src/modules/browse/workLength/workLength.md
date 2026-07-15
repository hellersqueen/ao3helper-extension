# workLength

**Tab:** Browse

## À quoi ça sert

Ce module ajoute des repères de longueur sur les fics (page de la fic et
listes) pour évaluer rapidement l'ampleur d'une fic sans avoir à
interpréter le nombre de mots brut.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showPageEquiv` | désactivé | Affiche "~X pages" à côté du nombre de mots |
| `readSpeed` | `average` | La vitesse de lecture : lent (150 mots/min), moyen (250), rapide (400), ou personnalisé |
| `customWPM` | `250` | Le nombre de mots par minute utilisé si la vitesse est réglée sur "personnalisé" |
| `showEstimate` | activé | Interrupteur principal pour l'estimation du temps de lecture |
| `estimateFicPage` | activé | Affiche le temps de lecture sur la page de la fic |
| `estimatePerChapter` | activé | Affiche le temps de lecture par chapitre |
| `estimateListings` | désactivé | Affiche le temps de lecture sur les listes |
| `showLengthCategory` | activé | Affiche la catégorie de longueur (Short story/Novella/Novel) |
| `thresholdShort` | `17500` | Le nombre de mots en dessous duquel une fic est une "Short story" |
| `thresholdNovella` | `60000` | Le nombre de mots en dessous duquel une fic est une "Novella" (au-delà, c'est un "Novel") |

## Fichiers

### 1. `_workLength.js` — le chef d'orchestre

- Charge les réglages une seule fois au démarrage et met en route les deux autres fichiers

### 2. `lengthDisplay.js` — badges de longueur

- Affiche un badge de catégorie (⚡ Short story / 📄 Novella / 📖 Novel) selon le nombre de mots, avec des seuils réglables
- Compare le nombre de mots à un livre connu parmi une liste de 18 références (Harry Potter, 1984, Le Seigneur des Anneaux...)
- Peut aussi afficher une estimation du nombre de pages

### 3. `readingTime.js` — temps de lecture estimé

- Calcule un temps de lecture selon une vitesse choisie (lent, moyen, rapide, ou personnalisé)
- Peut l'afficher sur la page de la fic, par chapitre, et/ou sur les listes

### 4. `workLength.css`

- Les styles visuels des badges et indicateurs de temps

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Filtrer les fics selon "je peux la finir en une seule fois"
- Indiquer la longueur moyenne d'un chapitre
- Additionner le nombre de mots total d'une série entière
- Calculer automatiquement ta propre vitesse de lecture selon ton historique
- Adapter l'estimation de pages selon l'appareil (téléphone, tablette, ordinateur)
- Adapter l'estimation selon le genre ou le style d'écriture
- Choisir soi-même combien de mots il y a par page — en ce moment c'est toujours fixé à 275
- Un aperçu façon "impression papier"
- Différents formats d'affichage pour les pages — en ce moment il n'y a qu'un seul format
- Un mode "marathon de lecture" qui garde le temps total passé à lire plusieurs fics d'affilée
- Un indicateur du temps qu'il reste avant de finir une fic en cours
- Un chronomètre de session de lecture
- Des suggestions de pauses pendant la lecture
- Suivre l'évolution de ta vitesse de lecture au fil du temps
- Comparer à des livres choisis par soi-même, pas juste les 18 déjà prévus
- Se connecter à un site externe pour les infos de longueur, plutôt que la petite liste déjà intégrée
- Un calcul pour savoir si on a le temps de finir une fic avant une heure précise (par exemple avant de se coucher), avec un badge du genre "tu peux finir !", "peut-être" ou "trop long"
- Plus de catégories de longueur (par exemple "Flash Fiction" pour les toutes petites ou "Epic Novel" pour les très longues), au lieu des 3 catégories actuelles
- Un dégradé de couleur sur les listes pour repérer d'un coup d'œil les fics plus longues ou plus courtes que les autres
- Filtrer directement les résultats selon une fourchette de nombre de mots (mini et maxi) — l'idée existe déjà, mais côté filtres (`filterManager`), pas dans ce module-ci

## Explicitement écarté

- Recevoir une recommandation sur la longueur "idéale" d'une fic — pour rester neutre
- Donner à chaque fic une note de qualité globale (genre A/B/C/D) calculée automatiquement à partir des kudos, des favoris et des commentaires — écarté, jugé trop subjectif
- Comparer deux ou trois fics côte à côte (mots, chapitres, kudos, vues, tags communs et différents) — écarté par manque d'intérêt de la part des utilisateurs

## Précision

⚠️ Les seuils des catégories de longueur (`thresholdShort`,
`thresholdNovella`) sont bel et bien réglables dans le code. Une doc
historique les présentait à tort comme "rejetés".
