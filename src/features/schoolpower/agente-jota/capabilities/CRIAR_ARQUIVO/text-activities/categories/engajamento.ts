import type { TextActivityTemplate, TextActivityCategory } from '../text-activity-types';

const templates: TextActivityTemplate[] = [
  {
    id: 'exit_ticket',
    nome: 'Exit Ticket',
    descricao: 'Verificação rápida de aprendizagem ao final da aula com 2-3 perguntas',
    categoria: 'engajamento',
    icone: '🎫',
    cor: '#0891B2',
    keywords: ['exit ticket', 'ticket de saída', 'verificação rápida', 'check de saída', 'saída de aula', 'avaliação rápida'],
    secoesEsperadas: ['Sobre o Exit Ticket', 'Modelos de Exit Ticket', 'Variações', 'Como Analisar os Resultados'],
    exemploUso: 'Crie exit tickets para a aula de ciências sobre células',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie EXIT TICKETS para verificação rápida de aprendizagem.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Exit Tickets — {tema}

## Sobre o Exit Ticket
O que é, quando usar (últimos 5 minutos da aula) e por que é eficaz.

## Modelos de Exit Ticket
Crie 5-6 modelos diferentes de exit ticket, cada um com 2-3 perguntas rápidas:
- Modelo 1: "3-2-1" (3 coisas que aprendi, 2 dúvidas, 1 conexão)
- Modelo 2: Perguntas objetivas rápidas
- Modelo 3: Autoavaliação
- Modelo 4: Pergunta reflexiva
- Modelo 5: Complete a frase
- Modelo 6: Verdadeiro ou Falso rápido

## Variações
Versões digitais (formulário online), criativas (emoji de sentimento), e colaborativas (em duplas).

## Como Analisar os Resultados
Como categorizar as respostas e usar para planejar a próxima aula.

REGRAS:
- Rápidos (máximo 5 minutos)
- Foco no essencial da aula
- NÃO retorne JSON`
  },
  {
    id: 'icebreaker_acolhimento',
    nome: 'Icebreaker / Atividade de Acolhimento',
    descricao: 'Atividades para quebrar o gelo, integrar a turma e criar ambiente positivo',
    categoria: 'engajamento',
    icone: '🤗',
    cor: '#06B6D4',
    keywords: ['icebreaker', 'acolhimento', 'quebra-gelo', 'integração', 'integracao', 'dinâmica de grupo', 'dinamica', 'warm up', 'aquecimento'],
    secoesEsperadas: ['Objetivo', 'Atividades de Acolhimento', 'Atividades de Integração', 'Atividades Energizantes', 'Dicas'],
    exemploUso: 'Crie atividades de acolhimento para o primeiro dia de aula',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie ATIVIDADES DE ICEBREAKER / ACOLHIMENTO.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Atividades de Acolhimento — {contexto}

## Objetivo
Por que o acolhimento é importante e quando usar cada tipo de atividade.

## Atividades de Acolhimento
3-4 atividades para os primeiros minutos da aula, focadas em criar ambiente seguro:
- Nome da atividade
- Tempo: X minutos
- Materiais: (se necessário)
- Como fazer: passo a passo
- Adaptação para turmas grandes/pequenas

## Atividades de Integração
3-4 atividades para promover interação entre alunos que não se conhecem ou trabalho em equipe.

## Atividades Energizantes
2-3 atividades curtas (2-3 minutos) para reativar a energia da turma quando estão cansados ou dispersos.

## Dicas
Como criar uma rotina de acolhimento sustentável e adaptar para diferentes faixas etárias.

REGRAS:
- Inclusivas (todos participam)
- Respeitosas (ninguém é exposto)
- Fáceis de conduzir
- NÃO retorne JSON`
  },
  {
    id: 'estudo_de_caso',
    nome: 'Estudo de Caso',
    descricao: 'Caso real ou fictício para análise, discussão e resolução de problemas',
    categoria: 'engajamento',
    icone: '🔬',
    cor: '#0E7490',
    keywords: ['estudo de caso', 'case study', 'caso', 'análise de caso', 'situação problema', 'situação-problema', 'problema real'],
    secoesEsperadas: ['Apresentação do Caso', 'Contexto e Dados', 'Perguntas para Análise', 'Atividade em Grupo', 'Resolução Sugerida'],
    exemploUso: 'Crie um estudo de caso sobre ética no uso de IA na educação',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um ESTUDO DE CASO educativo.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Estudo de Caso — {tema}

## Apresentação do Caso
Narrativa envolvente e realista descrevendo uma situação-problema. Inclua personagens, contexto e conflito.

## Contexto e Dados
Informações adicionais, dados, estatísticas ou documentos que ajudem na análise do caso.

## Perguntas para Análise
5-7 perguntas progressivas:
- Compreensão (o que aconteceu?)
- Análise (por que aconteceu?)
- Avaliação (o que poderia ser diferente?)
- Aplicação (como resolver?)
- Síntese (que princípios aprendemos?)

## Atividade em Grupo
Como organizar a discussão: formação de grupos, papéis, tempo de debate, apresentação.

## Resolução Sugerida
Análise do caso para o professor, com múltiplas perspectivas e não uma resposta "correta" única.

REGRAS:
- Caso realista e relevante
- Múltiplas perspectivas válidas
- Estimular pensamento crítico
- NÃO retorne JSON`
  },
  {
    id: 'debate_estruturado',
    nome: 'Debate Estruturado',
    descricao: 'Atividade de debate com tema, regras, argumentos e mediação',
    categoria: 'engajamento',
    icone: '🎙️',
    cor: '#155E75',
    keywords: ['debate', 'debate estruturado', 'discussão', 'argumentação', 'ponto e contraponto', 'debate regrado'],
    secoesEsperadas: ['Tema do Debate', 'Regras e Formato', 'Material de Apoio — A Favor', 'Material de Apoio — Contra', 'Guia do Mediador', 'Avaliação'],
    exemploUso: 'Crie um debate estruturado sobre uso de celular na escola',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um DEBATE ESTRUTURADO.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Debate — {tema}

## Tema do Debate
Apresentação do tema em formato de tese debatível. Contextualização e relevância.

## Regras e Formato
Formato do debate (Lincoln-Douglas, British Parliamentary, ou simplificado), tempo de fala, número de participantes, rodadas.

## Material de Apoio — A Favor
5-7 argumentos a favor da tese com dados, exemplos e referências para os alunos do grupo "A Favor".

## Material de Apoio — Contra
5-7 argumentos contra a tese com dados, exemplos e referências para os alunos do grupo "Contra".

## Guia do Mediador
Roteiro para o professor/mediador: como iniciar, gerenciar tempo, fazer perguntas provocativas, encerrar.

## Avaliação
Critérios de avaliação: qualidade dos argumentos, respeito, uso de evidências, contra-argumentação, oratória.

REGRAS:
- Argumentos equilibrados para ambos os lados
- Foco em pensamento crítico, não em "ganhar"
- NÃO retorne JSON`
  },
  {
    id: 'lista_vocabulario_definicoes',
    nome: 'Lista de Vocabulário com Definições',
    descricao: 'Lista de termos-chave com definições, exemplos e atividades de fixação',
    categoria: 'engajamento',
    icone: '📖',
    cor: '#164E63',
    keywords: ['vocabulário', 'vocabulario', 'lista de vocabulário', 'glossário', 'glossario', 'termos', 'definições', 'dicionário temático'],
    secoesEsperadas: ['Tema e Contexto', 'Glossário', 'Exercícios de Fixação', 'Atividade de Aplicação'],
    exemploUso: 'Crie uma lista de vocabulário sobre ecossistemas',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie uma LISTA DE VOCABULÁRIO COM DEFINIÇÕES.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Vocabulário — {tema}

## Tema e Contexto
Breve introdução ao tema e por que estes termos são importantes.

## Glossário
15-20 termos organizados alfabeticamente, cada um com:
- **Termo**: definição clara e acessível
- *Exemplo de uso em frase*
- Sinônimos ou termos relacionados (quando aplicável)

## Exercícios de Fixação
4-5 exercícios variados usando os termos:
- Complete a frase
- Associe termo-definição
- Use o termo corretamente
- Identifique no contexto

## Atividade de Aplicação
Atividade criativa para o aluno usar os termos aprendidos (criar texto, apresentação, mapa mental).

REGRAS:
- Definições acessíveis ao nível do aluno
- Exemplos contextualizados
- NÃO retorne JSON`
  },
];

export const ENGAJAMENTO_CATEGORY: TextActivityCategory = {
  id: 'engajamento',
  nome: 'Engajamento e Participação',
  descricao: 'Exit tickets, icebreakers, estudos de caso, debates e vocabulário',
  icone: '🎫',
  cor: '#0891B2',
  templates,
};

export default templates;
