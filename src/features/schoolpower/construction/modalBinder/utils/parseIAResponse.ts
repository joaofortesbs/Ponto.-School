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
      /"titulo"\s*:\s*"([^"]+)"/i,
      /\*\*Título\*\*:\s*(.+?)(?:\n|$)/i,
      /## Título[\s\S]*?(.+?)(?:\n|$)/i
    ],
    descricao: [
      /(?:descrição|description|desc|objetivo):\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/i,
      /["']?descrição["']?\s*:\s*["']?(.+?)["']?(?:\n\n|\n(?=[A-Z])|$)/i,
      /"descricao"\s*:\s*"([^"]+)"/i,
      /\*\*Descrição\*\*:\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/i,
      /## Descrição[\s\S]*?(.+?)(?:\n\n|\n(?=[A-Z])|$)/i
    ],
    disciplina: [
      /(?:disciplina|subject|matéria|área):\s*(.+?)(?:\n|$)/i,
      /["']?disciplina["']?\s*:\s*["']?(.+?)["']?(?:\n|,|$)/i,
      /"disciplina"\s*:\s*"([^"]+)"/i,
      /\*\*Disciplina\*\*:\s*(.+?)(?:\n|$)/i,
      /## Disciplina[\s\S]*?(.+?)(?:\n|$)/i
    ],
    tema: [
      /(?:tema|topic|assunto|conteúdo):\s*(.+?)(?:\n|$)/i,
      /["']?tema["']?\s*:\s*["']?(.+?)["']?(?:\n|,|$)/i,
      /"tema"\s*:\s*"([^"]+)"/i,
      /\*\*Tema\*\*:\s*(.+?)(?:\n|$)/i,
      /## Tema[\s\S]*?(.+?)(?:\n|$)/i
    ],
    anoEscolaridade: [
      /(?:ano|série|escolaridade|grade|ano escolar|ano de escolaridade):\s*(.+?)(?:\n|$)/i,
      /["']?ano["']?\s*:\s*["']?(.+?)["']?(?:\n|,|$)/i,
      /"anoEscolaridade"\s*:\s*"([^"]+)"/i,
      /\*\*Ano de Escolaridade\*\*:\s*(.+?)(?:\n|$)/i,
      /## Ano[\s\S]*?(.+?)(?:\n|$)/i
    ],
    numeroQuestoes: [
      /(?:questões|questions|número|quantidade|num questões|quantidade de questões):\s*(\d+)/i,
      /["']?questões["']?\s*:\s*["']?(\d+)["']?/i,
      /"numeroQuestoes"\s*:\s*"?(\d+)"?/i,
      /\*\*Quantidade de Questões\*\*:\s*(\d+)/i,
      /## Questões[\s\S]*?(\d+)/i
    ],
    nivelDificuldade: [
      /(?:dificuldade|difficulty|nível|nivel|nível de dificuldade):\s*(.+?)(?:\n|$)/i,
      /["']?dificuldade["']?\s*:\s*["']?(.+?)["']?(?:\n|,|$)/i,
      /"nivelDificuldade"\s*:\s*"([^"]+)"/i,
      /\*\*Nível de Dificuldade\*\*:\s*(.+?)(?:\n|$)/i,
      /## Dificuldade[\s\S]*?(.+?)(?:\n|$)/i
    ],
    modeloQuestoes: [
      /(?:modelo|type|tipo|formato|modelo de questões):\s*(.+?)(?:\n|$)/i,
      /["']?modelo["']?\s*:\s*["']?(.+?)["']?(?:\n|,|$)/i,
      /"modeloQuestoes"\s*:\s*"([^"]+)"/i,
      /\*\*Modelo de Questões\*\*:\s*(.+?)(?:\n|$)/i,
      /## Modelo[\s\S]*?(.+?)(?:\n|$)/i
    ],
    fontes: [
      /(?:fontes|sources|referências|bibliografia):\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/i,
      /["']?fontes["']?\s*:\s*["']?(.+?)["']?(?:\n\n|\n(?=[A-Z])|$)/i,
      /"fontes"\s*:\s*"([^"]+)"/i,
      /\*\*Fontes\*\*:\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/i,
      /## Fontes[\s\S]*?(.+?)(?:\n\n|\n(?=[A-Z])|$)/i
    ],
    tempoLimite: [
      /(?:tempo|time|duração|duration|tempo limite):\s*(.+?)(?:\n|$)/i,
      /["']?tempo["']?\s*:\s*["']?(.+?)["']?(?:\n|,|$)/i,
      /"tempoLimite"\s*:\s*"([^"]+)"/i,
      /\*\*Tempo Limite\*\*:\s*(.+?)(?:\n|$)/i,
      /## Tempo[\s\S]*?(.+?)(?:\n|$)/i
    ],
    contextoAplicacao: [
      /(?:contexto|context|aplicação|onde aplicar|contexto de aplicação):\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/i,
      /["']?contexto["']?\s*:\s*["']?(.+?)["']?(?:\n\n|\n(?=[A-Z])|$)/i,
      /"contextoAplicacao"\s*:\s*"([^"]+)"/i,
      /\*\*Contexto de Aplicação\*\*:\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/i,
      /## Contexto[\s\S]*?(.+?)(?:\n\n|\n(?=[A-Z])|$)/i
    ]
  };

  // Tentar cada padrão para cada campo
  Object.entries(patterns).forEach(([key, patternList]) => {
    for (const pattern of patternList) {
      const match = response.match(pattern);
      if (match && match[1]) {
        parsed[key] = match[1].trim().replace(/["'*]/g, '').replace(/^\s*-\s*/, '');
        console.log(`✅ Campo ${key} extraído: ${parsed[key]}`);
        break; // Parar no primeiro match encontrado
      }
    }
  });

  // Se não encontrou dados com patterns, tentar extrair de um objeto JSON
  if (Object.keys(parsed).length === 0) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[0]);
        Object.keys(jsonData).forEach(key => {
          const normalizedKey = key.toLowerCase()
            .replace(/[^a-z]/g, '')
            .replace('titulo', 'titulo')
            .replace('descricao', 'descricao')
            .replace('disciplina', 'disciplina')
            .replace('tema', 'tema')
            .replace('ano', 'anoEscolaridade')
            .replace('questoes', 'numeroQuestoes')
            .replace('dificuldade', 'nivelDificuldade')
            .replace('modelo', 'modeloQuestoes')
            .replace('fontes', 'fontes')
            .replace('tempo', 'tempoLimite')
            .replace('contexto', 'contextoAplicacao');
          
          if (patterns[normalizedKey]) {
            parsed[normalizedKey] = String(jsonData[key]);
          }
        });
        console.log('📝 Dados extraídos via JSON:', parsed);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao tentar parsear JSON:', error);
    }
  }

  console.log('📝 Dados finais extraídos:', parsed);
  return parsed;
}