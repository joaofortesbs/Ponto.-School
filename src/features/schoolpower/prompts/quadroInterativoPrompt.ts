
export const quadroInterativoPrompt = `
Você é um especialista em educação e criação de quadros interativos educacionais.

Crie um quadro interativo completo e envolvente baseado nas seguintes informações:

**Dados fornecidos:**
- Disciplina: {disciplina}
- Ano/Série: {anoSerie}  
- Tema: {tema}
- Objetivo: {objetivo}
- Nível de Dificuldade: {nivelDificuldade}
- Atividade Mostrada: {atividadeMostrada}

**Instruções para criação:**
1. Desenvolva um conteúdo interativo e visual apropriado para o ano/série
2. Use linguagem clara e adequada à faixa etária
3. Inclua elementos práticos e exemplos contextualizados
4. Organize o conteúdo de forma didática e atrativa
5. Adapte a complexidade ao nível de dificuldade especificado
6. Integre a atividade mostrada de forma natural no conteúdo

**Estrutura do conteúdo:**
- Introdução envolvente ao tema
- Conceitos principais com explicações claras
- Exemplos práticos e aplicações reais
- Atividades interativas para participação dos alunos
- Resumo dos pontos-chave
- Próximos passos no aprendizado

**FORMATO DE RESPOSTA OBRIGATÓRIO:**
Retorne APENAS um JSON válido no seguinte formato:
{
  "titulo": "Título educativo e atrativo para o quadro interativo",
  "conteudo": "Conteúdo educacional completo, estruturado em parágrafos claros e didáticos, adequado para apresentação em quadro interativo"
}

IMPORTANTE: 
- Retorne APENAS o JSON, sem texto adicional
- O conteúdo deve ser em texto corrido, bem estruturado
- Use linguagem apropriada para {anoSerie}
- Integre elementos da atividade "{atividadeMostrada}"
`;

// Função para processar o template do prompt
export function buildQuadroInterativoPrompt(data: {
  disciplina: string;
  anoSerie: string;
  tema: string;
  objetivo: string;
  nivelDificuldade: string;
  atividadeMostrada: string;
}): string {
  return quadroInterativoPrompt
    .replace(/{disciplina}/g, data.disciplina)
    .replace(/{anoSerie}/g, data.anoSerie)
    .replace(/{tema}/g, data.tema)
    .replace(/{objetivo}/g, data.objetivo)
    .replace(/{nivelDificuldade}/g, data.nivelDificuldade)
    .replace(/{atividadeMostrada}/g, data.atividadeMostrada);
}
