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
  {
    id: 'cer_activity',
    nome: 'CER — Afirmação, Evidência e Raciocínio',
    descricao: 'Atividade usando o framework CER (Claim-Evidence-Reasoning) para pensamento científico',
    categoria: 'engajamento',
    icone: '🔎',
    cor: '#1E3A5F',
    keywords: ['cer', 'claim evidence reasoning', 'afirmação evidência raciocínio', 'argumentação científica', 'pensamento científico', 'cer framework'],
    secoesEsperadas: ['Sobre o Framework CER', 'Pergunta Investigativa', 'Modelo CER Preenchido', 'Template CER para o Aluno', 'Banco de Evidências', 'Rubrica CER'],
    exemploUso: 'Crie uma atividade CER sobre mudanças de estado da matéria para o 6º ano',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie uma ATIVIDADE CER (Claim-Evidence-Reasoning / Afirmação-Evidência-Raciocínio).

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Atividade CER — {tema}

## Sobre o Framework CER
Explique o framework CER (Claim-Evidence-Reasoning / Afirmação-Evidência-Raciocínio):
- **Afirmação (Claim)**: Uma resposta ou explicação para a pergunta investigativa
- **Evidência (Evidence)**: Dados, observações ou fatos que sustentam a afirmação
- **Raciocínio (Reasoning)**: Explicação científica que conecta a evidência à afirmação
Por que usar o CER e como ele desenvolve o pensamento científico.

## Pergunta Investigativa
Uma pergunta investigativa central, clara e instigante, relacionada ao tema solicitado. A pergunta deve ser respondível com evidências.

## Modelo CER Preenchido
Um exemplo completo de CER preenchido pelo professor como modelo:
- **Afirmação**: (exemplo de afirmação clara)
- **Evidência**: (dados, observações ou fatos específicos)
- **Raciocínio**: (explicação científica conectando evidência à afirmação)

## Template CER para o Aluno
Template em branco com frases iniciais de apoio (scaffolding):
- "Minha afirmação é..."
- "A evidência que sustenta minha afirmação é..."
- "Isso faz sentido porque..."
- "Portanto, posso concluir que..."
Inclua espaço para rascunho e versão final.

## Banco de Evidências
Conjunto de 8-12 evidências (dados, observações, fatos, resultados de experimentos) para os alunos analisarem e selecionarem as mais relevantes para sua argumentação.

## Rubrica CER
Rubrica específica para avaliar o CER com critérios:
- Qualidade da afirmação (clara, específica, respondendo à pergunta)
- Uso de evidências (relevantes, suficientes, precisas)
- Qualidade do raciocínio (lógico, científico, conectando evidência à afirmação)
- 4 níveis: Iniciante, Em Desenvolvimento, Proficiente, Avançado

REGRAS:
- Linguagem acessível ao nível do aluno
- Evidências baseadas em dados reais ou realistas
- Scaffolding claro para apoiar alunos iniciantes
- NÃO retorne JSON`
  },
  {
    id: 'think_pair_share',
    nome: 'Think-Pair-Share (Pensar-Compartilhar)',
    descricao: 'Atividade estruturada de reflexão individual, discussão em dupla e compartilhamento com a turma',
    categoria: 'engajamento',
    icone: '💭',
    cor: '#1E40AF',
    keywords: ['think pair share', 'pensar compartilhar', 'pensar em dupla', 'think pair', 'reflexão em dupla', 'discussão em pares'],
    secoesEsperadas: ['Sobre o Think-Pair-Share', 'Perguntas para Reflexão', 'Roteiro da Atividade', 'Ficha do Aluno', 'Variações'],
    exemploUso: 'Crie uma atividade Think-Pair-Share sobre democracia para o 9º ano',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie uma ATIVIDADE THINK-PAIR-SHARE (Pensar-Compartilhar).

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Think-Pair-Share — {tema}

## Sobre o Think-Pair-Share
Explique a metodologia em 3 etapas:
- **Think (Pensar)**: Reflexão individual silenciosa
- **Pair (Dupla)**: Discussão em dupla para trocar ideias
- **Share (Compartilhar)**: Compartilhamento com a turma toda
Por que funciona: tempo para pensar antes de falar, todos participam, reduz ansiedade.

## Perguntas para Reflexão
5-8 perguntas provocativas organizadas por complexidade crescente:
- Perguntas de compreensão (nível básico)
- Perguntas de análise (nível intermediário)
- Perguntas de avaliação/criação (nível avançado)
Cada pergunta deve estimular reflexão profunda e ter múltiplas respostas possíveis.

## Roteiro da Atividade
Roteiro detalhado com tempos definidos:
- **Think (2 minutos)**: O que o professor diz, como os alunos registram
- **Pair (3 minutos)**: Como formar duplas, orientações para a discussão
- **Share (5 minutos)**: Como conduzir o compartilhamento, como registrar no quadro
Inclua falas sugeridas para o professor em cada etapa.

## Ficha do Aluno
Ficha para o aluno preencher durante a atividade:
- Espaço "Minhas ideias individuais" (etapa Think)
- Espaço "O que discutimos em dupla" (etapa Pair)
- Espaço "Ideias da turma" (etapa Share)
- Espaço para reflexão final

## Variações
Variações criativas da metodologia:
- **Write-Pair-Share**: Escrever antes de discutir
- **Think-Pair-Square**: Duplas se juntam em quartetos
- **Think-Pair-Share-Square**: Progressão completa
- **Think-Draw-Pair-Share**: Desenhar a ideia
- Adaptações para turmas grandes e pequenas

REGRAS:
- Perguntas abertas que gerem discussão rica
- Tempos realistas para cada etapa
- Inclusivo — todos os alunos participam
- NÃO retorne JSON`
  },
  {
    id: 'gallery_walk',
    nome: 'Gallery Walk (Galeria de Ideias)',
    descricao: 'Atividade em que alunos circulam pela sala visitando estações de trabalho como uma galeria',
    categoria: 'engajamento',
    icone: '🖼️',
    cor: '#1D4ED8',
    keywords: ['gallery walk', 'galeria de ideias', 'galeria', 'caminhada na galeria', 'estações de aprendizagem', 'rotação por estações'],
    secoesEsperadas: ['Sobre o Gallery Walk', 'Preparação das Estações', 'Conteúdo de Cada Estação', 'Ficha de Registro', 'Discussão Final'],
    exemploUso: 'Crie um Gallery Walk sobre os biomas brasileiros para o 7º ano',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie uma ATIVIDADE GALLERY WALK (Galeria de Ideias).

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Gallery Walk — {tema}

## Sobre o Gallery Walk
Explique a metodologia:
- O que é: alunos circulam pela sala visitando estações como em uma galeria de arte
- Como funciona: grupos visitam cada estação, analisam o conteúdo, registram observações
- Benefícios: movimento físico, aprendizagem ativa, colaboração, múltiplas perspectivas

## Preparação das Estações
Guia de preparação com 5-8 estações:
- Layout sugerido da sala (como distribuir as estações)
- Materiais necessários para cada estação
- Tempo por estação (3-5 minutos)
- Como organizar os grupos e a rotação
- Regras de circulação

## Conteúdo de Cada Estação
Conteúdo detalhado para cada estação:
- **Estação 1**: Título, texto informativo, pergunta provocativa, atividade interativa
- **Estação 2**: (mesmo formato)
- Continue para todas as estações
Cada estação deve ter: título visual, conteúdo (texto/imagem descrita), 1-2 perguntas, atividade prática.

## Ficha de Registro
Ficha para o aluno preencher em cada estação:
- Nome da estação visitada
- O que aprendi / O que achei mais interessante
- Minha resposta à pergunta da estação
- Dúvida ou curiosidade
Formato de tabela ou quadro organizado.

## Discussão Final
Guia para a roda de discussão final:
- Perguntas para síntese: "Qual estação mais chamou atenção e por quê?"
- Como conectar os conteúdos das estações
- Atividade de fechamento (mapa conceitual coletivo, votação, etc.)

REGRAS:
- Estações visuais e interativas
- Conteúdo autoexplicativo (alunos devem entender sem professor)
- Movimento e engajamento ativo
- NÃO retorne JSON`
  },
  {
    id: 'seminario_socratico',
    nome: 'Seminário Socrático',
    descricao: 'Discussão acadêmica estruturada baseada no método socrático com perguntas abertas',
    categoria: 'engajamento',
    icone: '🏛️',
    cor: '#312E81',
    keywords: ['seminário socrático', 'seminario socratico', 'socratic seminar', 'método socrático', 'discussão socrática', 'roda de diálogo', 'círculo socrático'],
    secoesEsperadas: ['Sobre o Seminário Socrático', 'Texto Base', 'Perguntas Socráticas', 'Regras de Participação', 'Guia do Facilitador', 'Avaliação'],
    exemploUso: 'Crie um seminário socrático sobre ética e tecnologia para o Ensino Médio',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie um SEMINÁRIO SOCRÁTICO.

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Seminário Socrático — {tema}

## Sobre o Seminário Socrático
Explique o método socrático:
- Origem: Sócrates e a maiêutica (arte de fazer perguntas)
- O que é: discussão acadêmica colaborativa baseada em perguntas abertas
- Objetivo: aprofundar compreensão através do diálogo, não "vencer" o debate
- Formato: círculo interno (discussão) e círculo externo (observação)
- Diferença entre debate e seminário socrático

## Texto Base
Um texto base ou provocação para a discussão:
- Texto curto (1-2 páginas) relevante ao tema
- Pode ser trecho de livro, artigo, poema, notícia ou situação-problema
- Deve ser lido antes do seminário (tarefa de casa ou leitura em sala)
- Orientações de leitura ativa (sublinhar, anotar perguntas)

## Perguntas Socráticas
10-15 perguntas socráticas organizadas em 3 níveis:
- **Perguntas de Abertura (3-4)**: Acessíveis, conectam ao texto, aquecem a discussão
- **Perguntas Centrais (5-7)**: Aprofundam a análise, exigem pensamento crítico, exploram contradições
- **Perguntas de Fechamento (3-4)**: Conectam ao mundo real, síntese pessoal, aplicação

## Regras de Participação
Regras claras para o seminário:
- Formato círculo interno / círculo externo
- Como pedir a palavra
- Referir-se ao texto como evidência
- Construir sobre ideias dos colegas ("Concordo com... porque..." / "Discordo respeitosamente porque...")
- O que evitar (monopolizar, interromper, fugir do tema)
- Ficha de observação para o círculo externo

## Guia do Facilitador
Roteiro para o professor como facilitador:
- Como preparar a sala (disposição em círculos)
- Como iniciar o seminário
- Quando e como intervir (redirecionar, aprofundar, incluir vozes silenciosas)
- Perguntas de follow-up ("Pode explicar melhor?", "Alguém tem outra perspectiva?")
- Como encerrar e fazer a síntese
- Tempo sugerido: 30-45 minutos

## Avaliação
Formulário de avaliação da participação:
- Contribuições significativas ao diálogo
- Uso de evidências do texto
- Escuta ativa e respeito
- Construção sobre ideias dos colegas
- Autoavaliação do aluno
- Escala: Excepcional / Bom / Satisfatório / Precisa Melhorar

REGRAS:
- Perguntas genuinamente abertas (sem resposta única)
- Foco no diálogo, não na competição
- Inclusão de todas as vozes
- NÃO retorne JSON`
  },
  {
    id: 'aprendizagem_cooperativa',
    nome: 'Aprendizagem Cooperativa (Jigsaw)',
    descricao: 'Atividade cooperativa onde cada membro do grupo se torna especialista em uma parte do conteúdo',
    categoria: 'engajamento',
    icone: '🧩',
    cor: '#3730A3',
    keywords: ['jigsaw', 'aprendizagem cooperativa', 'cooperativa', 'grupo especialista', 'grupo base', 'cooperative learning', 'quebra-cabeça'],
    secoesEsperadas: ['Sobre o Método Jigsaw', 'Divisão do Conteúdo', 'Material do Especialista', 'Roteiro do Grupo Base', 'Avaliação Individual e Grupal'],
    exemploUso: 'Crie uma atividade Jigsaw sobre o Sistema Solar para o 6º ano',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie uma ATIVIDADE DE APRENDIZAGEM COOPERATIVA (JIGSAW).

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Aprendizagem Cooperativa (Jigsaw) — {tema}

## Sobre o Método Jigsaw
Explique o método Jigsaw (Quebra-Cabeça):
- Como funciona: cada aluno se torna "especialista" em uma parte do conteúdo
- Etapa 1: Grupos base recebem o tema dividido em partes
- Etapa 2: Especialistas (mesmo subtema) se reúnem para estudar juntos
- Etapa 3: Especialistas voltam ao grupo base e ensinam sua parte
- Por que funciona: interdependência positiva, responsabilidade individual, todos ensinam e aprendem

## Divisão do Conteúdo
Divisão do tema em 4-6 subtemas para os grupos especialistas:
- **Tema 1**: Título e descrição breve do que será estudado
- **Tema 2**: Título e descrição breve
- **Tema 3**: Título e descrição breve
- **Tema 4**: Título e descrição breve
- (Temas 5-6 se necessário)
Como formar os grupos base (4-6 alunos) e distribuir os temas.

## Material do Especialista
Material detalhado para cada grupo de especialistas:
Para cada tema, forneça:
- Texto informativo (1 página) com as informações essenciais
- 3-4 perguntas de estudo para guiar a leitura
- Pontos-chave que o especialista DEVE ensinar ao grupo base
- Sugestão de como apresentar (esquema, desenho, analogia)

## Roteiro do Grupo Base
Guia para quando os especialistas voltam ao grupo base:
- Ordem de apresentação sugerida
- Tempo por especialista (5-7 minutos)
- Como os ouvintes devem registrar o que aprendem
- Atividade integradora final do grupo (conectar todos os subtemas)
- Produto final do grupo (mapa conceitual, resumo, pôster)

## Avaliação Individual e Grupal
Sistema de avaliação duplo:
- **Avaliação Individual**: Quiz ou atividade sobre TODOS os temas (não apenas o seu)
- **Avaliação do Grupo**: Qualidade do produto final, colaboração
- **Autoavaliação**: Como avalio minha contribuição como especialista
- **Avaliação pelos pares**: Como meus colegas ensinaram
- Rubrica com critérios claros

REGRAS:
- Materiais autoexplicativos para cada especialista
- Interdependência real (cada parte é essencial)
- Avaliação individual garante responsabilidade
- NÃO retorne JSON`
  },
  {
    id: 'atividade_sel',
    nome: 'Atividade Socioemocional (SEL)',
    descricao: 'Atividade focada no desenvolvimento de competências socioemocionais dos alunos',
    categoria: 'engajamento',
    icone: '❤️',
    cor: '#4338CA',
    keywords: ['socioemocional', 'sel', 'social emotional', 'competência socioemocional', 'inteligência emocional', 'emocional', 'sentimentos', 'empatia', 'autoconhecimento'],
    secoesEsperadas: ['Competência SEL Trabalhada', 'Atividade de Abertura', 'Atividade Principal', 'Reflexão e Fechamento', 'Continuidade'],
    exemploUso: 'Crie uma atividade socioemocional sobre empatia para o 5º ano',
    promptTemplate: `Você é o Jota, assistente pedagógico do Ponto School. Crie uma ATIVIDADE SOCIOEMOCIONAL (SEL).

SOLICITAÇÃO DO PROFESSOR:
{solicitacao}

CONTEXTO DA SESSÃO (se disponível):
{contexto}

ESTRUTURE COM AS SEGUINTES SEÇÕES (use headers markdown ##):

# Atividade Socioemocional — {tema}

## Competência SEL Trabalhada
Identifique a competência socioemocional do framework CASEL sendo trabalhada:
- **Autoconhecimento**: Reconhecer emoções, valores, forças e limitações
- **Autogestão**: Regular emoções, definir metas, perseverança
- **Consciência Social**: Empatia, respeito à diversidade, compreensão do outro
- **Habilidades de Relacionamento**: Comunicação, cooperação, resolução de conflitos
- **Tomada de Decisão Responsável**: Escolhas éticas, consequências, bem-estar coletivo
Explique por que essa competência é importante para a faixa etária.

## Atividade de Abertura
Atividade de aquecimento (5-10 minutos):
- Check-in emocional (como estou me sentindo hoje?)
- Dinâmica de conexão com o tema
- Pode usar: termômetro emocional, roda de sentimentos, respiração consciente
- Criar ambiente seguro e acolhedor

## Atividade Principal
Atividade principal detalhada (15-25 minutos):
- Objetivo específico da atividade
- Materiais necessários
- Passo a passo detalhado com falas sugeridas para o professor
- Como lidar com situações sensíveis
- Adaptações para diferentes perfis de alunos
- Linguagem apropriada para a faixa etária

## Reflexão e Fechamento
Roda de reflexão e fechamento (5-10 minutos):
- Perguntas para reflexão individual e coletiva
- "O que aprendi sobre mim hoje?"
- "Como posso usar isso no meu dia a dia?"
- Atividade de fechamento (gratidão, compromisso, respiração)
- Check-out emocional

## Continuidade
Sugestões para continuidade ao longo da semana:
- Mini-atividades diárias (2-3 minutos) relacionadas à competência
- Desafio semanal para praticar fora da escola
- Como envolver as famílias
- Indicações de livros, vídeos ou recursos para aprofundar
- Como avaliar o desenvolvimento socioemocional ao longo do tempo

REGRAS:
- Ambiente seguro e acolhedor (ninguém é obrigado a compartilhar)
- Linguagem apropriada para a faixa etária
- Sem julgamentos — foco no desenvolvimento
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
