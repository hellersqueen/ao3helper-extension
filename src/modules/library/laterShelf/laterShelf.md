# laterShelf

**Tab:** Library

## À quoi ça sert

Ce module transforme la liste "Marked for Later" (MFL) d'AO3 en une vraie
étagère de lecture : un bouton pour ajouter rapidement une fic, un badge pour
repérer les fics déjà dans la liste, le tri et le filtrage avancés de la
liste (dont un tri manuel par glisser-déposer), des niveaux de priorité, des
groupes personnalisés, des notes rapides, une estimation du temps de lecture
total, des rappels programmés (avec récurrence et minuterie intelligente),
et une archive consultable des fics retirées.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showQuickButton` | activé | Affiche le bouton 📌 sur les listes de fics |
| `buttonPosition` | `after-title` | Où placer le bouton 📌 : après le titre, avant le titre, ou en fin de bloc |
| `noteOnAdd` | désactivé | Demande une note rapide (facultative) à chaque ajout |
| `bulkAddEnabled` | désactivé | Ajoute des cases à cocher sur les listes pour ajouter plusieurs fics à la fois |
| `autoRemoveOnFinish` | désactivé | Retire automatiquement une fic une fois marquée "Finished" (Fic Appreciation) |
| `staleDays` | 45 | Seuil (en jours) avant qu'un rappel spécial "ça traîne" ne soit envoyé |
| `gridView` | désactivé | Affiche la page MFL en grille de cartes plutôt qu'en liste |
| `remindersEnabled` | désactivé | Active les rappels programmés (+ les nudges dropped/lingering), avec notification du navigateur |

## Fichiers

### 1. `_laterShelf.js` — le chef d'orchestre

- Met en route les quatre autres fichiers de fonctionnalités de ce module
- Expose `W.AO3H_LaterShelf = { loadItems, saveItems, markCurrent, SK_ITEMS, cfg }`

### 2. `laterShelfStore.js` — la mémoire partagée

- Garde en un seul endroit la liste des fics sauvegardées (priorité, note,
  groupe, ordre manuel, instantané des chapitres à l'ajout), pour que les
  autres fichiers puissent la lire et l'écrire
- `addItem`/`updateItem`/`removeItem`/`reorderItems`/`getGroups`
- Archive non-destructive : `removeItem` archive par défaut ; `restoreItem`
  et `deleteArchiveEntry` gèrent l'archive
- Affiche une petite célébration ("🎉 N fics sauvegardées !") quand la liste
  franchit un cap (10, 25, 50, 100…)

### 3. Logique pure intégrée à `_laterShelf.js`

- Tri (date/titre/mots/mise à jour/priorité/manuel/pépites/"smart"),
  glisser-déposer (maths pures), pioche aléatoire, temps de lecture estimé,
  suggestion selon un budget de temps, seuils de caps franchis, détection de
  fics qui traînent ou mises à jour depuis l'ajout, report de rappel,
  récurrence, heure de pointe de lecture, statistiques de conversion, export
  CSV/liens de liens — testé sans DOM (`laterShelf.logic.test.js`)

### 4. `quickMarkForLaterButton.js` — bouton de sauvegarde rapide

- Ajoute un bouton "📌 Save for later" sur chaque fic d'une liste, à la
  position choisie dans les réglages
- Le bouton change d'apparence ("📌 Saved") si la fic est déjà sauvegardée
- Un clic ajoute ou retire la fic de la liste, avec un toast "Undo"
- Note rapide optionnelle à l'ajout (`noteOnAdd`)
- Ajout groupé depuis n'importe quelle page de résultats (`bulkAddEnabled`)
- Bouton "Add whole series to Later Shelf" sur les pages `/series/:id`

### 5. `markedForLaterStatus.js` — badges, tri, contrôles et sélection

- Affiche un badge 📌 sur les fics déjà sauvegardées, partout où elles
  apparaissent, et un badge "🆕 New chapter" / "✅ Completed!" si la fic a
  changé depuis son ajout
- Sur la page "Marked for Later" : compteur total, temps de lecture total
  estimé, date d'ajout, contrôles de priorité/groupe/note par fic
- Barre de tri (date / titre / mots / mise à jour / priorité / pépites
  cachées / "smart" / manuel avec glisser-déposer) et de filtre (WIP/terminé,
  nombre de mots, fandom, groupe)
- "🎲 Pick for me" (pioche aléatoire) et "⏱ Suggest" (suggestion selon un
  budget de temps disponible)
- Vue grille optionnelle, export CSV / liste de liens
- Sélection multiple pour retirer plusieurs fics à la fois, avec un toast
  "Undo" quand rien n'a été soumis à AO3
- Retrait automatique quand une fic est marquée terminée (`autoRemoveOnFinish`)

### 6. `workReminder.js` — rappels programmés

- Bouton "⏰ Remind me" pour choisir une date de rappel, avec un message
  personnalisé et une récurrence (quotidienne/hebdomadaire) optionnels ;
  l'heure par défaut suit l'heure de pointe de lecture (activityPanel) si
  disponible
- Bouton "💤 Snooze 3d" sur toute fic avec un rappel actif
- Nudges ponctuels et automatiques pour les fics marquées "dropped"
  (Fic Appreciation) ou qui traînent depuis `staleDays` jours sans rappel
- Historique des rappels (déclenchés/annulés/reportés)
- Badge ⏰ sur les fics avec un rappel actif (⚠️ si indisponible)
- Envoie une notification du navigateur quand la date du rappel arrive

### 7. `laterShelfCounterBadge.js` — compteur permanent dans le menu

- Ajoute un badge "📌 N" dans le menu principal du site, sur toutes les pages
- Un clic ouvre un aperçu rapide des dernières fics sauvegardées, sans
  changer de page

### 8. `laterShelf.css`

- Les styles visuels de tous les boutons, badges, contrôles et barres
  ci-dessus, ainsi que des listes du panneau de réglages (groupes, archive,
  historique des rappels, rappels de reprise)

### Panneau de réglages (`lib/ui/panel/configs/library/laterShelf-config.js`)

- Groupes (renommer / effacer), Archive (restaurer / supprimer
  définitivement), Historique des rappels, Rappels de reprise (fics en
  cours issues de readingTracker qui ne sont pas sur l'étagère), Stats
  (combien de fics sauvegardées sont vraiment lues ou abandonnées ensuite)

## Fonctionnalités ajoutées — Chantier 4

- ~~Des niveaux de priorité pour la liste (haute/moyenne/basse)~~ ✅ Fait — champ `priority` par fic (`laterShelfStore.updateItem`), sélecteur sur la page MFL (`markedForLaterStatus.injectItemControls`), et mode de tri dédié.
- ~~Écrire une raison pour laquelle on a sauvegardé une fic~~ ✅ Fait — champ `note`, éditable via le bouton "📝" sur la page MFL, et proposé à l'ajout si `noteOnAdd` est activé (voir aussi l'item suivant, la même fonctionnalité couvre les deux).
- ~~Des statistiques sur la liste (combien de fics sauvegardées sont vraiment lues ensuite)~~ ✅ Fait — section "Stats" du panneau de réglages, croise l'étagère avec `readingTracker` (lu) et `ficAppreciation` (abandonné).
- ~~Réorganiser la liste à la main par glisser-déposer~~ ✅ Fait — mode de tri "Manual" sur la page MFL ; l'ordre est persisté (`laterShelfStore.reorderItems`).
- ~~Piocher une fic au hasard directement depuis la liste~~ ✅ Fait — bouton "🎲 Pick for me", met en surbrillance et fait défiler jusqu'à la fic choisie.
- ~~Des groupes dans la liste (lecture du week-end, fics courtes, gros projets)~~ ✅ Fait — champ `group` libre par fic, filtre par groupe sur la page MFL, gestion (renommer/effacer) dans le panneau de réglages.
- ~~Un message "annuler" après avoir sauvegardé ou retiré une fic~~ ✅ Fait — toast "Undo" (`lib/ui/toast.js`, bouton d'action ajouté au composant partagé) après un ajout, un retrait individuel, ou une suppression groupée sans soumission à AO3.
- ~~Sélectionner plusieurs fics directement sur une page de résultats pour les ajouter toutes en même temps à la liste~~ ✅ Fait — réglage `bulkAddEnabled`, réutilise `lib/ui/bulk-select.js`.
- ~~Retirer automatiquement de la liste les fics qu'on a finies de lire~~ ✅ Fait — réglage `autoRemoveOnFinish`, écoute l'événement `ao3h:workFinished` de Fic Appreciation.
- ~~Voir le temps de lecture estimé pour toute la liste~~ ✅ Fait — affiché sous le compteur sur la page MFL, utilise la vitesse de lecture réelle de `readingTracker` si disponible (sinon 250 mots/min par défaut).
- ~~Des petites célébrations quand on atteint un cap, par exemple "10 fics sauvegardées"~~ ✅ Fait — toast "🎉 N fics sauvegardées !" dans `laterShelfStore.addItem`, même mécanique que les caps de Fic Appreciation.
- ~~Des rappels intelligents qui se basent sur les moments où on lit habituellement~~ ✅ Fait — l'heure par défaut d'un nouveau rappel suit l'heure de pointe de lecture calculée depuis les sessions d'activityPanel.
- ~~Un rappel spécial pour les fics qu'on a abandonnées~~ ✅ Fait — nudge automatique et ponctuel pour toute fic de l'étagère marquée "dropped" dans Fic Appreciation.
- ~~Pouvoir reporter un rappel à plus tard~~ ✅ Fait — bouton "💤 Snooze 3d" sur la page MFL.
- ~~Choisir où placer le bouton de sauvegarde rapide~~ ✅ Fait — réglage `buttonPosition` (avant/après le titre, ou fin de bloc).
- ~~Ajouter une note rapide directement depuis le bouton de sauvegarde~~ ✅ Fait — voir "Écrire une raison…" ci-dessus, même fonctionnalité.
- ~~Choisir parmi plusieurs listes différentes au lieu d'une seule liste "à lire plus tard"~~ ✅ Fait — couvert par les groupes personnalisés : AO3 n'a qu'une seule vraie liste MFL à synchroniser, donc une deuxième liste séparée n'aurait rien eu à représenter côté AO3 ; les groupes offrent la même utilité (sous-catégoriser l'étagère) sans ce problème.
- ~~Trier automatiquement la liste selon des critères intelligents~~ ✅ Fait — mode de tri "Smart" : priorité, puis pépites cachées, puis ancienneté — une formule documentée et transparente, pas une boîte noire.
- ~~Un badge avec le nombre total de fics dans la liste, visible en permanence dans le menu du site, sur lequel on peut cliquer pour voir un aperçu rapide sans changer de page~~ ✅ Fait — `laterShelfCounterBadge.js`.
- ~~Un objectif de lecture hebdomadaire pour vider la liste (par exemple "5 fics par semaine"), avec une barre de progression et un message d'encouragement~~ ❌ Écarté — même décision que `readingDashboard`/`activityPanel` : la lecture reste un loisir, pas un objectif chiffré à atteindre.
- ~~Garder une archive consultable des fics qu'on a retirées de la liste, au lieu de les perdre définitivement~~ ✅ Fait — `laterShelfStore` archive toute suppression par défaut ; section "Archive" du panneau de réglages (restaurer / supprimer définitivement).
- ~~Recevoir les rappels par email, en plus des notifications du navigateur~~ ❌ Écarté — l'extension reste 100% locale, sans backend ni service d'envoi d'email ; contredirait ce principe pour tous les modules.
- ~~Des rappels pour reprendre une fic qu'on est en train de lire, même si elle n'est pas dans la liste "à lire plus tard"~~ ✅ Fait — section "Resume Reminders" du panneau de réglages, lit l'historique de `readingTracker`.
- ~~Ajouter une série entière à la liste en un clic, au lieu de fic par fic~~ ✅ Fait — bouton sur les pages `/series/:id`, lit directement les fics déjà listées sur la page (pas besoin d'aller chercher chaque œuvre séparément, contrairement à `similarFics`).
- ~~Un raccourci clavier pour ajouter rapidement la fic en cours à la liste~~ ✅ Fait — déjà couvert par le module `keyboardShortcuts` (action intégrée `markForLater`, Ctrl+Shift+M par défaut, appelle `W.AO3H_LaterShelf.markCurrent()`) ; non documenté ici jusqu'à présent.
- ~~Une vue en grille avec un aperçu visuel de chaque fic, en plus de la liste actuelle~~ ✅ Fait — case "Grid view" dans la barre de tri de la page MFL.
- ~~Des rappels qui reviennent régulièrement (tous les jours, toutes les semaines) au lieu d'un rappel ponctuel une seule fois~~ ✅ Fait — récurrence `daily`/`weekly` optionnelle à la création d'un rappel.
- ~~Être prévenu quand une fic de la liste reçoit un nouveau chapitre ou est terminée par son auteur~~ ✅ Fait — comparaison passive entre l'état des chapitres à l'ajout et l'état actuel du blurb (badge "🆕 New chapter" / "✅ Completed!"), sans robot ni requête réseau en arrière-plan.
- ~~Des niveaux de priorité (haute/moyenne/basse) pour les fics de la liste~~ ✅ Fait — doublon exact du premier item de cette liste ("Des niveaux de priorité pour la liste").
- ~~Un rappel spécial pour les fics qui traînent depuis longtemps dans la liste sans être lues~~ ✅ Fait — nudge automatique après `staleDays` jours (réglable, 45 par défaut), même mécanique que le nudge "dropped".
- ~~Pouvoir écrire son propre message personnalisé pour les rappels~~ ✅ Fait — champ message optionnel à la création d'un rappel, utilisé dans le corps de la notification.
- ~~Une alerte pour ne pas casser sa série de jours de lecture consécutifs~~ ❌ Écarté — même décision que `readingDashboard` ("Badges et séries de lecture") : les séries de jours consécutifs (streaks) ont été explicitement retirées de l'extension pour ne pas transformer la lecture en jeu ; une alerte anti-streak est justement un mécanisme de streak.
- ~~Faire remonter automatiquement en haut de la liste les "pépites cachées" repérées par un autre module~~ ✅ Fait — mode de tri "Hidden gems first", détection locale à `_laterShelf.js` (mêmes seuils que `ficEngagement/hiddenGems.js`, dupliqués localement plutôt qu'importés — les modules de cette extension ne se partagent des données que via `lib/storage/keys.js` et les globals `window`, jamais en important les fichiers d'un autre module).
- ~~Exporter la liste "à lire plus tard" dans un fichier (par exemple en CSV ou juste la liste des liens)~~ ✅ Fait — boutons "⬇ CSV" et "⬇ Links" dans la barre de tri de la page MFL.
- ~~Garder un historique des rappels passés (envoyés ou annulés), pas seulement les rappels en cours~~ ✅ Fait — section "Reminder History" du panneau de réglages.
- ~~Mettre une fic en favori et l'ajouter à la liste "à lire plus tard" en un seul clic, au lieu de faire les deux actions séparément~~ ❌ Écarté — même décision que `similarFics` : créer un bookmark AO3 par script nécessite un `pseud_id` non prévisible par work, ce qui rend l'automatisation de la création de bookmark peu fiable.
- ~~Utiliser la longueur des fics pour te suggérer quoi lire selon le temps que tu as devant toi (par exemple une fic courte si tu as peu de temps)~~ ✅ Fait — champ "⏱ minutes" + bouton "Suggest" dans la barre de tri, suggère la fic qui utilise le mieux le temps disponible.

## Explicitement écarté

- Une date limite de lecture façon "deadline" — jugé trop rigide
- Partager sa liste "à lire plus tard" avec d'autres personnes — pour rester privé
- Une liste "spéciale session" encore plus temporaire que la liste "à lire plus tard" — écarté, la liste "à lire plus tard" sert déjà à ça
- Colorer les fics selon depuis combien de temps elles traînent dans la liste — écarté, jugé trop culpabilisant
- Un objectif de lecture hebdomadaire avec barre de progression — écarté, anti-gamification (voir `readingDashboard`)
- Les rappels par email — écarté, l'extension reste 100% locale sans backend
- Une alerte anti-streak (série de jours de lecture consécutifs) — écarté, anti-gamification (voir `readingDashboard`)
- Bookmark AO3 + ajout à l'étagère en une seule action — écarté, création de bookmark par script peu fiable (voir `similarFics`)

## Précision

⚠️ La doc historique anglaise décrit un robot qui parcourrait en arrière-plan
les pages de la liste MFL, ainsi qu'une synchronisation entre onglets.
Aucun des deux n'existe dans le code actuel, et ça reste vrai après ce
chantier : la liste est stockée sur l'ordinateur, mise à jour directement par
les boutons de marquage. La détection "nouveau chapitre / terminé" ajoutée
ici est **passive** (comparaison au moment où le blurb est affiché), pas un
robot qui interrogerait AO3 en arrière-plan.
