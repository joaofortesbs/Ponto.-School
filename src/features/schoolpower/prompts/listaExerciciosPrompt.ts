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

  return `Você é um especialista em educação brasileira. Crie uma lista de exercícios REAL e PERSONALIZADA baseada nos dados específicos fornecidos.

DADOS ESPECÍFICOS DA ATIVIDADE:
- Título: ${titulo}
- Descrição: ${descricao}
- Disciplina: ${disciplina}
- Tema Específico: ${tema}
- Ano de Escolaridade: ${anoEscolar}
- Número de Questões: ${numeroQuestoes}
- Nível de Dificuldade: ${dificuldade}
- Modelo de Questões: ${modeloQuestoes}
- Objetivos: ${objetivos}
- Fontes de Referência: ${fontes}

INSTRUÇÕES OBRIGATÓRIAS:
1. Crie EXATAMENTE ${numeroQuestoes} questões reais e específicas sobre "${tema}" em ${disciplina}
2. Adeque o vocabulário e complexidade para estudantes do ${anoEscolar}
3. Use nível de dificuldade: ${dificuldade}
4. Tipo de questões: ${tipoQuestao}
5. Cada questão deve abordar aspectos diferentes do tema "${tema}"
6. Conteúdo deve ser educacionalmente válido e contextualizado

EXEMPLO DE QUESTÃO PARA SEGUIR:
${exemploQuestao}

FORMATO DE RESPOSTA OBRIGATÓRIO - JSON VÁLIDO:
{
  "titulo": "${titulo}",
  "disciplina": "${disciplina}",
  "tema": "${tema}",
  "anoEscolaridade": "${anoEscolar}",
  "numeroQuestoes": ${numeroQuestoes},
  "dificuldade": "${dificuldade}",
  "tipoQuestoes": "${modeloQuestoes}",
  "objetivos": "Desenvolver o conhecimento sobre ${tema} adequado ao ${anoEscolar}",
  "conteudoPrograma": "Conteúdo programático específico sobre ${tema} em ${disciplina}",
  "observacoes": "Instruções importantes para a resolução dos exercícios",
  "questoes": [
    // Array com ${numeroQuestoes} questões seguindo o exemplo acima
  ]
}

REGRAS CRÍTICAS:
- Responda APENAS com JSON válido, sem caracteres extras ou texto adicional
- Crie ${numeroQuestoes} questões diferentes e específicas sobre "${tema}"
- Para múltipla escolha: exatamente 4 alternativas
- Para verdadeiro/falso: ["Verdadeiro", "Falso"]
- Para discursiva: sem alternativas
- IDs únicos: "questao-1", "questao-2", etc.
- Enunciados específicos do tema, não genéricos
- Adequar ao nível escolar e dificuldade solicitados

IMPORTANTE: O conteúdo deve ser específico para "${tema}" em ${disciplina}, adequado ao ${anoEscolar}.`;
};

export const validateListaExerciciosResponse = (response: any): boolean => {
  console.log('🔍 [validateListaExerciciosResponse] Validando resposta...');
  
  if (!response || typeof response !== 'object') {
    console.error('❌ [validateListaExerciciosResponse] Resposta não é um objeto válido');
    return false;
  }

  if (!response.questoes || !Array.isArray(response.questoes)) {
    console.error('❌ [validateListaExerciciosResponse] Propriedade "questoes" não existe ou não é array');
    console.log('🔍 [validateListaExerciciosResponse] Chaves disponíveis:', Object.keys(response));
    return false;
  }

  if (response.questoes.length === 0) {
    console.error('❌ [validateListaExerciciosResponse] Array de questões está vazio');
    return false;
  }

  // Validação mais leniente - pelo menos deve ter algum conteúdo no enunciado
  let validCount = 0;
  for (let i = 0; i < response.questoes.length; i++) {
    const questao = response.questoes[i];
    
    // Verificar se tem algum campo de enunciado (suporta múltiplos formatos)
    const temEnunciado = questao.enunciado || questao.pergunta || questao.question || questao.statement || questao.texto;
    const temConteudo = temEnunciado && temEnunciado.trim().length > 10;
    
    if (temConteudo) {
      validCount++;
    } else {
      console.warn(`⚠️ [validateListaExerciciosResponse] Questão ${i + 1} sem enunciado válido:`, questao);
    }
  }

  console.log(`✅ [validateListaExerciciosResponse] ${validCount}/${response.questoes.length} questões válidas`);
  
  // Aceitar se pelo menos 50% das questões são válidas
  const percentualValido = validCount / response.questoes.length;
  const isValid = percentualValido >= 0.5;
  
  console.log(`✅ [validateListaExerciciosResponse] Resultado: ${isValid ? 'VÁLIDO' : 'INVÁLIDO'} (${Math.round(percentualValido * 100)}% válidas)`);
  
  return isValid;
};