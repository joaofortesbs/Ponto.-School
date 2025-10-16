import { GoogleGenerativeAI } from "@google/generative-ai";
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

const languageNames = {
  'pt': 'Português',
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
  'it': 'Italiano',
  'de': 'Deutsch'
};

async function translateText(text, targetLanguage) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const targetLangName = languageNames[targetLanguage] || targetLanguage;
    
    const prompt = `Traduza o seguinte texto para ${targetLangName}. Retorne APENAS a tradução, sem explicações adicionais:\n\n${text}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text().trim();
    
    console.log(`✅ [TRADUÇÃO] ${text.substring(0, 50)}... → ${translatedText.substring(0, 50)}... (${targetLanguage})`);
    
    return translatedText;
  } catch (error) {
    console.error('❌ [TRADUÇÃO] Erro ao traduzir:', error);
    throw error;
  }
}

router.post('/', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ 
        error: 'Parâmetros inválidos', 
        message: 'text e targetLanguage são obrigatórios' 
      });
    }

    if (targetLanguage === 'pt') {
      return res.json({ translatedText: text });
    }

    const translatedText = await translateText(text, targetLanguage);

    res.json({ 
      success: true, 
      translatedText,
      originalText: text,
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
