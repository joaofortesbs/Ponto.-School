
export interface SequenciaDidaticaPromptData {
  tituloTemaAssunto: string;
  disciplina: string;
  anoSerie: string;
  bnccCompetencias?: string;
  publicoAlvo: string;
  objetivosAprendizagem: string;
  quantidadeAulas: string;
  quantidadeDiagnosticos: string;
  quantidadeAvaliacoes: string;
  cronograma?: string;
  contextualizationData?: any;
}

export function validatePromptData(data: SequenciaDidaticaPromptData): string[] {
  const errors: string[] = [];
  
  if (!data.tituloTemaAssunto?.trim()) {
    errors.push('Título do tema/assunto é obrigatório');
  }
  if (!data.disciplina?.trim()) {
    errors.push('Disciplina é obrigatória');
  }
  if (!data.anoSerie?.trim()) {
    errors.push('Ano/série é obrigatório');
  }
  if (!data.publicoAlvo?.trim()) {
    errors.push('Público-alvo é obrigatório');
  }
  if (!data.objetivosAprendizagem?.trim()) {
    errors.push('Objetivos de aprendizagem são obrigatórios');
  }
  
  const qtdAulas = parseInt(data.quantidadeAulas);
  const qtdDiag = parseInt(data.quantidadeDiagnosticos);
  const qtdAval = parseInt(data.quantidadeAvaliacoes);
  
  if (isNaN(qtdAulas) || qtdAulas < 1) {
    errors.push('Quantidade de aulas deve ser um número válido maior que 0');
  }
  if (isNaN(qtdDiag) || qtdDiag < 0) {
    errors.push('Quantidade de diagnósticos deve ser um número válido maior ou igual a 0');
  }
  if (isNaN(qtdAval) || qtdAval < 1) {
    errors.push('Quantidade de avaliações deve ser um número válido maior que 0');
  }
  
  return errors;
}

export function buildSequenciaDidaticaPrompt(data: SequenciaDidaticaPromptData): string {
  const qtdAulas = parseInt(data.quantidadeAulas);
  const qtdDiag = parseInt(data.quantidadeDiagnosticos);
  const qtdAval = parseInt(data.quantidadeAvaliacoes);

  return `
Você é um especialista em educação e precisa criar uma Sequência Didática completa e detalhada.

**DADOS DE ENTRADA:**
- Título/Tema: ${data.tituloTemaAssunto}
- Disciplina: ${data.disciplina}
- Ano/Série: ${data.anoSerie}
- BNCC/Competências: ${data.bnccCompetencias || 'Competências gerais da BNCC'}
- Público-alvo: ${data.publicoAlvo}
- Objetivos: ${data.objetivosAprendizagem}
- Quantidade de Aulas: ${qtdAulas}
- Quantidade de Diagnósticos: ${qtdDiag}
- Quantidade de Avaliações: ${qtdAval}
- Cronograma: ${data.cronograma || 'A definir'}

**INSTRUÇÕES IMPORTANTES:**
1. Retorne APENAS um JSON válido, sem texto adicional
2. Crie exatamente ${qtdAulas} aulas, ${qtdDiag} diagnósticos e ${qtdAval} avaliações
3. Cada elemento deve ser detalhado e pedagogicamente consistente
4. Use linguagem educacional apropriada para ${data.anoSerie}

**FORMATO DE RESPOSTA JSON:**
\`\`\`json
{
  "metadados": {
    "titulo": "${data.tituloTemaAssunto}",
    "disciplina": "${data.disciplina}",
    "anoSerie": "${data.anoSerie}",
    "competenciasBNCC": "${data.bnccCompetencias || 'Competências da BNCC'}",
    "publicoAlvo": "${data.publicoAlvo}",
    "objetivosGerais": "${data.objetivosAprendizagem}",
    "duracaoTotal": "${qtdAulas} aulas",
    "criadoPor": "IA Educacional",
    "dataGeracao": "${new Date().toISOString()}"
  },
  "aulas": [
    ${Array.from({length: qtdAulas}, (_, i) => `
    {
      "numero": ${i + 1},
      "titulo": "Aula ${i + 1}: [Título específico]",
      "duracao": "50 minutos",
      "objetivos": [
        "Objetivo específico da aula ${i + 1}",
        "Segundo objetivo específico"
      ],
      "conteudo": "Conteúdo detalhado a ser abordado na aula ${i + 1}",
      "metodologia": "Metodologia pedagógica apropriada",
      "atividades": [
        "Atividade prática 1",
        "Atividade prática 2"
      ],
      "recursos": [
        "Recurso necessário 1",
        "Recurso necessário 2"
      ],
      "avaliacao": "Forma de avaliação da aprendizagem",
      "observacoes": "Observações importantes para o professor"
    }${i < qtdAulas - 1 ? ',' : ''}`).join('')}
  ],
  "diagnosticos": [
    ${Array.from({length: qtdDiag}, (_, i) => `
    {
      "titulo": "Diagnóstico ${i + 1}",
      "descricao": "Avaliação diagnóstica ${i + 1} para verificar conhecimentos prévios",
      "momento": "${i === 0 ? 'Início da sequência' : `Após aula ${Math.ceil((i + 1) * qtdAulas / qtdDiag)}`}",
      "tipo": "Diagnóstica",
      "instrumentos": [
        "Questionário",
        "Observação sistemática",
        "Atividade prática"
      ],
      "criterios": [
        "Conhecimentos prévios",
        "Habilidades desenvolvidas",
        "Dificuldades identificadas"
      ],
      "feedback": "Como usar os resultados para adaptar o ensino"
    }${i < qtdDiag - 1 ? ',' : ''}`).join('')}
  ],
  "avaliacoes": [
    ${Array.from({length: qtdAval}, (_, i) => `
    {
      "titulo": "Avaliação ${i + 1}",
      "descricao": "Avaliação ${i % 2 === 0 ? 'formativa' : 'somativa'} ${i + 1}",
      "momento": "Após aula ${Math.ceil((i + 1) * qtdAulas / qtdAval)}",
      "tipo": "${i % 2 === 0 ? 'Formativa' : 'Somativa'}",
      "instrumentos": [
        "${i % 2 === 0 ? 'Atividade em grupo' : 'Prova individual'}",
        "${i % 2 === 0 ? 'Portfólio' : 'Questões dissertativas'}",
        "Autoavaliação"
      ],
      "criterios": [
        "Domínio do conteúdo",
        "Aplicação prática",
        "Participação e engajamento"
      ],
      "peso": ${i === qtdAval - 1 ? '40' : '30'},
      "rubrica": "Critérios específicos de avaliação detalhados"
    }${i < qtdAval - 1 ? ',' : ''}`).join('')}
  ],
  "recursos_gerais": [
    "Quadro/lousa",
    "Projetor/computador",
    "Material impresso",
    "Recursos digitais específicos"
  ],
  "bibliografia": [
    "Referência bibliográfica 1 relacionada ao tema",
    "Referência bibliográfica 2 para aprofundamento"
  ],
  "observacoes_finais": "Considerações importantes sobre a implementação da sequência didática e adaptações necessárias"
}
\`\`\`

Gere uma sequência didática completa, coerente e aplicável seguindo exatamente este formato JSON.
`;
}
