
/**
 * Prompt específico para geração de atividades de Quadro Interativo usando Gemini AI
 */

export interface QuadroInterativoFormData {
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficultyLevel: string;
  quadroInterativoCampoEspecifico: string;
  materials?: string;
  instructions?: string;
  evaluation?: string;
  timeLimit?: string;
  context?: string;
}

export function buildQuadroInterativoPrompt(formData: QuadroInterativoFormData): string {
  return `
Você é um especialista em educação e criação de atividades interativas para quadros digitais. 
Sua tarefa é gerar um conteúdo educacional estruturado para uma atividade de Quadro Interativo.

DADOS DA ATIVIDADE:
- Disciplina: ${formData.subject}
- Ano/Série: ${formData.schoolYear}
- Tema: ${formData.theme}
- Objetivos: ${formData.objectives}
- Nível de Dificuldade: ${formData.difficultyLevel}
- Atividade Específica: ${formData.quadroInterativoCampoEspecifico}
${formData.materials ? `- Materiais: ${formData.materials}` : ''}
${formData.instructions ? `- Instruções: ${formData.instructions}` : ''}
${formData.evaluation ? `- Avaliação: ${formData.evaluation}` : ''}
${formData.timeLimit ? `- Tempo Limite: ${formData.timeLimit}` : ''}
${formData.context ? `- Contexto: ${formData.context}` : ''}

INSTRUÇÕES:
1. Crie um TÍTULO atrativo e educativo para a atividade
2. Desenvolva um CONTEÚDO didático e interativo que seja adequado para ser exibido em um quadro digital
3. O conteúdo deve ser engajante, claro e adequado ao nível educacional especificado
4. Inclua elementos que aproveitem a interatividade do quadro digital
5. O texto deve ser bem estruturado e visualmente organizável

FORMATO DE RESPOSTA (JSON):
{
  "titulo": "Título da atividade",
  "conteudo": "Conteúdo detalhado da atividade, incluindo explicações, exemplos e instruções para interação no quadro digital. Use quebras de linha (\\n) para organizar o texto.",
  "isGeneratedByAI": true,
  "generatedAt": "${new Date().toISOString()}",
  "activityType": "quadro-interativo"
}

Responda APENAS com o JSON válido, sem texto adicional.
`;
}

export function validateQuadroInterativoResponse(response: string): any {
  try {
    // Limpar resposta removendo markdown se presente
    let cleanedResponse = response.trim();
    cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
    
    const jsonStart = cleanedResponse.indexOf('{');
    const jsonEnd = cleanedResponse.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    }
    
    const parsedResult = JSON.parse(cleanedResponse);
    
    // Validar campos obrigatórios
    if (!parsedResult.titulo || !parsedResult.conteudo) {
      throw new Error('Campos obrigatórios "titulo" e "conteudo" não encontrados na resposta');
    }
    
    return parsedResult;
  } catch (error) {
    console.error('❌ Erro ao validar resposta do Quadro Interativo:', error);
    throw new Error(`Resposta inválida da IA: ${error.message}`);
  }
}
