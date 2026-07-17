# instantFootnotes

**Tab:** Reading

## À quoi ça sert

Sur les pages d'une fic, ce module affiche le contenu des notes de fin
(footnotes) dans une petite bulle qui apparaît au survol ou au clic sur le
lien de renvoi, sans avoir à faire défiler la page jusqu'aux notes de fin.
Pratique pour les fics avec beaucoup de références dans le texte.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `trigger` | `hover` | Comment la bulle s'ouvre : au survol de la souris, ou au clic |
| `delayIn` | `120` | Délai (en millisecondes) avant que la bulle apparaisse au survol |
| `delayOut` | `160` | Délai (en millisecondes) avant que la bulle disparaisse après le survol |
| `maxWidth` | `420` | La largeur maximale de la bulle, en pixels |
| `pinOnClick` | activé | Un clic sur le lien épingle la bulle pour qu'elle reste ouverte (mode survol uniquement) |
| `showPermalink` | activé | Affiche un lien "Go to note" dans la bulle, pour sauter directement à la note |

## Fichiers

### `instantFootnotes.js` — tout le module en un seul fichier

- Repère les liens qui pointent vers une note de fin dans le texte
- Affiche le contenu de la note dans une petite bulle, positionnée automatiquement au-dessus ou en dessous du lien
- Peut se déclencher au survol de la souris ou au clic, selon le réglage choisi
- En mode survol, un clic permet d'épingler la bulle pour qu'elle reste ouverte
- Un lien optionnel permet de sauter directement à la note dans le texte
- Se ferme avec la touche Échap ou le bouton "✕"

### `instantFootnotes.css`

- Les styles visuels de la bulle (fond clair/sombre, flèche, boutons)

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Un glossaire personnel — définir ses propres mots et voir leur définition apparaître automatiquement dans le texte
- Des mots déjà prêts pour certains fandoms (jargon, abréviations, argot)
- Importer ou exporter son glossaire pour le partager
- Un glossaire différent pour chaque œuvre
- Naviguer au clavier d'une note à l'autre (précédente/suivante)
- Une prononciation audio des mots du glossaire
- Un glossaire disponible en plusieurs langues
- Voir un aperçu des notes de l'auteur (au début et à la fin du chapitre) directement dans une bulle, sans avoir à y aller
- Gérer aussi les notes écrites directement dans le texte, pas seulement celles regroupées en fin de page (cas assez rare)
- Choisir la couleur ou le style de la bulle soi-même (aujourd'hui elle suit juste le thème clair/sombre automatique)
- Un vrai gestionnaire de glossaire complet (mots tout prêts, import/export, un glossaire par fandom...) : trop gros pour ce module, ce serait plutôt un module à part entière si ça se fait un jour
- Ignorer automatiquement les notes de bas de page quand on utilise la lecture à voix haute

## Explicitement écarté

- Naviguer au clavier d'une note à l'autre a été essayé puis retiré : trop peu de fics ont assez de notes de bas de page pour que ce soit utile
- Choisir comment les notes s'affichent (bulle, texte intégré dans la page, ou panneau à part) — une seule façon d'afficher a été gardée, la bulle
- Afficher seulement un extrait de la note (aperçu tronqué) au lieu du texte complet — non retenu, le texte complet est toujours affiché

## Précision

⚠️ Les docs historiques décrivent deux fonctionnalités actives, un
glossaire personnel et une navigation au clavier entre les notes — et l'une
des deux dit même que le module n'a "aucun réglage configurable". Aucune
des deux fonctionnalités n'existe dans le code actuel, et le module a bel
et bien 6 réglages réels (`trigger`, `delayIn`, `delayOut`, `maxWidth`,
`pinOnClick`, `showPermalink`).


AO3 Helper - Instant Footnotes
    Module ID: instantFootnotes
    Display Name: Instant Footnotes
    Tab: Reading

    Previews end-chapter author's notes / footnotes in a popup on hover or
    click — no scrolling needed. Supports academic-style in-work references.

    Config keys (localStorage ao3h:mod:instantFootnotes:settings):
        trigger       -- 'hover' | 'click' (default: 'hover')
        delayIn       -- hover delay ms (default: 120)
        delayOut      -- hide delay ms (default: 160)
        maxWidth      -- popup max-width px (default: 420)
        pinOnClick    -- pin popup on click (default: true)
        showPermalink -- show "Go to note" link (default: true)


═══════════════════════════════════════════════════════════════════════════
  # instantFootnotes
  **Tab :** Reading
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert

Le module **Instant Footnotes** affiche le contenu des notes de fin directement dans une petite bulle ouverte depuis leur lien de renvoi dans le texte.

Il permet notamment de :

* consulter une note sans faire défiler la page jusqu’aux notes de fin ;
* ouvrir la bulle au survol ou au clic ;
* épingler une bulle pour la garder ouverte ;
* accéder directement à la note d’origine ;
* fermer rapidement la bulle avec le clavier ou un bouton.

Ce module est particulièrement utile pour les œuvres contenant beaucoup de références, d’annotations ou de notes intégrées au texte.

---

# Réglages utilisateur

| Réglage         | Défaut  | Description                                                                |
| --------------- | ------- | -------------------------------------------------------------------------- |
| `trigger`       | `hover` | Définit si la bulle s’ouvre au survol ou au clic.                          |
| `delayIn`       | `120`   | Délai en millisecondes avant l’apparition de la bulle en mode survol.      |
| `delayOut`      | `160`   | Délai en millisecondes avant la fermeture de la bulle après le survol.     |
| `maxWidth`      | `420`   | Largeur maximale de la bulle, en pixels.                                   |
| `pinOnClick`    | Activé  | Permet d’épingler la bulle par un clic en mode survol.                     |
| `showPermalink` | Activé  | Affiche un lien **Go to note** permettant d’accéder directement à la note. |

---

# Structure du module

Le module est composé d’un fichier fonctionnel unique et d’une feuille de style.

```text
instantFootnotes.js
instantFootnotes.css
```

---

# instantFootnotes.js

## Rôle

Gère l’ensemble des fonctionnalités d’aperçu instantané des notes de fin sur les pages de lecture.

Le module détecte les liens de renvoi dans le texte, retrouve la note correspondante, construit une bulle contenant son contenu et gère son ouverture, son positionnement et sa fermeture.

---

## Fonctionnalités

### Détection des liens de note

Le module repère les liens présents dans le texte qui pointent vers une note située ailleurs sur la page.

Pour chaque lien reconnu, il :

* identifie la note correspondante ;
* récupère son contenu ;
* prépare l’affichage dans une bulle.

---

### Affichage de la note

La bulle affiche le contenu complet de la note.

Le module ne tronque pas le texte et ne montre pas seulement un extrait.

Cela permet de consulter directement toute la note sans quitter l’endroit où l’on se trouve dans le texte.

---

### Ouverture au survol

Lorsque `trigger` est réglé sur `hover`, la bulle s’ouvre lorsque le pointeur reste sur le lien de renvoi.

Le module applique :

* un délai d’ouverture défini par `delayIn` ;
* un délai de fermeture défini par `delayOut`.

Ces délais évitent que la bulle apparaisse ou disparaisse trop brusquement.

---

### Ouverture au clic

Lorsque `trigger` est réglé sur `click`, la bulle s’ouvre uniquement après un clic sur le lien.

Ce mode évite toute apparition involontaire pendant les mouvements de la souris.

---

### Épinglage

En mode survol, lorsque `pinOnClick` est activé, un clic sur le lien permet d’épingler la bulle.

Une bulle épinglée :

* reste ouverte après le déplacement de la souris ;
* ne suit plus les délais normaux de fermeture ;
* doit être fermée explicitement.

---

### Positionnement automatique

Le module positionne automatiquement la bulle à proximité du lien d’origine.

Selon l’espace disponible, elle peut apparaître :

* au-dessus du lien ;
* en dessous du lien.

Le positionnement cherche à garder la bulle visible dans la fenêtre.

---

### Lien direct vers la note

Lorsque `showPermalink` est activé, la bulle contient un lien :

* **Go to note**

Ce lien permet de sauter directement à l’emplacement réel de la note dans la page.

---

### Fermeture de la bulle

La bulle peut être fermée de plusieurs façons :

* avec la touche **Échap** ;
* avec le bouton **✕** ;
* automatiquement après le délai prévu en mode survol ;
* en cliquant ailleurs lorsque le comportement actif le permet.

---

### Compatibilité avec les références intégrées

Le module prend en charge les références de type académique ou les renvois placés directement dans le texte lorsque ceux-ci pointent vers une note regroupée en fin de page.

---

## Détails techniques

### Configuration

Les réglages sont enregistrés sous la clé :

```text
ao3h:mod:instantFootnotes:settings
```

Les clés utilisées sont :

* `trigger`
* `delayIn`
* `delayOut`
* `maxWidth`
* `pinOnClick`
* `showPermalink`

---

### Modes de déclenchement

Les valeurs acceptées pour `trigger` sont :

```text
hover
click
```

---

### Dimensions

La largeur maximale de la bulle est contrôlée par `maxWidth`.

La valeur par défaut est :

```text
420 px
```

---

### Délais

Les délais s’appliquent uniquement au mode survol.

Valeurs par défaut :

* ouverture : `120 ms`
* fermeture : `160 ms`

---

### Portée

Le module fonctionne sur les pages de lecture contenant des liens vers des notes de fin.

---

## Dépendances

Le module fonctionne de manière autonome.

Il utilise principalement :

* le DOM de la page ;
* la configuration enregistrée dans `localStorage` ;
* les ancres reliant les références aux notes.

---

# instantFootnotes.css

## Rôle

Contient l’ensemble des styles utilisés par le module **Instant Footnotes**.

Il définit notamment l’apparence :

* de la bulle ;
* de sa flèche ;
* du bouton de fermeture ;
* du lien **Go to note** ;
* des états ouverts, fermés et épinglés ;
* des variantes claires et sombres.

Le style suit automatiquement le thème clair ou sombre utilisé.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont mentionnées dans d’autres documents du projet, mais ne sont pas actuellement présentes dans le module.

---

## Glossaire personnel

Permettre à l’utilisateur de définir ses propres mots et leurs définitions.

Les mots reconnus pourraient ensuite afficher automatiquement une bulle explicative dans le texte.

---

## Glossaires de fandom

Fournir des listes déjà préparées contenant notamment :

* du jargon ;
* des abréviations ;
* de l’argot ;
* des termes propres à certains fandoms.

---

## Import et export de glossaire

Permettre :

* d’exporter un glossaire ;
* d’importer un glossaire existant ;
* de partager un glossaire avec d’autres utilisateurs.

---

## Glossaire par œuvre

Associer un glossaire différent à chaque œuvre.

---

## Navigation entre les notes

Permettre de passer au clavier :

* à la note précédente ;
* à la note suivante.

Cette fonctionnalité a déjà été essayée, puis retirée du code actuel.

---

## Prononciation audio

Ajouter une fonction permettant d’écouter la prononciation des mots présents dans un glossaire.

---

## Glossaire multilingue

Permettre de gérer plusieurs langues dans un même glossaire ou dans des glossaires séparés.

---

## Aperçu des notes de l’auteur

Afficher dans une bulle les notes de début ou de fin de chapitre sans devoir se déplacer jusqu’à leur emplacement.

---

## Notes directement intégrées au texte

Prendre en charge les notes qui ne sont pas regroupées en fin de page et qui sont directement écrites dans le contenu principal.

Ce cas est relativement rare.

---

## Personnalisation visuelle

Permettre à l’utilisateur de choisir :

* la couleur de la bulle ;
* son style ;
* sa présentation.

Actuellement, le module suit automatiquement le thème clair ou sombre.

---

## Gestionnaire de glossaire complet

Créer une interface complète pour gérer :

* les mots ;
* les définitions ;
* les fandoms ;
* les imports et exports ;
* les glossaires par œuvre ou par fandom.

Cette fonctionnalité serait suffisamment importante pour devenir un module distinct.

---

## Lecture à voix haute

Ignorer automatiquement les notes de bas de page lorsqu’une fonction de lecture à voix haute est utilisée.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Navigation clavier retirée

La navigation entre les notes au clavier a été testée puis retirée.

Elle a été jugée peu utile, car trop peu d’œuvres contiennent suffisamment de notes de fin pour justifier cette fonctionnalité.

---

## Une seule présentation

Le module utilise uniquement une bulle contextuelle.

Les autres modes envisagés n’ont pas été retenus :

* texte directement intégré dans la page ;
* panneau séparé ;
* autre présentation persistante.

---

## Contenu complet

La bulle affiche toujours le texte complet de la note.

Le module ne propose pas d’aperçu tronqué ou partiel.

---

# Précision historique

Certaines anciennes documentations décrivent deux fonctionnalités comme étant actives :

* un glossaire personnel ;
* une navigation au clavier entre les notes.

Ces fonctionnalités ne sont pas présentes dans le code actuel.

Certaines anciennes documentations indiquent également que le module ne possède aucun réglage configurable.

Cette information est incorrecte.

Le module possède actuellement six réglages réels :

* `trigger`
* `delayIn`
* `delayOut`
* `maxWidth`
* `pinOnClick`
* `showPermalink`




        