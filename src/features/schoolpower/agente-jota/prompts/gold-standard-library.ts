/**
 * GOLD STANDARD LIBRARY - Biblioteca de Exemplos de Ouro (Few-Shot Learning)
 * 
 * Inspirado em:
 * - Teachy: 100K+ questões originais como referência de qualidade
 * - Eduaide: Knowledge Graph com 1000+ artigos pedagógicos
 * - OpenAI: Few-Shot prompting com 2-5 exemplos antes da geração
 * - Bloom's Taxonomy: Categorização por nível cognitivo
 * 
 * COMO FUNCIONA:
 * 1. Cada exemplo é uma atividade CRIATIVA de alto padrão
 * 2. O seletor escolhe 2-3 exemplos relevantes por componente/série/tipo
 * 3. Os exemplos são injetados no prompt ANTES de pedir à IA para gerar
 * 4. A IA usa os exemplos como referência de qualidade e criatividade
 * 
 * ESTRUTURA DE CADA EXEMPLO:
 * - gancho_criativo: Conexão com mundo real que engaja o aluno
 * - bloom_level: Nível na Taxonomia de Bloom (lembrar → criar)
 * - estrutura: Formato da atividade com seções claras
 * - diferenciacao: Versões para diferentes níveis
 * - formatacao: Elementos visuais e de organização
 */

export interface GoldStandardExample {
  id: string;
  componente: string;
  serie_range: string[];
  tipo_atividade: string;
  titulo: string;
  gancho_criativo: string;
  bloom_level: 'lembrar' | 'entender' | 'aplicar' | 'analisar' | 'avaliar' | 'criar';
  bncc_exemplo: string;
  conteudo_exemplo: string;
  elementos_criativos: string[];
  tags: string[];
}

const GOLD_EXAMPLES: GoldStandardExample[] = [
  // ═══════════════════════════════════════════════════════════════
  // MATEMÁTICA
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'mat-fracoes-pizzaria',
    componente: 'Matemática',
    serie_range: ['5º ano', '6º ano', '7º ano'],
    tipo_atividade: 'prova',
    titulo: 'Desafio da Pizzaria Matemática',
    gancho_criativo: 'Você é o gerente de uma pizzaria e precisa resolver problemas reais com frações para atender os pedidos dos clientes!',
    bloom_level: 'aplicar',
    bncc_exemplo: 'EF06MA09',
    conteudo_exemplo: `🍕 DESAFIO DA PIZZARIA MATEMÁTICA
    
CENÁRIO: Você acabou de ser contratado como gerente da "Pizza Pi" — a pizzaria mais 
famosa do bairro. Hoje é sexta à noite e a casa está LOTADA. Use seus conhecimentos 
de frações para resolver cada situação!

QUESTÃO 1 — O Pedido Confuso (2,0 pontos)
A Mesa 7 pediu uma pizza grande de 8 fatias. O João comeu 2/8, a Maria comeu 3/8 
e o Pedro comeu 1/8. 
a) Que fração da pizza foi consumida? Simplifique sua resposta.
b) Quantas fatias sobraram? Represente em fração irredutível.
c) Se cada fatia custa R$ 4,50, quanto o grupo gastou?

QUESTÃO 2 — O Desafio do Delivery (3,0 pontos)
Três apartamentos do mesmo prédio fizeram pedidos:
- Apto 101: 1/2 pizza de calabresa + 1/4 de mussarela
- Apto 202: 3/4 pizza de frango + 1/3 de portuguesa
- Apto 303: 2/3 pizza de marguerita
Quantas pizzas INTEIRAS o pizzaiolo precisa preparar no mínimo?
Mostre seu raciocínio passo a passo.

QUESTÃO 3 — O Inventário Criativo (2,5 pontos)
No estoque da pizzaria, há 5 kg de queijo. Cada pizza usa 1/3 kg.
a) Quantas pizzas podem ser feitas com esse estoque?
b) Se sobrar queijo, que fração de kg sobra?

🏆 QUESTÃO BÔNUS — Gerente Estratégico (2,5 pontos)
A pizzaria quer criar uma promoção: "Pizza Família" com 12 fatias onde cada 
sabor ocupe frações IGUAIS. O cliente pode escolher 2, 3 ou 4 sabores.
Desenhe como ficaria a divisão em cada caso e escreva as frações.

GABARITO DO PROFESSOR:
Q1a: 2/8 + 3/8 + 1/8 = 6/8 = 3/4
Q1b: 2/8 = 1/4 (2 fatias)
Q1c: 6 × R$ 4,50 = R$ 27,00
Q2: Mínimo 3 pizzas (explicação detalhada)
Q3a: 5 ÷ 1/3 = 15 pizzas; Q3b: Não sobra
Bônus: 2 sabores = 6/12 cada; 3 sabores = 4/12 cada; 4 sabores = 3/12 cada`,
    elementos_criativos: ['cenário de mundo real', 'personagens com nomes', 'progressão de dificuldade', 'questão bônus desafiadora', 'gabarito completo'],
    tags: ['frações', 'operações', 'mundo real', 'pizzaria', 'gamificação'],
  },

  {
    id: 'mat-funcoes-uber',
    componente: 'Matemática',
    serie_range: ['9º ano', '1º ano EM', '1ª série EM'],
    tipo_atividade: 'atividade',
    titulo: 'Uber vs. 99: A Matemática por trás da Corrida',
    gancho_criativo: 'Use funções do 1º grau para descobrir qual app de transporte é mais barato para diferentes distâncias!',
    bloom_level: 'analisar',
    bncc_exemplo: 'EF09MA06',
    conteudo_exemplo: `🚗 UBER vs. 99: A MATEMÁTICA DA CORRIDA

CONTEXTO REAL: Você vai sair com amigos e precisa decidir qual app usar.
Vamos usar FUNÇÕES para tomar a melhor decisão!

DADOS REAIS (valores aproximados):
- Uber: Taxa fixa R$ 5,00 + R$ 1,80 por km
- 99: Taxa fixa R$ 3,50 + R$ 2,20 por km

PARTE 1 — Modelagem (Construindo as funções)
a) Escreva a função f(x) que representa o custo do Uber, onde x = km rodados
b) Escreva a função g(x) que representa o custo da 99
c) Identifique: coeficiente angular, coeficiente linear e o significado de cada um

PARTE 2 — Análise Gráfica
a) Construa o gráfico das duas funções no mesmo plano cartesiano (de 0 a 20 km)
b) Marque o ponto de interseção das duas retas
c) O que esse ponto representa na prática?

PARTE 3 — Tomada de Decisão
a) Para uma corrida de 3 km, qual app é mais barato? Quanto você economiza?
b) Para uma corrida de 10 km, qual app compensa mais?
c) A partir de quantos km o Uber fica mais vantajoso que a 99?

PARTE 4 — Desafio do Mundo Real
Pesquise os preços reais do Uber e 99 na sua cidade e refaça os cálculos.
Os resultados mudam? Por quê?`,
    elementos_criativos: ['apps que os alunos usam', 'dados realistas', 'tomada de decisão', 'conexão com cotidiano', 'pesquisa complementar'],
    tags: ['funções', '1º grau', 'gráficos', 'cotidiano', 'tecnologia'],
  },

  {
    id: 'mat-geometria-minecraft',
    componente: 'Matemática',
    serie_range: ['6º ano', '7º ano', '8º ano'],
    tipo_atividade: 'atividade',
    titulo: 'Minecraft Matemático: Calculando Áreas e Volumes',
    gancho_criativo: 'Você é um arquiteto no Minecraft e precisa calcular áreas e volumes para construir estruturas épicas!',
    bloom_level: 'aplicar',
    bncc_exemplo: 'EF07MA30',
    conteudo_exemplo: `🎮 MINECRAFT MATEMÁTICO

MISSÃO: Você recebeu um terreno de 100×100 blocos para construir uma vila completa.
Cada bloco = 1 metro. Use geometria para planejar tudo!

CONSTRUÇÃO 1 — A Casa Base (Área)
Plante de 12m × 8m com 3 cômodos internos:
- Sala: retângulo de 6m × 8m
- Quarto: quadrado de 6m × 6m  
- Banheiro: retângulo de 6m × 2m
a) Calcule a área total da casa
b) A área dos 3 cômodos soma exatamente a área total? Se não, onde está a diferença?

CONSTRUÇÃO 2 — A Torre de Vigia (Volume)
Torre cilíndrica: raio = 3m, altura = 15m
a) Qual o volume interno da torre?
b) Se cada bloco de pedra ocupa 1m³, quantos blocos precisa para as paredes?

CONSTRUÇÃO 3 — A Piscina Épica (Volume e Capacidade)
Piscina formato L: parte rasa (8m×4m×1,5m) + parte funda (8m×4m×3m)
a) Qual o volume total de água necessário?
b) Se 1m³ = 1.000 litros, quantos litros ela comporta?

🏆 DESAFIO SUPREMO — O Estádio
Projete um estádio retangular com:
- Campo: 100m × 64m
- Arquibancada em formato de trapézio ao redor
Calcule a área das arquibancadas e quantos espectadores cabem (0,5m² por pessoa).`,
    elementos_criativos: ['Minecraft como contexto', 'construções progressivas', 'cálculos práticos', 'desafio supremo', 'conexão com jogos'],
    tags: ['geometria', 'área', 'volume', 'jogos', 'Minecraft'],
  },

  // ═══════════════════════════════════════════════════════════════
  // LÍNGUA PORTUGUESA
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'port-interpretacao-redes',
    componente: 'Língua Portuguesa',
    serie_range: ['8º ano', '9º ano', '1º ano EM', '1ª série EM'],
    tipo_atividade: 'prova',
    titulo: 'Detetive Digital: Interpretação de Textos da Internet',
    gancho_criativo: 'Analise textos reais de redes sociais, notícias e memes para desenvolver pensamento crítico e habilidades de interpretação!',
    bloom_level: 'analisar',
    bncc_exemplo: 'EF89LP02',
    conteudo_exemplo: `🔍 DETETIVE DIGITAL — Prova de Interpretação

TEXTO 1 — O Tweet Polêmico
"Todo mundo deveria parar de usar canudo plástico. Se cada pessoa fizesse isso,
eliminaríamos 500 milhões de canudos por dia. O planeta agradece! 🌍 #SalveOPlaneta"

a) Identifique a tese principal do texto (1,0 pt)
b) Qual estratégia argumentativa o autor usa? (dados numéricos, apelo emocional, etc.) (1,5 pt)
c) Pesquise: o dado "500 milhões de canudos por dia" é verificável? 
   Qual é a importância da checagem de fatos? (2,0 pt)

TEXTO 2 — A Notícia e a Manchete
Manchete: "ESTUDOS COMPROVAM: Videogame Torna Jovens Violentos"
Corpo da notícia: "Um estudo da Universidade X analisou 50 jovens e encontrou 
uma correlação de 0,15 entre horas jogadas e comportamento agressivo, resultado 
considerado estatisticamente insignificante pelos pesquisadores."

a) Compare a manchete com o conteúdo real da notícia. Há coerência? Explique. (2,0 pt)
b) Que técnica jornalística foi usada na manchete? Por quê? (1,5 pt)
c) Reescreva a manchete de forma que represente fielmente a pesquisa. (2,0 pt)

TEXTO 3 — O Meme como Gênero Textual
[Descrição do meme: Imagem dividida - lado esquerdo "O que a professora explicou" 
(imagem clara) vs lado direito "O que caiu na prova" (imagem impossível)]

a) Identifique os elementos do gênero textual "meme": linguagem, recursos visuais, 
   intertextualidade e público-alvo. (2,0 pt)
b) Que crítica social o meme faz? É uma crítica válida? Justifique. (1,5 pt)
c) Crie um meme (pode ser descrito em texto) sobre um tema escolar que use ironia. (1,5 pt)`,
    elementos_criativos: ['textos de redes sociais', 'fake news', 'memes como gênero textual', 'pensamento crítico', 'produção criativa'],
    tags: ['interpretação', 'redes sociais', 'pensamento crítico', 'fake news', 'memes'],
  },

  {
    id: 'port-redacao-enem-estrutura',
    componente: 'Língua Portuguesa',
    serie_range: ['1º ano EM', '2º ano EM', '3º ano EM', '1ª série EM', '2ª série EM', '3ª série EM', 'ENEM'],
    tipo_atividade: 'atividade',
    titulo: 'Laboratório de Redação ENEM — Construindo Nota 1000',
    gancho_criativo: 'Desmonte uma redação nota 1000 real, entenda cada engrenagem, e construa a sua usando a mesma estrutura!',
    bloom_level: 'criar',
    bncc_exemplo: 'EM13LP01',
    conteudo_exemplo: `📝 LABORATÓRIO DE REDAÇÃO ENEM

FASE 1 — Desmontando uma Nota 1000
Leia o trecho de abertura de uma redação nota máxima sobre "Democratização do acesso à internet":

"No filme 'O Dilema das Redes', a tecnologia digital é apresentada como uma faca de 
dois gumes: conecta, mas também exclui. De forma análoga, no Brasil, a democratização 
do acesso à internet permanece um desafio, visto que milhões de cidadãos seguem à 
margem da revolução digital, perpetuando desigualdades históricas."

ANÁLISE GUIADA:
- Repertório cultural: _________ (identifique)
- Tese: _________ (extraia em 1 frase)
- Conectivos usados: _________ (liste)
- Competência 3 (argumentação): como o autor conecta filme → realidade?

FASE 2 — Montando Peça por Peça
Tema proposto: "Os desafios para a valorização de comunidades tradicionais no Brasil"

Construa cada parágrafo seguindo o modelo:
- INTRODUÇÃO: Repertório cultural + contextualização + tese
- D1: Argumento 1 + comprovação + exemplificação
- D2: Argumento 2 + comprovação + exemplificação  
- CONCLUSÃO: Agente + ação + meio + finalidade + detalhamento

FASE 3 — Checklist de Qualidade
□ Repertório cultural legítimo e pertinente?
□ Tese clara e posicionada?
□ Cada D tem argumento + comprovação?
□ Proposta de intervenção com 5 elementos?
□ Coesão: cada parágrafo conecta ao anterior?`,
    elementos_criativos: ['análise de redação real nota 1000', 'construção passo a passo', 'checklist de qualidade', 'modelo estrutural', 'preparação ENEM'],
    tags: ['redação', 'ENEM', 'dissertação', 'argumentação', 'estrutura textual'],
  },

  // ═══════════════════════════════════════════════════════════════
  // CIÊNCIAS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'cie-celula-escape-room',
    componente: 'Ciências',
    serie_range: ['6º ano', '7º ano', '8º ano'],
    tipo_atividade: 'atividade',
    titulo: 'Escape Room Celular — Fuja da Célula!',
    gancho_criativo: 'Você foi miniaturizado e está preso dentro de uma célula! Resolva enigmas sobre cada organela para escapar!',
    bloom_level: 'aplicar',
    bncc_exemplo: 'EF06CI05',
    conteudo_exemplo: `🔬 ESCAPE ROOM CELULAR — FUJA DA CÉLULA!

NARRATIVA: O Professor Maluco encolheu você até o tamanho de uma molécula 
e te jogou dentro de uma célula animal! Para escapar, você precisa passar 
por 5 salas (organelas) e resolver o enigma de cada uma.

SALA 1 — O Portão da Membrana Plasmática 🚪
Você está na entrada. A membrana só deixa passar quem responde:
a) Qual modelo explica a estrutura da membrana? Desenhe.
b) Por que algumas substâncias passam e outras não?
c) CÓDIGO DA SALA: Primeira letra de cada resposta = senha

SALA 2 — A Usina de Energia (Mitocôndria) ⚡
Você entrou na mitocôndria. Está quente aqui!
a) Que processo acontece aqui? Escreva a equação simplificada.
b) Por que dizemos que a mitocôndria é a "usina" da célula?
c) ENIGMA: Se a célula precisa de mais energia, o que acontece com o número de mitocôndrias?

SALA 3 — A Biblioteca Central (Núcleo) 📚
O núcleo guarda toda a informação genética.
a) O que é DNA e qual sua função?
b) Diferença entre DNA e RNA em 3 pontos.
c) DESAFIO: Se o DNA contém a "receita" de proteínas, quem "cozinha" a receita?

SALA 4 — A Fábrica de Proteínas (Ribossomos) 🏭
a) Onde os ribossomos podem ser encontrados na célula?
b) Explique tradução em linguagem simples.
c) CÓDIGO FINAL: Monte a sequência correta do caminho DNA → RNA → Proteína

SALA 5 — A Saída (Complexo de Golgi) 📦
O Complexo de Golgi empacota e exporta. É sua saída!
a) Qual a função principal do Complexo de Golgi?
b) Compare com um centro de distribuição (Amazon, Mercado Livre).
c) ESCAPE! Desenhe o caminho completo que uma proteína faz desde o núcleo até sair da célula.

🏆 VOCÊ ESCAPOU? Some os códigos de cada sala para confirmar!`,
    elementos_criativos: ['escape room', 'narrativa de aventura', 'códigos secretos', 'analogias do cotidiano', 'progressão de dificuldade'],
    tags: ['célula', 'organelas', 'escape room', 'gamificação', 'biologia'],
  },

  {
    id: 'cie-ecossistema-reality',
    componente: 'Ciências',
    serie_range: ['7º ano', '8º ano', '9º ano'],
    tipo_atividade: 'atividade',
    titulo: 'Reality Show dos Ecossistemas — Quem Sobrevive?',
    gancho_criativo: 'Cada grupo representa um ser vivo em um ecossistema. Quem vai sobreviver às mudanças ambientais?',
    bloom_level: 'avaliar',
    bncc_exemplo: 'EF07CI07',
    conteudo_exemplo: `🌿 REALITY SHOW DOS ECOSSISTEMAS

FORMATO: Dinâmica em grupo (4-5 alunos por equipe)

SETUP: Cada equipe sorteia um ser vivo:
- Equipe Onça: Predador de topo
- Equipe Capivara: Herbívoro grande
- Equipe Sapo: Consumidor secundário
- Equipe Planta: Produtor (grama do cerrado)
- Equipe Fungo: Decompositor

RODADA 1 — Cadeia Alimentar Normal
Desenhem a teia alimentar do grupo. Quem come quem?
Cada equipe deve explicar seu papel ecológico.

RODADA 2 — DESASTRE AMBIENTAL (sorteie um)
🔥 Queimada destrói 70% da vegetação
💧 Seca severa de 3 meses
🏭 Poluição de rio próximo
🌡️ Aumento de 3°C na temperatura média

Cada equipe deve:
a) Explicar como o desastre afeta SEU ser vivo
b) Prever efeitos em cascata na teia alimentar
c) Propor uma adaptação ou estratégia de sobrevivência

RODADA 3 — JULGAMENTO
Todas as equipes votam: qual ser vivo tem MENOS chance de sobreviver? Por quê?
A equipe "eliminada" deve contra-argumentar.

REFLEXÃO FINAL:
- O que acontece quando um nível trófico desaparece?
- Como isso se relaciona com extinções reais no Brasil?
- Proposta: 3 ações concretas para proteger esse ecossistema`,
    elementos_criativos: ['reality show', 'dinâmica de grupo', 'cenários de crise', 'debate', 'votação', 'reflexão ambiental'],
    tags: ['ecossistema', 'cadeia alimentar', 'ecologia', 'grupo', 'debate'],
  },

  // ═══════════════════════════════════════════════════════════════
  // HISTÓRIA
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'hist-revolucao-podcast',
    componente: 'História',
    serie_range: ['8º ano', '9º ano', '1º ano EM', '1ª série EM'],
    tipo_atividade: 'atividade',
    titulo: 'Podcast Histórico — Entrevistando a Revolução Francesa',
    gancho_criativo: 'Crie um episódio de podcast onde você entrevista personagens da Revolução Francesa como se fosse ao vivo!',
    bloom_level: 'criar',
    bncc_exemplo: 'EF08HI04',
    conteudo_exemplo: `🎙️ PODCAST HISTÓRICO — REVOLUÇÃO FRANCESA AO VIVO

FORMATO: Roteiro de podcast (pode ser escrito ou gravado em áudio)

BRIEFING DO EPISÓDIO:
"Bem-vindos ao 'Viagem no Tempo FM'! Hoje estamos transmitindo AO VIVO 
de Paris, 14 de julho de 1789. A Bastilha acaba de ser tomada!"

TAREFA: Crie o roteiro completo do episódio com:

BLOCO 1 — Abertura (apresentador)
- Contextualize o momento histórico para o ouvinte moderno
- Use linguagem de podcast atual ("E aí, galera, vocês não vão acreditar...")

BLOCO 2 — Entrevista com Marie Antoinette
Perguntas obrigatórias:
a) "Majestade, o povo diz que está com fome. Qual sua resposta?"
b) "Como a senhora vê as acusações de gastos excessivos da corte?"
c) Crie 2 perguntas originais baseadas em fatos históricos reais

BLOCO 3 — Entrevista com Robespierre
Perguntas obrigatórias:
a) "Cidadão Robespierre, o que é o Terceiro Estado?"
b) "Liberdade, Igualdade, Fraternidade — isso vale para todos?"
c) Crie 2 perguntas sobre o Terror que está por vir

BLOCO 4 — Comentário do Historiador (VOCÊ)
Analise: O que a Revolução Francesa mudou no mundo?
Conecte com o Brasil: Como esses ideais chegaram aqui?

CRITÉRIOS DE AVALIAÇÃO:
✅ Precisão histórica dos fatos mencionados
✅ Criatividade na linguagem e formato
✅ Conexão passado-presente
✅ Referências a causas econômicas, sociais e políticas`,
    elementos_criativos: ['formato podcast', 'entrevista fictícia', 'linguagem jovem', 'conexão passado-presente', 'produção criativa'],
    tags: ['Revolução Francesa', 'podcast', 'entrevista', 'criatividade', 'análise histórica'],
  },

  {
    id: 'hist-escravidao-fontes',
    componente: 'História',
    serie_range: ['8º ano', '9º ano'],
    tipo_atividade: 'atividade',
    titulo: 'Detetive Histórico — Analisando Fontes sobre a Escravidão no Brasil',
    gancho_criativo: 'Como um historiador detetive, analise documentos reais da época da escravidão e descubra o que eles revelam e o que escondem!',
    bloom_level: 'analisar',
    bncc_exemplo: 'EF08HI19',
    conteudo_exemplo: `🔎 DETETIVE HISTÓRICO — FONTES DA ESCRAVIDÃO

DOCUMENTO 1 — Anúncio de Jornal (1850)
"Vende-se escravo, Benedito, 25 anos, sadio, bom carpinteiro, sem vícios.
Tratar na Rua do Comércio nº 45. Preço: 800$000 réis."

ANÁLISE GUIADA:
a) Que tipo de fonte histórica é essa? (primária/secundária)
b) Quais informações o anúncio revela sobre a sociedade da época?
c) O que significa tratar um ser humano como mercadoria? Que palavras revelam isso?
d) Compare com um anúncio de emprego atual. O que mudou? O que permanece?

DOCUMENTO 2 — Trecho da Lei Áurea (1888)
"Art. 1º — É declarada extinta desde a data desta Lei a instituição da escravidão no Brasil."

ANÁLISE CRÍTICA:
a) A Lei Áurea "libertou" os escravizados? Explique com argumentos.
b) O que NÃO está escrito na lei que deveria estar para garantir liberdade real?
c) Pesquise: o que aconteceu com os ex-escravizados no dia seguinte à abolição?

DOCUMENTO 3 — Dados Atuais (IBGE 2022)
"A renda média de pessoas negras no Brasil é 57% menor que a de pessoas brancas."

CONEXÃO HISTÓRICA:
a) Existe relação entre a escravidão e esses dados atuais? Argumente.
b) O que significa "dívida histórica"?
c) Proponha 3 políticas públicas que poderiam reduzir essa desigualdade.`,
    elementos_criativos: ['análise de fontes primárias', 'conexão passado-presente', 'dados atuais', 'pensamento crítico', 'proposta de ação'],
    tags: ['escravidão', 'fontes históricas', 'análise crítica', 'desigualdade', 'Brasil'],
  },

  // ═══════════════════════════════════════════════════════════════
  // GEOGRAFIA
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'geo-urbanizacao-simcity',
    componente: 'Geografia',
    serie_range: ['7º ano', '8º ano', '9º ano'],
    tipo_atividade: 'atividade',
    titulo: 'SimCity Brasileiro — Planejando a Cidade Ideal',
    gancho_criativo: 'Você é o prefeito de uma cidade brasileira em crescimento! Planeje a urbanização considerando todos os desafios reais!',
    bloom_level: 'criar',
    bncc_exemplo: 'EF07GE06',
    conteudo_exemplo: `🏙️ SIMCITY BRASILEIRO

CENÁRIO: Você foi eleito prefeito de "Nova Esperança", uma cidade de 50.000 
habitantes que vai DOBRAR de tamanho nos próximos 10 anos.

FASE 1 — Diagnóstico (Mapeamento)
Sua cidade tem:
- Centro antigo com infraestrutura precária
- Periferia em expansão sem saneamento
- Rio poluído cortando a cidade
- Área de preservação ambiental ao norte
- Zona industrial ao sul

Desenhe o mapa atual da cidade identificando cada zona.

FASE 2 — Planejamento Urbano
Para os 50.000 novos moradores, decida:
a) MORADIA: Onde construir novos bairros? Justifique evitando áreas de risco.
b) TRANSPORTE: Projete 2 linhas de transporte público. Por quê essas rotas?
c) SANEAMENTO: Como levar água e esgoto para as novas áreas?
d) ÁREAS VERDES: Quantos parques e onde? Use a proporção da OMS (12m²/habitante).

FASE 3 — Desafios do Prefeito
Escolha 2 e proponha soluções:
🌊 Enchentes no centro histórico
🗑️ Aterro sanitário lotado
🚗 Trânsito caótico na hora do rush
🏚️ Favelas em áreas de risco
🏭 Poluição industrial

FASE 4 — Prestação de Contas
Escreva um discurso de 1 parágrafo explicando suas decisões para a população.
Use dados e argumentos geográficos.`,
    elementos_criativos: ['SimCity como metáfora', 'role-playing de prefeito', 'decisões reais', 'mapeamento', 'múltiplos desafios'],
    tags: ['urbanização', 'planejamento urbano', 'cidade', 'simulação', 'decisões'],
  },

  // ═══════════════════════════════════════════════════════════════
  // ANOS INICIAIS (1º ao 5º ano)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'mat-operacoes-supermercado',
    componente: 'Matemática',
    serie_range: ['3º ano', '4º ano', '5º ano'],
    tipo_atividade: 'atividade',
    titulo: 'Supermercado da Turma — Comprando com Matemática',
    gancho_criativo: 'Monte seu próprio supermercado na sala e resolva problemas de adição, subtração e multiplicação com produtos reais!',
    bloom_level: 'aplicar',
    bncc_exemplo: 'EF04MA04',
    conteudo_exemplo: `🛒 SUPERMERCADO DA TURMA

PRODUTOS DISPONÍVEIS (recorte e cole no mural):
🍎 Maçã — R$ 2,00 cada
🥛 Leite — R$ 5,50 a caixa
🍞 Pão — R$ 8,00 o pacote
🧀 Queijo — R$ 3,50 a fatia
🍫 Chocolate — R$ 4,00 a barra
📒 Caderno — R$ 12,00
✏️ Lápis — R$ 1,50

MISSÃO 1 — Lista de Compras (Adição)
A mamãe pediu para comprar: 3 maçãs, 2 caixas de leite e 1 pacote de pão.
a) Quanto vai gastar? Monte a conta!
b) Se ela deu R$ 30,00, quanto recebe de troco?

MISSÃO 2 — A Festa da Turma (Multiplicação)
A turma tem 25 alunos e cada um vai ganhar 1 chocolate e 1 suco (R$ 3,00).
a) Quanto custa o chocolate para todos?
b) Quanto custa o suco para todos?
c) Quanto a professora vai gastar no total?

MISSÃO 3 — O Desafio do Troco
Você tem R$ 20,00. Compre O MÁXIMO de produtos diferentes que conseguir.
Escreva o que comprou e quanto sobrou.

🌟 DESAFIO ESTRELA
Se todos os produtos tivessem 50% de desconto (metade do preço), 
quanto custaria comprar 1 de cada?`,
    elementos_criativos: ['supermercado simulado', 'recorte e cole', 'problemas do cotidiano', 'desafio aberto', 'desconto como conceito'],
    tags: ['operações básicas', 'dinheiro', 'supermercado', 'anos iniciais', 'lúdico'],
  },

  {
    id: 'port-alfabetizacao-aventura',
    componente: 'Língua Portuguesa',
    serie_range: ['1º ano', '2º ano', '3º ano'],
    tipo_atividade: 'atividade',
    titulo: 'Aventura das Palavras — Caçada de Sílabas',
    gancho_criativo: 'Embarque numa aventura onde cada sílaba encontrada te leva mais perto do tesouro escondido!',
    bloom_level: 'entender',
    bncc_exemplo: 'EF02LP04',
    conteudo_exemplo: `🗺️ AVENTURA DAS PALAVRAS

MAPA DO TESOURO: Para encontrar o tesouro, complete todas as paradas!

PARADA 1 — Separando Sílabas
Separe as sílabas com palminhas (bata palmas para cada sílaba):
CA-SA = 2 palminhas ✋✋
a) BOLA = ___ palminhas → ___-___
b) CAVALO = ___ palminhas → ___-___-___
c) BORBOLETA = ___ palminhas → ___-___-___-___
d) ABACAXI = ___ palminhas → ___-___-___-___

PARADA 2 — Família de Palavras
Complete a família do BA-BE-BI-BO-BU:
BA___  (fruta amarela)
BO___  (brinquedo redondo)
BI___  (animal de duas rodas)
BU___  (animal que mia... ops! Que faz BUUU)

PARADA 3 — Palavras Escondidas
Encontre as palavras dentro de palavras maiores:
SOLDADO → SOL + DADO
GIRASSOL → _____ + _____
CHUVEIRO → _____ + _____

PARADA 4 — Forme a Frase!
Use as palavras que encontrou para escrever UMA frase:
Palavras: SOL, CASA, BOLA, GATO
Minha frase: ________________________________

🏆 TESOURO ENCONTRADO!
Desenhe o que você imaginou como tesouro e escreva o nome!`,
    elementos_criativos: ['mapa do tesouro', 'palminhas como recurso', 'palavras escondidas', 'desenho', 'progressão lúdica'],
    tags: ['alfabetização', 'sílabas', 'anos iniciais', 'lúdico', 'tesouro'],
  },

  // ═══════════════════════════════════════════════════════════════
  // INTERDISCIPLINARES E ESPECIAIS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'inter-sustentabilidade-tribunal',
    componente: 'Ciências',
    serie_range: ['8º ano', '9º ano', '1º ano EM', '1ª série EM'],
    tipo_atividade: 'atividade',
    titulo: 'Tribunal da Sustentabilidade — Julgando o Plástico',
    gancho_criativo: 'O plástico está sendo julgado por crimes contra o meio ambiente! Você é advogado de acusação ou defesa?',
    bloom_level: 'avaliar',
    bncc_exemplo: 'EF09CI13',
    conteudo_exemplo: `⚖️ TRIBUNAL DA SUSTENTABILIDADE

O RÉU: O Plástico
A ACUSAÇÃO: Crimes contra o meio ambiente e a saúde pública
A DEFESA: Contribuições indispensáveis para a sociedade moderna

PREPARAÇÃO (em grupos):

EQUIPE ACUSAÇÃO — Encontre evidências de que o plástico é prejudicial:
- Dados sobre poluição dos oceanos
- Microplásticos na cadeia alimentar
- Tempo de decomposição
- Impacto na fauna marinha
- Prepare 3 "testemunhas" (cientistas, ambientalistas, animais marinhos)

EQUIPE DEFESA — Encontre argumentos a favor do plástico:
- Usos essenciais na medicina (seringas, próteses)
- Conservação de alimentos (reduz desperdício)
- Leveza no transporte (menor emissão de CO²)
- Custo acessível
- Prepare 3 "testemunhas" (engenheiros, médicos, economistas)

EQUIPE JÚRI — Critérios de avaliação:
□ Qualidade das evidências apresentadas
□ Capacidade de contra-argumentar
□ Proposta de "sentença" equilibrada
□ Viabilidade das soluções sugeridas

O JULGAMENTO:
1. Acusação apresenta (5 min)
2. Defesa apresenta (5 min)
3. Réplica e tréplica (3 min cada)
4. Júri delibera e anuncia o veredito

SENTENÇA: O júri deve propor uma "sentença" que equilibre uso responsável com proteção ambiental.`,
    elementos_criativos: ['tribunal simulado', 'debate estruturado', 'múltiplas perspectivas', 'role-playing', 'sentença criativa'],
    tags: ['sustentabilidade', 'debate', 'plástico', 'meio ambiente', 'tribunal'],
  },

  {
    id: 'inter-fake-news-investigacao',
    componente: 'Língua Portuguesa',
    serie_range: ['7º ano', '8º ano', '9º ano', '1º ano EM', '1ª série EM'],
    tipo_atividade: 'atividade',
    titulo: 'Agência de Checagem — Combatendo Fake News',
    gancho_criativo: 'Você é jornalista de uma agência de checagem de fatos! Investigue notícias e descubra quais são verdadeiras e quais são fake!',
    bloom_level: 'avaliar',
    bncc_exemplo: 'EF09LP01',
    conteudo_exemplo: `📰 AGÊNCIA DE CHECAGEM — OPERAÇÃO VERDADE

MISSÃO: Você faz parte da equipe de checagem do "Fato ou Fake". 
Analise cada notícia e classifique como VERDADEIRA, FALSA ou PARCIALMENTE VERDADEIRA.

NOTÍCIA 1:
"Cientistas descobrem que beber 2 litros de água por dia cura qualquer doença"
📋 Sua investigação:
a) Classificação: ( ) Verdadeira ( ) Falsa ( ) Parcialmente verdadeira
b) Que palavras na manchete são suspeitas? Por quê?
c) Como você verificaria essa informação? Liste 3 fontes confiáveis.

NOTÍCIA 2:
"Brasil é o país com maior biodiversidade do mundo, abrigando cerca de 20% de todas as espécies conhecidas"
📋 Sua investigação:
a) Classificação: ( ) Verdadeira ( ) Falsa ( ) Parcialmente verdadeira
b) Esse dado pode ser verificado? Onde?
c) Qual a diferença entre essa notícia e a anterior em termos de linguagem?

NOTÍCIA 3:
"Vacinas causam autismo, revela estudo bombástico de médico famoso"
📋 Sua investigação:
a) Classificação e justificativa
b) Pesquise: qual estudo originou essa fake news? O que aconteceu com o autor?
c) Por que esse tipo de desinformação é perigoso?

MANUAL DO CHECADOR — 5 Passos:
1. Leia além da manchete
2. Verifique a fonte original
3. Procure em sites de checagem (Aos Fatos, Lupa, Agência Pública)
4. Desconfie de linguagem sensacionalista
5. Dados sem fonte = bandeira vermelha

PRODUÇÃO FINAL:
Crie sua própria "notícia falsa" sobre um tema escolar e troque com um colega para ele checar!`,
    elementos_criativos: ['agência de checagem', 'investigação real', 'manual prático', 'criação de fake news educativa', 'pensamento crítico'],
    tags: ['fake news', 'checagem de fatos', 'mídia', 'pensamento crítico', 'interdisciplinar'],
  },

  // ═══════════════════════════════════════════════════════════════
  // MODELOS DE CAÇA-PALAVRAS, BINGO, CRUZADINHA
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'cie-caca-palavras-corpo',
    componente: 'Ciências',
    serie_range: ['4º ano', '5º ano', '6º ano'],
    tipo_atividade: 'caça-palavras',
    titulo: 'Caça-Palavras do Corpo Humano — Missão Médica',
    gancho_criativo: 'Você é um médico em treinamento! Encontre os órgãos e sistemas escondidos para completar seu atlas anatômico!',
    bloom_level: 'lembrar',
    bncc_exemplo: 'EF05CI06',
    conteudo_exemplo: `🏥 CAÇA-PALAVRAS — MISSÃO MÉDICA

Encontre 12 palavras sobre o corpo humano na grade abaixo.
Para cada palavra encontrada, escreva sua função no "Atlas Médico"!

PALAVRAS PARA ENCONTRAR:
CORAÇÃO — PULMÃO — CÉREBRO — ESTÔMAGO — FÍGADO — RIM
INTESTINO — MÚSCULO — OSSO — SANGUE — NERVOS — PELE

[Grade 15x15 com as palavras em horizontal, vertical e diagonal]

📋 MEU ATLAS MÉDICO:
Para cada palavra encontrada, complete:

CORAÇÃO → Sistema: ____________ | Função: ____________
PULMÃO → Sistema: ____________ | Função: ____________
CÉREBRO → Sistema: ____________ | Função: ____________
(continue para todas as 12 palavras)

🏆 DESAFIO BÔNUS:
Agrupe os órgãos por sistema:
- Sistema Digestório: _______________
- Sistema Circulatório: _______________
- Sistema Nervoso: _______________
- Sistema Respiratório: _______________`,
    elementos_criativos: ['médico em treinamento', 'atlas médico', 'classificação por sistema', 'desafio bônus', 'aprendizagem ativa'],
    tags: ['corpo humano', 'caça-palavras', 'órgãos', 'sistemas', 'lúdico'],
  },

  {
    id: 'mat-bingo-tabuada',
    componente: 'Matemática',
    serie_range: ['3º ano', '4º ano', '5º ano'],
    tipo_atividade: 'bingo',
    titulo: 'Bingo da Tabuada — Campeonato da Turma',
    gancho_criativo: 'Competição de bingo onde as cartelas são preenchidas com resultados da tabuada! Quem marca mais rápido, ganha!',
    bloom_level: 'lembrar',
    bncc_exemplo: 'EF04MA04',
    conteudo_exemplo: `🎯 BINGO DA TABUADA — CAMPEONATO DA TURMA

COMO JOGAR:
1. Cada aluno recebe uma cartela 5x5 com números aleatórios
2. O professor sorteia uma CONTA (ex: "7 × 8")
3. Quem tiver o RESULTADO (56) na cartela, marca!
4. Primeiro a completar uma linha/coluna/diagonal grita "BINGO!"

CARTELA MODELO (recorte e distribua):
┌────┬────┬────┬────┬────┐
│ 12 │ 35 │ 48 │  9 │ 72 │
├────┼────┼────┼────┼────┤
│ 56 │ 24 │ ⭐ │ 42 │ 18 │
├────┼────┼────┼────┼────┤
│ 63 │ 81 │ 30 │ 15 │ 54 │
├────┼────┼────┼────┼────┤
│  8 │ 45 │ 27 │ 64 │ 36 │
├────┼────┼────┼────┼────┤
│ 21 │ 16 │ 49 │  6 │ 40 │
└────┴────┴────┴────┴────┘
(⭐ = espaço livre)

CONTAS PARA SORTEAR (Professor):
Tabuada do 3: 3×1, 3×2, ..., 3×9
Tabuada do 4: 4×1, 4×2, ..., 4×9
Tabuada do 5: 5×1, 5×2, ..., 5×9
Tabuada do 6: 6×1, 6×2, ..., 6×9
Tabuada do 7: 7×1, 7×2, ..., 7×9
Tabuada do 8: 8×1, 8×2, ..., 8×9
Tabuada do 9: 9×1, 9×2, ..., 9×9

💡 DICA: Imprima 6 cartelas diferentes para a turma!

🏆 PREMIAÇÃO:
1º lugar: Estrela dourada
2º lugar: Estrela prateada
3º lugar: Estrela de bronze`,
    elementos_criativos: ['campeonato', 'cartelas recortáveis', 'premiação', 'competição saudável', 'tabuada gamificada'],
    tags: ['tabuada', 'bingo', 'multiplicação', 'jogo', 'competição'],
  },

  // ═══════════════════════════════════════════════════════════════
  // PLANOS DE AULA
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'plan-aula-modelo',
    componente: 'Ciências',
    serie_range: ['6º ano', '7º ano'],
    tipo_atividade: 'plano_de_aula',
    titulo: 'Plano de Aula — Ciclo da Água (Modelo Gold Standard)',
    gancho_criativo: 'Aula investigativa onde os alunos constroem um terrário para observar o ciclo da água em miniatura!',
    bloom_level: 'aplicar',
    bncc_exemplo: 'EF06CI03',
    conteudo_exemplo: `📋 PLANO DE AULA — CICLO DA ÁGUA

DADOS DA AULA:
Componente: Ciências | Série: 6º ano | Duração: 50 min
BNCC: EF06CI03 — Selecionar argumentos que justifiquem a importância da água

═══ ABERTURA (10 min) ═══
🎯 Pergunta disparadora: "De onde vem a água que sai da torneira?"
- Chuva de ideias no quadro (mapa mental coletivo)
- Vídeo curto (2 min): time-lapse de nuvens se formando
- Transição: "Vocês sabiam que a água que vocês bebem hoje é a MESMA 
  que os dinossauros bebiam há 65 milhões de anos?"

═══ DESENVOLVIMENTO (30 min) ═══

MOMENTO 1 — Experimento do Terrário (15 min)
Materiais: garrafa PET 2L, terra, plantas pequenas, água, filme plástico
Passo a passo:
1. Coloque terra até 1/3 da garrafa
2. Plante as mudas
3. Regue levemente
4. Cubra com filme plástico
5. Coloque no sol

DURANTE O EXPERIMENTO, os alunos registram no caderno:
- Previsão: O que vai acontecer nas próximas horas?
- Observação: Descreva o que vê (gotículas, vapor, etc.)
- Conexão: Qual processo do ciclo da água está acontecendo?

MOMENTO 2 — Sistematização (15 min)
- Diagrama do ciclo da água (evaporação → condensação → precipitação → infiltração)
- Cada grupo apresenta suas observações
- Professor conecta observações com conceitos científicos

═══ FECHAMENTO (10 min) ═══
- Exit ticket: "Desenhe o ciclo da água e inclua 1 ação humana que o afeta"
- Tarefa: Fotografar o terrário amanhã e comparar com hoje
- Conexão com próxima aula: "Semana que vem vamos investigar o que 
  acontece quando a água é poluída"

AVALIAÇÃO:
□ Participação no experimento (formativa)
□ Registro no caderno (processual)
□ Exit ticket (diagnóstica)
□ Terrário como portfólio (somativa)

MATERIAIS NECESSÁRIOS:
- 1 garrafa PET 2L por grupo (pedir aos alunos na aula anterior)
- Terra (trazer em saco)
- Mudas pequenas (pode ser feijão germinado)
- Filme plástico
- Água`,
    elementos_criativos: ['experimento hands-on', 'pergunta disparadora', 'exit ticket', 'conexão com próxima aula', 'múltiplas avaliações'],
    tags: ['plano de aula', 'ciclo da água', 'experimento', 'investigação', 'terrário'],
  },

  // ═══════════════════════════════════════════════════════════════
  // INGLÊS
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'eng-spotify-playlist',
    componente: 'Inglês',
    serie_range: ['7º ano', '8º ano', '9º ano'],
    tipo_atividade: 'atividade',
    titulo: 'Spotify Classroom — Music & English',
    gancho_criativo: 'Crie uma playlist temática no Spotify e aprenda inglês através das letras das suas músicas favoritas!',
    bloom_level: 'criar',
    bncc_exemplo: 'EF08LI08',
    conteudo_exemplo: `🎵 SPOTIFY CLASSROOM — MUSIC & ENGLISH

MISSION: Create a themed playlist and learn English through music!

STEP 1 — Choose Your Theme
Pick ONE topic for your playlist (5 songs minimum):
□ Love & Relationships
□ Dreams & Motivation
□ Social Issues
□ Party & Fun
□ Nature & Environment

STEP 2 — Song Analysis (pick 2 songs)
For each song, complete:

SONG: _______________
ARTIST: _______________

a) VOCABULARY HUNT: Find 5 new words. Write:
   Word — Translation — Sentence from the song

b) GRAMMAR SPOT: Find examples of:
   - 1 verb in Simple Present
   - 1 verb in Simple Past
   - 1 verb in Present Continuous

c) MEANING: What is the song about? Write 3 sentences in English.

STEP 3 — Create Your Playlist Description
Write a short description IN ENGLISH (50-80 words):
"This playlist is about ___. I chose these songs because ___. 
My favorite is ___ by ___ because ___."

STEP 4 — Presentation
Present your playlist to the class:
- Play 30 seconds of your favorite song
- Explain the theme in English
- Teach 3 new words to your classmates

🏆 BONUS: Create a collaborative class playlist on Spotify!`,
    elementos_criativos: ['Spotify como ferramenta', 'música real', 'análise de letras', 'apresentação oral', 'playlist colaborativa'],
    tags: ['inglês', 'música', 'vocabulário', 'gramática', 'Spotify'],
  },

  // ═══════════════════════════════════════════════════════════════
  // ARTE
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'art-meme-arte',
    componente: 'Arte',
    serie_range: ['6º ano', '7º ano', '8º ano', '9º ano'],
    tipo_atividade: 'atividade',
    titulo: 'Meme é Arte? — Releitura Digital',
    gancho_criativo: 'Transforme obras de arte famosas em memes e descubra como a arte se reinventa na era digital!',
    bloom_level: 'criar',
    bncc_exemplo: 'EF69AR01',
    conteudo_exemplo: `🎨 MEME É ARTE? — RELEITURA DIGITAL

PARTE 1 — Análise de Obras Clássicas
Observe as obras abaixo e responda para cada uma:

OBRA 1: "O Grito" — Edvard Munch (1893)
a) Que emoção a obra transmite?
b) Quais elementos visuais criam essa emoção? (cores, formas, linhas)
c) Por que essa obra virou um dos memes mais famosos do mundo?

OBRA 2: "Mona Lisa" — Leonardo da Vinci (1503)
a) O que torna o sorriso da Mona Lisa tão misterioso?
b) Quais técnicas Leonardo usou? (sfumato, perspectiva)
c) Encontre 3 versões de memes com a Mona Lisa na internet.

PARTE 2 — Meme como Gênero Artístico
Debate: Meme é arte? Argumente a favor OU contra.
Considere:
- Criatividade necessária para criar um bom meme
- Alcance e impacto social (mais que muitas obras em museus)
- Autoria e originalidade
- Linguagem visual + textual = multimodal

PARTE 3 — Criação: Sua Releitura
Escolha UMA obra de arte famosa e crie 2 versões:
a) Releitura clássica: Recrie a obra com materiais disponíveis (colagem, desenho, foto)
b) Releitura digital: Transforme a obra em um meme sobre a vida escolar

CRITÉRIOS:
✅ Mantém elementos visuais reconhecíveis da obra original
✅ Adiciona humor ou crítica social
✅ Demonstra compreensão da obra original
✅ Criatividade na adaptação`,
    elementos_criativos: ['memes como arte', 'debate', 'releitura clássica e digital', 'conexão com cultura jovem', 'produção artística'],
    tags: ['arte', 'memes', 'releitura', 'cultura digital', 'criatividade'],
  },

  // ═══════════════════════════════════════════════════════════════
  // EDUCAÇÃO FÍSICA
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'edf-olimpiadas-matematica',
    componente: 'Educação Física',
    serie_range: ['5º ano', '6º ano', '7º ano'],
    tipo_atividade: 'atividade',
    titulo: 'Olimpíadas Matemáticas — Corpo e Mente em Ação',
    gancho_criativo: 'Uma gincana que mistura exercícios físicos com desafios matemáticos — para correr E pensar ao mesmo tempo!',
    bloom_level: 'aplicar',
    bncc_exemplo: 'EF67EF01',
    conteudo_exemplo: `🏅 OLIMPÍADAS MATEMÁTICAS — CORPO + MENTE

ORGANIZAÇÃO: 4-5 equipes de 5-6 alunos

ESTAÇÃO 1 — Corrida das Operações (5 min)
- Aluno corre até o quadro (20m)
- Resolve uma conta (adição/multiplicação)
- Volta correndo e passa o bastão
- Equipe que resolver mais contas corretas vence!

ESTAÇÃO 2 — Pular Corda com Tabuada (5 min)
- Enquanto pula, o aluno responde tabuada
- Cada resposta certa = 1 ponto
- Se errar, passa para o próximo
- Equipe com mais pontos vence!

ESTAÇÃO 3 — Basquete Fracionário (5 min)
- Cesta de 2 pontos = fração 2/10 do total
- Cesta de 3 pontos = fração 3/10 do total
- No final, cada equipe calcula que fração do total de arremessos converteu

ESTAÇÃO 4 — Circuito Geométrico (5 min)
- Estação A: Polichinelos formando ângulos (braços = 90°, 180°, 45°)
- Estação B: Corrida em formato de triângulo/quadrado/hexágono
- Estação C: Medir perímetro da quadra usando passos

PLACAR FINAL:
Equipe que somar mais pontos em todas as estações = Campeã Olímpica!

MATERIAIS: Cones, bolas de basquete, cordas, quadro branco portátil, cronômetro`,
    elementos_criativos: ['interdisciplinar (EF + Mat)', 'estações rotativas', 'exercício + raciocínio', 'competição por equipes', 'gincana'],
    tags: ['educação física', 'interdisciplinar', 'gincana', 'matemática', 'corpo e mente'],
  },
];

// ═══════════════════════════════════════════════════════════════
// SELETOR INTELIGENTE DE EXEMPLOS (Few-Shot)
// ═══════════════════════════════════════════════════════════════

export function selectGoldExamples(
  componente?: string | null,
  serie?: string | null,
  tipoAtividade?: string | null,
  temas?: string[],
  maxExamples: number = 2
): GoldStandardExample[] {
  let candidates = [...GOLD_EXAMPLES];

  if (componente) {
    const byComponent = candidates.filter(e => 
      e.componente.toLowerCase() === componente.toLowerCase()
    );
    if (byComponent.length > 0) {
      candidates = byComponent;
    }
  }

  if (serie) {
    const bySerie = candidates.filter(e =>
      e.serie_range.some(s => serie.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(serie.toLowerCase()))
    );
    if (bySerie.length > 0) {
      candidates = bySerie;
    }
  }

  if (tipoAtividade) {
    const normalizedTipo = tipoAtividade.toLowerCase();
    const byType = candidates.filter(e => {
      const eTipo = e.tipo_atividade.toLowerCase();
      return eTipo === normalizedTipo || 
             normalizedTipo.includes(eTipo) || 
             eTipo.includes(normalizedTipo);
    });
    if (byType.length > 0) {
      candidates = byType;
    }
  }

  if (temas && temas.length > 0) {
    const scored = candidates.map(example => {
      const tagScore = example.tags.filter(tag =>
        temas.some(tema => 
          tema.toLowerCase().includes(tag.toLowerCase()) || 
          tag.toLowerCase().includes(tema.toLowerCase())
        )
      ).length;
      return { example, score: tagScore };
    });
    scored.sort((a, b) => b.score - a.score);
    candidates = scored.map(s => s.example);
  }

  const bloomLevels: Array<GoldStandardExample['bloom_level']> = ['lembrar', 'entender', 'aplicar', 'analisar', 'avaliar', 'criar'];
  const selected: GoldStandardExample[] = [];
  const usedBlooms = new Set<string>();

  for (const candidate of candidates) {
    if (selected.length >= maxExamples) break;
    if (!usedBlooms.has(candidate.bloom_level) || selected.length < 1) {
      selected.push(candidate);
      usedBlooms.add(candidate.bloom_level);
    }
  }

  if (selected.length < maxExamples) {
    for (const candidate of candidates) {
      if (selected.length >= maxExamples) break;
      if (!selected.includes(candidate)) {
        selected.push(candidate);
      }
    }
  }

  if (selected.length === 0 && GOLD_EXAMPLES.length > 0) {
    const randomIndex = Math.floor(Math.random() * GOLD_EXAMPLES.length);
    selected.push(GOLD_EXAMPLES[randomIndex]);
    if (GOLD_EXAMPLES.length > 1) {
      let secondIndex = (randomIndex + Math.floor(GOLD_EXAMPLES.length / 2)) % GOLD_EXAMPLES.length;
      selected.push(GOLD_EXAMPLES[secondIndex]);
    }
  }

  return selected.slice(0, maxExamples);
}

export function formatExamplesForPrompt(examples: GoldStandardExample[]): string {
  if (examples.length === 0) return '';

  const sections: string[] = [];
  sections.push('═══════════════════════════════════════════════════════════════');
  sections.push('📚 EXEMPLOS DE REFERÊNCIA (GOLD STANDARD) — Siga este padrão de qualidade!');
  sections.push('═══════════════════════════════════════════════════════════════');
  sections.push('');
  sections.push('Os exemplos abaixo representam o PADRÃO OURO de qualidade.');
  sections.push('Use-os como referência para: criatividade, engajamento, formatação e profundidade pedagógica.');
  sections.push('NÃO copie — inspire-se e crie algo AINDA MELHOR e ESPECÍFICO para o pedido do professor.');
  sections.push('');

  for (let i = 0; i < examples.length; i++) {
    const ex = examples[i];
    sections.push(`──── EXEMPLO ${i + 1}: "${ex.titulo}" ────`);
    sections.push(`Componente: ${ex.componente} | Série: ${ex.serie_range.join(', ')} | Bloom: ${ex.bloom_level}`);
    sections.push(`Gancho criativo: ${ex.gancho_criativo}`);
    sections.push(`Elementos que tornam este exemplo excelente: ${ex.elementos_criativos.join(', ')}`);
    sections.push('');
    sections.push('CONTEÚDO DE REFERÊNCIA:');
    sections.push(ex.conteudo_exemplo.substring(0, 1500));
    sections.push('');
    sections.push(`[Fim do Exemplo ${i + 1}]`);
    sections.push('');
  }

  sections.push('═══════════════════════════════════════════════════════════════');
  sections.push('AGORA, gere conteúdo com ESTE nível de qualidade ou SUPERIOR.');
  sections.push('Lembre-se: gancho criativo + cenário do mundo real + formatação profissional.');
  sections.push('═══════════════════════════════════════════════════════════════');

  return sections.join('\n');
}

export function getExampleCount(): number {
  return GOLD_EXAMPLES.length;
}

export function getAvailableComponents(): string[] {
  return [...new Set(GOLD_EXAMPLES.map(e => e.componente))];
}

export default { selectGoldExamples, formatExamplesForPrompt, getExampleCount, getAvailableComponents };
