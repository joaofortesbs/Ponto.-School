export interface ParsedIAResponse {
  [key: string]: string | string[] | number;
}

export const parseIAResponse = (iaResponse: string, contextualizationData?: any): ParsedIAResponse | null => {
  try {
    console.log('🔍 Iniciando parsing da resposta da IA para Lista de Exercícios...');
    console.log('📥 Resposta recebida:', iaResponse.substring(0, 500) + '...');

    // Tentar primeiro JSON direto
    try {
      const jsonData = JSON.parse(iaResponse);
      console.log('✅ JSON válido encontrado:', jsonData);

      // Mapear chaves do JSON para os campos esperados
      const mappedData: ParsedIAResponse = {};

      // Mapear campos básicos
      if (jsonData.titulo || jsonData.title) mappedData.title = jsonData.titulo || jsonData.title;
      if (jsonData.descricao || jsonData.description) mappedData.description = jsonData.descricao || jsonData.description;
      if (jsonData.disciplina || jsonData.subject) mappedData.subject = jsonData.disciplina || jsonData.subject;
      if (jsonData.dificuldade || jsonData.difficulty) mappedData.difficulty = jsonData.dificuldade || jsonData.difficulty;
      if (jsonData.duracao || jsonData.duration) mappedData.duration = jsonData.duracao || jsonData.duration;

      // Mapear campos específicos de Lista de Exercícios
      if (jsonData.objetivos || jsonData.objectives) mappedData.objectives = jsonData.objetivos || jsonData.objectives;
      if (jsonData.materiais || jsonData.materials) mappedData.materials = jsonData.materiais || jsonData.materials;
      if (jsonData.instrucoes || jsonData.instructions) mappedData.instructions = jsonData.instrucoes || jsonData.instructions;
      if (jsonData.exercicios || jsonData.exercises) mappedData.exercises = jsonData.exercicios || jsonData.exercises;
      if (jsonData.questoes || jsonData.questions) mappedData.questions = jsonData.questoes || jsonData.questions;
      if (jsonData.gabarito || jsonData.answerKey || jsonData.answer_key) {
        mappedData.answerKey = jsonData.gabarito || jsonData.answerKey || jsonData.answer_key;
      }
      if (jsonData.observacoes || jsonData.notes) mappedData.notes = jsonData.observacoes || jsonData.notes;

      return mappedData;

    } catch {
      // Se não for JSON, tentar extrair campos manualmente
      console.log('📝 Não é JSON válido, tentando extração manual...');
    }

    const result: ParsedIAResponse = {};

    // Padrões de extração mais robustos para Lista de Exercícios
    const patterns = {
      title: /(?:título|title|nome da atividade):\s*([^\n]+)/i,
      description: /(?:descrição|description|resumo):\s*([\s\S]*?)(?=\n(?:objetivos|materiais|instruções|\w+:)|$)/i,
      subject: /(?:disciplina|subject|matéria):\s*([^\n]+)/i,
      difficulty: /(?:dificuldade|difficulty|nível):\s*([^\n]+)/i,
      duration: /(?:duração|duration|tempo estimado):\s*([^\n]+)/i,
      objectives: /(?:objetivos|objectives|metas):\s*([\s\S]*?)(?=\n(?:materiais|instruções|exercícios|\w+:)|$)/i,
      materials: /(?:materiais|materials|recursos):\s*([\s\S]*?)(?=\n(?:instruções|exercícios|questões|\w+:)|$)/i,
      instructions: /(?:instruções|instructions|orientações):\s*([\s\S]*?)(?=\n(?:exercícios|questões|gabarito|\w+:)|$)/i,
      exercises: /(?:exercícios|exercises|atividades|lista de exercícios):\s*([\s\S]*?)(?=\n(?:questões|gabarito|observações|\w+:)|$)/i,
      questions: /(?:questões|questions|perguntas):\s*([\s\S]*?)(?=\n(?:gabarito|observações|\w+:)|$)/i,
      answerKey: /(?:gabarito|answer key|respostas|gabarito das questões):\s*([\s\S]*?)(?=\n(?:observações|\w+:)|$)/i,
      notes: /(?:observações|notes|observação|comentários):\s*([\s\S]*?)(?=\n\w+:|$)/i
    };

    // Extrair dados usando os padrões
    for (const [key, pattern] of Object.entries(patterns)) {
      const match = iaResponse.match(pattern);
      if (match && match[1]) {
        const value = match[1].trim().replace(/^\*+\s*/, '').replace(/\*+$/, '');
        if (value && value.length > 0) {
          result[key] = value;
        }
      }
    }

    // Incluir dados de contextualização se disponíveis
    if (contextualizationData) {
      if (contextualizationData.materias && !result.subject) {
        result.subject = contextualizationData.materias;
      }
      if (contextualizationData.publicoAlvo && !result.difficulty) {
        result.difficulty = contextualizationData.publicoAlvo;
      }
    }

    console.log('📋 Dados extraídos para Lista de Exercícios:', result);

    // Verificar se extraímos dados suficientes
    const essentialFields = ['title', 'description', 'exercises'];
    const hasEssentialData = essentialFields.some(field => result[field]);

    if (hasEssentialData) {
      console.log('✅ Parsing concluído com sucesso');
      return result;
    } else {
      console.warn('⚠️ Dados insuficientes extraídos da resposta da IA');
      return null;
    }

  } catch (error) {
    console.error('❌ Erro no parsing da resposta da IA:', error);
    return null;
  }
};

export { extractDataFromString, enrichWithContextualization, validateAndCleanData };