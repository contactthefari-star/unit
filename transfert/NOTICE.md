# Installer Lensdental sur ton compte Claude

Environ 15 minutes. Tu deviens propriétaire de l'application : c'est toi la responsable.

## Étape 1 — Récupérer la sauvegarde (sur l'ancienne application)

À faire par la personne qui a l'ancienne version :

1. Ouvrir l'application actuelle → **Accès & outils** → carte **Sauvegardes**.
2. Cliquer **Sauvegarder maintenant**.
3. Sur la ligne qui vient d'apparaître, cliquer **Télécharger**.
   Le fichier `lensdental-sauvegarde-AAAA-MM-JJ.json` arrive dans les téléchargements.
4. Te l'envoyer, avec le fichier `lensdental-app.html` de ce dossier.

## Étape 2 — Publier l'application (sur ton compte Claude)

1. Ouvre une nouvelle conversation avec Claude (claude.ai ou Claude Code).
2. Joins le fichier **`lensdental-app.html`**.
3. Copie-colle ce message :

> Publie ce fichier HTML tel quel comme Artifact, sans rien modifier, avec ces capacités exactement :
> ```json
> {"artifact":{},"assets":{},"downloads":true,"user":{"scopes":["profile"]},"db":{"rules":[
> {"path":"","read":"view","write":"admin"},
> {"path":"pointages","read":"admin","write":"admin"},{"path":"pointages/{self}","read":"interact","write":"interact"},
> {"path":"propositions","read":"admin","write":"admin"},{"path":"propositions/{self}","read":"interact","write":"interact"},
> {"path":"suivi","read":"admin","write":"admin"},{"path":"suivi/{self}","read":"interact","write":"interact"},
> {"path":"votes","read":"admin","write":"admin"},{"path":"votes/{self}","read":"interact","write":"interact"},
> {"path":"evals","read":"admin","write":"admin"},{"path":"heures","read":"admin","write":"admin"},
> {"path":"recup","read":"admin","write":"admin"},{"path":"taches","read":"admin","write":"admin"},
> {"path":"dentistes","read":"admin","write":"admin"},{"path":"maladies","read":"admin","write":"admin"},
> {"path":"codes","read":"admin","write":"admin"},{"path":"sauvegardes","read":"admin","write":"admin"},
> {"path":"contrats","read":"admin","write":"admin"},{"path":"dossiers","read":"admin","write":"admin"},
> {"path":"moi","read":"admin","write":"admin"},{"path":"photos","read":"view","write":"admin"},
> {"path":"boite","read":"interact","write":"interact"}]}}
> ```
> Donne-moi ensuite le lien.

4. Ouvre le lien. Choisis ton **code responsable** (4 chiffres ou plus).

## Étape 3 — Importer les données

1. Dans ta nouvelle application → **Accès & outils** → carte **Sauvegardes**.
2. Clique **Importer une sauvegarde (fichier)** et choisis le fichier `.json` de l'étape 1.
3. Confirme avec **Importer**.
4. Clique **Publier** dans la barre en bas pour enregistrer le planning.

Ce qui revient : planning, contrats, anniversaires, heures, récups, maladies, congés, entretiens et dossiers, tâches, news, réunions, boîte à idées, récompenses, réglages, codes tablette des filles.

Ce qui ne revient pas (lié à l'ancien compte) :
- ton code responsable : tu en as choisi un nouveau à l'étape 2 ;
- les comptes personnels des filles liés à l'ancien compte : à réactiver dans Accès & outils quand elles se connectent ;
- les anciennes sauvegardes et les photos (de profil et de saison) : à remettre si besoin.

## Étape 4 — Les filles

- **Sur la tablette du cabinet** : connecte-toi à Claude avec ton compte, ouvre le lien. Les filles utilisent leur code tablette habituel.
- **Sur leur téléphone** : bouton **Partager** de l'application → leur e-mail, niveau qui permet de participer (pas Éditeur). Ensuite, active leur compte dans Accès & outils.

Une fois tout vérifié, l'ancienne application peut être supprimée.
