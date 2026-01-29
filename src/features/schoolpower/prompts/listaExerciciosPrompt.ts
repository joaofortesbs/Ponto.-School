export const buildListaExerciciosPrompt = (contextData: any): string => {
  const numeroQuestoes = parseInt(contextData.numeroQuestoes || contextData.numberOfQuestions || '10');
  const disciplina = contextData.disciplina || contextData.subject || 'Português';
  const tema = contextData.tema || contextData.theme || 'Conteúdo Geral';
  const anoEscolar = contextData.anoEscolaridade || contextData.schoolYear || '6º ano';
  const dificuldade = contextData.nivelDificuldade || contextData.difficultyLevel || 'Médio';
  const modeloQuestoes = contextData.modeloQuestoes || contextData.questionModel || 'multipla-escolha';
  const titulo = contextData.titulo || contextData.title || `Lista de Exercícios: ${tema}`;
  const descricao = contextData.descricao || contextData.description || '';
  const objetivos = contextData.objetivos || contextData.objectives || '';
  const fontes = contextData.fontes || contextData.sources || '';

  // Determinar o tipo de questão baseado no modelo
  let tipoQuestao = 'multipla-escolha';
  const modeloLower = modeloQuestoes.toLowerCase();

  if (modeloLower.includes('dissertativa') || modeloLower.includes('discursiva')) {
    tipoQuestao = 'discursiva';
  } else if (modeloLower.includes('verdadeiro') || modeloLower.includes('falso')) {
    tipoQuestao = 'verdadeiro-falso';
  } else if (modeloLower.includes('multipla') || modeloLower.includes('múltipla')) {
    tipoQuestao = 'multipla-escolha';
  }

  // Exemplo de questão baseado no tipo - com conteúdo real para guiar a IA
  let exemploQuestao = '';
  if (tipoQuestao === 'multipla-escolha') {
    exemploQuestao = `{
      "id": "questao-1",
      "type": "multipla-escolha",
      "enunciado": "De acordo com os estudos sobre ${tema} em ${disciplina}, qual das seguintes afirmações está correta?",
      "alternativas": [
        "A primeira opção correta e detalhada sobre ${tema}",
        "Uma alternativa plausível mas incorreta sobre o conteúdo",
        "Outra opção relacionada ao tema mas com erro conceitual",
        "Uma quarta opção que também aborda ${tema} incorretamente"
      ],
      "respostaCorreta": 0,
      "explicacao": "A primeira alternativa está correta porque explica corretamente o conceito de ${tema}. As demais alternativas apresentam erros conceituais específicos.",
      "dificuldade": "${dificuldade.toLowerCase()}",
      "tema": "${tema}"
    }`;
  } else if (tipoQuestao === 'verdadeiro-falso') {
    exemploQuestao = `{
      "id": "questao-1",
      "type": "verdadeiro-falso",
      "enunciado": "Considerando os conceitos fundamentais de ${tema} estudados em ${disciplina}, a seguinte afirmação é verdadeira ou falsa: [afirmação específica sobre ${tema}].",
      "alternativas": ["Verdadeiro", "Falso"],
      "respostaCorreta": true,
      "explicacao": "Esta afirmação é verdadeira/falsa porque...",
      "dificuldade": "${dificuldade.toLowerCase()}",
      "tema": "${tema}"
    }`;
  } else {
    exemploQuestao = `{
      "id": "questao-1",
      "type": "discursiva",
      "enunciado": "Com base nos conhecimentos adquiridos sobre ${tema}, desenvolva uma resposta explicando [aspecto específico do tema].",
      "respostaCorreta": "Resposta esperada: O aluno deve abordar os seguintes pontos...",
      "explicacao": "Critérios de avaliação: clareza, coerência, uso correto dos conceitos de ${tema}",
      "dificuldade": "${dificuldade.toLowerCase()}",
      "tema": "${tema}"
    }`;
  }

  return `Você é um professor especialista em ${disciplina}. Gere EXATAMENTE ${numeroQuestoes} questões de ${tipoQuestao} para alunos do ${anoEscolar} sobre o tema "${tema}", com nível de dificuldade ${dificuldade}.

REGRAS OBRIGATÓRIAS:
1. Cada questão DEVE ter um enunciado completo e educativo (mínimo 30 caracteres)
2. Cada alternativa DEVE conter texto real e específico sobre o tema (NÃO use "Alternativa A", "Opção B" etc.)
3. As alternativas devem ser plausíveis e educativas
4. A resposta correta deve ser indicada pelo índice (0=primeira, 1=segunda, etc.)
5. Inclua explicação detalhada para cada resposta

Retorne SOMENTE um JSON válido, sem markdown, sem texto adicional:

{
  "titulo": "${titulo}",
  "disciplina": "${disciplina}",
  "tema": "${tema}",
  "questoes": [
    ${exemploQuestao}
  ]
}

IMPORTANTE: Substitua o exemplo acima por ${numeroQuestoes} questões REAIS e DIFERENTES sobre ${tema}. Cada alternativa deve ter conteúdo específico e educativo.`;
};

export const validateListaExerciciosResponse = (response: any): boolean => {
  console.log('🔍 [validateListaExerciciosResponse] Validando resposta...');
  
  if (!response || typeof response !== 'object') {
    console.error('❌ [validateListaExerciciosResponse] Resposta não é objeto');
    return false;
  }

  const questoesArray = response.questoes || response.questions || [];
  
  if (!Array.isArray(questoesArray) || questoesArray.length === 0) {
    console.error('❌ [validateListaExerciciosResponse] Sem questões válidas');
    return false;
  }

  console.log(`📊 [validateListaExerciciosResponse] Questões: ${questoesArray.length}`);

  // Validação RIGOROSA: cada questão deve ter enunciado E respostaCorreta
  let fullyValidCount = 0;
  
  for (let i = 0; i < questoesArray.length; i++) {
    const q = questoesArray[i];
    if (!q || typeof q !== 'object') continue;
    
    // Buscar enunciado
    const enunciado = q.enunciado || q.pergunta || q.question || q.statement || q.texto || '';
    const hasEnunciado = String(enunciado).trim().length >= 5;
    
    // Buscar resposta correta
    const resposta = q.respostaCorreta ?? q.correctAnswer ?? q.correct_answer ?? q.gabarito ?? q.resposta;
    const hasResposta = resposta !== undefined && resposta !== null;
    
    // Para múltipla escolha, verificar alternativas
    const tipo = (q.type || 'multipla-escolha').toLowerCase();
    let hasAlternativas = true;
    if (tipo.includes('multipla') || tipo.includes('multiple')) {
      const alts = q.alternativas || q.options || q.alternatives || [];
      hasAlternativas = Array.isArray(alts) && alts.length >= 2;
    }
    
    const isFullyValid = hasEnunciado && hasResposta && hasAlternativas;
    
    if (isFullyValid) {
      fullyValidCount++;
      console.log(`✅ [validate] Questão ${i + 1}: VÁLIDA`);
    } else {
      console.warn(`⚠️ [validate] Questão ${i + 1}: enunciado=${hasEnunciado}, resposta=${hasResposta}, alternativas=${hasAlternativas}`);
    }
  }

  // Requer pelo menos 50% das questões totalmente válidas
  const minRequired = Math.max(1, Math.floor(questoesArray.length * 0.5));
  const isValid = fullyValidCount >= minRequired;
  
  console.log(`📊 [validate] ${fullyValidCount}/${questoesArray.length} válidas, mínimo=${minRequired}: ${isValid ? 'APROVADO ✅' : 'REPROVADO ❌'}`);
  
  return isValid;
};