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

DIRETRIZES DE QUALIDADE OBRIGATÓRIAS:
- Crie OBRIGATORIAMENTE as 3 versões: BÁSICA, INTERMEDIÁRIA e AVANÇADA — nunca omita uma delas
- As 3 versões devem cobrir EXATAMENTE o mesmo conteúdo central, com abordagens diferentes
- BÁSICA: vocabulário simples, frases curtas (máx. 15 palavras), conceitos concretos, analogias do dia a dia, apoio visual descrito
- INTERMEDIÁRIA: padrão curricular, vocabulário da série, explicações completas, exercícios variados
- AVANÇADA: vocabulário técnico/científico, análise crítica, conexões interdisciplinares, pesquisa e síntese
- Nunca rotule as versões com adjetivos que exponham o nível do aluno — use "Versão A/B/C" ou nomes neutros na distribuição
- Todo conteúdo deve ser específico para o tema solicitado — não use exemplos genéricos

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Material Adaptado — {tema}

## Objetivo de Aprendizagem Comum
O objetivo que TODOS os alunos devem atingir ao final, independente do nível. Use linguagem clara e mensurável.

## Versão BÁSICA
**Para quem:** Alunos em processo de alfabetização, com dificuldades de leitura, ELL, ou que precisam de suporte adicional.
**Características desta versão:**
- Vocabulário acessível e do cotidiano
- Frases curtas e diretas (máximo 15 palavras)
- Apoio visual: descreva quais imagens, diagramas ou ícones acompanhariam o texto
- Exemplos concretos e próximos da realidade do aluno

**Texto Adaptado:**
[Escreva o conteúdo completo neste nível — mínimo 150 palavras]

**Exercícios de Fixação (nível básico):**
2-3 exercícios simples de compreensão ou aplicação direta

---

## Versão INTERMEDIÁRIA
**Para quem:** A maioria da turma — nível padrão para a série.
**Características desta versão:**
- Vocabulário adequado à série e disciplina
- Explicações completas com exemplos
- Conexões com o cotidiano e com outros conteúdos

**Texto Adaptado:**
[Escreva o conteúdo completo neste nível — mínimo 200 palavras]

**Exercícios (nível intermediário):**
3-4 exercícios variados (compreensão, aplicação e análise)

---

## Versão AVANÇADA
**Para quem:** Alunos que dominam o conteúdo e precisam de desafios maiores.
**Características desta versão:**
- Vocabulário técnico/científico da área
- Texto com maior densidade conceitual
- Conexões interdisciplinares e contexto histórico/social

**Texto Adaptado:**
[Escreva o conteúdo completo neste nível — mínimo 250 palavras]

**Exercícios de Aprofundamento:**
3-4 exercícios de análise, síntese, avaliação e criação (Bloom superior)
Inclua pelo menos 1 questão de pesquisa ou projeto

---

## Guia do Professor
- Como distribuir os materiais preservando a dignidade de todos (evitar exposição do nível)
- Estratégias de agrupamento: homogêneo x heterogêneo, quando usar cada um
- Como mediar as diferentes versões na mesma aula
- Indicadores para perceber quando um aluno está pronto para avançar de versão

IMPORTANTE: Todo o conteúdo deve ser específico para "{solicitacao}". Nunca deixe seções genéricas ou com placeholders. Entregue as 3 versões completas.
NÃO retorne JSON`
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

DIRETRIZES DE QUALIDADE OBRIGATÓRIAS:
- Inclua OBJETIVOS SMART: Específicos, Mensuráveis, Alcançáveis, Relevantes, com Prazo definido
- Diferencie claramente: adaptações de CONTEÚDO (o quê ensinar), de METODOLOGIA (como ensinar) e de AVALIAÇÃO (como avaliar)
- Inclua seção de COMUNICAÇÃO FAMÍLIA-ESCOLA com frequência e canais de acompanhamento
- Foque em POTENCIALIDADES e competências — nunca apenas em limitações
- Estratégias de ensino diferenciadas ESPECÍFICAS (não genéricas como "dar mais tempo") — explique o método concreto
- Linguagem técnica mas acessível para outros professores que irão implementar o plano

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Plano de Apoio Individualizado

## Dados do Aluno
Campos para: Nome, Turma, Série/Ano, Idade, Data de elaboração, Período de vigência do plano, Profissionais envolvidos (professor, coordenador, psicopedagogo, outros).

## Perfil de Aprendizagem
**Potencialidades:** O que o aluno faz bem, seus interesses e motivações.
**Estilo de aprendizagem:** Como o aluno aprende melhor (visual, auditivo, cinestésico, lúdico).
**Área de atenção:** Dificuldades específicas identificadas com exemplos observáveis (sem julgamentos).
**Contexto familiar:** Informações relevantes sobre o suporte em casa (sem invasão de privacidade).

## Objetivos SMART
**Objetivos de Curto Prazo** (até o final do bimestre):
Liste 3-4 objetivos no formato: "O aluno conseguirá [verbo de ação mensurável] [conteúdo específico] [com que critério/condição] até [data]"

**Objetivos de Longo Prazo** (até o final do ano):
Liste 2-3 objetivos maiores, alinhados com as competências da BNCC para a série.

## Estratégias e Adaptações Pedagógicas
**Adaptações de Conteúdo:**
- O que será modificado no currículo e como (ex: redução de extensão, priorização de conceitos-chave)

**Adaptações de Metodologia:**
- Estratégias de ensino específicas e detalhadas (ex: "Usar manipuláveis concretos antes de introduzir o abstrato", "Dividir tarefas em 3 etapas com checklist")
- Recursos de apoio: tecnologias assistivas, materiais concretos, pares tutores

**Adaptações de Avaliação:**
- Como o aluno demonstrará seu aprendizado de forma diferenciada
- Formatos alternativos (oral, portfolio, projeto) e critérios específicos

**Adaptações de Ambiente:**
- Posicionamento na sala, agrupamento, nível de ruído, iluminação

## Cronograma de Intervenções
Tabela com: Atividade de intervenção | Frequência | Responsável | Local | Recurso utilizado
Inclua datas de reavaliação do plano (sugestão: a cada bimestre).

## Comunicação Família-Escola
- Frequência dos contatos (semanal, quinzenal, mensal)
- Canal principal (agenda, WhatsApp, reunião presencial)
- Modelo de registro de comunicação
- Orientações para a família apoiar em casa (específicas e realizáveis)

## Monitoramento e Evidências
- Indicadores de progresso observáveis e mensuráveis
- Como registrar o avanço (portfólio, rubrica, checklist de observação)
- Formulário de acompanhamento semanal/quinzenal

IMPORTANTE: Todo o conteúdo deve ser específico para "{solicitacao}". Entregue o plano completo e pronto para uso.
NÃO retorne JSON`
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
