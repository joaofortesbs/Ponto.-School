import { SequenciaDidaticaData } from '../activities/sequencia-didatica/sequenciaDidaticaProcessor';

export function sequenciaDidaticaPrompt(data: SequenciaDidaticaData): string {
  const numAulas = parseInt(data.quantidadeAulas) || 4;

  return `
Você é um especialista em educação. Crie uma sequência didática detalhada e estruturada.

DADOS:
- Título: ${data.tituloTemaAssunto}
- Disciplina: ${data.disciplina}
- Ano/Série: ${data.anoSerie}
- Público: ${data.publicoAlvo}
- Objetivos: ${data.objetivosAprendizagem}
- Aulas: ${numAulas}
- BNCC: ${data.bnccCompetencias || 'Conforme diretrizes'}

CRIAR:
- ${numAulas} aulas completas e sequenciais
- Objetivos específicos por aula
- Atividades práticas e teóricas
- Avaliação contínua e final
- Recursos necessários

RETORNE APENAS JSON VÁLIDO:

{
  "titulo": "Sequência Didática: [TEMA]",
  "introducao": "Descrição da sequência, público-alvo e objetivos gerais",
  "aulas": [
    {
      "numero": 1,
      "titulo": "Título da Aula 1",
      "objetivos": ["Objetivo 1", "Objetivo 2"],
      "conteudo": "Detalhamento do conteúdo da aula",
      "atividades": ["Atividade 1", "Atividade 2", "Atividade 3"],
      "recursos": ["Recurso 1", "Recurso 2"],
      "avaliacao": "Como avaliar esta aula",
      "duracao": "50 minutos"
    }
  ],
  "avaliacaoFinal": {
    "tipo": "Formativa e Somativa",
    "criterios": ["Critério 1", "Critério 2", "Critério 3"],
    "descricao": "Descrição da avaliação final"
  },
  "recursosGerais": ["Recurso geral 1", "Recurso geral 2"],
  "bibliografia": ["Referência 1", "Referência 2"]
}

Responda SOMENTE com o JSON válido, sem markdown ou texto adicional.
  `.trim();
}