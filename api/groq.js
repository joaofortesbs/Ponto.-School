import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY?.trim();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();

let groqClient = null;

const GROQ_MODELS_CASCADE = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', priority: 1 },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Fast', priority: 2 },
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout 17B', priority: 3 },
  { id: 'qwen/qwen3-32b', name: 'Qwen3 32B', priority: 4 }
];

const GEMINI_MODEL = 'gemini-2.0-flash';

export function getGroqClient() {
  if (!groqClient) {
    if (!apiKey) {
      throw new Error('❌ GROQ_API_KEY não encontrada! Verifique a variável de ambiente.');
    }
    
    // Suporte a chaves Groq (gsk_...) ou OpenRouter (sk-or-...) ou outras compatíveis
    if (!apiKey.startsWith('gsk_') && !apiKey.startsWith('sk-')) {
      console.warn('⚠️ GROQ_API_KEY pode ter formato inesperado, tentando mesmo assim...');
    }
    
    groqClient = new Groq({
      apiKey: apiKey
    });
    
    console.log('✅ Conexão com Groq: OK');
  }
  return groqClient;
}

function isRateLimitError(error) {
  if (!error) return false;
  
  if (error.status === 429) return true;
  if (error.statusCode === 429) return true;
  if (error.response?.status === 429) return true;
  
  if (error.code === 'rate_limit_exceeded') return true;
  if (error.error?.code === 'rate_limit_exceeded') return true;
  
  const message = error.message || error.error?.message || '';
  if (message.includes('429')) return true;
  if (message.toLowerCase().includes('rate_limit')) return true;
  if (message.toLowerCase().includes('rate limit')) return true;
  if (message.toLowerCase().includes('too many requests')) return true;
  
  return false;
}

function isModelNotFoundError(error) {
  if (!error) return false;
  
  if (error.status === 404) return true;
  if (error.statusCode === 404) return true;
  
  const message = error.message || error.error?.message || '';
  if (message.includes('404')) return true;
  if (message.toLowerCase().includes('not found')) return true;
  if (message.toLowerCase().includes('model not found')) return true;
  
  return false;
}

async function generateWithGemini(messages, options = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini não disponível - GEMINI_API_KEY não configurada');
  }
  
  console.log(`🔄 [GROQ-FALLBACK] Usando Gemini (${GEMINI_MODEL}) como fallback final...`);
  
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessage = messages.find(m => m.role === 'user')?.content || '';
  const fullPrompt = systemMessage ? `${systemMessage}\n\n---\n\n${userMessage}` : userMessage;
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: fullPrompt }]
        }
      ],
      generationConfig: {
        temperature: options.temperature || 0.7,
        topP: options.top_p || 0.9,
        maxOutputTokens: options.max_tokens || 4000
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Gemini API Error [${response.status}]: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error('Resposta inválida do Gemini - sem conteúdo');
  }

  console.log(`✅ [GROQ-FALLBACK] Gemini respondeu com sucesso!`);
  
  return {
    choices: [{
      message: { content },
      finish_reason: 'stop'
    }],
    usage: { total_tokens: Math.ceil(content.length / 4) },
    model: GEMINI_MODEL,
    provider: 'gemini'
  };
}

export async function withMultiModelFallback(createRequestFn, options = {}) {
  const {
    maxRetriesPerModel = 2,
    useGeminiFallback = true,
    logPrefix = '[GROQ]'
  } = options;

  const errors = [];
  let lastError = null;
  
  for (const modelConfig of GROQ_MODELS_CASCADE) {
    console.log(`${logPrefix} 🔄 Tentando modelo: ${modelConfig.name} (${modelConfig.id})`);
    
    for (let attempt = 0; attempt < maxRetriesPerModel; attempt++) {
      try {
        const client = getGroqClient();
        const response = await createRequestFn(client, modelConfig.id);
        
        console.log(`${logPrefix} ✅ Sucesso com ${modelConfig.name} na tentativa ${attempt + 1}`);
        
        return {
          ...response,
          _metadata: {
            model: modelConfig.id,
            modelName: modelConfig.name,
            provider: 'groq',
            attempts: attempt + 1,
            totalModelsTriad: GROQ_MODELS_CASCADE.indexOf(modelConfig) + 1,
            usedFallback: modelConfig.priority > 1
          }
        };
      } catch (error) {
        lastError = error;
        const errorInfo = {
          model: modelConfig.id,
          attempt: attempt + 1,
          error: error.message,
          isRateLimit: isRateLimitError(error),
          isModelNotFound: isModelNotFoundError(error)
        };
        errors.push(errorInfo);
        
        console.warn(`${logPrefix} ⚠️ Falha com ${modelConfig.name} (tentativa ${attempt + 1}/${maxRetriesPerModel}):`, error.message);
        
        if (isRateLimitError(error)) {
          console.log(`${logPrefix} 🔄 Rate limit detectado, pulando para próximo modelo...`);
          break;
        }
        
        if (isModelNotFoundError(error)) {
          console.log(`${logPrefix} 🔄 Modelo não encontrado, pulando para próximo modelo...`);
          break;
        }
        
        if (attempt < maxRetriesPerModel - 1) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`${logPrefix} ⏳ Aguardando ${waitTime}ms antes de tentar novamente...`);
          await new Promise(r => setTimeout(r, waitTime));
        }
      }
    }
  }
  
  if (useGeminiFallback && GEMINI_API_KEY) {
    console.log(`${logPrefix} 🔄 Todos os modelos Groq falharam. Tentando Gemini como fallback final...`);
    
    try {
      const messagesFromRequest = options.messages || [];
      const response = await generateWithGemini(messagesFromRequest, options.generationConfig || {});
      
      return {
        ...response,
        _metadata: {
          model: GEMINI_MODEL,
          modelName: 'Google Gemini',
          provider: 'gemini',
          attempts: 1,
          totalModelsTriad: GROQ_MODELS_CASCADE.length + 1,
          usedFallback: true,
          groqErrors: errors
        }
      };
    } catch (geminiError) {
      console.error(`${logPrefix} ❌ Gemini também falhou:`, geminiError.message);
      errors.push({
        model: GEMINI_MODEL,
        provider: 'gemini',
        error: geminiError.message
      });
    }
  }
  
  const errorSummary = errors.map(e => `${e.model}: ${e.error}`).join(' | ');
  throw new Error(`Todos os modelos falharam após múltiplas tentativas. Erros: ${errorSummary}`);
}

export async function generateWithCascade(messages, generationConfig = {}) {
  const {
    temperature = 0.7,
    max_tokens = 4000,
    top_p = 0.9
  } = generationConfig;

  return withMultiModelFallback(
    async (client, modelId) => {
      const response = await client.chat.completions.create({
        model: modelId,
        messages,
        temperature,
        max_tokens,
        top_p
      });
      return response;
    },
    {
      maxRetriesPerModel: 2,
      useGeminiFallback: true,
      logPrefix: '[GROQ-CASCADE]',
      messages,
      generationConfig: { temperature, max_tokens, top_p }
    }
  );
}

export async function withRetryAndTimeout(asyncFn, maxRetries = 3) {
  let lastError = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (err) {
      lastError = err;
      
      if (err.status === 429 && attempt < maxRetries - 1) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.warn(`⏳ Rate limited. Waiting ${waitTime}ms...`);
        await new Promise(r => setTimeout(r, waitTime));
      } else if (err.code === 'ECONNREFUSED' && attempt < maxRetries - 1) {
        const waitTime = (attempt + 1) * 2000;
        console.warn(`⏳ Connection refused. Retrying in ${waitTime}ms...`);
        await new Promise(r => setTimeout(r, waitTime));
      } else if (attempt < maxRetries - 1) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.warn(`⚠️ Request failed: ${err.message}. Retrying in ${waitTime}ms...`);
        await new Promise(r => setTimeout(r, waitTime));
      } else {
        throw err;
      }
    }
  }
  
  throw lastError;
}

function parseJsonResponse(content) {
  if (!content || content.trim() === '') {
    console.warn('⚠️ Empty response from model');
    return null;
  }

  try {
    const jsonStr = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('❌ JSON parse error:', err.message);
    return null;
  }
}

export async function generateFlashcards(topic, quantity = 5) {
  const messages = [
    {
      role: 'system',
      content: 'Você é especialista em educação. RESPONDA APENAS EM JSON VÁLIDO. Não inclua markdown ou texto extra.'
    },
    {
      role: 'user',
      content: `Crie ${quantity} flashcards sobre "${topic}". Formato obrigatório: [{"pergunta": "...", "resposta": "..."}]`
    }
  ];

  const result = await generateWithCascade(messages, {
    temperature: 0.5,
    max_tokens: 2000,
    top_p: 0.9
  });

  const content = result.choices?.[0]?.message?.content;
  const parsed = parseJsonResponse(content);
  
  if (Array.isArray(parsed)) {
    return parsed;
  }
  
  console.warn('⚠️ Could not parse flashcards response, returning empty array');
  return [];
}

export async function generateQuiz(topic, questions = 5) {
  const messages = [
    {
      role: 'system',
      content: 'Você cria quizzes educativos. RESPONDA APENAS EM JSON VÁLIDO. Não inclua markdown ou texto extra.'
    },
    {
      role: 'user',
      content: `Gere ${questions} questões de múltipla escolha sobre "${topic}". Formato obrigatório: [{"pergunta": "...", "opcoes": ["a) opção1", "b) opção2", "c) opção3", "d) opção4"], "resposta": "letra correta"}]`
    }
  ];

  const result = await generateWithCascade(messages, {
    temperature: 0.3,
    max_tokens: 2000,
    top_p: 0.9
  });

  const content = result.choices?.[0]?.message?.content;
  const parsed = parseJsonResponse(content);
  
  if (Array.isArray(parsed)) {
    return parsed;
  }
  
  console.warn('⚠️ Could not parse quiz response, returning empty array');
  return [];
}

export async function generateTest(topic, questions = 10, difficulty = 'médio') {
  const messages = [
    {
      role: 'system',
      content: `Você é professor especialista. Crie prova com nível de dificuldade: ${difficulty}. A prova deve ser bem estruturada e educativa.`
    },
    {
      role: 'user',
      content: `Crie uma prova completa com ${questions} questões sobre "${topic}". Inclua:
1. Cabeçalho com título da prova e espaço para nome do aluno
2. Questões numeradas (misture múltipla escolha e dissertativas)
3. Gabarito no final da prova

Formate de maneira clara e profissional.`
    }
  ];

  const result = await generateWithCascade(messages, {
    temperature: 0.2,
    max_tokens: 3000,
    top_p: 0.9
  });

  const content = result.choices?.[0]?.message?.content;
  return content || 'Erro ao gerar teste.';
}

export async function chat(userMessage, conversationHistory = []) {
  const messages = [
    {
      role: 'system',
      content: `Você é o Epictus IA, um assistente educacional inteligente e amigável.
Suas respostas devem ser:
- Claras e didáticas
- Encorajadoras e positivas
- Bem estruturadas com markdown quando apropriado
- Adaptadas ao contexto educacional
Sempre comece suas respostas com "Eai" de forma natural e amigável.`
    },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  const result = await generateWithCascade(messages, {
    temperature: 0.7,
    max_tokens: 1024,
    top_p: 0.9
  });

  const content = result.choices?.[0]?.message?.content;
  return content || 'Desculpe, não consegui processar sua mensagem.';
}

function extractNumber(text) {
  const match = text.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

function extractDifficulty(text) {
  const lower = text.toLowerCase();
  if (lower.includes('fácil') || lower.includes('facil') || lower.includes('básico')) {
    return 'fácil';
  }
  if (lower.includes('difícil') || lower.includes('dificil') || lower.includes('avançado')) {
    return 'difícil';
  }
  return 'médio';
}

export async function processUserPrompt(userPrompt, activityType = null) {
  try {
    const promptLower = userPrompt.toLowerCase();
    
    let detectedType = activityType || 'chat';
    
    if (!activityType) {
      if (promptLower.includes('flashcard') || promptLower.includes('cartão') || promptLower.includes('cartões')) {
        detectedType = 'flashcards';
      } else if (promptLower.includes('quiz') || promptLower.includes('questões') || promptLower.includes('perguntas')) {
        detectedType = 'quiz';
      } else if (promptLower.includes('prova') || promptLower.includes('teste') || promptLower.includes('avaliação')) {
        detectedType = 'test';
      }
    }
    
    let result;
    
    switch (detectedType) {
      case 'flashcards':
        const flashcardCount = extractNumber(userPrompt) || 5;
        result = await generateFlashcards(userPrompt, flashcardCount);
        break;
        
      case 'quiz':
        const quizCount = extractNumber(userPrompt) || 5;
        result = await generateQuiz(userPrompt, quizCount);
        break;
        
      case 'test':
        const testCount = extractNumber(userPrompt) || 10;
        const difficulty = extractDifficulty(userPrompt);
        result = await generateTest(userPrompt, testCount, difficulty);
        break;
        
      default:
        result = await chat(userPrompt, []);
        break;
    }
    
    return {
      type: detectedType,
      data: result,
      success: true
    };
  } catch (err) {
    console.error('Erro ao processar prompt:', err);
    return {
      type: activityType || 'chat',
      data: '',
      success: false,
      error: err.message || 'Erro desconhecido ao processar prompt'
    };
  }
}

export async function testGroqConnection() {
  try {
    const client = getGroqClient();
    
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'Responda apenas com "OK"' }],
      max_tokens: 10,
      temperature: 0
    });
    
    if (response.choices?.[0]?.message?.content) {
      console.log('✅ Conexão com Groq: OK');
      return { success: true, message: '✅ Conexão com Groq: OK' };
    }
    
    return { success: false, message: '❌ Resposta vazia do modelo' };
  } catch (err) {
    console.error('❌ Erro de conexão com Groq:', err.message);
    return { success: false, message: `❌ Erro: ${err.message}` };
  }
}

export { GROQ_MODELS_CASCADE, GEMINI_MODEL };

export default {
  generateFlashcards,
  generateQuiz,
  generateTest,
  chat,
  processUserPrompt,
  testGroqConnection,
  generateWithCascade,
  withMultiModelFallback,
  getGroqClient,
  withRetryAndTimeout,
  GROQ_MODELS_CASCADE,
  GEMINI_MODEL
};
