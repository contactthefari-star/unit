// Fonction serverless Vercel : AI Copilot d'Ecom Command Center.
// La clé ANTHROPIC_API_KEY reste côté serveur (variable d'environnement Vercel), jamais dans le front.
import Anthropic from '@anthropic-ai/sdk';
import { EXPERTS, EXPERT_IDS } from '../ecom/js/content/experts.js';

const MODEL = 'claude-opus-5-5';
const MAX_MESSAGES = 12;
const MAX_CHARS = 4000;
const MAX_CONTEXT = 20000;

const SYSTEM = `Tu es l'AI Orchestrator d'ECOM COMMAND CENTER, le système de travail e-commerce personnel d'un entrepreneur basé en Belgique, débutant en e-commerce, avec un profil TDAH.

Tu coordonnes une équipe de 20 experts :
${EXPERTS.map((e) => `- ${e.name} : ${e.focus}`).join('\n')}

Fonctionnement :
- Identifie le besoin, mobilise le ou les experts pertinents et fais-les collaborer si plusieurs domaines sont concernés.
- La PREMIÈRE ligne de ta réponse est exactement : "EXPERT: <nom(s) de l'expert ou des experts mobilisés>". Puis une ligne vide, puis la réponse.
- Utilise le contexte du projet fourni (projet, phase, tâches, produits). Il provient des données réelles de l'utilisateur.

Règles absolues :
- N'invente jamais de chiffres, de sources, d'études, de statistiques de marché ni d'intégrations. Si une donnée manque, dis-le et indique comment l'obtenir.
- Distingue clairement les faits (issus du contexte) des hypothèses.
- Un score produit n'est jamais une garantie de succès.
- Dis franchement quand une idée est mauvaise et pourquoi. Ne valide pas par complaisance.
- Toute dépense, lancement de campagne, paiement fournisseur ou modification de prix reste une décision humaine : recommande, ne décide pas.
- Pour le juridique : fournis des checklists et des modèles à faire vérifier, jamais un avis juridique.

Style (TDAH) :
- Français, phrases courtes, concret, adapté à un débutant. Explique ton raisonnement simplement.
- Structure : la réponse directe d'abord, puis au maximum 3 actions numérotées, puis ce qui manque éventuellement.
- Pas de remplissage, pas de longues listes. Une seule priorité claire quand on te demande quoi faire.`;

function validate(body) {
  if (!body || typeof body !== 'object') return 'Requête invalide';
  const { messages, expert, context } = body;
  if (!Array.isArray(messages) || !messages.length || messages.length > MAX_MESSAGES) return 'Messages invalides';
  for (const [i, m] of messages.entries()) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') return 'Message invalide';
    if (!m.content.trim() || m.content.length > MAX_CHARS) return 'Message vide ou trop long';
    if (i > 0 && messages[i - 1].role === m.role) return 'Alternance des rôles invalide';
  }
  if (messages[0].role !== 'user' || messages.at(-1).role !== 'user') return 'La conversation doit commencer et finir par un message utilisateur';
  if (expert && expert !== 'auto' && !EXPERT_IDS.has(expert)) return 'Expert inconnu';
  if (context && JSON.stringify(context).length > MAX_CONTEXT) return 'Contexte trop volumineux';
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'Copilot non configuré : ajoute la variable ANTHROPIC_API_KEY dans les réglages Vercel du projet, puis redéploie.' });
  }
  const body = typeof req.body === 'string' ? safeParse(req.body) : req.body;
  const err = validate(body);
  if (err) return res.status(400).json({ error: err });

  const { messages, expert = 'auto', context } = body;
  const chosen = EXPERTS.find((e) => e.id === expert);
  const operator = [
    `Contexte du projet actif (données réelles de l'utilisateur, JSON) :\n${JSON.stringify(context || {}, null, 1)}`,
    chosen ? `L'utilisateur a choisi l'expert : ${chosen.name}. Réponds principalement avec cette expertise.` : `Mode automatique : choisis toi-même le ou les experts.`,
  ].join('\n\n');

  try {
    const client = new Anthropic();
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium' },
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }, { type: 'text', text: operator }],
      messages,
    });
    if (response.stop_reason === 'refusal') {
      return res.status(422).json({ error: 'Le Copilot ne peut pas répondre à cette demande. Reformule-la.' });
    }
    const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n').trim();
    const m = text.match(/^EXPERT:\s*(.+)\n+/);
    return res.status(200).json({
      expert: m ? m[1].trim().slice(0, 200) : (chosen?.name || 'Orchestrateur'),
      text: m ? text.slice(m[0].length) : text,
      truncated: response.stop_reason === 'max_tokens',
      usage: { input: response.usage?.input_tokens, output: response.usage?.output_tokens },
    });
  } catch (e) {
    const status = e?.status;
    if (status === 429) return res.status(429).json({ error: 'Trop de demandes. Réessaie dans une minute.' });
    if (status === 401) return res.status(502).json({ error: 'Clé API invalide côté serveur.' });
    console.error('copilot error', status, e?.message);
    return res.status(502).json({ error: 'Le service IA est indisponible pour le moment.' });
  }
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}
