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
        { codigo: 'EF06MA03', descricao: 'Resolver e elaborar problemas que envolvam cálculos (mentais ou escritos, exatos ou aproximados) com números naturais', objetoConhecimento: 'Operações com números naturais' },
        { codigo: 'EF06MA09', descricao: 'Resolver e elaborar problemas que envolvam o cálculo da fração de uma quantidade e cujo resultado seja um número natural', objetoConhecimento: 'Operações com números racionais' },
        { codigo: 'EF06MA13', descricao: 'Resolver e elaborar problemas que envolvam porcentagens, com base na ideia de proporcionalidade', objetoConhecimento: 'Cálculo de porcentagens' },
      ],
      '7º Ano': [
        { codigo: 'EF07MA01', descricao: 'Resolver e elaborar problemas com números naturais, envolvendo as noções de divisor e de múltiplo', objetoConhecimento: 'Múltiplos e divisores de um número natural' },
        { codigo: 'EF07MA04', descricao: 'Resolver e elaborar problemas que envolvam operações com números inteiros', objetoConhecimento: 'Números inteiros' },
        { codigo: 'EF07MA09', descricao: 'Utilizar, na resolução de problemas, a associação entre razão e fração', objetoConhecimento: 'Fração e seus significados' },
        { codigo: 'EF07MA12', descricao: 'Resolver e elaborar problemas que envolvam as operações com números racionais', objetoConhecimento: 'Operações com números racionais' },
        { codigo: 'EF07MA17', descricao: 'Resolver e elaborar problemas envolvendo equações do 1º grau', objetoConhecimento: 'Equações polinomiais do 1º grau' },
      ],
      '8º Ano': [
        { codigo: 'EF08MA01', descricao: 'Efetuar cálculos com potências de expoentes inteiros e aplicar esse conhecimento na representação de números em notação científica', objetoConhecimento: 'Potenciação e radiciação' },
        { codigo: 'EF08MA06', descricao: 'Resolver e elaborar problemas que envolvam cálculo do valor numérico de expressões algébricas', objetoConhecimento: 'Valor numérico de expressões algébricas' },
        { codigo: 'EF08MA08', descricao: 'Resolver e elaborar problemas relacionados ao seu contexto próximo, que possam ser representados por equações polinomiais de 2º grau, redutíveis a equações de 1º grau', objetoConhecimento: 'Equações polinomiais do 1º grau' },
        { codigo: 'EF08MA12', descricao: 'Identificar a natureza da variação de duas grandezas, diretamente, inversamente proporcionais ou não proporcionais', objetoConhecimento: 'Variação de grandezas' },
      ],
      '9º Ano': [
        { codigo: 'EF09MA01', descricao: 'Reconhecer que, uma vez fixada uma unidade de comprimento, existem segmentos de reta cujo comprimento não é expresso por número racional', objetoConhecimento: 'Necessidade dos números reais' },
        { codigo: 'EF09MA06', descricao: 'Compreender as funções como relações de dependência unívoca entre duas variáveis e suas representações numérica, algébrica e gráfica', objetoConhecimento: 'Funções' },
        { codigo: 'EF09MA09', descricao: 'Compreender os processos de fatoração de expressões algébricas, com base em suas relações com os produtos notáveis', objetoConhecimento: 'Expressões algébricas' },
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
        { codigo: 'EF06LP11', descricao: 'Utilizar, ao produzir texto, conhecimentos linguísticos e gramaticais: tempos verbais, concordância nominal e verbal, regras ortográficas, pontuação', objetoConhecimento: 'Sintaxe' },
        { codigo: 'EF67LP28', descricao: 'Ler, de forma autônoma, e compreender textos literários de diferentes gêneros e extensões, inclusive aqueles sem ilustrações', objetoConhecimento: 'Estratégias de leitura' },
      ],
      '7º Ano': [
        { codigo: 'EF07LP04', descricao: 'Reconhecer, em textos, o verbo como o núcleo das orações', objetoConhecimento: 'Morfossintaxe' },
        { codigo: 'EF07LP14', descricao: 'Identificar, em textos, os efeitos de sentido do uso de estratégias de modalização e argumentatividade', objetoConhecimento: 'Modalização' },
        { codigo: 'EF67LP28', descricao: 'Ler, de forma autônoma, e compreender textos literários de diferentes gêneros e extensões', objetoConhecimento: 'Estratégias de leitura' },
      ],
      '8º Ano': [
        { codigo: 'EF08LP04', descricao: 'Utilizar, ao produzir texto, conhecimentos linguísticos e gramaticais: ortografia, regências e concordâncias nominal e verbal, modos e tempos verbais, pontuação', objetoConhecimento: 'Fono-ortografia' },
        { codigo: 'EF08LP14', descricao: 'Utilizar, ao produzir texto, recursos de coesão sequencial e referencial, bem como de concordância, regência e vozes verbais', objetoConhecimento: 'Coesão' },
        { codigo: 'EF89LP33', descricao: 'Ler, de forma autônoma, e compreender textos literários de diferentes gêneros e extensões, inclusive obras da tradição literária', objetoConhecimento: 'Estratégias de leitura' },
      ],
      '9º Ano': [
        { codigo: 'EF09LP04', descricao: 'Escrever textos corretamente, de acordo com a norma-padrão, com estruturas sintáticas complexas no nível da oração e do período', objetoConhecimento: 'Fono-ortografia' },
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
        { codigo: 'EF06CI05', descricao: 'Explicar a organização básica das células e seu papel como unidade estrutural e funcional dos seres vivos', objetoConhecimento: 'Célula como unidade da vida' },
        { codigo: 'EF06CI06', descricao: 'Concluir, com base na análise de ilustrações e/ou modelos, que os organismos são um complexo arranjo de sistemas com diferentes níveis de organização', objetoConhecimento: 'Níveis de organização dos seres vivos' },
      ],
      '7º Ano': [
        { codigo: 'EF07CI01', descricao: 'Discutir a aplicação, ao longo da história, das máquinas simples e propor soluções e invenções para a realização de tarefas mecânicas cotidianas', objetoConhecimento: 'Máquinas simples' },
        { codigo: 'EF07CI03', descricao: 'Utilizar o conhecimento das formas de propagação do calor para justificar a utilização de determinados materiais em diferentes contextos', objetoConhecimento: 'Propagação do calor' },
        { codigo: 'EF07CI04', descricao: 'Avaliar o papel do equilíbrio termodinâmico para a manutenção da vida na Terra', objetoConhecimento: 'Equilíbrio termodinâmico e vida na Terra' },
        { codigo: 'EF07CI06', descricao: 'Discutir e avaliar mudanças econômicas, culturais e sociais, tanto na vida cotidiana quanto no mundo do trabalho, decorrentes do desenvolvimento de novos materiais e tecnologias', objetoConhecimento: 'História dos combustíveis e das máquinas térmicas' },
      ],
      '8º Ano': [
        { codigo: 'EF08CI01', descricao: 'Identificar e classificar diferentes fontes (renováveis e não renováveis) e tipos de energia utilizados em residências, comunidades ou cidades', objetoConhecimento: 'Fontes e tipos de energia' },
        { codigo: 'EF08CI07', descricao: 'Comparar diferentes processos reprodutivos em plantas e animais em relação aos mecanismos adaptativos e evolutivos', objetoConhecimento: 'Mecanismos reprodutivos' },
        { codigo: 'EF08CI08', descricao: 'Analisar e explicar as transformações que ocorrem na puberdade considerando a atuação dos hormônios sexuais e do sistema nervoso', objetoConhecimento: 'Puberdade e sistema reprodutor' },
      ],
      '9º Ano': [
        { codigo: 'EF09CI01', descricao: 'Investigar as mudanças de estado físico da matéria e explicar essas transformações com base no modelo de constituição submicroscópica', objetoConhecimento: 'Aspectos quantitativos das transformações químicas' },
        { codigo: 'EF09CI04', descricao: 'Planejar e executar experimentos que evidenciem que todas as cores de luz podem ser formadas pela composição das três cores primárias da luz', objetoConhecimento: 'Estrutura da matéria' },
        { codigo: 'EF09CI06', descricao: 'Classificar as radiações eletromagnéticas por suas frequências, fontes e aplicações, discutindo e avaliando implicações de seu uso', objetoConhecimento: 'Radiações e suas aplicações' },
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
        { codigo: 'EF06HI07', descricao: 'Identificar aspectos e formas de registro das sociedades antigas na África, no Oriente Médio e nas Américas', objetoConhecimento: 'As origens da humanidade' },
        { codigo: 'EF06HI14', descricao: 'Identificar e analisar diferentes formas de contato, adaptação ou exclusão entre populações em diferentes tempos e espaços', objetoConhecimento: 'Lógicas de organização política' },
      ],
      '7º Ano': [
        { codigo: 'EF07HI01', descricao: 'Explicar o significado de "modernidade" e suas lógicas de inclusão e exclusão, com base em uma concepção europeia', objetoConhecimento: 'O mundo moderno e a conexão entre sociedades africanas, americanas e europeias' },
        { codigo: 'EF07HI09', descricao: 'Analisar os diferentes impactos da conquista europeia da América para as populações ameríndias e identificar as formas de resistência', objetoConhecimento: 'A conquista da América e as formas de organização política' },
      ],
      '8º Ano': [
        { codigo: 'EF08HI01', descricao: 'Identificar os principais aspectos conceituais do iluminismo e do liberalismo e discutir a relação entre eles e a organização do mundo contemporâneo', objetoConhecimento: 'O mundo contemporâneo: o Antigo Regime em crise' },
        { codigo: 'EF08HI05', descricao: 'Explicar os movimentos e as rebeliões da América portuguesa, articulando as temáticas locais e suas interfaces com processos ocorridos na Europa e nas Américas', objetoConhecimento: 'Independências na América' },
        { codigo: 'EF08HI14', descricao: 'Discutir a noção da alteridade e reconhecer as diversidades étnico-raciais na formação da sociedade brasileira', objetoConhecimento: 'Os processos de independência nas Américas' },
      ],
      '9º Ano': [
        { codigo: 'EF09HI01', descricao: 'Descrever e contextualizar os principais aspectos sociais, culturais, econômicos e políticos da emergência da República no Brasil', objetoConhecimento: 'Experiências republicanas e práticas autoritárias' },
        { codigo: 'EF09HI10', descricao: 'Identificar e relacionar as dinâmicas do capitalismo e suas crises, os grandes conflitos mundiais e os conflitos vivenciados na Europa', objetoConhecimento: 'A crise do capitalismo e a Segunda Guerra Mundial' },
        { codigo: 'EF09HI13', descricao: 'Descrever e contextualizar os processos da emergência do fascismo e do nazismo, a consolidação dos estados totalitários e as práticas de extermínio', objetoConhecimento: 'A emergência do fascismo e do nazismo' },
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
        { codigo: 'EF06GE05', descricao: 'Relacionar padrões climáticos, tipos de solo, relevo e formações vegetais', objetoConhecimento: 'Relação entre os componentes físico-naturais' },
        { codigo: 'EF06GE11', descricao: 'Analisar distintas interações das sociedades com a natureza, com base na distribuição dos componentes físico-naturais', objetoConhecimento: 'Biodiversidade e ciclo hidrológico' },
      ],
      '7º Ano': [
        { codigo: 'EF07GE01', descricao: 'Avaliar, por meio de exemplos extraídos dos meios de comunicação, ideias e estereótipos acerca das paisagens e da formação territorial do Brasil', objetoConhecimento: 'Ideias e concepções sobre a formação territorial do Brasil' },
        { codigo: 'EF07GE06', descricao: 'Discutir em que medida a produção, a circulação e o consumo de mercadorias provocam impactos ambientais, assim como conhecer propostas para mitigá-los', objetoConhecimento: 'Produção, circulação e consumo de mercadorias' },
      ],
      '8º Ano': [
        { codigo: 'EF08GE01', descricao: 'Descrever as rotas de dispersão da população humana pelo planeta e os principais fluxos migratórios em diferentes períodos da história', objetoConhecimento: 'Distribuição da população mundial e fluxos migratórios' },
        { codigo: 'EF08GE05', descricao: 'Aplicar os conceitos de Estado, nação, território, governo e país para o entendimento de conflitos e tensões na contemporaneidade', objetoConhecimento: 'Corporações e organismos internacionais' },
      ],
      '9º Ano': [
        { codigo: 'EF09GE01', descricao: 'Analisar criticamente de que forma a hegemonia europeia foi exercida em várias regiões do planeta', objetoConhecimento: 'A hegemonia europeia na economia, na política e na cultura' },
        { codigo: 'EF09GE05', descricao: 'Analisar fatos e situações para compreender a integração mundial e seus conflitos, com destaque para as áreas de interesse dos Estados Unidos e da China', objetoConhecimento: 'Integração mundial e suas interpretações' },
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
