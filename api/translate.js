// Migrado de Google Gemini para Mistral via HuggingFace
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// HuggingFace/Mistral configuration
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || '';
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';
const MISTRAL_MODEL = 'mistralai/Mistral-Nemo-Instruct-2407';

const languageNames = {
  'pt': 'Português',
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'it': 'Italiano',
  'de': 'Deutsch'
};

async function translateText(text, targetLanguage, isBatch = false) {
  try {
    const targetLangName = languageNames[targetLanguage] || targetLanguage;
    
    let prompt;
    if (isBatch) {
      prompt = `Traduza TODOS os textos do array JSON abaixo para ${targetLangName}. 
Retorne um array JSON com as traduções na MESMA ORDEM, sem explicações adicionais.
Mantenha a estrutura JSON exata.

Array de textos:
${text}`;
    } else {
      prompt = `Traduza o seguinte texto para ${targetLangName}. Retorne APENAS a tradução, sem explicações adicionais:\n\n${text}`;
    }
    
    const response = await fetch(`${HUGGINGFACE_API_URL}/${MISTRAL_MODEL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: 0.3,
          max_new_tokens: 2048,
          return_full_text: false,
        },
        options: {
          wait_for_model: true,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HuggingFace API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let translatedText = '';
    
    if (Array.isArray(data)) {
      translatedText = data[0]?.generated_text || '';
    } else if (data.generated_text) {
      translatedText = data.generated_text;
    } else if (data.error) {
      throw new Error(`Model error: ${data.error}`);
    }

    translatedText = translatedText.trim();
    
    if (isBatch) {
      console.log(`✅ [TRADUÇÃO LOTE] Traduzidos ${JSON.parse(text).length} textos para ${targetLanguage}`);
    } else {
      console.log(`✅ [TRADUÇÃO] ${text.substring(0, 50)}... → ${translatedText.substring(0, 50)}... (${targetLanguage})`);
    }
    
    return translatedText;
  } catch (error) {
    console.error('❌ [TRADUÇÃO] Erro ao traduzir:', error);
    throw error;
  }
}

router.post('/', async (req, res) => {
  try {
    const { text, targetLanguage, isBatch = false } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ 
        error: 'Parâmetros inválidos', 
        message: 'text e targetLanguage são obrigatórios' 
      });
    }

    if (targetLanguage === 'pt') {
      return res.json({ translatedText: text });
    }

    const translatedText = await translateText(text, targetLanguage, isBatch);

    res.json({ 
      success: true, 
      translatedText,
      originalText: isBatch ? `[${JSON.parse(text).length} textos]` : text,
      targetLanguage 
    });

  } catch (error) {
    console.error('❌ [TRADUÇÃO API] Erro:', error);
    res.status(500).json({ 
      error: 'Erro ao traduzir texto',
      message: error.message 
    });
  }
});

export default router;
