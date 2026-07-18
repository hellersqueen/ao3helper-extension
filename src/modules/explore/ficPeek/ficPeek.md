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

### `ficPeekExcerpt.js` — logique extraite

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




AO3 Helper - Fic Peek Module
    Module ID: ficPeek
    Display Name: Fic Peek

    Key Features:
        - Preview button on work blurbs ("👁️ Preview")
        - First paragraph extraction
        - Inline preview display (expandable/collapsible)
        - Preview caching (in-memory and SessionStorage)
        - Async content loading
        - Works on search results, tag pages, bookmark listings



═══════════════════════════════════════════════════════════════════════════
  # ficPeek
  **Tab :** Explore
═══════════════════════════════════════════════════════════════════════════

# À quoi ça sert
Le module **Fic Peek** ajoute un bouton **Preview** sur les œuvres affichées dans les listes AO3 afin de pouvoir lire un extrait sans ouvrir leur page.

* Il permet de :
  - juger rapidement le style d’écriture d’une œuvre ;
  - lire un extrait directement dans la liste ;
  - afficher ou masquer l’aperçu sans quitter la page ;
  - déclencher l’aperçu au clic ou au survol ;
  - masquer temporairement l’extrait avec un mode sans divulgâcheur ;
  - éviter de télécharger plusieurs fois le même aperçu pendant une session.

* Le module fonctionne sur :
  - les résultats de recherche ;
  - les pages de tags ;
  - les listes de favoris ;
  - les listings de bookmarks ;
  - les autres pages contenant des fiches d’œuvres AO3.

---

# Réglages utilisateur

| Réglage                 |  Ce que ça fait                                                                                      |
| ----------------------- | --------------------------- ------------------------------------------------------------------------ |
| `hoverMode`             | Affiche l’extrait au survol de la souris plutôt qu’après un clic.                                    |
| `hoverDelay`            | Définit le délai, en millisecondes, avant l’affichage de l’aperçu en mode survol.                    |
| `spoilerFreeMode`       | Floute l’extrait et affiche un bouton permettant de le révéler.                                      |
| `excerptMode`           | Définit la longueur de l’extrait : premier paragraphe, 100 mots, 250 mots, longueur personnalisée, ou chapitre entier. |
| `excerptCustomWords`    | Définit le nombre de mots lorsque le mode personnalisé est sélectionné.                              |
| `excerptChapter`        | Quel chapitre prévisualiser : premier, dernier, ou au hasard.                                        |
| `maxPreviewHeightEm`    | Hauteur maximale (en `em`) de la boîte d’aperçu avant défilement.                                    |
| `disableCache`          | Désactive complètement la mise en mémoire des aperçus.                                                |
| `persistCache`          | Conserve les aperçus au-delà de la session (jusqu’à expiration du délai ci-dessous).                  |
| `cacheTTLHours`         | Durée (en heures) avant qu’un aperçu en cache soit considéré périmé.                                  |

---

# Structure du module

Le module est composé d’un fichier fonctionnel principal, d’un fichier de logique extraite et d’une feuille de style.

```text
ficPeek.js
ficPeekExcerpt.js
ficPeek.css
```

---

# ficPeek.js

## Rôle

Contient l’ensemble du fonctionnement du module **Fic Peek**.

Il ajoute les boutons de prévisualisation aux œuvres, récupère leur contenu en arrière-plan, génère les extraits et gère leur affichage directement dans les listes AO3.

---

## Fonctionnalités

### Bouton Preview

Le module ajoute un bouton de prévisualisation à chaque fiche d’œuvre.

Le bouton peut être affiché sous une forme semblable à :

**👁️ Preview**

Il permet :

* de charger l’extrait d’une œuvre ;
* d’ouvrir la boîte de prévisualisation ;
* de refermer un aperçu déjà ouvert ;
* d’éviter d’avoir à ouvrir la page complète de l’œuvre.

---

### Récupération de l’œuvre

Lors de la première ouverture d’un aperçu, le module :

* récupère la page de l’œuvre en arrière-plan ;
* charge le contenu de manière asynchrone ;
* extrait le texte nécessaire ;
* prépare l’extrait selon les réglages choisis.

Le chargement n’oblige pas l’utilisateur à quitter la page de résultats.

---

### Modes de longueur

Le module peut générer plusieurs longueurs d’extrait.

Les modes disponibles sont :

* le premier paragraphe ;
* les 100 premiers mots ;
* les 250 premiers mots ;
* un nombre de mots personnalisé.

La longueur personnalisée est contrôlée par le réglage `excerptCustomWords`.

---

### Affichage intégré

L’extrait est affiché dans une boîte insérée directement après le résumé de l’œuvre.

La boîte peut être :

* dépliée ;
* repliée ;
* ouverte au clic ;
* ouverte automatiquement au survol selon le réglage choisi.

---

### Mode au survol

Lorsque `hoverMode` est activé, l’aperçu s’ouvre lorsque la souris reste sur le bouton.

Le délai avant l’ouverture est défini par :

`hoverDelay`

La valeur par défaut est de **300 millisecondes**.

---

### Mode sans divulgâcheur

Lorsque `spoilerFreeMode` est activé :

* l’extrait est masqué derrière un effet de flou ;
* un bouton **⚠ Reveal spoilers** permet de révéler le texte ;
* l’utilisateur choisit explicitement s’il souhaite voir le contenu.

Ce mode est réellement implémenté, même si certaines anciennes documentations le présentaient comme abandonné.

---

### Mise en mémoire des aperçus

Le module conserve les extraits déjà récupérés afin d’éviter de télécharger plusieurs fois la même œuvre pendant une session.

Le cache utilise :

* une mémoire interne ;
* `sessionStorage`.

Les aperçus sont donc conservés tant que l’onglet ou la session du navigateur reste ouvert.

Ils sont oubliés lorsque la session se termine.

---

### Contenu dynamique

Le module surveille continuellement la page afin de détecter les nouvelles œuvres ajoutées au DOM.

Lorsqu’une nouvelle fiche apparaît, le module lui ajoute automatiquement le bouton **Preview**.

Cela permet de prendre en charge :

* les contenus chargés dynamiquement ;
* les nouvelles œuvres affichées sans rechargement ;
* les systèmes de défilement infini ;
* les mises à jour de listings.

Cette fonctionnalité est déjà implémentée, même si une ancienne documentation la présentait comme absente.

---

## Détails techniques

### Chargement asynchrone

Le contenu des œuvres est récupéré en arrière-plan afin de ne pas bloquer l’interface.

---

### Cache

Le module combine :

* un cache en mémoire ;
* `sessionStorage`.

Ce système évite les requêtes répétées pendant une même session, mais ne conserve pas les aperçus après la fermeture de l’onglet ou du navigateur.

---

### Observation de la page

Le module observe les changements du DOM afin d’ajouter automatiquement les boutons aux nouvelles œuvres.

---

### Génération de l’extrait

Le texte récupéré est transformé selon le mode choisi :

* extraction du premier paragraphe ;
* limitation à un nombre fixe de mots ;
* limitation à une valeur personnalisée.

---

# ficPeek.css

## Rôle

Contient l’ensemble des styles visuels utilisés par le module **Fic Peek**.

Il définit notamment l’apparence :

* du bouton **Preview** ;
* de la boîte d’extrait ;
* des états ouverts et fermés ;
* du mode au survol ;
* du texte flouté ;
* du bouton **Reveal spoilers** ;
* des états de chargement.

---

# Fonctionnalités non implémentées

Les fonctionnalités ci-dessous sont mentionnées dans d’autres documents du projet. Statut après revue :

---

## Analyse et recommandations ❌ Écarté

Une future section **Analysis & Recommendations** était prévue dans les réglages (`showDetails`, `enableRecommendations`, `maxResults`), sans aucun comportement branché derrière.

> Écarté : les trois réglages ont été retirés du panneau plutôt que
> simulés. Une vraie section d’analyse/recommandations dupliquerait le
> moteur de recommandation explicitement écarté à l’échelle du projet (voir
> "Recommendation Engine" dans `docs/never-built-modules.md`).

---

## Choix du chapitre ✅ Fait

Permettre de choisir quel chapitre doit être utilisé pour produire l’aperçu, plutôt que de toujours utiliser le début de l’œuvre.

> Réglage `excerptChapter` : premier (défaut), dernier, ou au hasard.
> Récupère l’œuvre complète en un seul appel (`?view_full_work=true`) dès
> qu’un autre chapitre que le premier est demandé.

---

## Prévisualisation complète d’un chapitre ✅ Fait

Permettre d’afficher un chapitre entier plutôt qu’un extrait limité.

> `excerptMode: 'fullChapter'`, avec un plafond défensif de taille
> (`truncateFullChapterText`) pour les chapitres extrêmement longs.

---

## Détection des passages sensibles ❌ Écarté

Analyser automatiquement l’extrait afin de signaler certains contenus sensibles, par exemple la violence ou les passages dérangeants.

> Écarté : détecter la "sensibilité" d’un passage à partir du texte seul
> n’est pas fiable — même raisonnement que le concept `ratingSystem` jamais
> construit (deviner l’intensité depuis le texte produit des faux positifs
> et négatifs).

---

## Personnalisation du bouton ❌ Écarté

Permettre de modifier le texte, l’icône et la position du bouton **Preview**.

> Écarté : le bouton est déjà clairement labellisé et placé de façon
> cohérente sur tous les types de listings ; personnaliser texte/icône/
> position ajouterait de la configuration pour un gain purement cosmétique.

---

## Hauteur de la boîte ✅ Fait

Ajouter un réglage permettant de choisir la hauteur maximale de la boîte d’aperçu.

> Réglage `maxPreviewHeightEm` (8.5 par défaut — la valeur déjà utilisée en
> dur auparavant).

---

## Durée du cache ✅ Fait

Permettre de définir combien de temps un aperçu doit rester en mémoire avant d’être récupéré à nouveau.

> Réglage `cacheTTLHours` (168h = 1 semaine par défaut).

---

## Désactivation du cache ✅ Fait

Ajouter une option permettant de désactiver complètement la mise en mémoire des aperçus.

> Réglage `disableCache`.

---

## Résumés tronqués ❌ Écarté

Permettre de déplier directement les résumés tronqués dans les listings, sans charger un extrait du texte de l’œuvre.

> Écarté : aucun module du projet ne tronque actuellement les résumés dans
> les listings (AO3 les affiche déjà en entier) — il n’y a donc rien à
> déplier aujourd’hui. À revisiter si un futur module introduit un
> affichage compact qui tronque les résumés.

---

## Cache persistant ✅ Fait

Conserver les aperçus plus longtemps, par exemple pendant une semaine, même après la fermeture de l’onglet ou du navigateur.

> Réglage `persistCache` : bascule le cache de `sessionStorage` vers
> `localStorage`, combiné à `cacheTTLHours` pour l’expiration.

---

## Longueur plus précise ✅ Fait (déjà couvert)

Permettre de régler plus précisément la longueur de l’aperçu, plutôt que de dépendre uniquement des modes prédéfinis et d’une seule valeur personnalisée.

> Le réglage `excerptCustomWords` existant est déjà un nombre libre
> (10 à 1000 mots), pas un préréglage figé — il couvrait déjà ce besoin.

---

# Décisions de conception

Les choix suivants ont été pris volontairement au cours du développement.

---

## Visibilité du bouton

Aucun réglage séparé n’est prévu pour afficher ou masquer le bouton **Preview**.

Pour le cacher, il suffit de désactiver complètement le module **Fic Peek**.

---

## Mode au survol

Certaines documentations historiques indiquaient que le mode au survol avait été abandonné parce qu’il était considéré comme trop intrusif.

En réalité, ce mode est actuellement implémenté dans `ficPeek.js` et peut être activé avec le réglage `hoverMode`.

---

## Mode sans divulgâcheur

Certaines documentations historiques indiquaient également que le mode sans divulgâcheur avait été abandonné en raison des limites de détection automatique.

En réalité, le module propose bien un mode `spoilerFreeMode`.

Ce mode ne tente pas de détecter les divulgâcheurs : il masque simplement l’intégralité de l’extrait jusqu’à ce que l’utilisateur choisisse de le révéler.

---

## Détection des nouvelles œuvres

Une ancienne documentation présentait l’ajout automatique des boutons sur les nouvelles œuvres comme une fonctionnalité non implémentée.

Cette fonction existe maintenant : le module surveille la page et ajoute automatiquement le bouton **Preview** aux nouvelles fiches sans rechargement.




