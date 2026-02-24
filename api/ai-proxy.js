/**
 * AI PROXY — Backend seguro para todos os providers de LLM
 *
 * Recebe requisições do frontend e faz as chamadas reais às APIs externas
 * usando chaves armazenadas no servidor (process.env.*).
 * As chaves NUNCA chegam ao bundle do browser.
 */

import express from 'express';

const router = express.Router();

// ─── Helpers de chave ────────────────────────────────────────────────────────

// Tenta KEY_NAME e também VITE_KEY_NAME (Replit Secrets podem ter ambos os formatos)
function getKey(...names) {
  for (const name of names) {
    const key = (process.env[name] || '').trim();
    if (key && key.length > 5) return key;
    // Tenta com prefixo VITE_
    const viteKey = (process.env[`VITE_${name}`] || '').trim();
    if (viteKey && viteKey.length > 5) return viteKey;
  }
  return '';
}

function resolveKey(primary, vitefallback) {
  return (process.env[primary] || process.env[vitefallback] || '').trim();
}

// ─── Status dos providers ─────────────────────────────────────────────────────

router.get('/status', (req, res) => {
  const groqKey   = resolveKey('GROQ_API_KEY', 'VITE_GROQ_API_KEY');
  const geminiKey = resolveKey('GEMINI_API_KEY', 'VITE_GEMINI_API_KEY');
  const orKey     = resolveKey('OPENROUTER_API_KEY', 'VITE_OPENROUTER_API_KEY');
  const togetherKey = resolveKey('TOGETHER_API_KEY', 'VITE_TOGETHER_API_KEY');
  const deepKey   = resolveKey('DEEPINFRA_API_KEY', 'VITE_DEEPINFRA_API_KEY');
  const xrKey     = resolveKey('XROUTE_API_KEY', 'VITE_XROUTE_API_KEY');
  const edenKey   = resolveKey('EDENAI_API_KEY', 'VITE_EDENAI_API_KEY');
  const hfKey     = resolveKey('HUGGINGFACE_API_KEY', 'VITE_HUGGINGFACE_API_KEY');
  const xaiKey    = resolveKey('XAI_API_KEY', 'VITE_XAI_API_KEY');

  res.json({
    providers: {
      groq:        { configured: groqKey.startsWith('gsk_') },
      gemini:      { configured: geminiKey.startsWith('AIza') },
      openrouter:  { configured: orKey.length > 20 },
      together:    { configured: togetherKey.length > 20 },
      deepinfra:   { configured: deepKey.length > 20 },
      xroute:      { configured: xrKey.length > 20 },
      edenai:      { configured: edenKey.length > 20 },
      huggingface: { configured: hfKey.startsWith('hf_') },
      xai:         { configured: xaiKey.length > 20 },
    }
  });
});

// ─── OpenAI-compatible (Groq, OpenRouter, Together, DeepInfra, XRoute) ───────

router.post('/chat', async (req, res) => {
  const { provider, model, messages, temperature, max_tokens, stream } = req.body;

  if (!provider || !model || !messages) {
    return res.status(400).json({ error: 'provider, model e messages são obrigatórios' });
  }

  const providerMap = {
    groq:       { primary: 'GROQ_API_KEY',       vite: 'VITE_GROQ_API_KEY',       url: 'https://api.groq.com/openai/v1/chat/completions' },
    openrouter: { primary: 'OPENROUTER_API_KEY',  vite: 'VITE_OPENROUTER_API_KEY',  url: 'https://openrouter.ai/api/v1/chat/completions' },
    together:   { primary: 'TOGETHER_API_KEY',    vite: 'VITE_TOGETHER_API_KEY',    url: 'https://api.together.ai/v1/chat/completions' },
    deepinfra:  { primary: 'DEEPINFRA_API_KEY',   vite: 'VITE_DEEPINFRA_API_KEY',   url: 'https://api.deepinfra.com/v1/openai/chat/completions' },
    xroute:     { primary: 'XROUTE_API_KEY',      vite: 'VITE_XROUTE_API_KEY',      url: 'https://api.xroute.ai/v1/chat/completions' },
    xai:        { primary: 'XAI_API_KEY',         vite: 'VITE_XAI_API_KEY',         url: 'https://api.x.ai/v1/chat/completions' },
  };

  const config = providerMap[provider];
  if (!config) {
    return res.status(400).json({ error: `Provider desconhecido: ${provider}` });
  }

  const apiKey = resolveKey(config.primary, config.vite);
  if (!apiKey || apiKey.length < 10) {
    return res.status(503).json({ error: `Chave API não configurada para ${provider}` });
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://pontoschool.com.br';
    headers['X-Title'] = 'Ponto School - Plataforma Educacional';
  }

  const body = {
    model,
    messages,
    temperature: temperature ?? 0.3,
    max_tokens: max_tokens ?? 8000,
    stream: false,
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const upstream = await fetch(config.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseText = await upstream.text();

    res.status(upstream.status)
       .set('Content-Type', 'application/json')
       .send(responseText);

  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    console.error(`[AI-Proxy] ${provider} erro:`, err.message);
    res.status(504).json({ error: isTimeout ? 'Timeout' : err.message });
  }
});

// ─── Gemini (formato diferente) ───────────────────────────────────────────────

router.post('/gemini', async (req, res) => {
  const { model_id, endpoint, contents, generationConfig, systemInstruction, tools, toolConfig } = req.body;

  const apiKey = resolveKey('GEMINI_API_KEY', 'VITE_GEMINI_API_KEY');
  if (!apiKey || !apiKey.startsWith('AIza')) {
    return res.status(503).json({ error: 'Chave Gemini não configurada' });
  }

  if (!model_id && !endpoint) {
    return res.status(400).json({ error: 'model_id ou endpoint são obrigatórios' });
  }

  const url = endpoint
    ? `${endpoint}?key=${apiKey}`
    : `https://generativelanguage.googleapis.com/v1beta/models/${model_id}:generateContent?key=${apiKey}`;

  const body = { contents, generationConfig };
  if (systemInstruction) body.systemInstruction = systemInstruction;
  if (tools) body.tools = tools;
  if (toolConfig) body.toolConfig = toolConfig;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseText = await upstream.text();
    res.status(upstream.status)
       .set('Content-Type', 'application/json')
       .send(responseText);

  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    console.error('[AI-Proxy] Gemini erro:', err.message);
    res.status(504).json({ error: isTimeout ? 'Timeout' : err.message });
  }
});

// ─── HuggingFace ──────────────────────────────────────────────────────────────

router.post('/huggingface', async (req, res) => {
  const { endpoint, inputs, parameters } = req.body;

  const apiKey = resolveKey('HUGGINGFACE_API_KEY', 'VITE_HUGGINGFACE_API_KEY');
  if (!apiKey || !apiKey.startsWith('hf_')) {
    return res.status(503).json({ error: 'Chave HuggingFace não configurada' });
  }

  if (!endpoint || !inputs) {
    return res.status(400).json({ error: 'endpoint e inputs são obrigatórios' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ inputs, parameters }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseText = await upstream.text();
    res.status(upstream.status)
       .set('Content-Type', 'application/json')
       .send(responseText);

  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    console.error('[AI-Proxy] HuggingFace erro:', err.message);
    res.status(504).json({ error: isTimeout ? 'Timeout' : err.message });
  }
});

// ─── EdenAI ───────────────────────────────────────────────────────────────────

router.post('/edenai', async (req, res) => {
  const { providers, text, chatbot_global_action, previous_history, temperature, max_tokens, model } = req.body;

  const apiKey = resolveKey('EDENAI_API_KEY', 'VITE_EDENAI_API_KEY');
  if (!apiKey || apiKey.length < 20) {
    return res.status(503).json({ error: 'Chave EdenAI não configurada' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const upstream = await fetch('https://api.edenai.run/v2/text/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ providers, text, chatbot_global_action, previous_history, temperature, max_tokens, model }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseText = await upstream.text();
    res.status(upstream.status)
       .set('Content-Type', 'application/json')
       .send(responseText);

  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    console.error('[AI-Proxy] EdenAI erro:', err.message);
    res.status(504).json({ error: isTimeout ? 'Timeout' : err.message });
  }
});

export default router;
