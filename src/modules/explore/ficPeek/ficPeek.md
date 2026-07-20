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
| `excerptMode` | `paragraph` | La longueur de l'extrait : premier paragraphe, 100 mots, 250 mots, personnalisé, ou chapitre entier |
| `excerptCustomWords` | `150` | Le nombre de mots si la longueur est réglée sur "personnalisé" |
| `excerptChapter` | `first` | Quel chapitre prévisualiser : premier, dernier, ou au hasard |
| `maxPreviewHeightEm` | `8.5` | Hauteur maximale (en `em`) de la boîte d'aperçu avant défilement |
| `disableCache` | désactivé | Désactive complètement la mise en mémoire des aperçus (re-télécharge à chaque fois) |
| `persistCache` | désactivé | Garde les aperçus même après la fermeture de l'onglet ou du navigateur (sinon oubliés à la fermeture de l'onglet) |
| `cacheTTLHours` | `168` (1 semaine) | Combien de temps un aperçu reste valable avant d'être re-téléchargé |

## Fichiers

### `ficPeek.js` — tout le module en un seul fichier

- Récupère la page de la fic en arrière-plan et en extrait un texte (premier paragraphe, 100/250 mots, nombre de mots personnalisé, ou chapitre entier)
- Peut choisir le premier chapitre, le dernier, ou un chapitre au hasard (récupère alors l'œuvre complète en un seul appel via `?view_full_work=true`, plutôt que de deviner l'URL d'un chapitre précis)
- Affiche l'extrait dans une boîte dépliable juste après le résumé, avec une hauteur maximale réglable avant défilement
- Peut se déclencher au survol de la souris ou au clic, selon le réglage
- Garde en mémoire les extraits déjà récupérés (clé incluant le chapitre et la longueur choisis) ; la durée de vie, l'activation, et la persistance au-delà de la session sont réglables
- Un mode "spoiler-free" affiche le texte flouté avec un bouton "⚠ Reveal spoilers" pour le révéler

### Logique interne intégrée à `ficPeek.js`

- `pickChapterIndex(count, mode)` : quel chapitre choisir (premier/dernier/aléatoire)
- `buildCacheKey(workUrl, opts)` : clé de cache incluant les réglages qui changent le texte extrait
- `isCacheEntryFresh(cachedAt, ttlHours)` : un aperçu en cache est-il encore valable ?
- `truncateFullChapterText(text)` : plafonne la taille d'un aperçu "chapitre entier"

### `ficPeek.css`

- Les styles visuels du bouton, de la boîte d'extrait et du mode flouté

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, avec leur statut :

- ~~Une section "Analyse et recommandations" est prévue dans les réglages, mais rien n'est vraiment branché derrière pour l'instant~~ ❌ Écarté
  Les réglages `showDetails`/`enableRecommendations`/`maxResults` (jamais
  branchés à un vrai comportement) ont été retirés du panneau plutôt que
  simulés. Faire une vraie section "Analyse et recommandations" dupliquerait
  le moteur de recommandation explicitement écarté à l'échelle du projet
  (voir "Recommendation Engine" dans `docs/never-built-modules.md`).
- ~~Choisir de prévisualiser un chapitre précis, pas seulement le tout premier~~ ✅ Fait
  Réglage `excerptChapter` : premier (défaut), dernier, ou au hasard.
- ~~Prévisualiser un chapitre entier, pas juste un petit extrait~~ ✅ Fait
  `excerptMode: 'fullChapter'` — tout le chapitre choisi, avec un plafond de
  taille défensif (`truncateFullChapterText`) pour les chapitres extrêmes.
- ~~Repérer et signaler automatiquement les passages sensibles (violence, etc.) directement dans l'aperçu~~ ❌ Écarté
  Détecter la "sensibilité" d'un passage à partir du texte seul n'est pas
  fiable — même raisonnement que le concept `ratingSystem` jamais construit
  (deviner l'intensité depuis le texte/les tags produit des faux positifs et
  négatifs).
- ~~Personnaliser le texte ou la position du bouton "Preview"~~ ❌ Écarté
  Le bouton est déjà clairement labellisé et placé de façon cohérente sur
  tous les types de listings ; personnaliser texte/icône/position ajoute de
  la configuration pour un gain purement cosmétique.
- ~~Choisir la hauteur maximale de la boîte d'aperçu~~ ✅ Fait
  Réglage `maxPreviewHeightEm` (8.5 par défaut, la valeur déjà utilisée en dur
  auparavant).
- ~~Choisir combien de temps un aperçu reste en mémoire avant d'être réactualisé~~ ✅ Fait
  Réglage `cacheTTLHours` (168h = 1 semaine par défaut).
- ~~Pouvoir désactiver complètement la mise en mémoire des aperçus~~ ✅ Fait
  Réglage `disableCache`.
- ~~Déplier directement un résumé tronqué dans les listings (sans passer par un aperçu du texte)~~ ❌ Écarté
  Aucun module du projet ne tronque actuellement les résumés dans les
  listings (AO3 les affiche déjà en entier) — il n'y a donc rien à déplier.
  À revisiter si un futur module introduit un affichage compact qui tronque
  les résumés.
- ~~Garder les aperçus déjà vus en mémoire plus longtemps (par exemple une semaine entière), même après avoir fermé l'onglet ou le navigateur — en ce moment, ils sont oubliés dès qu'on ferme l'onglet~~ ✅ Fait
  Réglage `persistCache` : bascule le cache de `sessionStorage` vers
  `localStorage`, combiné à `cacheTTLHours` pour l'expiration.
- ~~Régler la longueur de l'aperçu de façon plus précise, au lieu de choisir seulement parmi les quelques options proposées~~ ✅ Fait (déjà couvert)
  Le réglage `excerptCustomWords` existant est déjà un nombre libre
  (10 à 1000 mots), pas un préréglage — il couvre déjà ce besoin.

## Explicitement écarté

- Un réglage séparé pour montrer ou cacher le bouton "Preview" — pas besoin, il suffit d'activer ou désactiver le module entier
- Une section "Analyse et recommandations" — jamais conçue concrètement, dupliquerait le moteur de recommandation écarté à l'échelle du projet
- Détection automatique des passages sensibles — non fiable à partir du texte seul
- Personnalisation du texte/icône/position du bouton — gain cosmétique disproportionné par rapport à la configuration nécessaire
- Déplier des résumés tronqués — aucun résumé n'est actuellement tronqué dans le projet

## Précision

⚠️ Les docs historiques listent le mode survol et le mode "sans spoiler"
comme rejetés ("trop intrusif", "détection impossible"). En réalité, les
deux sont bel et bien codés dans `ficPeek.js` aujourd'hui.

⚠️ Une doc historique listait aussi comme "non fait" la détection des
nouvelles fics qui apparaissent sur la page pour leur ajouter le bouton
"Preview". En réalité, `ficPeek.js` surveille déjà la page en continu et
ajoute le bouton à toute nouvelle fic qui apparaît, sans avoir besoin de
recharger la page.
