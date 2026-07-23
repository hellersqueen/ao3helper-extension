# Plan de test manuel d'AO3 Helper
   Ce guide sert à vérifier AO3 Helper directement sur le véritable site AO3, comme une utilisatrice ordinaire. Il ne demande ni code, ni console, ni outil de développement. Les pages de `ao3-mock` ne sont jamais utilisées.

## Règles du test
   1. Utiliser le même navigateur et le même profil pendant toute la campagne.
   2. Se connecter à AO3 pour les fonctions liées au compte.
   3. Tester les modules dans l'ordre de ce document. Cet ordre crée progressivement les données utiles aux tableaux de bord.
   4. Au début de chaque module, désactiver tous les autres modules, sauf ceux indiqués dans « À laisser actif ».
   5. Après une modification de réglage, fermer le panneau AO3 Helper et recharger la page si le résultat n'apparaît pas immédiatement.
   6. Ne pas considérer comme un échec l'absence d'une situation particulière. **Noter « Bloqué : page adaptée introuvable » et conserver l'adresse de la page recherchée.**
   7. **Ne jamais donner un kudos, publier un commentaire, créer un bookmark ou s'abonner uniquement pour un test si l'action n'est pas souhaitée sur le compte. Plusieurs de ces actions sont publiques ou irréversibles.**

## Préparation générale
   1. Installer la version à tester dans Tampermonkey.

      *Si la version à tester est un build local (pas encore publié) :*
      1. Lancer `npm run serve:dist` dans un terminal et le laisser actif pendant toute la campagne de test.
      2. Construire avec `npm run build:local` (et non `npm run build` seul) : cette commande intègre directement l'adresse du serveur local dans le script, sans dépendre de la configuration de Tampermonkey.
      3. Dans Tampermonkey, tableau de bord → **Utilitaires** → **Importer depuis une URL**, avec `http://127.0.0.1:5195/ao3-helper.user.js`. Installer depuis cette URL (pas en collant le contenu du fichier) : Tampermonkey pourra alors vérifier les mises à jour lui-même.
      4. Après chaque nouveau `npm run build:local`, aller dans Tampermonkey sur le script AO3 Helper et cliquer **Vérifier les mises à jour du script** avant de recharger la page AO3. Sans cette étape, le script installé peut rester une version plus ancienne pendant que le serveur local sert des fichiers plus récents, ce qui casse le chargement des modules.
   2. Ouvrir <https://archiveofourown.org/> et vérifier que le panneau AO3 Helper s'ouvre.
   3. Dans le panneau, noter le numéro de version s'il est affiché.
   4. Désactiver tous les modules.
   5. Choisir et conserver dans les favoris du navigateur :
      - une liste de résultats comportant plusieurs pages ;
      - une œuvre terminée en un chapitre ;
      - une œuvre de plusieurs chapitres ;
      - une œuvre avec notes d'auteur et, si possible, notes de fin ;
      - une œuvre appartenant à une série ;
      - une œuvre avec plusieurs commentaires.
   6. Pour éviter de modifier des données importantes, utiliser de préférence des œuvres que l'on souhaite réellement lire, enregistrer ou commenter.

## Comment noter un résultat
   * Pour chaque module, cocher une seule conclusion :
      - [ ] Conforme : tout ce qui a été testé fonctionne.
      - [ ] Partiel : certaines vérifications fonctionnent et d'autres non.
      - [ ] Non conforme : le comportement principal ne fonctionne pas.
      - [ ] Bloqué : la page ou la donnée nécessaire n'a pas été trouvée.

Dans « Notes », écrire ce qui s'est réellement passé, l'adresse de la page, le réglage choisi et l'amélioration souhaitée. Ajouter le nom d'une capture d'écran si disponible.



═══════════════════════════════════════════════════════════════════════════



# PHASE 1 - FONDATIONS ET NAVIGATION


   ## 1. Visual Preferences
   **But :** vérifier les changements généraux d'affichage avant de tester les autres modules.
   **Préparation :** ouvrir une liste de résultats, puis une œuvre de plusieurs chapitres. Activer uniquement **Visual Preferences**.
---

   ### Étapes

   1. Sur la liste, activer séparément le masquage des mots, kudos, commentaires, bookmarks et hits. Après chaque case, vérifier que seule la statistique choisie disparaît, puis la réafficher. [ ]
   
   2. Faire la même chose pour les dates de publication, mise à jour et fin. Sur une œuvre multi-chapitres, vérifier aussi le masquage des dates de chapitres et des statistiques dans la liste des chapitres. [ ]
   
   3. Activer **Minimal Header** : l'en-tête AO3 doit devenir plus compact sans faire disparaître les liens essentiels. [ ]
   
   4. Activer **Stats as Icons**, puis essayer « icônes seules » et « icônes avec légende ». Les nombres doivent rester compréhensibles. [ ]
   
   5. Activer **Relative Dates**, puis **Date Age Coloring**. Les textes et couleurs doivent changer selon l'ancienneté sans rendre les dates illisibles. [ ]

   6. Tester les trois densités de liste : compacte, confortable et spacieuse. [ ]

   7. Activer **Grid View** : les œuvres doivent devenir des cartes. Désactiver l'option et vérifier le retour à la liste. [ ]
   
   8. Modifier l'ordre des sections d'une œuvre dans les résultats (en-tête, tags, résumé, statistiques). Vérifier l'ordre après rechargement. [ ]
   
   9. Sur une œuvre, activer **Word Occurrence Counter**, saisir un mot réellement présent et vérifier que le nombre change avec un autre mot. [ ]
   
   10. Désactiver le module et recharger : l'affichage AO3 normal doit revenir. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes, problème ou changement souhaité :** ................................................................................


===========================================================================


   ## 2. Main Navigation
   **Préparation :** être connectée et activer uniquement **Main Navigation**.
---

   ### Étapes

   1. Vérifier l'ajout des liens Bookmarks, Marked for Later et History, puis ouvrir chacun. [ ]

   2. Tester l'ouverture des menus au survol, puis au clic. Dans les deux modes, essayer les flèches du clavier. [ ]
   
   3. Depuis une liste avec des filtres, ouvrir une œuvre puis utiliser **Back to search**. La même liste et ses filtres doivent revenir. [ ]
   
   4. Activer le fil d'Ariane et visiter une liste, une œuvre et un chapitre. Les liens doivent correspondre au chemin courant. [ ]
   
   5. Activer les liens rapides. Créer deux liens avec un nom simple et une adresse AO3 valide, dont un nom commençant par un emoji. [ ]
   
   6. Ouvrir les deux liens, recharger AO3 et vérifier qu'ils sont conservés. [ ]
   
   7. Activer le regroupement sous **Quick Links**, puis le désactiver. Les liens doivent passer du menu déroulant à la barre sans être perdus. [ ]
   
   8. Essayer la recherche Fandom/Pairing du panneau et vérifier qu'elle remplit le premier emplacement libre. [ ]
   
   9. Supprimer les liens de test, désactiver le module et vérifier le retour de la navigation normale. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 3. Keyboard Shortcuts
   **Attention :** les raccourcis Subscribe, Bookmark, Mark for Later et Kudos déclenchent des actions réelles. Ne les tester que sur une œuvre où ces actions sont voulues. Un kudos ne peut pas être retiré.
   **Préparation :** activer uniquement **Keyboard Shortcuts**. Utiliser une liste de plusieurs pages et une œuvre de plusieurs chapitres.
---

   ### Étapes

   1. Appuyer sur `?` : le guide doit s'ouvrir, être organisé par catégories et permettre une recherche. [ ]

   2. Appuyer sur `Ctrl+/`, rechercher une action et la lancer depuis la palette. [ ]

   3. Sur la liste, tester page précédente/suivante, première/dernière page et saut de cinq pages avec les raccourcis affichés dans le panneau. [ ]

   4. Sur l'œuvre, tester chapitre précédent et suivant. [ ]

   5. Sur une liste, tester **Surprise Me** seulement si le raccourci est disponible sans activer le module associé ; sinon noter « dépendance absente ». [ ]

   6. Modifier un raccourci sans risque, par exemple l'ouverture du guide. Recharger et vérifier la nouvelle combinaison. [ ]

   7. Donner volontairement la même combinaison à deux actions : un avertissement visible doit signaler le conflit. [ ] 

   8. Exporter les raccourcis, modifier une touche, puis importer le fichier et vérifier la restauration. [ ]

   9. Activer **Disable all shortcuts** et vérifier qu'aucun raccourci ne répond. Le désactiver et vérifier leur retour. [ ]

   10. Si souhaité seulement, tester Subscribe, Bookmark, Mark for Later et Kudos sur une œuvre appropriée. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 4. Series Helper
   **Préparation :** activer uniquement **Series Helper**. Ouvrir une œuvre appartenant à une série, la page de cette série et une liste contenant plusieurs parties d'une même série.
---

   ### Étapes

   1. Sur l'œuvre, vérifier la bannière de série, les boutons précédent/suivant et l'indication de progression. [ ]
   
   2. Sur la page de série, activer **Series Summary** et vérifier total de mots, temps estimé, parties indisponibles et bouton **Next unread**. [ ]
   
   3. Activer le regroupement des séries dans les résultats. Vérifier qu'un groupe peut être ouvert et replié. [ ]
   
   4. Essayer les seuils de repli automatique 3, 5 et 10 sur une liste adaptée ; un choix manuel doit rester prioritaire. [ ]
   
   5. Si une série de 20 œuvres ou plus est trouvée, activer **Epic Series Warning** et vérifier le badge. [ ]
   
   6. Si une liste de séries vides est trouvée, activer **Hide Empty Series** et vérifier leur disparition. [ ]
   
   7. Recharger les trois types de page et vérifier que la progression reste cohérente. [ ]
   
   8. Désactiver le module : badges, groupes et bannière doivent disparaître. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................



═══════════════════════════════════════════════════════════════════════════



# PHASE 2 - CONSULTATION DES LISTES D'OEUVRES


   ## 5. Work Length
   **Préparation :** activer uniquement **Work Length**. Garder une liste, une œuvre multi-chapitres et une page de série.
---

   ### Étapes

   1. Vérifier la catégorie de longueur. Modifier successivement les seuils Flash, Short, Novella et Epic afin de voir la catégorie changer. [ ]

   2. Activer l'équivalent en pages. Comparer les formats court et long, puis modifier le nombre de mots par page : le calcul doit changer. [ ]

   3. Vérifier l'estimation de lecture sur la page d'œuvre, par chapitre et sur les listes. Couper l'interrupteur principal : toutes les estimations doivent disparaître. [ ]

   4. Tester les vitesses lente, moyenne, rapide et personnalisée ; avec une valeur personnalisée très différente, le temps doit changer clairement. [ ]

   5. Faire défiler un chapitre et vérifier le temps restant.

   6. Activer **One sitting**, modifier son seuil et vérifier le badge sur une œuvre assez courte. [ ]

   7. Indiquer une heure de fin proche puis lointaine et vérifier le badge « finissable avant ». [ ]

   8. Activer la longueur moyenne par chapitre et vérifier le calcul sur une œuvre multi-chapitres. [ ]

   9. Sur une série, vérifier le total de mots. [ ]

   10. Activer le dégradé de longueur sur une liste variée. [ ]

   11. Ajouter un livre de comparaison sous la forme `Titre: 50000` et vérifier son utilisation sur une œuvre proche de cette longueur. [ ]

   12. Désactiver le module et vérifier la disparition de tous les ajouts. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 6. Tags Display
   **Préparation :** activer uniquement **Tags Display**. Utiliser une liste contenant beaucoup de tags et une œuvre avec un avertissement sensible.
---

   ### Étapes

   1. Tester les trois styles d'avertissement et l'arrêt complet des icônes compactes. Au survol d'une icône, le nom complet doit être lisible. [ ]

   2. Activer la confirmation des avertissements sensibles et ouvrir une œuvre concernée : une confirmation doit précéder l'ouverture. [ ]

   3. Activer le filtre des tags de bruit, puis tester « cacher » et « flouter ». Un tag flouté doit pouvoir être révélé seul. [ ]

   4. Ajouter un mot de bruit personnel, l'exporter, le supprimer, puis le réimporter. [ ]

   5. Activer le mode compact. Tester séparément avertissements, relations, personnages, tags libres et résumé ; une catégorie décochée doit rester ouverte. [ ]

   6. Tester le dépliage au survol, au défilement et avec `Alt+T`. [ ]

   7. Ajouter un tag favori par clic droit. Tester les palettes default, pastel, neon et classic, puis les styles fond, bordure, gras, italique et étoile. [ ]

   8. Ajouter une règle avec `*`, vérifier plusieurs correspondances, puis exporter et réimporter les règles. Vérifier la priorité si deux règles correspondent. [ ]

   9. Activer la remontée des tags surlignés : ils doivent passer en tête de leur catégorie. [ ]

   10. Limiter les tags visibles à 5, 10 puis 15 et utiliser le bouton d'affichage du reste. [ ]

   11. Cacher tour à tour chaque catégorie : avertissements, relations, personnages et tags libres. [ ]

   12. Remplacer la virgule par un autre séparateur et vérifier toute la liste. [ ] 

   13. Réordonner les tags à la souris, tester les tris alphabétique, importance et longueur, puis exporter/importer l'ordre d'une œuvre. [ ]

   14. Activer les liens Fanlore et TV Tropes et vérifier leur destination sans supposer que chaque site possède une page exacte. [ ]

   15. Depuis un tag surligné, tester **Search AO3**. Si le panneau propose une portée par auteur, créer une règle limitée à l'auteur courant et vérifier qu'elle ne s'applique pas ailleurs. [ ]

   16. Désactiver le module et vérifier le retour des tags AO3 normaux. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 7. Hide By Tags
   **Préparation :** activer uniquement **Hide By Tags**. Choisir sur une liste un tag fréquent, un tag exceptionnel et des mots présents dans un titre et un résumé.
---

   ### Étapes

   1. Ajouter le tag fréquent à la liste noire. Vérifier le repli, la raison affichée et le compteur de fics cachées. [ ]

   2. Tester le mode atténué, plusieurs opacités et le flou. Le survol doit permettre la lecture. [ ]

   3. Comparer la correspondance exacte et « contient ». Ajouter une combinaison `tag A + tag B` et vérifier qu'un seul des deux tags ne suffit pas. [ ]

   4. Ajouter le tag exceptionnel à la liste blanche. Tester l'affichage automatique, le maintien replié, le badge vert et « cacher quand même ». [ ]

   5. Ajouter un mot interdit et tester séparément résumé, notes et titre. Vérifier les modes caché et atténué. [ ]

   6. Tester « mot entier » avec un fragment présent à l'intérieur d'un mot plus long, puis essayer un joker `*` et une expression `/…/` simple. [ ]

   7. Utiliser l'icône rapide 🚫 sur un tag, puis `Shift+clic` pour un masquage jusqu'à la fin de la journée. [ ]

   8. Utiliser **Re-scan** et vérifier le recalcul du compteur. [ ]

   9. Tester **Clear All** après avoir exporté ou noté les entrées nécessaires. [ ]

   10. À laisser pour la phase d'interactions : protection Bookmark Vault et masquage des tags de bruit de Tags Display. [ ]

   11. Recharger, vérifier la persistance, puis désactiver le module et confirmer que les œuvres reviennent. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 8. Skip Works
   **Préparation :** activer uniquement **Skip Works** et ouvrir une liste.
---

   ### Étapes

   1. Changer le texte du bouton Hide et sa position, puis vérifier le résultat. [ ]

   2. Cacher une œuvre, choisir une raison rapide et ajouter une note. Recharger : le choix doit rester. [ ]

   3. Tester successivement les modes bloc, bannière, atténué, note seule et suppression complète. [ ]

   4. Tester le raccourci de clic avec confirmation désactivée puis activée. La confirmation ne doit concerner que le raccourci indiqué. [ ]

   5. Double-cliquer sur une œuvre cachée pour la réafficher immédiatement. [ ]

   6. Ajouter une note privée sans cacher l'œuvre. [ ]

   7. Dans le gestionnaire, rechercher l'œuvre par titre puis par auteur. [ ]

   8. Si la synchronisation entre appareils est disponible dans l'interface, vérifier qu'une entrée apparaît sur un second navigateur connecté au même compte ; sinon noter « non testable sur cet appareil ». [ ]

   9. Retirer l'œuvre de la liste et vérifier son retour normal. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 9. Filter Manager
   **Préparation :** activer uniquement **Filter Manager**. Utiliser une page de tag très fournie et être connectée pour les filtres personnels.
---

   ### Étapes

   1. Construire un filtre AO3, l'enregistrer comme preset, l'appliquer, l'éditer sous forme de puces et vérifier les champs AO3. [ ]

   2. Créer deux presets, en marquer un favori et vérifier qu'il remonte. Tester l'aperçu au survol, la fusion et la mémorisation par fandom. [ ]

   3. Lancer plusieurs recherches non enregistrées et vérifier **Recent**. Recharger et vérifier **Remember filters**. [ ]

   4. Limiter les langues, afficher les badges, cliquer sur un badge pour filtrer, puis masquer les langues préférées après avoir défini leur liste. [ ]

   5. Exclure un avertissement officiel et vérifier la bannière, son seuil, **Remove exclusion** et **Don't show again**. [ ]

   6. Activer les groupes de tags équivalents et les groupes de tropes intégrés ; vérifier qu'une sélection couvre les variantes annoncées. [ ]

   7. Tester les boutons à trois états one-shot et crossover, leurs valeurs par défaut et le badge one-shot. [ ]

   8. Tester séparément : peu de tags et son seuil, auteur anonyme, résumé absent ou trop court, ratio minimum, date récente et œuvre abandonnée. [ ]

   9. Tester le bouton de masquage manuel puis la touche `X` sur une œuvre survolée. [ ]

   10. Avec des données existantes, tester séparément les filtres kudos, abonnements, bookmarks, Marked for Later, œuvres lues et séries lues. [ ]

   11. Comparer les modes cacher et atténuer. Vérifier le compteur, son détail par catégorie et la révélation temporaire d'une catégorie. [ ]

   12. Renommer un preset, vérifier les statistiques d'utilisation, puis utiliser **Unhide all** après plusieurs masquages manuels. [ ]

   13. Ouvrir aussi ses pages History et Bookmarks : les filtres compatibles avec une liste doivent y fonctionner même sans formulaire de recherche. [ ]

   14. Ne pas attendre de résultat de **Sync & Refresh**, documenté comme inactif. [ ]

   15. Réinitialiser les filtres et désactiver le module. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 10. Page Controls
   **Préparation :** activer uniquement **Page Controls** sur une liste comportant beaucoup de pages.
---

   ### Étapes

   1. Vérifier les boutons de saut rapide. Changer le pas de 10 à une autre valeur et contrôler le numéro d'arrivée. [ ]

   2. Activer les grands sauts, modifier le pas et vérifier qu'un saut ne dépasse pas la première ou dernière page. [ ]

   3. Tester page aléatoire et les positions ¼, ½ et ¾. [ ]

   4. Saisir directement un numéro de page valide puis invalide. Tester le champ au-dessus et au-dessous de la pagination. [ ]

   5. Vérifier la barre de progression et la navigation collante pendant le défilement. [ ]

   6. Visiter plusieurs pages, revenir ailleurs et tester **Resume/Recent**. [ ] 

   7. Tester 20, 50 et 100 œuvres par page et vérifier le nombre réellement affiché lorsque AO3 le permet. [ ]

   8. Activer le défilement infini : les contrôles incompatibles doivent disparaître et la page suivante se charger au bas de la liste sans doublons. [ ]

   9. Tester le bouton de retour en haut après un long défilement. [ ]

   10. Désactiver le module et vérifier la pagination AO3 normale. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 11. Fic Engagement
   **Préparation :** activer uniquement **Fic Engagement** sur une liste contenant des œuvres aux statistiques variées.
---

   ### Étapes

   1. Vérifier les ratios kudos/vues, bookmarks/kudos et commentaires/kudos sur une liste et une œuvre. [ ]

   2. Ouvrir le guide d'interprétation des ratios. [ ]

   3. Activer les couleurs et vérifier plusieurs niveaux faible, moyen et fort. [ ]

   4. Activer le masquage sous 8 %, vérifier les œuvres cachées puis le désactiver. [ ]

   5. Régler des seuils de pépite faciles à atteindre et vérifier les niveaux argent, or ou diamant. [ ]

   6. Modifier tour à tour ratio minimum, maximum de kudos, maximum de bookmarks et minimum de hits ; le résultat doit suivre chaque seuil. [ ]

   7. Activer la comparaison à la moyenne de la page et vérifier que les œuvres signalées peuvent changer. [ ]

   8. Désactiver le module et confirmer la disparition des badges. [ ] 
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................



═══════════════════════════════════════════════════════════════════════════



# PHASE 3 - RECHERCHE ET DÉCOUVERTE


   ## 12. Fic Peek
   **Préparation :** activer uniquement **Fic Peek** sur une liste d'œuvres, dont une œuvre multi-chapitres.
---

   ### Étapes

   1. En mode clic, ouvrir et fermer un aperçu. [ ]

   2. Passer en mode survol, comparer deux délais d'ouverture nettement différents. [ ]

   3. Activer le mode sans spoiler : l'extrait doit rester flouté jusqu'à l'action de révélation. [ ]

   4. Tester premier paragraphe, 100 mots, 250 mots, longueur personnalisée et chapitre entier. [ ]

   5. Pour la longueur personnalisée, essayer deux nombres différents. Modifier aussi la hauteur maximale et vérifier le défilement interne. [ ]

   6. Sur l'œuvre multi-chapitres, demander premier, dernier puis chapitre aléatoire. [ ]

   7. Ouvrir deux fois le même aperçu avec cache normal, puis cache désactivé. Aucun contenu ancien ou mélangé ne doit apparaître. [ ]

   8. Activer le cache persistant, fermer et rouvrir l'onglet, puis vérifier l'aperçu. Modifier sa durée de validité. [ ]

   9. Désactiver le module et vérifier la disparition des commandes d'aperçu. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 13. Search Enhancer
   **Préparation :** activer uniquement **Search Enhancer**. Utiliser la recherche d'œuvres AO3 et une liste de résultats.
---

   ### Étapes

   1. Saisir un tag et vérifier les suggestions liées, leurs nombres d'œuvres et leurs icônes de catégorie. [ ]

   2. Effectuer plusieurs recherches, puis vérifier les suggestions issues de l'historique et la limite de 25. [ ]

   3. Rechercher dans l'historique avec une petite faute de frappe. Tester **Clear history** et l'export JSON. [ ]

   4. Vérifier l'autocomplétion officielle AO3 et que son choix remplit correctement le champ. [ ]

   5. Tester les modèles rapides : kudos, récemment mis à jour, terminé et plus long. [ ]

   6. Vérifier les conseils avec une recherche sans résultat puis une recherche très large. [ ]

   7. Après plusieurs recherches, ouvrir les statistiques : termes fréquents, tendance personnelle et barres de fandoms doivent refléter l'activité. [ ]

   8. Tester chaque tri : ratio kudos/vues, taux de sauvegarde, kudos par chapitre, activité récente et équilibré. Vérifier le ratio affiché dans chaque œuvre. [ ]

   9. Activer le regroupement des séries, puis comparer les tris alphabétique, popularité et historique. Le dernier nécessite des lectures déjà enregistrées. [ ]

   10. Désactiver une option de tri à la fois et vérifier sa disparition du choix proposé. [ ]

   11. Désactiver le module et vérifier le retour de la recherche AO3 normale. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 14. Surprise Me
   **Préparation :** activer uniquement **Surprise Me** sur une liste de plusieurs pages.
---

   ### Étapes

   1. Tirer une œuvre avec aperçu désactivé : une œuvre de la page doit s'ouvrir. [ ]

   2. Activer l'aperçu avant ouverture, effectuer plusieurs tirages et vérifier titre, résumé et statistiques. [ ]

   3. Activer **Completed only** et vérifier que les tirages sont terminés. [ ]

   4. Définir un minimum de mots supérieur à certaines œuvres visibles et vérifier leur exclusion. [ ]

   5. Régler le nombre de résultats à 1, puis 3 et 10. Au-delà de 1, une liste sélectionnable doit apparaître. [ ]

   6. Depuis un tirage simple puis multiple, tester l'ajout à Later Shelf seulement si l'on souhaite conserver les œuvres ; sinon vérifier simplement la présence de la commande. [ ]

   7. Comparer « page actuelle » et « jusqu'à quatre pages suivantes ». Les résultats doivent respecter la même liste et ses filtres. [ ]

   8. Ouvrir l'historique des tirages, vérifier les entrées, puis utiliser **Clear History**. [ ]

   9. Désactiver le module et vérifier la disparition du bouton. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 15. POV Tracker
   **Préparation :** activer uniquement **POV Tracker**. Ouvrir plusieurs œuvres écrites clairement à la première, deuxième et troisième personne, puis revenir à leur liste.
---

   ### Étapes

   1. Avec l'analyse automatique et le texte intégral activés, ouvrir chaque œuvre et vérifier le verdict ainsi que le panneau détaillé par chapitre. [ ]
   
   2. Désactiver l'analyse du texte intégral et comparer le verdict fondé sur les tags/résumé. [ ]
   
   3. Revenir à la liste : les œuvres déjà analysées doivent porter leur badge. [ ]
   
   4. Afficher ou cacher séparément les badges première, deuxième, troisième, mixte, multiple et inconnu. [ ]
   
   5. Activer les filtres de POV et vérifier qu'ils n'affichent que les catégories choisies. [ ]
   
   6. Définir des POV préférés, puis activer leur application automatique. Les œuvres hors préférence doivent être masquées. [ ]
   
   7. Activer les statistiques personnelles après plusieurs analyses et vérifier la répartition. [ ]
   
   8. Désactiver le module : panneaux, badges et filtres doivent disparaître. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 16. Similar Fics
   **Préparation :** activer uniquement **Similar Fics** sur une œuvre possédant plusieurs tags et, si possible, une série.
---

   ### Étapes

   1. Ouvrir les recommandations et vérifier qu'elles mènent à de vraies pages AO3. [ ]

   2. Tester 5, 10 et 15 résultats par section. [ ]

   3. Afficher puis cacher pourcentage, raisons de correspondance et résumé. [ ]

   4. Comparer œuvres terminées seulement puis inclusion des WIP. [ ]

   5. Tester l'ouverture dans le même onglet puis un nouvel onglet. [ ]

   6. Tester chaque préférence de longueur : proche, plus courte, plus longue, moins de 10 000 mots et 100 000 mots ou plus. [ ]

   7. Comparer les styles proche uniquement, équilibré et variété. [ ]

   8. Activer puis désactiver la correspondance de rating. [ ]

   9. Sur une œuvre de série, vérifier la section dédiée aux suites/préquelles. [ ]

   10. Dans **Based on**, retirer une puce de fandom ou de tag : la recherche doit être relancée sans ce critère. [ ]

   11. Utiliser **Not interested** sur une suggestion, relancer les recommandations et vérifier qu'elle ne revient pas. [ ]

   12. Recharger avec le cache activé, puis désactivé ; les suggestions ne doivent ni se dupliquer ni appartenir à une autre œuvre. [ ]

   13. Désactiver le module. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 17. Trope Games
   **Préparation :** activer uniquement **Trope Games**. Ouvrir l'accueil AO3 et une œuvre avec plusieurs tropes reconnaissables.
---

   ### Étapes

   1. Vérifier la bannière du trope du jour sur l'accueil, puis sa disparition quand l'option est coupée. [ ]

   2. Ouvrir les succès et vérifier leur progression après la visite d'une œuvre correspondante. [ ]

   3. Générer un bingo 3×3 puis 5×5. Choisir une catégorie et une exclusion ; une nouvelle carte doit les respecter. [ ]

   4. Vérifier les motifs de bingo et la détection d'une ligne lorsque les données le permettent. [ ]

   5. Faire tourner la roulette avec 2, 3 puis 5 tropes. [ ]

   6. Ouvrir le quiz d'humeur, répondre et vérifier le résultat proposé. [ ]

   7. Ouvrir les statistiques de tropes et vérifier qu'elles reflètent les œuvres connues du module. [ ]

   8. Dans les statistiques, vérifier défi hebdomadaire, tropes non explorés, catégories et tendance du mois comparée au mois précédent. [ ]

   9. Vérifier que le bouton flottant 🃏 regroupe Bingo, Roulette, Stats, Achievements, Mood Quiz et Horoscope. [ ]

   10. Ouvrir manuellement l'horoscope après avoir fermé sa bannière. Le lendemain d'une prédiction, vérifier si le module indique correctement si elle s'est réalisée. [ ]

   11. Activer le thème saisonnier de l'horoscope et vérifier la couleur, puis le désactiver. [ ]

   12. Sur le bingo, vérifier le pourcentage de progression et, lorsqu'un motif est complété, la notification même si la carte est fermée. [ ]

   13. Dans les succès, vérifier niveaux bronze/argent/or/platine et historique daté des déblocages. [ ]

   14. Depuis la roulette, utiliser **Surprise Pick** avec Surprise Me activé seulement pour ce sous-test : la recherche combinée doit s'ouvrir et tirer un résultat. [ ]

   15. Couper séparément succès, bingo, roulette, statistiques et quiz : chaque partie doit disparaître sans casser les autres. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................



═══════════════════════════════════════════════════════════════════════════



# PHASE 4 - LECTURE D'UNE OEUVRE


   ## 18. Reading Formatter
   **Préparation :** activer uniquement **Reading Formatter** sur une œuvre dont le texte contient, si possible, images, gras, dialogues, séparateurs et longs paragraphes.
---

   ### Étapes

   1. Comparer le texte avec le nettoyage automatique activé puis désactivé. Le sens et les paragraphes ne doivent pas être abîmés. [ ]

   2. Tester retrait du gras excessif, conversion de `/texte/` en italique et découpage des murs de texte sur des passages adaptés. [ ]

   3. Activer l'uniformisation des séparateurs et saisir un nouveau symbole ; tous les vrais séparateurs de scène doivent suivre ce style. [ ]

   4. Cacher les images intégrées puis les réafficher. [ ]

   5. Tester police sans empattements et mode de lecture épuré. [ ]

   6. Tester alignement gauche, justifié et centré, puis plusieurs espacements de paragraphes. [ ]

   7. Activer **Breathe Mode** sur de longs paragraphes. [ ]

   8. Activer la règle de lecture et déplacer le pointeur ; activer ensuite le surlignage des dialogues. [ ]

   9. Activer les informations de fin d'œuvre et vérifier titre, auteur et tags en bas. [ ]

   10. Utiliser le panneau **Aa** pour modifier largeur, taille et espacement. Avec les préférences par œuvre désactivées, vérifier le même réglage ailleurs ; avec elles activées, vérifier deux réglages distincts. [ ]

   11. Désactiver le module et contrôler le retour du texte original. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 19. Collapse Author Notes
   **Préparation :** activer uniquement **Collapse Author Notes** sur une œuvre avec notes de début et de fin ; chercher aussi une note contenant TW/CW et une œuvre de collection si possible.
---

   ### Étapes

   1. Replier et déplier manuellement chaque note, recharger et vérifier la mémorisation. [ ]

   2. Activer séparément le repli automatique au début et à la fin. [ ]

   3. Essayer un seuil très bas puis très haut : seules les notes assez longues doivent se replier. [ ]

   4. Avec **Keep warnings open**, une note contenant TW, CW, trigger warning ou content warning doit rester ouverte. [ ]

   5. Ajouter un mot-clé personnel présent dans une note et vérifier qu'elle reste ouverte. [ ]

   6. Sur une œuvre adaptée, activer le masquage des bandeaux de collection, cadeau ou défi. [ ]

   7. Tester **Clear states on disable** : désactiver puis réactiver le module et vérifier que les anciens choix ont été oubliés. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 20. Instant Footnotes
   **Préparation :** activer uniquement **Instant Footnotes** sur une œuvre dont un lien dans le texte mène à une note regroupée en fin de page.
---

   ### Étapes

   1. En mode survol, placer le pointeur sur le renvoi : la bonne note doit apparaître sans déplacement de page. [ ]

   2. Comparer un délai d'apparition/disparition court et long. [ ]

   3. Cliquer pour épingler la bulle, puis la fermer. [ ]

   4. Utiliser **Go to note** et vérifier l'arrivée sur la note exacte. [ ]

   5. Passer en mode clic et vérifier qu'un simple survol ne suffit plus. [ ]

   6. Tester deux largeurs maximales très différentes. [ ]

   7. Comparer thèmes auto, clair et sombre, y compris avec le thème AO3 courant. [ ]

   8. Désactiver le module : le lien doit reprendre le comportement AO3 normal. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 21. Word Swap
   **Préparation :** activer uniquement **Word Swap** sur une œuvre contenant un mot facile à retrouver. Ne pas choisir un mot courant de l'interface AO3.
---

   ### Étapes

   1. Créer une règle simple mot → remplacement et vérifier uniquement le texte de l'œuvre. [ ]

   2. Recharger et vérifier la persistance. [ ]

   3. Tester une expression de plusieurs mots, la casse et les choix de correspondance proposés par le panneau. [ ]

   4. Créer deux règles qui pourraient se chevaucher et vérifier que le résultat reste prévisible. [ ]

   5. Renseigner un prénom et utiliser le raccourci **Y/N → prénom** sur une œuvre adaptée. [ ]

   6. Tester les modèles proposés : variantes de nom, deadname, mots sensibles, fautes fréquentes et orthographe britannique/américaine. N'activer que des remplacements faciles à vérifier et non blessants. [ ]

   7. Désactiver une règle sans la supprimer, puis la réactiver. [ ]

   8. Exporter les règles, en supprimer une, importer et vérifier sa restauration. [ ]

   9. Désactiver le module : le texte original doit revenir et l'interface AO3 ne doit jamais avoir été modifiée. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 22. Chapter Navigation
   **Préparation :** activer uniquement **Chapter Navigation** sur une œuvre de plusieurs chapitres.
---

   ### Étapes

   1. Vérifier les boutons précédent/suivant et la barre collante pendant le défilement. [ ]
   
   2. Sur une liste, vérifier les boutons **Start/Continue** et **Last (Ch Y)** ; ouvrir chacun. [ ]
   
   3. Ouvrir le panneau Chapters : rechercher un titre, vérifier lu/actuel/non lu, ajouter un favori et une note, puis consulter les chapitres récents. [ ]
   
   4. Copier le lien direct d'un chapitre et l'ouvrir dans un nouvel onglet. Tester **First unread**, **Last chapter**, `Ctrl+Maj+Origine` et `Ctrl+Maj+Fin`. [ ]
   
   5. Vérifier le fil d'Ariane au-dessus du texte. [ ]
   
   6. Activer le numéro de chapitre dans le titre de l'onglet et l'emphase du titre courant. [ ]
   
   7. Lancer le défilement automatique, changer la vitesse, mettre en pause et reprendre. [ ]
   
   8. Tester l'avance automatique seulement sur un chapitre court et en restant prête à l'annuler. [ ]
   
   9. Vérifier le compteur de mots par chapitre s'il est affiché par le module. [ ]
   
   10. Avec préchargement activé, ouvrir le chapitre suivant : la navigation doit fonctionner sans saut ni mauvais chapitre. [ ]
   
   11. Désactiver le module et vérifier la disparition de ses commandes. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 23. Text To Speech
   **Attention :** commencer avec un volume bas. Les voix disponibles dépendent du navigateur et du système.
   **Préparation :** activer uniquement **Text To Speech** sur une œuvre multi-chapitres avec résumé et notes d'auteur.
---

   ### Étapes

   1. Ouvrir le panneau flottant, lancer, mettre en pause, reprendre et arrêter. [ ]

   2. Tester plusieurs voix et le filtre de langue ; vérifier les indications Local/Network et Default. [ ]

   3. Tester les profils 0,85×, 1×, 1,25× et 1,5×, puis le curseur 0,5× à 2×. [ ]

   4. Modifier volume et hauteur. Tester muet puis réactivation : le volume choisi doit être conservé. [ ]

   5. Vérifier le surlignage de la phrase et changer sa couleur. [ ]

   6. Tester phrase précédente/suivante. [ ]

   7. Activer le suivi par défilement et comparer lent, normal et rapide. [ ]

   8. Vérifier que résumé et notes sont ignorés lorsque leurs options sont actives, puis lus lorsqu'elles sont coupées. Les notes de fin ne doivent pas être lues comme du texte principal. [ ]

   9. Démarrer une minuterie, utiliser **+5m** et observer si possible le fondu final. [ ]

   10. Tester arrêt au changement de page. [ ]

   11. Sur un chapitre court, tester chapitre suivant automatique, confirmation et notification de fin. Vérifier la transition visuelle. [ ]

   12. Cacher le panneau flottant depuis les réglages et vérifier qu'il ne gêne plus la page. [ ]

   13. Arrêter la lecture avant de désactiver le module. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 24. Reading Tracker
   **Préparation :** activer uniquement **Reading Tracker**. Utiliser une œuvre multi-chapitres non sensible que l'on accepte d'ajouter à l'historique local.
---

   ### Étapes

   1. Ouvrir l'œuvre, faire défiler jusqu'à environ 30 %, attendre quelques instants, quitter puis revenir. [ ]

   2. Vérifier toast, bannière de reprise, dernier temps de lecture, marqueur exact, badge de chapitre et indicateur flottant. [ ]

   3. Tester les indicateurs pourcentage, barre et anneau. Sur la barre, cliquer à une autre position. [ ]

   4. Passer 25 %, 50 % et 75 % et vérifier les notifications de palier. [ ]

   5. Ajouter plusieurs marque-pages manuels nommés, les ouvrir puis en supprimer un. [ ]

   6. Lire assez longtemps pour obtenir une vitesse moyenne et vérifier son affichage au retour. [ ]

   7. Sur une liste, comparer les modes estompé, caché, flouté et titre barré ; modifier l'opacité. [ ]

   8. Révéler temporairement les œuvres cachées avec le compteur puis avec `V` si Keyboard Shortcuts est activé pour ce sous-test. [ ]

   9. Sélectionner plusieurs œuvres et les marquer vues en groupe. [ ]

   10. Vérifier les exceptions bookmark, abonnement et Marked for Later avec des œuvres réellement présentes dans ces listes. [ ]

   11. Ouvrir l'historique : rechercher, trier, vérifier les groupes de périodes et dates, épingler, écrire une note, supprimer une entrée et exporter JSON. [ ]

   12. Revisiter une œuvre et vérifier le nombre de lectures. Tester le nettoyage des anciennes entrées en protégeant les épinglées. [ ]

   13. Ajouter une exclusion par ID puis par fandom et vérifier qu'une nouvelle visite n'est pas enregistrée. [ ]

   14. Vérifier **Clear progress** sur une œuvre. Ne tester **Clear all history** qu'après export, et seulement si la suppression est voulue. [ ]

   15. Sur la page des abonnements, vérifier badge Updated, date relative/exacte et filtre Updated only. [ ]

   16. Sur l'accueil, vérifier **Continue Reading**. [ ]

   17. Désactiver le module et confirmer la disparition des marqueurs sans supprimer involontairement l'historique. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................



═══════════════════════════════════════════════════════════════════════════



# PHASE 5 - ACTIONS ET INTERACTIONS


   ## 25. User Relationships
   **Préparation :** activer uniquement **User Relationships**. Choisir un compte de test ou un auteur dont on accepte de conserver puis retirer les préférences.
---

   ### Étapes

   1. Ouvrir la fiche d'auteur au survol et vérifier ses informations et œuvres populaires. [ ]

   2. Suivre l'auteur, le mettre en favori, définir une priorité, une note et des catégories personnalisées. [ ]

   3. Sur une liste, activer **Favorites only** et vérifier que seules les œuvres des favoris restent. [ ]

   4. Bloquer l'auteur avec une raison, puis tester le blocage d'un pseudonyme précis plutôt que tout le compte. [ ]

   5. Vérifier le masquage de ses œuvres, commentaires et notes publiques de bookmark sur des pages adaptées. [ ]

   6. Comparer disparition complète et placeholder. Activer la révélation temporaire et cliquer sur le placeholder. [ ]

   7. Ouvrir les statistiques de blocage et vérifier auteurs bloqués et contenus cachés. [ ]

   8. Retirer blocage, favori et suivi ; vérifier que le contenu revient. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 26. Fic Actions
   **Attention :** Subscribe et Bookmark modifient réellement le compte.
   **Préparation :** activer uniquement **Fic Actions** sur une œuvre et une liste.
---

   ### Étapes

   1. Activer le réordonnancement, déplacer les boutons d'action et recharger pour vérifier l'ordre. [ ]
   
   2. Activer les icônes seules ; au survol et avec un lecteur d'écran si disponible, le sens doit rester accessible. [ ]
   
   3. Dupliquer Subscribe en bas, puis tester ses positions près des kudos et tout en bas. [ ]
   
   4. Afficher Subscribe sur les listes. Ne cliquer que si l'abonnement est réellement souhaité, puis vérifier le badge de statut. [ ]
   
   5. Cacher séparément Share, Bookmark et Subscribe ; aucun autre bouton ne doit disparaître. [ ]
   
   6. Réduire la largeur de la fenêtre comme sur un téléphone : les actions doivent rester lisibles, cliquables et sans chevauchement. [ ]
   
   7. Désactiver le module et vérifier les boutons AO3 normaux. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 27. Comment Kit
   **Attention :** tous les tests peuvent rester dans un brouillon. Ne pas appuyer sur Comment ou Post sans vouloir publier.
   **Préparation :** activer uniquement **Comment Kit** sur une œuvre avec plusieurs commentaires.
---

   ### Étapes

   1. Écrire un brouillon et vérifier les compteurs de mots/caractères. [ ]
   
   2. Tester gras, italique, souligné, barré, lien et citation, puis l'aperçu. Vérifier l'identité « Posting as ». [ ]
   
   3. Recharger avant publication : le brouillon doit revenir. Ouvrir deux formulaires de réponse et vérifier que leurs brouillons restent distincts. [ ]
   
   4. Activer la boîte flottante, la déplacer et recharger ; sa position doit être mémorisée. [ ]
   
   5. Activer modèles rapides et modèles personnels. Créer un modèle avec `{title}` et `{author}`, l'insérer et vérifier le remplacement. Avec six modèles ou plus, tester la recherche. [ ]
   
   6. Sélectionner du texte de la fic et l'ajouter comme citation. [ ]
   
   7. Replier/déplier des fils. Tester les seuils automatiques 5, 10 ou 20 sur une page adaptée. [ ]
   
   8. Utiliser **Reply with quote** sur un commentaire sans publier. [ ]
   
   9. Tester badge NEW, mise en valeur de l'auteur, réponses à soi et surlignage d'un pseudo ou mot choisi. [ ]
   
   10. Comparer les filtres cacher l'auteur / seulement l'auteur / désactivé. [ ]
   
   11. Tester recherche dans les commentaires et navigation entre résultats. [ ]
   
   12. Activer saut vers commentaires et panneau flottant ; tester premier, précédent, suivant, dernier, numéro de page et `Alt+↑/↓`. [ ]
   
   13. Comparer densités compacte, normale et spacieuse. [ ]
   
   14. Si la boîte de réception et la création d'œuvre sont accessibles, vérifier badge de chapitre et valeur par défaut des commentaires invités sans enregistrer de modification non souhaitée. [ ]
   
   15. Effacer les brouillons de test et désactiver le module. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................



═══════════════════════════════════════════════════════════════════════════



# PHASE 6 - CONSTITUTION DE LA BIBLIOTHÈQUE


   ## 28. Later Shelf
   **Préparation :** activer uniquement **Later Shelf** et être connectée. Choisir deux œuvres que l'on accepte de mettre temporairement dans Marked for Later.
---

   ### Étapes

   1. Vérifier le bouton 📌 sur une liste et ses positions avant titre, après titre et fin du bloc. [ ]

   2. Ajouter une œuvre, vérifier son apparition dans la page MFL, puis son retrait. [ ]

   3. Activer la demande de note et ajouter une seconde œuvre avec note. [ ]

   4. Activer l'ajout groupé, sélectionner plusieurs œuvres, ajouter puis annuler/nettoyer le test. [ ]

   5. Comparer la page MFL en liste et en grille. [ ]

   6. Définir priorités basse, moyenne et haute, puis tester tris priorité, manuel, intelligent et pépites cachées. En tri manuel, réordonner à 
   la souris et recharger. [ ]
   
   7. Ajouter une note et un groupe, renommer le groupe, filtrer par groupe puis l'effacer. [ ]
   
   8. Tester **Pick for me**, la suggestion selon un nombre de minutes et le temps total estimé de la liste. [ ]
   
   9. Vérifier le badge permanent du menu et son aperçu rapide. [ ]
   
   10. Retirer une œuvre puis utiliser **Undo**. La retirer de nouveau, vérifier l'archive, la restaurer puis la supprimer définitivement si souhaité. [ ]
   
   11. Ouvrir les statistiques de la liste et vérifier lues/abandonnées. Si un cap est atteint, vérifier la célébration. [ ]
   
   12. Sur une page de série, ajouter toute la série en un clic après avoir vérifié le nombre d'œuvres ; annuler ou nettoyer ensuite. [ ]
   
   13. Activer les rappels, modifier le seuil de 45 jours et vérifier lingering/dropped, rappels de reprise hors MFL, report de 3 jours, message personnalisé, récurrence quotidienne/hebdomadaire et historique des rappels. [ ]
   
   14. Si l'historique d'activité existe, vérifier que l'heure proposée correspond à l'heure habituelle de lecture. [ ]
   
   15. Vérifier les badges **New chapter** et **Completed** lorsqu'une œuvre de la liste change réellement. [ ]
   
   16. Exporter la liste en CSV puis en liste de liens et ouvrir les fichiers. [ ]
   
   17. Pour **Auto-remove on finish**, activer Fic Appreciation uniquement pour ce sous-test, marquer une œuvre Finished et vérifier son retrait. [ ]
   
   18. Avec Keyboard Shortcuts actif pour ce sous-test, vérifier `Ctrl+Shift+M`. [ ]
   
   19. Recharger pour vérifier la persistance, puis retirer les œuvres de test. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 29. Bookmark Vault
   **Attention :** les bookmarks AO3 peuvent être publics. Utiliser Private lorsque la discrétion est souhaitée.
   **Préparation :** activer uniquement **Bookmark Vault**. Choisir deux œuvres que l'on accepte de bookmarker temporairement.
---

   ### Étapes

   1. Créer un bookmark public puis privé et vérifier les badges étoile/cadenas, l'icône de note et le lien **My Bookmark**. [ ]

   2. Activer **Private by default** et ouvrir un nouveau formulaire : Private doit être précoché sans sauvegarde automatique. [ ]

   3. Vérifier le préremplissage titre, auteur et résumé, puis le bouton de retour à l'œuvre. [ ]

   4. Modifier une note directement depuis la liste et depuis l'œuvre. Tester aussi la note rapide 📝 sous le titre. [ ]

   5. Créer deux catégories, afficher leurs étiquettes et filtrer par catégorie. Tester l'affectation automatique par fandom. [ ]

   6. Tester le filtre favorisé/non favorisé, sa vue par défaut et son compteur. [ ]

   7. Tester le tri par date, titre, fandom et note. Épingler un bookmark et vérifier qu'il remonte. [ ]

   8. Activer sélection multiple et effectuer une action groupée réversible. [ ]

   9. Activer tags automatiques de fandom et rating sur un nouveau bookmark et vérifier le formulaire avant sauvegarde. [ ]

   10. Ajouter une note personnelle en étoiles ; activer l'affichage de note, date de dernière lecture, complétion et anneau de progression. [ ]

   11. Régler un rappel d'ancienneté à 3, 6 ou 12 mois ; le tester uniquement avec une entrée assez ancienne. [ ]

   12. Vérifier le traitement d'une œuvre supprimée/restreinte : badge d'avertissement puis masquage complet, si une telle entrée existe. [ ]

   13. Activer le tableau d'analyses et vérifier les statistiques. [ ]

   14. Tester recherche avancée dans les notes, aperçu rapide, historique des notes, modèles de note et marquage d'une note importante. [ ]

   15. Vérifier regroupement par série, tags automatiques WIP/progression et copie historique des métadonnées. [ ]

   16. Exporter les données dans les formats proposés et ouvrir les fichiers. Tester une action groupée locale réversible et un rappel d'entretien. [ ]

   17. Si un utilisateur bloqué possède un bookmark public visible, vérifier son masquage avec l'option prévue. [ ]

   18. Retirer les bookmarks de test si souhaité et désactiver le module. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 30. Fic Appreciation
   **Attention :** un kudos est irréversible. Utiliser une œuvre que l'on souhaite réellement soutenir.
   **Préparation :** activer uniquement **Fic Appreciation**. Choisir une œuvre déjà kudosée et, si souhaité, une œuvre à kudoser.
---

   ### Étapes

   1. Marquer une œuvre Finished, ajouter une note si l'option est active et vérifier le filtre des œuvres terminées. [ ]

   2. Tester les statuts disponibles (à lire, en cours, pause, terminée, abandonnée, à relire, etc.), leurs notes et le masquage d'un statut choisi. [ ]

   3. Vérifier les badges de statut sur une liste et les statistiques associées. [ ]

   4. Donner une note en étoiles sur l'œuvre, vérifier son affichage sur la liste et une note textuelle. Activer les demi-étoiles. [ ]

   5. Activer Intrigue, Personnages et Écriture ; vérifier le score combiné sur une liste. [ ]

   6. Modifier plus tard une note et ouvrir son historique. Vérifier moyenne, répartition, total et évolution mensuelle. [ ]

   7. Ajouter des tags d'humeur et afficher les statistiques communautaires à côté de la note personnelle. [ ]

   8. Activer la proposition de notation après Finished : elle doit attirer l'attention sans noter automatiquement. [ ]

   9. Vérifier date de fin, compteur de relectures et félicitations aux paliers si le prochain palier est atteignable. [ ]

   10. Sur l'œuvre déjà kudosée, utiliser la vérification manuelle et vérifier icône et date selon les formats long, court et relatif. [ ]

   11. Ouvrir les statistiques de kudos par fandom, auteur et heure de la journée. [ ]

   12. Activer l'historique de kudos, ouvrir **Kudos History** et rechercher par titre, auteur et fandom. [ ]

   13. Sur sa page Bookmarks, lancer **Find kudosed works not bookmarked**. [ ]

   14. Si un nouveau kudos est souhaité, tester le bouton rapide sur liste, sa confirmation en deux clics, l'icône choisie, le rappel d'une œuvre terminée et l'assistance au commentaire lors d'une revisite. [ ]

   15. Activer le filtre des œuvres kudosées et vérifier leur masquage. [ ]

   16. Désactiver le module ; les données personnelles doivent rester disponibles au prochain réemploi. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 31. Fanfic Binge Mode
   **Préparation :** activer uniquement **Fanfic Binge Mode** après avoir créé quelques lectures en cours avec Reading Tracker.
---

   ### Étapes

   1. Sur l'accueil, vérifier **Continue Reading** et le nombre d'œuvres affichées. [ ]

   2. Comparer les styles liste, bannière et panneau latéral. [ ]

   3. Comparer l'affichage du rappel sur accueil, accueil + listes et partout. [ ]

   4. Arriver près de la fin d'une œuvre et vérifier **Continue Reading?**. [ ]

   5. Activer une avance automatique avec un délai raisonnable, vérifier le compte à rebours et l'annulation. Remettre ensuite le délai à 0. [ ]

   6. Activer la file d'attente, ajouter plusieurs œuvres avec priorités basse, moyenne et haute, réordonner et vérifier la barre de progression. [ ]

   7. À la fin d'une œuvre, la priorité la plus haute doit être proposée avant `/works`. [ ]

   8. Avec Keyboard Shortcuts actif pour ce sous-test, utiliser `Alt+R` et vérifier la reprise de la bonne œuvre. [ ]

   9. Régler un rappel de pause à 30 minutes si le temps le permet ; sinon noter le test bloqué par la durée. Tester aussi 45 et 60 seulement lors d'un usage normal prolongé. [ ]

   10. Terminer une œuvre et vérifier les suggestions post-lecture. [ ]

   11. Désactiver le module et vérifier la disparition des rappels et de la file visible. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................



═══════════════════════════════════════════════════════════════════════════



# PHASE 7 - FONCTIONS UTILISANT LES DONNÉES ACCUMULÉES


   ## 32. Reading Dashboard
   **Préparation :** conserver les données créées précédemment, mais activer uniquement **Reading Dashboard**. Ouvrir son accès depuis le menu ou le Dashboard AO3.
---

   ### Étapes

   1. Vérifier que la page s'ouvre sans remplacer définitivement le Dashboard AO3. [ ]
   
   2. Afficher puis cacher séparément œuvres récentes, WIP, fandoms, tags et liens rapides. [ ]
   
   3. Modifier le nombre d'œuvres récentes et vérifier le nombre affiché. [ ]
   
   4. Modifier le nombre de fandoms et vérifier le classement. [ ]
   
   5. Ouvrir une œuvre récente, un WIP, un fandom, un tag et chaque lien rapide. [ ]
   
   6. Réordonner les blocs à la souris, recharger et vérifier l'ordre. [ ]
   
   7. Vérifier le bilan annuel, le profil de lecture, la diversité et le pourcentage de relectures par rapport aux nouvelles lectures. [ ]
   
   8. Comparer les informations aux lectures réellement enregistrées ; une œuvre inconnue ne doit pas apparaître. [ ]
   
   9. Recharger et revenir avec le bouton Précédent du navigateur. [ ]
   
   10. Désactiver le module et vérifier que l'accès ajouté disparaît sans effacer les données. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 33. Activity Panel
   **Préparation :** activer uniquement **Activity Panel** après plusieurs visites et sessions de lecture.
---

   ### Étapes

   1. Vérifier le détail des fandoms et ouvrir les éléments cliquables. [ ]

   2. Vérifier les habitudes : heures, jours, pic de lecture et carte hebdomadaire. Comparer avec l'activité récente connue. [ ]

   3. Vérifier les motifs détectés, notamment sessions intensives ou tendances, sans considérer l'absence d'un motif comme une panne. [ ]

   4. Ouvrir les insights et vérifier que les explications sont compréhensibles. [ ]

   5. Vérifier l'historique des sessions : début, dernière activité et pages vues doivent être plausibles. [ ]

   6. Changer la période : aujourd'hui, 7 jours, 30 jours, cette année et tout. Les cartes doivent se recalculer, mais les séries et succès globaux doivent rester globaux. [ ]

   7. Utiliser le bouton de recalcul puis exporter les statistiques en JSON. [ ]

   8. Activer le nuage de tags, vérifier tailles relatives et clics. [ ]

   9. Vérifier la carte jour × heure, le meilleur créneau prédit, le profil lecteur de nuit/régulier et l'estimation du point d'abandon. [ ]

   10. Vérifier relectures, sessions intensives, tendances de tags et comparaison mois/année avec la période précédente. [ ]

   11. Comparer jusqu'à trois fandoms. Vérifier camembert, nombre de fics, mots, heures et kudos. [ ]

   12. Vérifier les regroupements par rating et catégorie, puis les tendances par trimestre et saison. [ ]

   13. Avec la période mois ou année, vérifier le récapitulatif textuel. Après une longue absence réelle, vérifier que le message de reprise est encourageant. [ ]

   14. Ouvrir les liens Bookmarks, History et Subscriptions. [ ]

   15. Activer les succès 10K, 100K et 1M mots ; seul un palier réellement atteint doit être accordé. [ ]

   16. Désactiver le module et vérifier que les données de lecture ne sont pas supprimées. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 34. Reading Timeline
   **Préparation :** activer uniquement **Reading Timeline** avec un historique comportant plusieurs dates si possible.
---

   ### Étapes

   1. Ouvrir la grille annuelle et vérifier les jours comportant des lectures. [ ]

   2. Comparer les couleurs verte, violette, orange et bleue. [ ]

   3. Comparer les intensités basse, moyenne et haute ; davantage de lectures doit produire une case plus forte. [ ]

   4. Modifier la plage d'années et utiliser le sélecteur. [ ]

   5. Choisir vue annuelle puis mensuelle comme vue par défaut, recharger et vérifier le choix. [ ]

   6. Cliquer une journée et vérifier la liste des œuvres correspondantes. [ ]

   7. Ajouter une note à une date spéciale et vérifier sa persistance. Vérifier aussi les jalons 10e, 25e, 50e ou suivants lorsqu'ils existent. [ ]

   8. Si une œuvre possède une note Bookmark Vault, vérifier son aperçu dans le détail du jour. [ ]

   9. Rechercher une œuvre : les jours correspondants doivent être entourés sans cacher les autres. Enregistrer le filtre sous un nom et le réutiliser. [ ]

   10. Sur une journée comprenant plusieurs lectures, vérifier les groupes matin, après-midi, soir et nuit. [ ]

   11. Exporter la frise en PNG et ouvrir l'image. Aucun export PDF n'est attendu. [ ]

   12. Sur une liste, vérifier le marquage des œuvres lues puis activer **Hide read works**. [ ]

   13. Désactiver le module sans effacer l'historique source. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 35. Notification Center
   **Attention :** l'autorisation de notifications appartient au navigateur. Ne pas la refuser définitivement si l'on veut poursuivre le test.
   **Préparation :** activer uniquement **Notification Center** avec au moins une œuvre dans bookmarks, MFL ou historique.
---

   ### Étapes

   1. Ouvrir la cloche et le flux **What's New**. Vérifier tri, lecture/non lu, filtrage par origine, report et archivage. [ ]
   
   2. Sur l'accueil, afficher puis cacher le widget. [ ]
   
   3. Tester séparément la surveillance des bookmarks, MFL et historique. Si souhaité, activer les abonnements ; leur vérification est limitée à environ une fois toutes les six heures. [ ]
   
   4. Lancer une vérification manuelle si le bouton existe. Une absence de nouveauté doit produire un état propre, pas une fausse alerte. [ ]
   
   5. Lorsqu'une œuvre suivie reçoit réellement un chapitre ou devient terminée, vérifier titre, origine, priorité, regroupement et lien. [ ]
   
   6. Comparer une entrée par événement, résumé quotidien et résumé hebdomadaire. Ces derniers demandent du temps réel ; noter « en attente » jusqu'à l'échéance. [ ]
   
   7. Autoriser les notifications du navigateur, provoquer uniquement une vérification légitime et vérifier l'affichage. [ ]
   
   8. Activer le son, puis les heures calmes avec une plage contenant l'heure actuelle : aucun son ni notification de bureau ne doit sortir, mais l'entrée doit rester dans le flux. [ ]
   
   9. Vérifier l'historique glissant, le masquage des œuvres terminées et les actions sur plusieurs entrées si disponibles. [ ]
   
   10. Désactiver notifications et son à la fin du test. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué/En attente
   **Notes :** ....................................................................



═══════════════════════════════════════════════════════════════════════════



# PHASE 8 - PERSONNALISATION ET OUTILS AVANCÉS


   ## 36. Theme Builder
   **Préparation :** activer uniquement **Theme Builder**. Noter le thème AO3 initial pour pouvoir y revenir.
---

   ### Étapes

   1. Ouvrir l'éditeur visuel et modifier une couleur, la typographie et un élément de style. Vérifier l'aperçu puis l'application sur plusieurs pages. [ ]

   2. Enregistrer le thème sous un nom, recharger, le réappliquer, le renommer, le dupliquer puis supprimer la copie. [ ]

   3. Tester chacun des trois thèmes prêts à l'emploi. [ ]

   4. Exporter le thème personnel. Le supprimer, importer le fichier et vérifier sa restauration. [ ]

   5. Désactiver l'import dans les réglages et vérifier la disparition du bouton, puis le réactiver. [ ]

   6. Passer en mode CSS expert uniquement si l'on sait écrire une règle très simple ; sinon noter « non testé volontairement ». Une règle invalide ne doit pas casser durablement AO3. [ ]

   7. Revenir au thème initial et désactiver le module. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 37. Fic Downloader
   **Attention :** respecter les conditions d'AO3 et éviter les téléchargements massifs. Kindle et Calibre demandent des services externes configurés par l'utilisatrice.
   **Préparation :** activer uniquement **Fic Downloader**. Choisir une œuvre courte et une petite série.
---

   ### Étapes

   1. Choisir chaque format réellement proposé, télécharger l'œuvre et vérifier que le fichier s'ouvre, porte le bon titre et contient tous les chapitres attendus. [ ]

   2. Sur une liste, afficher puis cacher les boutons rapides et télécharger une seule œuvre. [ ]

   3. Activer la sélection groupée, choisir deux œuvres, vérifier le récapitulatif puis télécharger sans répétition. [ ]

   4. Télécharger une page complète en archive et vérifier son contenu. [ ]

   5. Sur une petite série, tester le téléchargement automatique et vérifier ordre et nombre de parties. [ ]

   6. Ajouter une œuvre à la bibliothèque hors ligne, l'ouvrir sans retéléchargement, rechercher/organiser si ces commandes sont présentes, puis la retirer. [ ]

   7. Activer le cache automatique MFL, ajouter une œuvre à MFL et vérifier son apparition hors ligne. [ ]

   8. Kindle : activer le bouton, renseigner une adresse seulement si elle est réelle, tester confirmation puis envoi automatique. Sinon vérifier seulement que les champs et avertissements sont clairs. [ ]

   9. Calibre : activer l'action, renseigner URL et bibliothèque uniquement si un serveur personnel existe. En son absence, noter « non testable : serveur Calibre absent » ; une erreur doit être compréhensible. [ ]

   10. Désactiver le module et supprimer les fichiers de test seulement si souhaité. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................


===========================================================================


   ## 38. Backup & Sync
   **Attention :** c'est le dernier module parce qu'il manipule toutes les données AO3 Helper. Toujours créer un export avant un test de restauration ou d'import.
   **Préparation :** conserver les données de la campagne. Activer uniquement **Backup & Sync**.
---

   ### Étapes

   1. Créer une sauvegarde manuelle et vérifier sa date ainsi que sa présence dans la liste. [ ]

   2. Modifier un réglage sans importance, restaurer la sauvegarde et vérifier le retour de l'ancienne valeur. [ ]

   3. Activer les sauvegardes automatiques avec un intervalle court autorisé, attendre l'intervalle et vérifier la création. [ ]

   4. Définir un petit nombre maximal, créer assez de sauvegardes et vérifier que les plus anciennes seulement sont retirées. [ ]

   5. Exporter toutes les données dans un fichier et le conserver en lieu sûr. [ ]

   6. Modifier une donnée de test, importer l'export et vérifier sa restauration. Annuler si l'interface offre un aperçu incorrect ou inattendu. [ ]

   7. Vérifier que réglages, tags masqués, listes, historique et autres données des modules sont présents après restauration. [ ]

   8. Ouvrir l'inventaire des données : vérifier taille, état et recherche. Lancer la vérification d'intégrité ; une corruption doit être signalée clairement. [ ]

   9. Créer une petite sauvegarde sélective, puis comparer avec une sauvegarde complète. Tester, si proposés, compression et sauvegarde des seuls changements. [ ]

   10. Protéger une sauvegarde de test par mot de passe, vérifier qu'un mauvais mot de passe échoue et que le bon restaure. Ne pas utiliser un mot de passe important. [ ]

   11. Après une mise à jour de version, vérifier que la migration annoncée termine sans perte et que les anciennes données restent lisibles. [ ]

   12. Activer la synchronisation du navigateur uniquement si le même compte navigateur est disponible sur un second appareil. Modifier une donnée sur le premier, attendre la synchronisation et vérifier le second, puis faire l'inverse. [ ]
   
   13. En cas de conflit proposé, lire les dates et tester le choix de la version voulue ; aucune fusion silencieuse ne doit perdre les deux côtés. [ ]
   
   14. Tester **Clear all** uniquement après l'export de l'étape 5 et seulement si la restauration immédiate est acceptée. Restaurer ensuite le fichier et vérifier plusieurs données. [ ]
   
   15. Remettre l'intervalle et le nombre maximal désirés. Désactiver la synchronisation si elle n'est pas souhaitée au quotidien. [ ]
—

   **Résultat :** [ ] Conforme [ ] Partiel [ ] Non conforme [ ] Bloqué
   **Notes :** ....................................................................



═══════════════════════════════════════════════════════════════════════════



# PHASE 9 — INTERACTIONS ESSENTIELLES ENTRE MODULES
   Cette phase commence seulement après les tests individuels. Activer uniquement les modules nommés dans chaque test.


   ## A. Tags Display + Hide By Tags
   1. Dans Tags Display, définir un mot de bruit présent sur une liste.
   2. Dans Hide By Tags, activer le masquage des œuvres portant un tag de bruit.
   3. Vérifier le masquage et sa raison, puis désactiver l'une des deux options.
   **Notes :** ....................................................................

---

   ## B. Bookmark Vault + Hide By Tags
   1. Bookmarker une œuvre portant un tag de la liste noire.
   2. Activer **Protect bookmarked works**.
   3. Vérifier que l'œuvre reste visible, puis retirer la protection et vérifier son masquage.
   **Notes :** ....................................................................

---

   ## C. Reading Tracker + Filter Manager + Reading Timeline
   1. Enregistrer une œuvre comme lue avec Reading Tracker.
   2. Vérifier les filtres « déjà lue » de Filter Manager.
   3. Vérifier la date dans Reading Timeline.
   4. Supprimer l'entrée de test et vérifier la mise à jour des deux autres modules.
   **Notes :** ....................................................................

---

   ## D. Later Shelf + Fic Appreciation + Fanfic Binge Mode
   1. Ajouter une œuvre à Later Shelf et à la file de lecture.
   2. La marquer Finished dans Fic Appreciation.
   3. Vérifier retrait automatique, progression de file et suggestion suivante selon les réglages choisis.
   **Notes :** ....................................................................

---

   ## E. Series Helper + Chapter Navigation + Reading Tracker
   1. Lire une partie d'une série et un chapitre intermédiaire.
   2. Vérifier que les trois modules indiquent la même progression.
   3. Utiliser Next unread, Continue et la bannière de reprise ; ils doivent mener au bon endroit.
   **Notes :** ....................................................................

---

   ## F. Visual Preferences + Theme Builder + Reading Formatter
   1. Appliquer un thème, une densité et un réglage de lecture.
   2. Vérifier listes, œuvre, commentaires et panneau AO3 Helper.
   3. Désactiver les modules dans l'ordre inverse et vérifier que chaque couche visuelle disparaît sans laisser de style résiduel.
   **Notes :** ....................................................................

---

   ## G. Backup & Sync avec toutes les données
   1. Exporter les données finales.
   2. Noter le nombre visible d'éléments importants : historique, règles, bookmarks locaux, statuts, thèmes et raccourcis.
   3. Restaurer l'export seulement si ce test est accepté.
   4. Comparer les nombres et ouvrir un exemple de chaque type.
   **Notes :** ....................................................................



═══════════════════════════════════════════════════════════════════════════



# Bilan final
   - Version d'AO3 Helper :
   - Navigateur et version :
   - Système/appareil :
   - Date de début :
   - Date de fin :
   - Modules conformes :
   - Modules partiels :
   - Modules non conformes :
   - Modules bloqués ou en attente :

## Problèmes les plus importants
   1.
   2.
   3.

## Changements souhaités
   1.
   2.
   3.

## Observations générales

   ................................................................................

   ................................................................................

   ................................................................................



















































===========================================================================
`Code du projet sur GitHub`
          ↓
`Script Tampermonkey public et installable`
          ↓
`Chargement automatique du code distant`
          ↓
`Fonctionnalités actives sur AO3`
===========================================================================
