
import { GEMINI_API_KEY } from '../../activitiesManager';

export interface QuadroInterativoData {
  titulo: string;
  texto: string;
}

export interface QuadroInterativoFieldData {
  titulo?: string;
  disciplina?: string;
  anoEscolar?: string;
  tema?: string;
  objetivo?: string;
  instrucoes?: string;
  observacoes?: string;
  [key: string]: any;
}

/**
 * Gera conteúdo para atividade de Quadro Interativo usando Gemini AI
 */
export async function generateQuadroInterativoContent(fieldData: QuadroInterativoFieldData): Promise<QuadroInterativoData> {
  try {
    const prompt = buildQuadroInterativoPrompt(fieldData);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API Gemini: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedContent) {
      throw new Error('Resposta vazia da API Gemini');
    }

    return parseQuadroInterativoResponse(generatedContent);
  } catch (error) {
    console.error('Erro ao gerar conteúdo do Quadro Interativo:', error);
    return generateFallbackContent(fieldData);
  }
}

/**
 * Constrói o prompt para a API Gemini
 */
function buildQuadroInterativoPrompt(fieldData: QuadroInterativoFieldData): string {
  return `
Você é um especialista em educação criando uma atividade de Quadro Interativo.

DADOS FORNECIDOS:
- Título: ${fieldData.titulo || 'Não especificado'}
- Disciplina: ${fieldData.disciplina || 'Não especificado'}
- Ano Escolar: ${fieldData.anoEscolar || 'Não especificado'}
- Tema: ${fieldData.tema || 'Não especificado'}
- Objetivo: ${fieldData.objetivo || 'Não especificado'}
- Instruções: ${fieldData.instrucoes || 'Não especificado'}
- Observações: ${fieldData.observacoes || 'Não especificado'}

INSTRUÇÕES:
1. Analise todos os dados fornecidos
2. Gere um título claro e objetivo para o quadro interativo
3. Crie um texto simples e direto que será exibido no quadro
4. O texto deve ser educativo e adequado ao ano escolar
5. Mantenha o conteúdo focado no tema e objetivo especificados

FORMATO DE RESPOSTA (JSON):
{
  "titulo": "Título do Quadro Interativo",
  "texto": "Texto que será exibido no quadro"
}

Responda APENAS com o JSON válido:
`;
}

/**
 * Processa a resposta da API Gemini
 */
function parseQuadroInterativoResponse(response: string): QuadroInterativoData {
  try {
    // Remove possíveis caracteres de markdown
    const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanResponse);
    
    return {
      titulo: parsed.titulo || 'Quadro Interativo',
      texto: parsed.texto || 'Conteúdo do quadro'
    };
  } catch (error) {
    console.error('Erro ao processar resposta da Gemini:', error);
    return {
      titulo: 'Quadro Interativo',
      texto: 'Conteúdo gerado automaticamente'
    };
  }
}

/**
 * Gera conteúdo de fallback caso a API falhe
 */
function generateFallbackContent(fieldData: QuadroInterativoFieldData): QuadroInterativoData {
  const titulo = fieldData.titulo || 'Quadro Interativo';
  const tema = fieldData.tema || 'Tema educacional';
  
  return {
    titulo: titulo,
    texto: `Conteúdo sobre ${tema}. ${fieldData.objetivo || 'Atividade educativa interativa.'}`
  };
}

/**
 * Salva dados do quadro interativo localmente
 */
export function saveQuadroInterativoData(activityId: string, data: QuadroInterativoData): void {
  try {
    const storageKey = `quadro_interativo_${activityId}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
    console.log('Dados do Quadro Interativo salvos:', data);
  } catch (error) {
    console.error('Erro ao salvar dados do Quadro Interativo:', error);
  }
}

/**
 * Recupera dados do quadro interativo salvos localmente
 */
export function getQuadroInterativoData(activityId: string): QuadroInterativoData | null {
  try {
    const storageKey = `quadro_interativo_${activityId}`;
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Erro ao recuperar dados do Quadro Interativo:', error);
    return null;
  }
}
