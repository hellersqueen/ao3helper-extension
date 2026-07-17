# readingDashboard

**Tab:** Library

## À quoi ça sert

Ce module ajoute un tableau de bord personnel en haut de la page d'accueil
AO3, avec plusieurs blocs basés sur les fics que tu as visitées : reprendre
ses lectures en cours, les dernières fics ouvertes, les fics pas encore
terminées, tes fandoms et tags les plus lus, et des liens rapides vers tes
listes.

## Réglages utilisateur

Ces réglages sont désormais branchés au code (ils ne l'étaient pas
auparavant — le panneau les proposait sans aucun effet) :

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showRecentWorks` | activé | Afficher le bloc des fics récentes ✅ |
| `showWipTracker` | activé | Afficher le bloc des fics en cours ✅ |
| `showTopFandoms` | activé | Afficher le bloc des fandoms les plus lus ✅ |
| `showTopTags` | activé | Afficher le bloc (nuage) des tags les plus lus ✅ |
| `showQuickLinks` | activé | Afficher les liens rapides ✅ |
| `recentWorksCount` | `10` | Le nombre de fics récentes affichées ✅ |
| `topFandomsCount` | `6` | Le nombre de fandoms affichés ✅ |

## Fichiers

### `readingDashboard.js` — coordinateur : suivi des visites, rendu du tableau de bord

- Note chaque fic visitée (titre, fandom, tags, statut, nombre de visites) dans un historique local, avec un maximum de 200 fics gardées
- Affiche un bloc "Continue Reading" avec les 3 fics en cours de lecture
- Affiche un bloc avec les dernières fics ouvertes, un bloc avec les fics pas encore terminées, un classement des fandoms, un nuage de tags, et des liens rapides — chacun activable/désactivable et dimensionné via les réglages ci-dessus
- Affiche un bloc "Reading insights" (diversité, % de relectures, profil de lecteur) et un bloc "Your ... in fics" (bilan de l'année en cours)
- Les blocs (hors liens rapides) sont réorganisables par glisser-déposer, ordre mémorisé
- Le tableau de bord n'apparaît que sur la page d'accueil ou la page personnelle ; ailleurs, seul l'historique de visite continue d'être mis à jour en arrière-plan

### `dashboardStats.js` — calculs (pur, testable)

- Diversité (fandoms/tags distincts), pourcentage de relectures, profil de lecteur (heuristique descriptive, pas un badge), bilan annuel

### `readingDashboard.css`

- Les styles visuels du tableau de bord et de ses blocs, du nuage de tags et des poignées de glisser-déposer

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Réorganiser les blocs à la main par glisser-déposer~~ ✅ Implémenté (ordre mémorisé, via l'outil partagé `lib/ui/drag-reorder.js`)
- ~~Un bilan annuel façon "rétrospective de l'année", comme font certaines applications de musique~~ ✅ Bloc "Your ... in fics"
- ~~Deviner ton "profil de lecteur" (plutôt marathon, occasionnel, ou complétionniste)~~ ✅ Une ligne descriptive dans "Reading insights" (pas un badge — voir Décisions de conception)
- ~~Des indicateurs sur la diversité de ce que tu lis~~ ✅ Bloc "Reading insights"
- ~~Voir le pourcentage de fics que tu relis par rapport aux nouvelles~~ ✅ Bloc "Reading insights" (basé sur le compteur de visites par fic)
- ~~Un vrai nuage de tags visuel pour tes préférences, pas juste une liste~~ ✅ Remplace la liste des tags

## Explicitement écarté

- Calculer ta vitesse de lecture — jugé peu fiable sans vraie mesure du temps de lecture
- Des graphiques ou des statistiques avancées — pour rester simple (les indicateurs ajoutés restent de simples nombres/phrases, pas de graphiques)
- Se fixer des objectifs de lecture à atteindre — la lecture reste un loisir, pas un objectif chiffré
- Comparer ses statistiques de lecture à celles des autres — pour rester privé
- Des badges ou des séries de jours consécutifs (streaks) sur ce tableau de bord — retiré pour ne pas trop transformer la lecture en jeu
- Exporter des rapports personnalisables — écarté pour garder le tableau de bord simple
- **Suivre la progression de défis de lecture** — contredit directement la décision "Objectifs chiffrés" déjà prise pour ce module (pas d'objectifs numériques à atteindre). Un défi de lecture est une forme d'objectif chiffré ; l'idée reste incompatible avec la philosophie du module telle que déjà tranchée.

## Précision

⚠️ La doc historique anglaise dit que le lien avec le module readingTracker
est déclaré mais jamais vraiment utilisé. Ce n'est plus tout à fait vrai :
le bloc "Continue Reading" lit bel et bien les données de progression de
readingTracker — tous les autres blocs, eux, utilisent toujours leur propre
mémoire indépendante.



AO3 Helper - Reading Dashboard Module
    Module ID: readingDashboard
    Display Name: Reading Dashboard

    Key Features:
        - Work visit tracking and history storage
        - Dashboard panel on homepage
        - Recent works widget (last 10 opened)
        - WIP tracker widget
        - Top fandoms and tags widgets
        - Quick links section
        - "Continue Reading" widget (reads readingTracker's per-work progress,
          catégorie Reading déjà migrée — soft dep, lecture seule)

    Storage:
        ao3h_dashboard_data_v1 -- { works[], fandomCounts{}, tagCounts{} }
        (particularité préexistante : sans le préfixe `ao3h:` habituel, conservée
        telle quelle pour la continuité des données)

    Note : la configuration (0 option, 5 widgets toujours actifs) est définie par
    lib/ui/panel/configs/library/readingDashboard-config.js — ce coordinateur
    ne réenregistre plus de config globale legacy (AO3H_Config / Common.Settings.define).


═══════════════════════════════════════════════════════════════════════════
  # readingDashboard
  **Tab :** Library
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Reading Dashboard** ajoute un tableau de bord personnel en haut de la page d’accueil AO3.

* Il utilise les œuvres visitées pour afficher plusieurs blocs permettant de :
  - reprendre les lectures en cours ;
  - retrouver les dernières œuvres ouvertes ;
  - repérer les œuvres récemment visitées qui ne sont pas terminées ;
  - voir les fandoms les plus consultés ;
  - voir les tags les plus consultés ;
  - accéder rapidement aux principales listes personnelles d’AO3.

* Le tableau de bord n’est affiché que sur :
  - la page d’accueil ;
  - la page personnelle de l’utilisateur.

Sur les autres pages, le module continue uniquement d’enregistrer les œuvres visitées en arrière-plan.

---

# Réglages utilisateur

| Réglage            | Description                                                 |
| ------------------ |-------------------------------------------------------------|
| `showRecentWorks`  | Affiche ou masque le bloc des œuvres récentes.              |
| `showWipTracker`   | Affiche ou masque le bloc des œuvres en cours.               |
| `showTopFandoms`   | Affiche ou masque le bloc des fandoms les plus consultés.    |
| `showTopTags`      | Affiche ou masque le nuage des tags les plus consultés.      |
| `showQuickLinks`   | Affiche ou masque la section de liens rapides.               |
| `recentWorksCount` | Nombre d’œuvres récentes affichées.                          |
| `topFandomsCount`  | Nombre de fandoms affichés.                                  |

La configuration actuelle du module est définie dans :

```text
lib/ui/panel/configs/library/readingDashboard-config.js
```

Le fichier fonctionnel ne réenregistre plus d’ancienne configuration globale à l’aide de :

```text
AO3H_Config
Common.Settings.define
```

Chacun des sept réglages ci-dessus est désormais lu par `readingDashboard.js` (via `makeCfg`) et modifie réellement l’affichage — ce n’était pas le cas auparavant.

---

# Structure du module

Le module est composé de deux fichiers fonctionnels et d’une feuille de style.

```text
readingDashboard.js     (coordinateur : suivi des visites, rendu du tableau de bord)
dashboardStats.js       (diversité, relectures, profil de lecteur, bilan annuel — pur, testable)
readingDashboard.css
```

---

# readingDashboard.js

## Rôle

Gère l’enregistrement des œuvres visitées et l’affichage du tableau de bord personnel.

Il conserve son propre historique local pour la majorité des blocs et lit également les données de progression du module **Reading Tracker** pour le bloc **Continue Reading**.

---

## Fonctionnalités

### Enregistrement des œuvres visitées

Le module enregistre chaque œuvre consultée dans un historique local.

Les informations conservées peuvent comprendre :

* le titre ;
* le fandom ;
* les tags ;
* le statut de l’œuvre ;
* les informations nécessaires pour rouvrir la fic.

Le module conserve un maximum de 200 œuvres.

Lorsque cette limite est dépassée, les entrées les plus anciennes sont retirées.

---

### Mise à jour en arrière-plan

L’historique continue d’être mis à jour sur les pages d’œuvres, même lorsque le tableau de bord n’est pas affiché.

L’affichage complet du tableau de bord est limité à la page d’accueil et à la page personnelle.

---

### Bloc « Continue Reading »

Le module affiche un bloc intitulé :

```text
Continue Reading
```

Ce bloc présente jusqu’à trois œuvres dont la lecture est en cours.

Contrairement aux autres blocs, il lit les données de progression par œuvre enregistrées par **Reading Tracker**.

Cette intégration est une dépendance souple et en lecture seule.

Si les données de **Reading Tracker** ne sont pas disponibles, les autres parties du tableau de bord peuvent continuer de fonctionner avec leur propre historique.

---

### Œuvres récentes

Le module affiche un bloc contenant les dernières œuvres ouvertes, dans la limite fixée par le réglage `recentWorksCount` (10 par défaut). Masquable via `showRecentWorks`.

---

### Suivi des œuvres en cours

Le tableau de bord affiche les œuvres non terminées parmi les œuvres récemment visitées. Masquable via `showWipTracker`.

Ce bloc sert à retrouver rapidement les lectures qui semblent encore en cours.

---

### Classement des fandoms

Le module compte les fandoms associés aux œuvres visitées.

Il affiche ensuite un classement des fandoms les plus consultés, dans la limite fixée par `topFandomsCount` (6 par défaut). Masquable via `showTopFandoms`.

---

### Nuage de tags

Le module compte également les tags associés aux œuvres visitées.

Il affiche un véritable nuage de tags visuel : chaque tag est affiché avec une taille de police proportionnelle à sa fréquence dans l’historique local, plutôt qu’une simple liste. Masquable via `showTopTags`.

---

### Reading insights

Un bloc rassemble trois indicateurs calculés par `dashboardStats.js` à partir de l’historique local :

* la diversité (nombre de fandoms et de tags distincts) ;
* le pourcentage d’œuvres relues (basé sur un compteur de visites par œuvre) ;
* un profil de lecteur descriptif — « Completionist », « Marathon reader » ou « Casual reader » — accompagné d’une phrase d’explication.

Ce bloc reste toujours affiché ; il n’a pas de réglage dédié pour le masquer (il fait partie du cœur du tableau de bord, comme "Continue Reading").

---

### Bilan annuel (« Your ... in fics »)

Un bloc calcule, à partir de l’historique local, un résumé de l’année civile en cours : nombre d’œuvres visitées, terminées/en cours, fandoms et tags distincts explorés, fandom le plus consulté.

Ce bilan est limité aux données encore présentes dans l’historique (200 œuvres maximum) : des visites plus anciennes de la même année peuvent avoir été évincées par la limite.

---

### Réorganisation des blocs

Chaque bloc du tableau de bord (à l’exception des liens rapides) peut être réordonné par glisser-déposer, via l’outil partagé `lib/ui/drag-reorder.js`.

L’ordre choisi est mémorisé dans le stockage du module et réappliqué aux prochains chargements.

---

### Liens rapides

Le tableau de bord affiche des liens directs vers :

* **Bookmarks** ;
* l’historique ;
* **Marked for Later** ;
* les abonnements.

Masquable via `showQuickLinks`. Cette section reste en dehors de la grille réorganisable : c’est une rangée de liens, pas une carte de contenu comme les autres blocs.

---

## Détails techniques

### Stockage principal

Les données sont enregistrées sous la clé :

```text
ao3h_dashboard_data_v1
```

Cette clé constitue une particularité historique, puisqu’elle ne contient pas le préfixe habituel :

```text
ao3h:
```

Elle est conservée telle quelle afin de préserver la continuité des données existantes.

---

### Structure des données

Le stockage contient une structure comparable à :

```text
{
  works: [],
  fandomCounts: {},
  tagCounts: {},
  blockOrder: []
}
```

La propriété :

```text
works
```

contient l’historique des œuvres visitées. Chaque entrée porte aussi un
compteur `visitCount` (incrémenté à chaque revisite), utilisé pour calculer
le pourcentage de relectures dans le bloc "Reading insights".

La propriété :

```text
blockOrder
```

contient l’ordre des blocs choisi par glisser-déposer (liste d’identifiants
de blocs), réappliqué à chaque rendu.

La propriété :

```text
fandomCounts
```

contient le nombre de visites ou d’occurrences associé à chaque fandom.

La propriété :

```text
tagCounts
```

contient le nombre d’occurrences associé à chaque tag.

---

### Limite de l’historique

La liste `works` conserve un maximum de 200 œuvres.

---

### Portée de l’affichage

Le tableau de bord est injecté uniquement sur :

* la page d’accueil AO3 ;
* la page personnelle de l’utilisateur.

Sur les autres pages, seule la collecte des données de visite reste active.

---

### Intégration avec Reading Tracker

Le bloc **Continue Reading** lit les données de progression par œuvre provenant de **Reading Tracker**.

Cette dépendance est :

* facultative ;
* en lecture seule ;
* découplée du reste du tableau de bord.

Les autres groupes de contenu utilisent toujours les données enregistrées directement par **Reading Dashboard** :

* œuvres récentes ;
* œuvres non terminées ;
* fandoms principaux ;
* nuage de tags ;
* insights (diversité, relectures, profil de lecteur) ;
* bilan annuel.

---

## Dépendances

Le module utilise principalement :

* `localStorage` ;
* le DOM des pages AO3 ;
* les informations présentes sur les pages d’œuvres ;
* les données de progression de **Reading Tracker**, lorsqu’elles sont disponibles.

---

# readingDashboard.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Reading Dashboard**.

Il définit notamment l’apparence :

* du conteneur principal du tableau de bord ;
* du bloc **Continue Reading** ;
* de la liste des œuvres récentes ;
* du suivi des œuvres en cours ;
* des classements de fandoms ;
* du nuage de tags et des blocs "insights" ;
* des poignées de glisser-déposer des blocs ;
* des liens rapides ;
* des différents titres, cartes et éléments de navigation.

---

# Fonctionnalités non implémentées

## ~~Réorganisation des blocs~~ ✅ Implémentée

Chaque bloc (hors liens rapides) est réorganisable par glisser-déposer via l’outil partagé `lib/ui/drag-reorder.js` ; l’ordre est mémorisé dans le stockage du module.

---

## ~~Défis de lecture~~ ✅ Écartée (voir Décisions de conception)

Contredit la décision déjà prise "Objectifs chiffrés" — un défi de lecture est une forme d’objectif numérique, incompatible avec la philosophie du module.

---

## ~~Rétrospective annuelle~~ ✅ Implémentée

Bloc "Your ... in fics", calculé par `computeYearRecap()` (`dashboardStats.js`) à partir de l’historique local de l’année civile en cours.

---

## ~~Profil de lecteur~~ ✅ Implémenté

Une ligne descriptive dans le bloc "Reading insights" (Completionist / Marathon reader / Casual reader), calculée par `computeReaderProfile()`. Volontairement présentée comme une simple phrase, pas un badge — voir "Badges et séries de lecture" ci-dessous.

---

## ~~Indicateurs de diversité~~ ✅ Implémentés

Nombre de fandoms et de tags distincts, affiché dans "Reading insights" (`computeDiversity()`).

---

## ~~Proportion de relectures~~ ✅ Implémentée

Pourcentage d’œuvres avec plus d’une visite, affiché dans "Reading insights" (`computeRereadPercent()`), basé sur un nouveau compteur `visitCount` par œuvre.

---

## ~~Nuage de tags visuel~~ ✅ Implémenté

Remplace la liste plate des tags : taille de police proportionnelle à la fréquence.

---

# Décisions de conception

## Vitesse de lecture

Le module ne calcule pas la vitesse de lecture.

Cette mesure a été jugée peu fiable sans véritable suivi du temps passé à lire.

---

## Statistiques avancées

Le tableau de bord ne contient pas de graphiques ni d’analyses statistiques avancées.

Cette décision vise à conserver une interface simple. Les indicateurs de diversité, de relectures et le bilan annuel ajoutés restent volontairement de simples phrases/nombres (bloc "Reading insights", bloc "Your ... in fics") — aucun graphique, aucune visualisation, pour rester dans l'esprit de cette décision.

---

## Objectifs chiffrés

Le module ne permet pas de définir des objectifs de lecture à atteindre.

La lecture est considérée comme un loisir plutôt que comme une activité devant être mesurée par des objectifs numériques.

---

## Comparaison avec les autres utilisateurs

Le module ne compare pas les statistiques de lecture avec celles d’autres personnes.

Les données restent privées.

---

## Badges et séries de lecture

Le tableau de bord ne contient pas de badges ni de séries de jours consécutifs.

Ces éléments ont été retirés afin d’éviter de transformer excessivement la lecture en système de jeu. Le "profil de lecteur" ajouté au bloc "Reading insights" est une phrase descriptive calculée à partir des mêmes données déjà affichées ailleurs (taux de complétion, rythme de visites) — ce n'est ni un badge visuel, ni un système de déblocage, ni un suivi de série de jours consécutifs.

---

## Objectifs de lecture (défis)

Le module ne permet pas de suivre des défis de lecture personnels, pour la même raison que les objectifs chiffrés ci-dessus : un défi de lecture est une forme d'objectif numérique à atteindre, ce que ce tableau de bord évite volontairement.

---

## Rapports personnalisables

Le module ne permet pas d’exporter des rapports personnalisables.

Cette fonctionnalité a été écartée afin de garder le tableau de bord simple.

---

# Précision historique

Une ancienne documentation indiquait que la dépendance envers **Reading Tracker** était déclarée mais jamais réellement utilisée.

Cette affirmation n’est plus entièrement correcte.

Le bloc **Continue Reading** lit effectivement les données de progression par œuvre provenant de **Reading Tracker**.

Les autres blocs utilisent toutefois toujours la mémoire indépendante de **Reading Dashboard** :

* les œuvres récentes ;
* les œuvres non terminées ;
* les fandoms les plus consultés ;
* le nuage de tags ;
* les insights (diversité, relectures, profil de lecteur) ;
* le bilan annuel.
    