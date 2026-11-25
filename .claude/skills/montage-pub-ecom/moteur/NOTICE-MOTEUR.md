# Composants tiers du moteur et leurs licences

Le moteur lui-même est publié sous la **GNU Affero General Public License, version 3** (texte complet dans `LICENSE`, explications dans `AVIS_DE_LICENCE.md`). Copyright (C) 2026 les auteurs du monteur.

Les composants ci-dessous restent sous leur propre licence. Tous sont compatibles avec l'AGPL. Cette liste reprend celle de `AVIS_DE_LICENCE.md`.

| Composant | Licence | Comment il est utilisé |
|---|---|---|
| ffmpeg, ffprobe | LGPL ou GPL selon la compilation | appelé en sous-processus, rien n'est lié au code du moteur |
| numpy | BSD 3 clauses | importé |
| Pillow | MIT-CMU | importé |
| openai-whisper | MIT | facultatif, importé dans la fonction qui s'en sert |
| demucs | MIT | facultatif, appelé en sous-processus |
| Inter | SIL Open Font License 1.1 | fichiers dans `interface/polices/` |
| Geist, Geist Mono | SIL Open Font License 1.1 | fichiers dans `interface/polices/` |
| OpenCut | MIT | idées et structures reprises, aucun fichier recopié |

## Les polices

Les polices restent sous OFL, qui est une licence distincte : l'AGPL du programme ne s'y applique pas. Leurs textes sont dans `interface/polices/` :

- `LICENCE_OFL.txt` : Geist et Geist Mono, Copyright (c) 2023 Vercel, en collaboration avec basement.studio ;
- `LICENCE_OFL_Inter.txt` : Inter, Copyright 2020 The Inter Project Authors.

Elles sont servies par le serveur local : la page ne va chercher aucune police sur Internet.

## Ce qui n'est pas dans le moteur mais qu'il peut appeler

- **Claude Code** (programme `claude`), uniquement si tu actives les voies 2 et 3 : c'est un service tiers payant, soumis à ses propres conditions. Le moteur ne l'embarque pas.
- **Les modèles de Whisper et de demucs** sont téléchargés par ces paquets, chez toi, au premier usage ; ils ont leurs propres licences.

## Idées reprises d'un projet ouvert

Des idées et des structures de **OpenCut** (licence MIT) sont reprises dans ce moteur. Aucun fichier d'OpenCut n'est recopié dans ce dépôt.
