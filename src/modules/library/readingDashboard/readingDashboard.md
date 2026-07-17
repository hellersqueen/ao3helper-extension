# readingDashboard

**Tab:** Library

## À quoi ça sert

Ce module ajoute un tableau de bord personnel en haut de la page d'accueil
AO3, avec plusieurs blocs basés sur les fics que tu as visitées : reprendre
ses lectures en cours, les dernières fics ouvertes, les fics pas encore
terminées, tes fandoms et tags les plus lus, et des liens rapides vers tes
listes.

## Réglages utilisateur

Aucun réglage n'est actuellement branché au code — le panneau propose ces
options, mais elles n'ont aucun effet pour l'instant :

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showRecentWorks` | activé *(pas encore actif)* | Afficher le bloc des fics récentes |
| `showWipTracker` | activé *(pas encore actif)* | Afficher le bloc des fics en cours |
| `showTopFandoms` | activé *(pas encore actif)* | Afficher le bloc des fandoms les plus lus |
| `showTopTags` | activé *(pas encore actif)* | Afficher le bloc des tags les plus lus |
| `showQuickLinks` | activé *(pas encore actif)* | Afficher les liens rapides |
| `recentWorksCount` | `10` *(pas encore actif)* | Le nombre de fics récentes affichées |
| `topFandomsCount` | `6` *(pas encore actif)* | Le nombre de fandoms affichés |

## Fichiers

### `readingDashboard.js` — tout le module en un seul fichier

- Note chaque fic visitée (titre, fandom, tags, statut) dans un historique local, avec un maximum de 200 fics gardées
- Affiche un bloc "Continue Reading" avec les 3 fics en cours de lecture
- Affiche un bloc avec les 10 dernières fics ouvertes
- Affiche un bloc avec les fics pas encore terminées parmi celles visitées récemment
- Affiche un classement des fandoms et des tags les plus visités
- Affiche des liens rapides vers Bookmarks, Historique, "Marked for Later" et Abonnements
- Le tableau de bord n'apparaît que sur la page d'accueil ou la page personnelle ; ailleurs, seul l'historique de visite continue d'être mis à jour en arrière-plan

### `readingDashboard.css`

- Les styles visuels du tableau de bord et de ses blocs

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Réorganiser les blocs à la main par glisser-déposer
- Suivre la progression de défis de lecture
- Un bilan annuel façon "rétrospective de l'année", comme font certaines applications de musique
- Deviner ton "profil de lecteur" (plutôt marathon, occasionnel, ou complétionniste)
- Des indicateurs sur la diversité de ce que tu lis
- Voir le pourcentage de fics que tu relis par rapport aux nouvelles
- Un vrai nuage de tags visuel pour tes préférences, pas juste une liste

## Explicitement écarté

- Calculer ta vitesse de lecture — jugé peu fiable sans vraie mesure du temps de lecture
- Des graphiques ou des statistiques avancées — pour rester simple
- Se fixer des objectifs de lecture à atteindre — la lecture reste un loisir, pas un objectif chiffré
- Comparer ses statistiques de lecture à celles des autres — pour rester privé
- Des badges ou des séries de jours consécutifs (streaks) sur ce tableau de bord — retiré pour ne pas trop transformer la lecture en jeu
- Exporter des rapports personnalisables — écarté pour garder le tableau de bord simple

## Précision

⚠️ La doc historique anglaise dit que le lien avec le module readingTracker
est déclaré mais jamais vraiment utilisé. Ce n'est plus tout à fait vrai :
le bloc "Continue Reading" lit bel et bien les données de progression de
readingTracker — les 4 autres blocs, eux, utilisent toujours leur propre
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

Il utilise les œuvres visitées pour afficher plusieurs blocs permettant de :

* reprendre les lectures en cours ;
* retrouver les dernières œuvres ouvertes ;
* repérer les œuvres récemment visitées qui ne sont pas terminées ;
* voir les fandoms les plus consultés ;
* voir les tags les plus consultés ;
* accéder rapidement aux principales listes personnelles d’AO3.

Le tableau de bord n’est affiché que sur :

* la page d’accueil ;
* la page personnelle de l’utilisateur.

Sur les autres pages, le module continue uniquement d’enregistrer les œuvres visitées en arrière-plan.

---

# Réglages utilisateur

Les réglages suivants sont affichés dans le panneau de configuration, mais ne sont pas actuellement reliés au code.

Ils n’ont donc aucun effet sur l’affichage du tableau de bord.

| Réglage            | Défaut                       | Description                                                 |
| ------------------ | ---------------------------- | ----------------------------------------------------------- |
| `showRecentWorks`  | Activé, mais non fonctionnel | Prévoit l’affichage du bloc des œuvres récentes.            |
| `showWipTracker`   | Activé, mais non fonctionnel | Prévoit l’affichage du bloc des œuvres en cours.            |
| `showTopFandoms`   | Activé, mais non fonctionnel | Prévoit l’affichage du bloc des fandoms les plus consultés. |
| `showTopTags`      | Activé, mais non fonctionnel | Prévoit l’affichage du bloc des tags les plus consultés.    |
| `showQuickLinks`   | Activé, mais non fonctionnel | Prévoit l’affichage de la section de liens rapides.         |
| `recentWorksCount` | `10`, mais non fonctionnel   | Prévoit le nombre d’œuvres récentes affichées.              |
| `topFandomsCount`  | `6`, mais non fonctionnel    | Prévoit le nombre de fandoms affichés.                      |

La configuration actuelle du module est définie dans :

```text
lib/ui/panel/configs/library/readingDashboard-config.js
```

Le fichier fonctionnel ne réenregistre plus d’ancienne configuration globale à l’aide de :

```text
AO3H_Config
Common.Settings.define
```

Dans l’implémentation actuelle, les cinq widgets principaux restent toujours actifs.

---

# Structure du module

Le module est composé d’un fichier fonctionnel unique et d’une feuille de style.

```text
readingDashboard.js
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

Le module affiche un bloc contenant les dix dernières œuvres ouvertes.

Le nombre `10` correspond au comportement actuel du code.

Le réglage `recentWorksCount` existe dans le panneau, mais il ne modifie pas encore cette valeur.

---

### Suivi des œuvres en cours

Le tableau de bord affiche les œuvres non terminées parmi les œuvres récemment visitées.

Ce bloc sert à retrouver rapidement les lectures qui semblent encore en cours.

---

### Classement des fandoms

Le module compte les fandoms associés aux œuvres visitées.

Il affiche ensuite un classement des fandoms les plus consultés.

Le réglage `topFandomsCount` prévoit une limite de six fandoms, mais cette configuration n’est pas encore reliée au code.

---

### Classement des tags

Le module compte également les tags associés aux œuvres visitées.

Il affiche une liste des tags les plus fréquemment rencontrés dans l’historique local.

Cette présentation reste une liste classique et ne constitue pas un véritable nuage de tags visuel.

---

### Liens rapides

Le tableau de bord affiche des liens directs vers :

* **Bookmarks** ;
* l’historique ;
* **Marked for Later** ;
* les abonnements.

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
  tagCounts: {}
}
```

La propriété :

```text
works
```

contient l’historique des œuvres visitées.

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

Les quatre autres groupes de contenu utilisent toujours les données enregistrées directement par **Reading Dashboard** :

* œuvres récentes ;
* œuvres non terminées ;
* fandoms principaux ;
* tags principaux.

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
* des listes de tags ;
* des liens rapides ;
* des différents titres, cartes et éléments de navigation.

---

# Fonctionnalités non implémentées

## Réorganisation des blocs

Permettre de réorganiser les blocs du tableau de bord par glisser-déposer.

---

## Défis de lecture

Afficher la progression de défis de lecture personnels.

---

## Rétrospective annuelle

Créer un bilan annuel de l’activité de lecture, comparable aux rétrospectives proposées par certaines applications musicales.

---

## Profil de lecteur

Déterminer un profil général à partir des habitudes de lecture, par exemple :

* lecteur marathon ;
* lecteur occasionnel ;
* complétionniste.

---

## Indicateurs de diversité

Afficher des informations sur la diversité des œuvres consultées.

Ces indicateurs pourraient notamment analyser la variété :

* des fandoms ;
* des tags ;
* des types d’œuvres.

---

## Proportion de relectures

Calculer le pourcentage d’œuvres relues par rapport aux nouvelles œuvres découvertes.

---

## Nuage de tags visuel

Remplacer ou compléter la liste actuelle des tags par un véritable nuage visuel représentant les préférences de lecture.

---

# Décisions de conception

## Vitesse de lecture

Le module ne calcule pas la vitesse de lecture.

Cette mesure a été jugée peu fiable sans véritable suivi du temps passé à lire.

---

## Statistiques avancées

Le tableau de bord ne contient pas de graphiques ni d’analyses statistiques avancées.

Cette décision vise à conserver une interface simple.

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

Ces éléments ont été retirés afin d’éviter de transformer excessivement la lecture en système de jeu.

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
* les tags les plus consultés.
    