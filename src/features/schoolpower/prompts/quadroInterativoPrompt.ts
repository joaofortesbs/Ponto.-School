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

**Formato de resposta esperado (JSON válido):**
{
  "titulo": "Título do quadro interativo",
  "descricao": "Breve descrição do quadro",
  "introducao": "Texto introdutório detalhado do tema, explicando sua importância e contexto",
  "conceitosPrincipais": "Lista dos principais conceitos que serão abordados no quadro interativo, explicados de forma clara e didática",
  "exemplosPraticos": "Exemplos práticos e situações reais onde o tema se aplica, facilitando a compreensão dos estudantes",
  "atividadesPraticas": "Sugestões de atividades práticas que os alunos podem realizar para fixar o conteúdo aprendido",
  "resumo": "Resumo consolidado dos pontos principais abordados no quadro interativo",
  "proximosPassos": "Orientações sobre os próximos tópicos a serem estudados e como aprofundar o conhecimento"
}

**IMPORTANTE:** 
- Responda APENAS com o JSON válido, sem texto adicional
- Garanta que todos os campos sejam strings simples
- Use linguagem adequada ao nível educacional especificado
- Faça conteúdo rico e educativo
`;