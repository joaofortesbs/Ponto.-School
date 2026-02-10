import { getQualityPromptForSequenciaDidatica, type QualityContext } from '@/features/schoolpower/agente-jota/prompts/quality-prompt-templates';

export interface SequenciaDidaticaPromptData {
  tituloTemaAssunto: string;
  anoSerie: string;
  disciplina: string;
  bnccCompetencias?: string;
  publicoAlvo: string;
  objetivosAprendizagem: string;
  quantidadeAulas: string;
  quantidadeDiagnosticos: string;
  quantidadeAvaliacoes: string;
  cronograma?: string;
}

export function buildSequenciaDidaticaPrompt(data: SequenciaDidaticaPromptData): string {
  const qualityCtx: QualityContext = {
    tema: data.tituloTemaAssunto,
    disciplina: data.disciplina,
    anoSerie: data.anoSerie,
    objetivo: data.objetivosAprendizagem
  };
  const qualityDirectives = getQualityPromptForSequenciaDidatica(qualityCtx);

  return `# Gerador de Sequência Didática - Especialista em Educação

Você é um especialista em educação e design instrucional. Crie uma sequência didática completa e detalhada baseada nos dados fornecidos.

## DADOS DA SEQUÊNCIA DIDÁTICA:
- **Título/Tema/Assunto**: ${data.tituloTemaAssunto}
- **Ano/Série**: ${data.anoSerie}
- **Disciplina**: ${data.disciplina}
- **Competências BNCC**: ${data.bnccCompetencias || 'A definir'}
- **Público-alvo**: ${data.publicoAlvo}
- **Objetivos de Aprendizagem**: ${data.objetivosAprendizagem}
- **Quantidade de Aulas**: ${data.quantidadeAulas}
- **Quantidade de Diagnósticos**: ${data.quantidadeDiagnosticos}
- **Quantidade de Avaliações**: ${data.quantidadeAvaliacoes}
- **Cronograma**: ${data.cronograma || 'A definir'}

${qualityDirectives}

## INSTRUÇÕES ESPECÍFICAS:

1. **Crie EXATAMENTE ${data.quantidadeAulas} aulas**, cada uma com:
   - ID único (aula-1, aula-2, etc.)
   - Título específico e atrativo
   - Objetivo claro e mensurável
   - Resumo detalhado do conteúdo
   - Duração estimada
   - Materiais necessários
   - Metodologia de ensino
   - Avaliação formativa

2. **Crie EXATAMENTE ${data.quantidadeDiagnosticos} diagnósticos**, cada um com:
   - ID único (diagnostico-1, diagnostico-2, etc.)
   - Título específico
   - Objetivo do diagnóstico
   - Resumo do que será avaliado
   - Instrumentos de avaliação
   - Momento de aplicação

3. **Crie EXATAMENTE ${data.quantidadeAvaliacoes} avaliações**, cada uma com:
   - ID único (avaliacao-1, avaliacao-2, etc.)
   - Título específico
   - Objetivo da avaliação
   - Resumo do que será avaliado
   - Critérios de avaliação
   - Instrumentos de avaliação
   - Valor/pontuação

## FORMATO DE RESPOSTA:

Responda APENAS com o JSON válido seguindo esta estrutura EXATA:

\`\`\`json
{
  "sequenciaDidatica": {
    "titulo": "Título completo da sequência didática",
    "disciplina": "${data.disciplina}",
    "anoSerie": "${data.anoSerie}",
    "cargaHoraria": "Carga horária total estimada",
    "descricaoGeral": "Descrição geral da sequência didática e seus objetivos",
    "aulas": [
      {
        "id": "aula-1",
        "tipo": "Aula",
        "titulo": "Título específico da aula 1",
        "objetivo": "Objetivo específico e mensurável da aula",
        "resumo": "Resumo detalhado do que será trabalhado na aula",
        "duracaoEstimada": "50 minutos",
        "materiaisNecessarios": ["Material 1", "Material 2", "Material 3"],
        "metodologia": "Metodologia de ensino específica para esta aula",
        "avaliacaoFormativa": "Como será feita a avaliação formativa"
      }
    ],
    "diagnosticos": [
      {
        "id": "diagnostico-1",
        "tipo": "Diagnostico",
        "titulo": "Título específico do diagnóstico",
        "objetivo": "Objetivo específico do diagnóstico",
        "resumo": "Resumo do que será diagnosticado e como",
        "instrumentos": ["Instrumento 1", "Instrumento 2"],
        "momentoAplicacao": "Quando será aplicado"
      }
    ],
    "avaliacoes": [
      {
        "id": "avaliacao-1",
        "tipo": "Avaliacao",
        "titulo": "Título específico da avaliação",
        "objetivo": "Objetivo específico da avaliação",
        "resumo": "Resumo do que será avaliado e como",
        "criteriosAvaliacao": ["Critério 1", "Critério 2", "Critério 3"],
        "instrumentos": ["Instrumento 1", "Instrumento 2"],
        "valorPontuacao": "Pontuação ou valor da avaliação"
      }
    ]
  },
  "metadados": {
    "totalAulas": ${data.quantidadeAulas},
    "totalDiagnosticos": ${data.quantidadeDiagnosticos},
    "totalAvaliacoes": ${data.quantidadeAvaliacoes},
    "competenciasBNCC": "${data.bnccCompetencias || 'Competências da BNCC aplicáveis'}",
    "objetivosGerais": "${data.objetivosAprendizagem}",
    "isGeneratedByAI": true,
    "generatedAt": "${new Date().toISOString()}"
  }
}
\`\`\`

## REQUISITOS IMPORTANTES:

- **CONTEÚDO EDUCACIONAL REAL**: Não use dados fictícios. Crie conteúdo educacional genuíno e aplicável.
- **ALINHAMENTO COM BNCC**: Garanta que as atividades estejam alinhadas com a Base Nacional Comum Curricular.
- **ADEQUAÇÃO AO PÚBLICO**: Todo conteúdo deve ser adequado ao ano/série especificado.
- **PROGRESSÃO PEDAGÓGICA**: As aulas devem seguir uma sequência lógica de aprendizagem.
- **AVALIAÇÃO AUTÊNTICA**: Diagnósticos e avaliações devem ser significativos e mensuráveis.
- **METODOLOGIAS ATIVAS**: Priorize metodologias que promovam o protagonismo do aluno.

**RESPONDA APENAS COM O JSON VÁLIDO. NÃO INCLUA TEXTO ADICIONAL.**`;
}

export const sequenciaDidaticaPrompt = {
  buildSequenciaDidaticaPrompt,
  type: 'sequencia-didatica'
};
