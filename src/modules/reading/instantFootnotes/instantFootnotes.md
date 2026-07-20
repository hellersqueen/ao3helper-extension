# instantFootnotes

**Tab:** Reading

## À quoi ça sert

Sur les pages d'une fic, ce module affiche le contenu des notes de fin
(footnotes) dans une petite bulle qui apparaît au survol ou au clic sur le
lien de renvoi, sans avoir à faire défiler la page jusqu'aux notes de fin.
Pratique pour les fics avec beaucoup de références dans le texte, y
compris les renvois de style académique intégrés directement dans le
texte, tant qu'ils pointent vers une note regroupée en fin de page.

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

Les réglages sont enregistrés sous la clé `ao3h:mod:instantFootnotes:settings`.

## Fichiers

### `instantFootnotes.js` — tout le module en un seul fichier

- Repère les liens qui pointent vers une note de fin dans le texte, récupère le contenu de la note correspondante et prépare son affichage
- Affiche le contenu complet de la note dans une petite bulle (jamais un extrait tronqué), positionnée automatiquement au-dessus ou en dessous du lien selon l'espace disponible dans la fenêtre
- Peut se déclencher au survol de la souris (`trigger: hover`, avec délais `delayIn`/`delayOut` pour éviter les apparitions/disparitions trop brusques) ou au clic (`trigger: click`, ce qui évite toute apparition involontaire pendant les mouvements de la souris)
- En mode survol, un clic permet d'épingler la bulle (`pinOnClick`) : elle reste alors ouverte après le déplacement de la souris et ne suit plus les délais normaux de fermeture, jusqu'à être fermée explicitement
- Un lien optionnel "Go to note" (`showPermalink`) permet de sauter directement à la note dans le texte
- Se ferme avec la touche Échap, le bouton "✕", automatiquement après le délai prévu en mode survol, ou en cliquant ailleurs lorsque le comportement actif le permet
- Peut forcer la bulle en thème clair ou sombre, indépendamment du thème système (réglage `bubbleTheme`)
- Fonctionne de manière autonome sur les pages de lecture contenant des liens vers des notes de fin : il n'utilise que le DOM de la page, la configuration `localStorage`, et les ancres reliant les références aux notes

### `instantFootnotes.css`

- Les styles visuels de la bulle : fond clair/sombre, flèche, bouton de fermeture, lien "Go to note", états ouvert/fermé/épinglé, variantes claires et sombres — suit automatiquement le thème utilisé

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

- ~~Naviguer au clavier d'une note à l'autre (précédente/suivante)~~ ❌ Écarté — déjà essayée puis retirée du code : trop peu de fics ont assez de notes de bas de page pour que ce soit utile (voir "Explicitement écarté" ci-dessous)
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
