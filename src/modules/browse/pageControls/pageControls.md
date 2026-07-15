# pageControls

**Tab:** Browse

## À quoi ça sert

Ce module améliore la navigation entre les pages de résultats sur AO3
(fics, tags, favoris, historique, collections) : sauter directement à une
page, choisir combien de fics afficher par page, et des boutons de
navigation supplémentaires.

## Réglages utilisateur

| Réglage | Par défaut | Ce que ça fait |
|---|---|---|
| `showPlusMinus10Buttons` | activé | Affiche les boutons pour avancer/reculer de 10 pages |
| `worksPerPageEnabled` | activé | Active le menu pour choisir 20, 50 ou 100 fics par page |
| `worksPerPage` | `20` | Le nombre de fics affichées par page, par défaut |
| `infiniteScrollEnabled` | désactivé | Active le défilement infini (ce réglage existe, voir "Specs non implémentés") |

## Fichiers

### 1. `_pageControls.js` — le chef d'orchestre

- Ne s'active que sur les pages qui affichent une liste de fics
- Met en route les trois autres fichiers de fonctionnalités

### 2. `coreNavigation.js` — sauter directement à une page

- Ajoute un petit champ ("Page [_] / N") sous la pagination, pour taper un numéro de page et y aller directement

### 3. `worksPerPage.js` — nombre de fics par page

- Un menu pour choisir d'afficher 20, 50 ou 100 fics par page
- Se souvient du choix et l'applique automatiquement la prochaine fois

### 4. `enhancedNavigation.js` — navigation enrichie

- Ajoute une rangée de boutons "First / −10 / Prev / Next / +10 / Last" au-dessus de la pagination normale
- Les boutons se désactivent tout seuls quand on est déjà à la première ou dernière page

### 5. `pageControls.css`

- Les styles visuels des trois widgets ci-dessus

## Specs non implémentés

Ce sont des idées dont on parle dans d'autres docs, mais qui n'existent pas
vraiment dans ce module (pas de code pour ça) :

- Le défilement infini (charger automatiquement la suite pendant qu'on descend la page, sans changer de page) — un réglage porte ce nom, mais rien ne le fait vraiment
- Se souvenir de la dernière page où on était pour pouvoir y retourner plus tard
- Aller à une page complètement au hasard
- Sauter à un pourcentage de la liste, par exemple "aller au quart" ou "à la moitié"
- Des boutons pour sauter 50 pages d'un coup, en plus des boutons qui sautent 10 pages
- Choisir soi-même de combien de pages sautent les boutons rapides
- Deviner tout seul le nombre idéal de fics à afficher selon la situation
- Se souvenir des pages visitées récemment, ou proposer des pages à revisiter
- Avoir des réglages de pagination différents selon le type de page (recherche, tags, favoris...)
- Choisir où positionner le champ pour taper le numéro de page
- Une barre de progression visuelle qui montre où on en est dans la liste de pages
- Une barre de navigation qui reste collée en haut de l'écran même en scrollant
- Un bouton pour remonter tout en haut de la page en un clic

## Explicitement écarté

- Suggérer automatiquement des pages "intéressantes" à visiter — jugé trop compliqué pour le bénéfice apporté
