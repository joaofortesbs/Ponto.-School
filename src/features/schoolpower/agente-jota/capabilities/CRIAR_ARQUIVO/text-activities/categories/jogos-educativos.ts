import type { TextActivityTemplate, TextActivityCategory } from '../text-activity-types';

const templates: TextActivityTemplate[] = [
  {
    id: 'caca_palavras',
    nome: 'Caça-Palavras',
    descricao: 'Caça-palavras educativo com grade de letras e lista de palavras para encontrar',
    categoria: 'jogos_educativos',
    icone: '🔍',
    cor: '#7C3AED',
    keywords: ['caça-palavras', 'caça palavras', 'caca palavras', 'caca-palavras', 'caçapalavras'],
    secoesEsperadas: ['Instruções', 'Lista de Palavras', 'Grade do Caça-Palavras', 'Gabarito', 'Curiosidades'],
    exemploUso: 'Crie um caça-palavras sobre o corpo humano para o 5º ano',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um CAÇA-PALAVRAS EDUCATIVO.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Caça-Palavras — {tema}

## Instruções
Orientações para o aluno sobre como encontrar as palavras na grade.

## Lista de Palavras
Liste 10-15 palavras relacionadas ao tema que o aluno deve encontrar. Ao lado de cada palavra, coloque uma dica ou definição curta.

## Grade do Caça-Palavras
Monte uma grade 15x15 de letras maiúsculas onde as palavras estão escondidas (horizontal, vertical, diagonal). Preencha os espaços vazios com letras aleatórias. Use formato de tabela com espaçamento fixo.

## Gabarito
Indique a posição de cada palavra: linha, coluna e direção.

## Curiosidades
Inclua 3-4 curiosidades educativas sobre as palavras do caça-palavras para enriquecer o aprendizado.

REGRAS:
- Grade bem formatada com letras separadas por espaço
- Palavras escondidas em múltiplas direções
- Dicas educativas junto à lista de palavras
- NÃO retorne JSON`
  },
  {
    id: 'palavras_cruzadas',
    nome: 'Palavras Cruzadas',
    descricao: 'Palavras cruzadas educativas com dicas horizontais e verticais',
    categoria: 'jogos_educativos',
    icone: '✏️',
    cor: '#6D28D9',
    keywords: ['palavras cruzadas', 'cruzadinha', 'cruza-palavras', 'cruzada'],
    secoesEsperadas: ['Instruções', 'Dicas Horizontais', 'Dicas Verticais', 'Grade', 'Gabarito'],
    exemploUso: 'Crie uma cruzadinha sobre os estados do Brasil',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie PALAVRAS CRUZADAS educativas.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Palavras Cruzadas — {tema}

## Instruções
Orientações para o aluno sobre como preencher as palavras cruzadas.

## Dicas Horizontais
Liste as dicas numeradas para as palavras horizontais. Cada dica deve ser educativa e clara.

## Dicas Verticais
Liste as dicas numeradas para as palavras verticais.

## Grade
Represente a grade das palavras cruzadas usando caracteres texto. Use [ ] para casas preenchíveis e ■ para casas bloqueadas. Numere as casas iniciais.

## Gabarito
Todas as respostas horizontais e verticais.

REGRAS:
- 8-12 palavras cruzando entre si
- Dicas educativas que ensinem o conteúdo
- Grade visual clara em formato texto
- NÃO retorne JSON`
  },
  {
    id: 'jogo_show_milhao',
    nome: 'Jogo Show do Milhão',
    descricao: 'Jogo de perguntas e respostas estilo Show do Milhão/Jeopardy com níveis de dificuldade',
    categoria: 'jogos_educativos',
    icone: '🏆',
    cor: '#8B5CF6',
    keywords: ['show do milhão', 'jeopardy', 'quem quer ser milionário', 'jogo de perguntas', 'game show', 'show do milhao'],
    secoesEsperadas: ['Regras do Jogo', 'Rodada 1 — Fácil', 'Rodada 2 — Médio', 'Rodada 3 — Difícil', 'Rodada Final', 'Gabarito Completo'],
    exemploUso: 'Crie um jogo Show do Milhão sobre história do Brasil',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um JOGO SHOW DO MILHÃO educativo.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Show do Milhão — {tema}

## Regras do Jogo
Explique como funciona o jogo: rodadas, pontuação, ajudas (pular, dica, eliminar alternativa). Ideal para projetar em sala ou jogar em grupos.

## Rodada 1 — Fácil (100 a 1.000 pontos)
5 perguntas fáceis com 4 alternativas cada. Indique a pontuação de cada pergunta.

## Rodada 2 — Médio (2.000 a 10.000 pontos)
5 perguntas de dificuldade média com 4 alternativas cada.

## Rodada 3 — Difícil (20.000 a 100.000 pontos)
4 perguntas difíceis com 4 alternativas cada.

## Rodada Final — Pergunta do Milhão (1.000.000 pontos)
1 pergunta muito desafiadora com 4 alternativas.

## Gabarito Completo
Respostas de todas as rodadas com explicações.

REGRAS:
- Formato divertido e competitivo
- Progressão clara de dificuldade
- Perguntas que ensinam enquanto divertem
- NÃO retorne JSON`
  },
  {
    id: 'bingo_educativo',
    nome: 'Bingo Educativo',
    descricao: 'Cartelas de bingo educativo com perguntas e respostas temáticas',
    categoria: 'jogos_educativos',
    icone: '🎰',
    cor: '#A855F7',
    keywords: ['bingo', 'bingo educativo', 'cartela de bingo', 'bingo pedagógico'],
    secoesEsperadas: ['Regras do Bingo', 'Lista de Perguntas/Chamadas', 'Cartelas dos Alunos', 'Dicas para o Professor'],
    exemploUso: 'Crie um bingo educativo sobre tabuada para o 4º ano',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um BINGO EDUCATIVO completo.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Bingo Educativo — {tema}

## Regras do Bingo
Como jogar: o professor lê as perguntas/chamadas, os alunos marcam a resposta na cartela. Quem completar uma linha/coluna/cartela grita "BINGO!".

## Lista de Perguntas/Chamadas
Crie 25-30 perguntas ou chamadas que o professor vai ler em voz alta. Cada uma deve ter uma resposta curta e clara.

## Cartelas dos Alunos
Crie 6 cartelas diferentes (5x5) com as respostas distribuídas aleatoriamente. Use formato de tabela. O centro é livre (★).

## Dicas para o Professor
Como organizar o jogo, premiações sugeridas, variações (linha, coluna, cartela cheia, L, X).

REGRAS:
- Cartelas com respostas em posições diferentes
- Perguntas educativas sobre o tema
- Formato pronto para imprimir
- NÃO retorne JSON`
  },
  {
    id: 'desafios_sala',
    nome: 'Desafios e Competições de Sala',
    descricao: 'Atividades competitivas saudáveis para engajar a turma com desafios temáticos',
    categoria: 'jogos_educativos',
    icone: '⚡',
    cor: '#C084FC',
    keywords: ['desafio', 'competição', 'competicao', 'gincana', 'torneio', 'desafio de sala', 'desafio educativo'],
    secoesEsperadas: ['Visão Geral do Desafio', 'Regras e Pontuação', 'Rodadas de Desafio', 'Placar', 'Premiação'],
    exemploUso: 'Crie uma gincana educativa sobre ciências para a turma',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie DESAFIOS E COMPETIÇÕES DE SALA.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Desafio Educativo — {tema}

## Visão Geral do Desafio
Objetivo, público-alvo, tempo estimado e materiais necessários.

## Regras e Pontuação
Regras claras, sistema de pontuação, formação de equipes, critérios de desempate.

## Rodadas de Desafio
Crie 4-6 rodadas diferentes, cada uma com um tipo de desafio:
- Rodada relâmpago (perguntas rápidas)
- Rodada criativa (criar/desenhar/montar)
- Rodada de raciocínio (problemas lógicos)
- Rodada de equipe (colaborativa)
Detalhe cada rodada com perguntas/atividades específicas.

## Placar
Modelo de placar para o professor anotar os pontos de cada equipe.

## Premiação
Sugestões de premiações simbólicas e reconhecimento para os participantes.

REGRAS:
- Competição saudável e inclusiva
- Todos devem participar
- Variação de tipos de habilidades testadas
- NÃO retorne JSON`
  },
];

export const JOGOS_EDUCATIVOS_CATEGORY: TextActivityCategory = {
  id: 'jogos_educativos',
  nome: 'Jogos e Engajamento',
  descricao: 'Jogos educativos, competições e atividades lúdicas em formato textual',
  icone: '🎮',
  cor: '#7C3AED',
  templates,
};

export default templates;
