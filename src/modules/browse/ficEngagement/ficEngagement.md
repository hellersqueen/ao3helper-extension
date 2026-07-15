# ficEngagement

**Tab:** Browse

## À quoi ça sert

Ce module ajoute des indicateurs sur les listes de fics (et sur la page
d'une fic) pour repérer rapidement les œuvres qui valent le coup, au-delà
du simple nombre de kudos ou de vues.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `colorCodeMetrics` | désactivé | Colore les badges selon leur niveau d'engagement |

## Fichiers

### 1. `_ficEngagement.js` — le chef d'orchestre

- Met en route les deux autres fichiers de fonctionnalités de ce module

### 2. `engagementMetrics.js` — badges de métriques

- Calcule et affiche trois badges sous les statistiques de chaque fic : le taux de kudos par rapport aux vues, le nombre de kudos par rapport au nombre de mots, et le taux de mise en favori par rapport aux kudos
- Chaque badge montre les chiffres bruts si on passe la souris dessus
- Peut colorer les badges (vert/jaune/rouge) selon le niveau d'engagement

### 3. `hiddenGems.js` — pépites cachées

- Repère les fics peu populaires mais avec un très bon taux d'engagement, et leur ajoute un badge 💎 "Hidden Gem"
- Utilise des seuils fixes (taux de kudos élevé, mais peu de kudos et de favoris au total) pour ne pas rater les petites fics de qualité

### 4. `ficEngagement.css`

- Les styles visuels des badges

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Une note personnelle qu'on pourrait donner à une fic
- Voir si une fic devient de plus en plus populaire au fil du temps, avec des graphiques et un historique
- Compter combien de fois une fic est mise en favori ou commentée, par rapport à ses kudos
- Voir si le ratio d'une fic monte ou descend avec le temps
- Comparer une fic à la moyenne de son fandom
- Deviner à l'avance si une fic va devenir populaire
- Un filtre pour ne montrer que les fics avec un très bon ratio
- Des catégories de "pépites cachées" (nouveaux auteurs, vieux classiques, couples rares)
- Des niveaux de pépites, comme des médailles (diamant/or/argent)
- Une version plus poussée du détecteur de pépites cachées
- Mettre automatiquement les pépites cachées en haut de la liste "à lire plus tard"
- Suivre si les commentaires qu'on écrit soi-même ont un effet
- Trier les résultats par engagement — *ça existe déjà, mais dans un autre module (`searchEnhancer`), pas ici*
- Calculer les kudos par chapitre au lieu du total
- Montrer le classement d'une fic parmi tout le fandom (en %)
- Afficher le ratio "collé" en haut de la page pendant qu'on lit
- Pouvoir cacher certains badges un par un, ou choisir combien de chiffres après la virgule
- Repérer quels fandoms entiers sont en train de devenir tendance, pas seulement fic par fic
- Un petit guide qui explique comment interpréter chaque ratio (bon, moyen, faible)
- Pouvoir changer soi-même les seuils utilisés pour repérer une pépite cachée, au lieu de seuils fixes
- Repérer les pépites cachées en les comparant à la moyenne de leur propre fandom, plutôt qu'avec les mêmes seuils fixes pour tout le monde
- Un score qui essaie de deviner si une fic en cours risque d'être abandonnée et jamais terminée, en regardant les habitudes de publication passées de l'auteur

## Explicitement écarté

- Une note de qualité unique et globale pour chaque fic (calculée à partir des kudos, des vues, des favoris et des commentaires, avec des grades du type S/A/B/C/D) — jugée trop subjective et présomptueuse
