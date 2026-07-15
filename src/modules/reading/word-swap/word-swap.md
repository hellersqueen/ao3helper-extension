# wordSwap

**Tab:** Reading

## À quoi ça sert

Ce module remplace des mots ou expressions dans le texte des fics selon des
règles que tu définis toi-même — utile par exemple pour les fics à
insertion de lecteur, pour remplacer "Y/N" par ton propre prénom. Les
remplacements ne touchent jamais l'interface d'AO3, seulement le texte de
la fic.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `yourFirstName` | (vide) | Le prénom utilisé pour le raccourci rapide "Y/N → Prénom" |

Les règles de remplacement elles-mêmes (quel mot remplacer par quoi) se
gèrent directement dans le panneau — ce n'est pas une simple case à
cocher.

## Fichiers

### `wordSwap.js` — tout le module en un seul fichier

- Un raccourci rapide pour remplacer "Y/N" par ton prénom
- Permet de créer ses propres règles de remplacement, avec des options (respecter les majuscules, mot entier seulement, motif avancé)
- Permet de ranger ses règles par catégories (par exemple par fandom)
- Propose un aperçu en direct dans le panneau, avec une zone de texte de test
- Permet d'exporter ou d'importer toutes ses règles dans un fichier
- Toute la gestion des règles (ajouter, modifier, supprimer, activer) se fait directement dans le panneau

### `wordSwap.css`

- Les styles visuels du bouton d'import de fichier

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Des modèles tout prêts pour normaliser automatiquement les variantes d'un nom de personnage
- Un modèle spécial tout prêt pour remplacer un deadname
- Remplacer directement des mots sensibles dans le texte par autre chose, au lieu de cacher toute la fic
- Des modèles tout prêts pour corriger des fautes de frappe qui reviennent souvent, ou pour adapter l'orthographe britannique vers l'américaine (ou l'inverse)

## Explicitement écarté

- Des variantes toutes prêtes du raccourci Y/N pour d'autres genres — Y/N suffit
- Choisir si une règle s'applique seulement à cette fic, à tout le site, ou à certains fandoms précis — volontairement simplifié, une règle s'applique toujours partout
- Un bouton séparé pour activer ou désactiver les remplacements en plus du module lui-même — non retenu, c'est déjà tout le module qui fait ça
- Demander une confirmation à chaque fois avant de remplacer Y/N — jugé pas assez utile
