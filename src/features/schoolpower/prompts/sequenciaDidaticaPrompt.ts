
export const sequenciaDidaticaPrompt = `
Você é um especialista em criação de sequências didáticas educacionais. Baseando-se no contexto fornecido, gere uma sequência didática completa seguindo exatamente este formato JSON:

{
  "id": "sequencia-didatica",
  "title": "Título da Sequência Didática",
  "description": "Descrição detalhada da sequência didática",
  "personalizedTitle": "Título personalizado baseado no contexto",
  "personalizedDescription": "Descrição personalizada baseada no contexto",
  "duration": "Duração estimada (ex: 4-6 aulas)",
  "difficulty": "Nível de dificuldade (Iniciante/Intermediário/Avançado)",
  "category": "Sequência Didática",
  "type": "Planejamento Pedagógico",
  "customFields": {
    "Título do Tema / Assunto": "Tema central da sequência",
    "Ano / Série": "Ano ou série específica",
    "Disciplina": "Disciplina principal",
    "BNCC / Competências": "Competências e habilidades da BNCC",
    "Público-alvo": "Descrição do público-alvo",
    "Objetivos de Aprendizagem": "Objetivos específicos a serem alcançados",
    "Quantidade de Aulas": "Número de aulas previstas",
    "Quantidade de Diagnósticos": "Número de avaliações diagnósticas",
    "Quantidade de Avaliações": "Número de avaliações formativas/somativas",
    "Cronograma": "Cronograma resumido da sequência"
  }
}

IMPORTANTE: 
- Retorne APENAS o JSON válido, sem texto adicional
- Todos os valores devem ser strings, não objetos
- Preencha todos os campos customFields baseando-se no contexto fornecido
- Use termos educacionais apropriados e específicos
- Garanta que os campos sejam consistentes com o nível educacional solicitado
`;
export interface SequenciaDidaticaPromptData {
  tituloTemaAssunto: string;
  anoSerie: string;
  disciplina: string;
  bnccCompetencias: string;
  publicoAlvo: string;
  objetivosAprendizagem: string;
  quantidadeAulas: string;
  quantidadeDiagnosticos: string;
  quantidadeAvaliacoes: string;
  cronograma: string;
}

export const buildSequenciaDidaticaPrompt = (data: SequenciaDidaticaPromptData): string => {
  return `
Você é uma IA especializada em criar sequências didáticas educacionais detalhadas e estruturadas.

Com base nos dados fornecidos, crie uma sequência didática completa seguindo rigorosamente estas especificações:

DADOS FORNECIDOS:
- Título/Tema: ${data.tituloTemaAssunto}
- Ano/Série: ${data.anoSerie}
- Disciplina: ${data.disciplina}
- BNCC/Competências: ${data.bnccCompetencias}
- Público-alvo: ${data.publicoAlvo}
- Objetivos de Aprendizagem: ${data.objetivosAprendizagem}
- Quantidade de Aulas: ${data.quantidadeAulas}
- Quantidade de Diagnósticos: ${data.quantidadeDiagnosticos}
- Quantidade de Avaliações: ${data.quantidadeAvaliacoes}
- Cronograma: ${data.cronograma}

ESTRUTURA OBRIGATÓRIA DA RESPOSTA:
Responda APENAS em formato JSON válido, seguindo exatamente esta estrutura:

{
  "sequenciaDidatica": {
    "titulo": "${data.tituloTemaAssunto}",
    "disciplina": "${data.disciplina}",
    "anoSerie": "${data.anoSerie}",
    "cargaHoraria": "baseada na quantidade de aulas",
    "descricaoGeral": "descrição completa da sequência didática",
    "aulas": [
      {
        "id": "aula_1",
        "tipo": "Aula",
        "titulo": "título específico da aula",
        "objetivo": "objetivo específico desta aula",
        "resumo": "resumo detalhado do conteúdo da aula",
        "duracaoEstimada": "tempo em minutos",
        "materiaisNecessarios": ["material1", "material2"],
        "metodologia": "descrição da metodologia",
        "avaliacaoFormativa": "como avaliar o aprendizado nesta aula"
      }
    ],
    "diagnosticos": [
      {
        "id": "diagnostico_1",
        "tipo": "Diagnostico",
        "titulo": "título do diagnóstico",
        "objetivo": "objetivo específico do diagnóstico",
        "resumo": "resumo do que será diagnosticado",
        "instrumentos": ["questionário", "observação"],
        "momentoAplicacao": "quando aplicar na sequência"
      }
    ],
    "avaliacoes": [
      {
        "id": "avaliacao_1",
        "tipo": "Avaliacao",
        "titulo": "título da avaliação",
        "objetivo": "objetivo específico da avaliação",
        "resumo": "resumo do que será avaliado",
        "criteriosAvaliacao": ["critério1", "critério2"],
        "instrumentos": ["prova", "trabalho"],
        "valorPontuacao": "distribuição de pontos"
      }
    ]
  },
  "metadados": {
    "totalAulas": ${data.quantidadeAulas},
    "totalDiagnosticos": ${data.quantidadeDiagnosticos},
    "totalAvaliacoes": ${data.quantidadeAvaliacoes},
    "competenciasBNCC": "${data.bnccCompetencias}",
    "objetivosGerais": "${data.objetivosAprendizagem}",
    "generatedAt": "${new Date().toISOString()}",
    "isGeneratedByAI": true
  }
}

DIRETRIZES IMPORTANTES:
1. Crie exatamente ${data.quantidadeAulas} aulas, ${data.quantidadeDiagnosticos} diagnósticos e ${data.quantidadeAvaliacoes} avaliações
2. Cada aula deve ter conteúdo único e progressivo
3. Os diagnósticos devem estar estrategicamente posicionados
4. As avaliações devem verificar o aprendizado dos objetivos
5. Todos os conteúdos devem estar alinhados com a BNCC: ${data.bnccCompetencias}
6. Adapte a linguagem e complexidade para ${data.anoSerie}
7. Mantenha coerência com os objetivos: ${data.objetivosAprendizagem}

RESPONDA APENAS COM O JSON, SEM TEXTO ADICIONAL.
`;
};
