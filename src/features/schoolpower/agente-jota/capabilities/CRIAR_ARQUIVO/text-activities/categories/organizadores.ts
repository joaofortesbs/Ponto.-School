import type { TextActivityTemplate, TextActivityCategory } from '../text-activity-types';

const templates: TextActivityTemplate[] = [
  {
    id: 'rubrica_avaliacao',
    nome: 'Rubrica de Avaliação',
    descricao: 'Rubrica detalhada com critérios, níveis de desempenho e pontuação',
    categoria: 'organizadores',
    icone: '📊',
    cor: '#059669',
    keywords: ['rubrica', 'rubrica de avaliação', 'rubrica avaliacao', 'critérios de avaliação', 'grade de avaliação'],
    secoesEsperadas: ['Informações Gerais', 'Tabela da Rubrica', 'Como Usar', 'Feedback Modelo'],
    exemploUso: 'Crie uma rubrica para avaliar apresentações orais',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie uma RUBRICA DE AVALIAÇÃO profissional.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Rubrica de Avaliação — {tema}

## Informações Gerais
Atividade avaliada, disciplina, ano/série, pontuação total.

## Tabela da Rubrica
Crie uma tabela com:
- Linhas: 4-6 critérios de avaliação
- Colunas: 4 níveis (Insuficiente / Em Desenvolvimento / Bom / Excelente)
- Cada célula com descrição clara do que se espera naquele nível
- Pontuação por critério e nível

## Como Usar
Orientações para o professor aplicar a rubrica de forma consistente e justa.

## Feedback Modelo
Exemplos de feedback construtivo para cada nível de desempenho.

REGRAS:
- Critérios observáveis e mensuráveis
- Descrições específicas em cada célula (não genéricas)
- Pronta para imprimir e usar
- NÃO retorne JSON`
  },
  {
    id: 'gabarito_comentado',
    nome: 'Gabarito Comentado',
    descricao: 'Gabarito com respostas corretas e explicações detalhadas de cada questão',
    categoria: 'organizadores',
    icone: '✅',
    cor: '#10B981',
    keywords: ['gabarito', 'gabarito comentado', 'respostas comentadas', 'correção comentada', 'resolução'],
    secoesEsperadas: ['Informações', 'Respostas e Comentários', 'Estatísticas Esperadas', 'Dicas de Revisão'],
    exemploUso: 'Crie um gabarito comentado para a prova de geografia',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um GABARITO COMENTADO completo.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Gabarito Comentado — {tema}

## Informações
Identificação da avaliação, disciplina, turma, data.

## Respostas e Comentários
Para cada questão, apresente:
- Número da questão e resposta correta
- Explicação detalhada do raciocínio
- Por que as alternativas incorretas estão erradas (para objetivas)
- Habilidades e competências avaliadas
- Referências ao conteúdo estudado

## Estatísticas Esperadas
Dificuldade estimada de cada questão, taxa de acerto esperada, questões que costumam gerar mais dúvidas.

## Dicas de Revisão
Sugestões de conteúdo para os alunos que erraram cada questão.

REGRAS:
- Explicações didáticas e acessíveis
- Tom encorajador, não punitivo
- NÃO retorne JSON`
  },
  {
    id: 'mapa_mental',
    nome: 'Mapa Mental',
    descricao: 'Mapa mental textual com tópico central, ramificações e conexões',
    categoria: 'organizadores',
    icone: '🧠',
    cor: '#14B8A6',
    keywords: ['mapa mental', 'mapa conceitual', 'mind map', 'mapa de ideias', 'diagrama conceitual'],
    secoesEsperadas: ['Tópico Central', 'Ramificações Principais', 'Sub-ramificações', 'Conexões', 'Como Usar em Sala'],
    exemploUso: 'Crie um mapa mental sobre o sistema digestório',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um MAPA MENTAL em formato textual.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Mapa Mental — {tema}

## Tópico Central
Apresente o conceito central do mapa mental com uma breve definição.

## Ramificações Principais
Liste 4-6 ramificações principais com ícones visuais. Use indentação e bullets para mostrar a hierarquia:
- 🔵 Ramificação 1
  - Sub-tópico 1.1
    - Detalhe 1.1.1
  - Sub-tópico 1.2
- 🟢 Ramificação 2
  - ...

## Sub-ramificações
Detalhe cada ramificação com 2-4 sub-tópicos, incluindo fatos-chave, exemplos e definições.

## Conexões
Identifique 3-5 conexões entre ramificações diferentes (ex: "Ramificação 1 → Ramificação 3: porque...").

## Como Usar em Sala
Sugestões para o professor trabalhar o mapa mental com os alunos (completar em grupo, criar versão própria, etc).

REGRAS:
- Use indentação clara para hierarquia visual
- Ícones e emojis para cada ramificação
- Informações precisas e educativas
- NÃO retorne JSON`
  },
  {
    id: 'infografico_textual',
    nome: 'Infográfico Textual',
    descricao: 'Infográfico em formato texto com dados, estatísticas e informações visuais',
    categoria: 'organizadores',
    icone: '📈',
    cor: '#0D9488',
    keywords: ['infográfico', 'infografico', 'infographic', 'dados visuais', 'resumo visual'],
    secoesEsperadas: ['Título e Subtítulo', 'Dados Principais', 'Linha do Tempo/Fluxo', 'Curiosidades', 'Fontes'],
    exemploUso: 'Crie um infográfico sobre mudanças climáticas',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um INFOGRÁFICO em formato textual.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# 📊 Infográfico — {tema}

## Título e Subtítulo
Título impactante e subtítulo informativo.

## Dados Principais
Apresente 5-8 dados/fatos em formato visual usando emojis, números grandes e frases curtas:
📌 Fato 1: "..."
📌 Fato 2: "..."
Use barras de progresso textuais quando aplicável: ████████░░ 80%

## Linha do Tempo/Fluxo
Apresente uma sequência cronológica ou de processo usando setas e marcadores visuais:
🔹 Etapa 1 → 🔹 Etapa 2 → 🔹 Etapa 3

## Curiosidades
3-5 fatos surpreendentes sobre o tema, formatados de forma impactante.

## Fontes
Referências dos dados apresentados.

REGRAS:
- Formatação visual usando emojis e caracteres especiais
- Dados precisos e verificáveis
- Linguagem direta e impactante
- NÃO retorne JSON`
  },
  {
    id: 'guia_estudo_apostila',
    nome: 'Guia de Estudo / Apostila',
    descricao: 'Material de estudo completo e organizado sobre um tema',
    categoria: 'organizadores',
    icone: '📚',
    cor: '#047857',
    keywords: ['guia de estudo', 'apostila', 'material de estudo', 'apostila de estudo', 'caderno de estudo', 'guia de estudos'],
    secoesEsperadas: ['Introdução', 'Conteúdo Teórico', 'Exemplos Práticos', 'Exercícios de Fixação', 'Resumo e Pontos-Chave'],
    exemploUso: 'Crie uma apostila sobre geometria plana para o 8º ano',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um GUIA DE ESTUDO / APOSTILA completo.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Guia de Estudo — {tema}

## Introdução
Contexto do assunto, por que é importante, pré-requisitos de conhecimento.

## Conteúdo Teórico
Exposição completa e didática do conteúdo, dividido em sub-tópicos claros. Use definições, explicações e conexões com o dia a dia.

## Exemplos Práticos
3-5 exemplos resolvidos passo a passo, com explicação detalhada de cada etapa.

## Exercícios de Fixação
5-8 exercícios para o aluno praticar, com espaço para resolução e gabarito ao final.

## Resumo e Pontos-Chave
Síntese dos conceitos mais importantes em formato de tópicos rápidos para revisão.

REGRAS:
- Conteúdo completo e autocontido
- Linguagem didática e acessível
- Progressão lógica do simples ao complexo
- NÃO retorne JSON`
  },
  {
    id: 'resumo_fichamento',
    nome: 'Resumo / Fichamento',
    descricao: 'Resumo estruturado ou fichamento de conteúdo com pontos-chave',
    categoria: 'organizadores',
    icone: '📋',
    cor: '#065F46',
    keywords: ['resumo', 'fichamento', 'síntese', 'sinopse', 'resumo de conteúdo', 'fichamento de texto'],
    secoesEsperadas: ['Dados da Obra/Conteúdo', 'Resumo Geral', 'Pontos-Chave', 'Citações Importantes', 'Análise Crítica'],
    exemploUso: 'Crie um fichamento sobre o capítulo de ecologia',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um RESUMO / FICHAMENTO estruturado.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Resumo — {tema}

## Dados da Obra/Conteúdo
Identificação do material resumido: título, autor, capítulo, disciplina.

## Resumo Geral
Síntese completa do conteúdo em 3-5 parágrafos, mantendo as ideias essenciais.

## Pontos-Chave
Lista de 8-12 pontos mais importantes em formato de bullets, priorizados por relevância.

## Citações Importantes
Trechos-chave que merecem destaque, com referência ao contexto original.

## Análise Crítica
Reflexão sobre o conteúdo: relevância, aplicações práticas, conexões com outros temas.

REGRAS:
- Fiel ao conteúdo original
- Linguagem clara e objetiva
- NÃO retorne JSON`
  },
  {
    id: 'organizador_grafico',
    nome: 'Organizador Gráfico',
    descricao: 'Organizador gráfico textual: diagrama de Venn, tabela KWL, causa-efeito',
    categoria: 'organizadores',
    icone: '🗂️',
    cor: '#0F766E',
    keywords: ['organizador gráfico', 'organizador grafico', 'diagrama de venn', 'kwl', 'graphic organizer', 'causa e efeito'],
    secoesEsperadas: ['Tipo de Organizador', 'Instruções', 'Organizador para Preencher', 'Exemplo Preenchido', 'Dicas'],
    exemploUso: 'Crie um diagrama de Venn comparando mitose e meiose',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um ORGANIZADOR GRÁFICO em formato textual.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Organizador Gráfico — {tema}

## Tipo de Organizador
Identifique o tipo mais adequado: Diagrama de Venn, Tabela KWL (Sei/Quero Saber/Aprendi), Espinha de Peixe (Ishikawa), Causa-Efeito, Comparação, Sequência, etc.

## Instruções
Como o aluno deve preencher o organizador.

## Organizador para Preencher
Versão em branco do organizador, formatada em texto com espaços para o aluno completar. Use tabelas, colunas e formatação visual.

## Exemplo Preenchido
Versão completa do organizador com conteúdo preenchido como referência para o professor.

## Dicas
Sugestões de como trabalhar este organizador em sala de aula.

REGRAS:
- Formato visual claro usando tabelas e formatação markdown
- Versão em branco E preenchida
- NÃO retorne JSON`
  },
  {
    id: 'quadro_comparativo',
    nome: 'Quadro Comparativo',
    descricao: 'Tabela comparativa entre dois ou mais elementos com critérios definidos',
    categoria: 'organizadores',
    icone: '⚖️',
    cor: '#115E59',
    keywords: ['quadro comparativo', 'comparação', 'comparacao', 'tabela comparativa', 'compare', 'diferenças entre', 'semelhanças e diferenças'],
    secoesEsperadas: ['Introdução', 'Quadro Comparativo', 'Análise', 'Atividade'],
    exemploUso: 'Crie um quadro comparativo entre Renascimento e Barroco',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um QUADRO COMPARATIVO completo.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Quadro Comparativo — {tema}

## Introdução
Contexto da comparação e por que é relevante para o aprendizado.

## Quadro Comparativo
Tabela com:
- Colunas: elementos sendo comparados
- Linhas: 8-12 critérios de comparação
- Células preenchidas com informações precisas

## Análise
Discussão das semelhanças e diferenças mais relevantes identificadas no quadro.

## Atividade
Questões para o aluno responder com base no quadro comparativo (3-5 questões).

REGRAS:
- Critérios de comparação relevantes e variados
- Informações precisas em cada célula
- NÃO retorne JSON`
  },
];

export const ORGANIZADORES_CATEGORY: TextActivityCategory = {
  id: 'organizadores',
  nome: 'Organizadores e Documentos Pedagógicos',
  descricao: 'Rubricas, gabaritos, mapas mentais, infográficos e organizadores gráficos',
  icone: '📊',
  cor: '#059669',
  templates,
};

export default templates;
