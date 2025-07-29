export interface ParsedIAResponse {
  titulo?: string;
  descricao?: string;
  disciplina?: string;
  tema?: string;
  anoEscolaridade?: string;
  numeroQuestoes?: string;
  nivelDificuldade?: string;
  modeloQuestoes?: string;
  fontes?: string;
  tempoLimite?: string;
  contextoAplicacao?: string;
  [key: string]: string | undefined;
}

export function parseIAResponse(response: string, activityType: string): ParsedIAResponse {
  console.log('🔍 Parseando resposta da IA:', { response: response.substring(0, 200) + '...', activityType });

  const parsed: ParsedIAResponse = {};

  // Tentar extrair campos usando diferentes padrões mais abrangentes
  const patterns = {
    titulo: [
      /(?:título|title|nome|nome da atividade):\s*(.+?)(?:\n|$)/i,
      /["']?título["']?\s*:\s*["']?(.+?)["']?(?:\n|,|$)/i,
      /"titulo"\s*:\s*"([^"]+)"/i
    ],
    descricao: [
      /(?:descrição|description|desc|objetivo):\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/i,
      /["']?descrição["']?\s*:\s*["']?(.+?)["']?(?:\n\n|\n(?=[A-Z])|$)/i,
      /"descricao"\s*:\s*"([^"]+)"/i
    ],
    disciplina: [
      /(?:disciplina|subject|matéria|área):\s*(.+?)(?:\n|$)/i,
      /["']?disciplina["']?\s*:\s*["']?(.+?)["']?(?:\n|,|$)/i,
      /"disciplina"\s*:\s*"([^"]+)"/i
    ],
    tema: [
      /(?:tema|topic|assunto|conteúdo):\s*(.+?)(?:\n|$)/i,
      /["']?tema["']?\s*:\s*["']?(.+?)["']?(?:\n|,|$)/i,
      /"tema"\s*:\s*"([^"]+)"/i
    ],
    anoEscolaridade: [
      /(?:ano|série|escolaridade|grade|ano escolar):\s*(.+?)(?:\n|$)/i,
      /["']?ano["']?\s*:\s*["']?(.+?)["']?(?:\n|,|$)/i,
      /"anoEscolaridade"\s*:\s*"([^"]+)"/i
    ],
    numeroQuestoes: [
      /(?:questões|questions|número|quantidade|num questões):\s*(\d+)/i,
      /["']?questões["']?\s*:\s*["']?(\d+)["']?/i,
      /"numeroQuestoes"\s*:\s*"?(\d+)"?/i
    ],
    nivelDificuldade: [
      /(?:dificuldade|difficulty|nível|nivel):\s*(.+?)(?:\n|$)/i,
      /["']?dificuldade["']?\s*:\s*["']?(.+?)["']?(?:\n|,|$)/i,
      /"nivelDificuldade"\s*:\s*"([^"]+)"/i
    ],
    modeloQuestoes: [
      /(?:modelo|type|tipo|formato|modelo de questões):\s*(.+?)(?:\n|$)/i,
      /["']?modelo["']?\s*:\s*["']?(.+?)["']?(?:\n|,|$)/i,
      /"modeloQuestoes"\s*:\s*"([^"]+)"/i
    ],
    fontes: [
      /(?:fontes|sources|referências|bibliografia):\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/i,
      /["']?fontes["']?\s*:\s*["']?(.+?)["']?(?:\n\n|\n(?=[A-Z])|$)/i,
      /"fontes"\s*:\s*"([^"]+)"/i
    ],
    tempoLimite: [
      /(?:tempo|time|duração|duration|tempo limite):\s*(.+?)(?:\n|$)/i,
      /["']?tempo["']?\s*:\s*["']?(.+?)["']?(?:\n|,|$)/i,
      /"tempoLimite"\s*:\s*"([^"]+)"/i
    ],
    contextoAplicacao: [
      /(?:contexto|context|aplicação|onde aplicar):\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/i,
      /["']?contexto["']?\s*:\s*["']?(.+?)["']?(?:\n\n|\n(?=[A-Z])|$)/i,
      /"contextoAplicacao"\s*:\s*"([^"]+)"/i
    ]
  };

  // Tentar cada padrão para cada campo
  Object.entries(patterns).forEach(([key, patternList]) => {
    for (const pattern of patternList) {
      const match = response.match(pattern);
      if (match && match[1]) {
        parsed[key] = match[1].trim().replace(/["']/g, '');
        break; // Parar no primeiro match encontrado
      }
    }
  });

  console.log('📝 Dados extraídos:', parsed);
  return parsed;
}