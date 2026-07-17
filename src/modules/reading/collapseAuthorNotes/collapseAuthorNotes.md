# collapseAuthorNotes

**Tab:** Reading

## À quoi ça sert

Sur les pages d'une fic, ce module replie les notes de l'auteur (avant et
après le texte) derrière un petit bouton, pour ne pas avoir à faire
défiler la page devant de longues notes. Il peut aussi cacher les
bandeaux de collection, de cadeau ou de défi.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `autoCollapseBeginning` | désactivé | Replie automatiquement les notes de début au chargement de la page |
| `autoCollapseEnd` | désactivé | Replie automatiquement les notes de fin au chargement de la page |
| `autoCollapseMinChars` | `0` | Ne replie automatiquement que les notes plus longues que ce seuil (0 = toujours) |
| `autoExpandWarnings` | activé | Garde toujours ouvertes les notes qui contiennent un avertissement (TW, CW, trigger warning, content warning) |
| `autoExpandKeywords` | (vide) | Tes propres mots-clés (séparés par des virgules) qui gardent une note ouverte |
| `hideCollectionBanners` | désactivé | Cache les bandeaux de collection, de cadeau ou de défi |
| `clearStatesOnDisable` | désactivé | Oublie les choix repli/dépli sauvegardés quand le module est désactivé |

## Fichiers

### `collapseAuthorNotes.js` — le module

- Replie les notes de début et de fin derrière un bouton ▼ / ▶
- Se souvient, fic par fic, si les notes étaient repliées ou non
- Si on arrive sur la page avec un lien qui pointe directement vers les notes, elles s'ouvrent automatiquement
- Garde toujours ouvertes les notes qui contiennent un avertissement, même si le repli automatique est activé
- Détecte les avertissements TW/CW, les mots-clés personnels et le seuil minimal de longueur
- Peut aussi cacher les bandeaux de collection, de cadeau ou de défi

### `collapseAuthorNotes.css`

- Les styles visuels du bouton et de l'état replié

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- ~~Replier automatiquement les notes seulement si elles dépassent une certaine longueur choisie par l'utilisateur~~ ✅
  Fait : réglage `autoCollapseMinChars` — en dessous du seuil, la note reste
  visible même avec le repli automatique activé (0 = comportement historique).
- ~~Déplier automatiquement les notes qui contiennent des mots-clés qu'on choisit soi-même, en plus de TW/CW~~ ✅
  Fait : réglage `autoExpandKeywords` (liste de mots séparés par des
  virgules, insensible à la casse), prioritaire sur le repli automatique
  comme les avertissements.
- ~~Effacer toutes les préférences sauvegardées (notes repliées ou non) quand on désactive le module~~ ✅
  Fait : réglage `clearStatesOnDisable` (désactivé par défaut pour ne pas
  perdre les choix lors d'une désactivation temporaire) — `clearAllStates()`
  existait déjà mais n'était jamais appelé.

## Explicitement écarté

- Se combiner avec les réglages d'apparence pour proposer un vrai mode de lecture sans distraction — écarté : le mode lecture (mise en page, typographie, plein écran) est le rôle de `readingFormatter` ; les deux modules s'activent déjà ensemble librement, un couplage explicite n'apporterait qu'une dépendance de plus

- Un bouton "Aller directement au texte" pour sauter les notes d'un coup — jugé redondant avec la navigation déjà fournie par AO3
- Montrer un aperçu de la première ligne de la note avant de la déplier — jugé trop compliqué à faire pour ce que ça apporte
- Pouvoir désactiver le fait que le module se souvienne si une note était repliée ou non — c'est toujours activé, ça fait partie du fonctionnement de base
- Pouvoir désactiver le dépliage automatique des notes quand on arrive par un lien qui pointe dessus — c'est toujours activé, c'est normal
- Personnaliser la position ou l'apparence du bouton pour replier/déplier — il n'y a qu'une seule présentation possible



   AO3 Helper — Collapse Author's Notes
   Module ID : collapseAuthorNotes

   What it does:
     On work pages, finds beginning notes (div.notes.module) and end notes
     (div.end.notes.module) and collapses them behind a small ▼ / ▲ toggle.

   Settings (from config.js, read via localStorage directly):
     autoCollapseBeginning  – auto-collapse beginning notes on load
     autoCollapseEnd        – auto-collapse end notes on load
     autoExpandWarnings     – always expand notes containing TW / CW keywords
     hideCollectionBanners  – hide collection / gift / challenge banners

   Persistence:
     Per-work collapse state saved in localStorage under
     ao3h:notes:{workId}:pre  and  ao3h:notes:{workId}:end

   Anchor respect:
     If the URL hash is #notes or #endnotes, the targeted section is forced
     open regardless of saved state or auto-collapse setting.


═══════════════════════════════════════════════════════════════════════════
  # collapseAuthorNotes
  **Tab :** Reading
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Collapse Author Notes** replie les notes de l’auteur affichées avant et après le texte d’une œuvre afin de réduire la longueur visible de la page.

* Il permet notamment de :
  - replier les notes de début ;
  - replier les notes de fin ;
  - mémoriser l’état des notes pour chaque œuvre ;
  - garder ouvertes les notes contenant des avertissements ;
  - ouvrir automatiquement une section ciblée par un lien direct ;
  - masquer les bandeaux de collection, de cadeau ou de défi.

---

# Réglages utilisateur

| Réglage                 | Description                                                                                           |
| ----------------------- |-------------------------------------------------------------------------------------------------------|
| `autoCollapseBeginning` | Replie automatiquement les notes de début au chargement de la page.                                   |
| `autoCollapseEnd`       | Replie automatiquement les notes de fin au chargement de la page.                                     |
| `autoExpandWarnings`    | Garde ouvertes les notes contenant un avertissement comme TW, CW, Trigger Warning ou Content Warning. |
| `hideCollectionBanners` | Masque les bandeaux de collection, de cadeau ou de défi.                                              |

---

# Structure du module

Le module est composé d’un fichier fonctionnel unique et d’une feuille de style.

```text
collapseAuthorNotes.js
collapseAuthorNotes.css
```

---

# collapseAuthorNotes.js

## Rôle

Gère l’ensemble des fonctionnalités de repli des notes de l’auteur sur les pages de lecture.

Le module détecte les notes de début et de fin, ajoute les contrôles nécessaires, restaure leur état enregistré et applique les exceptions liées aux avertissements ou aux liens directs.

---

## Fonctionnalités

### Repli des notes de début

Le module détecte les notes situées avant le texte principal à l’aide du sélecteur :

```text
div.notes.module
```

Il ajoute un bouton permettant de :

* replier la note ;
* déplier la note ;
* afficher visuellement son état actuel.

---

### Repli des notes de fin

Le module détecte les notes situées après le texte principal à l’aide du sélecteur :

```text
div.end.notes.module
```

Il applique le même système de repli et de dépliage que pour les notes de début.

---

### Contrôle du repli

Chaque section possède un petit bouton de contrôle.

Le bouton indique l’état de la note avec une icône directionnelle :

* `▼` ou `▲` lorsque la note est ouverte ;
* `▶` lorsque la note est repliée.

Une seule présentation du bouton est utilisée dans le module.

---

### Repli automatique

Selon les réglages utilisateur, le module peut replier automatiquement les notes lors du chargement de la page.

Les réglages concernés sont :

* `autoCollapseBeginning`
* `autoCollapseEnd`

Les notes de début et de fin peuvent être contrôlées séparément.

---

### Mémorisation de l’état

Le module mémorise l’état des notes individuellement pour chaque œuvre.

Les clés utilisées dans `localStorage` sont :

```text
ao3h:notes:{workId}:pre
ao3h:notes:{workId}:end
```

Elles correspondent respectivement :

* aux notes de début ;
* aux notes de fin.

Lorsqu’une œuvre est ouverte de nouveau, le module restaure automatiquement le dernier état enregistré.

Cette mémorisation est toujours active et fait partie du fonctionnement de base du module.

---

### Détection des avertissements

Lorsque `autoExpandWarnings` est activé, le module analyse le contenu des notes.

Les notes contenant certains mots-clés restent ouvertes, même lorsque le repli automatique est activé.

Les avertissements reconnus comprennent notamment :

* `TW`
* `CW`
* `Trigger Warning`
* `Content Warning`

Cette protection permet d’éviter que des informations sensibles soient masquées automatiquement.

---

### Respect des liens directs

Le module respecte les ancres présentes dans l’URL.

Lorsque l’URL contient :

```text
#notes
```

les notes de début sont forcées à rester ouvertes.

Lorsque l’URL contient :

```text
#endnotes
```

les notes de fin sont forcées à rester ouvertes.

Ce comportement est prioritaire sur :

* l’état enregistré dans `localStorage` ;
* les réglages de repli automatique.

Il est toujours actif et ne peut pas être désactivé.

---

### Masquage des bandeaux

Lorsque `hideCollectionBanners` est activé, le module masque les bandeaux liés :

* aux collections ;
* aux cadeaux ;
* aux défis.

---

## Détails techniques

### Portée

Le module fonctionne uniquement sur les pages de lecture des œuvres.

---

### Configuration

Les réglages sont lus depuis la configuration du module, actuellement accessible directement à partir de `localStorage`.

Les clés utilisées sont :

* `autoCollapseBeginning`
* `autoCollapseEnd`
* `autoExpandWarnings`
* `hideCollectionBanners`

---

### Persistance

L’état du repli est enregistré séparément :

* pour chaque œuvre ;
* pour les notes de début ;
* pour les notes de fin.

---

### Priorité des états

L’état final d’une note dépend de plusieurs règles.

L’ordre de priorité est le suivant :

1. une ancre `#notes` ou `#endnotes` force l’ouverture ;
2. un avertissement reconnu peut forcer l’ouverture ;
3. l’état précédemment enregistré est restauré ;
4. le réglage de repli automatique est utilisé lorsqu’aucun état n’est encore enregistré.

---

## Dépendances

Le module fonctionne de manière autonome.

Il utilise uniquement :

* la configuration du module ;
* `localStorage` ;
* le DOM des pages AO3.

---

# collapseAuthorNotes.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Collapse Author Notes**.

Il définit notamment l’apparence :

* des boutons de repli et de dépliage ;
* des icônes directionnelles ;
* des notes ouvertes ;
* des notes repliées ;
* des éléments masqués.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont mentionnées dans d’autres documents du projet, mais ne sont pas actuellement présentes dans le module.

---

## ~~Repli selon la longueur~~ ✅ Fait

~~Permettre de replier automatiquement une note uniquement lorsqu'elle dépasse une longueur choisie par l'utilisateur.~~

> Réglage `autoCollapseMinChars` (seuil en caractères, 0 = toujours
> replier). Le comptage en mots ou en hauteur visible n'a pas été retenu :
> le seuil en caractères est le plus prévisible et suffit à l'usage.

---

## ~~Mots-clés personnalisés~~ ✅ Fait

~~Permettre à l'utilisateur de définir ses propres mots-clés afin de forcer l'ouverture de certaines notes.~~

> Réglage `autoExpandKeywords` (liste séparée par des virgules, insensible
> à la casse), qui s'ajoute à la détection TW/CW existante et a la même
> priorité qu'elle sur le repli automatique (`collapseAuthorNotes.js`).

---

## ~~Suppression des états enregistrés~~ ✅ Fait

~~Effacer les préférences de repli sauvegardées lorsque le module est désactivé.~~

> Réglage `clearStatesOnDisable` : à la désactivation du module, toutes les
> clés `ao3h:notes:{workId}:pre|end` sont supprimées. Désactivé par défaut
> pour qu'une désactivation temporaire ne fasse pas perdre les choix.

---

## ~~Mode de lecture sans distraction~~ ❌ Écarté

~~Intégrer le module aux réglages d'apparence afin de proposer un véritable mode de lecture sans distraction.~~

> Écarté : la mise en page de lecture (typographie, masquage d'éléments,
> plein écran) est le rôle de `readingFormatter`. Les deux modules
> fonctionnent déjà ensemble quand ils sont activés tous les deux — un
> couplage explicite n'apporterait qu'une dépendance de maintenance.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Bouton pour aller directement au texte

Le module n’ajoute pas de bouton permettant de sauter immédiatement les notes pour atteindre le texte.

Cette fonctionnalité a été jugée redondante avec les outils de navigation déjà fournis par AO3.

---

## Aperçu du contenu

Le module n’affiche pas la première ligne d’une note lorsqu’elle est repliée.

Cette fonctionnalité a été jugée trop complexe pour le bénéfice apporté.

---

## Mémorisation obligatoire

La mémorisation de l’état des notes ne peut pas être désactivée.

Elle fait partie du fonctionnement de base du module.

---

## Ouverture par ancre obligatoire

Le dépliage automatique des notes ciblées par `#notes` ou `#endnotes` ne peut pas être désactivé.

Ce comportement est nécessaire pour respecter les liens directs vers une section précise.

---

## Apparence fixe

La position et l’apparence du bouton de repli ne sont pas personnalisables.

Le module utilise une seule présentation afin de conserver un comportement simple et uniforme.


