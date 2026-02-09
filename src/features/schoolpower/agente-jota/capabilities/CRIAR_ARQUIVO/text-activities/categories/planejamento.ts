import type { TextActivityTemplate, TextActivityCategory } from '../text-activity-types';

const templates: TextActivityTemplate[] = [
  {
    id: 'plano_unidade',
    nome: 'Plano de Unidade',
    descricao: 'Planejamento completo de uma unidade didática com múltiplas aulas',
    categoria: 'planejamento',
    icone: '📑',
    cor: '#0369A1',
    keywords: ['plano de unidade', 'unidade didática', 'unidade didatica', 'planejamento de unidade', 'unit plan'],
    secoesEsperadas: ['Visão Geral da Unidade', 'Objetivos de Aprendizagem', 'Sequência de Aulas', 'Recursos e Materiais', 'Avaliação da Unidade'],
    exemploUso: 'Crie um plano de unidade sobre Revolução Industrial para o 9º ano',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um PLANO DE UNIDADE DIDÁTICA completo.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Plano de Unidade — {tema}

## Visão Geral da Unidade
Tema central, disciplina, ano/série, duração estimada (número de aulas), justificativa pedagógica.

## Objetivos de Aprendizagem
Objetivos gerais e específicos alinhados à BNCC. Competências e habilidades trabalhadas.

## Sequência de Aulas
Planejamento aula a aula (4-8 aulas), cada uma com:
- Tema da aula
- Objetivos específicos
- Metodologia
- Atividades propostas
- Tempo estimado

## Recursos e Materiais
Lista completa de recursos necessários para toda a unidade.

## Avaliação da Unidade
Instrumentos de avaliação (diagnóstica, formativa, somativa), critérios e pesos.

REGRAS:
- Progressão lógica entre as aulas
- Alinhamento com BNCC
- NÃO retorne JSON`
  },
  {
    id: 'planejamento_anual',
    nome: 'Planejamento Anual',
    descricao: 'Planejamento anual completo de uma disciplina com bimestres e conteúdos',
    categoria: 'planejamento',
    icone: '📅',
    cor: '#0284C7',
    keywords: ['planejamento anual', 'plano anual', 'cronograma anual', 'planejamento bimestral', 'plano de curso'],
    secoesEsperadas: ['Dados Gerais', '1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre', 'Avaliação Anual'],
    exemploUso: 'Crie um planejamento anual de matemática para o 6º ano',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um PLANEJAMENTO ANUAL completo.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Planejamento Anual — {disciplina}

## Dados Gerais
Disciplina, ano/série, carga horária semanal e anual, professor, escola, ano letivo.

## 1º Bimestre
Conteúdos, objetivos, habilidades BNCC, metodologias, avaliações previstas.

## 2º Bimestre
Conteúdos, objetivos, habilidades BNCC, metodologias, avaliações previstas.

## 3º Bimestre
Conteúdos, objetivos, habilidades BNCC, metodologias, avaliações previstas.

## 4º Bimestre
Conteúdos, objetivos, habilidades BNCC, metodologias, avaliações previstas.

## Avaliação Anual
Critérios gerais de avaliação, instrumentos utilizados ao longo do ano, recuperação.

REGRAS:
- Progressão coerente ao longo do ano
- Alinhado à BNCC
- NÃO retorne JSON`
  },
  {
    id: 'roteiro_projeto_pbl',
    nome: 'Roteiro de Projeto (PBL)',
    descricao: 'Projeto baseado em problemas com etapas, desafio e produto final',
    categoria: 'planejamento',
    icone: '🚀',
    cor: '#0EA5E9',
    keywords: ['projeto', 'pbl', 'project based learning', 'aprendizagem baseada em projetos', 'roteiro de projeto', 'projeto interdisciplinar'],
    secoesEsperadas: ['O Desafio', 'Etapas do Projeto', 'Recursos Necessários', 'Produto Final', 'Avaliação', 'Cronograma'],
    exemploUso: 'Crie um projeto PBL sobre sustentabilidade para a escola inteira',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um ROTEIRO DE PROJETO (PBL).

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Projeto — {tema}

## O Desafio
Pergunta-motriz do projeto. Contexto real e relevante que motive os alunos.

## Etapas do Projeto
5-7 etapas detalhadas com:
- Nome da etapa
- Objetivo
- Atividades dos alunos
- Papel do professor
- Duração estimada

## Recursos Necessários
Materiais, tecnologias, espaços e parcerias necessárias.

## Produto Final
Descrição do que os alunos devem entregar/apresentar ao final do projeto.

## Avaliação
Rubrica do projeto, auto-avaliação, avaliação por pares, avaliação do professor.

## Cronograma
Linha do tempo visual com datas sugeridas para cada etapa.

REGRAS:
- Problema real e relevante
- Protagonismo do aluno
- Interdisciplinaridade quando possível
- NÃO retorne JSON`
  },
  {
    id: 'plano_professor_substituto',
    nome: 'Plano para Professor Substituto',
    descricao: 'Plano detalhado para o professor substituto conduzir a aula',
    categoria: 'planejamento',
    icone: '👤',
    cor: '#38BDF8',
    keywords: ['professor substituto', 'sub plan', 'plano substituto', 'aula substituto', 'plano de emergência'],
    secoesEsperadas: ['Informações da Turma', 'Rotina da Aula', 'Plano de Aula Detalhado', 'Materiais', 'Contatos e Observações'],
    exemploUso: 'Crie um plano para professor substituto na aula de história',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um PLANO PARA PROFESSOR SUBSTITUTO.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Plano para Professor Substituto — {disciplina}

## Informações da Turma
Ano/série, número de alunos, alunos líderes, alunos que precisam de atenção especial, regras da sala.

## Rotina da Aula
Horários, rotinas de entrada/saída, chamada, procedimentos padrão.

## Plano de Aula Detalhado
Passo a passo completo da aula com tempos, o que falar, quais materiais distribuir, atividades detalhadas. Deve ser claro o suficiente para qualquer professor seguir.

## Materiais
Onde encontrar os materiais, cópias, recursos digitais. Tudo pronto para uso.

## Contatos e Observações
Contato do professor titular, coordenação, observações especiais sobre alunos ou procedimentos.

REGRAS:
- Extremamente detalhado e autoexplicativo
- Qualquer professor deve conseguir conduzir a aula
- NÃO retorne JSON`
  },
  {
    id: 'cronograma_estudos',
    nome: 'Cronograma de Estudos',
    descricao: 'Plano de estudos organizado com horários, matérias e metas',
    categoria: 'planejamento',
    icone: '⏰',
    cor: '#7DD3FC',
    keywords: ['cronograma', 'cronograma de estudos', 'plano de estudos', 'rotina de estudos', 'horário de estudos', 'agenda de estudos'],
    secoesEsperadas: ['Objetivo do Cronograma', 'Diagnóstico', 'Cronograma Semanal', 'Metas e Marcos', 'Dicas de Estudo'],
    exemploUso: 'Crie um cronograma de estudos para o ENEM',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um CRONOGRAMA DE ESTUDOS personalizado.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Cronograma de Estudos — {objetivo}

## Objetivo do Cronograma
Para quem é, qual o objetivo (prova, vestibular, recuperação), período de estudo.

## Diagnóstico
Análise das matérias/conteúdos que precisam de mais atenção e priorizações.

## Cronograma Semanal
Tabela com horários por dia da semana:
| Horário | Segunda | Terça | Quarta | Quinta | Sexta | Sábado |
Inclua pausas, revisões e exercícios práticos.

## Metas e Marcos
Metas semanais e mensais mensuráveis. Marcos de progresso.

## Dicas de Estudo
Técnicas de estudo recomendadas (Pomodoro, revisão espaçada, mapas mentais, etc).

REGRAS:
- Realista e sustentável
- Inclua pausas e lazer
- NÃO retorne JSON`
  },
];

export const PLANEJAMENTO_CATEGORY: TextActivityCategory = {
  id: 'planejamento',
  nome: 'Planejamento Pedagógico',
  descricao: 'Planos de unidade, planejamento anual, projetos PBL e cronogramas',
  icone: '📅',
  cor: '#0369A1',
  templates,
};

export default templates;
