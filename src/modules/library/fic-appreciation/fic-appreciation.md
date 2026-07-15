# ficAppreciation

**Tab:** Library

## À quoi ça sert

Ce module regroupe tout ce qui permet de suivre son appréciation
personnelle d'une fic : la marquer comme terminée, lui donner des kudos
plus facilement, la noter par étoiles, et lui donner un statut de lecture
parmi plusieurs choix (à lire, en cours, terminée, abandonnée...). Il
remplace trois anciens modules qui faisaient chacun une seule de ces
choses.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showManualCheckButton` | désactivé | Bouton pour vérifier soi-même si on a déjà donné des kudos, sur la page de la fic |
| `statusNotes` | activé | Permet d'écrire une petite note personnelle avec le statut de lecture |
| `hideStatusFilter` | (aucun) | Les statuts de lecture à cacher sur les listes de fics |
| `completionNotes` | désactivé | Permet d'écrire une note en marquant une fic comme terminée |
| `filterCompletedWorks` | activé | Cache les fics déjà terminées sur les listes |
| `quickKudosButton` | désactivé | Ajoute un bouton pour donner des kudos directement depuis la liste, sans ouvrir la fic |
| `commentAssistOnRevisit` | désactivé | Propose de laisser un commentaire quand on revient sur une fic déjà kudosée |
| `hideKudosedFilter` | désactivé | Cache les fics déjà kudosées sur les listes |
| `showRatingOnBlurbs` | activé | Affiche la note en étoiles directement sur les listes |
| `ratingNotes` | désactivé | Permet d'écrire une note avec chaque notation en étoiles |
| `kudosIcon` | 🧡 | L'icône utilisée pour le bouton et le badge de kudos |
| `tooltipDateFormat` | `long` | Comment la date du kudos est affichée (complète, courte, ou "il y a...") |

Le panneau affiche aussi une section "Sync & Refresh" (synchroniser, trier,
actualiser) *(pas encore actif — rien n'est branché derrière)*.

## Fichiers

### 1. `_ficAppreciation.js` — le chef d'orchestre

- Met en route tous les autres fichiers de ce module
- S'adapte selon qu'on est sur la page d'une fic ou sur une liste de fics
- Donne accès à des actions simples pour le reste de l'extension (par exemple, marquer une fic comme lue)

### 2. `markAsFinished.js` — marquer une fic comme terminée

- Ajoute un bouton "✓ Mark as Finished" sur la page d'une fic
- Ajoute un badge et un bouton rapide sur les listes de fics
- Permet d'écrire une petite note en marquant une fic comme terminée

### 3. `kudosTracker.js` — repérer et donner des kudos

- Détecte si on a déjà donné des kudos à une fic
- Grise le bouton de kudos si c'est déjà fait
- Ajoute un badge sur les listes pour les fics déjà kudosées
- Propose un bouton pour donner des kudos rapidement, sans ouvrir la fic

### 4. `kudosDisplay.js` — afficher les infos de kudos

- Affiche la date à laquelle on a donné des kudos
- Affiche une petite bulle d'info au survol du badge, avec la date dans différents formats
- Affiche un message pendant que le module vérifie si des kudos ont déjà été donnés

### 5. `kudosTracking.js` — garder les kudos à jour entre onglets

- Met à jour le badge de kudos si on a donné un kudos depuis un autre onglet
- Ajoute un bouton pour vérifier soi-même si des kudos ont été donnés

### 6. `kudosManager.js` — chef d'orchestre des kudos

- Fait fonctionner ensemble les trois fichiers précédents liés aux kudos (détection, affichage, synchronisation entre onglets)

### 7. `kudosExtendedFeatures.js` — statistiques de kudos

- Montre le nombre total de kudos donnés, réparti par mois
- Montre la plus longue série de jours consécutifs avec au moins un kudos donné
- Permet d'exporter ses statistiques de kudos en JSON ou en CSV

### 8. `starRatings.js` — noter les fics par étoiles

- Ajoute une notation personnelle de 1 à 5 étoiles sur la page d'une fic
- Affiche aussi la note sur les listes de fics
- Permet d'écrire une note avec chaque notation

### 9. `multiStatusTracker.js` — statut de lecture

- Permet de choisir un statut parmi 7 : à lire, en cours, terminé, abandonné, pas aimé, en pause, relu
- Affiche le statut avec un badge et un menu déroulant, sur la page de la fic et sur les listes
- Permet d'écrire une note quand on marque une fic "abandonnée" ou "pas aimée"
- Permet de cacher certains statuts sur les listes
- Montre des statistiques (par exemple le pourcentage de fics terminées) et permet de les exporter

### 10. `ficAppreciation.css`

- Les styles visuels de tous les boutons, badges et panneaux ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Recevoir un rappel pour les fics qu'on a lues mais qu'on n'a jamais kudosées
- Scanner tout un fandom pour repérer ses fics favorites qui n'ont pas encore reçu de kudos
- Voir ses statistiques de kudos réparties par fandom ou par auteur — en ce moment ce n'est que par mois
- Transférer ses kudos d'un ancien compte AO3 vers un autre
- Trouver les fics qu'on a kudosées mais jamais mises en favoris
- Des catégories pour les notes en étoiles (intrigue / personnages / écriture), pas juste une note libre
- Voir comment une note en étoiles a changé si on la remet à jour plus tard
- Redonner des kudos en masse à partir d'un ancien compte
- Découvrir d'autres lecteurs qui kudosent les mêmes fics que toi
- Voir l'évolution de tes notes en étoiles au fil du temps, pas juste leur répartition actuelle
- Comparer tes notes personnelles aux statistiques d'engagement de la communauté
- Ajouter des tags d'humeur ou d'émotion à une fic (drôle, triste, réconfortant...)
- Un pourcentage de progression au lieu du simple statut "terminé"
- Quand on essaie de redonner un kudos à une fic déjà kudosée, transformer
  automatiquement cette tentative en petit commentaire (par exemple
  "toujours autant fan !")
- Limiter le nombre de kudos qu'on peut donner par minute, pour éviter les
  abus
- Un historique chronologique de tous les kudos donnés, qu'on pourrait
  filtrer ou dans lequel on pourrait chercher
- Un score personnel unique qui combine plusieurs notes par catégories,
  affiché directement sur les listes de fics
- Une fenêtre de confirmation avant d'envoyer un kudos, pour éviter les
  clics accidentels
- Proposer de noter la fic en étoiles au moment où on la marque comme terminée
- Compter combien de fois on a relu une fic, pas juste marquer qu'on l'a relue
- De petites félicitations quand on atteint un cap de fics terminées (par exemple la 50e)
- Des demi-étoiles pour noter plus précisément
- Des statistiques sur les notes en étoiles (note moyenne, répartition, nombre total de fics notées)
- Garder la date exacte à laquelle tu as fini de lire une fic, pas juste le statut "terminé"
- Analyser tes habitudes de kudos avec le tableau de bord d'activité (par exemple, à quels moments tu donnes le plus de kudos)

## Explicitement écarté

- Partager ses statistiques de complétion avec d'autres — la lecture reste privée
- Un vrai système de critiques longues — les commentaires AO3 suffisent déjà
- Un moteur de recommandations basé sur tes appréciations — jugé trop subjectif
- Partager ses listes de recommandations avec d'autres — pour rester privé
- Deviner si une fic risque d'être abandonnée pour lui coller un badge
  "à risque" — écarté pour des raisons éthiques, ça porterait un jugement
  sur le travail de l'auteur
- Modifier directement le vrai système de notes ou de kudos d'AO3 — écarté, ça ne respecte pas la règle de l'extension qui ajoute des infos par-dessus le site sans jamais toucher au site original

## Précision

⚠️ La doc historique anglaise disait que le statut de lecture à plusieurs
valeurs avait été rejeté ("trop compliqué") et que le bouton de kudos
rapide n'existait pas. En réalité, les 7 statuts de lecture
(`multiStatusTracker.js`) et le bouton de kudos rapide sont bel et bien
codés aujourd'hui. Elle disait aussi que le rappel de commentaire à la
revisite d'une fic était à peine commencé — en réalité c'est une bannière
complète, avec la date du kudos et un lien direct vers les commentaires.
