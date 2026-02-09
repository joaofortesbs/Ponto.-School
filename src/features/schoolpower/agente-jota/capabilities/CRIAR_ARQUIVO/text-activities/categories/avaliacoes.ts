import type { TextActivityTemplate, TextActivityCategory } from '../text-activity-types';

const templates: TextActivityTemplate[] = [
  {
    id: 'prova_personalizada',
    nome: 'Prova Personalizada',
    descricao: 'Prova completa com diferentes tipos de questões, gabarito e critérios de correção',
    categoria: 'avaliacoes',
    icone: '📝',
    cor: '#DC2626',
    keywords: ['prova', 'avaliação', 'avaliacao', 'teste', 'exame', 'prova bimestral', 'prova mensal', 'avaliação bimestral'],
    secoesEsperadas: ['Cabeçalho da Prova', 'Instruções ao Aluno', 'Questões Objetivas', 'Questões Dissertativas', 'Gabarito', 'Critérios de Correção'],
    exemploUso: 'Crie uma prova de matemática para o 7º ano sobre frações',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie uma PROVA PERSONALIZADA completa e profissional.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE A PROVA COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# {título da prova}

## Cabeçalho da Prova
Inclua campos para: Nome do aluno, Turma, Data, Disciplina, Professor(a), Valor total da prova, Tempo de duração.

## Instruções ao Aluno
Orientações claras sobre como realizar a prova (caneta, lápis, calculadora permitida, etc).

## Questões Objetivas
Crie 5-8 questões de múltipla escolha (A, B, C, D) com enunciados claros e alternativas bem elaboradas. Inclua o valor de cada questão. Varie entre fácil, médio e difícil.

## Questões Dissertativas
Crie 2-4 questões abertas que exijam raciocínio e argumentação. Inclua o valor e espaço estimado para resposta.

## Gabarito
Respostas de todas as questões objetivas e modelo de resposta para as dissertativas.

## Critérios de Correção
Rubrica clara com pontuação por questão e critérios parciais.

REGRAS:
- Prova realista e pronta para imprimir
- Questões progressivas em dificuldade
- Linguagem adequada ao nível escolar
- NÃO retorne JSON`
  },
  {
    id: 'simulado',
    nome: 'Simulado',
    descricao: 'Simulado no estilo ENEM/vestibular com questões contextualizadas',
    categoria: 'avaliacoes',
    icone: '🎯',
    cor: '#B91C1C',
    keywords: ['simulado', 'enem', 'vestibular', 'simulado enem', 'preparatório'],
    secoesEsperadas: ['Informações do Simulado', 'Questões', 'Gabarito', 'Comentários das Questões'],
    exemploUso: 'Crie um simulado de ciências da natureza estilo ENEM',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um SIMULADO completo no estilo de vestibulares/ENEM.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE O SIMULADO COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Simulado — {tema}

## Informações do Simulado
Disciplina, área do conhecimento, número de questões, tempo estimado, nível de dificuldade.

## Questões
Crie 10-15 questões no estilo ENEM/vestibular. Cada questão deve ter:
- Texto motivador ou contexto (gráfico, tabela, texto, situação-problema)
- 5 alternativas (A, B, C, D, E)
- Numeração sequencial

## Gabarito
Lista com resposta correta de cada questão.

## Comentários das Questões
Para cada questão, explique: por que a alternativa correta está certa e por que as principais distratoras estão erradas.

REGRAS:
- Questões contextualizadas com situações reais
- Use textos motivadores variados (notícias, dados, charges)
- Alternativas plausíveis e bem construídas
- NÃO retorne JSON`
  },
  {
    id: 'multipla_escolha',
    nome: 'Exercícios de Múltipla Escolha',
    descricao: 'Lista de questões de múltipla escolha com gabarito',
    categoria: 'avaliacoes',
    icone: '🔘',
    cor: '#EF4444',
    keywords: ['múltipla escolha', 'multipla escolha', 'alternativas', 'marcar x', 'assinale'],
    secoesEsperadas: ['Instruções', 'Questões', 'Gabarito'],
    exemploUso: 'Crie 10 questões de múltipla escolha sobre o sistema solar',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie uma lista de EXERCÍCIOS DE MÚLTIPLA ESCOLHA.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Exercícios de Múltipla Escolha — {tema}

## Instruções
Orientações para o aluno sobre como responder.

## Questões
Crie 10-15 questões com 4 alternativas (A, B, C, D) cada. Varie a dificuldade progressivamente. Cada questão deve ter enunciado claro e alternativas bem diferenciadas.

## Gabarito
Resposta correta de cada questão com breve justificativa.

REGRAS:
- Alternativas plausíveis, sem pegadinhas injustas
- Progressão de dificuldade
- NÃO retorne JSON`
  },
  {
    id: 'verdadeiro_falso',
    nome: 'Exercícios Verdadeiro ou Falso',
    descricao: 'Afirmações para classificar como verdadeiras ou falsas com justificativas',
    categoria: 'avaliacoes',
    icone: '✅',
    cor: '#F87171',
    keywords: ['verdadeiro ou falso', 'verdadeiro falso', 'v ou f', 'certo ou errado', 'verdadeiro e falso'],
    secoesEsperadas: ['Instruções', 'Afirmações', 'Gabarito com Justificativas'],
    exemploUso: 'Crie exercícios de V ou F sobre a Revolução Francesa',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie exercícios de VERDADEIRO OU FALSO.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Verdadeiro ou Falso — {tema}

## Instruções
Orientações para o aluno. Peça para justificar as falsas quando aplicável.

## Afirmações
Crie 12-15 afirmações claras e objetivas. Misture verdadeiras e falsas (proporção equilibrada). Numere cada afirmação. Inclua ( ) para o aluno marcar V ou F.

## Gabarito com Justificativas
Para cada afirmação, indique V ou F e explique por que, corrigindo as falsas.

REGRAS:
- Afirmações claras, sem ambiguidade
- Mistura equilibrada de V e F
- NÃO retorne JSON`
  },
  {
    id: 'preencher_lacunas',
    nome: 'Exercícios de Preencher Lacunas',
    descricao: 'Textos com espaços em branco para o aluno completar',
    categoria: 'avaliacoes',
    icone: '📋',
    cor: '#FB923C',
    keywords: ['preencher lacunas', 'lacunas', 'completar', 'preencha', 'complete', 'complete as lacunas', 'texto lacunado'],
    secoesEsperadas: ['Instruções', 'Banco de Palavras', 'Texto com Lacunas', 'Gabarito'],
    exemploUso: 'Crie exercícios de completar lacunas sobre o ciclo da água',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie exercícios de PREENCHER LACUNAS.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Preencher Lacunas — {tema}

## Instruções
Orientações para o aluno sobre como preencher as lacunas.

## Banco de Palavras
Liste as palavras que devem ser usadas para preencher as lacunas (em ordem aleatória, com algumas palavras extras como distratoras).

## Texto com Lacunas
Crie 3-5 parágrafos coerentes sobre o tema com lacunas marcadas como _______ (sublinhado). Cada lacuna deve ter um número entre parênteses para referência.

## Gabarito
Lista com o número de cada lacuna e a palavra correta.

REGRAS:
- Textos coerentes e educativos
- Lacunas em palavras-chave do conteúdo
- NÃO retorne JSON`
  },
  {
    id: 'exercicio_associacao',
    nome: 'Exercícios de Associação',
    descricao: 'Exercícios de ligar colunas, correspondência e matching',
    categoria: 'avaliacoes',
    icone: '🔗',
    cor: '#F59E0B',
    keywords: ['associação', 'associacao', 'correspondência', 'correspondencia', 'ligar colunas', 'matching', 'relacione', 'associe', 'ligue'],
    secoesEsperadas: ['Instruções', 'Exercícios de Associação', 'Gabarito'],
    exemploUso: 'Crie exercícios de associação sobre capitais e países',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie exercícios de ASSOCIAÇÃO / CORRESPONDÊNCIA.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Exercícios de Associação — {tema}

## Instruções
Orientações claras sobre como fazer a correspondência.

## Exercícios de Associação
Crie 3-4 exercícios de associação diferentes. Cada exercício deve ter:
- Coluna A (itens numerados: 1, 2, 3...)
- Coluna B (itens com letras: a, b, c...)
- Espaço para o aluno anotar a correspondência

Varie os formatos: conceito-definição, imagem-descrição, causa-consequência, etc.

## Gabarito
Correspondência correta de cada exercício.

REGRAS:
- Colunas desalinhadas para não dar pistas visuais
- Adicione 1-2 itens extras na coluna B como distratores
- NÃO retorne JSON`
  },
  {
    id: 'exercicio_ordenacao',
    nome: 'Exercícios de Ordenação',
    descricao: 'Exercícios para ordenar etapas, eventos ou processos na sequência correta',
    categoria: 'avaliacoes',
    icone: '🔢',
    cor: '#D97706',
    keywords: ['ordenação', 'ordenacao', 'sequência', 'sequencia', 'ordene', 'coloque em ordem', 'ordem cronológica', 'sequencing'],
    secoesEsperadas: ['Instruções', 'Exercícios de Ordenação', 'Gabarito'],
    exemploUso: 'Crie exercícios de ordenação sobre o processo de fotossíntese',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie exercícios de ORDENAÇÃO / SEQUENCIAMENTO.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Exercícios de Ordenação — {tema}

## Instruções
Orientações sobre como numerar os itens na ordem correta.

## Exercícios de Ordenação
Crie 4-6 exercícios onde o aluno deve colocar itens em ordem. Cada exercício apresenta 5-8 itens embaralhados que devem ser numerados na sequência correta. Varie: cronológica, de processos, de importância, de causa-efeito.

## Gabarito
Ordem correta de cada exercício com breve explicação.

REGRAS:
- Itens claramente distintos entre si
- Ordem lógica e defensável
- NÃO retorne JSON`
  },
  {
    id: 'questoes_dissertativas',
    nome: 'Questões Dissertativas',
    descricao: 'Questões abertas que exigem raciocínio, argumentação e escrita',
    categoria: 'avaliacoes',
    icone: '✍️',
    cor: '#EA580C',
    keywords: ['dissertativa', 'dissertativas', 'questão aberta', 'questões abertas', 'resposta aberta', 'discursiva', 'discursivas'],
    secoesEsperadas: ['Instruções', 'Questões', 'Modelo de Resposta', 'Critérios de Avaliação'],
    exemploUso: 'Crie questões dissertativas sobre sustentabilidade',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie QUESTÕES DISSERTATIVAS de qualidade.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Questões Dissertativas — {tema}

## Instruções
Orientações sobre extensão esperada, critérios e formato das respostas.

## Questões
Crie 5-8 questões dissertativas com complexidade progressiva. Cada questão deve:
- Ter um enunciado contextualizado
- Indicar o que se espera na resposta (análise, comparação, argumentação, etc.)
- Indicar o valor e extensão esperada

## Modelo de Resposta
Resposta modelo para cada questão, servindo como referência para o professor.

## Critérios de Avaliação
Rubrica com pontuação parcial e critérios claros para cada nível de resposta.

REGRAS:
- Questões que exijam pensamento crítico
- Progressão de complexidade
- NÃO retorne JSON`
  },
  {
    id: 'teste_cloze',
    nome: 'Teste Cloze',
    descricao: 'Teste de compreensão leitora com lacunas sistemáticas no texto',
    categoria: 'avaliacoes',
    icone: '📖',
    cor: '#C2410C',
    keywords: ['cloze', 'teste cloze', 'compreensão leitora', 'comprensão de texto', 'lacunas no texto'],
    secoesEsperadas: ['Sobre o Teste Cloze', 'Instruções ao Aluno', 'Texto com Lacunas', 'Texto Original', 'Critérios de Avaliação'],
    exemploUso: 'Crie um teste cloze sobre o texto "A importância da biodiversidade"',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um TESTE CLOZE para avaliação de compreensão leitora.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Teste Cloze — {tema}

## Sobre o Teste Cloze
Breve explicação para o professor sobre o que é o teste cloze e como avaliar.

## Instruções ao Aluno
Orientações claras sobre como preencher as lacunas.

## Texto com Lacunas
Crie um texto coerente de 200-300 palavras sobre o tema. Aplique a técnica cloze: remova cada 5ª ou 7ª palavra (ou palavras-chave), substituindo por uma linha numerada: _(1)_, _(2)_, etc.

## Texto Original
O texto completo sem lacunas para referência do professor.

## Critérios de Avaliação
Como pontuar: aceitação de sinônimos, pontuação parcial, níveis de proficiência.

REGRAS:
- Texto adequado ao nível escolar
- Lacunas em posições que testem compreensão real
- NÃO retorne JSON`
  },
];

export const AVALIACOES_CATEGORY: TextActivityCategory = {
  id: 'avaliacoes',
  nome: 'Avaliações e Exercícios',
  descricao: 'Provas, testes, exercícios e avaliações em formato textual',
  icone: '📝',
  cor: '#DC2626',
  templates,
};

export default templates;
