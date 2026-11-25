# Ce dont l'outil a besoin

## Les binaires

`ffmpeg` et `ffprobe` font tout le travail video. Ils ne sont pas des
paquets Python : il faut les installer a part.

    macOS    brew install ffmpeg
    Debian   sudo apt install ffmpeg
    Arch     sudo pacman -S ffmpeg

Verifie ensuite que les deux repondent :

    ffmpeg -version
    ffprobe -version

Teste sur un seul systeme ; pour les autres : voir les replis decrits plus bas.

## Python

Python 3.11 ou plus recent.

    python3 -m venv venv
    ./venv/bin/pip install -r requirements.txt

Pour la transcription et la separation de voix, ajoute les deux paquets
commentes dans `requirements.txt`. `openai-whisper` tire `torch`, ce qui
represente environ 2,5 Go : ne l'installe que si tu comptes dicter ou
transcrire.

## Ce qui est propre a macOS

Trois choses sont liees a macOS, avec un repli
ailleurs (ecrit mais non essaye sur un autre systeme) :

- **L'encodeur video.** Sur macOS l'outil utilise l'encodeur materiel
  `h264_videotoolbox`. Si ffmpeg ne le connait pas, il passe tout seul sur
  `libx264`. Pour forcer un encodeur : `MONTEUR_ENCODEUR=libx264`.
- **Les polices des sous-titres.** Arial, Arial Black, Impact et Verdana Bold
  sont lues dans les polices systeme de macOS. Ailleurs, l'outil cherche leurs
  equivalents Windows, puis DejaVu ou Liberation sur Linux ; s'il ne trouve
  rien, Pillow dessine avec sa police par defaut, moins belle, et le rendu
  l'ANNONCE par un message « ATTENTION : police introuvable » (n'ignore jamais ce message).
- **Le mode `--telephone`**, decrit ci-dessous.

Le mode `--telephone` lit le nom et l'adresse de la machine avec
`scutil` et `ipconfig`, deux commandes macOS. Hors macOS il retombe sur
`socket`, ce qui marche mais choisit l'interface qui sort vers Internet.
Sur une machine avec un VPN, ce n'est pas forcement celle que le
telephone voit. Le serveur affiche les deux adresses au demarrage :
si `.local` ne repond pas et que l'adresse annoncee ne ressemble pas a
ton reseau local, prends celle de ta box.

Le mode normal, sur `127.0.0.1`, ne depend d'aucune commande systeme.

Le mode `--telephone` demande en plus un certificat TLS que l'outil ne fournit
pas : deux fichiers `serveur.crt` et `serveur.key` a poser dans un dossier `tls/`
a la racine du moteur (voir le commentaire de la section « LE TELEPHONE » dans
`outils/serveur.py`). Sans eux, le serveur l'annonce et le telephone reste ferme.
C'est un mode facultatif, reserve a qui sait fabriquer un certificat.

## Les variables d'environnement

| variable | effet |
|---|---|
| `MONTEUR_AVEC_CLAUDE=1` | ACTIVE les voies 2 et 3 (payantes) : une phrase non comprise ou des vignettes partent vers Claude Code. Sans cette variable, elles sont coupées |
| `MONTEUR_SANS_CLAUDE=1` | coupe les voies 2 et 3 quoi qu'il arrive |
| `MONTEUR_ENCODEUR=libx264` | force l'encodeur video du rendu |
| `MONTEUR_PYTHON_VOIX=/chemin/python` | designe le python qui porte Whisper (par defaut, celui du serveur) |
| `MONTEUR_HOTES=nom.exemple` | autorise un nom d'hote de plus devant le serveur (tunnel) |
