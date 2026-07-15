# ficPeek

**Tab:** Explore

## À quoi ça sert

Ce module ajoute un bouton "Preview" sur les fics des listes (résultats,
tags, favoris...) pour lire un extrait sans ouvrir la page de la fic.
Utile pour juger rapidement du style d'écriture avant de s'engager dans la
lecture.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `hoverMode` | désactivé (clic) | Affiche l'extrait au survol de la souris plutôt qu'au clic |
| `hoverDelay` | `300` | Le délai (en millisecondes) avant l'affichage en mode survol |
| `spoilerFreeMode` | désactivé | Cache l'extrait derrière un flou, avec un bouton pour le révéler |
| `excerptMode` | `paragraph` | La longueur de l'extrait : premier paragraphe, 100 mots, 250 mots, ou personnalisé |
| `excerptCustomWords` | `150` | Le nombre de mots si la longueur est réglée sur "personnalisé" |
| `showDetails` | activé *(pas encore actif)* | Réservé pour une future section "Analysis & Recommendations" |
| `enableRecommendations` | activé *(pas encore actif)* | idem |
| `maxResults` | `10` *(pas encore actif)* | idem |

## Fichiers

### `ficPeek.js` — tout le module en un seul fichier

- Récupère la page de la fic en arrière-plan et en extrait un texte (premier paragraphe, 100/250 mots, ou un nombre de mots personnalisé)
- Affiche l'extrait dans une boîte dépliable juste après le résumé
- Peut se déclencher au survol de la souris ou au clic, selon le réglage
- Garde en mémoire les extraits déjà récupérés, pour ne pas les re-télécharger à chaque fois pendant la session
- Un mode "spoiler-free" affiche le texte flouté avec un bouton "⚠ Reveal spoilers" pour le révéler

### `ficPeek.css`

- Les styles visuels du bouton, de la boîte d'extrait et du mode flouté

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Une section "Analyse et recommandations" est prévue dans les réglages, mais rien n'est vraiment branché derrière pour l'instant
- Choisir de prévisualiser un chapitre précis, pas seulement le tout premier
- Prévisualiser un chapitre entier, pas juste un petit extrait
- Repérer et signaler automatiquement les passages sensibles (violence, etc.) directement dans l'aperçu
- Personnaliser le texte ou la position du bouton "Preview"
- Choisir la hauteur maximale de la boîte d'aperçu
- Choisir combien de temps un aperçu reste en mémoire avant d'être réactualisé
- Pouvoir désactiver complètement la mise en mémoire des aperçus
- Déplier directement un résumé tronqué dans les listings (sans passer par un aperçu du texte)
- Garder les aperçus déjà vus en mémoire plus longtemps (par exemple une semaine entière), même après avoir fermé l'onglet ou le navigateur — en ce moment, ils sont oubliés dès qu'on ferme l'onglet
- Régler la longueur de l'aperçu de façon plus précise, au lieu de choisir seulement parmi les quelques options proposées

## Explicitement écarté

- Un réglage séparé pour montrer ou cacher le bouton "Preview" — pas besoin, il suffit d'activer ou désactiver le module entier

## Précision

⚠️ Les docs historiques listent le mode survol et le mode "sans spoiler"
comme rejetés ("trop intrusif", "détection impossible"). En réalité, les
deux sont bel et bien codés dans `ficPeek.js` aujourd'hui.

⚠️ Une doc historique listait aussi comme "non fait" la détection des
nouvelles fics qui apparaissent sur la page pour leur ajouter le bouton
"Preview". En réalité, `ficPeek.js` surveille déjà la page en continu et
ajoute le bouton à toute nouvelle fic qui apparaît, sans avoir besoin de
recharger la page.
