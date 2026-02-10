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
  {
    id: 'texto_mentor',
    nome: 'Texto Mentor (Mentor Text)',
    descricao: 'Atividade baseada em texto modelo para ensinar técnicas de escrita',
    categoria: 'escrita_producao',
    icone: '📜',
    cor: '#881337',
    keywords: ['texto mentor', 'mentor text', 'texto modelo', 'modelo de texto', 'técnica de escrita', 'craft lesson', 'mini lesson de escrita'],
    secoesEsperadas: ['Texto Mentor Selecionado', 'Análise do Texto', 'Técnica em Foco', 'Atividade de Prática', 'Produção do Aluno'],
    exemploUso: 'Crie uma atividade com texto mentor para ensinar uso de metáforas',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie uma atividade de TEXTO MENTOR (MENTOR TEXT) para ensinar técnicas de escrita.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Texto Mentor — {tema}

## Texto Mentor Selecionado
Apresente um texto modelo (200-400 palavras) que demonstre de forma exemplar a técnica de escrita em foco. O texto deve ser envolvente, adequado à faixa etária e rico na técnica que será ensinada. Indique o autor (real ou criado para fins pedagógicos) e o gênero textual.

## Análise do Texto
Crie 5-8 perguntas guiadas para análise do texto mentor:
- O que o autor fez neste trecho? (identificação da técnica)
- Por que isso é eficaz? (efeito no leitor)
- Que palavras/estruturas o autor escolheu? (análise linguística)
- Como isso contribui para o texto como um todo? (função no texto)
- Destaque trechos específicos do texto e explique a técnica usada em cada um.

## Técnica em Foco
Explicação didática e detalhada da técnica de escrita:
- O que é a técnica (definição clara)
- Por que escritores a utilizam (propósito)
- Como identificá-la em textos (características)
- Exemplos variados de uso (3-4 exemplos curtos)
- Erros comuns ao tentar usar a técnica

## Atividade de Prática
Crie 3-4 exercícios progressivos para o aluno praticar a técnica:
- Exercício de identificação (encontrar a técnica em outros trechos)
- Exercício de transformação (reescrever frases aplicando a técnica)
- Exercício de criação guiada (escrever um parágrafo usando a técnica com apoio)

## Produção do Aluno
Proposta de produção textual onde o aluno deve aplicar a técnica aprendida:
- Tema e gênero definidos
- Extensão esperada
- Critérios específicos relacionados à técnica em foco
- Checklist para o aluno revisar seu próprio texto

REGRAS:
- Texto mentor de qualidade literária
- Progressão clara: observar → analisar → praticar → produzir
- Linguagem adequada ao nível escolar
- NÃO retorne JSON`
  },
  {
    id: 'roteiro_apresentacao',
    nome: 'Roteiro de Apresentação Oral',
    descricao: 'Guia estruturado para o aluno preparar e realizar apresentações orais',
    categoria: 'escrita_producao',
    icone: '🎤',
    cor: '#4C0519',
    keywords: ['apresentação oral', 'apresentação', 'apresentacao', 'seminário', 'seminario', 'roteiro de apresentação', 'oratória', 'oral presentation'],
    secoesEsperadas: ['Tema da Apresentação', 'Estrutura do Roteiro', 'Modelo de Roteiro', 'Dicas de Oratória', 'Rubrica de Avaliação'],
    exemploUso: 'Crie um roteiro de apresentação oral sobre biomas brasileiros',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um ROTEIRO DE APRESENTAÇÃO ORAL completo e estruturado.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Roteiro de Apresentação Oral — {tema}

## Tema da Apresentação
Apresente o tema, objetivos da apresentação, público-alvo e tempo estimado. Inclua os pontos essenciais que devem ser abordados.

## Estrutura do Roteiro
Modelo de estrutura em branco para o aluno preencher:

### 1. Abertura (Gancho Inicial)
- Espaço para o aluno criar uma pergunta provocativa, dado surpreendente ou história breve para capturar a atenção.

### 2. Introdução
- Apresentação do tema e do que será abordado
- Roteiro do que o público pode esperar

### 3. Desenvolvimento (Pontos Principais)
- Ponto 1: _____ (com transição para o próximo)
- Ponto 2: _____ (com transição para o próximo)
- Ponto 3: _____ (com transição para a conclusão)
- Espaço para exemplos, dados e evidências em cada ponto

### 4. Conclusão
- Resumo dos pontos principais
- Mensagem final impactante
- Agradecimento

### 5. Perguntas e Respostas
- Dicas para conduzir o momento de perguntas

## Modelo de Roteiro
Um exemplo completo de roteiro preenchido sobre o tema solicitado, servindo como referência para o aluno. Inclua falas sugeridas, transições entre tópicos e marcações de tempo.

## Dicas de Oratória
Orientações práticas para uma boa apresentação:
- 👁️ Contato visual: como olhar para o público
- 🗣️ Voz: volume, ritmo, entonação e pausas estratégicas
- 🤸 Linguagem corporal: postura, gestos e movimentação
- 📊 Uso de recursos visuais: slides, cartazes, objetos
- 😰 Como lidar com o nervosismo: técnicas de respiração e preparação
- ⏱️ Gestão do tempo: como ensaiar e controlar a duração

## Rubrica de Avaliação
Tabela com critérios de avaliação da apresentação oral:
- Conteúdo e domínio do tema
- Organização e estrutura
- Oratória e comunicação verbal
- Linguagem corporal e postura
- Uso de recursos visuais
- Gestão do tempo
- Interação com o público
Para cada critério: 4 níveis (Insuficiente / Regular / Bom / Excelente) com descrições.

REGRAS:
- Roteiro prático e pronto para usar
- Linguagem encorajadora e acessível
- Dicas concretas e aplicáveis
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
