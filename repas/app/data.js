/* SHANI · base de recettes et d'ingrédients (V1)
 *
 * Prix : estimations par kg, par litre ou par pièce, niveau hard discount
 * en Belgique (Lidl / Aldi), relevés approximatifs 2026. Ce ne sont PAS des
 * prix réels de magasin : l'app les affiche toujours comme « estimés ».
 * Le coefficient magasin (MAGASINS) ajuste le niveau de prix par enseigne.
 *
 * Quantités des recettes : pour 4 portions adulte (un enfant = 1/2 portion).
 * Unités : g, ml ou pc (pièce). Le prix d'un ingrédient en g/ml est au kg/L.
 */
(function () {
  // [nom, rayon, unité, prix (par kg, L ou pièce), étiquettes]
  var I = {
    // Viandes, poissons, œufs
    hache_mixte:   ["Haché porc-bœuf", "viande", "g", 7.5, ["porc", "boeuf"]],
    hache_boeuf:   ["Haché de bœuf", "viande", "g", 10.5, ["boeuf"]],
    poulet_filet:  ["Filet de poulet", "viande", "g", 9.5, []],
    poulet_cuisses:["Cuisses de poulet", "viande", "g", 4.5, []],
    saucisse:      ["Saucisses", "viande", "g", 7, ["porc"]],
    jambon:        ["Jambon cuit", "viande", "g", 12, ["porc"]],
    lardons:       ["Lardons", "viande", "g", 9, ["porc"]],
    saumon:        ["Saumon (pavés)", "poisson", "g", 19, ["poisson"]],
    cabillaud:     ["Cabillaud surgelé", "surgeles", "g", 12, ["poisson"]],
    thon:          ["Thon en boîte", "epicerie", "g", 10, ["poisson"]],
    oeuf:          ["Œufs", "frais", "pc", 0.25, ["oeuf"]],

    // Produits laitiers
    lait:          ["Lait demi-écrémé", "frais", "ml", 1.05, ["lactose"]],
    beurre:        ["Beurre", "frais", "g", 9, ["lactose"]],
    creme:         ["Crème cuisine", "frais", "ml", 3.5, ["lactose"]],
    fromage_rape:  ["Fromage râpé", "frais", "g", 9, ["lactose"]],
    mozzarella:    ["Mozzarella", "frais", "g", 7, ["lactose"]],
    yaourt:        ["Yaourt nature", "frais", "g", 2.2, ["lactose"]],
    fromage_frais: ["Fromage frais", "frais", "g", 6, ["lactose"]],
    feta:          ["Feta", "frais", "g", 9, ["lactose"]],
    gouda:         ["Gouda en tranches", "frais", "g", 8.5, ["lactose"]],

    // Féculents, pains, céréales
    pates:         ["Pâtes", "epicerie", "g", 1.6, ["gluten"]],
    spaghetti:     ["Spaghetti", "epicerie", "g", 1.6, ["gluten"]],
    lasagne:       ["Feuilles de lasagne", "epicerie", "g", 2.6, ["gluten"]],
    riz:           ["Riz", "epicerie", "g", 1.9, []],
    couscous:      ["Couscous", "epicerie", "g", 2.2, ["gluten"]],
    pdt:           ["Pommes de terre", "legumes", "g", 1.1, []],
    pain_gris:     ["Pain gris", "boulangerie", "g", 1.9, ["gluten"]],
    pain_mie:      ["Pain de mie", "boulangerie", "g", 2.6, ["gluten"]],
    pain_burger:   ["Pains burger", "boulangerie", "pc", 0.3, ["gluten"]],
    wraps:         ["Wraps", "boulangerie", "pc", 0.25, ["gluten"]],
    pate_feuil:    ["Pâte feuilletée", "frais", "pc", 1.3, ["gluten", "lactose"]],
    pate_pizza:    ["Pâte à pizza", "frais", "pc", 1.5, ["gluten"]],
    avoine:        ["Flocons d'avoine", "epicerie", "g", 1.6, ["gluten"]],
    farine:        ["Farine", "epicerie", "g", 0.9, ["gluten"]],
    chapelure:     ["Chapelure", "epicerie", "g", 3, ["gluten"]],
    lentilles:     ["Lentilles corail", "epicerie", "g", 2.8, []],
    pois_chiches:  ["Pois chiches (égouttés)", "epicerie", "g", 2.6, []],
    haricots_rouges:["Haricots rouges (égouttés)", "epicerie", "g", 2.6, []],

    // Fruits et légumes
    carotte:       ["Carottes", "legumes", "g", 1.1, []],
    oignon:        ["Oignons", "legumes", "g", 1.3, ["oignon"]],
    ail:           ["Ail (gousse)", "legumes", "pc", 0.08, []],
    tomate:        ["Tomates", "legumes", "g", 2.6, []],
    courgette:     ["Courgettes", "legumes", "g", 2.1, []],
    poivron:       ["Poivrons", "legumes", "g", 3.2, []],
    brocoli:       ["Brocoli", "legumes", "g", 2.6, []],
    poireau:       ["Poireaux", "legumes", "g", 2.1, []],
    chicon:        ["Chicons", "legumes", "g", 3, []],
    champignons:   ["Champignons", "legumes", "g", 4.2, ["champignons"]],
    salade:        ["Salade", "legumes", "pc", 1.1, []],
    concombre:     ["Concombre", "legumes", "pc", 0.8, []],
    citron:        ["Citron", "legumes", "pc", 0.35, []],
    pomme:         ["Pommes", "legumes", "g", 2.1, []],
    banane:        ["Bananes", "legumes", "g", 1.7, []],
    orange:        ["Oranges", "legumes", "g", 1.9, []],
    haricots_verts:["Haricots verts surgelés", "surgeles", "g", 2.3, []],
    epinards:      ["Épinards surgelés", "surgeles", "g", 2.3, []],
    petits_pois:   ["Petits pois surgelés", "surgeles", "g", 2.1, []],
    legumes_wok:   ["Légumes pour wok surgelés", "surgeles", "g", 2.8, []],
    fruits_rouges: ["Fruits rouges surgelés", "surgeles", "g", 6, []],

    // Épicerie
    tomates_conc:  ["Tomates concassées", "epicerie", "g", 1.6, []],
    coulis:        ["Coulis de tomate", "epicerie", "g", 1.9, []],
    mais:          ["Maïs en boîte (égoutté)", "epicerie", "g", 2.6, []],
    lait_coco:     ["Lait de coco", "epicerie", "ml", 3.3, []],
    huile:         ["Huile d'olive", "epicerie", "ml", 6, []],
    bouillon:      ["Cube de bouillon", "epicerie", "pc", 0.1, []],
    epices:        ["Épices (dose)", "epicerie", "pc", 0.06, []],
    pesto:         ["Pesto", "epicerie", "g", 9, ["lactose"]],
    sauce_soja:    ["Sauce soja", "epicerie", "ml", 4.5, ["gluten"]],
    moutarde:      ["Moutarde", "epicerie", "g", 3, []],
    mayonnaise:    ["Mayonnaise", "epicerie", "g", 3.5, ["oeuf"]],
    miel:          ["Miel", "epicerie", "g", 7, []],
    confiture:     ["Confiture", "epicerie", "g", 3.5, []],
    sucre:         ["Sucre", "epicerie", "g", 1.2, []],
    sirop_liege:   ["Sirop de Liège", "epicerie", "g", 6, []],
    beurre_cacahuete: ["Beurre de cacahuète", "epicerie", "g", 6.5, ["arachide"]],
    compote:       ["Compote de pommes", "epicerie", "g", 2.4, []],
    quinoa:        ["Quinoa", "epicerie", "g", 6, []],
    asperges:      ["Asperges vertes", "legumes", "g", 10, []],
    ailes_poulet:  ["Pilons et ailes de poulet", "viande", "g", 5, []]
  };

  var RAYONS = {
    legumes: "Fruits et légumes", viande: "Boucherie", poisson: "Poissonnerie",
    frais: "Produits frais", boulangerie: "Boulangerie", surgeles: "Surgelés", epicerie: "Épicerie"
  };

  // Coefficient de prix par enseigne (1 = niveau Lidl/Aldi). Estimation.
  var MAGASINS = {
    "Lidl": 1, "Aldi": 1, "Colruyt": 1.04, "Intermarché": 1.12, "Carrefour": 1.16,
    "Delhaize": 1.2, "Albert Heijn": 1.18, "Spar": 1.25, "E.Leclerc": 1.06,
    "Auchan": 1.1, "Super U": 1.12, "Monoprix": 1.35, "Franprix": 1.38,
    "Migros": 1.9, "Coop": 2, "Denner": 1.6
  };

  /* Recettes
   * r : repas (petitdej, lunch, souper) · prep / cuis : minutes
   * i : ingrédients pour 4 portions · e : étapes
   * v : prépa possible la veille [texte, minutes] · img : photo
   * k : enfants (true = plaît en général aux enfants) · garde : jours au frigo
   */
  var R = [
    // ---------- Petits-déjeuners ----------
    { id: "p1", n: "Porridge banane-cannelle", r: "petitdej", prep: 5, cuis: 5, k: true,
      i: [["avoine", 240], ["lait", 800], ["banane", 240], ["miel", 30], ["epices", 1]],
      e: ["Verse les flocons et le lait dans une casserole.", "Fais cuire 5 minutes à feu doux en remuant.", "Ajoute la banane en rondelles, une pointe de cannelle et un filet de miel."] },
    { id: "p2", n: "Tartines beurre-confiture et une pomme", r: "petitdej", prep: 5, cuis: 0, k: true,
      i: [["pain_gris", 320], ["beurre", 40], ["confiture", 80], ["pomme", 600]],
      e: ["Coupe le pain gris en tranches.", "Tartine de beurre et de confiture.", "Sers avec une pomme par personne."] },
    { id: "p3", n: "Yaourt, flocons et fruits rouges", r: "petitdej", prep: 5, cuis: 0, k: true,
      i: [["yaourt", 600], ["avoine", 120], ["fruits_rouges", 200], ["miel", 30]],
      v: ["Sors les fruits rouges du congélateur et mets-les au frigo", 1],
      e: ["Répartis le yaourt dans 4 bols.", "Ajoute les flocons et les fruits rouges.", "Termine par un filet de miel."] },
    { id: "p4", n: "Œufs brouillés et pain gris", r: "petitdej", prep: 5, cuis: 5, k: true,
      i: [["oeuf", 8], ["beurre", 20], ["pain_gris", 240], ["tomate", 300]],
      e: ["Bats les œufs avec du sel et du poivre.", "Fais-les cuire doucement dans le beurre en remuant.", "Sers avec le pain gris et des tomates en tranches."] },
    { id: "p5", n: "Pancakes du week-end", r: "petitdej", prep: 10, cuis: 15, k: true, we: true,
      i: [["farine", 250], ["oeuf", 2], ["lait", 500], ["sucre", 30], ["beurre", 30], ["banane", 240], ["fruits_rouges", 150]],
      v: ["Prépare la pâte à pancakes et garde-la au frigo", 10],
      e: ["Mélange la farine, le sucre, les œufs et le lait jusqu'à obtenir une pâte lisse.", "Fais cuire de petites louches dans une poêle beurrée, 1 à 2 minutes de chaque côté.", "Sers avec la banane et les fruits rouges."] },
    { id: "p6", n: "Tartines fromage frais-concombre et orange", r: "petitdej", prep: 5, cuis: 0, k: true,
      i: [["pain_gris", 320], ["fromage_frais", 160], ["concombre", 1], ["orange", 600]],
      e: ["Tartine le pain de fromage frais.", "Ajoute de fines rondelles de concombre.", "Sers avec une orange par personne."] },
    { id: "p7", n: "Pain perdu aux pommes", r: "petitdej", prep: 10, cuis: 10, k: true, we: true,
      i: [["pain_mie", 300], ["oeuf", 3], ["lait", 300], ["sucre", 30], ["beurre", 30], ["pomme", 300]],
      e: ["Bats les œufs avec le lait et le sucre.", "Trempe les tranches de pain des deux côtés.", "Fais-les dorer au beurre, puis sers avec des pommes poêlées."] },
    { id: "p8", n: "Smoothie banane et tartine cacahuète", r: "petitdej", prep: 5, cuis: 0, k: true,
      i: [["banane", 360], ["lait", 600], ["pain_gris", 240], ["beurre_cacahuete", 60]],
      e: ["Mixe les bananes avec le lait.", "Tartine le pain de beurre de cacahuète.", "Sers bien frais."] },

    // ---------- Lunchs ----------
    { id: "l1", n: "Sandwichs jambon-fromage et crudités", r: "lunch", prep: 10, cuis: 0, k: true,
      i: [["pain_gris", 480], ["jambon", 160], ["gouda", 120], ["salade", 0.5], ["tomate", 200], ["beurre", 30]],
      e: ["Beurre les tranches de pain.", "Garnis de jambon, de fromage, de salade et de tomate.", "Emballe pour la boîte à tartines."] },
    { id: "l2", n: "Wraps poulet-crudités", r: "lunch", prep: 15, cuis: 10, k: true,
      i: [["wraps", 8], ["poulet_filet", 400], ["salade", 0.5], ["tomate", 200], ["mais", 150], ["mayonnaise", 60], ["epices", 1]],
      v: ["Fais cuire le poulet et coupe-le en lanières", 15],
      e: ["Fais cuire le poulet assaisonné 8 à 10 minutes, puis coupe-le en lanières.", "Étale un peu de mayonnaise sur chaque wrap.", "Garnis de poulet, salade, tomate et maïs, puis roule serré."] },
    { id: "l3", n: "Salade de pâtes thon-maïs", r: "lunch", prep: 10, cuis: 10, k: true, garde: 2,
      i: [["pates", 300], ["thon", 250], ["mais", 200], ["tomate", 300], ["mayonnaise", 80]],
      v: ["Fais cuire les pâtes et prépare la salade", 20],
      e: ["Fais cuire les pâtes, puis passe-les sous l'eau froide.", "Mélange avec le thon émietté, le maïs et les tomates en dés.", "Ajoute la mayonnaise et garde au frais."] },
    { id: "l4", n: "Soupe de légumes maison et pain gris", r: "lunch", prep: 15, cuis: 30, k: true, garde: 3,
      i: [["carotte", 400], ["poireau", 300], ["pdt", 400], ["oignon", 100], ["bouillon", 2], ["pain_gris", 240], ["beurre", 20]],
      v: ["Prépare la soupe pour 2 jours", 45],
      e: ["Épluche et coupe les légumes en morceaux.", "Couvre d'eau avec les cubes de bouillon et fais cuire 30 minutes.", "Mixe et sers avec du pain gris beurré."] },
    { id: "l5", n: "Omelette au fromage et salade", r: "lunch", prep: 5, cuis: 10, k: true,
      i: [["oeuf", 8], ["fromage_rape", 100], ["salade", 1], ["pain_gris", 160], ["beurre", 15]],
      e: ["Bats les œufs avec le fromage râpé.", "Fais cuire l'omelette au beurre à feu moyen.", "Sers avec la salade et du pain."] },
    { id: "l6", n: "Croque-monsieur et concombre", r: "lunch", prep: 10, cuis: 10, k: true,
      i: [["pain_mie", 400], ["jambon", 160], ["gouda", 160], ["beurre", 40], ["concombre", 1]],
      e: ["Monte les croques : pain, jambon, fromage, pain.", "Beurre l'extérieur et fais dorer à la poêle ou à l'appareil.", "Sers avec des bâtonnets de concombre."] },
    { id: "l7", n: "Salade de lentilles, feta et carottes", r: "lunch", prep: 15, cuis: 15, k: false, garde: 2,
      i: [["lentilles", 250], ["feta", 150], ["carotte", 300], ["oignon", 50], ["huile", 40], ["moutarde", 10]],
      v: ["Fais cuire les lentilles et prépare la salade", 25],
      e: ["Fais cuire les lentilles 12 à 15 minutes, puis égoutte-les.", "Ajoute les carottes râpées, l'oignon émincé et la feta.", "Assaisonne avec l'huile et la moutarde."] },
    { id: "l8", n: "Wraps houmous et légumes", r: "lunch", prep: 15, cuis: 0, k: false,
      i: [["wraps", 8], ["pois_chiches", 240], ["citron", 1], ["huile", 40], ["ail", 1], ["carotte", 200], ["concombre", 1]],
      v: ["Prépare le houmous", 10],
      e: ["Mixe les pois chiches avec le citron, l'huile et l'ail.", "Étale le houmous sur les wraps.", "Ajoute carottes râpées et concombre, puis roule."] },
    { id: "l9", n: "Taboulé au poulet", r: "lunch", prep: 15, cuis: 10, k: true, garde: 2,
      i: [["couscous", 300], ["poulet_filet", 300], ["tomate", 300], ["concombre", 1], ["citron", 1], ["huile", 40]],
      v: ["Prépare le taboulé", 25],
      e: ["Verse le couscous dans un bol, couvre d'eau bouillante et laisse gonfler 5 minutes.", "Fais cuire le poulet et coupe-le en dés.", "Mélange tout avec les légumes, le citron et l'huile."] },
    { id: "l10", n: "Pâtes pesto, tomates et mozzarella", r: "lunch", prep: 10, cuis: 10, k: true, garde: 2,
      i: [["pates", 300], ["pesto", 120], ["tomate", 300], ["mozzarella", 125]],
      e: ["Fais cuire les pâtes.", "Mélange avec le pesto.", "Ajoute les tomates et la mozzarella en dés."] },
    { id: "l11", n: "Quiche lorraine et salade", r: "lunch", prep: 15, cuis: 35, k: true, garde: 2,
      i: [["pate_feuil", 1], ["oeuf", 4], ["creme", 200], ["lardons", 150], ["fromage_rape", 80], ["salade", 1]],
      v: ["Fais cuire la quiche (elle se mange froide ou réchauffée)", 50],
      e: ["Étale la pâte dans un moule.", "Mélange œufs, crème, lardons et fromage, puis verse sur la pâte.", "Fais cuire 35 minutes à 190 °C et sers avec la salade."] },

    // ---------- Soupers ----------
    { id: "s1", n: "Spaghetti bolognaise aux légumes", r: "souper", prep: 15, cuis: 30, k: true, garde: 3, img: "plats/s1",
      i: [["spaghetti", 400], ["hache_mixte", 500], ["tomates_conc", 800], ["carotte", 200], ["oignon", 100], ["ail", 2], ["fromage_rape", 60], ["huile", 20]],
      v: ["Prépare la sauce bolognaise (elle se garde 3 jours)", 40],
      e: ["Fais revenir l'oignon, l'ail et les carottes en dés dans l'huile.", "Ajoute le haché et fais-le dorer.", "Verse les tomates et laisse mijoter 20 minutes.", "Sers sur les spaghetti avec le fromage râpé."] },
    { id: "s2", n: "Boulettes sauce tomate et riz", r: "souper", prep: 20, cuis: 30, k: true, garde: 3, img: "plats/s2",
      i: [["hache_mixte", 500], ["chapelure", 40], ["oeuf", 1], ["coulis", 700], ["oignon", 80], ["riz", 300]],
      v: ["Forme les boulettes et prépare la sauce", 20],
      e: ["Mélange le haché, la chapelure, l'œuf et l'oignon haché, puis forme des boulettes.", "Fais-les dorer, puis ajoute le coulis et laisse mijoter 20 minutes.", "Sers avec le riz et un peu de persil."] },
    { id: "s3", n: "Poulet rôti, pommes de terre et haricots", r: "souper", prep: 15, cuis: 55, k: true, img: "plats/s3",
      i: [["poulet_cuisses", 1200], ["pdt", 1000], ["haricots_verts", 500], ["huile", 30], ["ail", 2], ["epices", 1]],
      v: ["Fais mariner les cuisses de poulet", 5],
      e: ["Mets les cuisses et les pommes de terre en quartiers dans un plat, avec l'huile, l'ail et les épices.", "Enfourne 55 minutes à 200 °C.", "Fais cuire les haricots verts 8 minutes à l'eau et sers."] },
    { id: "s4", n: "Stoemp carottes, saucisses et compote", r: "souper", prep: 15, cuis: 25, k: true, img: "plats/s4",
      i: [["pdt", 1000], ["carotte", 600], ["saucisse", 600], ["lait", 100], ["beurre", 30], ["oignon", 100], ["compote", 400]],
      v: ["Épluche et coupe les pommes de terre et les carottes", 15],
      e: ["Fais cuire les pommes de terre et les carottes 20 minutes à l'eau salée.", "Pendant ce temps, fais dorer les saucisses et l'oignon.", "Écrase les légumes avec le lait et le beurre, et sers avec les saucisses et la compote."] },
    { id: "s5", n: "Wok de poulet aux légumes et riz", r: "souper", prep: 10, cuis: 15, k: true,
      i: [["poulet_filet", 500], ["legumes_wok", 600], ["riz", 300], ["sauce_soja", 50], ["huile", 20], ["ail", 2]],
      v: ["Coupe le poulet en lanières et garde-le au frigo", 10],
      e: ["Fais cuire le riz.", "Saisis le poulet à feu vif dans l'huile, 5 minutes.", "Ajoute les légumes et l'ail, puis la sauce soja, et cuis 6 minutes."] },
    { id: "s6", n: "Curry de poulet au lait de coco", r: "souper", prep: 15, cuis: 25, k: true, garde: 3,
      i: [["poulet_filet", 500], ["lait_coco", 400], ["tomates_conc", 400], ["oignon", 100], ["epices", 2], ["riz", 300], ["epinards", 200]],
      v: ["Prépare le curry (il est encore meilleur le lendemain)", 35],
      e: ["Fais revenir l'oignon avec le curry en poudre.", "Ajoute le poulet en dés, puis les tomates et le lait de coco.", "Laisse mijoter 20 minutes, ajoute les épinards et sers avec le riz."] },
    { id: "s7", n: "Poulet crème-moutarde et pâtes", r: "souper", prep: 10, cuis: 20, k: true,
      i: [["poulet_filet", 600], ["creme", 250], ["moutarde", 30], ["oignon", 80], ["pates", 400]],
      e: ["Fais dorer le poulet et l'oignon.", "Ajoute la crème et la moutarde, puis laisse réduire 10 minutes.", "Sers avec les pâtes."] },
    { id: "s8", n: "Gratin brocoli-poulet", r: "souper", prep: 20, cuis: 30, k: true, garde: 2,
      i: [["poulet_filet", 400], ["brocoli", 600], ["pdt", 800], ["creme", 200], ["fromage_rape", 120]],
      v: ["Monte le gratin et garde-le au frigo", 25],
      e: ["Fais cuire les pommes de terre en rondelles et le brocoli 8 minutes à l'eau.", "Dispose-les dans un plat avec le poulet en dés et la crème.", "Couvre de fromage et enfourne 30 minutes à 200 °C."] },
    { id: "s9", n: "Hachis parmentier", r: "souper", prep: 20, cuis: 25, k: true, garde: 3,
      i: [["hache_boeuf", 500], ["pdt", 1000], ["lait", 200], ["beurre", 30], ["oignon", 100], ["fromage_rape", 80]],
      v: ["Prépare la purée et la viande, puis monte le plat", 35],
      e: ["Fais une purée avec les pommes de terre, le lait et le beurre.", "Fais revenir l'oignon et le haché.", "Mets la viande dans un plat, couvre de purée et de fromage, puis enfourne 25 minutes à 200 °C."] },
    { id: "s10", n: "Poulet pesto, tomates et mozzarella", r: "souper", prep: 10, cuis: 25, k: true,
      i: [["poulet_filet", 600], ["pesto", 100], ["tomate", 400], ["mozzarella", 250], ["pates", 300]],
      e: ["Mets le poulet dans un plat et nappe-le de pesto.", "Couvre de rondelles de tomate et de mozzarella.", "Enfourne 25 minutes à 200 °C et sers avec les pâtes."] },
    { id: "s11", n: "Lasagne maison", r: "souper", prep: 30, cuis: 40, k: true, garde: 3, img: "plats/s11",
      i: [["lasagne", 300], ["hache_mixte", 500], ["coulis", 700], ["lait", 500], ["beurre", 40], ["farine", 40], ["fromage_rape", 100], ["oignon", 80]],
      v: ["Monte la lasagne et garde-la au frigo", 40],
      e: ["Prépare la sauce : oignon, haché et coulis, 15 minutes.", "Prépare la béchamel : beurre, farine, puis lait en fouettant.", "Alterne pâtes, sauce et béchamel, couvre de fromage et enfourne 40 minutes à 180 °C."] },
    { id: "s12", n: "Saumon, quinoa et asperges vertes", r: "souper", prep: 10, cuis: 20, k: true, img: "plats/s12",
      i: [["saumon", 500], ["quinoa", 250], ["asperges", 500], ["citron", 1], ["huile", 20]],
      e: ["Fais cuire le quinoa 12 minutes dans deux fois son volume d'eau.", "Fais rôtir les asperges 10 minutes à la poêle avec un peu d'huile.", "Fais cuire le saumon 4 minutes de chaque côté et sers avec un filet de citron."] },
    { id: "s13", n: "Cabillaud, purée et petits pois", r: "souper", prep: 15, cuis: 25, k: true,
      i: [["cabillaud", 600], ["pdt", 1000], ["lait", 150], ["beurre", 30], ["petits_pois", 400]],
      v: ["Sors le cabillaud du congélateur et mets-le au frigo", 1],
      e: ["Fais une purée avec les pommes de terre, le lait et le beurre.", "Fais cuire le cabillaud à la poêle ou au four, 10 à 12 minutes.", "Sers avec les petits pois."] },
    { id: "s14", n: "Chili con carne", r: "souper", prep: 15, cuis: 30, k: false, garde: 3,
      i: [["hache_boeuf", 400], ["haricots_rouges", 480], ["tomates_conc", 800], ["poivron", 200], ["oignon", 100], ["mais", 150], ["riz", 300], ["epices", 2]],
      t: ["epice"],
      v: ["Prépare le chili (il est meilleur le lendemain)", 40],
      e: ["Fais revenir l'oignon, le poivron et le haché.", "Ajoute les tomates, les épices, les haricots et le maïs.", "Laisse mijoter 25 minutes et sers avec le riz."] },
    { id: "s15", n: "Pâtes carbonara", r: "souper", prep: 10, cuis: 15, k: true, img: "plats/s15",
      i: [["spaghetti", 400], ["lardons", 200], ["oeuf", 3], ["creme", 200], ["fromage_rape", 80]],
      e: ["Fais cuire les pâtes.", "Fais dorer les lardons.", "Hors du feu, mélange les pâtes avec les lardons, les œufs battus, la crème et le fromage."] },
    { id: "s16", n: "Tortilla de pommes de terre et salade", r: "souper", prep: 15, cuis: 25, k: true, garde: 2,
      i: [["oeuf", 8], ["pdt", 600], ["oignon", 100], ["huile", 40], ["salade", 1]],
      e: ["Fais cuire les pommes de terre en fines tranches et l'oignon dans l'huile, 15 minutes.", "Verse les œufs battus et fais cuire à feu doux.", "Retourne la tortilla et sers avec la salade."] },
    { id: "s17", n: "Dal de lentilles coco et riz", r: "souper", prep: 10, cuis: 25, k: false, garde: 3,
      i: [["lentilles", 300], ["lait_coco", 400], ["tomates_conc", 400], ["oignon", 100], ["ail", 2], ["epices", 2], ["riz", 300]],
      v: ["Prépare le dal (il se garde 3 jours)", 35],
      e: ["Fais revenir l'oignon, l'ail et les épices.", "Ajoute les lentilles, les tomates, le lait de coco et 300 ml d'eau.", "Laisse cuire 20 minutes et sers avec le riz."] },
    { id: "s18", n: "Vol-au-vent maison et purée", r: "souper", prep: 20, cuis: 30, k: true,
      i: [["poulet_filet", 500], ["champignons", 250], ["creme", 200], ["bouillon", 1], ["farine", 30], ["beurre", 60], ["pdt", 1000], ["lait", 150], ["pate_feuil", 1]],
      v: ["Prépare la sauce et le poulet", 30],
      e: ["Fais pocher le poulet en dés dans le bouillon, 15 minutes.", "Fais un roux avec le beurre et la farine, ajoute le bouillon, la crème et les champignons.", "Ajoute le poulet. Sers dans la pâte feuilletée cuite, avec une purée."] },
    { id: "s19", n: "Waterzooi de poulet", r: "souper", prep: 20, cuis: 35, k: true, garde: 2,
      i: [["poulet_filet", 600], ["poireau", 300], ["carotte", 300], ["pdt", 800], ["creme", 200], ["bouillon", 2]],
      v: ["Épluche et coupe tous les légumes", 15],
      e: ["Fais revenir les poireaux et les carottes.", "Ajoute le poulet, les pommes de terre et le bouillon, puis cuis 30 minutes.", "Ajoute la crème avant de servir."] },
    { id: "s20", n: "Boulets sauce lapin et frites au four", r: "souper", prep: 25, cuis: 40, k: true,
      i: [["hache_mixte", 600], ["chapelure", 50], ["oeuf", 1], ["oignon", 150], ["sirop_liege", 80], ["bouillon", 1], ["pdt", 1200], ["huile", 30]],
      v: ["Forme les boulets et garde-les au frigo", 15],
      e: ["Coupe les pommes de terre en frites et enfourne-les 40 minutes à 210 °C avec l'huile.", "Forme 8 boulets et fais-les dorer.", "Ajoute les oignons, le sirop de Liège et le bouillon, puis laisse mijoter 25 minutes."] },
    { id: "s21", n: "Pizza maison jambon-champignons", r: "souper", prep: 15, cuis: 15, k: true, we: true,
      i: [["pate_pizza", 2], ["coulis", 200], ["jambon", 120], ["mozzarella", 250], ["champignons", 150], ["salade", 1]],
      e: ["Étale les pâtes et couvre-les de coulis.", "Ajoute le jambon, les champignons et la mozzarella.", "Enfourne 15 minutes à 220 °C et sers avec la salade."] },
    { id: "s22", n: "Riz cantonais", r: "souper", prep: 10, cuis: 15, k: true,
      i: [["riz", 300], ["oeuf", 3], ["jambon", 150], ["petits_pois", 200], ["sauce_soja", 30], ["huile", 20]],
      v: ["Fais cuire le riz (il est meilleur froid)", 15],
      e: ["Fais une omelette fine et coupe-la en lanières.", "Fais sauter le riz froid dans l'huile avec les petits pois et le jambon en dés.", "Ajoute l'omelette et la sauce soja."] },
    { id: "s23", n: "Gratin de pâtes au thon", r: "souper", prep: 15, cuis: 20, k: true, garde: 2,
      i: [["pates", 400], ["thon", 250], ["creme", 200], ["fromage_rape", 100], ["tomates_conc", 400]],
      v: ["Monte le gratin et garde-le au frigo", 20],
      e: ["Fais cuire les pâtes un peu moins longtemps qu'indiqué.", "Mélange avec le thon, les tomates et la crème.", "Couvre de fromage et enfourne 20 minutes à 200 °C."] },
    { id: "s24", n: "Chicons au gratin", r: "souper", prep: 20, cuis: 30, k: false,
      i: [["chicon", 800], ["jambon", 240], ["lait", 600], ["beurre", 40], ["farine", 40], ["fromage_rape", 100], ["pdt", 800]],
      v: ["Fais cuire les chicons et égoutte-les", 25],
      e: ["Fais cuire les chicons 20 minutes et égoutte-les bien.", "Roule chaque chicon dans une tranche de jambon.", "Couvre de béchamel et de fromage, enfourne 30 minutes à 200 °C et sers avec les pommes de terre."] },
    { id: "s25", n: "Couscous poulet et légumes", r: "souper", prep: 20, cuis: 40, k: true, garde: 3,
      i: [["poulet_cuisses", 800], ["couscous", 300], ["carotte", 300], ["courgette", 400], ["pois_chiches", 240], ["oignon", 100], ["epices", 2]],
      v: ["Prépare le bouillon de légumes et le poulet", 45],
      e: ["Fais dorer le poulet et l'oignon, ajoute les épices.", "Ajoute les légumes, les pois chiches et 1 litre d'eau, puis laisse mijoter 35 minutes.", "Prépare la semoule et sers avec le bouillon."] },
    { id: "s26", n: "Fajitas de poulet", r: "souper", prep: 15, cuis: 15, k: true,
      i: [["wraps", 8], ["poulet_filet", 500], ["poivron", 300], ["oignon", 100], ["fromage_rape", 80], ["salade", 0.5], ["epices", 1]],
      v: ["Coupe le poulet et les poivrons en lanières", 10],
      e: ["Fais sauter le poulet, les poivrons et l'oignon avec les épices.", "Réchauffe les wraps.", "Chacun garnit son wrap avec la salade et le fromage."] },
    { id: "s27", n: "Burgers maison et potatoes", r: "souper", prep: 20, cuis: 30, k: true, we: true,
      i: [["hache_boeuf", 500], ["pain_burger", 4], ["pdt", 1000], ["gouda", 120], ["tomate", 200], ["salade", 0.5], ["huile", 30]],
      e: ["Coupe les pommes de terre en quartiers et enfourne-les 30 minutes à 210 °C avec l'huile.", "Forme 4 steaks et fais-les cuire 3 à 4 minutes de chaque côté.", "Monte les burgers avec le fromage, la tomate et la salade."] },
    { id: "s28", n: "Shakshuka et pain gris", r: "souper", prep: 10, cuis: 20, k: false,
      i: [["oeuf", 8], ["tomates_conc", 800], ["poivron", 300], ["oignon", 100], ["pain_gris", 320], ["epices", 1]],
      e: ["Fais revenir l'oignon et le poivron.", "Ajoute les tomates et les épices, puis laisse mijoter 10 minutes.", "Casse les œufs dans la sauce, couvre 6 minutes et sers avec le pain."] },
    { id: "s29", n: "Pâtes courgettes et feta", r: "souper", prep: 10, cuis: 15, k: true,
      i: [["pates", 400], ["courgette", 600], ["feta", 150], ["ail", 2], ["huile", 30], ["citron", 1]],
      e: ["Fais cuire les pâtes.", "Fais revenir les courgettes en dés avec l'ail dans l'huile.", "Mélange avec les pâtes, la feta émiettée et un filet de citron."] },
    { id: "s30", n: "Courgettes farcies au haché", r: "souper", prep: 20, cuis: 30, k: true, img: "plats/s30", garde: 2,
      i: [["courgette", 1000], ["hache_mixte", 400], ["coulis", 300], ["oignon", 80], ["fromage_rape", 100], ["salade", 0.5], ["tomate", 200]],
      v: ["Prépare la farce et évide les courgettes", 20],
      e: ["Coupe les courgettes en deux dans la longueur et évide-les.", "Fais revenir l'oignon, le haché et la chair des courgettes, puis ajoute le coulis.", "Garnis les courgettes, couvre de fromage et enfourne 30 minutes à 200 °C. Sers avec la salade."] },
    { id: "s31", n: "Pilons de poulet au four, frites et salade", r: "souper", prep: 15, cuis: 40, k: true, img: "plats/s31",
      i: [["ailes_poulet", 1200], ["pdt", 1200], ["huile", 40], ["epices", 2], ["salade", 1], ["tomate", 200]],
      v: ["Fais mariner les pilons avec les épices", 5],
      e: ["Coupe les pommes de terre en frites et mélange-les avec la moitié de l'huile.", "Enrobe le poulet d'huile et d'épices, puis enfourne le tout 40 minutes à 210 °C.", "Sers avec la salade et les tomates."] },

    // Soupers rapides (25 minutes maximum)
    { id: "s32", n: "Pâtes thon-tomate", r: "souper", prep: 5, cuis: 15, k: true,
      i: [["pates", 400], ["thon", 250], ["tomates_conc", 800], ["ail", 2], ["huile", 20], ["fromage_rape", 60]],
      e: ["Fais cuire les pâtes.", "Fais revenir l'ail dans l'huile, ajoute les tomates et laisse réduire 8 minutes.", "Ajoute le thon émietté, mélange avec les pâtes et sers avec le fromage."] },
    { id: "s33", n: "Quesadillas poulet-fromage", r: "souper", prep: 10, cuis: 10, k: true,
      i: [["wraps", 8], ["poulet_filet", 400], ["fromage_rape", 150], ["mais", 150], ["poivron", 150], ["salade", 0.5]],
      e: ["Fais cuire le poulet en petits dés.", "Garnis la moitié de chaque wrap de poulet, maïs, poivron et fromage, puis replie.", "Fais dorer 2 minutes de chaque côté et sers avec la salade."] },
    { id: "s34", n: "Omelette aux légumes et pain gris", r: "souper", prep: 10, cuis: 10, k: true,
      i: [["oeuf", 8], ["courgette", 300], ["tomate", 200], ["fromage_rape", 80], ["pain_gris", 240], ["huile", 15]],
      e: ["Fais revenir la courgette en dés dans l'huile, 5 minutes.", "Verse les œufs battus avec le fromage et ajoute les tomates.", "Fais cuire à feu doux et sers avec le pain gris."] },
    { id: "s35", n: "Pâtes pesto et poulet", r: "souper", prep: 5, cuis: 15, k: true,
      i: [["pates", 400], ["poulet_filet", 400], ["pesto", 120], ["tomate", 250]],
      e: ["Fais cuire les pâtes.", "Fais dorer le poulet en dés.", "Mélange tout avec le pesto et les tomates en dés."] },
    { id: "s36", n: "Riz sauté aux légumes et œufs", r: "souper", prep: 5, cuis: 15, k: true,
      i: [["riz", 300], ["oeuf", 4], ["legumes_wok", 500], ["sauce_soja", 40], ["huile", 20]],
      v: ["Fais cuire le riz (il saute mieux froid)", 15],
      e: ["Fais sauter les légumes dans l'huile, 5 minutes.", "Ajoute le riz cuit, puis les œufs battus en remuant.", "Termine avec la sauce soja."] }
  ];

  // ---------- Calculs ----------
  function tagsDe(rec) {
    var t = {};
    rec.i.forEach(function (x) { (I[x[0]][4] || []).forEach(function (g) { t[g] = 1; }); });
    (rec.t || []).forEach(function (g) { t[g] = 1; });
    var viande = rec.i.some(function (x) { return ["viande", "poisson"].indexOf(I[x[0]][1]) > -1 || x[0] === "thon" || x[0] === "cabillaud"; });
    if (!viande) t.vegetarien = 1;
    return Object.keys(t);
  }
  function coutRecette(rec, magasin) {
    var k = MAGASINS[magasin] || 1;
    return rec.i.reduce(function (s, x) {
      var ing = I[x[0]]; var q = x[1];
      return s + (ing[2] === "pc" ? q * ing[3] : q / 1000 * ing[3]);
    }, 0) * k;
  }
  R.forEach(function (rec) { rec.tags = tagsDe(rec); rec.total = rec.prep + rec.cuis; rec.rapide = rec.total <= 25; });

  window.SHANI = {
    INGREDIENTS: I, RAYONS: RAYONS, MAGASINS: MAGASINS, RECETTES: R,
    cout: coutRecette,
    coutPortion: function (rec, magasin) { return coutRecette(rec, magasin) / 4; }
  };
})();
