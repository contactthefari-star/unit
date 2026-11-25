"""Chargeur de clés commun aux skills `recherche-avatar` et `montage-pub-ecom`.

Règles :
- Aucune clé n'est livrée avec les skills. Chaque personne crée les siennes (voir CLES.md).
- Ordre de lecture : 1) variable d'environnement, 2) fichiers listés dans la variable
  PUBS_SKILLS_CLES (séparés par « : »), 3) ~/.config/pubs-skills/cles.env
- Une clé n'est JAMAIS affichée, ni écrite dans un journal, ni passée dans une URL imprimée.
  `masque()` sert à afficher une phrase d'erreur sans la clé.

Usage dans un script :
    from charge_cles import cle, masque
    k = cle("BRAVE_API_KEY")            # quitte avec un message clair si absente
    k = cle("YOUTUBE_API_KEY", obligatoire=False)   # renvoie None si absente
"""
import os
import sys

FICHIER_PAR_DEFAUT = os.path.expanduser("~/.config/pubs-skills/cles.env")


def _lire(chemin):
    sortie = {}
    try:
        with open(os.path.expanduser(chemin), encoding="utf-8") as f:
            for ligne in f:
                ligne = ligne.strip()
                if not ligne or ligne.startswith("#") or "=" not in ligne:
                    continue
                nom, valeur = ligne.replace("export ", "", 1).split("=", 1)
                sortie[nom.strip()] = valeur.strip().strip('"').strip("'")
    except OSError:
        pass
    return sortie


def cle(nom, obligatoire=True):
    if os.environ.get(nom):
        return os.environ[nom]
    chemins = [c for c in os.environ.get("PUBS_SKILLS_CLES", "").split(":") if c]
    chemins.append(FICHIER_PAR_DEFAUT)
    for chemin in chemins:
        valeur = _lire(chemin).get(nom)
        if valeur:
            return valeur
    if obligatoire:
        sys.exit(
            f"{nom} est absente. Ouvre CLES.md, crée la clé (étape guidée), puis écris la ligne\n"
            f"  {nom}=ta_cle\n"
            f"dans {FICHIER_PAR_DEFAUT} (ce fichier ne doit jamais être partagé)."
        )
    return None


def masque(texte, *cles):
    for k in cles:
        if k:
            texte = texte.replace(k, "***")
    return texte


if __name__ == "__main__":
    # Vérification sans rien afficher d'une valeur : « présente » ou « absente ».
    for nom in sys.argv[1:]:
        print(nom, "présente" if cle(nom, obligatoire=False) else "absente")
