/**
 * BNCC REFERENCE MODULE - Referência de Habilidades da BNCC
 * 
 * Módulo centralizado com habilidades REAIS da Base Nacional Comum Curricular (BNCC)
 * organizadas por componente curricular e ano/série.
 * 
 * Usado pelos Quality Prompt Templates para garantir alinhamento curricular
 * REAL nas atividades geradas pelo Jota.
 * 
 * Fonte: Base Nacional Comum Curricular (MEC, 2018)
 * http://basenacionalcomum.mec.gov.br/
 */

export interface BNCCHabilidade {
  codigo: string;
  descricao: string;
  objetoConhecimento: string;
}

export interface BNCCComponente {
  nome: string;
  habilidades: Record<string, BNCCHabilidade[]>;
}

export const BNCC_HABILIDADES: Record<string, BNCCComponente> = {
  'Matemática': {
    nome: 'Matemática',
    habilidades: {
      '1º Ano': [
        { codigo: 'EF01MA01', descricao: 'Utilizar números naturais como indicador de quantidade ou de ordem em diferentes situações cotidianas', objetoConhecimento: 'Contagem e comparação de quantidades' },
        { codigo: 'EF01MA02', descricao: 'Contar de maneira exata ou aproximada, utilizando diferentes estratégias como o pareamento', objetoConhecimento: 'Contagem e comparação de quantidades' },
        { codigo: 'EF01MA05', descricao: 'Comparar números naturais de até duas ordens em situações cotidianas', objetoConhecimento: 'Contagem e comparação de quantidades' },
      ],
      '2º Ano': [
        { codigo: 'EF02MA01', descricao: 'Comparar e ordenar números naturais (até a ordem de centenas) pela compreensão de características do sistema de numeração decimal', objetoConhecimento: 'Leitura, escrita, comparação e ordenação de números' },
        { codigo: 'EF02MA05', descricao: 'Construir fatos básicos da adição e subtração e utilizá-los no cálculo mental ou escrito', objetoConhecimento: 'Construção de fatos fundamentais da adição e subtração' },
        { codigo: 'EF02MA06', descricao: 'Resolver e elaborar problemas de adição e de subtração, envolvendo números de até três ordens', objetoConhecimento: 'Problemas envolvendo diferentes significados da adição e da subtração' },
      ],
      '3º Ano': [
        { codigo: 'EF03MA01', descricao: 'Ler, escrever e comparar números naturais de até a ordem de unidade de milhar', objetoConhecimento: 'Leitura, escrita, comparação e ordenação de números naturais' },
        { codigo: 'EF03MA05', descricao: 'Utilizar diferentes procedimentos de cálculo mental e escrito para resolver problemas significativos', objetoConhecimento: 'Procedimentos de cálculo (mental e escrito)' },
        { codigo: 'EF03MA07', descricao: 'Resolver e elaborar problemas de multiplicação pela adição de parcelas iguais', objetoConhecimento: 'Significados da multiplicação e da divisão' },
      ],
      '4º Ano': [
        { codigo: 'EF04MA01', descricao: 'Ler, escrever e ordenar números naturais até a ordem de dezenas de milhar', objetoConhecimento: 'Sistema de numeração decimal' },
        { codigo: 'EF04MA04', descricao: 'Utilizar as relações entre adição e subtração, bem como entre multiplicação e divisão, para ampliar as estratégias de cálculo', objetoConhecimento: 'Propriedades das operações' },
        { codigo: 'EF04MA09', descricao: 'Reconhecer as frações unitárias mais usuais (1/2, 1/3, 1/4, 1/5, 1/10 e 1/100) como unidades de medida menores do que uma unidade', objetoConhecimento: 'Números racionais: frações unitárias' },
      ],
      '5º Ano': [
        { codigo: 'EF05MA01', descricao: 'Ler, escrever e ordenar números naturais até a ordem das centenas de milhar com compreensão das principais características do sistema de numeração decimal', objetoConhecimento: 'Sistema de numeração decimal' },
        { codigo: 'EF05MA03', descricao: 'Identificar e representar frações (menores e maiores que a unidade), associando-as ao resultado de uma divisão ou à ideia de parte de um todo', objetoConhecimento: 'Representação fracionária dos números racionais' },
        { codigo: 'EF05MA07', descricao: 'Resolver e elaborar problemas de adição e subtração com números naturais e com números racionais, cuja representação decimal seja finita', objetoConhecimento: 'Problemas: adição e subtração de números naturais e números racionais' },
        { codigo: 'EF05MA08', descricao: 'Resolver e elaborar problemas de multiplicação e divisão com números naturais e com números racionais cuja representação decimal é finita', objetoConhecimento: 'Problemas de multiplicação e divisão com números racionais' },
      ],
      '6º Ano': [
        { codigo: 'EF06MA01', descricao: 'Comparar, ordenar, ler e escrever números naturais e números racionais cuja representação decimal é finita, fazendo uso da reta numérica', objetoConhecimento: 'Sistema de numeração decimal' },
        { codigo: 'EF06MA02', descricao: 'Reconhecer o sistema de numeração decimal como o que prevaleceu no mundo ocidental', objetoConhecimento: 'Sistema de numeração decimal' },
        { codigo: 'EF06MA03', descricao: 'Resolver e elaborar problemas que envolvam cálculos (mentais ou escritos, exatos ou aproximados) com números naturais', objetoConhecimento: 'Operações com números naturais' },
        { codigo: 'EF06MA04', descricao: 'Construir algoritmo em linguagem natural para resolver situações-problema', objetoConhecimento: 'Operações com números naturais' },
        { codigo: 'EF06MA05', descricao: 'Classificar números naturais em primos e compostos', objetoConhecimento: 'Números primos e compostos' },
        { codigo: 'EF06MA07', descricao: 'Compreender, comparar e ordenar frações associadas às ideias de partes de inteiros e resultado de divisão', objetoConhecimento: 'Operações com frações' },
        { codigo: 'EF06MA09', descricao: 'Resolver e elaborar problemas que envolvam o cálculo da fração de uma quantidade e cujo resultado seja um número natural', objetoConhecimento: 'Operações com números racionais' },
        { codigo: 'EF06MA13', descricao: 'Resolver e elaborar problemas que envolvam porcentagens, com base na ideia de proporcionalidade', objetoConhecimento: 'Cálculo de porcentagens' },
        { codigo: 'EF06MA14', descricao: 'Reconhecer que a relação de igualdade matemática não se altera ao adicionar, subtrair, multiplicar ou dividir os seus dois membros por um mesmo número', objetoConhecimento: 'Propriedades da igualdade' },
        { codigo: 'EF06MA16', descricao: 'Associar pares ordenados de números a pontos do plano cartesiano do 1º quadrante', objetoConhecimento: 'Plano cartesiano' },
        { codigo: 'EF06MA18', descricao: 'Reconhecer, nomear e comparar polígonos, considerando lados, vértices e ângulos', objetoConhecimento: 'Polígonos' },
      ],
      '7º Ano': [
        { codigo: 'EF07MA01', descricao: 'Resolver e elaborar problemas com números naturais, envolvendo as noções de divisor e de múltiplo', objetoConhecimento: 'Múltiplos e divisores de um número natural' },
        { codigo: 'EF07MA04', descricao: 'Resolver e elaborar problemas que envolvam operações com números inteiros', objetoConhecimento: 'Números inteiros' },
        { codigo: 'EF07MA09', descricao: 'Utilizar, na resolução de problemas, a associação entre razão e fração', objetoConhecimento: 'Fração e seus significados' },
        { codigo: 'EF07MA12', descricao: 'Resolver e elaborar problemas que envolvam as operações com números racionais', objetoConhecimento: 'Operações com números racionais' },
        { codigo: 'EF07MA13', descricao: 'Compreender a ideia de variável, representada por letra ou símbolo, para expressar relação entre duas grandezas', objetoConhecimento: 'Linguagem algébrica' },
        { codigo: 'EF07MA14', descricao: 'Classificar sequências em recursivas e com fórmulas de seus termos', objetoConhecimento: 'Sequências numéricas' },
        { codigo: 'EF07MA15', descricao: 'Utilizar a simbologia algébrica para expressar regularidades encontradas em sequências numéricas', objetoConhecimento: 'Expressões algébricas' },
        { codigo: 'EF07MA16', descricao: 'Reconhecer se duas expressões algébricas obtidas para descrever a regularidade de uma mesma sequência numérica são ou não equivalentes', objetoConhecimento: 'Equivalência de expressões algébricas' },
        { codigo: 'EF07MA17', descricao: 'Resolver e elaborar problemas envolvendo equações do 1º grau', objetoConhecimento: 'Equações polinomiais do 1º grau' },
        { codigo: 'EF07MA18', descricao: 'Resolver e elaborar problemas que possam ser representados por equações polinomiais de 1º grau, redutíveis à forma ax + b = c', objetoConhecimento: 'Equações polinomiais do 1º grau' },
      ],
      '8º Ano': [
        { codigo: 'EF08MA01', descricao: 'Efetuar cálculos com potências de expoentes inteiros e aplicar esse conhecimento na representação de números em notação científica', objetoConhecimento: 'Potenciação e radiciação' },
        { codigo: 'EF08MA06', descricao: 'Resolver e elaborar problemas que envolvam cálculo do valor numérico de expressões algébricas', objetoConhecimento: 'Valor numérico de expressões algébricas' },
        { codigo: 'EF08MA07', descricao: 'Associar uma equação linear de 1º grau com duas incógnitas a uma reta no plano cartesiano', objetoConhecimento: 'Equação linear no plano cartesiano' },
        { codigo: 'EF08MA08', descricao: 'Resolver e elaborar problemas relacionados ao seu contexto próximo, que possam ser representados por equações polinomiais de 2º grau, redutíveis a equações de 1º grau', objetoConhecimento: 'Equações polinomiais do 1º grau' },
        { codigo: 'EF08MA09', descricao: 'Resolver e elaborar, com e sem uso de tecnologias, problemas que possam ser representados por equações polinomiais de 2º grau do tipo ax² = b', objetoConhecimento: 'Equações polinomiais do 2º grau' },
        { codigo: 'EF08MA10', descricao: 'Identificar a regularidade de uma sequência numérica ou figural não recursiva e construir um algoritmo para determinar qualquer termo', objetoConhecimento: 'Sequências não recursivas' },
        { codigo: 'EF08MA11', descricao: 'Identificar a regularidade de uma sequência numérica recursiva e construir um algoritmo por meio de um fluxograma', objetoConhecimento: 'Sequências recursivas' },
        { codigo: 'EF08MA12', descricao: 'Identificar a natureza da variação de duas grandezas, diretamente, inversamente proporcionais ou não proporcionais', objetoConhecimento: 'Variação de grandezas' },
      ],
      '9º Ano': [
        { codigo: 'EF09MA01', descricao: 'Reconhecer que, uma vez fixada uma unidade de comprimento, existem segmentos de reta cujo comprimento não é expresso por número racional', objetoConhecimento: 'Necessidade dos números reais' },
        { codigo: 'EF09MA02', descricao: 'Reconhecer um número irracional como um número real cuja representação decimal é infinita e não periódica', objetoConhecimento: 'Números irracionais' },
        { codigo: 'EF09MA03', descricao: 'Efetuar cálculos com números reais, inclusive potências com expoentes fracionários', objetoConhecimento: 'Operações com números reais' },
        { codigo: 'EF09MA04', descricao: 'Resolver e elaborar problemas com números reais, envolvendo notação científica, e compreender sua necessidade em representar números muito grandes ou muito pequenos', objetoConhecimento: 'Notação científica' },
        { codigo: 'EF09MA05', descricao: 'Resolver e elaborar problemas que envolvam porcentagens, com a ideia de aplicação de percentuais sucessivos e determinação de taxas percentuais', objetoConhecimento: 'Porcentagens e juros' },
        { codigo: 'EF09MA06', descricao: 'Compreender as funções como relações de dependência unívoca entre duas variáveis e suas representações numérica, algébrica e gráfica', objetoConhecimento: 'Funções' },
        { codigo: 'EF09MA07', descricao: 'Resolver problemas que envolvam a razão entre duas grandezas de espécies diferentes, como velocidade e densidade demográfica', objetoConhecimento: 'Razão entre grandezas' },
        { codigo: 'EF09MA08', descricao: 'Resolver e elaborar problemas que envolvam relações de proporcionalidade direta e inversa entre duas ou mais grandezas', objetoConhecimento: 'Proporcionalidade direta e inversa' },
        { codigo: 'EF09MA09', descricao: 'Compreender os processos de fatoração de expressões algébricas, com base em suas relações com os produtos notáveis', objetoConhecimento: 'Expressões algébricas' },
        { codigo: 'EF09MA10', descricao: 'Demonstrar relações simples entre os ângulos formados por retas paralelas cortadas por uma transversal', objetoConhecimento: 'Retas paralelas cortadas por transversais' },
        { codigo: 'EF09MA13', descricao: 'Demonstrar relações métricas do triângulo retângulo, entre elas o teorema de Pitágoras, utilizando, inclusive, a semelhança de triângulos', objetoConhecimento: 'Teorema de Pitágoras' },
        { codigo: 'EF09MA14', descricao: 'Resolver e elaborar problemas de aplicação do teorema de Pitágoras ou das relações de proporcionalidade envolvendo retas paralelas cortadas por secantes', objetoConhecimento: 'Relações métricas e teorema de Pitágoras' },
        { codigo: 'EF09MA19', descricao: 'Resolver e elaborar problemas que envolvam medidas de volumes de prismas e de cilindros retos', objetoConhecimento: 'Volume de prismas e cilindros' },
      ],
    }
  },

  'Língua Portuguesa': {
    nome: 'Língua Portuguesa',
    habilidades: {
      '1º Ano': [
        { codigo: 'EF01LP01', descricao: 'Reconhecer que textos são lidos e escritos da esquerda para a direita e de cima para baixo da página', objetoConhecimento: 'Protocolos de leitura' },
        { codigo: 'EF01LP05', descricao: 'Reconhecer o sistema de escrita alfabética como representação dos sons da fala', objetoConhecimento: 'Conhecimento do alfabeto' },
      ],
      '2º Ano': [
        { codigo: 'EF02LP01', descricao: 'Utilizar, ao produzir o texto, grafia correta de palavras conhecidas ou com estruturas silábicas já dominadas', objetoConhecimento: 'Construção do sistema alfabético' },
        { codigo: 'EF02LP03', descricao: 'Ler e escrever palavras com correspondências regulares diretas entre letras e fonemas', objetoConhecimento: 'Correspondência fonema-grafema' },
        { codigo: 'EF02LP04', descricao: 'Ler e escrever, corretamente, palavras com sílabas CV, V, CVC, CCV, VC, VV, CVV', objetoConhecimento: 'Estruturas silábicas' },
      ],
      '3º Ano': [
        { codigo: 'EF03LP01', descricao: 'Ler e escrever palavras com correspondências regulares contextuais entre grafemas e fonemas', objetoConhecimento: 'Correspondência fonema-grafema contextual' },
        { codigo: 'EF03LP04', descricao: 'Usar acento gráfico (agudo ou circunflexo) em monossílabos tônicos terminados em a, e, o e em oxítonas terminadas em a, e, o', objetoConhecimento: 'Acentuação' },
        { codigo: 'EF03LP07', descricao: 'Identificar a função na leitura e usar na escrita ponto final, ponto de interrogação, ponto de exclamação e, em diálogos, dois-pontos e travessão', objetoConhecimento: 'Pontuação' },
      ],
      '4º Ano': [
        { codigo: 'EF04LP01', descricao: 'Grafar palavras utilizando regras de correspondência fonema-grafema regulares diretas e contextuais', objetoConhecimento: 'Construção do sistema alfabético e da ortografia' },
        { codigo: 'EF04LP15', descricao: 'Distinguir fatos de opiniões/sugestões em textos informativos, jornalísticos e publicitários', objetoConhecimento: 'Compreensão em leitura' },
      ],
      '5º Ano': [
        { codigo: 'EF05LP01', descricao: 'Grafar palavras utilizando regras de correspondência fonema-grafema regulares, contextuais e morfológicas e palavras de uso frequente com correspondências irregulares', objetoConhecimento: 'Construção do sistema alfabético e da ortografia' },
        { codigo: 'EF05LP15', descricao: 'Ler/assistir e compreender, com autonomia, notícias, reportagens, vídeos em vlogs argumentativos, dentre outros gêneros do campo da vida pública', objetoConhecimento: 'Compreensão em leitura' },
      ],
      '6º Ano': [
        { codigo: 'EF06LP01', descricao: 'Reconhecer a impossibilidade de uma tradução totalmente fiel entre textos orais e escritos e atuação em situações formais', objetoConhecimento: 'Variação linguística' },
        { codigo: 'EF06LP02', descricao: 'Estabelecer relação entre diferentes gêneros jornalísticos, compreendendo a centralidade da notícia', objetoConhecimento: 'Gêneros jornalísticos' },
        { codigo: 'EF06LP03', descricao: 'Analisar diferenças de sentido entre palavras de uma série sinonímica', objetoConhecimento: 'Sinonímia e antonímia' },
        { codigo: 'EF06LP04', descricao: 'Analisar a função e as flexões de substantivos e adjetivos e de verbos nos modos Indicativo, Subjuntivo e Imperativo', objetoConhecimento: 'Morfologia' },
        { codigo: 'EF06LP05', descricao: 'Identificar os efeitos de sentido dos modos verbais, considerando o gênero textual e a intenção comunicativa', objetoConhecimento: 'Modos verbais' },
        { codigo: 'EF06LP06', descricao: 'Empregar, adequadamente, as regras de concordância nominal (relação entre adjetivos e substantivos)', objetoConhecimento: 'Concordância nominal' },
        { codigo: 'EF06LP11', descricao: 'Utilizar, ao produzir texto, conhecimentos linguísticos e gramaticais: tempos verbais, concordância nominal e verbal, regras ortográficas, pontuação', objetoConhecimento: 'Sintaxe' },
        { codigo: 'EF67LP28', descricao: 'Ler, de forma autônoma, e compreender textos literários de diferentes gêneros e extensões, inclusive aqueles sem ilustrações', objetoConhecimento: 'Estratégias de leitura' },
      ],
      '7º Ano': [
        { codigo: 'EF07LP01', descricao: 'Distinguir diferentes propostas editoriais – informação e opinião – ao comparar notícias de diferentes fontes', objetoConhecimento: 'Propostas editoriais' },
        { codigo: 'EF07LP02', descricao: 'Comparar notícias e reportagens sobre um mesmo fato divulgadas em diferentes mídias', objetoConhecimento: 'Análise de mídias' },
        { codigo: 'EF07LP04', descricao: 'Reconhecer, em textos, o verbo como o núcleo das orações', objetoConhecimento: 'Morfossintaxe' },
        { codigo: 'EF07LP06', descricao: 'Empregar as regras básicas de concordância nominal e verbal em situações comunicativas e na produção de textos', objetoConhecimento: 'Concordância nominal e verbal' },
        { codigo: 'EF07LP10', descricao: 'Utilizar, ao produzir texto, conhecimentos linguísticos e gramaticais: modos e tempos verbais, concordância nominal e verbal', objetoConhecimento: 'Produção textual' },
        { codigo: 'EF07LP12', descricao: 'Reconhecer recursos de coesão referencial: substituições lexicais ou pronominais', objetoConhecimento: 'Coesão referencial' },
        { codigo: 'EF07LP14', descricao: 'Identificar, em textos, os efeitos de sentido do uso de estratégias de modalização e argumentatividade', objetoConhecimento: 'Modalização' },
        { codigo: 'EF67LP28', descricao: 'Ler, de forma autônoma, e compreender textos literários de diferentes gêneros e extensões', objetoConhecimento: 'Estratégias de leitura' },
      ],
      '8º Ano': [
        { codigo: 'EF08LP01', descricao: 'Identificar e comparar as diferentes posições (perspectivas, opiniões) veiculadas em textos argumentativos', objetoConhecimento: 'Textos argumentativos' },
        { codigo: 'EF08LP02', descricao: 'Justificar diferenças ou semelhanças no tratamento dado a uma mesma informação em textos de diferentes mídias e gêneros', objetoConhecimento: 'Análise comparativa de mídias' },
        { codigo: 'EF08LP04', descricao: 'Utilizar, ao produzir texto, conhecimentos linguísticos e gramaticais: ortografia, regências e concordâncias nominal e verbal, modos e tempos verbais, pontuação', objetoConhecimento: 'Fono-ortografia' },
        { codigo: 'EF08LP05', descricao: 'Analisar processos de formação de palavras por composição (aglutinação e justaposição) por derivação (prefixação, sufixação, parassintetismo, derivação regressiva e derivação imprópria)', objetoConhecimento: 'Formação de palavras' },
        { codigo: 'EF08LP06', descricao: 'Identificar, em textos lidos ou de produção própria, os termos constitutivos da oração (sujeito e seus modificadores, verbo e seus complementos e modificadores)', objetoConhecimento: 'Análise sintática' },
        { codigo: 'EF08LP14', descricao: 'Utilizar, ao produzir texto, recursos de coesão sequencial e referencial, bem como de concordância, regência e vozes verbais', objetoConhecimento: 'Coesão' },
        { codigo: 'EF89LP33', descricao: 'Ler, de forma autônoma, e compreender textos literários de diferentes gêneros e extensões, inclusive obras da tradição literária', objetoConhecimento: 'Estratégias de leitura' },
      ],
      '9º Ano': [
        { codigo: 'EF09LP01', descricao: 'Analisar o fenômeno da disseminação de notícias falsas nas redes sociais e desenvolver estratégias para reconhecê-las', objetoConhecimento: 'Fake news e letramento midiático' },
        { codigo: 'EF09LP02', descricao: 'Analisar e comparar, com base em seleção prévia, peças publicitárias variadas de campanhas sociais, políticas ou institucionais', objetoConhecimento: 'Análise de publicidade' },
        { codigo: 'EF09LP03', descricao: 'Produzir artigos de opinião, tendo em vista o contexto de produção dado, a defesa de um ponto de vista, utilizando argumentos e contra-argumentos', objetoConhecimento: 'Produção de artigos de opinião' },
        { codigo: 'EF09LP04', descricao: 'Escrever textos corretamente, de acordo com a norma-padrão, com estruturas sintáticas complexas no nível da oração e do período', objetoConhecimento: 'Fono-ortografia' },
        { codigo: 'EF09LP05', descricao: 'Identificar, em textos lidos e em produções próprias, orações com a estrutura sujeito-verbo de ligação-predicativo', objetoConhecimento: 'Análise sintática' },
        { codigo: 'EF09LP07', descricao: 'Comparar o uso de regência verbal e regência nominal na norma-padrão com seu uso no português brasileiro coloquial oral', objetoConhecimento: 'Regência verbal e nominal' },
        { codigo: 'EF09LP11', descricao: 'Inferir efeitos de sentido decorrentes do uso de recursos de coesão sequencial, da implicitude de informações e de estratégias argumentativas', objetoConhecimento: 'Efeitos de sentido' },
        { codigo: 'EF89LP33', descricao: 'Ler, de forma autônoma, e compreender textos literários de diferentes gêneros e extensões', objetoConhecimento: 'Estratégias de leitura' },
      ],
    }
  },

  'Ciências': {
    nome: 'Ciências',
    habilidades: {
      '3º Ano': [
        { codigo: 'EF03CI01', descricao: 'Produzir diferentes sons a partir da vibração de variados objetos e identificar variáveis que influem nesse fenômeno', objetoConhecimento: 'Produção de som' },
        { codigo: 'EF03CI04', descricao: 'Identificar características sobre o modo de vida dos animais (hábitat, alimentação, período de atividade)', objetoConhecimento: 'Características e desenvolvimento dos animais' },
      ],
      '4º Ano': [
        { codigo: 'EF04CI02', descricao: 'Testar e relatar transformações nos materiais do dia a dia quando expostos a diferentes condições', objetoConhecimento: 'Transformações reversíveis e não reversíveis' },
        { codigo: 'EF04CI05', descricao: 'Descrever e destacar semelhanças e diferenças entre o ciclo da matéria e o fluxo de energia entre os componentes vivos e não vivos de um ecossistema', objetoConhecimento: 'Cadeias alimentares simples' },
      ],
      '5º Ano': [
        { codigo: 'EF05CI01', descricao: 'Explorar fenômenos da vida cotidiana que evidenciem propriedades físicas dos materiais', objetoConhecimento: 'Propriedades físicas dos materiais' },
        { codigo: 'EF05CI06', descricao: 'Selecionar argumentos que justifiquem por que os sistemas digestório e respiratório são considerados corresponsáveis pelo processo de nutrição do organismo', objetoConhecimento: 'Nutrição do organismo' },
      ],
      '6º Ano': [
        { codigo: 'EF06CI01', descricao: 'Classificar como homogênea ou heterogênea a mistura de dois ou mais materiais', objetoConhecimento: 'Misturas homogêneas e heterogêneas' },
        { codigo: 'EF06CI02', descricao: 'Identificar evidências de transformações químicas a partir do resultado de misturas de materiais', objetoConhecimento: 'Transformações químicas' },
        { codigo: 'EF06CI03', descricao: 'Selecionar métodos mais adequados para a separação de diferentes sistemas heterogêneos', objetoConhecimento: 'Separação de misturas' },
        { codigo: 'EF06CI04', descricao: 'Associar a produção de medicamentos e outros materiais sintéticos ao desenvolvimento científico e tecnológico', objetoConhecimento: 'Materiais sintéticos' },
        { codigo: 'EF06CI05', descricao: 'Explicar a organização básica das células e seu papel como unidade estrutural e funcional dos seres vivos', objetoConhecimento: 'Célula como unidade da vida' },
        { codigo: 'EF06CI06', descricao: 'Concluir, com base na análise de ilustrações e/ou modelos, que os organismos são um complexo arranjo de sistemas com diferentes níveis de organização', objetoConhecimento: 'Níveis de organização dos seres vivos' },
        { codigo: 'EF06CI07', descricao: 'Justificar o papel do sistema nervoso na coordenação das ações motoras e sensoriais do corpo', objetoConhecimento: 'Sistema nervoso' },
        { codigo: 'EF06CI08', descricao: 'Explicar a importância da visão na interação do organismo com o meio e selecionar lentes adequadas para correção de defeitos da visão', objetoConhecimento: 'Interação do organismo com o meio' },
        { codigo: 'EF06CI09', descricao: 'Deduzir que a estrutura, sustentação e movimentação dos animais resultam da interação entre os sistemas muscular, ósseo e nervoso', objetoConhecimento: 'Sistemas muscular, ósseo e nervoso' },
        { codigo: 'EF06CI10', descricao: 'Explicar como o funcionamento do sistema nervoso pode ser afetado por substâncias psicoativas', objetoConhecimento: 'Substâncias psicoativas' },
        { codigo: 'EF06CI11', descricao: 'Identificar as diferentes camadas que estruturam o planeta Terra e suas principais características', objetoConhecimento: 'Estrutura da Terra' },
        { codigo: 'EF06CI12', descricao: 'Identificar diferentes tipos de rocha, relacionando a formação de fósseis a rochas sedimentares', objetoConhecimento: 'Tipos de rochas e fósseis' },
        { codigo: 'EF06CI13', descricao: 'Selecionar argumentos e evidências que demonstrem a esfericidade da Terra', objetoConhecimento: 'Forma da Terra' },
        { codigo: 'EF06CI14', descricao: 'Inferir que as mudanças na sombra de uma vara ao longo do dia são evidência dos movimentos relativos', objetoConhecimento: 'Movimentos da Terra' },
      ],
      '7º Ano': [
        { codigo: 'EF07CI01', descricao: 'Discutir a aplicação, ao longo da história, das máquinas simples e propor soluções e invenções para a realização de tarefas mecânicas cotidianas', objetoConhecimento: 'Máquinas simples' },
        { codigo: 'EF07CI02', descricao: 'Diferenciar temperatura, calor e sensação térmica nas diferentes situações de equilíbrio termodinâmico cotidianas', objetoConhecimento: 'Temperatura, calor e sensação térmica' },
        { codigo: 'EF07CI03', descricao: 'Utilizar o conhecimento das formas de propagação do calor para justificar a utilização de determinados materiais em diferentes contextos', objetoConhecimento: 'Propagação do calor' },
        { codigo: 'EF07CI04', descricao: 'Avaliar o papel do equilíbrio termodinâmico para a manutenção da vida na Terra', objetoConhecimento: 'Equilíbrio termodinâmico e vida na Terra' },
        { codigo: 'EF07CI05', descricao: 'Discutir o uso de diferentes tipos de combustível e máquinas térmicas ao longo do tempo', objetoConhecimento: 'Combustíveis e máquinas térmicas' },
        { codigo: 'EF07CI06', descricao: 'Discutir e avaliar mudanças econômicas, culturais e sociais, tanto na vida cotidiana quanto no mundo do trabalho, decorrentes do desenvolvimento de novos materiais e tecnologias', objetoConhecimento: 'História dos combustíveis e das máquinas térmicas' },
        { codigo: 'EF07CI07', descricao: 'Caracterizar os principais ecossistemas brasileiros quanto à paisagem, à quantidade de água, ao tipo de solo, à disponibilidade de luz solar', objetoConhecimento: 'Ecossistemas brasileiros' },
        { codigo: 'EF07CI08', descricao: 'Avaliar como os impactos provocados por catástrofes naturais ou mudanças nos componentes físicos de um ecossistema afetam suas populações', objetoConhecimento: 'Impactos em ecossistemas' },
        { codigo: 'EF07CI09', descricao: 'Interpretar as condições de saúde da comunidade, cidade ou estado, com base na análise de indicadores de saúde', objetoConhecimento: 'Indicadores de saúde' },
        { codigo: 'EF07CI10', descricao: 'Argumentar sobre a importância da vacinação para a saúde pública', objetoConhecimento: 'Vacinação e saúde pública' },
        { codigo: 'EF07CI12', descricao: 'Demonstrar que o ar é uma mistura de gases, identificando sua composição, e discutir fenômenos naturais ou antrópicos que podem alterar essa composição', objetoConhecimento: 'Composição do ar' },
        { codigo: 'EF07CI13', descricao: 'Descrever o mecanismo natural do efeito estufa, seu papel fundamental para o desenvolvimento da vida na Terra, discutir as ações humanas responsáveis pelo seu aumento artificial', objetoConhecimento: 'Efeito estufa' },
        { codigo: 'EF07CI14', descricao: 'Justificar a importância da camada de ozônio para a vida na Terra, identificando os fatores que aumentam ou diminuem sua presença na atmosfera', objetoConhecimento: 'Camada de ozônio' },
        { codigo: 'EF07CI15', descricao: 'Interpretar fenômenos naturais (como vulcões, terremotos e tsunamis) e justificá-los com base no modelo das placas tectônicas', objetoConhecimento: 'Placas tectônicas' },
      ],
      '8º Ano': [
        { codigo: 'EF08CI01', descricao: 'Identificar e classificar diferentes fontes (renováveis e não renováveis) e tipos de energia utilizados em residências, comunidades ou cidades', objetoConhecimento: 'Fontes e tipos de energia' },
        { codigo: 'EF08CI02', descricao: 'Construir circuitos elétricos com pilha/bateria, fios e lâmpada ou outros dispositivos e compará-los a circuitos elétricos residenciais', objetoConhecimento: 'Circuitos elétricos' },
        { codigo: 'EF08CI03', descricao: 'Classificar equipamentos elétricos residenciais (chuveiro, ferro, lâmpadas, TV) de acordo com o tipo de transformação de energia', objetoConhecimento: 'Transformação de energia' },
        { codigo: 'EF08CI04', descricao: 'Calcular o consumo de eletrodomésticos a partir dos dados de potência (watts) e tempo de uso (horas)', objetoConhecimento: 'Consumo de energia elétrica' },
        { codigo: 'EF08CI05', descricao: 'Propor ações coletivas para otimizar o uso de energia elétrica em sua escola e/ou comunidade', objetoConhecimento: 'Uso consciente de energia' },
        { codigo: 'EF08CI06', descricao: 'Discutir e avaliar usinas de geração de energia elétrica, considerando o tipo de energia utilizada, os impactos socioambientais causados e a disponibilidade do recurso', objetoConhecimento: 'Usinas de geração de energia' },
        { codigo: 'EF08CI07', descricao: 'Comparar diferentes processos reprodutivos em plantas e animais em relação aos mecanismos adaptativos e evolutivos', objetoConhecimento: 'Mecanismos reprodutivos' },
        { codigo: 'EF08CI08', descricao: 'Analisar e explicar as transformações que ocorrem na puberdade considerando a atuação dos hormônios sexuais e do sistema nervoso', objetoConhecimento: 'Puberdade e sistema reprodutor' },
        { codigo: 'EF08CI09', descricao: 'Comparar o modo de ação e eficácia dos diversos métodos contraceptivos e justificar a necessidade de compartilhar a responsabilidade na escolha e utilização', objetoConhecimento: 'Métodos contraceptivos' },
        { codigo: 'EF08CI10', descricao: 'Identificar os principais sintomas, modos de transmissão e tratamento de algumas DST (com ênfase na AIDS)', objetoConhecimento: 'Doenças sexualmente transmissíveis' },
        { codigo: 'EF08CI11', descricao: 'Selecionar argumentos que evidenciem as múltiplas dimensões da sexualidade humana (biológica, sociocultural, afetiva e ética)', objetoConhecimento: 'Sexualidade humana' },
        { codigo: 'EF08CI12', descricao: 'Justificar, por meio da construção de modelos e da observação da Lua no céu, a ocorrência das fases da Lua e dos eclipses', objetoConhecimento: 'Fases da Lua e eclipses' },
        { codigo: 'EF08CI13', descricao: 'Representar os movimentos de rotação e translação da Terra e analisar o papel da inclinação do eixo de rotação da Terra na alternância das estações do ano', objetoConhecimento: 'Rotação, translação e estações do ano' },
        { codigo: 'EF08CI14', descricao: 'Relacionar climas regionais aos padrões de circulação atmosférica e oceânica e ao aquecimento desigual', objetoConhecimento: 'Climas regionais' },
        { codigo: 'EF08CI15', descricao: 'Identificar as principais variáveis envolvidas na previsão do tempo e simular situações nas quais elas variem', objetoConhecimento: 'Previsão do tempo' },
        { codigo: 'EF08CI16', descricao: 'Discutir iniciativas que contribuam para restabelecer o equilíbrio ambiental a partir da identificação de alterações climáticas regionais e globais', objetoConhecimento: 'Alterações climáticas e equilíbrio ambiental' },
      ],
      '9º Ano': [
        { codigo: 'EF09CI01', descricao: 'Investigar as mudanças de estado físico da matéria e explicar essas transformações com base no modelo de constituição submicroscópica', objetoConhecimento: 'Aspectos quantitativos das transformações químicas' },
        { codigo: 'EF09CI02', descricao: 'Comparar quantidades de reagentes e produtos envolvidos em transformações químicas, estabelecendo a proporção entre suas massas', objetoConhecimento: 'Proporção entre massas em reações químicas' },
        { codigo: 'EF09CI03', descricao: 'Identificar modelos que descrevem a estrutura da matéria (constituição do átomo e composição de moléculas simples) e reconhecer sua evolução histórica', objetoConhecimento: 'Estrutura da matéria e modelos atômicos' },
        { codigo: 'EF09CI04', descricao: 'Planejar e executar experimentos que evidenciem que todas as cores de luz podem ser formadas pela composição das três cores primárias da luz', objetoConhecimento: 'Estrutura da matéria' },
        { codigo: 'EF09CI05', descricao: 'Investigar os principais mecanismos envolvidos na transmissão e recepção de imagem e som que revolucionaram os sistemas de comunicação humana', objetoConhecimento: 'Sistemas de comunicação' },
        { codigo: 'EF09CI06', descricao: 'Classificar as radiações eletromagnéticas por suas frequências, fontes e aplicações, discutindo e avaliando implicações de seu uso', objetoConhecimento: 'Radiações e suas aplicações' },
        { codigo: 'EF09CI07', descricao: 'Discutir o papel do avanço tecnológico na aplicação das radiações na medicina diagnóstica e no tratamento de doenças', objetoConhecimento: 'Radiações na medicina' },
        { codigo: 'EF09CI08', descricao: 'Associar os gametas à transmissão das características hereditárias, estabelecendo relações entre ancestrais e descendentes', objetoConhecimento: 'Hereditariedade' },
        { codigo: 'EF09CI09', descricao: 'Discutir as ideias de Mendel sobre hereditariedade (fatores hereditários, segregação, gametas, fecundação), comparando-as com as de outros cientistas', objetoConhecimento: 'Leis de Mendel' },
        { codigo: 'EF09CI10', descricao: 'Comparar as ideias evolucionistas de Lamarck e Darwin apresentadas em textos científicos e históricos', objetoConhecimento: 'Ideias evolucionistas' },
        { codigo: 'EF09CI11', descricao: 'Discutir a evolução e a diversidade das espécies com base na atuação da seleção natural sobre as variantes de uma mesma espécie', objetoConhecimento: 'Seleção natural e evolução' },
        { codigo: 'EF09CI12', descricao: 'Justificar a importância das unidades de conservação para preservação da biodiversidade e do patrimônio nacional', objetoConhecimento: 'Unidades de conservação' },
        { codigo: 'EF09CI13', descricao: 'Propor iniciativas individuais e coletivas para a solução de problemas ambientais da cidade ou da comunidade', objetoConhecimento: 'Problemas ambientais' },
        { codigo: 'EF09CI14', descricao: 'Descrever a composição e a estrutura do Sistema Solar (Sol, planetas rochosos, planetas gigantes gasosos e corpos menores)', objetoConhecimento: 'Sistema Solar' },
        { codigo: 'EF09CI15', descricao: 'Relacionar diferentes leituras do céu e explicações sobre a origem da Terra, do Sol ou do Sistema Solar às necessidades de distintas culturas', objetoConhecimento: 'Astronomia e cultura' },
        { codigo: 'EF09CI16', descricao: 'Selecionar argumentos sobre a viabilidade da sobrevivência humana fora da Terra, com base nas condições necessárias à vida', objetoConhecimento: 'Vida fora da Terra' },
        { codigo: 'EF09CI17', descricao: 'Analisar o ciclo evolutivo do Sol (nascimento, vida e morte) baseado no conhecimento das etapas de evolução de estrelas de diferentes dimensões', objetoConhecimento: 'Evolução estelar' },
      ],
    }
  },

  'História': {
    nome: 'História',
    habilidades: {
      '4º Ano': [
        { codigo: 'EF04HI01', descricao: 'Reconhecer a história como resultado da ação do ser humano no tempo e no espaço, com base na identificação de mudanças e permanências ao longo do tempo', objetoConhecimento: 'Transformações e permanências' },
        { codigo: 'EF04HI03', descricao: 'Identificar as transformações ocorridas na cidade ao longo do tempo e discutir suas interferências nos modos de vida de seus habitantes', objetoConhecimento: 'O passado e o presente' },
      ],
      '5º Ano': [
        { codigo: 'EF05HI01', descricao: 'Identificar os processos de formação das culturas e dos povos, relacionando-os com o espaço geográfico ocupado', objetoConhecimento: 'Povos e culturas' },
        { codigo: 'EF05HI03', descricao: 'Analisar o papel das culturas e das religiões na composição identitária dos povos antigos', objetoConhecimento: 'O papel das religiões e da cultura' },
      ],
      '6º Ano': [
        { codigo: 'EF06HI01', descricao: 'Identificar diferentes formas de compreensão da noção de tempo e de periodização dos processos históricos', objetoConhecimento: 'A questão do tempo em História' },
        { codigo: 'EF06HI02', descricao: 'Identificar a gênese da produção do saber histórico e analisar o significado das fontes que originaram determinadas formas de registro em sociedades e épocas distintas', objetoConhecimento: 'Fontes históricas' },
        { codigo: 'EF06HI03', descricao: 'Identificar as hipóteses científicas sobre o surgimento da espécie humana e sua historicidade e analisar os significados dos mitos de fundação', objetoConhecimento: 'Surgimento da espécie humana' },
        { codigo: 'EF06HI06', descricao: 'Identificar geograficamente as rotas de povoamento no território americano', objetoConhecimento: 'Povoamento da América' },
        { codigo: 'EF06HI07', descricao: 'Identificar aspectos e formas de registro das sociedades antigas na África, no Oriente Médio e nas Américas', objetoConhecimento: 'As origens da humanidade' },
        { codigo: 'EF06HI08', descricao: 'Identificar os espaços territoriais ocupados e os aportes culturais, científicos, sociais e econômicos dos astecas, maias e incas', objetoConhecimento: 'Povos pré-colombianos' },
        { codigo: 'EF06HI09', descricao: 'Discutir o conceito de Antiguidade Clássica, seu alcance e limite na tradição ocidental', objetoConhecimento: 'Antiguidade Clássica' },
        { codigo: 'EF06HI14', descricao: 'Identificar e analisar diferentes formas de contato, adaptação ou exclusão entre populações em diferentes tempos e espaços', objetoConhecimento: 'Lógicas de organização política' },
      ],
      '7º Ano': [
        { codigo: 'EF07HI01', descricao: 'Explicar o significado de "modernidade" e suas lógicas de inclusão e exclusão, com base em uma concepção europeia', objetoConhecimento: 'O mundo moderno e a conexão entre sociedades africanas, americanas e europeias' },
        { codigo: 'EF07HI02', descricao: 'Identificar conexões e interações entre as sociedades do Novo Mundo, da Europa, da África e da Ásia no contexto das navegações e indicar a complexidade e as interações que ocorrem nos Oceanos Atlântico, Índico e Pacífico', objetoConhecimento: 'Grandes navegações' },
        { codigo: 'EF07HI03', descricao: 'Identificar aspectos e processos específicos das sociedades africanas e americanas antes da chegada dos europeus', objetoConhecimento: 'Sociedades africanas e americanas pré-coloniais' },
        { codigo: 'EF07HI04', descricao: 'Identificar as principais características dos humanismos e dos renascimentos e analisar seus significados', objetoConhecimento: 'Humanismo e Renascimento' },
        { codigo: 'EF07HI06', descricao: 'Comparar as navegações no Atlântico e no Pacífico entre os séculos XIV e XVI', objetoConhecimento: 'Navegações atlânticas e pacíficas' },
        { codigo: 'EF07HI09', descricao: 'Analisar os diferentes impactos da conquista europeia da América para as populações ameríndias e identificar as formas de resistência', objetoConhecimento: 'A conquista da América e as formas de organização política' },
        { codigo: 'EF07HI10', descricao: 'Analisar, com base em documentos históricos, diferentes interpretações sobre as dinâmicas das sociedades americanas no período colonial', objetoConhecimento: 'Sociedades coloniais americanas' },
        { codigo: 'EF07HI12', descricao: 'Identificar a distribuição territorial da população brasileira em diferentes épocas, considerando a diversidade étnico-racial e étnico-cultural', objetoConhecimento: 'Formação territorial do Brasil' },
      ],
      '8º Ano': [
        { codigo: 'EF08HI01', descricao: 'Identificar os principais aspectos conceituais do iluminismo e do liberalismo e discutir a relação entre eles e a organização do mundo contemporâneo', objetoConhecimento: 'O mundo contemporâneo: o Antigo Regime em crise' },
        { codigo: 'EF08HI02', descricao: 'Identificar as particularidades político-sociais da Inglaterra do século XVII e analisar os desdobramentos posteriores', objetoConhecimento: 'Revolução Inglesa' },
        { codigo: 'EF08HI03', descricao: 'Analisar os impactos da Revolução Industrial na produção e circulação de povos, produtos e culturas', objetoConhecimento: 'Revolução Industrial' },
        { codigo: 'EF08HI05', descricao: 'Explicar os movimentos e as rebeliões da América portuguesa, articulando as temáticas locais e suas interfaces com processos ocorridos na Europa e nas Américas', objetoConhecimento: 'Independências na América' },
        { codigo: 'EF08HI06', descricao: 'Aplicar os conceitos de Estado, nação, território, governo e país para o entendimento de conflitos e tensões', objetoConhecimento: 'Conceitos políticos fundamentais' },
        { codigo: 'EF08HI09', descricao: 'Conhecer as características e os principais pensadores do Abolicionismo', objetoConhecimento: 'Abolicionismo' },
        { codigo: 'EF08HI10', descricao: 'Identificar a Revolução de São Domingos como evento singular e desdobramento da Revolução Francesa e avaliar suas implicações', objetoConhecimento: 'Revolução de São Domingos' },
        { codigo: 'EF08HI13', descricao: 'Analisar o processo de abolição da escravatura no Brasil e seus desdobramentos', objetoConhecimento: 'Abolição da escravatura no Brasil' },
        { codigo: 'EF08HI14', descricao: 'Discutir a noção da alteridade e reconhecer as diversidades étnico-raciais na formação da sociedade brasileira', objetoConhecimento: 'Os processos de independência nas Américas' },
      ],
      '9º Ano': [
        { codigo: 'EF09HI01', descricao: 'Descrever e contextualizar os principais aspectos sociais, culturais, econômicos e políticos da emergência da República no Brasil', objetoConhecimento: 'Experiências republicanas e práticas autoritárias' },
        { codigo: 'EF09HI02', descricao: 'Caracterizar e compreender os ciclos da história republicana, identificando particularidades da história local e regional', objetoConhecimento: 'Ciclos da história republicana' },
        { codigo: 'EF09HI03', descricao: 'Identificar os mecanismos de inserção dos negros na sociedade brasileira pós-abolição e avaliar os seus resultados', objetoConhecimento: 'Inserção social pós-abolição' },
        { codigo: 'EF09HI05', descricao: 'Identificar os processos de urbanização e modernização da sociedade brasileira e avaliar suas contradições e impactos na região em que vive', objetoConhecimento: 'Urbanização e modernização' },
        { codigo: 'EF09HI06', descricao: 'Identificar e discutir o papel do trabalhismo como força política, social e cultural no Brasil', objetoConhecimento: 'Trabalhismo' },
        { codigo: 'EF09HI07', descricao: 'Identificar e explicar os mecanismos de resistência da população negra diante do preconceito e racismo', objetoConhecimento: 'Resistência da população negra' },
        { codigo: 'EF09HI08', descricao: 'Identificar as transformações ocorridas no debate sobre as questões da diversidade no Brasil durante o século XX e compreender o significado das mudanças de abordagem em relação ao tema', objetoConhecimento: 'Diversidade no Brasil' },
        { codigo: 'EF09HI10', descricao: 'Identificar e relacionar as dinâmicas do capitalismo e suas crises, os grandes conflitos mundiais e os conflitos vivenciados na Europa', objetoConhecimento: 'A crise do capitalismo e a Segunda Guerra Mundial' },
        { codigo: 'EF09HI13', descricao: 'Descrever e contextualizar os processos da emergência do fascismo e do nazismo, a consolidação dos estados totalitários e as práticas de extermínio', objetoConhecimento: 'A emergência do fascismo e do nazismo' },
        { codigo: 'EF09HI14', descricao: 'Caracterizar e discutir as dinâmicas do colonialismo e imperialismo e suas consequências', objetoConhecimento: 'Colonialismo e imperialismo' },
        { codigo: 'EF09HI15', descricao: 'Comparar as características dos regimes ditatoriais latino-americanos, com especial atenção para a censura política, a opressão e o uso da força', objetoConhecimento: 'Ditaduras latino-americanas' },
        { codigo: 'EF09HI16', descricao: 'Relacionar a Carta dos Direitos Humanos ao processo de afirmação dos direitos fundamentais e de defesa da dignidade humana', objetoConhecimento: 'A Organização das Nações Unidas e a questão dos Direitos Humanos' },
      ],
    }
  },

  'Geografia': {
    nome: 'Geografia',
    habilidades: {
      '4º Ano': [
        { codigo: 'EF04GE01', descricao: 'Selecionar, em seus lugares de vivência e em suas histórias familiares e/ou da comunidade, elementos de distintas culturas', objetoConhecimento: 'Território e diversidade cultural' },
        { codigo: 'EF04GE06', descricao: 'Identificar e descrever territórios étnico-culturais existentes no Brasil, tais como terras indígenas e de comunidades remanescentes de quilombos', objetoConhecimento: 'Territórios étnico-culturais' },
      ],
      '5º Ano': [
        { codigo: 'EF05GE01', descricao: 'Descrever e analisar dinâmicas populacionais na Unidade da Federação em que vive, estabelecendo relações entre migrações e condições de infraestrutura', objetoConhecimento: 'Dinâmica populacional' },
        { codigo: 'EF05GE09', descricao: 'Estabelecer conexões e hierarquias entre diferentes cidades, utilizando mapas temáticos e representações gráficas', objetoConhecimento: 'Representação das cidades e do campo' },
      ],
      '6º Ano': [
        { codigo: 'EF06GE01', descricao: 'Comparar modificações das paisagens nos lugares de vivência e os usos desses lugares em diferentes tempos', objetoConhecimento: 'Identidade sociocultural' },
        { codigo: 'EF06GE02', descricao: 'Analisar modificações de paisagens por diferentes tipos de sociedade, com destaque para os povos originários', objetoConhecimento: 'Transformação de paisagens' },
        { codigo: 'EF06GE03', descricao: 'Descrever os movimentos do planeta e sua relação com a circulação geral da atmosfera, o surgimento dos ventos e a distribuição dos climas terrestres', objetoConhecimento: 'Movimentos do planeta e climas' },
        { codigo: 'EF06GE04', descricao: 'Descrever o ciclo da água, comparando o escoamento superficial no ambiente urbano e rural', objetoConhecimento: 'Ciclo da água' },
        { codigo: 'EF06GE05', descricao: 'Relacionar padrões climáticos, tipos de solo, relevo e formações vegetais', objetoConhecimento: 'Relação entre os componentes físico-naturais' },
        { codigo: 'EF06GE06', descricao: 'Identificar as características das paisagens transformadas pelo trabalho humano a partir do desenvolvimento da agropecuária e do processo de industrialização', objetoConhecimento: 'Paisagens e atividades econômicas' },
        { codigo: 'EF06GE07', descricao: 'Explicar as mudanças na interação humana com a natureza a partir do surgimento das cidades', objetoConhecimento: 'Urbanização e natureza' },
        { codigo: 'EF06GE08', descricao: 'Medir distâncias na superfície pelas coordenadas geográficas', objetoConhecimento: 'Coordenadas geográficas' },
        { codigo: 'EF06GE09', descricao: 'Elaborar modelos tridimensionais, blocos-diagrama e perfis topográficos e de vegetação, identificando formas de relevo, tipos de solo, cobertura vegetal e a rede hidrográfica', objetoConhecimento: 'Representação cartográfica' },
        { codigo: 'EF06GE10', descricao: 'Aplicar recursos da cartografia como a escala e a legenda, leitura e interpretação de mapas', objetoConhecimento: 'Cartografia' },
        { codigo: 'EF06GE11', descricao: 'Analisar distintas interações das sociedades com a natureza, com base na distribuição dos componentes físico-naturais', objetoConhecimento: 'Biodiversidade e ciclo hidrológico' },
        { codigo: 'EF06GE12', descricao: 'Identificar o consumo dos recursos hídricos e o uso das principais bacias hidrográficas no Brasil e no mundo', objetoConhecimento: 'Recursos hídricos e bacias hidrográficas' },
      ],
      '7º Ano': [
        { codigo: 'EF07GE01', descricao: 'Avaliar, por meio de exemplos extraídos dos meios de comunicação, ideias e estereótipos acerca das paisagens e da formação territorial do Brasil', objetoConhecimento: 'Ideias e concepções sobre a formação territorial do Brasil' },
        { codigo: 'EF07GE02', descricao: 'Analisar a influência dos fluxos econômicos e populacionais na formação socioeconômica e territorial do Brasil', objetoConhecimento: 'Fluxos econômicos e populacionais' },
        { codigo: 'EF07GE03', descricao: 'Selecionar argumentos que reconheçam as territorialidades dos povos indígenas originários, das comunidades remanescentes de quilombos', objetoConhecimento: 'Territorialidades tradicionais' },
        { codigo: 'EF07GE04', descricao: 'Analisar a distribuição territorial da população brasileira, considerando a diversidade étnico-cultural (indígena, africana, europeia e asiática)', objetoConhecimento: 'Distribuição territorial da população' },
        { codigo: 'EF07GE05', descricao: 'Analisar fatos e situações representativas das alterações ocorridas entre o período mercantilista e o advento do capitalismo', objetoConhecimento: 'Mercantilismo e capitalismo' },
        { codigo: 'EF07GE06', descricao: 'Discutir em que medida a produção, a circulação e o consumo de mercadorias provocam impactos ambientais, assim como conhecer propostas para mitigá-los', objetoConhecimento: 'Produção, circulação e consumo de mercadorias' },
        { codigo: 'EF07GE07', descricao: 'Analisar a influência e o papel das redes de transporte e comunicação na configuração do território brasileiro', objetoConhecimento: 'Redes de transporte e comunicação' },
        { codigo: 'EF07GE08', descricao: 'Estabelecer relações entre os processos de industrialização e inovação tecnológica com as transformações socioeconômicas do território brasileiro', objetoConhecimento: 'Industrialização e inovação tecnológica' },
        { codigo: 'EF07GE09', descricao: 'Interpretar e elaborar mapas temáticos e históricos, inclusive utilizando tecnologias digitais', objetoConhecimento: 'Mapas temáticos e históricos' },
        { codigo: 'EF07GE10', descricao: 'Elaborar e interpretar gráficos de barras, gráficos de setores e histogramas, com base em dados socioeconômicos das regiões brasileiras', objetoConhecimento: 'Gráficos e dados socioeconômicos' },
        { codigo: 'EF07GE11', descricao: 'Caracterizar dinâmicas dos componentes físico-naturais no território nacional e em áreas de risco', objetoConhecimento: 'Componentes físico-naturais e áreas de risco' },
        { codigo: 'EF07GE12', descricao: 'Comparar unidades de conservação existentes no Município de residência e em outras localidades brasileiras', objetoConhecimento: 'Unidades de conservação' },
      ],
      '8º Ano': [
        { codigo: 'EF08GE01', descricao: 'Descrever as rotas de dispersão da população humana pelo planeta e os principais fluxos migratórios em diferentes períodos da história', objetoConhecimento: 'Distribuição da população mundial e fluxos migratórios' },
        { codigo: 'EF08GE02', descricao: 'Analisar os padrões econômicos mundiais de produção, distribuição e intercâmbio de produtos, identificando os caminhos de maior trânsito de mercadorias', objetoConhecimento: 'Padrões econômicos mundiais' },
        { codigo: 'EF08GE03', descricao: 'Analisar os padrões econômicos mundiais de produção, distribuição e intercâmbio de produtos, identificando os caminhos de maior trânsito de capitais', objetoConhecimento: 'Fluxos de capitais' },
        { codigo: 'EF08GE04', descricao: 'Compreender os fluxos de migração na América Latina e seus efeitos na formação socioeconômica e cultural dos países', objetoConhecimento: 'Migração na América Latina' },
        { codigo: 'EF08GE05', descricao: 'Aplicar os conceitos de Estado, nação, território, governo e país para o entendimento de conflitos e tensões na contemporaneidade', objetoConhecimento: 'Corporações e organismos internacionais' },
        { codigo: 'EF08GE06', descricao: 'Analisar a atuação das organizações mundiais nos processos de integração cultural e econômica, nos contextos americano e africano', objetoConhecimento: 'Organizações mundiais' },
        { codigo: 'EF08GE07', descricao: 'Analisar os conflitos e as tensões geopolíticas do continente americano e africano', objetoConhecimento: 'Geopolítica americana e africana' },
        { codigo: 'EF08GE08', descricao: 'Analisar a situação do Brasil e de outros países da América Latina em relação ao IDH, ao PIB e à distribuição de renda', objetoConhecimento: 'Indicadores socioeconômicos' },
        { codigo: 'EF08GE09', descricao: 'Analisar os padrões econômicos mundiais de produção e comércio, suas relações com a economia brasileira', objetoConhecimento: 'Economia mundial e brasileira' },
        { codigo: 'EF08GE10', descricao: 'Distinguir e analisar conflitos e ações dos movimentos sociais brasileiros, no campo e na cidade', objetoConhecimento: 'Movimentos sociais' },
      ],
      '9º Ano': [
        { codigo: 'EF09GE01', descricao: 'Analisar criticamente de que forma a hegemonia europeia foi exercida em várias regiões do planeta', objetoConhecimento: 'A hegemonia europeia na economia, na política e na cultura' },
        { codigo: 'EF09GE02', descricao: 'Analisar a atuação das corporações internacionais e das organizações econômicas mundiais na vida da população em relação ao consumo, à cultura e à mobilidade', objetoConhecimento: 'Corporações internacionais' },
        { codigo: 'EF09GE03', descricao: 'Identificar diferentes manifestações culturais de minorias étnicas como forma de compreender a multiplicidade cultural na escala mundial', objetoConhecimento: 'Diversidade cultural mundial' },
        { codigo: 'EF09GE04', descricao: 'Relacionar diferenças de paisagens aos modos de viver de diferentes povos na Europa, Ásia e Oceania, valorizando identidades e interculturalidades regionais', objetoConhecimento: 'Paisagens e interculturalidade' },
        { codigo: 'EF09GE05', descricao: 'Analisar fatos e situações para compreender a integração mundial e seus conflitos, com destaque para as áreas de interesse dos Estados Unidos e da China', objetoConhecimento: 'Integração mundial e suas interpretações' },
        { codigo: 'EF09GE06', descricao: 'Associar o critério de divisão do mundo em Ocidente e Oriente com o contexto cultural e político da Guerra Fria', objetoConhecimento: 'Guerra Fria e divisão mundial' },
        { codigo: 'EF09GE07', descricao: 'Analisar os componentes físico-naturais da Eurásia e os determinantes histórico-geográficos de sua divisão em Europa e Ásia', objetoConhecimento: 'Geografia da Eurásia' },
        { codigo: 'EF09GE08', descricao: 'Analisar transformações territoriais no continente europeu em função dos processos políticos e econômicos do capitalismo', objetoConhecimento: 'Transformações territoriais europeias' },
        { codigo: 'EF09GE09', descricao: 'Analisar características de países e grupos de países europeus, asiáticos e da Oceania em seus aspectos populacionais, urbanos, políticos e econômicos', objetoConhecimento: 'Países europeus, asiáticos e da Oceania' },
        { codigo: 'EF09GE10', descricao: 'Analisar os impactos do processo de industrialização na produção e circulação de mercadorias e seus efeitos no meio ambiente', objetoConhecimento: 'Industrialização e meio ambiente' },
      ],
    }
  },
};

export function getBNCCHabilidades(
  componente: string,
  anoSerie: string,
  maxHabilidades: number = 3
): BNCCHabilidade[] {
  const comp = BNCC_HABILIDADES[componente];
  if (!comp) return [];

  const normalizedAno = normalizeAnoSerie(anoSerie);
  const habilidades = comp.habilidades[normalizedAno];

  if (!habilidades) {
    const closestYear = findClosestYear(Object.keys(comp.habilidades), normalizedAno);
    if (closestYear) {
      return comp.habilidades[closestYear].slice(0, maxHabilidades);
    }
    return [];
  }

  return habilidades.slice(0, maxHabilidades);
}

export function formatBNCCForPrompt(
  componente: string,
  anoSerie: string
): string {
  const habilidades = getBNCCHabilidades(componente, anoSerie, 4);
  
  if (habilidades.length === 0) {
    return `Alinhe com as habilidades da BNCC para ${componente} no ${anoSerie}`;
  }

  const formatted = habilidades.map(h => 
    `- ${h.codigo}: ${h.descricao} (${h.objetoConhecimento})`
  ).join('\n');

  return `HABILIDADES BNCC PRIORITÁRIAS para ${componente} - ${anoSerie}:\n${formatted}`;
}

function normalizeAnoSerie(anoSerie: string): string {
  const match = anoSerie.match(/(\d+)[ºªo°]?\s*(ano|serie|série)?/i);
  if (match) {
    return `${match[1]}º Ano`;
  }
  
  if (anoSerie.toLowerCase().includes('médio') || anoSerie.toLowerCase().includes('medio')) {
    return '9º Ano';
  }
  
  return anoSerie;
}

function findClosestYear(availableYears: string[], target: string): string | null {
  const targetNum = parseInt(target);
  if (isNaN(targetNum)) return availableYears[0] || null;

  let closest: string | null = null;
  let minDiff = Infinity;

  for (const year of availableYears) {
    const yearNum = parseInt(year);
    if (!isNaN(yearNum)) {
      const diff = Math.abs(yearNum - targetNum);
      if (diff < minDiff) {
        minDiff = diff;
        closest = year;
      }
    }
  }

  return closest;
}

export function getAllComponentes(): string[] {
  return Object.keys(BNCC_HABILIDADES);
}

export function getAnosDisponiveis(componente: string): string[] {
  const comp = BNCC_HABILIDADES[componente];
  return comp ? Object.keys(comp.habilidades) : [];
}
