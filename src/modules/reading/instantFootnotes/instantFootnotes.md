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
| `bubbleTheme` | `auto` | Couleur de la bulle : suit le thème système (`auto`), ou forcée en `light`/`dark` |

## Fichiers

### `instantFootnotes.js` — tout le module en un seul fichier

- Repère les liens qui pointent vers une note de fin dans le texte
- Affiche le contenu de la note dans une petite bulle, positionnée automatiquement au-dessus ou en dessous du lien
- Peut se déclencher au survol de la souris ou au clic, selon le réglage choisi
- En mode survol, un clic permet d'épingler la bulle pour qu'elle reste ouverte
- Un lien optionnel permet de sauter directement à la note dans le texte
- Se ferme avec la touche Échap ou le bouton "✕"
- Peut forcer la bulle en thème clair ou sombre, indépendamment du thème système (réglage `bubbleTheme`)

### `instantFootnotes.css`

- Les styles visuels de la bulle (fond clair/sombre, flèche, boutons)

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, avec leur statut :

- ~~Un glossaire personnel — définir ses propres mots et voir leur définition apparaître automatiquement dans le texte~~ ❌ Écarté
- ~~Des mots déjà prêts pour certains fandoms (jargon, abréviations, argot)~~ ❌ Écarté
- ~~Importer ou exporter son glossaire pour le partager~~ ❌ Écarté
- ~~Un glossaire différent pour chaque œuvre~~ ❌ Écarté
- ~~Une prononciation audio des mots du glossaire~~ ❌ Écarté
- ~~Un glossaire disponible en plusieurs langues~~ ❌ Écarté
- ~~Un vrai gestionnaire de glossaire complet (mots tout prêts, import/export, un glossaire par fandom...)~~ ❌ Écarté

  > Ces sept idées forment un seul et même chantier (un glossaire
  > personnel complet), déjà identifié dans ce document comme "trop gros
  > pour ce module, ce serait plutôt un module à part entière" — la
  > position du projet n'a pas changé : ce module gère des bulles
  > d'aperçu de notes AO3, pas un dictionnaire personnel. Aucune des sept
  > variantes n'a de sens sans la fonctionnalité de base (le glossaire
  > lui-même), donc toutes sont écartées ensemble.

- ~~Naviguer au clavier d'une note à l'autre (précédente/suivante)~~ ❌ Écarté
  Déjà tranché (voir "Explicitement écarté" ci-dessous) — cet item était
  dupliqué par erreur dans les deux listes ; la raison est la même.
- ~~Voir un aperçu des notes de l'auteur (au début et à la fin du chapitre) directement dans une bulle, sans avoir à y aller~~ ❌ Écarté
  Ces mêmes éléments (`div.notes.module` / `div.end.notes.module`) sont
  déjà gérés par le module `collapseAuthorNotes`, qui permet justement de
  les déplier/replier en un clic sans avoir à s'y rendre par défilement.
  Ajouter un second mécanisme de bulle sur les mêmes éléments dupliquerait
  une fonctionnalité déjà couverte par un module dédié, avec un risque de
  confusion entre les deux.
- ~~Gérer aussi les notes écrites directement dans le texte, pas seulement celles regroupées en fin de page (cas assez rare)~~ ❌ Écarté
  AO3 n'a pas de convention standard pour une note intégrée directement au
  texte (contrairement aux notes de fin, structurées et reconnaissables).
  Deviner "quel bout de texte est la note" pour un format non standardisé
  produirait des bulles au contenu incorrect plus souvent qu'utile, pour un
  cas déjà signalé comme rare.
- ~~Choisir la couleur ou le style de la bulle soi-même (aujourd'hui elle suit juste le thème clair/sombre automatique)~~ ✅ Fait
  Réglage `bubbleTheme` : `auto` (comportement historique, suit le thème
  système), ou forcé en `light`/`dark` indépendamment du système.
- ~~Ignorer automatiquement les notes de bas de page quand on utilise la lecture à voix haute~~ ✅ Fait (déjà couvert ailleurs)
  Le module `textToSpeech` (réglage `skipAuthorNotes`, activé par défaut)
  exclut déjà tout élément portant la classe AO3 `notes` du texte lu à voix
  haute — ce qui couvre aussi bien les notes d'auteur que les notes de fin
  ciblées par ce module, puisqu'AO3 utilise la même classe pour les deux
  (`div.end.notes.module`).

## Explicitement écarté

- Naviguer au clavier d'une note à l'autre a été essayé puis retiré : trop peu de fics ont assez de notes de bas de page pour que ce soit utile
- Choisir comment les notes s'affichent (bulle, texte intégré dans la page, ou panneau à part) — une seule façon d'afficher a été gardée, la bulle
- Afficher seulement un extrait de la note (aperçu tronqué) au lieu du texte complet — non retenu, le texte complet est toujours affiché
- Le glossaire personnel et toutes ses variantes (fandom, import/export, par œuvre, audio, multilingue, gestionnaire complet) — trop gros pour ce module, serait un module à part entière
- Aperçu des notes de l'auteur en bulle — recouperait le domaine déjà couvert par `collapseAuthorNotes`
- Gestion des notes intégrées directement au texte — format non standardisé sur AO3, cas rare

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

* Il permet notamment de :
  - consulter une note sans faire défiler la page jusqu’aux notes de fin ;
  - ouvrir la bulle au survol ou au clic ;
  - épingler une bulle pour la garder ouverte ;
  - accéder directement à la note d’origine ;
  - fermer rapidement la bulle avec le clavier ou un bouton.

Ce module est particulièrement utile pour les œuvres contenant beaucoup de références, d’annotations ou de notes intégrées au texte.

---

# Réglages utilisateur

| Réglage         | Description                                                                |
| --------------- |----------------------------------------------------------------------------|
| `trigger`       | Définit si la bulle s’ouvre au survol ou au clic.                          |
| `delayIn`       | Délai en millisecondes avant l’apparition de la bulle en mode survol.      |
| `delayOut`      | Délai en millisecondes avant la fermeture de la bulle après le survol.     |
| `maxWidth`      | Largeur maximale de la bulle, en pixels.                                   |
| `pinOnClick`    | Permet d’épingler la bulle par un clic en mode survol.                     |
| `showPermalink` | Affiche un lien **Go to note** permettant d’accéder directement à la note. |
| `bubbleTheme`   | Couleur de la bulle : `auto` (thème système), ou forcée en `light`/`dark`. |

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

Les fonctionnalités ci-dessous sont mentionnées dans d’autres documents du projet. Statut après revue :

---

## Glossaire personnel ❌ Écarté

Permettre à l’utilisateur de définir ses propres mots et leurs définitions, affichées automatiquement dans le texte.

> Écarté avec les six variantes ci-dessous (fandom, import/export, par
> œuvre, audio, multilingue, gestionnaire complet) : ce document
> lui-même les identifie déjà comme "suffisamment importantes pour
> devenir un module distinct" (voir "Gestionnaire de glossaire complet").
> Ce module gère des bulles d’aperçu de notes AO3, pas un dictionnaire
> personnel — la position ne change pas.

---

## Glossaires de fandom ❌ Écarté

Fournir des listes déjà préparées (jargon, abréviations, argot, termes de fandom).

> Écarté — dépend du glossaire personnel ci-dessus.

---

## Import et export de glossaire ❌ Écarté

Exporter/importer un glossaire, le partager.

> Écarté — dépend du glossaire personnel ci-dessus.

---

## Glossaire par œuvre ❌ Écarté

Associer un glossaire différent à chaque œuvre.

> Écarté — dépend du glossaire personnel ci-dessus.

---

## Navigation entre les notes ❌ Écarté

Permettre de passer au clavier à la note précédente/suivante. Déjà essayée, puis retirée du code actuel.

> Écarté — décision déjà prise (voir "Décisions de conception" :
> "Navigation clavier retirée").

---

## Prononciation audio ❌ Écarté

Écouter la prononciation des mots d’un glossaire.

> Écarté — dépend du glossaire personnel ci-dessus.

---

## Glossaire multilingue ❌ Écarté

Gérer plusieurs langues dans un glossaire.

> Écarté — dépend du glossaire personnel ci-dessus.

---

## Aperçu des notes de l’auteur ❌ Écarté

Afficher dans une bulle les notes de début ou de fin de chapitre sans devoir s’y déplacer.

> Écarté : ces mêmes éléments (`div.notes.module` / `div.end.notes.module`)
> sont déjà gérés par le module `collapseAuthorNotes`, qui permet de les
> déplier/replier en un clic sans défilement. Ajouter un second mécanisme
> de bulle sur les mêmes éléments dupliquerait une fonctionnalité déjà
> couverte par un module dédié.

---

## Notes directement intégrées au texte ❌ Écarté

Prendre en charge les notes écrites directement dans le contenu principal, pas seulement en fin de page. Cas relativement rare.

> Écarté : AO3 n’a pas de convention standard pour une note intégrée
> directement au texte, contrairement aux notes de fin (structurées et
> reconnaissables). Deviner "quel bout de texte est la note" pour un
> format non standardisé produirait des bulles au contenu incorrect plus
> souvent qu’utile.

---

## Personnalisation visuelle ✅ Fait

Permettre à l’utilisateur de choisir la couleur, le style, la présentation de la bulle plutôt que de suivre automatiquement le thème système.

> Réglage `bubbleTheme` : `auto` (comportement historique), ou forcé en
> `light`/`dark` indépendamment du thème système.

---

## Gestionnaire de glossaire complet ❌ Écarté

Interface complète (mots, définitions, fandoms, import/export, glossaires par œuvre/fandom) — jugée suffisamment importante pour un module distinct.

> Écarté — confirme cette évaluation déjà présente dans le document ;
> voir "Glossaire personnel" ci-dessus.

---

## Lecture à voix haute ✅ Fait (déjà couvert ailleurs)

Ignorer automatiquement les notes de bas de page lorsqu’une fonction de lecture à voix haute est utilisée.

> Le module `textToSpeech` (réglage `skipAuthorNotes`, activé par défaut)
> exclut déjà tout élément portant la classe AO3 `notes` du texte lu à
> voix haute — cela couvre aussi les notes de fin ciblées par ce module,
> puisqu’AO3 utilise la même classe (`div.end.notes.module`) pour les
> deux.

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




        