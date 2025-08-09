export interface EtapaDesenvolvimento {
  id: string;
  titulo: string;
  descricao: string;
  tipoInteracao: string;
  tempoEstimado: string;
  recursosUsados: string[];
  ordem: number;
  expandida: boolean;
}

export interface DesenvolvimentoData {
  etapas: EtapaDesenvolvimento[];
  tempoTotalEstimado: string;
  observacoesGerais: string;
  sugestoesIA: string[];
}

const calcularTempoTotal = (etapas: EtapaDesenvolvimento[]): string => {
  const totalMinutos = Math.min(45, etapas.reduce((acc, etapa) => {
    const tempo = parseInt(etapa.tempoEstimado) || 0;
    return acc + tempo;
  }, 0));

  return `${totalMinutos}min`;
};

const ajustarTemposEtapas = (etapas: EtapaDesenvolvimento[]): EtapaDesenvolvimento[] => {
  const TEMPO_MAXIMO = 45;

  // Calcular tempo total atual
  let tempoTotalAtual = etapas.reduce((acc, etapa) => {
    const tempo = parseInt(etapa.tempoEstimado) || 0;
    return acc + tempo;
  }, 0);

  // Se já está dentro do limite, retornar as etapas
  if (tempoTotalAtual <= TEMPO_MAXIMO) {
    return etapas;
  }

  // Ajustar proporcionalmente os tempos
  const fatorAjuste = TEMPO_MAXIMO / tempoTotalAtual;

  return etapas.map(etapa => {
    const tempoAtual = parseInt(etapa.tempoEstimado) || 0;
    const novoTempo = Math.max(5, Math.round(tempoAtual * fatorAjuste));

    return {
      ...etapa,
      tempoEstimado: `${novoTempo} minutos`
    };
  });
};

// Função para criar dados padrão com validação
const criarDadosPadrao = (): DesenvolvimentoData => ({
  etapas: [
    {
      id: "etapa_1",
      titulo: "1. Revisando Substantivos: Comuns e Próprios",
      descricao: "Início com uma breve revisão sobre substantivos comuns e próprios. Utilizar exemplos do cotidiano para facilitar a compreensão. Apresentar exemplos na lousa, solicitando exemplos dos alunos e classificando-os coletivamente. Esclarecer dúvidas e reforçar a diferença entre os tipos de substantivos com exemplos concretos (nome de pessoas, lugares, coisas, etc.).",
      tipoInteracao: "Apresentação dialogada e discussão",
      tempoEstimado: "10 minutos",
      recursosUsados: ["Lousa ou projetor", "Pincel ou caneta para lousa", "Quiz Interativo"],
      ordem: 1,
      expandida: false
    },
    {
      id: "etapa_2",
      titulo: "2. Introdução aos Verbos: Ação e Estado",
      descricao: "Apresentar o conceito de verbo como palavra que indica ação ou estado. Utilizar exemplos práticos e contextualizados, como frases simples que mostram ações (correr, pular, estudar) e estados (ser, estar, parecer). Explicar a importância dos verbos na construção de frases e narrativas.",
      tipoInteracao: "Apresentação expositiva com exemplos",
      tempoEstimado: "15 minutos",
      recursosUsados: ["Lousa ou projetor", "Pincel ou caneta para lousa", "Organizador Gráfico"],
      ordem: 2,
      expandida: false
    },
    {
      id: "etapa_3",
      titulo: "3. Atividade Prática: Identificação em Textos",
      descricao: "Distribuir cópias de textos curtos (contos, notícias) para que os alunos identifiquem substantivos próprios e verbos. Trabalho em duplas ou pequenos grupos para discussão e análise. Circular pela sala oferecendo auxílio e esclarecendo dúvidas. Uso de dicionários para verificar classificações duvidosas.",
      tipoInteracao: "Atividade prática em grupo",
      tempoEstimado: "15 minutos",
      recursosUsados: ["Cópias de textos para análise (contos, notícias, etc.)", "Dicionários (físicos ou online)", "Caça-Palavras"],
      ordem: 3,
      expandida: false
    },
    {
      id: "etapa_4",
      titulo: "4. Consolidação e Verificação",
      descricao: "Momento final para consolidar o aprendizado através de exercícios rápidos na lousa e verificação da compreensão dos alunos. Esclarecimento de dúvidas finais e preparação para próxima aula.",
      tipoInteracao: "Síntese e verificação",
      tempoEstimado: "5 minutos",
      recursosUsados: ["Lousa ou projetor", "Lista de exercícios impressa"],
      ordem: 4,
      expandida: false
    }
  ],
  tempoTotalEstimado: "45 minutos",
  observacoesGerais: "Aula estruturada para promover participação ativa dos alunos, alternando momentos expositivos com atividades práticas. Importante observar o nível de compreensão da turma e ajustar o ritmo conforme necessário.",
  sugestoesIA: [
    "Considere usar exemplos do cotidiano dos alunos para tornar o aprendizado mais significativo",
    "Inclua atividades colaborativas para estimular a interação entre os estudantes",
    "Reserve tempo para esclarecimento de dúvidas individuais"
  ]
});

// Dados padrão/fallback
export const desenvolvimentoDataPadrao: DesenvolvimentoData = criarDadosPadrao();

// Service para API do Gemini
export class DesenvolvimentoGeminiService {
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  static async gerarEtapasDesenvolvimento(contextoPlano: any): Promise<DesenvolvimentoData> {
    try {
      console.log('🤖 Gerando etapas de desenvolvimento via Gemini...');

      // Lista de atividades do School Power para incluir nos recursos
      const atividadesSchoolPower = [
        "Resumo", "Lista de Exercícios", "Prova", "Mapa Mental", "Texto de Apoio",
        "Plano de Aula", "Sequência Didática", "Jogos Educativos", "Apresentação de Slides",
        "Proposta de Redação", "Simulado", "Caça-Palavras", "Palavras Cruzadas",
        "Experimento Científico", "Critérios de Avaliação", "Revisão Guiada", "Atividades de Matemática", "Quiz", "Charadas", "Corretor de Questões"
      ];

      const prompt = `
Você é um especialista em pedagogia e criação de planos de aula. Gere um desenvolvimento de aula estruturado e detalhado com base no contexto fornecido.

**CONTEXTO DO PLANO DE AULA:**
- Disciplina: ${contextoPlano.disciplina || 'Não especificado'}
- Tema: ${contextoPlano.tema || 'Não especificado'}  
- Série/Ano: ${contextoPlano.anoEscolaridade || contextoPlano.serie || 'Não especificado'}
- Tempo disponível: 45 minutos (MÁXIMO)
- Metodologia: ${contextoPlano.metodologia || 'Ativa e participativa'}

**ATIVIDADES DISPONÍVEIS NO SCHOOL POWER (inclua algumas nos recursos):**
Resumo, Lista de Exercícios, Prova, Mapa Mental, Texto de Apoio, Plano de Aula, Sequência Didática, Jogos Educativos, Apresentação de Slides, Proposta de Redação, Simulado, Caça-Palavras, Palavras Cruzadas, Experimento Científico, Critérios de Avaliação, Revisão Guiada, Atividades de Matemática, Quiz, Charadas, Corretor de Questões.

**INSTRUÇÕES ESPECÍFICAS:**
1. Crie entre 3 a 5 etapas de desenvolvimento da aula
2. Cada etapa deve ter: título claro, descrição detalhada, tipo de interação, tempo estimado e recursos necessários
3. O tempo total NÃO deve exceder 45 minutos (LIMITE MÁXIMO)
4. Distribua o tempo de forma equilibrada entre as etapas
5. Varie os tipos de interação (apresentação, discussão, prática, grupo, individual)
6. SEMPRE inclua pelo menos 1-2 atividades do School Power nos recursos de cada etapa
7. Mantenha coerência com o tema e série especificados
8. Adicione observações gerais relevantes
9. Forneça sugestões da IA para melhorias

**FORMATO DE RESPOSTA (JSON):**
{
  "etapas": [
    {
      "id": "etapa_1",
      "titulo": "Título da etapa",
      "descricao": "Descrição detalhada da atividade e procedimentos",
      "tipoInteracao": "Tipo de interação (ex: Apresentação dialogada, Prática em grupo, etc.)",
      "tempoEstimado": "X minutos",
      "recursosUsados": ["Recurso tradicional", "Atividade do School Power", "Outro recurso"],
      "ordem": 1,
      "expandida": false
    }
  ],
  "tempoTotalEstimado": "X minutos (máximo 45)",
  "observacoesGerais": "Observações importantes sobre a condução da aula",
  "sugestoesIA": ["Sugestão 1", "Sugestão 2", "Sugestão 3"]
}

Gere o desenvolvimento da aula agora:`;

      const response = await this.chamarGeminiAPI(prompt);
      const etapasGeradas = this.processarResposta(response);

      // Garantir que o tempo total não exceda 45 minutos
      let tempoTotalMinutos = 0;
      etapasGeradas.etapas.forEach(etapa => {
        const tempoMatch = etapa.tempoEstimado.match(/\d+/);
        if (tempoMatch) {
          tempoTotalMinutos += parseInt(tempoMatch[0], 10);
        }
      });

      if (tempoTotalMinutos > 45) {
        // Se o tempo total for maior que 45, reajusta as etapas
        const fatorReducao = 45 / tempoTotalMinutos;
        let tempoAcumulado = 0;
        etapasGeradas.etapas.forEach((etapa, index) => {
          const tempoMatch = etapa.tempoEstimado.match(/\d+/);
          if (tempoMatch) {
            let novoTempo = Math.floor(parseInt(tempoMatch[0], 10) * fatorReducao);
            // Garante que cada etapa tenha pelo menos 5 minutos
            novoTempo = Math.max(novoTempo, 5);
            etapa.tempoEstimado = `${novoTempo} minutos`;
            tempoAcumulado += novoTempo;
          }
          // Adiciona atividades do School Power se ainda não houver
          if (!etapa.recursosUsados || etapa.recursosUsados.length < 2) {
            const atividadeAleatoria = atividadesSchoolPower[Math.floor(Math.random() * atividadesSchoolPower.length)];
            etapa.recursosUsados = [...(etapa.recursosUsados || []), atividadeAleatoria].slice(0, 2);
          }
          if (index === etapasGeradas.etapas.length - 1) {
            etapa.tempoEstimado = `${45 - tempoAcumulado + (tempoMatch ? parseInt(tempoMatch[0], 10) : 0)} minutos`; // Ajusta a última etapa para fechar em 45
          }
        });
        etapasGeradas.tempoTotalEstimado = "45 minutos";
      } else {
        etapasGeradas.tempoTotalEstimado = "45 minutos"; // Define como 45 minutos mesmo se a soma for menor
      }

      // Ajustar etapas para respeitar limite de 45 minutos
      const etapasAjustadas = ajustarTemposEtapas(etapasGeradas.etapas);

      console.log('✅ Etapas de desenvolvimento geradas com sucesso:', etapasGeradas);
      return {
        etapas: etapasAjustadas,
        tempoTotalEstimado: calcularTempoTotal(etapasAjustadas),
        observacoesGerais: etapasGeradas.observacoesGerais || '',
        sugestoesIA: etapasGeradas.sugestoesIA || []
      };


    } catch (error) {
      console.error('❌ Erro ao gerar etapas de desenvolvimento:', error);
      return this.aplicarContextoAosDadosPadrao(contextoPlano);
    }
  }

  private static construirPrompt(contextoPlano: any): string {
    return `
Você é um especialista em pedagogia e criação de planos de aula. Gere um desenvolvimento de aula estruturado e detalhado com base no contexto fornecido.

**CONTEXTO DO PLANO DE AULA:**
- Disciplina: ${contextoPlano.disciplina || 'Não especificado'}
- Tema: ${contextoPlano.tema || 'Não especificado'}  
- Série/Ano: ${contextoPlano.anoEscolaridade || contextoPlano.serie || 'Não especificado'}
- Tempo disponível: 45 minutos (MÁXIMO)
- Metodologia: ${contextoPlano.metodologia || 'Ativa e participativa'}

**ATIVIDADES DISPONÍVEIS NO SCHOOL POWER (inclua algumas nos recursos):**
Resumo, Lista de Exercícios, Prova, Mapa Mental, Texto de Apoio, Plano de Aula, Sequência Didática, Jogos Educativos, Apresentação de Slides, Proposta de Redação, Simulado, Caça-Palavras, Palavras Cruzadas, Experimento Científico, Critérios de Avaliação, Revisão Guiada, Atividades de Matemática, Quiz, Charadas, Corretor de Questões.

**INSTRUÇÕES ESPECÍFICAS:**
1. Crie entre 3 a 5 etapas de desenvolvimento da aula
2. Cada etapa deve ter: título claro, descrição detalhada, tipo de interação, tempo estimado e recursos necessários
3. O tempo total NÃO deve exceder 45 minutos (LIMITE MÁXIMO)
4. Distribua o tempo de forma equilibrada entre as etapas
5. Varie os tipos de interação (apresentação, discussão, prática, grupo, individual)
6. SEMPRE inclua pelo menos 1-2 atividades do School Power nos recursos de cada etapa
7. Mantenha coerência com o tema e série especificados
8. Adicione observações gerais relevantes
9. Forneça sugestões da IA para melhorias

**FORMATO DE RESPOSTA (JSON):**
{
  "etapas": [
    {
      "id": "etapa_1",
      "titulo": "Título da etapa",
      "descricao": "Descrição detalhada da atividade e procedimentos",
      "tipoInteracao": "Tipo de interação (ex: Apresentação dialogada, Prática em grupo, etc.)",
      "tempoEstimado": "X minutos",
      "recursosUsados": ["Recurso tradicional", "Atividade do School Power", "Outro recurso"],
      "ordem": 1,
      "expandida": false
    }
  ],
  "tempoTotalEstimado": "X minutos (máximo 45)",
  "observacoesGerais": "Observações importantes sobre a condução da aula",
  "sugestoesIA": ["Sugestão 1", "Sugestão 2", "Sugestão 3"]
}

Gere o desenvolvimento da aula agora:`;
  }

  private static async chamarGeminiAPI(prompt: string): Promise<string> {
    const { API_KEYS } = await import('@/config/apiKeys');

    if (!API_KEYS.GEMINI) {
      throw new Error('Chave da API Gemini não configurada');
    }

    const response = await fetch(`${this.GEMINI_API_URL}?key=${API_KEYS.GEMINI}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API Gemini: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  private static processarResposta(responseText: string): DesenvolvimentoData {
    try {
      // Limpar resposta da IA
      let cleanedText = responseText.trim();
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      cleanedText = cleanedText.trim();

      const parsedData = JSON.parse(cleanedText);

      // Validar estrutura
      if (!parsedData.etapas || !Array.isArray(parsedData.etapas)) {
        throw new Error('Estrutura de resposta inválida');
      }

      // Garantir IDs únicos e ordem sequencial
      parsedData.etapas.forEach((etapa: any, index: number) => {
        etapa.id = etapa.id || `etapa_${index + 1}`;
        etapa.ordem = index + 1;
        etapa.expandida = false;
        // Garantir que o tempo estimado não ultrapasse o limite e que haja recursos do School Power
        if (parseInt(etapa.tempoEstimado?.match(/\d+/)?.[0] || '0', 10) > 45) {
          etapa.tempoEstimado = "45 minutos";
        }
        // Adiciona atividades do School Power se não houver ou se a lista for pequena
        const atividadesSchoolPower = [
          "Resumo", "Lista de Exercícios", "Prova", "Mapa Mental", "Texto de Apoio",
          "Plano de Aula", "Sequência Didática", "Jogos Educativos", "Apresentação de Slides",
          "Proposta de Redação", "Simulado", "Caça-Palavras", "Palavras Cruzadas",
          "Experimento Científico", "Critérios de Avaliação", "Revisão Guiada", "Atividades de Matemática", "Quiz", "Charadas", "Corretor de Questões"
        ];
        if (!etapa.recursosUsados || etapa.recursosUsados.length < 2) {
          const atividadeAleatoria = atividadesSchoolPower[Math.floor(Math.random() * atividadesSchoolPower.length)];
          etapa.recursosUsados = [...(etapa.recursosUsados || []), atividadeAleatoria].slice(0, 2);
        }
      });

      // Ajustar o tempo total estimado para 45 minutos
      parsedData.tempoTotalEstimado = "45 minutos";

      return parsedData as DesenvolvimentoData;

    } catch (error) {
      console.error('Erro ao processar resposta da IA:', error);
      throw new Error('Erro ao processar resposta da IA');
    }
  }

  private static aplicarContextoAosDadosPadrao(contexto: any): DesenvolvimentoData {
    const dadosBase = { ...desenvolvimentoDataPadrao };

    // Lista de atividades do School Power para incluir nos recursos
    const atividadesSchoolPower = [
      "Resumo", "Lista de Exercícios", "Prova", "Mapa Mental", "Texto de Apoio",
      "Plano de Aula", "Sequência Didática", "Jogos Educativos", "Apresentação de Slides",
      "Proposta de Redação", "Simulado", "Caça-Palavras", "Palavras Cruzadas",
      "Experimento Científico", "Critérios de Avaliação", "Revisão Guiada", "Atividades de Matemática", "Quiz", "Charadas", "Corretor de Questões"
    ];

    if (contexto?.disciplina || contexto?.tema) {
      dadosBase.etapas = dadosBase.etapas.map((etapa, index) => {
        // Selecionar algumas atividades aleatórias do School Power
        const atividadesAleatorias = atividadesSchoolPower
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);

        return {
          ...etapa,
          descricao: `${etapa.descricao.split('...')[0]} relacionado ao tema "${contexto.tema || 'conteúdo específico'}" na disciplina de ${contexto.disciplina || 'estudos'}.`,
          recursosUsados: [...etapa.recursosUsados.slice(0, 1), ...atividadesAleatorias]
        };
      });
    }

    // Ajustar o tempo total estimado para 45 minutos
    dadosBase.tempoTotalEstimado = "45 minutos";
    // Ajustar tempo das etapas para não exceder 45 minutos no total
    let tempoTotalEtapas = 0;
    dadosBase.etapas.forEach(etapa => {
      const tempoMatch = etapa.tempoEstimado.match(/\d+/);
      if (tempoMatch) {
        tempoTotalEtapas += parseInt(tempoMatch[0], 10);
      }
    });

    if (tempoTotalEtapas > 45) {
      const fatorReducao = 45 / tempoTotalEtapas;
      let tempoAcumulado = 0;
      dadosBase.etapas.forEach((etapa, index) => {
        const tempoMatch = etapa.tempoEstimado.match(/\d+/);
        if (tempoMatch) {
          let novoTempo = Math.floor(parseInt(tempoMatch[0], 10) * fatorReducao);
          novoTempo = Math.max(novoTempo, 5); // Garante pelo menos 5 minutos por etapa
          etapa.tempoEstimado = `${novoTempo} minutos`;
          tempoAcumulado += novoTempo;
        }
        if (index === dadosBase.etapas.length - 1) {
          // Ajusta a última etapa para fechar em 45 minutos
          etapa.tempoEstimado = `${45 - tempoAcumulado + (tempoMatch ? parseInt(tempoMatch[0], 10) : 0)} minutos`;
        }
      });
    }


    return dadosBase;
  }

  static salvarEtapasDesenvolvimento(planoId: string, dados: DesenvolvimentoData): void {
    try {
      const key = `plano_desenvolvimento_${planoId}`;
      localStorage.setItem(key, JSON.stringify(dados));
      console.log('💾 Etapas de desenvolvimento salvas:', key);
    } catch (error) {
      console.error('❌ Erro ao salvar etapas de desenvolvimento:', error);
    }
  }

  static carregarEtapasDesenvolvimento(planoId: string): DesenvolvimentoData | null {
    try {
      const key = `plano_desenvolvimento_${planoId}`;
      const dados = localStorage.getItem(key);

      if (dados) {
        const parsedData = JSON.parse(dados) as DesenvolvimentoData;

        // Validar se os dados têm a estrutura esperada
        if (parsedData && parsedData.etapas && Array.isArray(parsedData.etapas)) {
          console.log('💾 Dados de desenvolvimento carregados:', parsedData);
          return {
            ...criarDadosPadrao(),
            ...parsedData,
            etapas: parsedData.etapas || [],
            sugestoesIA: parsedData.sugestoesIA || [],
            observacoesGerais: parsedData.observacoesGerais || ''
          };
        } else {
          console.warn('⚠️ Dados carregados não têm estrutura válida, usando dados padrão');
          return criarDadosPadrao();
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Erro ao carregar etapas de desenvolvimento:', error);
      return criarDadosPadrao();
    }
    return criarDadosPadrao();
  }
}