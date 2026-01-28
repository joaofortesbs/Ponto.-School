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

  // Exemplo de questão baseado no tipo
  let exemploQuestao = '';
  if (tipoQuestao === 'multipla-escolha') {
    exemploQuestao = `{
      "id": "questao-1",
      "type": "multipla-escolha",
      "enunciado": "Questão específica sobre ${tema} para ${anoEscolar}",
      "alternativas": [
        "Alternativa A específica do tema",
        "Alternativa B específica do tema",
        "Alternativa C específica do tema",
        "Alternativa D específica do tema"
      ],
      "respostaCorreta": 0,
      "explicacao": "Explicação detalhada da resposta correta",
      "dificuldade": "${dificuldade.toLowerCase()}",
      "tema": "${tema}"
    }`;
  } else if (tipoQuestao === 'verdadeiro-falso') {
    exemploQuestao = `{
      "id": "questao-1",
      "type": "verdadeiro-falso",
      "enunciado": "Afirmação sobre ${tema} para avaliar se é verdadeira ou falsa",
      "alternativas": ["Verdadeiro", "Falso"],
      "respostaCorreta": "true",
      "explicacao": "Explicação sobre por que a afirmação é verdadeira ou falsa",
      "dificuldade": "${dificuldade.toLowerCase()}",
      "tema": "${tema}"
    }`;
  } else {
    exemploQuestao = `{
      "id": "questao-1",
      "type": "discursiva",
      "enunciado": "Questão dissertativa sobre ${tema} que exige desenvolvimento de resposta",
      "respostaCorreta": "Resposta esperada detalhada",
      "explicacao": "Critérios de avaliação e pontos importantes",
      "dificuldade": "${dificuldade.toLowerCase()}",
      "tema": "${tema}"
    }`;
  }

  return `Gere ${numeroQuestoes} questões de ${tipoQuestao} sobre "${tema}" em ${disciplina} para ${anoEscolar}, dificuldade ${dificuldade}. Retorne SOMENTE JSON, sem texto extra:
{"titulo":"${titulo}","disciplina":"${disciplina}","tema":"${tema}","questoes":[{"id":"questao-1","type":"${tipoQuestao}","enunciado":"Questão aqui","alternativas":["A","B","C","D"],"respostaCorreta":0,"explicacao":"Explicação","dificuldade":"${dificuldade.toLowerCase()}","tema":"${tema}"}]}`;
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