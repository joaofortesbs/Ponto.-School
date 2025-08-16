export const quadroInterativoPrompt = `
Crie um conteúdo educacional interativo para quadro digital com as seguintes informações:

**Dados da Atividade:**
- Disciplina: {disciplina}
- Ano/Série: {anoSerie}
- Tema: {tema}
- Objetivo: {objetivo}
- Nível de Dificuldade: {nivelDificuldade}
- Atividade Específica: {atividadeMostrada}

**Instruções:**
1. Crie um conteúdo educacional estruturado e interativo
2. O conteúdo deve ser adequado para apresentação em quadro digital
3. Inclua explicações claras e didáticas
4. Adapte a linguagem para o nível de escolaridade informado
5. Torne o conteúdo envolvente e participativo

**Estrutura do Conteúdo (OBRIGATÓRIA):**
- **Introdução**: Apresentação do tema de forma cativante (obrigatório)
- **Conceitos Principais**: Explicação dos conceitos fundamentais (obrigatório)
- **Exemplos Práticos**: Exemplos reais e contextualizados (obrigatório)

**IMPORTANTE:** 
- NÃO inclua seções de "Atividades Práticas" ou "Próximos Passos"
- Foque apenas nos três tópicos principais: Introdução, Conceitos Principais e Exemplos Práticos
- O conteúdo deve ser completo e autocontido dentro dessas três seções

**Formato de Resposta:**
Retorne um JSON com a seguinte estrutura:
{
  "titulo": "Título da atividade",
  "conteudo": "Conteúdo completo formatado em markdown com apenas os 3 tópicos especificados"
}

O conteúdo deve ser prático, educativo e adequado para uso em sala de aula.`;

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