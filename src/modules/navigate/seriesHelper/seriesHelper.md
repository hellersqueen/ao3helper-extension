# seriesHelper

**Tab:** Navigate & Interact

## À quoi ça sert

Ce module améliore la navigation dans les séries de fics sur AO3 : il
affiche la progression dans une série, des badges d'info, une bannière de
navigation entre les épisodes, et regroupe les fics d'une même série sur
les listes de résultats.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `epicSeriesWarning` | désactivé | Affiche un badge d'avertissement sur les séries de 20 fics ou plus |
| `groupSeriesInSearch` | désactivé | Regroupe les fics d'une même série dans les résultats de recherche |
| `autoCollapseThreshold` | `0` (jamais) | Replie automatiquement les groupes de série à partir de N fics (3/5/10) — un choix manuel prime toujours |
| `seriesSummary` | activé | Résumé sur les pages de série : total de mots, temps de lecture estimé, bouton "Next unread", parties indisponibles |
| `hideEmptySeries` | désactivé | Masque les séries sans aucune œuvre sur les listings de séries |

Les anciens réglages placeholder `enableShortcuts` et `enableFilters` (jamais
branchés à rien) ont été retirés au passage chantier 4 — voir "Specs non
implémentés" pour la raison.

## Fichiers

### 1. `_seriesHelper.js` — le chef d'orchestre

- Partage des outils communs (lecture/écriture de données) utilisés par les autres fichiers

### 2. `seriesProgress.js` — progression et infos de série

- Ajoute une barre de progression sur chaque lien "Part X of Y"
- Affiche un badge d'avertissement pour les séries très longues (20 fics ou plus)
- Affiche un badge indiquant si la série est plutôt une suite d'histoires liées ou une anthologie (calculé par `seriesPage.js` lors de la visite de la page de série)
- Affiche un badge si on est déjà abonné à la série — cliquable, il mène à la page de série où se trouve le bouton natif de désabonnement
- Affiche un badge "terminée" ou "en cours"
- Sur la page d'une fic qui fait partie d'une série, ajoute une bannière avec la progression, des liens vers l'épisode précédent/suivant, et un signal de fin de série proche ("🏁 Only N parts left" / "🎉 Final part")

### 3. `seriesOrganization.js` — regroupement dans les listes

- Sur les listes de fics, regroupe sous un même en-tête les fics qui appartiennent à la même série
- Chaque groupe propose d'aller directement à la page de la série, de tout masquer d'un coup, ou de replier/déplier le groupe
- Les gros groupes peuvent se replier automatiquement (`autoCollapseThreshold`) ; le choix manuel de l'utilisateur est mémorisé et prime

### 4. `seriesPage.js` — pages de série (ajouté au passage chantier 4)

- Sur `/series/{id}` : résumé avec total de mots, temps de lecture estimé, bouton "▶ Next unread" (historique `readingTracker`, dépendance optionnelle), et avertissement quand des parties annoncées ne sont pas listées (supprimées/restreintes)
- Enregistre l'état d'abonnement (présence du bouton natif Unsubscribe) pour alimenter le badge des listings
- Calcule et mémorise le type de série (suite/anthologie) par heuristique sur les titres
- Sur les listings de séries : masque les séries vides si `hideEmptySeries` est activé

### 5. `seriesHelperMath.js` — calculs purs (ajouté au passage chantier 4)

- Totaux de mots et format du temps de lecture, parties indisponibles, première œuvre non lue, parties restantes, décision de repli automatique, heuristique suite/anthologie

### 6. `seriesHelper.css`

- Les styles visuels des barres de progression, badges, bannière, groupes, résumé de page de série et bouton "Next unread"

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs. État après le passage
chantier 4 (2026-07-18). Note : la liste legacy plus bas dans ce fichier
comptait deux items de plus (Raccourcis, Filtres — les réglages placeholder) ;
ils sont résolus ici aussi, en fin de liste.

- ~~Suggestions d'ordre de lecture (par exemple l'ordre chronologique de l'histoire plutôt que l'ordre de publication)~~ ❌ Écarté — aucune source de données : AO3 n'a pas de métadonnée d'ordre chronologique, et deviner la chronologie interne d'une histoire sans lire son contenu est impossible ; contredit aussi la décision de conception existante "Ordre de l'auteur respecté"
- ~~Passer directement à la prochaine fic non lue d'une série~~ ✅ Fait — sur les pages de série, le résumé affiche un bouton "▶ Next unread: Part N" (ou "▶ Start reading") basé sur l'historique de `readingTracker` (`ao3h:rt:history`, dépendance optionnelle : sans historique, il pointe sur la première œuvre)
- ~~Comparer plusieurs séries entre elles~~ ❌ Écarté — cas d'usage flou et il faudrait récupérer plusieurs pages de série (coût réseau) ; proche des "recommandations de séries" déjà écartées ("ce n'est pas le rôle de ce module")
- ~~Voir le nombre total de mots et le temps de lecture total d'une série entière~~ ✅ Fait — le résumé de page de série additionne les compteurs de mots déjà affichés sur la page (aucune requête) et estime le temps de lecture (250 mots/min, même convention qu'activityPanel)
- ~~Synchroniser le statut de lecture de la série avec celui des fics individuelles~~ ❌ Écarté — aucun "statut de lecture de série" n'existe nulle part dans l'extension à synchroniser ; le statut par œuvre vit dans `readingTracker`, et le bouton "Next unread" (ci-dessus) en dérive déjà la progression de série à la volée, ce qui couvre le besoin réel
- ~~Prévenir quand un numéro manque dans une série (par exemple "Part 3" absent d'une série qui en a 5)~~ ✅ Fait — le résumé compare le total annoncé dans les stats de la série au nombre d'œuvres réellement listées et affiche "⚠️ N work(s) unavailable (deleted or restricted)" en cas d'écart
- ~~Voir à quelle vitesse on avance dans une série, avec une date de fin estimée~~ ❌ Écarté — même raison que le calcul de vitesse de lecture déjà écarté par `readingDashboard` ("jugé peu fiable sans vraie mesure du temps de lecture")
- ~~Un petit rappel quand il ne reste plus que quelques fics à lire dans une série~~ ✅ Fait — la bannière de page de work affiche "🏁 Only N parts left" / "Last part after this one!" quand il reste ≤ 2 parties, et "🎉 Final part" sur la dernière
- ~~Un panneau récapitulatif une fois une série terminée~~ ❌ Écarté — la page de série AO3 est déjà ce récapitulatif (stats, description, liste complète) ; la bannière indique déjà la position et le 100%
- ~~Un vrai tableau de bord de statistiques sur toutes tes séries~~ ❌ Écarté — `readingDashboard` a déjà écarté les statistiques avancées/graphiques, et un tableau de bord dédié dupliquerait son rôle avec une infrastructure de suivi par série à construire
- ~~Une vue consolidée de tous les favoris d'une même série, avec un bouton pour mettre toute la série en favori d'un coup~~ ❌ Écarté — AO3 le fait déjà nativement : bouton "Bookmark Series" sur chaque page de série, et les favoris sont filtrables par tag/série via la recherche de bookmarks
- ~~Choisir soi-même à partir de combien de fics une série se replie automatiquement dans les listes de résultats (aujourd'hui le seuil est fixe)~~ ✅ Fait — réglage `autoCollapseThreshold` (jamais / 3+ / 5+ / 10+) ; un choix manuel (déplier/replier) est mémorisé et prime toujours sur le repli automatique
- ~~Voir la date de la dernière mise à jour d'une série~~ ❌ Écarté — la page de série AO3 l'affiche déjà nativement ("Updated:") ; ailleurs il faudrait récupérer chaque page de série (coût réseau, même raison que les compteurs écartés dans mainNavigation)
- ~~Un bouton pour se désabonner rapidement d'une série, directement depuis le badge d'abonnement~~ ✅ Fait (via la page native) — le badge "✓ Subscribed" est désormais un lien vers la page de série, où le bouton natif Unsubscribe est à un clic ; un désabonnement direct depuis le badge exigerait l'id d'abonnement par utilisateur + le jeton CSRF, présents uniquement sur cette page. Au passage, l'état d'abonnement est maintenant réellement enregistré (en visitant une page de série) — la clé `sub` était lue mais jamais écrite, le badge ne pouvait donc jamais apparaître
- ~~Cacher les liens vers des séries vides, sans aucune fic visible~~ ✅ Fait — réglage `hideEmptySeries` : sur les listings de séries, les blurbs annonçant 0 œuvre sont masqués (donnée déjà sur la page)
- ~~Un badge "Part X de Y" affiché directement sur chaque fic dans les résultats de recherche, avec un lien vers la page de la série~~ ❌ Écarté — les blurbs AO3 affichent déjà nativement "Part X of [série]" avec le lien ; le total Y n'est pas dans le HTML des listings et demanderait une requête par série (coût réseau)
- ~~Deviner automatiquement si une série est plutôt une suite d'histoires à lire dans l'ordre ou une anthologie d'histoires indépendantes~~ ✅ Fait — heuristique locale sur les titres des œuvres, calculée en visitant la page de série (`guessSeriesType` : marqueurs de séquence "Part/Book/2…" ou long préfixe commun → suite ; sinon anthologie) et mémorisée ; le badge dormant 📖 Sequential / 🗂️ Anthology s'affiche donc enfin
- ~~Raccourcis (réglage `enableShortcuts`, placeholder jamais branché)~~ ❌ Écarté — réglage mort supprimé du panneau. Des raccourcis de navigation de série contrediraient la décision "Aucun remplacement de la navigation native" (AO3 a "Next Work in Series"), et le rôle "raccourcis clavier" appartient de toute façon au module `keyboardShortcuts`
- ~~Filtres (réglage `enableFilters`, placeholder jamais branché)~~ ❌ Écarté — réglage mort supprimé du panneau. Filtrer les listes est le rôle du module `filterManager`, pas de celui-ci

## Explicitement écarté

- Un mode "enchaînement automatique" qui ouvre la fic suivante d'une série tout seul — jugé trop intrusif
- Des recommandations de séries à lire — ce n'est pas le rôle de ce module
- Modifier à la main l'ordre des fics dans une série — l'ordre choisi par l'auteur·ice est toujours respecté
- Télécharger une série entière d'un coup — c'est un autre module qui s'en charge
- Changer soi-même à partir de combien de fics une série est considérée "Epic" — le seuil est fixé à 20
- De simples boutons précédent/suivant dans une série — écarté car AO3 les propose déjà nativement ("Next Work in Series") ; ce module sert à suivre la progression, pas à refaire la navigation

## Détails techniques

API partagée `W.AO3H_SeriesHelper` (posée avant la cascade de démarrage des
sous-modules, qui s'enregistrent avec `parent: 'seriesHelper'` et démarrent
automatiquement via `core/lifecycle.js`'s `bootOne()`) : `lsGet(key)`,
`lsSet(key, val)`, `NS`.

Clés de stockage partagées (`ao3h:sh:*`) :
- `sub` — `{ seriesId: 1 }`, la carte des abonnements, écrite par `seriesPage.js` lors des visites de page de série
- `type:{seriesId}` — `'seq' | 'anth'`, résultat de l'heuristique `guessSeriesType`
- `collapsedGroups` — `{ seriesId: 1|0 }`, choix de repli manuel (`0` = explicitement déplié, prime toujours sur le repli automatique)

Dépendance souple : `ao3h:rt:history` (`readingTracker`) alimente le bouton
"Next unread" ; repli sur la première œuvre en son absence.
