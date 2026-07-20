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
| `wordsPerPage` | `275` | Combien de mots comptent pour une page |
| `pageFormat` | `compact` | Format d'affichage des pages : "~123 pg" ou "~123 pages" |
| `readSpeed` | `average` | La vitesse de lecture : lent (150 mots/min), moyen (250), rapide (400), ou personnalisé |
| `customWPM` | `250` | Le nombre de mots par minute utilisé si la vitesse est réglée sur "personnalisé" |
| `showEstimate` | activé | Interrupteur principal pour l'estimation du temps de lecture |
| `estimateFicPage` | activé | Affiche le temps de lecture sur la page de la fic |
| `estimatePerChapter` | activé | Affiche le temps de lecture par chapitre |
| `estimateListings` | désactivé | Affiche le temps de lecture sur les listes |
| `showRemainingTime` | activé | Affiche "⏳ ~Xh left" sur les pages de chapitre (temps restant estimé) |
| `showOneSitting` | désactivé | Marque "🛋 One sitting" les fics lisibles d'une traite |
| `oneSittingMinutes` | `60` | Le seuil (minutes) pour le badge "une seule traite" |
| `finishByTime` | (vide) | Heure cible "HH:MM" — badge ✅/🤏/⏰ "finissable avant cette heure" |
| `showLengthCategory` | activé | Affiche la catégorie de longueur (Flash/Short story/Novella/Novel/Epic) |
| `thresholdFlash` | `1000` | Seuil "Flash Fiction" |
| `thresholdShort` | `17500` | Le nombre de mots en dessous duquel une fic est une "Short story" |
| `thresholdNovella` | `60000` | Le nombre de mots en dessous duquel une fic est une "Novella" |
| `thresholdEpic` | `150000` | Au-delà, c'est un "Epic Novel" |
| `showAvgChapterLength` | désactivé | Affiche "📊 ~X w/ch" (longueur moyenne d'un chapitre) sur la page de la fic |
| `showSeriesTotal` | activé | Affiche le total de mots d'une série en haut de sa page |
| `lengthGradient` | désactivé | Teinte les compteurs de mots des listes selon la longueur relative |
| `customBooks` | (vide) | Tes propres livres de comparaison, un par ligne : "Titre: 50000" |

## Fichiers

### 1. `_workLength.js` — le chef d'orchestre

- Charge les réglages une seule fois au démarrage et met en route les deux autres fichiers

### 2. `lengthDisplay.js` — badges de longueur

- Affiche un badge de catégorie (🔥 Flash / ⚡ Short story / 📄 Novella / 📖 Novel / 📚 Epic) selon le nombre de mots, avec des seuils réglables
- Compare le nombre de mots à un livre connu parmi 18 références (Harry Potter, 1984, Le Seigneur des Anneaux...), plus tes propres livres ajoutés dans le panneau
- Peut aussi afficher une estimation du nombre de pages (mots/page et format réglables)
- Peut afficher la longueur moyenne d'un chapitre sur la page d'une fic multi-chapitres
- Sur une page de série, affiche le total de mots de toute la série
- Peut teinter les compteurs de mots des listes (plus la fic est longue par rapport aux autres de la page, plus la teinte est marquée)
- Reprend aussi les fonctionnalités de l'ancien module `pageCount`, désormais fusionné dans ce fichier

### 3. `readingTime.js` — temps de lecture estimé

- Calcule un temps de lecture selon une vitesse choisie (lent, moyen, rapide, ou personnalisé)
- Peut l'afficher sur la page de la fic, par chapitre, et/ou sur les listes
- Peut marquer "🛋 One sitting" les fics lisibles d'une traite (seuil réglable)
- Sur une page de chapitre, estime le temps restant avant la fin de la fic ("⏳ ~2h left")
- Peut dire si la fic est finissable avant une heure cible ("⏰ by 23:00" : ✅ / 🤏 / ⏰)

### 4. `lengthMath.js` — calculs extraits

- Les calculs purs derrière les badges : progression de chapitres, moyenne par chapitre, mots restants, verdict "finissable avant l'heure", teinte du dégradé, parsing des livres personnalisés, format des pages

### 5. `workLength.css`

- Les styles visuels des badges et indicateurs de temps

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Filtrer les fics selon "je peux la finir en une seule fois"~~ ✅
  Fait (sous forme de repère plutôt que de filtre) : badge "🛋 One sitting"
  sur les fics dont le temps de lecture tient dans un seuil réglable
  (`showOneSitting` + `oneSittingMinutes`, 60 min par défaut). Le masquage
  des autres fics relève des filtres (`filterManager`), pas de ce module.
- ~~Indiquer la longueur moyenne d'un chapitre~~ ✅
  Fait : badge "📊 ~X w/ch" sur la page d'une fic multi-chapitres
  (`showAvgChapterLength`).
- ~~Additionner le nombre de mots total d'une série entière~~ ✅
  Fait : bandeau "Σ X words across N works" en haut des pages de série
  (`showSeriesTotal`), avec équivalent en pages si activé.
- ~~Choisir soi-même combien de mots il y a par page — en ce moment c'est toujours fixé à 275~~ ✅
  Fait : réglage `wordsPerPage` (275 par défaut).
- ~~Différents formats d'affichage pour les pages — en ce moment il n'y a qu'un seul format~~ ✅
  Fait : réglage `pageFormat` — compact ("~123 pg") ou complet ("~123 pages").
- ~~Un indicateur du temps qu'il reste avant de finir une fic en cours~~ ✅
  Fait : badge "⏳ ~Xh left" sur les pages de chapitre, estimé d'après les
  chapitres restants (`showRemainingTime`).
- ~~Comparer à des livres choisis par soi-même, pas juste les 18 déjà prévus~~ ✅
  Fait : champ `customBooks` dans le panneau (un livre par ligne,
  "Titre: 50000"), fusionné avec la liste intégrée pour la comparaison.
- ~~Un calcul pour savoir si on a le temps de finir une fic avant une heure précise (par exemple avant de se coucher), avec un badge du genre "tu peux finir !", "peut-être" ou "trop long"~~ ✅
  Fait : réglage `finishByTime` ("HH:MM") — badge ✅ "you can finish it" /
  🤏 "it will be tight" (jusqu'à 20 % de dépassement) / ⏰ "too long", basé
  sur le temps restant si on est en cours de fic. Une heure déjà passée
  dans la journée vise le lendemain.
- ~~Plus de catégories de longueur (par exemple "Flash Fiction" pour les
  toutes petites ou "Epic Novel" pour les très longues), au lieu des 3
  catégories actuelles~~ ✅ Fait : 5 catégories désormais (Flash Fiction ≤
  1 000 mots, Short story, Novella, Novel, Epic Novel > 150 000 mots), tous
  les seuils réglables dans le panneau. « Novelette » n'a pas été ajoutée
  comme catégorie séparée (5 paliers jugés déjà suffisamment fins) — à
  revoir si le besoin se confirme.
- ~~Un dégradé de couleur sur les listes pour repérer d'un coup d'œil les fics plus longues ou plus courtes que les autres~~ ✅
  Fait : réglage `lengthGradient` — le compteur de mots de chaque fic est
  teinté proportionnellement à sa longueur relative par rapport aux autres
  fics de la page (teinte neutre unique, intensité croissante, sans
  connotation bien/mal).

## Explicitement écarté

- Recevoir une recommandation sur la longueur "idéale" d'une fic — pour rester neutre
- Donner à chaque fic une note de qualité globale (genre A/B/C/D) calculée automatiquement à partir des kudos, des favoris et des commentaires — écarté, jugé trop subjectif
- Comparer deux ou trois fics côte à côte (mots, chapitres, kudos, vues, tags communs et différents) — écarté par manque d'intérêt de la part des utilisateurs
- Calculer automatiquement ta propre vitesse de lecture selon ton historique — écarté : mesurer une vraie vitesse exigerait de suivre le temps de lecture actif (le temps de page ouverte surestime énormément) ; résultat peu fiable, le réglage `customWPM` couvre le besoin
- Adapter l'estimation de pages selon l'appareil (téléphone, tablette, ordinateur) — écarté : c'est exactement ce que permet le réglage `wordsPerPage`, sans détection d'appareil fragile
- Adapter l'estimation selon le genre ou le style d'écriture — écarté : aucun signal fiable du "style" dans les métadonnées AO3, résultat arbitraire
- Un aperçu façon "impression papier" — écarté : hors du périmètre d'un module de statistiques ; le téléchargement PDF (`ficDownloader`) donne déjà une version imprimable
- Un mode "marathon de lecture" (temps total passé à lire plusieurs fics d'affilée) — écarté : le suivi de sessions de lecture est le rôle de `readingTracker`, pas d'un module d'affichage de longueur
- Un chronomètre de session de lecture — écarté : même raison (rôle de `readingTracker`)
- Des suggestions de pauses pendant la lecture — écarté : intrusif et subjectif, hors périmètre
- Suivre l'évolution de ta vitesse de lecture au fil du temps — écarté : dépend de la mesure automatique de vitesse, elle-même écartée comme peu fiable
- Se connecter à un site externe pour les infos de longueur — écarté : dépendance réseau externe (vie privée + fragilité) pour un gain marginal, la liste locale + les livres personnalisés suffisent
- Filtrer directement les résultats selon une fourchette de nombre de mots (mini et maxi) — écarté ici : c'est le rôle du module de filtres (`filterManager`), où l'idée est déjà répertoriée

## Précision

⚠️ Les seuils des catégories de longueur (`thresholdShort`,
`thresholdNovella`) sont bel et bien réglables dans le code. Une doc
historique les présentait à tort comme "rejetés".
