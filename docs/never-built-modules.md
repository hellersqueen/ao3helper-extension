# Modules jamais construits

Ce fichier regroupe les specs de concepts de modules qui ont été imaginés,
documentés en détail, puis **jamais codés** — ou codés puis supprimés — et
dont on a vérifié qu'ils n'ont pas de trace ailleurs dans le code actuel
(recherché par mots-clés dans tout `src/modules`, pas seulement dans les
docs). Aucun de ces concepts n'existe sous un autre nom.

---

## collectionBrowser

**Autres noms :** collectionExplorer, collectionManager, collectionViewer

Un module prévu pour naviguer, chercher et découvrir les collections AO3
directement depuis l'extension, sans passer par les pages natives d'AO3.

**Ce qu'il aurait fait :**
- Une liste des collections avec recherche (par nom, fandom, type : ouverte / modérée / fermée)
- Un aperçu des œuvres d'une collection sans avoir à l'ouvrir
- Un bouton pour ajouter rapidement une œuvre à une collection depuis sa page
- S'abonner à une collection pour être prévenu des nouvelles œuvres
- Des statistiques sur les collections (nombre d'œuvres, activité)

**Pourquoi jamais construit :** les pages AO3 `/collections` font déjà tout ça.
L'extension n'aurait rien apporté de plus, pour un coût de maintenance élevé
(il aurait fallu suivre les changements des pages AO3 en continu). Usage estimé
à moins de 5%.

---

## fandomCleaner

Un concept pour nettoyer et normaliser l'affichage des noms de fandoms dans
les listings — regrouper les variantes d'un même fandom, enlever les doublons.

**Ce qu'il aurait fait :**
- Reconnaître que "Harry Potter" et "Harry Potter - J. K. Rowling" désignent le même fandom
- Regrouper les noms alternatifs d'un fandom
- Un affichage standardisé et nettoyé des noms de fandoms

**Pourquoi jamais construit :** l'idée n'a jamais dépassé le stade du simple
concept — pas de spec détaillée, pas de décision de suppression, juste une
ligne dans une liste d'idées jamais reprises nulle part ailleurs.

---

## ficComparison

Un module de comparaison côte-à-côte de plusieurs fics à la fois (stats,
tags, chevauchements).

**Ce qu'il aurait fait :**
- Un bouton "⚖️ Compare" sur chaque fic dans les listings (jusqu'à 3 fics à la fois)
- Un panneau flottant listant les fics sélectionnées
- Un tableau comparatif : nombre de mots, chapitres, kudos, hits, favoris, statut, dates, rating
- Comparer les tags en commun et les tags uniques entre les fics
- Sauvegarder des groupes de comparaison nommés, et les réutiliser plus tard
- Exporter la comparaison en CSV ou JSON
- Idées jamais poussées plus loin : petits graphiques, diagramme de Venn des tags partagés, mode "comparer une série entière"

**Pourquoi jamais construit :** ça faisait doublon avec le module qui deviendra
`workLength` (comparaison de longueur). Une interface de comparaison complète
pour une action qu'on fait rarement (moins d'une fois par mois) ne justifiait
pas la complexité. Supprimé avant même la grande vague de nettoyage des modules.

---

## qualityScore / workStats

**Autres noms :** ficQuality, kudosHitRatio, qualityMetrics, engagementScore, workQualityAlgorithm

Un système de notation automatique de la "qualité" d'une fic, calculé à partir
de ses statistiques (kudos, hits, favoris, commentaires).

**Ce qu'il aurait fait :**
- Un score composite : kudos/hits (40%) + favoris/kudos (30%) + commentaires/kudos (20%) + statut terminé (10%)
- Une note en lettre façon bulletin scolaire : S (90-100), A (80-89), B (70-79), C (60-69), D (moins de 60)
- Un seuil minimum de données requises (10 hits, 3 kudos) avant de calculer un score, sinon affichage "?"
- Un badge de note sur chaque fic, dans les listings et sur sa page
- Trier les résultats de recherche par score de qualité
- Filtrer pour ne garder que les fics au-dessus d'un certain score

**Pourquoi supprimé :** ces statistiques ne mesurent pas vraiment la qualité
d'écriture — elles avantagent mécaniquement les tropes populaires, pénalisent
les couples rares, et favorisent les vieilles fics qui ont eu le temps
d'accumuler des kudos. Rendre un tel score visible risquait aussi de pousser
les auteur·ices à écrire pour la métrique plutôt que pour l'histoire.

**Différence avec `ficEngagement` (module actif) :** `ficEngagement` calcule
aussi un ratio kudos/hits, mais pour repérer des "pépites cachées" sous-cotées
— pas pour juger la qualité d'une œuvre. La philosophie est opposée : aider à
découvrir, pas à noter.

---

## ratingSystem

**Autres noms :** qualityRatingOverride, intensityMeter

Un module en deux parties : remplacer l'affichage des ratings natifs AO3, et
ajouter des jauges de "niveau d'intensité" du contenu.

**Ce qu'il aurait fait :**
- Remplacer G/T/M/E par ses propres icônes ou textes, ou fusionner des ratings ensemble
- Une jauge 🌶️ de niveau "épicé" pour le contenu NSFW (Mild/Moderate/Spicy/Extra Spicy)
- Une jauge 🩸 de niveau de violence (Mild/Moderate/Severe/Graphic)
- Une jauge 💔 de niveau d'angoisse/tristesse (Light/Moderate/Heavy/Devastating)
- Ces niveaux auraient été devinés automatiquement à partir des tags de la fic

**Pourquoi supprimé :** deviner "à quel point c'est intense" à partir des tags
n'est pas fiable — par exemple "Angst with a Happy Ending" aurait pu être
mal classé comme "angoisse sévère". Remplacer les ratings choisis par les
auteur·ices posait aussi un problème de respect de leur choix. Usage estimé à
moins de 10%.

**Différence avec `starRatings` (module actif, dans `ficAppreciation`) :**
`starRatings` est une note personnelle et privée que le lecteur se donne à
lui-même (1 à 5 étoiles, comme sur Netflix) — pas un remplacement des ratings
publics d'AO3.

---

## storyMarks

Un concept de surlignage et d'annotation de passages pendant la lecture,
directement dans le texte d'une fic.

**Ce qu'il aurait fait :**
- Surligner un passage dans le texte d'une œuvre
- Laisser une note personnelle attachée à ce passage
- Marquer certains chapitres comme favoris

**Pourquoi jamais construit :** resté au stade d'idée dans une liste, jamais
transformé en spec détaillée ni en code, et jamais absorbé par un autre
module (les notes de `bookmarkVault` s'attachent à une œuvre entière, pas à
un passage précis).

---

## tagIdDisplay

**Anciens noms de sous-modules :** tagIdFormatting, dataOperations

Un petit outil pour afficher les identifiants numériques internes d'AO3 pour
chaque tag (utiles pour appeler l'API AO3 ou écrire des scripts).

**Ce qu'il aurait fait :**
- Afficher l'ID numérique d'un tag dans l'interface
- Copier cet ID pour un usage API/scripting

**Pourquoi jamais construit :** ça ne concerne que les développeurs qui
construisent leurs propres outils autour de l'API AO3 — complètement hors
sujet pour les lecteurs normaux, le public de cette extension.

---

## updateLikelihood

**Autres noms :** deadFicRisk, completionPredictor, abandonmentRisk, updateViability, deadFicIndicator

Un module qui aurait tenté de prédire si une fic en cours (WIP) a des chances
d'être terminée un jour ou non.

**Ce qu'il aurait fait :**
- Calculer le taux de fics terminées par un·e auteur·ice dans le passé
- Regarder depuis combien de temps une fic n'a pas été mise à jour
- Un score de probabilité que la fic soit terminée un jour
- Un badge d'avertissement "probablement abandonnée"
- Deviner si un·e auteur·ice publie à un rythme régulier ou non, et prédire quand viendrait le prochain chapitre

**Pourquoi jamais construit :** juger publiquement qu'une fic est "probablement
morte" est injuste envers l'auteur·ice — la vie fait que des gens reviennent
écrire après des années d'arrêt. Le risque de décourager les lecteurs d'essayer
des fics en cours, et de faire du mal aux auteur·ices, l'a emporté sur
l'intérêt de la fonctionnalité.

---

## visibilityController

*(Ce n'est pas vraiment un module — plutôt un projet de fusion qui a été
explicitement rejeté avant même d'être commencé.)*

L'idée : regrouper `hideByTags`, `hideDates`, `hideWordCount` et `skipWorks`
sous un seul panneau de contrôle centralisé pour tout ce qui masque du
contenu.

**Pourquoi rejeté :** ces modules sont trop différents dans leur
fonctionnement pour être unifiés sans créer un "super-module" difficile à
maintenir :
- `hideByTags` travaille sur des listes de tags
- `skipWorks` travaille sur des critères combinés (rating, mots, statut)
- `hideDates` / `hideWordCount` (aujourd'hui dans `visualPreferences`) travaillent sur l'affichage, pas sur le masquage d'œuvres

Chaque module a été gardé séparé, et c'est toujours le cas aujourd'hui.

---

## welcomeGuide

Un système d'accueil/tutoriel pour les nouveaux·elles utilisateur·ices de
l'extension.

**Ce qu'il aurait fait :** guider pas-à-pas une personne qui découvre
l'extension pour la première fois, présenter les modules disponibles.

**Pourquoi jamais construit :** jamais dépassé le stade de l'idée, aucune
spec détaillée, aucun code, aucun autre module ne couvre ce besoin.

---

## debugMode

Des outils de débogage et de diagnostic pour développeur·ses.

**Ce qu'il aurait fait :** afficher des informations techniques internes
(état des modules, erreurs, logs) pour aider à diagnostiquer des problèmes.

**Pourquoi jamais construit :** destiné aux développeur·ses de l'extension
elle-même, pas aux lecteur·ices — hors du public cible, jamais formalisé.

---

## globalToolsHub

Un panneau centralisé qui rassemblerait tous les outils/utilitaires de
l'extension au même endroit.

**Ce qu'il aurait fait :** un point d'accès unique à toutes les
fonctionnalités transversales de l'extension.

**Pourquoi jamais construit :** concept resté à l'état d'idée vague, jamais
formalisé en spec ni en code — et en partie redondant avec le panneau de
réglages qui existe déjà.

---

## accessibility / accessibilityOptions

Un module transversal dédié à l'accessibilité : haut contraste, navigation
au clavier, compatibilité avec les lecteurs d'écran.

**Ce qu'il aurait fait :**
- Un mode haut contraste
- Une navigation au clavier complète sur les listes et les blurbs
- Des labels pour les lecteurs d'écran sur les éléments ajoutés dynamiquement par l'extension

**Pourquoi jamais construit :** l'idée d'un module séparé a été abandonnée
au profit d'une accessibilité traitée directement dans chaque module
concerné, plutôt qu'en un seul endroit à part.

---

## Performance Manager

Un concept d'outils de surveillance de la performance de l'extension
elle-même.

**Ce qu'il aurait fait :** rester flou — aucune spec détaillée n'a jamais
été écrite, seulement un nom d'idée.

**Pourquoi jamais construit :** jamais dépassé le stade du nom, aucune
spec, aucun code, aucune trace ailleurs.

---

## Developer Tools

Un ensemble d'outils de développement/débogage pour l'extension elle-même,
distinct de `debugMode` et de l'outil interne `updateLog`.

**Ce qu'il aurait fait :** rester flou — aucune spec détaillée n'a jamais
été écrite, seulement un nom d'idée.

**Pourquoi jamais construit :** jamais dépassé le stade du nom, aucune
spec, aucun code, aucune trace ailleurs.

---

## Version Manager

L'équivalent, côté utilisateur·ice, de l'outil interne `updateLog` (qui,
lui, existe mais est réservé aux développeur·ses de l'extension).

**Ce qu'il aurait fait :** montrer aux utilisateur·ices l'historique des
versions de l'extension et ce qui a changé.

**Pourquoi jamais construit :** jamais dépassé le stade de l'idée, aucune
spec détaillée, aucun code.

---

## Subscription Manager

Un module de gestion centralisée des abonnements/suivis d'œuvres et de
séries.

**Ce qu'il aurait fait :** rester flou — aucune spec détaillée n'a jamais
été écrite.

**Pourquoi jamais construit :** jamais dépassé le stade de l'idée. Ses
besoins sont aujourd'hui partiellement couverts par [[later-shelf]]
(rappels) et par `notificationCenter` (notifications), sans qu'aucun des
deux ne soit un vrai "gestionnaire d'abonnements" centralisé.

---

## Duplicate Finder

Un outil de détection des œuvres en double (republiées, crossposts, etc.).

**Ce qu'il aurait fait :** rester flou — aucune spec détaillée n'a jamais
été écrite, seulement un nom d'idée.

**Pourquoi jamais construit :** jamais dépassé le stade du nom, aucune
spec, aucun code, aucune trace ailleurs.

---

## Recommendation Engine

Un vrai moteur de recommandation complet pour suggérer des œuvres
similaires, avec de nombreuses options de configuration (environ 25
prévues à l'origine).

**Ce qu'il aurait fait :** analyser en profondeur les goûts de
l'utilisateur·ice pour proposer des suggestions personnalisées, bien
au-delà d'une simple similarité de tags.

**Pourquoi jamais construit :** rejeté explicitement comme "projet à part"
— beaucoup trop ambitieux et complexe pour rester un simple module
d'extension. Une version très simplifiée (similarité de tags seulement)
existe dans [[similar-fics]], sans le moteur de recommandation complet
initialement envisagé.

---

## Chapter Title Enhancement

Une idée pour rendre les titres de chapitres plus visibles/mis en valeur
sur les pages d'œuvre.

**Ce qu'il aurait fait :** rester flou — jamais accompagné d'une spec
détaillée, seulement listé comme idée pour la lecture.

**Pourquoi jamais construit :** jamais dépassé le stade du nom, aucune
spec, aucun code, aucune trace ailleurs.
