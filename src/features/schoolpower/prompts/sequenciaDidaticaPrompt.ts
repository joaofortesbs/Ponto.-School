
import { ProcessedSequenciaDidaticaData } from '../activities/sequencia-didatica/sequenciaDidaticaProcessor';

export interface SequenciaDidaticaPromptData extends ProcessedSequenciaDidaticaData {
  contextualizationData?: any;
}

export function buildSequenciaDidaticaPrompt(data: SequenciaDidaticaPromptData): string {
  console.log('📝 [SEQUENCIA_DIDATICA_PROMPT] Construindo prompt para IA:', {
    titulo: data.tituloTemaAssunto,
    disciplina: data.disciplina,
    quantidadeAulas: data.quantidadeAulas,
    timestamp: new Date().toISOString()
  });

  const prompt = `
# GERAÇÃO DE SEQUÊNCIA DIDÁTICA COMPLETA

## DADOS DE ENTRADA:
**Título/Tema:** ${data.tituloTemaAssunto}
**Ano/Série:** ${data.anoSerie}  
**Disciplina:** ${data.disciplina}
**BNCC/Competências:** ${data.bnccCompetencias}
**Público-alvo:** ${data.publicoAlvo}
**Objetivos de Aprendizagem:** ${data.objetivosAprendizagem}
**Quantidade de Aulas:** ${data.quantidadeAulas}
**Quantidade de Diagnósticos:** ${data.quantidadeDiagnosticos}
**Quantidade de Avaliações:** ${data.quantidadeAvaliacoes}
**Cronograma:** ${data.cronograma}

## INSTRUÇÕES ESPECÍFICAS:

Você deve gerar uma sequência didática COMPLETA e DETALHADA em formato JSON com a seguinte estrutura:

\`\`\`json
{
  "metadados": {
    "titulo": "${data.tituloTemaAssunto}",
    "disciplina": "${data.disciplina}",
    "anoSerie": "${data.anoSerie}",
    "duracaoTotal": "${data.contextualData.duracaoTotal}",
    "objetivosGerais": "${data.objetivosAprendizagem}",
    "competenciasBNCC": "${data.bnccCompetencias}",
    "publicoAlvo": "${data.publicoAlvo}"
  },
  "aulas": [
    // GERAR EXATAMENTE ${data.quantidadeAulas} AULAS
    {
      "id": "aula-1",
      "numero": 1,
      "titulo": "Título específico da aula",
      "objetivoEspecifico": "Objetivo claro e mensurável",
      "resumoContexto": "Breve contexto da aula",
      "tempoEstimado": "50 min",
      "estrutura": {
        "introducao": {
          "tempo": "10 min",
          "atividades": ["Atividade específica 1", "Atividade específica 2"],
          "descricao": "Descrição detalhada da introdução"
        },
        "desenvolvimento": {
          "tempo": "30 min", 
          "atividades": ["Atividade de desenvolvimento 1", "Atividade de desenvolvimento 2"],
          "descricao": "Descrição detalhada do desenvolvimento"
        },
        "fechamento": {
          "tempo": "10 min",
          "atividades": ["Atividade de fechamento 1"],
          "descricao": "Descrição detalhada do fechamento"
        }
      },
      "recursos": ["Recurso 1", "Recurso 2", "Recurso 3"],
      "metodologia": "Descrição da metodologia utilizada",
      "avaliacaoFormativa": "Como será avaliado o aprendizado",
      "observacoes": "Observações importantes para o professor"
    }
  ],
  "diagnosticos": [
    // GERAR EXATAMENTE ${data.quantidadeDiagnosticos} DIAGNÓSTICOS
    {
      "id": "diagnostico-1",
      "numero": 1,
      "titulo": "Título do diagnóstico",
      "objetivo": "Objetivo específico da avaliação diagnóstica",
      "tipo": "Quiz/Prova/Observação/Portfólio",
      "tempoEstimado": "20 min",
      "instrumentos": ["Instrumento 1", "Instrumento 2"],
      "criterios": ["Critério 1", "Critério 2", "Critério 3"],
      "questoesSugeridas": [
        {
          "tipo": "multipla_escolha",
          "enunciado": "Pergunta específica relacionada ao conteúdo",
          "alternativas": ["A) Opção 1", "B) Opção 2", "C) Opção 3", "D) Opção 4"],
          "respostaCorreta": "A",
          "justificativa": "Explicação da resposta correta"
        }
      ],
      "resultadosEsperados": "Descrição dos resultados esperados",
      "acoesPosResultado": "Ações a serem tomadas com base nos resultados"
    }
  ],
  "avaliacoes": [
    // GERAR EXATAMENTE ${data.quantidadeAvaliacoes} AVALIAÇÕES
    {
      "id": "avaliacao-1", 
      "numero": 1,
      "titulo": "Título da avaliação",
      "objetivo": "Objetivo específico da avaliação",
      "tipo": "Prova/Trabalho/Projeto/Apresentação",
      "tempoEstimado": "45 min",
      "peso": 5.0,
      "criterios": [
        {
          "criterio": "Nome do critério",
          "peso": 2.5,
          "descricao": "Descrição do que será avaliado"
        }
      ],
      "rubricas": [
        {
          "nivel": "Excelente",
          "pontuacao": "9-10",
          "descricao": "Critérios para excelente"
        },
        {
          "nivel": "Bom", 
          "pontuacao": "7-8",
          "descricao": "Critérios para bom"
        }
      ],
      "questoesSugeridas": [
        {
          "tipo": "discursiva",
          "enunciado": "Questão discursiva específica",
          "pontuacao": 2.5,
          "criterios": ["O que deve conter na resposta"]
        }
      ],
      "recursos": ["Recursos necessários"],
      "observacoes": "Observações importantes"
    }
  ],
  "cronogramaSugerido": {
    "distribuicaoSemanal": "${data.contextualData.frequenciaSemanal}",
    "duracaoTotal": "${data.contextualData.duracaoTotal}",
    "sequenciaLogica": [
      {
        "semana": 1,
        "atividades": ["Diagnóstico 1", "Aula 1"],
        "observacoes": "Observações da semana"
      }
    ]
  },
  "encadeamentoDidatico": {
    "progressaoConceitual": "Como os conceitos se conectam progressivamente",
    "pré-requisitos": ["Conhecimento 1", "Conhecimento 2"],
    "conexoes": "Como as aulas se relacionam entre si"
  },
  "recursosComplementares": {
    "materiaisApoio": ["Material 1", "Material 2"],
    "tecnologias": ["Tecnologia 1", "Tecnologia 2"], 
    "espacosAprendizagem": ["Sala de aula", "Laboratório"]
  },
  "adaptacoesPossíveis": {
    "necessidadesEspeciais": "Sugestões para adaptação",
    "diferenciacaoEnsino": "Estratégias para diferentes ritmos",
    "recursosAlternativos": "Alternativas para recursos indisponíveis"
  }
}
\`\`\`

## REQUISITOS OBRIGATÓRIOS:

1. **QUANTIDADE EXATA**: Gere exatamente ${data.quantidadeAulas} aulas, ${data.quantidadeDiagnosticos} diagnósticos e ${data.quantidadeAvaliacoes} avaliações
2. **CONSISTÊNCIA**: Todos os elementos devem estar alinhados com o tema "${data.tituloTemaAssunto}" e disciplina "${data.disciplina}"
3. **PROGRESSÃO LÓGICA**: As aulas devem seguir uma sequência pedagógica coerente
4. **ESPECIFICIDADE**: Cada elemento deve ser específico para o ano/série "${data.anoSerie}"
5. **OBJETIVOS CLAROS**: Cada aula, diagnóstico e avaliação deve ter objetivos mensuráveis
6. **RECURSOS REALISTAS**: Sugerir apenas recursos disponíveis em escolas regulares
7. **TEMPO ADEQUADO**: Respeitar os tempos padrão de aula (50 min), diagnóstico (20 min) e avaliação (45 min)

## FORMATO DE RESPOSTA:
Responda APENAS com o JSON válido, sem texto adicional antes ou depois.
O JSON deve estar completo e seguir exatamente a estrutura solicitada.
Todos os campos são obrigatórios e devem ser preenchidos com conteúdo educacionalmente relevante.

IMPORTANTE: A resposta deve ser um JSON válido que pode ser parseado diretamente pelo JavaScript.
`;

  console.log('✅ [SEQUENCIA_DIDATICA_PROMPT] Prompt construído com sucesso, tamanho:', prompt.length);
  
  return prompt;
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
  
  if (!data.objetivosAprendizagem?.trim()) {
    errors.push('Objetivos de aprendizagem são obrigatórios');
  }
  
  const quantAulas = parseInt(data.quantidadeAulas);
  if (!quantAulas || quantAulas < 1 || quantAulas > 20) {
    errors.push('Quantidade de aulas deve ser entre 1 e 20');
  }
  
  const quantDiag = parseInt(data.quantidadeDiagnosticos);
  if (!quantDiag || quantDiag < 1 || quantDiag > 10) {
    errors.push('Quantidade de diagnósticos deve ser entre 1 e 10');
  }
  
  const quantAval = parseInt(data.quantidadeAvaliacoes);
  if (!quantAval || quantAval < 1 || quantAval > 10) {
    errors.push('Quantidade de avaliações deve ser entre 1 e 10');
  }
  
  return errors;
}
