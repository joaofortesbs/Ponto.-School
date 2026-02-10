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
  {
    id: 'revisao_espiral',
    nome: 'Revisão Espiral (Spiral Review)',
    descricao: 'Atividade de revisão que retoma conteúdos anteriores de forma progressiva e cumulativa',
    categoria: 'planejamento',
    icone: '🌀',
    cor: '#BAE6FD',
    keywords: ['revisão espiral', 'revisao espiral', 'spiral review', 'revisão cumulativa', 'retomada de conteúdo', 'revisão progressiva', 'do now', 'bell ringer'],
    secoesEsperadas: ['Sobre a Revisão Espiral', 'Plano Semanal de Revisão', 'Atividades Diárias', 'Acompanhamento de Domínio', 'Banco de Questões'],
    exemploUso: 'Crie uma revisão espiral de matemática para o 7º ano (4 semanas)',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um PLANO DE REVISÃO ESPIRAL (Spiral Review) completo.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Revisão Espiral — {tema/disciplina}

## Sobre a Revisão Espiral
Explique a metodologia de revisão espiral: como funciona, por que é eficaz (retenção de longo prazo, prática espaçada), e como implementar na rotina da sala de aula. Inclua referências pedagógicas sobre a técnica.

## Plano Semanal de Revisão
Organize um plano semanal (4 semanas) que retome conteúdos anteriores de forma progressiva enquanto introduz novos tópicos:
- Semana 1: Tópicos revisados + novo conteúdo
- Semana 2: Retomada da semana 1 + novo conteúdo
- Semana 3: Retomada das semanas 1-2 + novo conteúdo
- Semana 4: Revisão cumulativa de todas as semanas
Mostre claramente como os tópicos se acumulam.

## Atividades Diárias
Crie atividades de aquecimento "Do Now" (5-10 minutos) para cada dia:
- Formato: 3-5 questões rápidas misturando tópicos antigos e atuais
- Nível progressivo de dificuldade
- Inclua questões de múltipla escolha, resposta curta e resolução rápida
- As atividades devem funcionar como "bell ringers" no início da aula

## Acompanhamento de Domínio
Crie uma tabela/quadro de acompanhamento para o professor monitorar o domínio dos alunos:
- Lista de tópicos/habilidades por aluno
- Indicadores: Dominado ✅ / Em progresso 🔄 / Precisa reforço ❌
- Espaço para anotações do professor
- Sugestões de intervenção para alunos com dificuldade

## Banco de Questões
Crie um banco de questões organizado por:
- Tópico/conteúdo
- Nível de dificuldade (Básico / Intermediário / Avançado)
- Mínimo de 5 questões por tópico
- Gabarito com resoluções comentadas

REGRAS:
- Progressão lógica e cumulativa
- Questões variadas e contextualizadas
- Alinhado à BNCC quando aplicável
- NÃO retorne JSON`
  },
  {
    id: 'atividade_steam',
    nome: 'Atividade STEAM/STEM',
    descricao: 'Atividade interdisciplinar integrando Ciências, Tecnologia, Engenharia, Artes e Matemática',
    categoria: 'planejamento',
    icone: '🔬',
    cor: '#0C4A6E',
    keywords: ['steam', 'stem', 'atividade steam', 'atividade stem', 'interdisciplinar', 'maker', 'mão na massa', 'hands on', 'projeto maker'],
    secoesEsperadas: ['Desafio STEAM', 'Conexões Curriculares', 'Materiais e Recursos', 'Roteiro da Atividade', 'Avaliação e Reflexão'],
    exemploUso: 'Crie uma atividade STEAM sobre construção de pontes para o 6º ano',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie uma ATIVIDADE STEAM/STEM completa e interdisciplinar.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Atividade STEAM — {tema}

## Desafio STEAM
Apresente um desafio ou problema envolvente e real para os alunos resolverem. O desafio deve:
- Ser contextualizado na realidade dos alunos
- Ter múltiplas soluções possíveis
- Exigir integração de diferentes áreas do conhecimento
- Motivar a investigação e a criatividade

## Conexões Curriculares
Explicite as conexões com cada área STEAM:
- **Ciências (S):** Conceitos científicos envolvidos, habilidades BNCC
- **Tecnologia (T):** Ferramentas tecnológicas utilizadas, competências digitais
- **Engenharia (E):** Processo de design e construção, resolução de problemas
- **Artes (A):** Elementos estéticos, criatividade, expressão visual
- **Matemática (M):** Conceitos matemáticos aplicados, medições, cálculos

## Materiais e Recursos
Lista completa de materiais necessários:
- Priorize materiais acessíveis e de baixo custo
- Inclua alternativas para materiais menos disponíveis
- Indique recursos digitais gratuitos quando aplicável
- Liste materiais de segurança necessários

## Roteiro da Atividade
Guia passo a passo seguindo o processo de design de engenharia:
1. **Investigar:** Pesquisa e compreensão do problema (tempo estimado)
2. **Imaginar:** Brainstorming de soluções em grupo (tempo estimado)
3. **Planejar:** Desenho e planejamento da solução (tempo estimado)
4. **Criar:** Construção do protótipo/produto (tempo estimado)
5. **Testar:** Teste e avaliação da solução (tempo estimado)
6. **Melhorar:** Iteração e aprimoramento (tempo estimado)
7. **Compartilhar:** Apresentação para a turma (tempo estimado)

## Avaliação e Reflexão
- Rubrica de avaliação com critérios claros para cada área STEAM
- Perguntas de reflexão para os alunos (individual e em grupo)
- Auto-avaliação do processo de trabalho em equipe
- Registro fotográfico/portfólio sugerido

REGRAS:
- Atividade mão na massa (hands-on)
- Materiais acessíveis e de baixo custo
- Protagonismo do aluno
- Trabalho colaborativo
- NÃO retorne JSON`
  },
  {
    id: 'roteiro_laboratorio',
    nome: 'Roteiro de Laboratório / Experimento',
    descricao: 'Roteiro científico completo para aula prática ou experimento de laboratório',
    categoria: 'planejamento',
    icone: '🧪',
    cor: '#075985',
    keywords: ['laboratório', 'laboratorio', 'experimento', 'aula prática', 'aula pratica', 'lab', 'roteiro de laboratório', 'prática de laboratório', 'experiência científica'],
    secoesEsperadas: ['Objetivo do Experimento', 'Fundamentação Teórica', 'Materiais e Segurança', 'Procedimento Passo a Passo', 'Registro de Observações', 'Análise e Conclusão'],
    exemploUso: 'Crie um roteiro de laboratório sobre reações químicas para o 9º ano',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um ROTEIRO DE LABORATÓRIO / EXPERIMENTO completo.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Roteiro de Laboratório — {experimento}

## Objetivo do Experimento
- Objetivo geral do experimento
- Objetivos específicos de aprendizagem
- Hipótese a ser testada (quando aplicável)
- Pergunta investigativa que guia o experimento

## Fundamentação Teórica
Breve base teórica que o aluno precisa conhecer antes do experimento:
- Conceitos-chave envolvidos
- Princípios científicos aplicados
- Conexão com o conteúdo estudado em sala
- Referências à BNCC

## Materiais e Segurança
**Materiais necessários:**
- Lista completa com quantidades por grupo
- Alternativas para materiais menos acessíveis

**⚠️ Normas de Segurança (EPI):**
- Equipamentos de proteção individual necessários (luvas, óculos, jaleco)
- Precauções específicas do experimento
- Procedimentos de emergência
- Descarte correto de resíduos

## Procedimento Passo a Passo
Instruções detalhadas e numeradas:
1. Preparação do ambiente e materiais
2. Cada etapa com descrição clara e objetiva
3. Inclua dicas visuais: "Observe que..." / "Você deverá notar..."
4. Indique pontos de atenção: "⚠️ Cuidado ao..."
5. Tempos de espera quando necessários
6. Descrição do que deve acontecer em cada etapa

*Inclua descrições de ilustrações/diagramas sugeridos para acompanhar cada etapa.*

## Registro de Observações
Modelo de tabela/ficha para os alunos registrarem:
- Tabela de dados com colunas apropriadas ao experimento
- Espaço para desenhos de observação
- Campos para registrar: o que observou, medições, cores, temperaturas, etc.
- Espaço para anotações livres

## Análise e Conclusão
Perguntas orientadoras para análise dos resultados:
- O que os dados indicam?
- A hipótese foi confirmada ou refutada? Por quê?
- Quais fatores podem ter influenciado os resultados?
- Como este experimento se conecta com o cotidiano?
- Sugestões de experimentos complementares

**📝 Notas do Professor (não compartilhar com alunos):**
- Resultados esperados do experimento
- Erros comuns e como preveni-los
- Variações possíveis do experimento
- Pontos de discussão para aprofundamento

REGRAS:
- Linguagem clara e acessível ao nível dos alunos
- Segurança em primeiro lugar
- Método científico como base
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
