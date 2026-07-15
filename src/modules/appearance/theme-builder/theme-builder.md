# themeBuilder

**Tab:** Appearance & Tools

## À quoi ça sert

Ce module permet de créer ses propres thèmes visuels pour AO3 (couleurs,
polices, styles), avec un éditeur visuel simple (curseurs, sélecteurs de
couleur, sans code) ou un mode expert pour écrire du CSS directement. Il
propose aussi une bibliothèque de thèmes, avec 3 thèmes déjà prêts.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `mode` | `visual` | Le mode actif : éditeur visuel (sans code) ou éditeur de CSS |
| `importEnabled` | activé | Affiche le bouton pour importer un thème depuis un fichier |

## Fichiers

### 1. `_themeBuilder.js` — le chef d'orchestre

- Réapplique le thème actif à chaque chargement de page
- Partage des outils communs (lecture/écriture, application du style) avec les autres fichiers de ce module

### 2. `customStyling.js` — l'éditeur pour experts

- Un éditeur de code avec coloration syntaxique pour écrire du CSS, du HTML ou du JavaScript directement
- Vérifie que le CSS écrit est valide et signale les erreurs (accolades manquantes, etc.)
- Propose des petits bouts de style tout prêts à insérer (par exemple "zone de lecture plus large"), et permet de sauvegarder ses propres bouts de code réutilisables
- Permet de choisir sur quelles pages le code s'applique (partout, pages de fic, listes, tableau de bord)
- Un réglage de priorité (1 à 10) pour décider quel style l'emporte en cas de conflit
- Un bouton "Save as Theme" pour transformer son CSS en thème réutilisable

### 3. `themeManagement.js` — la bibliothèque de thèmes

- Propose 3 thèmes déjà prêts : Dark Mode, Soft Cream, High Contrast
- Permet de créer, sauvegarder, modifier et supprimer ses propres thèmes
- Un aperçu temporaire avant d'appliquer un thème pour de vrai
- Exporter un thème (ou tous ses thèmes) en fichier JSON, ou le copier directement
- Importer un thème depuis un fichier JSON

### 4. `typographySystem.js` — les réglages de police

- Propose 6 préréglages de typographie (classique avec empattements, moderne, liseuse électronique, contraste élevé...)
- Permet de choisir séparément la police du texte et celle des titres
- Curseurs pour la taille du texte, l'espacement des lignes et l'espacement des lettres

### 5. `visualBuilder.js` — l'éditeur visuel

- Des sélecteurs de couleur pour l'accent, le fond, le texte, les liens et l'en-tête
- Un aperçu en direct des changements avant de les appliquer pour de vrai
- Un mode "inspecteur" pour cliquer sur un élément de la page et récupérer son nom technique (utile pour l'éditeur CSS avancé)

### 6. `themeBuilder.css`

- Les styles visuels de tous les panneaux, boutons et curseurs ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Après avoir choisi un élément avec l'inspecteur, pouvoir directement le styliser depuis ce clic — pour l'instant, ça remplit juste un champ texte avec son nom technique, il faut ensuite écrire le style soi-même
- Empêcher que le CSS personnalisé n'abîme certaines zones importantes de la page, comme le texte de la fic — pour l'instant, la vérification ne repère que les erreurs d'écriture (accolades ou deux-points manquants), pas les styles qui pourraient casser ces zones
- Voir un aperçu en direct des changements de police, taille de texte ou espacement pendant qu'on bouge les curseurs — pour l'instant, il faut cliquer sur "Apply" pour voir le résultat
- Importer un thème depuis une adresse internet (URL) — pour l'instant, on ne peut importer un thème qu'à partir d'un fichier
- Vérifier automatiquement que les couleurs choisies restent assez lisibles, et proposer des palettes pensées pour les daltoniens
- Changer ou comparer les thèmes plus facilement : automatiquement selon le fandom qu'on lit ou l'heure de la journée (clair le jour, sombre la nuit), ou en basculant rapidement entre deux thèmes pour les comparer

## Explicitement écarté

- Une bibliothèque communautaire de thèmes partagés en ligne — nécessiterait un serveur
- Un bouton "sauvegarde automatique" séparé — la sauvegarde se fait déjà en cliquant sur Apply/Save

## Précision

⚠️ La doc historique présentait ce module comme une simple idée pas encore
codée ("Ce qui est prévu"). Ce n'est plus le cas : les deux modes (visuel
et CSS), la bibliothèque de thèmes avec les 3 thèmes prêts, la création/
suppression de thèmes personnalisés, l'export/import JSON, l'aperçu en
direct, les préréglages de typographie et l'inspecteur de clic sont tous
bel et bien codés aujourd'hui.
