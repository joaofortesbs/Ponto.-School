
export const buildQuadroInterativoPrompt = (contextData: any): string => {
  const {
    'Disciplina / Área de conhecimento': disciplina = 'Não especificado',
    'Ano / Série': anoSerie = 'Não especificado',
    'Tema ou Assunto da aula': tema = 'Não especificado',
    'Objetivo de aprendizagem da aula': objetivo = 'Não especificado',
    'Nível de Dificuldade': dificuldade = 'Médio',
    'Atividade mostrada': atividadeMostrada = 'lista-exercicios'
  } = contextData;

  return `
Crie um conteúdo educacional completo e interativo para um Quadro Interativo baseado nos seguintes parâmetros:

PARÂMETROS DA ATIVIDADE:
- Disciplina: ${disciplina}
- Ano/Série: ${anoSerie}
- Tema: ${tema}
- Objetivo: ${objetivo}
- Dificuldade: ${dificuldade}
- Tipo de atividade associada: ${atividadeMostrada}

INSTRUÇÕES PARA CRIAÇÃO:
1. Desenvolva um conteúdo visual e didático adequado ao nível especificado
2. Organize o conteúdo de forma clara e progressiva
3. Inclua elementos interativos e exemplos práticos
4. Relacione o conteúdo com a atividade associada (${atividadeMostrada})
5. Use linguagem apropriada para o ano/série especificado

ESTRUTURA OBRIGATÓRIA DO JSON:
{
  "titulo": "Título principal atrativo e claro",
  "subtitulo": "Subtítulo que contextualiza o tema",
  "conteudo": {
    "introducao": "Introdução envolvente ao tema (2-3 parágrafos)",
    "conceitosPrincipais": [
      {
        "titulo": "Nome do conceito fundamental",
        "explicacao": "Explicação clara e detalhada",
        "exemplo": "Exemplo prático e relevante"
      }
    ],
    "exemplosPraticos": [
      "Exemplo 1 aplicado ao cotidiano",
      "Exemplo 2 relacionado ao tema",
      "Exemplo 3 com contexto específico"
    ],
    "atividadesPraticas": [
      {
        "titulo": "Nome da atividade prática",
        "instrucoes": "Passo a passo de como realizar",
        "objetivo": "O que o aluno deve aprender/alcançar"
      }
    ],
    "resumo": "Síntese dos pontos principais abordados",
    "proximosPassos": "Sugestões para aprofundamento do tema"
  },
  "recursos": [
    "Recurso visual 1",
    "Material necessário 2",
    "Ferramenta interativa 3"
  ],
  "objetivosAprendizagem": [
    "Objetivo específico 1",
    "Objetivo específico 2",
    "Objetivo específico 3"
  ]
}

IMPORTANTE: Responda APENAS com o JSON válido, sem texto adicional antes ou depois.
`;
};
