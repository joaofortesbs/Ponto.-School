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

export function buildSequenciaDidaticaPrompt(dados: any): string {
  return `
**INSTRUÇÃO PARA GERAÇÃO DE SEQUÊNCIA DIDÁTICA COMPLETA**

## DADOS DE ENTRADA:
- **Título/Tema:** ${dados.tituloTemaAssunto}
- **Disciplina:** ${dados.disciplina}
- **Ano/Série:** ${dados.anoSerie}
- **Público-alvo:** ${dados.publicoAlvo}
- **BNCC/Competências:** ${dados.bnccCompetencias}
- **Objetivos de Aprendizagem:** ${dados.objetivosAprendizagem}
- **Quantidade de Aulas:** ${dados.quantidadeAulas}
- **Quantidade de Diagnósticos:** ${dados.quantidadeDiagnosticos}
- **Quantidade de Avaliações:** ${dados.quantidadeAvaliacoes}
- **Cronograma:** ${dados.cronograma}

## INSTRUÇÕES PARA GERAÇÃO:

Você deve gerar uma Sequência Didática COMPLETA e ESTRUTURADA seguindo EXATAMENTE este formato JSON:

{
  "aulas": [
    {
      "titulo": "Título da Aula 1",
      "objetivoEspecifico": "Objetivo específico da aula",
      "resumoContexto": "Resumo do contexto e conteúdo da aula",
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
        "descricao": "Descrição das atividades práticas"
      }
    }
  ],
  "diagnosticos": [
    {
      "titulo": "Título do Diagnóstico 1",
      "objetivoAvaliativo": "Objetivo da avaliação diagnóstica",
      "tipo": "Diagnóstica",
      "questoes": 10,
      "formato": "Múltipla escolha",
      "tempoEstimado": "20 min",
      "criteriosCorrecao": {
        "excelente": "9-10 acertos",
        "bom": "7-8 acertos",
        "precisaMelhorar": "0-6 acertos"
      }
    }
  ],
  "avaliacoes": [
    {
      "titulo": "Título da Avaliação 1",
      "objetivoAvaliativo": "Objetivo da avaliação",
      "tipo": "Formativa",
      "questoes": 15,
      "valorTotal": "10,0 pontos",
      "tempoEstimado": "45 min",
      "composicao": {
        "multipplaEscolha": {
          "quantidade": 10,
          "pontos": "6,0 pontos"
        },
        "discursivas": {
          "quantidade": 3,
          "pontos": "4,0 pontos"
        }
      },
      "gabarito": "Descrição do gabarito"
    }
  ],
  "cronogramaSugerido": {
    "duracao": "${dados.quantidadeAulas} aulas",
    "distribuicao": "Sugestão de distribuição temporal",
    "observacoes": "Observações sobre o cronograma"
  }
}

## REQUISITOS OBRIGATÓRIOS:

1. **GERE EXATAMENTE ${dados.quantidadeAulas} AULAS**
2. **GERE EXATAMENTE ${dados.quantidadeDiagnosticos} DIAGNÓSTICOS**
3. **GERE EXATAMENTE ${dados.quantidadeAvaliacoes} AVALIAÇÕES**
4. **RETORNE APENAS O JSON VÁLIDO, SEM TEXTO ADICIONAL**
5. **Cada aula deve ter etapas detalhadas (introdução, desenvolvimento, fechamento)**
6. **Cada diagnóstico deve ter critérios claros de correção**
7. **Cada avaliação deve ter composição detalhada das questões**

## CONTEXTO EDUCACIONAL:
- Disciplina: ${dados.disciplina}
- Nível: ${dados.anoSerie}
- Tema: ${dados.tituloTemaAssunto}
- Objetivos: ${dados.objetivosAprendizagem}
- Competências BNCC: ${dados.bnccCompetencias}

**IMPORTANTE:** Retorne APENAS o JSON válido, sem markdown, sem explicações adicionais.
`;
}

export const sequenciaDidaticaPrompt = {
  build: buildSequenciaDidaticaPrompt
};