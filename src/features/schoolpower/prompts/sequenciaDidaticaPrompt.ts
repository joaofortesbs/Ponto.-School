import { ActivityFormData } from '../construction/types/ActivityTypes';

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

export function buildSequenciaDidaticaPrompt(data: any): string {
  console.log('📝 [SEQUENCIA_DIDATICA_PROMPT] Construindo prompt para:', data);

  return `Você é um especialista em educação e deve criar uma sequência didática detalhada. 

IMPORTANTE: Responda APENAS com um JSON válido, sem markdown ou texto adicional.

Dados fornecidos:
- Título/Tema: ${data.tituloTemaAssunto}
- Disciplina: ${data.disciplina}
- Ano/Série: ${data.anoSerie}
- Público-alvo: ${data.publicoAlvo}
- Objetivos: ${data.objetivosAprendizagem}
- BNCC/Competências: ${data.bnccCompetencias}
- Quantidade de aulas: ${data.quantidadeAulas}
- Quantidade de diagnósticos: ${data.quantidadeDiagnosticos}
- Quantidade de avaliações: ${data.quantidadeAvaliacoes}

Crie uma sequência didática estruturada seguindo EXATAMENTE este formato JSON:

{
  "aulas": [
    {
      "id": "aula-1",
      "numero": 1,
      "titulo": "Título da Aula 1",
      "objetivoEspecifico": "Objetivo específico desta aula",
      "resumoContexto": "Resumo do contexto e desenvolvimento",
      "tempoEstimado": "50 min",
      "etapas": {
        "introducao": {
          "tempo": "10 min",
          "descricao": "Descrição da introdução"
        },
        "desenvolvimento": {
          "tempo": "30 min",
          "descricao": "Descrição do desenvolvimento"
        },
        "fechamento": {
          "tempo": "10 min",
          "descricao": "Descrição do fechamento"
        }
      },
      "recursos": ["Recurso 1", "Recurso 2"],
      "atividadesPraticas": {
        "tipo": "Tipo de atividade",
        "descricao": "Descrição da atividade prática",
        "tempo": "15 min"
      }
    }
  ],
  "diagnosticos": [
    {
      "id": "diagnostico-1",
      "numero": 1,
      "titulo": "Título do Diagnóstico 1",
      "objetivoAvaliativo": "Objetivo do diagnóstico",
      "tipo": "Quiz Diagnóstico",
      "tempoEstimado": "20 min",
      "questoes": "5 questões",
      "formato": "Múltipla escolha",
      "criteriosCorrecao": {
        "excelente": "4-5 acertos",
        "bom": "3 acertos",
        "precisaMelhorar": "Menos de 3 acertos"
      }
    }
  ],
  "avaliacoes": [
    {
      "id": "avaliacao-1",
      "numero": 1,
      "titulo": "Título da Avaliação 1",
      "objetivoAvaliativo": "Objetivo da avaliação",
      "tipo": "Prova Escrita",
      "tempoEstimado": "45 min",
      "questoes": "10 questões",
      "valorTotal": "10,0 pontos",
      "composicao": {
        "multipplaEscolha": {
          "quantidade": 6,
          "pontos": "6,0 pts"
        },
        "discursivas": {
          "quantidade": 4,
          "pontos": "4,0 pts"
        }
      },
      "criteriosCorrecao": "Critérios baseados na BNCC",
      "gabarito": "Gabarito disponível"
    }
  ],
  "cronogramaSugerido": {
    "duracao": "${data.quantidadeAulas} aulas",
    "distribuicao": "Sugestão de distribuição temporal",
    "observacoes": "Observações sobre o cronograma"
  }
}

Crie exatamente ${data.quantidadeAulas} aulas, ${data.quantidadeDiagnosticos} diagnósticos e ${data.quantidadeAvaliacoes} avaliações. Certifique-se de que o JSON seja válido e completo.`;
}

export const sequenciaDidaticaPrompt = {
  build: buildSequenciaDidaticaPrompt
};