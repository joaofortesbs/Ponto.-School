import OpenAI from "openai";
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Groq API configuration - uses environment variable only (no hardcoded fallback)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

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
    
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.3,
    });
    
    const translatedText = response.choices[0].message.content.trim();
    
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
