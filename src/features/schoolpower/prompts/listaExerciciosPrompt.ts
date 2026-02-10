import { getQualityPromptForExerciseList, type QualityContext } from '@/features/schoolpower/agente-jota/prompts/quality-prompt-templates';

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

  let tipoQuestao = 'multipla-escolha';
  const modeloLower = modeloQuestoes.toLowerCase();

  if (modeloLower.includes('dissertativa') || modeloLower.includes('discursiva')) {
    tipoQuestao = 'discursiva';
  } else if (modeloLower.includes('verdadeiro') || modeloLower.includes('falso')) {
    tipoQuestao = 'verdadeiro-falso';
  } else if (modeloLower.includes('multipla') || modeloLower.includes('múltipla')) {
    tipoQuestao = 'multipla-escolha';
  } else if (modeloLower.includes('misto')) {
    tipoQuestao = 'misto';
  }

  const qualityCtx: QualityContext = {
    tema,
    disciplina,
    anoSerie: anoEscolar,
    objetivo: objetivos || `Exercícios sobre ${tema}`
  };
  const qualityDirectives = getQualityPromptForExerciseList(qualityCtx);

  let exemploQuestao = '';
  if (tipoQuestao === 'multipla-escolha') {
    exemploQuestao = `{
      "id": "questao-1",
      "type": "multipla-escolha",
      "enunciado": "Considerando os estudos sobre ${tema} em ${disciplina} para o ${anoEscolar}, analise a situação a seguir e responda: [situação contextualizada com o cotidiano do aluno]",
      "alternativas": [
        "Alternativa correta com explicação precisa do conceito",
        "Distrator baseado no erro conceitual mais comum dos alunos",
        "Distrator com informação parcialmente correta mas com falha conceitual",
        "Distrator plausível mas que confunde dois conceitos relacionados"
      ],
      "respostaCorreta": 0,
      "explicacao": "A alternativa A está correta porque [explicação detalhada do conceito]. A alternativa B está incorreta porque representa o erro comum de [descrição do erro]. A alternativa C falha ao [descrição]. A alternativa D confunde [conceito A] com [conceito B]. Para aprofundar, estude [dica de estudo].",
      "dificuldade": "medio",
      "habilidade_bncc": "Código da habilidade BNCC trabalhada",
      "nivel_bloom": "Aplicar",
      "tema": "${tema}"
    }`;
  } else if (tipoQuestao === 'verdadeiro-falso') {
    exemploQuestao = `{
      "id": "questao-1",
      "type": "verdadeiro-falso",
      "enunciado": "Analise a afirmação sobre ${tema}: [afirmação específica e contextualizada]. Esta afirmação é verdadeira ou falsa? Justifique sua resposta.",
      "alternativas": ["Verdadeiro", "Falso"],
      "respostaCorreta": true,
      "explicacao": "Esta afirmação é verdadeira/falsa porque [explicação detalhada com fundamentação]. O erro conceitual que leva à resposta incorreta é [descrição do erro comum].",
      "dificuldade": "facil",
      "habilidade_bncc": "Código BNCC",
      "nivel_bloom": "Compreender",
      "tema": "${tema}"
    }`;
  } else {
    exemploQuestao = `{
      "id": "questao-1",
      "type": "discursiva",
      "enunciado": "Com base nos conhecimentos adquiridos sobre ${tema} em ${disciplina}, analise [situação/cenário contextualizado] e desenvolva uma resposta que contemple: (a) [aspecto 1], (b) [aspecto 2], (c) [relação com o cotidiano].",
      "respostaCorreta": "Resposta modelo: O aluno deve abordar os seguintes pontos essenciais: 1) [ponto 1 com explicação], 2) [ponto 2 com explicação], 3) [conexão com a realidade]. Uma resposta completa também pode incluir [elementos adicionais].",
      "explicacao": "Critérios de avaliação: (1) Domínio conceitual [0-3 pontos], (2) Articulação de ideias [0-3 pontos], (3) Contextualização [0-2 pontos], (4) Clareza e coerência [0-2 pontos]. Total: 10 pontos.",
      "dificuldade": "dificil",
      "habilidade_bncc": "Código BNCC",
      "nivel_bloom": "Avaliar",
      "tema": "${tema}"
    }`;
  }

  return `Você é um professor especialista em ${disciplina} com profunda experiência em elaboração de avaliações e exercícios pedagógicos de alta qualidade. Gere EXATAMENTE ${numeroQuestoes} questões de ${tipoQuestao} para alunos do ${anoEscolar} sobre o tema "${tema}", com progressão de dificuldade.

${qualityDirectives}

REGRAS OBRIGATÓRIAS:
1. Cada questão DEVE ter um enunciado completo, contextualizado e educativo (mínimo 50 caracteres)
2. Cada alternativa DEVE conter texto real e específico sobre o tema (NÃO use "Alternativa A", "Opção B" etc.)
3. Os distratores devem representar ERROS CONCEITUAIS COMUNS que alunos realmente cometem
4. A resposta correta deve ser indicada pelo índice (0=primeira, 1=segunda, etc.)
5. Inclua explicação detalhada com resolução passo a passo para cada resposta
6. PROGRESSÃO: Primeiras questões fáceis, intermediárias médias, finais difíceis
7. Cada questão deve ter os campos: "dificuldade", "habilidade_bncc", "nivel_bloom"

Retorne SOMENTE um JSON válido, sem markdown, sem texto adicional:

{
  "titulo": "${titulo}",
  "disciplina": "${disciplina}",
  "tema": "${tema}",
  "anoEscolar": "${anoEscolar}",
  "instrucoes_aluno": "Leia cada questão com atenção. Tempo estimado: ${Math.ceil(numeroQuestoes * 3)} minutos. ${tipoQuestao === 'multipla-escolha' ? 'Marque apenas uma alternativa por questão.' : tipoQuestao === 'discursiva' ? 'Responda com clareza e fundamente suas respostas.' : 'Justifique suas respostas.'}",
  "instrucoes_professor": "Orientações para aplicação desta lista em sala de aula, incluindo tempo estimado, adaptações para diferentes níveis e critérios de avaliação.",
  "questoes": [
    ${exemploQuestao}
  ]
}

IMPORTANTE: Substitua o exemplo acima por ${numeroQuestoes} questões REAIS, DIFERENTES e com PROGRESSÃO DE DIFICULDADE sobre ${tema}. Cada questão deve ter conteúdo específico, educativo e alinhado à BNCC.`;
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
