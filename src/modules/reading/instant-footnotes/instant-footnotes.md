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
