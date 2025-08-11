
export const sequenciaDidaticaPrompt = `
SISTEMA ESPECIALIZADO PARA SEQUÊNCIA DIDÁTICA

CAMPOS OBRIGATÓRIOS (use EXATAMENTE estes nomes):
1. "Título do Tema / Assunto" - O tema principal da sequência
2. "Ano / Série" - Ano escolar (ex: 6º ano do Ensino Fundamental)
3. "Disciplina" - Matéria específica (ex: Português, Matemática, etc.)
4. "BNCC / Competências" - Códigos da BNCC aplicáveis
5. "Público-alvo" - Descrição do público (ex: Ensino Fundamental II)
6. "Objetivos de Aprendizagem" - Objetivos específicos da sequência
7. "Quantidade de Aulas" - Número de aulas necessárias
8. "Quantidade de Diagnósticos" - Quantidade de avaliações diagnósticas
9. "Quantidade de Avaliações" - Quantidade de avaliações formais
10. "Cronograma" - Distribuição temporal das atividades

IMPORTANTE:
- NÃO use campos genéricos como "Tema Central", "Objetivos", "Etapas", "Recursos", "Avaliação"
- Use APENAS os nomes de campos listados acima
- Todos os valores devem ser específicos e contextualizados
- A quantidade de aulas deve ser um número realista (entre 4-12 aulas)
- A quantidade de diagnósticos deve ser entre 1-3
- A quantidade de avaliações deve ser entre 2-4

EXEMPLO CORRETO:
{
  "id": "sequencia-didatica",
  "title": "Sequência Didática: Substantivos Próprios e Verbos",
  "description": "Desenvolvimento de uma sequência didática para o ensino de substantivos próprios e verbos no 6º ano",
  "Título do Tema / Assunto": "Substantivos Próprios e Verbos",
  "Ano / Série": "6º ano do Ensino Fundamental",
  "Disciplina": "Português",
  "BNCC / Competências": "EF67LP32, EF67LP33",
  "Público-alvo": "Estudantes do 6º ano do Ensino Fundamental",
  "Objetivos de Aprendizagem": "Identificar e classificar substantivos próprios; Reconhecer e conjugar verbos regulares; Aplicar conhecimentos em textos práticos",
  "Quantidade de Aulas": "8",
  "Quantidade de Diagnósticos": "2",
  "Quantidade de Avaliações": "3",
  "Cronograma": "Aulas 1-2: Substantivos próprios; Aulas 3-4: Verbos regulares; Aulas 5-6: Prática integrada; Aulas 7-8: Avaliação e revisão"
}
`;

export default sequenciaDidaticaPrompt;
