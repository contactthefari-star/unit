# MASTER PRODUCT ROADMAP — Ecom Command Center

Source unique de vérité. **Chaque fonctionnalité du cahier des charges est listée ici.** Rien n'est supprimé ni simplifié sans accord explicite.

Statuts : **NOW** = MVP (V1) · **NEXT** = V2–V4 · **LATER** = V5–V8
État : ✅ livré et testé · 🟡 partiel · ⛔ bloqué · ⬜ à faire

Colonnes : Fonctionnalité · Objectif · Dépendances · Statut · Version · État · Critère de validation

---

## M0 — Fondations (§21, §22)

| Fonctionnalité | Objectif | Dépendances | Statut | Version | État | Critère de validation |
|---|---|---|---|---|---|---|
| Couche de données unique (store) | Basculer local → Supabase sans toucher aux écrans | — | NOW | V1 | ✅ | Tests d'isolation, persistance, import/export verts |
| Isolation des données par projet | Jamais de mélange entre projets | Store | NOW | V1 | ✅ | Lecture/écriture scopées refusées sans projectId ; projectId immuable |
| Sauvegarde export/import JSON | Ne jamais perdre ses données | Store | NOW | V1 | ✅ | Export puis import restitue l'état |
| Authentification sécurisée | Compte personnel, multi-appareil | Projet Supabase | NOW | V1 | ⛔ | Bloqué : nécessite un projet Supabase (URL + clé anon). Mode local en attendant |
| Synchronisation cloud (Supabase + RLS) | Accès multi-appareil, sauvegarde serveur | Auth | NEXT | V2 | ⬜ | RLS testée : un user ne lit jamais les données d'un autre |
| Journal des actions importantes | Traçabilité | Store | NOW | V1 | 🟡 | Activité locale enregistrée ; journal serveur en V2 |
| Protection des clés API | Clés jamais dans le front | Fonction serveur | NOW | V1 | ✅ | Clé uniquement en variable d'env Vercel |
| Validation des entrées | Robustesse | — | NOW | V1 | ✅ | Formulaires bornés ; API valide rôles, tailles, expert |
| Gestion des coûts IA | Budget IA maîtrisé | Copilot | NOW | V1 | 🟡 | Historique limité à 12 messages, max_tokens 4000, effort medium. Quota par user en V2 |
| Gestion des erreurs | Messages clairs | — | NOW | V1 | ✅ | Erreurs API traduites en français, jamais de faux succès |
| Sauvegardes serveur automatiques | Résilience | Supabase | NEXT | V2 | ⬜ | Backups quotidiens activés |

## M1 — Global Command Center (§4)

| Fonctionnalité | Objectif | Dépendances | Statut | Version | État | Critère |
|---|---|---|---|---|---|---|
| Nombre de projets actifs | Vue d'ensemble | Projets | NOW | V1 | ✅ | KPI affiché |
| Projet prioritaire | Un seul focus | Projets | NOW | V1 | ✅ | Un seul prioritaire à la fois |
| Progression des projets | Savoir où on en est | Parcours 15 phases | NOW | V1 | ✅ | % basé sur missions validées |
| Budget global, dépenses, revenus | Garder le contrôle du cash | Finance simple | NOW | V1 | ✅ | Agrégation des montants réels uniquement |
| Projets en attente | Voir ce qui est en pause | Statuts projet | NOW | V1 | ✅ | Statut Actif / En pause / Archivé |
| Prochaines étapes | Savoir quoi faire | Tâches | NOW | V1 | ✅ | Prochaine tâche par projet |
| Accès en 1 clic à chaque projet | Fluidité | Routage | NOW | V1 | ✅ | Bouton Ouvrir |
| Comparateur de projets | Identifier le plus prometteur | Produits, finance | NOW | V1 | ✅ | Tableau : phase, progression, meilleur score, dépenses, revenus |
| Ressources communes partagées | Formations, modèles, checklists, fournisseurs communs, benchmarks | Bibliothèque | NEXT | V2 | ⬜ | Ressource globale visible dans tous les projets |

## M2 — Architecture multi-projets / boutiques / marques (§3)

| Fonctionnalité | Objectif | Dépendances | Statut | Version | État | Critère |
|---|---|---|---|---|---|---|
| Créer / renommer / archiver / supprimer un projet | Gérer plusieurs activités | Store | NOW | V1 | ✅ | Suppression en cascade testée |
| Sélecteur de projet toujours accessible | Changer vite | — | NOW | V1 | ✅ | Dans la sidebar, toutes les pages |
| Espace de travail par projet | Isolation | — | NOW | V1 | ✅ | Dashboard, tâches, produits, fichiers par projet |
| Plusieurs boutiques par projet (Niveau 3) | Multi-boutique | Store Builder | NEXT | V3 | ⬜ | Collection `stores` déjà prévue dans le modèle |
| Marques associées à plusieurs boutiques (Niveau 4) | Construire des marques | Brand Builder | NEXT | V3 | ⬜ | Collection `brands` déjà prévue |

## M3 — Daily Operating System (§5)

| Fonctionnalité | Objectif | Dépendances | Statut | Version | État | Critère |
|---|---|---|---|---|---|---|
| Bouton DÉMARRER MA JOURNÉE | Lancer la journée en 1 clic | Tâches, parcours | NOW | V1 | ✅ | Plan généré, pas de doublon le même jour |
| Analyse projets / tâches / objectifs / blocages | Plan pertinent | Tâches | NOW | V1 | ✅ | Tri : projet prioritaire, en cours, échéance, phase |
| 1 priorité + 2 secondaires max | Anti-surcharge TDAH | — | NOW | V1 | ✅ | Test : 3 tâches max |
| Temps estimé + résultat attendu | Clarté | Missions | NOW | V1 | ✅ | Affichés sur chaque mission |
| Guidage pas à pas (quoi, pourquoi, comment, outils, interprétation, livrable) | Ne jamais être perdu | Missions | NOW | V1 | ✅ | Bloc mission complet |
| Suivi de l'avancement | Savoir où on en est | — | NOW | V1 | ✅ | Statuts À faire / En cours / Terminé |
| Passage automatique à l'étape suivante si données disponibles | Moins de clics | Missions « check » | NOW | V1 | ✅ | Validation par les données réelles (ex. 5 produits notés) |
| Jamais de validation inventée | Fiabilité | — | NOW | V1 | ✅ | Preuve obligatoire ; test de refus sans preuve |
| Bouton TERMINER MA JOURNÉE + bilan | Clôturer | — | NOW | V1 | ✅ | Réalisé, non terminé, minutes, compétences, blocages |
| Replanification intelligente | Rien ne se perd | — | NOW | V1 | ✅ | Tâches non faites remises en file, compteur de reports, alerte à 3 reports |
| Zéro culpabilisation | Bien-être TDAH | — | NOW | V1 | ✅ | Message neutre après absence |
| Mode Focus | Travailler sans distraction | — | NOW | V1 | ✅ | Masque sidebar et tâches secondaires |
| Plan du jour généré par l'IA | Plan plus fin | Copilot | NEXT | V2 | ⬜ | Plan IA proposé, validé par l'utilisateur |

## M4 — Gestion des tâches et progression

| Fonctionnalité | Objectif | Dépendances | Statut | Version | État | Critère |
|---|---|---|---|---|---|---|
| Tâches issues des missions | Exécuter le parcours | Parcours | NOW | V1 | ✅ | Générées à chaque phase |
| Tâches libres (titre, durée, échéance, note) | Flexibilité | — | NOW | V1 | ✅ | Création / suppression |
| Historique des tâches terminées + preuves | Traçabilité | — | NOW | V1 | ✅ | Liste « Terminées » |

## M5 — Parcours débutant → marque (§20)

| Fonctionnalité | Objectif | Dépendances | Statut | Version | État | Critère |
|---|---|---|---|---|---|---|
| 15 phases avec missions, livrables, critères, compétences | Guidage complet | — | NOW | V1 | ✅ | 15 phases, 25 missions |
| Déblocage automatique de la phase suivante | Progression | Missions | NOW | V1 | ✅ | Test : phase 2 débloquée |
| Adaptation du parcours selon résultats et niveau | Personnalisation | Copilot, données de test | LATER | V7 | ⬜ | Missions ajustées selon CPA réel / niveau |
| Missions plus détaillées pour phases 5–15 | Profondeur | Modules V2–V6 | NEXT | V2–V6 | 🟡 | Missions de base présentes, enrichies à chaque module |

## M6 — Product Research (§7)

| Fonctionnalité | Objectif | Dépendances | Statut | Version | État | Critère |
|---|---|---|---|---|---|---|
| Ajout manuel d'un produit | Centraliser | — | NOW | V1 | ✅ | E2E |
| Import d'URL (lien conservé) | Retrouver la source | — | NOW | V1 | ✅ | Lien cliquable sécurisé |
| Extraction automatique depuis URL | Gagner du temps | Fonction serveur + scraping autorisé | NEXT | V2 | ⬜ | Titre/prix/images extraits si autorisé |
| Ajout d'images / pub enregistrée | Garder les preuves visuelles | Fichiers | NOW | V1 | 🟡 | Via Fichiers du projet ; liaison produit ↔ fichier en V2 |
| Classement par niche / statut | Organiser | — | NOW | V1 | ✅ | Niche + statut Idée/Shortlist/Test/Écarté |
| Comparaison de produits | Choisir | Scoring | NOW | V1 | ✅ | Liste triée par score |
| Product Scoring transparent (11 critères) | Décider objectivement | — | NOW | V1 | ✅ | Chaque note justifiée, critères manquants exclus et signalés |
| Marge, prix, frais logistiques, frais de paiement, TVA BE | Rentabilité | — | NOW | V1 | ✅ | Calcul CPA max, ROAS min, multiple |
| Score ≠ garantie | Honnêteté | — | NOW | V1 | ✅ | Mention systématique |
| Suivi tendances / saisonnalité / demande | Timing | Google Trends | NEXT | V2 | 🟡 | Notes manuelles en V1 |
| Problème résolu / différenciation / potentiel de marque | Vision marque | — | NOW | V1 | 🟡 | Champ Notes structuré ; champs dédiés en V2 |
| Intégrations Minea, Trendtrack, Google Trends, TikTok Creative Center, Meta Ads Library, PiPiADS, Similarweb, BuiltWith | Données externes | API disponibles et autorisées | LATER | V7 | ⬜ | Jamais simulées ; import CSV en alternative (V2) |
| Import CSV de produits | Alternative sans API | — | NEXT | V2 | ⬜ | Import d'un export Minea/Trendtrack |

## M7 — Ecom Academy (§6)

| Fonctionnalité | Objectif | Dépendances | Statut | Version | État | Critère |
|---|---|---|---|---|---|---|
| 26 modules par compétences | Apprendre | — | NOW | V1 | ✅ | Liste complète |
| Leçon : explication, sections, exemple, outils, exercice, quiz | Pédagogie active | — | NOW | V1 | 🟡 | 5/26 modules rédigés ; 21 affichés « En préparation » (jamais de faux contenu) |
| Leçons reliées aux missions | Apprendre en faisant | Parcours | NOW | V1 | ✅ | Quiz réussi → mission validée |
| Double suivi (global + appliqué par projet) | Mesurer la pratique | — | NOW | V1 | 🟡 | Global ✅ ; « appliqué » via missions par projet ; vue dédiée en V2 |
| Mises en situation | Ancrer | Copilot | NEXT | V2 | ⬜ | Scénarios interactifs |
| Rédaction des 21 modules restants | Couverture | — | NEXT | V2–V6 | ⬜ | Chaque module livré avec son module fonctionnel |

## M8 — AI Copilot & Experts (§16)

| Fonctionnalité | Objectif | Dépendances | Statut | Version | État | Critère |
|---|---|---|---|---|---|---|
| Copilot initial avec contexte du projet actif | Être accompagné | Fonction serveur, clé API | NOW | V1 | 🟡 | Code livré ; actif dès que ANTHROPIC_API_KEY est ajoutée sur Vercel |
| Orchestrateur + 20 experts (choix auto ou manuel) | Bonne expertise | — | NOW | V1 | 🟡 | Prompt orchestrateur, expert affiché |
| Règles : pas de chiffres/sources/intégrations inventés, faits vs hypothèses, franchise | Fiabilité | — | NOW | V1 | ✅ | Dans le prompt système |
| Conversations sauvegardées par projet | Continuité | Store | NOW | V1 | ✅ | Collection `conversations` scopée |
| Analyse d'un produit en 1 clic | Décider | Produits | NOW | V1 | ✅ | Bouton sur la fiche produit |
| Experts avec outils (web, calculs, lecture de fichiers) | Analyses profondes | Copilot V1 | LATER | V7 | ⬜ | Sources datées et citées |
| Collaboration multi-experts formalisée | Analyses transverses | Orchestrateur | LATER | V7 | ⬜ | Synthèse multi-experts |
| Changement de modèle/fournisseur IA | Évolutivité | Fonction serveur | NOW | V1 | ✅ | Modèle isolé dans `api/copilot.js` |

## M9 — Gestion des fichiers (§18)

| Fonctionnalité | Objectif | Dépendances | Statut | Version | État | Critère |
|---|---|---|---|---|---|---|
| Dossier par projet (documents, images, vidéos, captures, factures, créatives…) | Tout retrouver | IndexedDB | NOW | V1 | ✅ | E2E upload |
| Classement automatique par type | Ordre | — | NOW | V1 | ✅ | Image/Vidéo/PDF/Tableur/Document |
| Téléchargement / suppression | Gestion | — | NOW | V1 | ✅ | — |
| Nettoyage des fichiers orphelins | Pas de fuite | — | NOW | V1 | ✅ | Purge après suppression de projet |
| Bibliothèque globale réutilisable | Ressources communes | Supabase Storage | NEXT | V2 | ⬜ | — |
| Classement auto dans le bon projet selon contexte (+ confirmation si doute) | Moins de clics | Copilot | LATER | V7 | ⬜ | Demande de confirmation en cas de doute |
| Stockage cloud | Multi-appareil | Supabase | NEXT | V2 | ⬜ | — |

## M10 — Gamification (§17)

| Fonctionnalité | Objectif | Dépendances | Statut | Version | État | Critère |
|---|---|---|---|---|---|---|
| XP + niveaux | Motivation | — | NOW | V1 | ✅ | Barre discrète dans la sidebar |
| Récompenses des actions utiles (leçon, quiz, mission, produit, journée) | Renforcer l'exécution | — | NOW | V1 | ✅ | Règles XP_RULES |
| Aucune pénalité | Bien-être | — | NOW | V1 | ✅ | — |
| Compétences débloquées, objectifs, historique des réalisations | Progression visible | — | NEXT | V2 | 🟡 | Journal d'activité stocké ; écran dédié en V2 |

## M11 — Competitor Intelligence (§8) — NEXT · V2

| Fonctionnalité | Dépendances | Statut | Version | État |
|---|---|---|---|---|
| Ajouter un concurrent, son site, ses produits, prix, offres | Projets | NEXT | V2 | ⬜ |
| Positionnement, publicités, pages produits, arguments de vente | — | NEXT | V2 | ⬜ |
| Forces / faiblesses comparées | — | NEXT | V2 | ⬜ |
| Bibliothèque de benchmarks (meilleurs sites, pratiques) | Ressources communes | NEXT | V2 | ⬜ |
| Concurrent associé au bon projet | Isolation | NEXT | V2 | ⬜ |
Critère : un concurrent n'apparaît que dans son projet ; benchmark partageable.

## M12 — Suppliers & Sourcing + Product Testing (§9) — NEXT · V2

| Fonctionnalité | Dépendances | Statut | Version | État |
|---|---|---|---|---|
| CRM fournisseurs (nom, site, contact, pays, produits, prix, MOQ, délais, frais, conditions, qualité, notes, documents) | Fichiers | NEXT | V2 | ⬜ |
| Historique des échanges | — | NEXT | V2 | ⬜ |
| Comparaison de fournisseurs pour un produit | Produits | NEXT | V2 | ⬜ |
| Gestion des échantillons et tests qualité | — | NEXT | V2 | ⬜ |
| Connexion Alibaba / CJdropshipping | API autorisées | LATER | V7 | ⬜ |
| Product Testing : protocole, budget, critère d'arrêt, résultats | Finance | NEXT | V2 | ⬜ |
Critère : paiement fournisseur = validation humaine obligatoire.

## M13 — Store Builder & Brand Builder (§10) — NEXT · V3

| Fonctionnalité | Statut | Version | État |
|---|---|---|---|
| Store Builder : structure, architecture des pages, accueil, catégories, produits, panier, checkout, paiements, livraison, retours, FAQ, contact, mentions légales, CGV | NEXT | V3 | ⬜ |
| Brand Builder : nom, positionnement, client idéal, proposition de valeur, identité visuelle, logo, couleurs, typo, ton, packaging, univers, gamme, différenciation | NEXT | V3 | ⬜ |
| Passage produit testé → marque | NEXT | V3 | ⬜ |
| Intégration Shopify | LATER | V7 | ⬜ |

## M14 — Marketing & Copywriting (§12) — NEXT · V4

| Fonctionnalité | Statut | Version | État |
|---|---|---|---|
| Stratégie d'acquisition, avatar, besoins, positionnement, offres, organique, publicitaire, plan de lancement, calendrier éditorial | NEXT | V4 | ⬜ |
| Copywriting : titres, hooks, descriptions, pages de vente, emails, pubs, scripts vidéo/UGC, arguments, FAQ, CTA | NEXT | V4 | ⬜ |
| Contenu adapté à chaque projet et marque | NEXT | V4 | ⬜ |

## M15 — Advertising & Creative Center (§13) — NEXT · V4

| Fonctionnalité | Statut | Version | État |
|---|---|---|---|
| Campagnes Meta Ads / TikTok Ads, créatives, vidéos, images, hooks, angles, audiences, budgets, résultats, tests | NEXT | V4 | ⬜ |
| Suivi CPM, CTR, CPC, CPA, ROAS, CAC, taux de conversion | NEXT | V4 | ⬜ |
| Comparaison des créatives + historique des tests | NEXT | V4 | ⬜ |
| Validation humaine pour toute dépense ou modification sensible | NEXT | V4 | ⬜ |
| Connexion API Meta / TikTok | LATER | V7 | ⬜ |

## M16 — Conversion Intelligence UX/UI & CRO (§11) — LATER · V5

| Fonctionnalité | Statut | Version | État |
|---|---|---|---|
| Audit de site (design, structure, navigation, hiérarchie, lisibilité, mobile, desktop, vitesse, cohérence, accessibilité) | LATER | V5 | ⬜ |
| Audit page produit (images, vidéos, titre, description, bénéfices, arguments, prix, promos, preuves, avis, réassurance, FAQ, CTA, variantes) | LATER | V5 | ⬜ |
| Audit du parcours client (découverte → confirmation), frictions, confiance | LATER | V5 | ⬜ |
| Audit checkout et paiements | LATER | V5 | ⬜ |
| Benchmark multi-sites | LATER | V5 | ⬜ |
| Résultat : problème, preuve, impact, recommandation, priorité, difficulté ; faits vs hypothèses | LATER | V5 | ⬜ |
| Captures, annotations, wireframes (Playwright côté serveur, respect des CGU) | LATER | V5 | ⬜ |
| Scores CRO jamais présentés comme prédictions | LATER | V5 | ⬜ |

## M17 — Finance & Profitability (§14) — LATER · V6

| Fonctionnalité | Statut | Version | État |
|---|---|---|---|
| Dépenses / revenus réels par projet | NOW | V1 | ✅ (version simple) |
| Calculateur de rentabilité par produit (prix, coûts, TVA, frais, CPA max) | NOW | V1 | ✅ |
| Budget, coût produit, livraison, frais de paiement, pub, retours, remboursements, TVA, marge brute/nette, résultat, trésorerie — par projet ET par boutique | LATER | V6 | ⬜ |
| Simulation budgets publicitaires et CAC | LATER | V6 | ⬜ |
| Distinction réel vs estimation | NOW | V1 | ✅ (champ `real`) |

## M18 — Legal & Compliance Belgique / UE (§15) — LATER · V6

| Fonctionnalité | Statut | Version | État |
|---|---|---|---|
| Checklists : RGPD, cookies, confidentialité, CGV, mentions légales, rétractation, garanties, infos précontractuelles, TVA, sécurité produits, obligations produit, accessibilité | LATER | V6 | 🟡 (checklist minimale dans la mission Phase 10) |
| Signalement des éléments manquants | LATER | V6 | ⬜ |
| Modèles présentés comme « à vérifier », jamais comme avis juridique | LATER | V6 | ⬜ |

## M19 — Automatisations & intégrations (§19) — LATER · V7

| Fonctionnalité | Statut | Version | État |
|---|---|---|---|
| Shopify, Minea, Trendtrack, Google Trends, Meta Ads, TikTok Ads, GA4, Microsoft Clarity, Canva, CapCut, Alibaba, CJdropshipping, Klaviyo, Stripe, paiements, n8n/Make | LATER | V7 | ⬜ |
| Intégrations réellement fonctionnelles, jamais simulées ; alternatives si pas d'API | LATER | V7 | ⬜ |
| Journalisation des automatisations | LATER | V7 | ⬜ |
| Validation humaine : paiement, campagne, prix, suppression, engagement financier | LATER | V7 | ⬜ |

## M20 — Scaling, fidélisation, multi-marques, SaaS (§1, §20) — LATER · V8

| Fonctionnalité | Statut | Version | État |
|---|---|---|---|
| Fidélisation (emails post-achat, réachat, LTV) | LATER | V8 | ⬜ |
| Gestion de plusieurs marques en parallèle | LATER | V8 | ⬜ |
| Évolution SaaS : multi-utilisateurs, rôles, facturation, onboarding | LATER | V8 | ⬜ |

## M21 — Design & UX TDAH (§2)

| Règle | Statut | État |
|---|---|---|
| Une priorité principale à la fois | NOW | ✅ |
| 3 tâches max visibles | NOW | ✅ |
| Interface épurée, textes courts, menus simples | NOW | ✅ |
| Infos secondaires masquées (sections repliables) | NOW | ✅ |
| Pas de graphiques décoratifs ni de notifications inutiles | NOW | ✅ |
| Mode Focus | NOW | ✅ |
| Mode clair et sombre | NOW | ✅ |
| Animations discrètes (+ respect de « réduire les animations ») | NOW | ✅ |
| Mobile et desktop | NOW | ✅ |
