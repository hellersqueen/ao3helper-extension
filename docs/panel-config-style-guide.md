# Règles visuelles des configurations du panel

Ce document est le contrat commun des configurations dans
`lib/ui/panel/configs/`. Une config peut contenir une interface spécialisée,
mais sa structure, sa typographie, ses espacements et ses actions principales
doivent rester prévisibles.

## Anatomie obligatoire

Chaque config suit cet ordre :

```html
<div class="ao3h-config-section">
  <div class="ao3h-config-section-title">Titre de section</div>

  <div class="ao3h-setting-item">
    <label class="ao3h-setting-label">Nom du réglage</label>
    <div class="ao3h-setting-control">
      <!-- contrôle -->
    </div>
    <div class="ao3h-setting-description">Conséquence ou précision utile.</div>
  </div>
</div>

<div class="ao3h-config-footer">
  <button class="ao3h-config-reset-btn">Reset to Defaults</button>
  <button class="ao3h-config-save-btn">Save Settings</button>
</div>
```

Règles :

1. Une config contient au moins une `ao3h-config-section`.
2. Chaque section commence par un unique `ao3h-config-section-title`.
3. Une option autonome utilise `ao3h-setting-item`.
4. Son nom, ses contrôles et son aide utilisent respectivement
   `ao3h-setting-label`, `ao3h-setting-control` et
   `ao3h-setting-description`.
5. Le footer est unique, placé en dernier, avec Reset à gauche et Save à droite.
6. Le texte des boutons et des titres suit la casse de phrase, sans tout mettre
   en majuscules dans le HTML.

## Grille et espacements

- Le layout par défaut est la grille responsive fournie par `panel.css` :
  deux colonnes quand l’espace le permet, une colonne sur petit écran.
- Ne pas ajouter de `margin`, `padding`, `display`, `gap`, `flex` ou `grid`
  inline. Utiliser `ao3h-config-row`, `ao3h-config-block`, `ao3h-indent` et
  leurs modificateurs.
- Utiliser `ao3h-full` seulement lorsqu’un item doit réellement occuper toute
  la largeur et que l’auto-détection ne suffit pas.
- Les détails propres à un module doivent être scopés sous
  `[data-config-module="<moduleId>"]` ou sous une classe racine propre à la
  config. Ils ne doivent pas cibler des éléments AO3 génériques.

## Champs

Le nom canonique d’un champ est `ao3h-config-input`.
`ao3h-setting-input` reste temporairement supporté pour la migration.

Les largeurs inline sont remplacées par ces tailles :

| Classe | Usage | Largeur |
| --- | --- | ---: |
| `ao3h-field--xs` | valeur très courte, icône, petit nombre | 60 px |
| `ao3h-field--sm` | nombre, heure, pourcentage | 80 px |
| `ao3h-field--md` | mot-clé, raccourci, valeur courte | 120 px |
| `ao3h-field--lg` | recherche ou valeur lisible | 200 px |
| `ao3h-field--fill` | URL, liste, texte libre | largeur disponible |

Un select utilise `ao3h-setting-select`. Une checkbox ou un radio reste dans
`ao3h-setting-control`; on n’ajoute pas de style de taille en ligne.

## Actions

- `ao3h-config-save-btn` : sauvegarde globale de la config.
- `ao3h-config-reset-btn` : retour aux valeurs par défaut.
- `ao3h-inline-btn` : action locale neutre.
- `ao3h-inline-btn--green` : ajout ou confirmation locale.
- `ao3h-inline-btn--danger` : suppression ou action destructive.
- `ao3h-config-row--end` : rangée d’actions alignée à droite.

La couleur ne doit jamais être le seul signal d’une action : garder un libellé
explicite et, si nécessaire, un symbole.

## Exceptions

Les valeurs visuelles qui représentent réellement des données peuvent rester
dynamiques, par exemple la couleur de fond d’un swatch. Les interfaces riches
(gestionnaire de listes, tableau de raccourcis, sélecteur personnalisé) peuvent
ajouter leurs propres classes, mais elles réutilisent les primitives communes
pour les champs, descriptions et boutons.

Toute nouvelle exception doit être locale à la config, responsive et justifiée
par un comportement qui ne peut pas être exprimé avec les primitives communes.
