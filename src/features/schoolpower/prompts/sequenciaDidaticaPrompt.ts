
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

export function buildSequenciaDidaticaPrompt(data: SequenciaDidaticaPromptData): string {
  console.log('🎯 Construindo prompt para Sequência Didática:', data);

  return `Você é um especialista em pedagogia e planejamento educacional. Crie uma SEQUÊNCIA DIDÁTICA COMPLETA E ESTRUTURADA baseada nas informações fornecidas.

DADOS DA SEQUÊNCIA DIDÁTICA:
- Título/Tema/Assunto: ${data.tituloTemaAssunto}
- Ano/Série: ${data.anoSerie}
- Disciplina: ${data.disciplina}
- Competências BNCC: ${data.bnccCompetencias}
- Público-alvo: ${data.publicoAlvo}
- Objetivos de Aprendizagem: ${data.objetivosAprendizagem}
- Quantidade de Aulas: ${data.quantidadeAulas}
- Quantidade de Diagnósticos: ${data.quantidadeDiagnosticos}
- Quantidade de Avaliações: ${data.quantidadeAvaliacoes}
- Cronograma: ${data.cronograma}

ESTRUTURA OBRIGATÓRIA DA RESPOSTA (JSON):
{
  "sequenciaDidatica": {
    "metadados": {
      "tituloTemaAssunto": "string",
      "disciplina": "string",
      "anoSerie": "string",
      "objetivosAprendizagem": "string",
      "publicoAlvo": "string",
      "bnccCompetencias": "string",
      "duracaoTotal": "string"
    },
    "aulas": [
      {
        "id": "aula-1",
        "numero": 1,
        "titulo": "string",
        "objetivoEspecifico": "string",
        "resumoContexto": "string",
        "tempoEstimado": "50 min",
        "etapas": {
          "introducao": {
            "tempo": "10 min",
            "descricao": "string"
          },
          "desenvolvimento": {
            "tempo": "30 min",
            "descricao": "string"
          },
          "fechamento": {
            "tempo": "10 min",
            "descricao": "string"
          }
        },
        "recursos": ["string"],
        "atividadesPraticas": {
          "tipo": "string",
          "descricao": "string",
          "tempo": "string"
        }
      }
    ],
    "diagnosticos": [
      {
        "id": "diagnostico-1",
        "numero": 1,
        "titulo": "string",
        "objetivoAvaliativo": "string",
        "tipo": "Quiz Interativo",
        "tempoEstimado": "20 min",
        "questoes": "8 questões",
        "formato": "Múltipla escolha",
        "criteriosCorrecao": {
          "excelente": "7-8 acertos: Pronto para avançar",
          "bom": "5-6 acertos: Revisão leve",
          "precisaMelhorar": "<5 acertos: Reforço necessário"
        }
      }
    ],
    "avaliacoes": [
      {
        "id": "avaliacao-1",
        "numero": 1,
        "titulo": "string",
        "objetivoAvaliativo": "string",
        "tipo": "Prova Escrita",
        "tempoEstimado": "45 min",
        "questoes": "12 questões",
        "valorTotal": "10,0 pontos",
        "composicao": {
          "multipplaEscolha": {
            "quantidade": 8,
            "pontos": "6,0 pts"
          },
          "discursivas": {
            "quantidade": 4,
            "pontos": "4,0 pts"
          }
        },
        "criteriosCorrecao": "string",
        "gabarito": "string"
      }
    ],
    "cronogramaSugerido": {
      "duracao": "string",
      "distribuicao": "string",
      "observacoes": "string"
    }
  }
}

INSTRUÇÕES ESPECÍFICAS:
1. Crie exatamente ${data.quantidadeAulas} aulas detalhadas
2. Crie exatamente ${data.quantidadeDiagnosticos} diagnósticos
3. Crie exatamente ${data.quantidadeAvaliacoes} avaliações
4. Cada aula deve ter objetivos específicos alinhados aos objetivos gerais
5. Os diagnósticos devem verificar conhecimentos prévios ou intermediários
6. As avaliações devem ser somativas e abrangentes
7. Todos os conteúdos devem ser adequados ao ${data.anoSerie}
8. Integre as competências BNCC de forma natural
9. Use linguagem adequada ao público-alvo especificado

RESPONDA APENAS COM O JSON VÁLIDO, SEM TEXTO ADICIONAL.`;
}

export const sequenciaDidaticaPrompt = {
  build: buildSequenciaDidaticaPrompt
};
