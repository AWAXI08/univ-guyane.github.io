# Notre frise

La frise affiche automatiquement les contributions non vides, dans l’ordre initial des étudiants. 

## Contribuer

1. Faire un fork du dépôt, le cloner et créer une branche.
2. Saisir la clé transmise en cours sur la page principale. La liste des étudiants est visible dans la colonne de droite.
3. Utiliser le champ de recherche pour filtrer par nom ou identifiant de dossier. La recherche ignore les majuscules et les accents. Recopier l’identifiant de son dossier ; ce n’est pas une clé de chiffrement personnelle.
4. Écrire son contenu dans `contributions/IDENTIFIANT/index.html` et ses styles dans `contributions/IDENTIFIANT/style.css`.
5. Tester, add, commit, pousser sa branche et ouvrir une pull request.

Les deux fichiers sont entièrement vides au départ. Écrire directement ses balises HTML

Seuls les fichiers HTML contenant autre chose que des espaces, tabulations et retours à la ligne sont affichés. Un commentaire HTML ou une balise vide compte comme du contenu. Le CSS seul ne suffit pas à faire apparaître une contribution.

Ne modifier que ses propres fichiers. Conserver le nom du dossier et les identités chiffrées. Les trois fichiers communs `index.html`, `style.css` et `script.js` sont réservés à l’enseignant.

Chaque contribution est affichée dans une iframe : son CSS ne modifie pas le reste de la page. Les chemins relatifs des images et autres ressources se résolvent depuis son dossier. L’espace est haut de 420 px et peut défiler intérieurement.

Ne publier ni clé, ni nom, ni email personnel dans le contenu ou les messages de commit. Les profils et les métadonnées GitHub restent publics. La clé n’est pas stockée.

