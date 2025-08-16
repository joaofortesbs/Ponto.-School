
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

**Instruções:**
1. Crie um conteúdo educativo claro e objetivo
2. Use linguagem adequada para o ano/série especificado
3. Inclua elementos práticos e exemplos
4. Organize o conteúdo de forma didática
5. Adapte a complexidade ao nível de dificuldade

**FORMATO DE RESPOSTA OBRIGATÓRIO (JSON válido):**

{
  "titulo": "Título claro e objetivo do quadro interativo",
  "introducao": "Texto introdutório explicando o tema de forma didática e sua importância",
  "conceitosPrincipais": "Explicação clara e detalhada dos principais conceitos abordados no tema",
  "exemplosPraticos": "Exemplos práticos e situações reais onde o tema se aplica no dia a dia",
  "atividadesPraticas": "Sugestões de atividades práticas para os alunos fixarem o conteúdo",
  "resumo": "Resumo consolidado dos pontos principais abordados",
  "proximosPassos": "Orientações sobre próximos tópicos e como aprofundar o conhecimento"
}

**REGRAS CRÍTICAS:**
- Responda APENAS com o JSON válido, sem texto adicional
- Não use aspas triplas, markdown ou qualquer formatação
- Todos os valores devem ser strings simples e completas
- Use linguagem adequada ao nível educacional especificado
- Garanta que o JSON seja válido e parseável
- Cada campo deve conter texto substancial e educativo
`;
