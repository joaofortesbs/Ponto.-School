
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
1. Crie um conteúdo interativo e visual
2. Use linguagem adequada para o ano/série especificado
3. Inclua elementos práticos e exemplos
4. Organize o conteúdo de forma clara e atrativa
5. Adapte a complexidade ao nível de dificuldade

**FORMATO DE RESPOSTA OBRIGATÓRIO (JSON válido):**

{
  "titulo": "Título claro e objetivo do quadro interativo",
  "descricao": "Breve descrição do que será abordado no quadro",
  "introducao": "Texto introdutório detalhado do tema, explicando sua importância e contexto de forma didática",
  "conceitosPrincipais": "Explicação clara dos principais conceitos que serão abordados, organizados de forma didática e compreensível para o ano/série especificado",
  "exemplosPraticos": "Exemplos práticos e situações reais onde o tema se aplica, facilitando a compreensão dos estudantes com casos concretos",
  "atividadesPraticas": "Sugestões detalhadas de atividades práticas que os alunos podem realizar para fixar o conteúdo aprendido",
  "resumo": "Resumo consolidado dos pontos principais abordados no quadro interativo",
  "proximosPassos": "Orientações sobre os próximos tópicos a serem estudados e como aprofundar o conhecimento"
}

**REGRAS CRÍTICAS:**
- Responda APENAS com o JSON válido, sem texto adicional antes ou depois
- Não use aspas triplas, markdown ou qualquer formatação
- Todos os valores devem ser strings simples (não arrays ou objetos)
- Use linguagem adequada ao nível educacional especificado
- Garanta que o JSON seja válido e possa ser parseado
- Não inclua caracteres especiais que possam quebrar o JSON
`;
