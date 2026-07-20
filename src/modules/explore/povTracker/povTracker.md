# povTracker

**Tab:** Explore

## À quoi ça sert

Ce module devine automatiquement le point de vue narratif (1ère, 2e, 3e
personne, mixte ou multi) d'une fic à partir de ses tags et de son résumé.
Il affiche ensuite un badge sur les listes et propose des filtres pour ne
voir que certains points de vue.

C'est une détection expérimentale, basée sur des motifs de texte simples
(pas une vraie lecture de la fic) : elle est juste assez fiable pour être
utile, mais pas parfaite (autour de 60% de bonnes réponses). Sur les listes,
l'analyse reste volontairement limitée aux tags et au résumé — le module ne
télécharge jamais le texte complet d'une œuvre qu'on n'a pas ouverte, pour
ne pas multiplier les requêtes. Sur la page d'une œuvre déjà ouverte en
revanche, le texte du chapitre affiché est analysé (`analyzeFullText`)
puisqu'il est déjà chargé dans la page — ça n'ajoute aucune requête réseau
supplémentaire.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showBadgesOnBlurbs` | activé | Affiche les badges de point de vue sur les listes (seulement pour les fics déjà analysées) |
| `badgeFirst` | activé | Affiche le badge 1ère personne |
| `badgeSecond` | désactivé | Affiche le badge 2e personne |
| `badgeThird` | activé | Affiche le badge 3e personne |
| `badgeMixed` | désactivé | Affiche le badge point de vue mixte |
| `badgeMulti` | désactivé | Affiche le badge multi-points de vue |
| `badgeUnknown` | désactivé | Affiche le badge point de vue inconnu |
| `enablePovFilters` | activé | Ajoute des cases à cocher pour filtrer les listes par point de vue |
| `autoAnalyze` | activé | Analyse automatiquement à l'ouverture de la page d'une fic |
| `showStats` | désactivé | Affiche un résumé personnel de la répartition des points de vue |
| `analyzeFullText` | activé | Analyse le texte intégral du chapitre affiché (pronoms), plus fiable que les tags/résumé seuls |
| `showDetailPanel` | activé | Affiche un panneau sur la page d'une œuvre : verdict global + détail chapitre par chapitre |
| `autoApplyPreferredFilter` | désactivé | Masque automatiquement les fics hors de tes points de vue préférés |
| `preferredPovs` | (vide) | Tes points de vue préférés, séparés par des virgules ("first,third") |

## Fichiers

### 1. `_povTracker.js` — le chef d'orchestre

- Met en route les autres fichiers et partage les réglages avec eux
- Expose `W.AO3H_PovTracker` comme API pour les autres fichiers du module
- Clés de stockage : `ao3h:mod:povTracker:settings` (réglages utilisateur) et `ao3h_pov_tracker_data_v1` (cache d'analyse par fic)

### 2. `povAnalysis.js` — détection du point de vue

- Analyse les tags et le résumé d'une fic pour deviner son point de vue (utilisé sur les listes)
- Garde en mémoire, par fic, les analyses de texte intégral faites chapitre par chapitre (`recordChapterAnalysis`) au fur et à mesure de la lecture
- Calcule un verdict combiné (`getCombinedResult`) : utilise les analyses de texte intégral quand elles existent (plus fiables), sinon retombe sur le résultat tags/résumé ; détecte "multi" quand les chapitres lus ne s'accordent pas
- Garde le résultat en mémoire pendant 7 jours, pour ne pas refaire l'analyse à chaque fois

### Analyse du texte intégral — intégrée à `_povTracker.js`

- Compte les pronoms de 1ère/2e/3e personne dans un texte
- Classe le résultat (dominante nette, faible, ou "mixed" si deux personnes sont fortement représentées)
- Refuse de conclure si le texte est trop court (`MIN_ANALYZABLE_CHARS`) ou sans aucun pronom détecté

### Préférences utilisateur — intégrées à `_povTracker.js`

- Découpe le réglage `preferredPovs` ("first,third") en liste de clés valides

### 5. `povDetailPanel.js` — panneau sur la page d'une œuvre

- Analyse le texte du chapitre actuellement affiché et l'enregistre via `povAnalysis`
- Affiche un panneau : verdict global, cohérence entre les chapitres déjà lus (avec avertissement si le point de vue change), et la liste des chapitres analysés

### 6. `povPresentation.js` — badges et filtres

- Affiche un badge coloré sur chaque fic d'une liste, selon son point de vue (badge inséré dans le titre de la fiche, seulement pour les fics déjà présentes dans le cache d'analyse)
- Ajoute une barre de filtres cliquables pour cacher ou montrer les fics selon leur point de vue
- Peut afficher un petit résumé de la répartition des points de vue rencontrés
- Applique automatiquement un filtre sur les points de vue préférés si `autoApplyPreferredFilter` est activé

### 7. `povTracker.css`

- Les styles visuels des badges, de la barre de filtres, de la barre de statistiques et du panneau détaillé

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, avec leur statut :

- ~~Deviner le point de vue en lisant vraiment le texte de l'histoire (en comptant des mots comme "je", "tu", "il/elle") — en ce moment, ça regarde seulement les tags et le résumé, pas le texte réel de la fic~~ ✅ Fait
  Réglage `analyzeFullText` : compte les pronoms 1ère/2e/3e personne dans le
  texte du chapitre affiché (`_povTracker.js`), plus fiable que les tags
  et le résumé. N'analyse que les chapitres réellement ouverts (pas de
  pré-chargement des autres chapitres).
- ~~Suivre le point de vue chapitre par chapitre à l'intérieur d'une même fic~~ ✅ Fait (partiellement)
  Chaque chapitre visité est analysé et mémorisé séparément
  (`recordChapterAnalysis`). Limite assumée : seuls les chapitres que
  l'utilisateur ouvre réellement sont suivis, pas l'ensemble de la fic d'un
  coup (éviterait des requêtes réseau supplémentaires par chapitre).
- ~~Un panneau sur la page de la fic qui montre un résumé global et une liste chapitre par chapitre du point de vue~~ ✅ Fait
  Réglage `showDetailPanel` (`povDetailPanel.js`) : verdict global + liste
  des chapitres déjà analysés, affichée dès que plus d'un chapitre a été lu.
- ~~Vérifier qu'il y a assez de texte avant de se lancer dans une analyse~~ ✅ Fait
  `MIN_ANALYZABLE_CHARS` (200 caractères) dans `_povTracker.js` : en
  dessous, ou sans aucun pronom détecté, l'analyse retourne "pas de verdict"
  plutôt qu'un résultat peu fiable.
- ~~Prévenir quand le point de vue change en cours de route dans une fic~~ ✅ Fait
  Le panneau détaillé affiche "⚠️ POV change detected across chapters read"
  dès que deux chapitres analysés divergent.
- ~~Vérifier si le point de vue reste cohérent du début à la fin~~ ✅ Fait (partiellement)
  Le panneau affiche "Consistent across N chapters read" quand tous les
  chapitres analysés jusqu'ici concordent — seulement sur les chapitres
  déjà lus, pas une vérification de la fic entière d'un coup.
- ~~Enregistrer sa préférence de point de vue une bonne fois pour toutes, et filtrer automatiquement selon elle~~ ✅ Fait
  Réglages `preferredPovs` + `autoApplyPreferredFilter` : masque
  automatiquement les fics dont le point de vue détecté n'est pas dans la
  liste préférée, sans avoir à recliquer les filtres à chaque page.
- ~~Deviner le style d'écriture habituel d'un auteur selon les points de vue qu'il utilise~~ ❌ Écarté
  Nécessiterait de télécharger et analyser toutes les œuvres d'un auteur
  (requêtes réseau supplémentaires, fiabilité incertaine) pour un bénéfice
  marginal par rapport à l'analyse par fic déjà en place.
- ~~Recommander des fics selon le point de vue préféré~~ ❌ Écarté
  Couvert autrement : le filtre automatique sur les POV préférés (ci-dessus)
  répond déjà au besoin pratique. Un vrai moteur de recommandation a été
  explicitement écarté à l'échelle du projet (voir "Recommendation Engine"
  dans `docs/never-built-modules.md`).
- ~~Mieux repérer les fics qui mélangent plusieurs points de vue en même temps~~ ✅ Fait
  Le verdict combiné (`getCombinedResult`) classe une fic "multi" dès que
  ses chapitres analysés en texte intégral divergent, même si la fic n'est
  pas explicitement taguée comme multi-POV — plus fiable que la détection
  par tags seule.
