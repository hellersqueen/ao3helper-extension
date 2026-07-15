# backupAndSync

**Tab:** Appearance & Tools

## À quoi ça sert

Ce module garde une copie de sauvegarde de tout ce que fait AO3 Helper
(réglages, tags masqués, historique de lecture...) pour ne rien perdre en
cas de problème. Il fait des sauvegardes automatiques toutes les 15 minutes,
permet d'exporter ou d'importer ses données dans un fichier, et peut
synchroniser ces données entre plusieurs appareils grâce au compte du
navigateur.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `enableAutoBackup` | activé | Fait une sauvegarde automatique à intervalles réguliers |
| `backupInterval` | `15` | Le temps (en minutes) entre deux sauvegardes automatiques |
| `maxBackups` | `10` | Le nombre de sauvegardes gardées avant de supprimer les plus vieilles |
| `syncEnabled` | désactivé | Synchronise les données entre plusieurs appareils grâce au compte du navigateur |

## Fichiers

### 1. `_backupAndSync.js` — le chef d'orchestre

- Met en route les quatre autres fichiers du module et fait le lien entre eux
- Garde en mémoire la liste des sauvegardes et la partage avec les autres fichiers
- Donne accès à des actions simples pour le reste de l'extension : créer une sauvegarde, la restaurer, exporter une liste de fics...

### 2. `automateBackup.js` — les sauvegardes automatiques

- Fait une première sauvegarde dès que le module démarre
- Refait une sauvegarde toutes les 15 minutes (ou selon l'intervalle choisi)
- Supprime automatiquement les plus vieilles sauvegardes si la limite est dépassée
- Peut restaurer une sauvegarde, après une question de confirmation

### 3. `backupOperations.js` — les sauvegardes à la demande

- Crée une sauvegarde manuelle et la restaure sur demande
- Peut ne sauvegarder que certaines données choisies, plutôt que tout
- Peut protéger une sauvegarde avec un mot de passe (les données sont alors chiffrées)
- Peut compresser une sauvegarde pour qu'elle prenne moins de place
- Peut ne sauvegarder que ce qui a changé depuis la dernière fois, au lieu de tout refaire

### 4. `cloudSync.js` — la synchronisation entre appareils

- Envoie une copie des données vers le compte du navigateur (Chrome/Firefox), pour les retrouver sur un autre appareil
- Récupère les données du compte du navigateur au démarrage, si elles sont plus récentes que celles déjà présentes sur l'appareil
- En cas de différence entre deux appareils, garde toujours la version la plus récente
- Attend un petit moment avant d'envoyer les données, pour éviter de le faire à chaque tout petit changement

### 5. `dataTransfer.js` — exporter et importer

- Exporte tous les réglages de l'extension dans un fichier
- Permet de récupérer un fichier exporté pour tout restaurer
- Exporte la liste des fics affichées sur la page (favoris, historique...) dans un fichier JSON, CSV ou HTML
- Affiche de petits messages pour dire si une action a réussi ou échoué
- Construit les boutons visibles dans le panneau de réglages (exporter, importer, activer/désactiver la synchronisation)

### 6. `backupAndSync.css`

- Les styles visuels des boutons et des petits messages de ce module

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Voir la liste des sauvegardes automatiques et choisir laquelle restaurer, directement depuis le panneau (les sauvegardes existent, mais rien ne permet de les parcourir dans l'interface)
- Un bouton "Sauvegarder maintenant" dans le panneau (la fonction existe déjà à l'intérieur du module, mais aucun bouton ne la déclenche)
- Choisir de protéger une sauvegarde avec un mot de passe, de la compresser, ou de ne garder que ce qui a changé, directement depuis le panneau (ces façons de sauvegarder existent déjà à l'intérieur du module, mais rien ne permet de les choisir dans l'interface)
- Choisir précisément quelles données sauvegarder, plutôt que tout d'un coup, directement depuis le panneau (ça existe déjà à l'intérieur du module, mais pas dans l'interface)
- Voir en un coup d'œil toutes les données sauvegardées, avec leur taille et leur état
- Chercher directement dans ses données sauvegardées
- Vérifier que les données sauvegardées ne sont pas abîmées ou corrompues
- Nettoyer ou mettre à jour automatiquement les données quand l'extension change de version
- Un bouton pour tout effacer d'un coup
- Pouvoir choisir soi-même quelle version garder quand deux appareils ont des données différentes, plutôt que ce soit toujours la plus récente qui gagne automatiquement

## Explicitement écarté

- Passer par un compte GitHub pour la synchronisation entre appareils — jugé trop technique pour la plupart des gens
- Synchroniser tout l'historique de lecture entre appareils — les données sont trop volumineuses pour la petite place disponible dans la synchronisation du navigateur

## Précision

⚠️ La doc historique présentait ce module comme une simple idée pas encore
codée ("Ce qui est prévu"), et listait le chiffrement, la compression, la
sauvegarde incrémentielle et la synchronisation automatique en arrière-plan
comme des idées "explicitement écartées". Ce n'est plus le cas : toutes ces
fonctionnalités sont aujourd'hui bel et bien codées dans le module — il
manque seulement des boutons dans le panneau de réglages pour toutes les
utiliser facilement (voir "Specs non implémentés" ci-dessus). Seule l'idée
d'utiliser un compte GitHub pour la synchronisation a vraiment été
abandonnée.
