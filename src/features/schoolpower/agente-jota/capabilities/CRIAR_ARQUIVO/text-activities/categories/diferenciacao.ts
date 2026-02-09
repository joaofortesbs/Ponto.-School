import type { TextActivityTemplate, TextActivityCategory } from '../text-activity-types';

const templates: TextActivityTemplate[] = [
  {
    id: 'material_adaptado_nivel',
    nome: 'Material Adaptado por Nível',
    descricao: 'Mesmo conteúdo adaptado para diferentes níveis de leitura e compreensão',
    categoria: 'diferenciacao',
    icone: '📐',
    cor: '#4F46E5',
    keywords: ['material adaptado', 'adaptar nível', 'adaptar nivel', 'diferenciado por nível', 'nível de leitura', 'simplificar texto', 'adaptar texto'],
    secoesEsperadas: ['Conteúdo Original', 'Nível Básico', 'Nível Intermediário', 'Nível Avançado', 'Orientações ao Professor'],
    exemploUso: 'Adapte o conteúdo sobre fotossíntese para 3 níveis de leitura',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie MATERIAL ADAPTADO POR NÍVEL de leitura/compreensão.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Material Adaptado — {tema}

## Conteúdo Original
Resumo do conteúdo a ser trabalhado e seus objetivos de aprendizagem.

## Nível Básico
Versão simplificada com:
- Vocabulário acessível
- Frases curtas e diretas
- Apoio visual (descrição de imagens sugeridas)
- Exercícios de fixação simples
- Ideal para alunos com dificuldades de leitura ou inclusão

## Nível Intermediário
Versão padrão com:
- Vocabulário adequado à série
- Explicações completas
- Exercícios variados
- Conexões com o cotidiano

## Nível Avançado
Versão desafiadora com:
- Vocabulário técnico
- Textos complementares
- Questões de análise e síntese
- Desafios extras e pesquisa

## Orientações ao Professor
Como distribuir os materiais sem rotular os alunos. Estratégias de agrupamento.

REGRAS:
- Mesmo conteúdo, três abordagens
- Respeitar a dignidade de todos os alunos
- NÃO retorne JSON`
  },
  {
    id: 'choice_board',
    nome: 'Quadro de Escolhas (Choice Board)',
    descricao: 'Grade de atividades variadas para o aluno escolher como demonstrar aprendizado',
    categoria: 'diferenciacao',
    icone: '🎯',
    cor: '#6366F1',
    keywords: ['choice board', 'quadro de escolhas', 'menu de atividades', 'udl', 'design universal', 'board de escolhas'],
    secoesEsperadas: ['Sobre o Choice Board', 'Grade de Atividades', 'Instruções para o Aluno', 'Rubrica', 'Variações'],
    exemploUso: 'Crie um quadro de escolhas sobre a Independência do Brasil',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um QUADRO DE ESCOLHAS (CHOICE BOARD).

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Quadro de Escolhas — {tema}

## Sobre o Choice Board
Explicação do que é e como funciona (Design Universal para Aprendizagem).

## Grade de Atividades
Crie uma grade 3x3 (9 opções) com atividades variadas que trabalhem múltiplas inteligências:
| Escrever | Criar | Pesquisar |
| Apresentar | ★ LIVRE ★ | Desenhar |
| Debater | Construir | Dramatizar |

Cada célula deve ter uma atividade específica e detalhada sobre o tema.

## Instruções para o Aluno
Regras: escolher X atividades, prazo, como entregar, formação (individual/grupo).

## Rubrica
Critérios de avaliação aplicáveis a qualquer atividade escolhida.

## Variações
Sugestões de como adaptar: Tic-Tac-Toe (escolher 3 em linha), Must Do/May Do, etc.

REGRAS:
- Atividades que atendam diferentes estilos de aprendizagem
- Todas com o mesmo nível de profundidade
- NÃO retorne JSON`
  },
  {
    id: 'plano_apoio_individualizado',
    nome: 'Plano de Apoio Individualizado',
    descricao: 'Plano de intervenção personalizado para alunos com necessidades específicas',
    categoria: 'diferenciacao',
    icone: '🤝',
    cor: '#818CF8',
    keywords: ['plano individualizado', 'pei', 'plano de intervenção', 'apoio individualizado', 'iep', 'plano de apoio', 'necessidades especiais', 'inclusão'],
    secoesEsperadas: ['Dados do Aluno', 'Perfil de Aprendizagem', 'Objetivos', 'Estratégias e Adaptações', 'Cronograma', 'Monitoramento'],
    exemploUso: 'Crie um plano de apoio individualizado para aluno com dislexia',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um PLANO DE APOIO INDIVIDUALIZADO.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Plano de Apoio Individualizado

## Dados do Aluno
Campos para: Nome, turma, idade, diagnóstico/laudo (se houver), profissionais envolvidos.

## Perfil de Aprendizagem
Pontos fortes do aluno, áreas de dificuldade, estilo de aprendizagem preferido, interesses.

## Objetivos
Objetivos de curto prazo (bimestral) e longo prazo (anual), específicos e mensuráveis.

## Estratégias e Adaptações
Lista detalhada de adaptações por área:
- Adaptações de conteúdo
- Adaptações de metodologia
- Adaptações de avaliação
- Adaptações de ambiente
- Recursos de apoio (tecnologias assistivas, materiais concretos)

## Cronograma
Agenda de intervenções, frequência de atendimento, datas de reavaliação.

## Monitoramento
Indicadores de progresso, registro de observações, formulário de acompanhamento.

REGRAS:
- Respeitar a individualidade e dignidade do aluno
- Focar em potencialidades, não apenas dificuldades
- Linguagem técnica mas acessível
- NÃO retorne JSON`
  },
  {
    id: 'atividade_diferenciada_inclusao',
    nome: 'Atividade Diferenciada (Inclusão)',
    descricao: 'Atividade adaptada para turmas inclusivas com múltiplos níveis de desafio',
    categoria: 'diferenciacao',
    icone: '🌈',
    cor: '#A5B4FC',
    keywords: ['atividade diferenciada', 'inclusão', 'inclusao', 'atividade inclusiva', 'atividade adaptada', 'acessibilidade', 'ell'],
    secoesEsperadas: ['Objetivo da Atividade', 'Versão Base', 'Adaptações para Inclusão', 'Extensão para Alunos Avançados', 'Dicas de Mediação'],
    exemploUso: 'Crie uma atividade diferenciada de ciências para turma inclusiva',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie uma ATIVIDADE DIFERENCIADA para turma inclusiva.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Atividade Diferenciada — {tema}

## Objetivo da Atividade
Objetivo de aprendizagem comum a todos os alunos, independente do nível.

## Versão Base
Atividade padrão com instruções claras, formato acessível e linguagem inclusiva.

## Adaptações para Inclusão
Versões adaptadas para diferentes necessidades:
- Apoio visual (descrições de imagens, esquemas)
- Simplificação linguística
- Atividades com manipulação concreta
- Instruções passo a passo com apoio
- Tempo estendido

## Extensão para Alunos Avançados
Desafios adicionais, pesquisa, conexões interdisciplinares, perguntas de aprofundamento.

## Dicas de Mediação
Como o professor pode mediar a atividade para que todos participem e aprendam juntos.

REGRAS:
- Mesmo objetivo de aprendizagem para todos
- Múltiplos caminhos para atingir o objetivo
- NÃO retorne JSON`
  },
];

export const DIFERENCIACAO_CATEGORY: TextActivityCategory = {
  id: 'diferenciacao',
  nome: 'Diferenciação e Inclusão',
  descricao: 'Materiais adaptados, quadros de escolhas, planos individualizados e atividades inclusivas',
  icone: '🌈',
  cor: '#4F46E5',
  templates,
};

export default templates;
