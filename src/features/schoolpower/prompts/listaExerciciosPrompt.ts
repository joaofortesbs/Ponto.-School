
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

  return `
Você é um especialista em educação. Crie uma lista de exercícios PERSONALIZADA e REAL baseada nos dados específicos fornecidos.

DADOS ESPECÍFICOS DA ATIVIDADE:
- Título: ${titulo}
- Descrição: ${descricao}
- Disciplina: ${disciplina}
- Tema: ${tema}
- Ano de Escolaridade: ${anoEscolar}
- Número de Questões: ${numeroQuestoes}
- Nível de Dificuldade: ${dificuldade}
- Modelo de Questões: ${modeloQuestoes}
- Objetivos: ${objetivos}
- Fontes: ${fontes}

INSTRUÇÕES ESPECÍFICAS:
1. Crie EXATAMENTE ${numeroQuestoes} questões sobre ${tema} em ${disciplina}
2. Adeque o conteúdo para estudantes do ${anoEscolar}
3. Use nível de dificuldade: ${dificuldade}
4. Tipo de questões: ${modeloQuestoes}
5. Todas as questões devem ser sobre o tema específico: ${tema}

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
{
  "titulo": "${titulo}",
  "disciplina": "${disciplina}",
  "tema": "${tema}",
  "anoEscolaridade": "${anoEscolar}",
  "numeroQuestoes": ${numeroQuestoes},
  "dificuldade": "${dificuldade}",
  "tipoQuestoes": "${modeloQuestoes}",
  "objetivos": "Objetivos específicos para ${tema}",
  "conteudoPrograma": "Conteúdo programático detalhado",
  "observacoes": "Observações importantes",
  "questoes": [
    {
      "id": "questao-1",
      "type": "multipla-escolha",
      "enunciado": "Pergunta específica sobre ${tema}",
      "alternativas": [
        "Alternativa A",
        "Alternativa B",
        "Alternativa C",
        "Alternativa D"
      ],
      "respostaCorreta": 0,
      "explicacao": "Explicação detalhada",
      "dificuldade": "${dificuldade.toLowerCase()}",
      "tema": "${tema}"
    }
  ]
}

REGRAS IMPORTANTES:
- Para múltipla escolha: sempre 4 alternativas
- Para verdadeiro/falso: ["Verdadeiro", "Falso"]
- Para discursivas: sem alternativas
- Cada questão deve ter ID único
- Conteúdo deve ser educacional real
- Adequar vocabulário ao ano escolar
- Focar no tema específico fornecido

Responda APENAS com o JSON válido, sem markdown ou texto adicional.
`;
};

export const validateListaExerciciosResponse = (response: any): boolean => {
  if (!response || typeof response !== 'object') return false;
  
  if (!response.questoes || !Array.isArray(response.questoes)) return false;
  
  return response.questoes.every((questao: any) => 
    questao.id && 
    questao.type && 
    questao.enunciado &&
    (questao.type === 'discursiva' || questao.alternativas)
  );
};
