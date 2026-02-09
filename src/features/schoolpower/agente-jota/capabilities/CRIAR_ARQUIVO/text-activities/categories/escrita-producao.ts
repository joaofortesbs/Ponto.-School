import type { TextActivityTemplate, TextActivityCategory } from '../text-activity-types';

const templates: TextActivityTemplate[] = [
  {
    id: 'prompt_escrita',
    nome: 'Prompt de Escrita',
    descricao: 'Proposta de produção textual com tema motivador, instruções e critérios',
    categoria: 'escrita_producao',
    icone: '✒️',
    cor: '#DB2777',
    keywords: ['prompt de escrita', 'proposta de redação', 'produção textual', 'producao textual', 'proposta de texto', 'tema de redação'],
    secoesEsperadas: ['Tema e Gênero', 'Textos Motivadores', 'Proposta de Produção', 'Critérios de Avaliação', 'Dicas para o Aluno'],
    exemploUso: 'Crie uma proposta de redação sobre desigualdade social',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um PROMPT DE ESCRITA / PROPOSTA DE PRODUÇÃO TEXTUAL.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Proposta de Produção Textual — {tema}

## Tema e Gênero
Identifique o tema, o gênero textual esperado (dissertativo-argumentativo, narrativo, crônica, carta, etc.) e o público-alvo.

## Textos Motivadores
Crie 2-3 textos motivadores variados (trecho de notícia, dado estatístico, citação, situação hipotética) que contextualizem o tema.

## Proposta de Produção
Instrução clara e detalhada do que o aluno deve escrever, incluindo extensão esperada, formato e elementos obrigatórios.

## Critérios de Avaliação
Rubrica com os critérios que serão avaliados (coerência, coesão, argumentação, norma culta, proposta de intervenção).

## Dicas para o Aluno
5-7 dicas práticas para produzir um bom texto.

REGRAS:
- Textos motivadores realistas e atuais
- Proposta clara e delimitada
- NÃO retorne JSON`
  },
  {
    id: 'atividade_redacao',
    nome: 'Atividade de Redação',
    descricao: 'Atividade completa de redação com tema, coletânea e modelo',
    categoria: 'escrita_producao',
    icone: '📝',
    cor: '#BE185D',
    keywords: ['redação', 'redacao', 'atividade de redação', 'escrever redação', 'produção de texto'],
    secoesEsperadas: ['Tema', 'Coletânea de Textos', 'Orientações', 'Estrutura Esperada', 'Modelo de Redação'],
    exemploUso: 'Crie uma atividade de redação estilo ENEM sobre tecnologia na educação',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie uma ATIVIDADE DE REDAÇÃO completa.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Atividade de Redação — {tema}

## Tema
Apresentação do tema com recorte temático específico.

## Coletânea de Textos
3-4 textos motivadores de fontes variadas que apresentem diferentes perspectivas sobre o tema.

## Orientações
Instruções detalhadas: gênero, extensão (linhas), elementos obrigatórios, público, registro linguístico.

## Estrutura Esperada
Guia de como organizar o texto: introdução, desenvolvimento, conclusão. O que cada parte deve conter.

## Modelo de Redação
Um exemplo de redação nota máxima sobre o tema para referência do professor.

REGRAS:
- Tema relevante e atual
- Coletânea diversificada
- NÃO retorne JSON`
  },
  {
    id: 'diario_reflexivo',
    nome: 'Diário Reflexivo',
    descricao: 'Atividade de diário reflexivo com prompts de reflexão guiada',
    categoria: 'escrita_producao',
    icone: '📓',
    cor: '#E11D48',
    keywords: ['diário', 'diario', 'diário reflexivo', 'reflexão', 'diário de bordo', 'journal', 'diario de bordo'],
    secoesEsperadas: ['Sobre o Diário Reflexivo', 'Prompts de Reflexão', 'Modelo de Entrada', 'Roteiro Semanal', 'Avaliação'],
    exemploUso: 'Crie um diário reflexivo sobre o projeto de ciências',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie uma atividade de DIÁRIO REFLEXIVO.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Diário Reflexivo — {tema}

## Sobre o Diário Reflexivo
Explicação sobre o que é, por que é importante e como manter um diário reflexivo.

## Prompts de Reflexão
10-15 perguntas/prompts guiados para diferentes momentos:
- Antes da atividade (expectativas)
- Durante (observações, dificuldades)
- Depois (aprendizados, sentimentos)

## Modelo de Entrada
Exemplo de uma entrada de diário bem escrita para referência.

## Roteiro Semanal
Sugestão de cronograma com prompts diferentes para cada dia da semana.

## Avaliação
Como o professor pode avaliar o diário reflexivo (critérios qualitativos).

REGRAS:
- Prompts abertos que estimulem reflexão genuína
- Tom acolhedor e não julgador
- NÃO retorne JSON`
  },
  {
    id: 'resenha_critica',
    nome: 'Resenha Crítica',
    descricao: 'Modelo e atividade de resenha crítica de obra, filme ou texto',
    categoria: 'escrita_producao',
    icone: '🔎',
    cor: '#9F1239',
    keywords: ['resenha', 'resenha crítica', 'resenha critica', 'análise crítica', 'review', 'crítica literária'],
    secoesEsperadas: ['O que é uma Resenha Crítica', 'Estrutura da Resenha', 'Modelo de Resenha', 'Proposta de Atividade', 'Critérios de Avaliação'],
    exemploUso: 'Crie um modelo de resenha crítica para o livro O Cortiço',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie uma atividade de RESENHA CRÍTICA.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Resenha Crítica — {tema}

## O que é uma Resenha Crítica
Explicação didática do gênero textual, diferença entre resumo e resenha.

## Estrutura da Resenha
Guia passo a passo: identificação da obra, resumo do conteúdo, análise crítica, recomendação.

## Modelo de Resenha
Uma resenha modelo completa e bem escrita para referência.

## Proposta de Atividade
Instruções para o aluno escrever sua própria resenha, com obra/tema definido.

## Critérios de Avaliação
Rubrica específica para avaliar resenhas críticas.

REGRAS:
- Modelo de qualidade profissional
- Instruções claras para o aluno
- NÃO retorne JSON`
  },
  {
    id: 'leitura_com_perguntas',
    nome: 'Atividade de Leitura com Perguntas',
    descricao: 'Texto para leitura acompanhado de perguntas de compreensão e interpretação',
    categoria: 'escrita_producao',
    icone: '📖',
    cor: '#F43F5E',
    keywords: ['leitura', 'interpretação de texto', 'interpretacao de texto', 'compreensão de texto', 'texto com perguntas', 'leitura e interpretação'],
    secoesEsperadas: ['Texto para Leitura', 'Vocabulário', 'Questões de Compreensão', 'Questões de Interpretação', 'Produção Textual'],
    exemploUso: 'Crie uma atividade de interpretação de texto sobre meio ambiente',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie uma ATIVIDADE DE LEITURA COM PERGUNTAS.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Atividade de Leitura — {tema}

## Texto para Leitura
Texto educativo de 300-500 palavras, adequado ao nível da turma, sobre o tema solicitado. Deve ser envolvente e informativo.

## Vocabulário
Lista de 5-8 palavras do texto que podem ser novas para os alunos, com definições acessíveis.

## Questões de Compreensão
4-5 questões sobre o que está explícito no texto (informações diretas).

## Questões de Interpretação
4-5 questões que exijam inferência, análise e pensamento crítico sobre o texto.

## Produção Textual
1-2 propostas de escrita relacionadas ao texto lido.

REGRAS:
- Texto envolvente e adequado ao nível
- Progressão de questões simples a complexas
- NÃO retorne JSON`
  },
  {
    id: 'interpretacao_texto',
    nome: 'Interpretação de Texto',
    descricao: 'Exercícios focados em habilidades de interpretação e análise textual',
    categoria: 'escrita_producao',
    icone: '🔍',
    cor: '#BE123C',
    keywords: ['interpretação', 'interpretacao', 'análise textual', 'analise textual', 'compreensão leitora', 'habilidades de leitura'],
    secoesEsperadas: ['Texto Base', 'Questões de Localização', 'Questões de Inferência', 'Questões de Análise', 'Gabarito'],
    exemploUso: 'Crie exercícios de interpretação de texto sobre uma crônica',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie exercícios de INTERPRETAÇÃO DE TEXTO.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Interpretação de Texto — {tema}

## Texto Base
Texto completo para análise (200-400 palavras). Pode ser crônica, notícia, poema, trecho de livro, etc.

## Questões de Localização
3-4 questões sobre informações explícitas no texto.

## Questões de Inferência
3-4 questões que exijam leitura nas entrelinhas.

## Questões de Análise
3-4 questões sobre recursos linguísticos, intenção do autor, gênero textual, contexto.

## Gabarito
Respostas modelo para todas as questões.

REGRAS:
- Questões progressivas em complexidade
- Análise de aspectos linguísticos e discursivos
- NÃO retorne JSON`
  },
];

export const ESCRITA_PRODUCAO_CATEGORY: TextActivityCategory = {
  id: 'escrita_producao',
  nome: 'Escrita e Produção Textual',
  descricao: 'Propostas de redação, interpretação de texto, diários reflexivos e resenhas',
  icone: '✍️',
  cor: '#DB2777',
  templates,
};

export default templates;
