# Échecs

Joue aux échecs contre l'ordinateur, du niveau débutant au grand maître. Toutes les règles sont respectées, la partie est notée coup par coup, et la partie en cours reprend où tu l'avais laissée, même sur un autre PC.

*English version: [README.en.md](README.en.md)*

## À distance (nouveau en 1.5.0)

Une partie d'échecs contre un ami, à distance, grâce à un code ; les couleurs s'échangent à chaque revanche.

## Problèmes (nouveau en 1.4.0)

Un mode problèmes : 414 positions de la base libre de Lichess, choisies près de ton classement, qui monte ou descend comme aux échecs. Un faux coup est refusé, un indice montre la pièce à jouer.

## Parties au format PGN (nouveau en 1.3.0)

COPIER LA PARTIE donne la partie au format PGN, en notation anglaise, lisible par tous les sites d’échecs. OUVRIR CE PGN reprend une partie collée (notation anglaise ou française, avec ou sans commentaires et variantes) et l’ordinateur continue.

## Comment jouer

- **Clique une pièce** puis sa case d'arrivée, ou **fais-la glisser**. Les cases possibles sont marquées d'un point, les prises par des coins rouges.
- Quand un pion atteint la dernière rangée, choisis sa **promotion** sur l'échiquier : dame, tour, fou ou cavalier.
- **Annuler** reprend ton dernier coup (et la réponse de l'ordinateur).
- **Nouvelle partie** recommence ; la liste de couleur choisit **Je joue les blancs**, **Je joue les noirs** ou **Couleur au hasard**. Les blancs commencent.
- Changer de **niveau** en cours de partie s'applique tout de suite, sans recommencer.

## Les règles

Toutes les règles officielles sont prises en compte : petit et grand **roque**, **prise en passant**, promotion, interdiction de laisser son roi en échec. Le jeu annonce « Échec ! » quand ton roi est attaqué.

La partie se termine par :

- **échec et mat** : le roi est attaqué et ne peut pas s'échapper ;
- **pat** (nulle) : le joueur au trait n'a aucun coup légal sans être en échec ;
- **règle des 50 coups** (nulle) : 50 coups de chaque côté sans prise ni mouvement de pion ;
- **triple répétition** (nulle) : la même position revient trois fois ;
- **matériel insuffisant** (nulle) : plus assez de pièces pour mater.

## Les niveaux

Débutant, Facile, Moyen, Difficile, Expert, Maître et Grand maître. Les trois premiers calculent peu de coups à l'avance, et Débutant et Facile commettent volontairement des erreurs ; à partir de Difficile, l'ordinateur cherche le meilleur coup sans erreur, avec de plus en plus de temps de réflexion (jusqu'à 15 secondes par coup).

## Pendant la partie

L'échiquier en pixel art prend la place de l'écran ; ses coordonnées (a à h, 1 à 8) sont écrites sur le cadre. La bande du haut dit à qui c'est le tour, en gros, et clignote en rouge quand ton roi est en échec. Le panneau **Prises** montre les pièces prises de chaque côté et l'avance en matériel. Le panneau **Coups**, à lignes alternées, surligne le dernier coup ; il liste la partie en **notation française** : R roi, D dame, T tour, F fou, C cavalier. L'en-tête montre tes victoires, nulles et défaites au niveau choisi.

## Données et synchronisation

Tes statistiques par niveau et la partie en cours sont enregistrées par NeoDex, sauvegardées et synchronisées entre tes PC si la synchro est activée.

## Installer

Dans NeoDex : **NeoStore → À découvrir → Échecs → Installer**.

Développer un plugin : voir le [SDK NeoDex](https://github.com/NDesumeur/neodex-sdk).
