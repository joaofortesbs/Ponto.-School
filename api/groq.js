import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY?.trim();

let groqClient = null;

function getGroqClient() {
  if (!groqClient) {
    if (!apiKey || !apiKey.startsWith('gsk_')) {
      throw new Error('❌ GROQ_API_KEY inválida! Verifique a variável de ambiente.');
    }
    
    groqClient = new Groq({
      apiKey: apiKey
    });
    
    console.log('✅ Conexão com Groq: OK');
  }
  return groqClient;
}

async function withRetryAndTimeout(asyncFn, maxRetries = 3) {
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
  return withRetryAndTimeout(async () => {
    const client = getGroqClient();
    
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Você é especialista em educação. RESPONDA APENAS EM JSON VÁLIDO. Não inclua markdown ou texto extra.'
        },
        {
          role: 'user',
          content: `Crie ${quantity} flashcards sobre "${topic}". Formato obrigatório: [{"pergunta": "...", "resposta": "..."}]`
        }
      ],
      temperature: 0.5,
      max_tokens: 2000,
      top_p: 0.9
    });

    const content = response.choices?.[0]?.message?.content;
    const parsed = parseJsonResponse(content);
    
    if (Array.isArray(parsed)) {
      return parsed;
    }
    
    console.warn('⚠️ Could not parse flashcards response, returning empty array');
    return [];
  });
}

export async function generateQuiz(topic, questions = 5) {
  return withRetryAndTimeout(async () => {
    const client = getGroqClient();
    
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Você cria quizzes educativos. RESPONDA APENAS EM JSON VÁLIDO. Não inclua markdown ou texto extra.'
        },
        {
          role: 'user',
          content: `Gere ${questions} questões de múltipla escolha sobre "${topic}". Formato obrigatório: [{"pergunta": "...", "opcoes": ["a) opção1", "b) opção2", "c) opção3", "d) opção4"], "resposta": "letra correta"}]`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      top_p: 0.9
    });

    const content = response.choices?.[0]?.message?.content;
    const parsed = parseJsonResponse(content);
    
    if (Array.isArray(parsed)) {
      return parsed;
    }
    
    console.warn('⚠️ Could not parse quiz response, returning empty array');
    return [];
  });
}

export async function generateTest(topic, questions = 10, difficulty = 'médio') {
  return withRetryAndTimeout(async () => {
    const client = getGroqClient();
    
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
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
      ],
      temperature: 0.2,
      max_tokens: 3000,
      top_p: 0.9
    });

    const content = response.choices?.[0]?.message?.content;
    return content || 'Erro ao gerar teste.';
  });
}

export async function chat(userMessage, conversationHistory = []) {
  return withRetryAndTimeout(async () => {
    const client = getGroqClient();
    
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
    
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.9
    });

    const content = response.choices?.[0]?.message?.content;
    return content || 'Desculpe, não consegui processar sua mensagem.';
  });
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

export default {
  generateFlashcards,
  generateQuiz,
  generateTest,
  chat,
  processUserPrompt,
  testGroqConnection
};
