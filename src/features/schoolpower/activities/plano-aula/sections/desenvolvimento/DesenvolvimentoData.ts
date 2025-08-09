
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
  if (!etapas || !Array.isArray(etapas) || etapas.length === 0) {
    return "0min";
  }
  
  const totalMinutos = Math.min(45, etapas.reduce((acc, etapa) => {
    const tempo = parseInt(etapa.tempoEstimado?.match(/\d+/)?.[0] || '0', 10);
    return acc + tempo;
  }, 0));

  return `${totalMinutos}min`;
};

// Dados padrão/fallback - GARANTINDO QUE SEMPRE EXISTE
export const desenvolvimentoDataPadrao: DesenvolvimentoData = {
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
      titulo: "3. Atividade Prática: Identificando Classes Gramaticais",
      descricao: "Atividade em grupos onde os alunos receberão frases para identificar substantivos e verbos. Cada grupo apresentará suas respostas e justificativas. Promover discussão sobre as descobertas e corrigir possíveis dúvidas de forma colaborativa.",
      tipoInteracao: "Atividade em grupos e apresentação",
      tempoEstimado: "20 minutos",
      recursosUsados: ["Folhas com exercícios", "Quiz Interativo", "Mapa Mental"],
      ordem: 3,
      expandida: false
    }
  ],
  tempoTotalEstimado: "45min",
  observacoesGerais: "Manter foco na participação ativa dos alunos durante toda a aula. Utilizar exemplos do cotidiano para facilitar a compreensão. Estar atento às dúvidas e promover um ambiente colaborativo de aprendizado.",
  sugestoesIA: [
    "Considere usar jogos interativos para tornar a identificação de classes gramaticais mais dinâmica",
    "Adicione exemplos visuais ou cards com palavras para facilitar a compreensão",
    "Implemente um sistema de pontuação para motivar a participação dos alunos"
  ]
};

export class DesenvolvimentoGeminiService {
  private static readonly GEMINI_API_KEY = 'AIzaSyAOGaQlsBFb2FzjOCmCORZAL8Hg0J4jVQ';
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  static async gerarEtapasDesenvolvimento(contextoPlano: any): Promise<DesenvolvimentoData> {
    try {
      console.log('🤖 DesenvolvimentoGeminiService: Iniciando geração com contexto:', contextoPlano);

      // Verificar se há contexto válido
      if (!contextoPlano || (!contextoPlano.disciplina && !contextoPlano.tema && !contextoPlano.objetivo)) {
        console.log('⚠️ Contexto insuficiente, retornando dados padrão');
        return desenvolvimentoDataPadrao;
      }

      const prompt = this.construirPrompt(contextoPlano);
      console.log('📝 Prompt construído:', prompt.substring(0, 200) + '...');

      const response = await fetch(`${this.GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📡 Resposta da API recebida:', data);

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Resposta da API inválida');
      }

      const textoResposta = data.candidates[0].content.parts[0].text;
      return this.processarRespostaGemini(textoResposta, contextoPlano);

    } catch (error) {
      console.error('❌ Erro ao gerar etapas via Gemini:', error);
      // Retornar dados padrão em caso de erro
      return desenvolvimentoDataPadrao;
    }
  }

  private static construirPrompt(contexto: any): string {
    return `
Você é um especialista em pedagogia e criação de planos de aula. Crie etapas de desenvolvimento detalhadas para um plano de aula com as seguintes informações:

**Contexto do Plano:**
- Disciplina: ${contexto.disciplina || 'Não especificada'}
- Tema: ${contexto.tema || 'Não especificado'}
- Objetivo: ${contexto.objetivo || 'Não especificado'}
- Duração: ${contexto.duracao || '45 minutos'}
- Ano/Série: ${contexto.anoSerie || 'Não especificado'}

**Instruções:**
1. Crie entre 3 a 5 etapas de desenvolvimento progressivas
2. Cada etapa deve ter duração entre 5-20 minutos
3. O tempo total não deve exceder 45 minutos
4. Inclua diferentes tipos de interação (apresentação, prática, discussão, etc.)
5. Sugira recursos específicos do School Power (Quiz Interativo, Mapa Mental, etc.)

**Formato de Resposta (JSON VÁLIDO):**
{
  "etapas": [
    {
      "id": "etapa_1",
      "titulo": "Título da Etapa",
      "descricao": "Descrição detalhada da atividade e metodologia",
      "tipoInteracao": "Tipo de interação pedagógica",
      "tempoEstimado": "X minutos",
      "recursosUsados": ["Recurso 1", "Recurso 2"],
      "ordem": 1,
      "expandida": false
    }
  ],
  "tempoTotalEstimado": "45min",
  "observacoesGerais": "Observações importantes para o professor",
  "sugestoesIA": ["Sugestão 1", "Sugestão 2"]
}

Responda APENAS com o JSON válido, sem texto adicional.
`;
  }

  private static processarRespostaGemini(textoResposta: string, contexto: any): DesenvolvimentoData {
    try {
      console.log('🔄 Processando resposta do Gemini...');
      
      // Limpar e extrair JSON da resposta
      let cleanedText = textoResposta.trim();
      
      // Remover markdown se presente
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      } else if (cleanedText.includes('```')) {
        cleanedText = cleanedText.replace(/```\s*/g, '').replace(/```\s*$/g, '');
      }
      
      // Encontrar o JSON na resposta
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedText = jsonMatch[0];
      }
      
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
        
        // Garantir que o tempo estimado não ultrapasse o limite
        if (parseInt(etapa.tempoEstimado?.match(/\d+/)?.[0] || '0', 10) > 45) {
          etapa.tempoEstimado = "45 minutos";
        }
        
        // Adiciona atividades do School Power se não houver ou se a lista for pequena
        const atividadesSchoolPower = [
          "Resumo", "Lista de Exercícios", "Prova", "Mapa Mental", "Texto de Apoio",
          "Plano de Aula", "Sequência Didática", "Jogos Educativos", "Apresentação de Slides",
          "Proposta de Redação", "Simulado", "Caça-Palavras", "Palavras Cruzadas",
          "Experimento Científico", "Critérios de Avaliação", "Revisão Guiada", 
          "Atividades de Matemática", "Quiz", "Charadas", "Corretor de Questões"
        ];
        
        if (!etapa.recursosUsados || etapa.recursosUsados.length < 2) {
          const atividadeAleatoria = atividadesSchoolPower[Math.floor(Math.random() * atividadesSchoolPower.length)];
          etapa.recursosUsados = etapa.recursosUsados || [];
          if (!etapa.recursosUsados.includes(atividadeAleatoria)) {
            etapa.recursosUsados.push(atividadeAleatoria);
          }
        }
      });

      // Calcular tempo total e ajustar se necessário
      const dadosBase: DesenvolvimentoData = {
        etapas: parsedData.etapas,
        tempoTotalEstimado: calcularTempoTotal(parsedData.etapas),
        observacoesGerais: parsedData.observacoesGerais || "Plano de aula gerado automaticamente. Adapte conforme necessário para sua turma.",
        sugestoesIA: Array.isArray(parsedData.sugestoesIA) ? parsedData.sugestoesIA : []
      };

      // Ajuste de tempo se necessário
      let tempoAcumulado = 0;
      dadosBase.etapas.forEach((etapa, index) => {
        const tempoMatch = etapa.tempoEstimado.match(/\d+/);
        const tempoEtapa = tempoMatch ? parseInt(tempoMatch[0], 10) : 0;
        tempoAcumulado += tempoEtapa;
        
        if (index === dadosBase.etapas.length - 1) {
          // Ajusta a última etapa para fechar em 45 minutos
          etapa.tempoEstimado = `${45 - tempoAcumulado + (tempoMatch ? parseInt(tempoMatch[0], 10) : 0)} minutos`;
        }
      });

      console.log('✅ Dados processados com sucesso:', dadosBase);
      return dadosBase;

    } catch (error) {
      console.error('❌ Erro ao processar resposta:', error);
      console.error('📄 Texto original:', textoResposta);
      return desenvolvimentoDataPadrao;
    }
  }

  static salvarEtapasDesenvolvimento(planoId: string, dados: DesenvolvimentoData): void {
    try {
      if (!planoId || !dados) {
        console.warn('⚠️ ID do plano ou dados inválidos para salvamento');
        return;
      }
      
      const key = `plano_desenvolvimento_${planoId}`;
      localStorage.setItem(key, JSON.stringify(dados));
      console.log('💾 Etapas de desenvolvimento salvas:', key);
    } catch (error) {
      console.error('❌ Erro ao salvar etapas de desenvolvimento:', error);
    }
  }

  static carregarEtapasDesenvolvimento(planoId: string): DesenvolvimentoData | null {
    try {
      if (!planoId) {
        console.warn('⚠️ ID do plano inválido para carregamento');
        return null;
      }
      
      const key = `plano_desenvolvimento_${planoId}`;
      const dados = localStorage.getItem(key);

      if (dados) {
        const parsedData = JSON.parse(dados);
        
        // Validar dados carregados
        if (!parsedData.etapas || !Array.isArray(parsedData.etapas)) {
          console.warn('⚠️ Dados carregados inválidos, usando dados padrão');
          return desenvolvimentoDataPadrao;
        }
        
        console.log('📂 Dados de desenvolvimento carregados:', parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error('❌ Erro ao carregar etapas de desenvolvimento:', error);
    }
    return null;
  }

  static limparDadosDesenvolvimento(planoId: string): void {
    try {
      if (!planoId) return;
      
      const key = `plano_desenvolvimento_${planoId}`;
      localStorage.removeItem(key);
      console.log('🗑️ Dados de desenvolvimento removidos:', key);
    } catch (error) {
      console.error('❌ Erro ao limpar dados de desenvolvimento:', error);
    }
  }

  static criarEtapaPadrao(): EtapaDesenvolvimento {
    return {
      id: `etapa_${Date.now()}`,
      titulo: "Nova Etapa",
      descricao: "Descrição da etapa de desenvolvimento",
      tipoInteracao: "Apresentação",
      tempoEstimado: "10 minutos",
      recursosUsados: ["Lousa", "Quiz Interativo"],
      ordem: 1,
      expandida: false
    };
  }
}

// Garantir que desenvolvimentoDataPadrao está sempre disponível
export { desenvolvimentoDataPadrao as default };
