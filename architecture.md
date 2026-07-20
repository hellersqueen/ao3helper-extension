# Architecture des modules

Un dossier de module contient un coordinateur (`_<module>.js`, ou
`<module>.js` lorsque le module tient dans un seul fichier) et, seulement si
nécessaire, de véritables sous-modules fonctionnels. Le découpage doit suivre
les responsabilités et les dépendances réelles, pas la taille des fichiers.

## Vocabulaire

- **Module parent** : fonctionnalité visible et configurable d'AO3 Helper.
- **Coordinateur** : point d'entrée du module parent; il charge les réglages,
  assemble les dépendances, démarre les fonctionnalités et assure le nettoyage.
- **Sous-module fonctionnel** : unité cohérente du module parent possédant un
  comportement réel et une API ou un cycle de vie clairement délimité.
- **Service interne** : store, moteur ou composant fondamental utilisé par
  plusieurs sous-modules du même parent.
- **Bibliothèque partagée** : logique générale utilisée par plusieurs modules
  parents et placée sous `lib/`.

## Ordre d'analyse obligatoire

Avant de déplacer ou de fusionner un fichier, déterminer dans cet ordre :

1. Qui l'utilise réellement : le coordinateur, un seul sous-module, plusieurs
   sous-modules du même parent ou plusieurs modules parents?
2. Quelle responsabilité il possède : comportement utilisateur, stockage,
   moteur, rendu, calcul pur, constantes, adaptation ou simple délégation?
3. Peut-il fonctionner et être testé comme une unité cohérente avec une API
   explicite, sans connaître les détails internes d'un fichier frère?
4. Possède-t-il un état ou des ressources à nettoyer : écouteurs, timers,
   observers, requêtes, éléments DOM ou API publique?
5. Sa séparation réduit-elle réellement le couplage, ou ajoute-t-elle seulement
   des imports, des proxies et une couche d'indirection?

## Règles de placement

1. **Conserver un sous-module séparé** lorsqu'il porte une responsabilité
   fonctionnelle cohérente qui peut être initialisée, utilisée, nettoyée et
   testée comme une unité. Un sous-module peut dépendre d'une API injectée,
   mais il ne doit pas connaître les détails internes de ses fichiers frères.

2. **Intégrer au coordinateur** les calculs, constantes, règles, adaptateurs et
   fonctions d'orchestration qui ne servent qu'au module parent. Un fichier
   `*Helpers.js`, `*Utils.js`, `*Math.js`, `*Rules.js` ou `*Shared.js` n'est pas
   justifié par son nom : sa responsabilité réelle décide de son emplacement.

3. **Fusionner avec le sous-module principalement aidé** lorsqu'un fichier ne
   sert qu'un seul sous-module et complète directement son comportement. Cela
   s'applique notamment aux couches de présentation, de synchronisation ou de
   stockage qui n'ont aucune utilité sans ce sous-module.

4. **Consolider plusieurs faux sous-modules** lorsqu'ils représentent des
   fragments du même comportement et partagent le même état, le même stockage,
   le même cycle de vie ou les mêmes éléments DOM. Le résultat doit former une
   unité fonctionnelle plus claire, pas un fichier générique surchargé.

5. **Supprimer un fichier** lorsqu'il est vide, mort, entièrement remplacé par
   le CSS, composé uniquement de méthodes vides, ou réduit à relayer les appels
   d'un autre objet sans ajouter de politique, d'état ou de cycle de vie.

6. **Garder dans le coordinateur et injecter** une logique utilisée par
   plusieurs sous-modules du même parent. Plusieurs consommateurs dans un même
   dossier ne transforment pas cette logique en utilitaire global.

7. **Conserver un service interne séparé** lorsqu'un store, moteur ou composant
   fondamental représente lui-même une unité cohérente avec un contrat clair.
   Il peut aider plusieurs sous-modules sans être une fonctionnalité visible.
   `laterShelfStore.js` est un exemple de service interne légitime.

8. **Déplacer vers `lib/utils/`** une logique générale réellement utilisée par
   plusieurs modules parents. Le fichier doit être spécialisé et clairement
   nommé; ne jamais créer un grand `helpers.js` ou `utils.js` sans responsabilité
   précise.

9. **Choisir la bibliothèque spécialisée appropriée** lorsque la logique
   partagée n'est pas un utilitaire général : `lib/ao3/` pour les routes,
   parseurs et actions AO3, `lib/storage/` pour la persistance et les migrations,
   et `lib/ui/` pour les composants d'interface réutilisables.

10. **Créer un nouveau sous-module** seulement lorsqu'une partie du coordinateur
    est devenue une fonctionnalité autonome avec un contrat, un cycle de vie ou
    des tests propres. La longueur du coordinateur ne suffit pas à justifier
    l'extraction.

11. **Scinder un sous-module devenu trop large** seulement s'il contient
    plusieurs responsabilités autonomes. La séparation doit rester utile même
    si les fichiers sont renommés; un découpage purement technique ou par nombre
    de lignes n'est pas une architecture.

12. **Créer un module enfant enregistré avec `parent`** lorsqu'une fonctionnalité
    peut être activée et nettoyée indépendamment et mérite son propre réglage.
    Une simple fonction interne ne doit pas devenir un module enfant.

13. **Préférer le CSS ou la configuration déclarative** lorsqu'aucun état ou
    comportement JavaScript n'est nécessaire. Ne pas conserver un adaptateur
    JavaScript vide uniquement pour représenter conceptuellement une option CSS.

14. **Réduire à un module monofichier** lorsqu'aucun véritable sous-module ne
    reste. Dans ce cas, le point d'entrée peut devenir `<module>.js` au lieu de
    conserver artificiellement un coordinateur préfixé par `_`.

15. **Ne rien modifier** lorsqu'un petit fichier possède malgré tout une vraie
    responsabilité autonome. La petite taille, le nombre limité d'exports ou
    l'absence d'interface visible ne sont pas des raisons suffisantes pour le
    fusionner.

## Critères d'autonomie d'un sous-module

Un fichier mérite généralement de rester séparé lorsqu'il remplit plusieurs
des critères suivants :

- il expose une API cohérente orientée vers une responsabilité précise;
- il possède son propre état ou ses propres ressources;
- il peut être testé sans instancier tout le module parent;
- il peut être remplacé par une autre implémentation derrière le même contrat;
- il assure lui-même son initialisation et son nettoyage;
- il apporte un comportement utilisateur ou métier identifiable;
- ses dépendances sont injectées ou proviennent de bibliothèques partagées,
  plutôt que d'importer les détails internes d'un fichier frère.

À l'inverse, un fichier ne constitue généralement pas un sous-module lorsqu'il :

- ne contient que des fonctions pures propres au parent;
- répète la configuration, le stockage ou les constantes du coordinateur;
- appelle presque exclusivement les méthodes d'un fichier frère;
- ne peut rien faire sans recevoir l'instance concrète d'un fichier frère;
- partage exactement le même état et le même nettoyage qu'un autre fichier;
- ajoute une classe autour de quelques fonctions sans fournir de contrat utile;
- existe uniquement pour diminuer artificiellement le nombre de lignes du
  coordinateur.

## Dépendances et cycle de vie

- Le coordinateur crée les sous-modules et leur injecte les dépendances propres
  au module. Les sous-modules ne doivent pas recréer chacun leur propre version
  des mêmes helpers ou réglages.
- Éviter les imports circulaires entre coordinateur et sous-modules. Si des
  fonctions du coordinateur doivent être utilisées, les injecter explicitement.
- Éviter les imports directs entre fichiers frères lorsque la dépendance ne
  représente pas un service interne stable. Une dépendance exclusive indique
  souvent que les deux fichiers doivent être consolidés.
- Chaque propriétaire d'un écouteur, timer, observer, contrôleur de requête ou
  élément DOM doit également posséder son nettoyage.
- Une ressource partagée doit avoir un propriétaire unique afin d'éviter les
  doubles initialisations et les nettoyages concurrents.
- Un sous-module enregistré avec `parent` doit pouvoir être activé, désactivé et
  nettoyé sans laisser le module parent dans un état incohérent.

## Stockage et API

- Le fichier qui définit le format d'une donnée persistée doit en être le
  propriétaire explicite. Plusieurs fichiers ne doivent pas réimplémenter la
  sérialisation de la même clé.
- Une fusion ne doit pas changer silencieusement les clés, les formats ou les
  valeurs par défaut. Toute modification de format exige une migration.
- Les API publiques `AO3H.<module>` restent la responsabilité du coordinateur,
  même lorsqu'elles délèguent à un sous-module.
- Fusionner un fichier ne doit pas exposer inutilement ses détails internes ni
  supprimer une API utilisée par un autre module sans migration coordonnée.

## Règles de décision rapides

- Utilisé par un seul sous-module → fusionner avec ce sous-module.
- Utilisé par plusieurs sous-modules du même parent → coordinateur avec
  injection, sauf véritable store ou moteur autonome.
- Utilisé par plusieurs modules parents → bibliothèque spécialisée sous `lib/`.
- Vide, no-op, proxy pur ou remplacé par le CSS → supprimer.
- Même état et même cycle de vie qu'un fichier frère → consolider.
- Fonctionnalité autonome et éventuellement activable → conserver ou créer un
  sous-module.
- Aucune option clairement meilleure → conserver le découpage et documenter la
  décision plutôt que fusionner par défaut.

## Vérifications après une modification structurelle

1. Mettre à jour tous les imports, tests, commentaires d'en-tête et fichiers
   `.md` qui mentionnent les anciens fichiers.
2. Rechercher globalement les anciens noms pour éliminer les références mortes.
3. Vérifier que chaque ressource possède toujours un nettoyage unique.
4. Exécuter les tests du module, puis la suite complète et le build selon le
   risque de la modification.
5. Renommer les tests lorsque leur nom décrit un ancien fichier supprimé; ils
   peuvent importer et tester les exports du coordinateur.
6. Ne pas déplacer vers `lib/` une logique qui n'a qu'un seul module parent
   consommateur après la modification.

## Exemples actuels

- La logique pure de `ficAppreciation` vit dans `_ficAppreciation.js`, tandis
  que `KudosTracker` reste un sous-module complet. Les anciennes couches
  d'affichage et de synchronisation ont été fusionnées avec le tracker parce
  qu'elles n'avaient aucune autonomie sans lui.
- La détection des tags de bruit vit dans `lib/utils/noise-tags.js`, car
  `tagsDisplay` et `hideByTags` l'utilisent tous les deux.
- La révélation au survol de `visualPreferences` reste directement dans la
  feuille CSS, sans adaptateur JavaScript vide.
- Les stores et moteurs cohérents peuvent rester séparés même s'ils ne sont pas
  visibles directement, à condition de posséder un contrat fonctionnel clair.

## Enregistrement et cycle de vie

Cette règle de placement des fichiers est indépendante de l'activation à
l'exécution. Un module (et un sous-module qui a besoin de sa propre case à
cocher dans le panneau) s'enregistre via `register(id, meta, init)` dans
[`src/core/lifecycle.js`](src/core/lifecycle.js). Un sous-module togglable
séparément déclare `meta.parent: '<idDuCoordinateur>'` : il ne démarre que si
son parent est déjà actif, et s'arrête automatiquement quand celui-ci
s'arrête (cascade gérée par `lifecycle.js`). Ce mécanisme est optionnel — un
sous-module comme `KudosTracker` n'a pas de case à cocher séparée, il est
simplement instancié par son coordinateur.

Le coordinateur expose en général une API partagée sur `window`
(`W.AO3H_<Module>`), avec la config commune (`cfg()`) et les fonctions
utilitaires du module. C'est par cette API — jamais par import direct d'un
fichier d'un autre module — que les sous-modules et les autres modules du
projet accèdent à ses données (dépendance douce : rien ne casse si le module
est désactivé).
