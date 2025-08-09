// Dados estruturados para a seção de Desenvolvimento do Plano de Aula

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
  tempoTotalEstimado?: string;
  observacoesGerais?: string;
  metodologiaGeral?: string;
  recursosComplementares?: string[];
  sugestoesIA?: string[];
}

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

// Função para calcular tempo total das etapas
function calcularTempoTotal(etapas: EtapaDesenvolvimento[]): string {
  if (!etapas || etapas.length === 0) return "0 minutos";

  let totalMinutos = 0;
  etapas.forEach(etapa => {
    const match = etapa.tempoEstimado.match(/\d+/);
    if (match) {
      totalMinutos += parseInt(match[0], 10);
    }
  });

  return totalMinutos > 60 ? `${Math.floor(totalMinutos / 60)}h ${totalMinutos % 60}min` : `${totalMinutos}min`;
}

// Classe para gerenciar dados de desenvolvimento via Gemini
export class DesenvolvimentoGeminiService {
  private static readonly GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyB0wPaEv6T0C-2_z3rOwRjlQ-HQXPPfXF8';
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  static async gerarEtapasDesenvolvimento(contextoPlano: any): Promise<DesenvolvimentoData> {
    try {
      console.log('🚀 Iniciando geração de etapas via Gemini...', contextoPlano);

      if (!contextoPlano) {
        console.warn('⚠️ Contexto do plano não fornecido, usando dados padrão');
        return desenvolvimentoDataPadrao;
      }

      // Preparar prompt para o Gemini
      const prompt = this.criarPromptDesenvolvimento(contextoPlano);

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
            maxOutputTokens: 8192,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API Gemini: ${response.status}`);
      }

      const data = await response.json();

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Resposta inválida da API Gemini');
      }

      const textoResposta = data.candidates[0].content.parts[0].text;
      console.log('📝 Resposta bruta do Gemini:', textoResposta);

      return this.processarRespostaGemini(textoResposta);

    } catch (error) {
      console.error('❌ Erro ao gerar etapas via Gemini:', error);
      return desenvolvimentoDataPadrao;
    }
  }

  private static criarPromptDesenvolvimento(contextoPlano: any): string {
    return `
Baseado no seguinte contexto de plano de aula, gere APENAS um JSON válido com as etapas de desenvolvimento:

CONTEXTO:
- Disciplina: ${contextoPlano.disciplina || 'Não informado'}
- Tema: ${contextoPlano.tema || 'Não informado'}
- Série: ${contextoPlano.serie || 'Não informado'}
- Duração: ${contextoPlano.duracao || '45 minutos'}
- Objetivos: ${contextoPlano.objetivos || 'Não informado'}

Retorne APENAS um JSON válido seguindo esta estrutura exata:

{
  "etapas": [
    {
      "id": "etapa_1",
      "titulo": "Título da etapa",
      "descricao": "Descrição detalhada da etapa",
      "tipoInteracao": "Tipo de interação",
      "tempoEstimado": "X minutos",
      "recursosUsados": ["recurso1", "recurso2"],
      "ordem": 1,
      "expandida": false
    }
  ],
  "tempoTotalEstimado": "45min",
  "observacoesGerais": "Observações gerais do plano",
  "sugestoesIA": ["sugestão1", "sugestão2", "sugestão3"]
}

IMPORTANTE: 
- Retorne APENAS o JSON, sem texto adicional
- Gere entre 3 a 5 etapas
- O tempo total deve somar aproximadamente ${contextoPlano.duracao || '45 minutos'}
- Use recursos variados e apropriados para a disciplina
`;
  }

  private static processarRespostaGemini(textoResposta: string): DesenvolvimentoData {
    try {
      console.log('🔄 Processando resposta do Gemini...');

      let cleanedText = textoResposta.trim();

      // Remover markdown se presente
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      } else if (cleanedText.includes('```')) {
        cleanedText = cleanedText.replace(/```\s*/g, '').replace(/```\s*$/g, '');
      }

      // Remover texto antes e depois do JSON
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
      }

      console.log('🔧 Texto limpo para parsing:', cleanedText);

      const parsedData = JSON.parse(cleanedText);

      // Validar estrutura básica
      if (!parsedData.etapas || !Array.isArray(parsedData.etapas)) {
        console.warn('⚠️ Estrutura inválida, usando dados padrão');
        return desenvolvimentoDataPadrao;
      }

      // Validar e corrigir cada etapa
      parsedData.etapas = parsedData.etapas.map((etapa: any, index: number) => ({
        id: etapa.id || `etapa_${index + 1}`,
        titulo: etapa.titulo || `Etapa ${index + 1}`,
        descricao: etapa.descricao || 'Descrição não fornecida',
        tipoInteracao: etapa.tipoInteracao || 'Apresentação',
        tempoEstimado: etapa.tempoEstimado || '10 minutos',
        recursosUsados: Array.isArray(etapa.recursosUsados) ? etapa.recursosUsados : ['Recurso básico'],
        ordem: etapa.ordem || index + 1,
        expandida: false
      }));

      // Adicionar recursos aleatórios do School Power se necessário
      const recursosSchoolPower = [
        "Quiz Interativo", "Mapa Mental", "Organizador Gráfico", 
        "Texto de Apoio", "Lista de Exercícios", "Proposta de Redação",
        "Simulado", "Jogos Educativos", "Apresentação de Slides"
      ];

      parsedData.etapas.forEach((etapa: any) => {
        if (etapa.recursosUsados.length < 3 && Math.random() > 0.5) {
          const atividadeAleatoria = recursosSchoolPower[Math.floor(Math.random() * recursosSchoolPower.length)];
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

// Função para obter dados do desenvolvimento com fallback seguro
export function obterDadosDesenvolvimento(dados?: any): DesenvolvimentoData {
  if (!dados) {
    console.log('📚 Usando dados padrão para desenvolvimento');
    return desenvolvimentoDataPadrao;
  }

  // Se os dados existem mas não têm a estrutura esperada, usar dados padrão
  if (!dados.etapas || !Array.isArray(dados.etapas)) {
    console.log('📚 Dados inválidos, usando dados padrão para desenvolvimento');
    return desenvolvimentoDataPadrao;
  }

  return {
    etapas: dados.etapas.map((etapa: any, index: number) => ({
      id: etapa.id || `etapa_${index + 1}`,
      titulo: etapa.titulo || `Etapa ${index + 1}`,
      descricao: etapa.descricao || "Descrição não disponível",
      tipoInteracao: etapa.tipoInteracao || "Interação não especificada",
      tempoEstimado: etapa.tempoEstimado || "Tempo não especificado",
      recursosUsados: Array.isArray(etapa.recursosUsados) ? etapa.recursosUsados : [],
      ordem: etapa.ordem || index + 1,
      expandida: false // Sempre começar fechado
    })),
    observacoesGerais: dados.observacoesGerais || desenvolvimentoDataPadrao.observacoesGerais,
    metodologiaGeral: dados.metodologiaGeral || desenvolvimentoDataPadrao.metodologiaGeral,
    recursosComplementares: dados.recursosComplementares || desenvolvimentoDataPadrao.recursosComplementares
  };
}