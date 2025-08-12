
import { GeminiClient } from '../../../../utils/api/geminiClient';

export interface SequenciaDidaticaData {
  tituloTemaAssunto: string;
  disciplina: string;
  anoSerie: string;
  publicoAlvo: string;
  objetivosAprendizagem: string;
  quantidadeAulas: string;
  quantidadeDiagnosticos: string;
  quantidadeAvaliacoes: string;
  cronograma?: string;
}

export interface AulaDetalhada {
  numero: number;
  titulo: string;
  objetivos: string[];
  conteudo: string;
  metodologia: string;
  recursos: string[];
  avaliacao: string;
  duracaoEstimada: string;
  observacoes?: string;
}

export interface DiagnosticoDetalhado {
  tipo: string;
  titulo: string;
  objetivos: string[];
  instrumentos: string[];
  criterios: string[];
  aplicacao: string;
}

export interface AvaliacaoDetalhada {
  tipo: string;
  titulo: string;
  objetivos: string[];
  instrumentos: string[];
  criterios: string[];
  peso: string;
  aplicacao: string;
}

export interface SequenciaDidaticaCompleta {
  tituloTemaAssunto: string;
  disciplina: string;
  anoSerie: string;
  publicoAlvo: string;
  objetivosAprendizagem: string;
  quantidadeAulas: number;
  quantidadeDiagnosticos: number;
  quantidadeAvaliacoes: number;
  cronograma?: string;
  aulas: AulaDetalhada[];
  diagnosticos: DiagnosticoDetalhado[];
  avaliacoes: AvaliacaoDetalhada[];
  recursos?: string[];
  bibliografia?: string[];
  observacoes?: string;
  dataGeracao: string;
}

class SequenciaDidaticaBuilderClass {
  private geminiClient: GeminiClient;

  constructor() {
    this.geminiClient = new GeminiClient();
  }

  async construirSequenciaDidatica(dados: SequenciaDidaticaData): Promise<{
    success: boolean;
    data?: SequenciaDidaticaCompleta;
    error?: string;
  }> {
    try {
      console.log('🏗️ Iniciando construção da Sequência Didática...', dados);

      // Validar dados de entrada
      const validationResult = this.validarDadosEntrada(dados);
      if (!validationResult.valid) {
        return {
          success: false,
          error: `Dados inválidos: ${validationResult.errors.join(', ')}`
        };
      }

      const prompt = this.gerarPromptSequenciaDidatica(dados);
      
      console.log('📤 Enviando prompt para IA...');
      const response = await this.geminiClient.generateContent(prompt);

      if (!response.success) {
        throw new Error(response.error || 'Erro na geração com IA');
      }

      console.log('📥 Resposta recebida, processando...');
      const sequenciaCompleta = this.processarRespostaIA(response.data, dados);

      console.log('✅ Sequência Didática construída com sucesso!');
      return {
        success: true,
        data: sequenciaCompleta
      };

    } catch (error) {
      console.error('❌ Erro na construção da Sequência Didática:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido na construção'
      };
    }
  }

  private validarDadosEntrada(dados: SequenciaDidaticaData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dados.tituloTemaAssunto?.trim()) {
      errors.push('Título do tema/assunto é obrigatório');
    }
    if (!dados.disciplina?.trim()) {
      errors.push('Disciplina é obrigatória');
    }
    if (!dados.anoSerie?.trim()) {
      errors.push('Ano/série é obrigatório');
    }
    if (!dados.publicoAlvo?.trim()) {
      errors.push('Público-alvo é obrigatório');
    }
    if (!dados.objetivosAprendizagem?.trim()) {
      errors.push('Objetivos de aprendizagem são obrigatórios');
    }

    const quantAulas = parseInt(dados.quantidadeAulas || '0');
    if (quantAulas <= 0) {
      errors.push('Quantidade de aulas deve ser maior que 0');
    }

    const quantDiag = parseInt(dados.quantidadeDiagnosticos || '0');
    if (quantDiag < 0) {
      errors.push('Quantidade de diagnósticos não pode ser negativa');
    }

    const quantAval = parseInt(dados.quantidadeAvaliacoes || '0');
    if (quantAval < 0) {
      errors.push('Quantidade de avaliações não pode ser negativa');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private gerarPromptSequenciaDidatica(dados: SequenciaDidaticaData): string {
    return `
Você é um especialista em pedagogia e planejamento educacional. Crie uma sequência didática completa e detalhada baseada nos dados fornecidos.

**DADOS DA SEQUÊNCIA DIDÁTICA:**
- Título/Tema/Assunto: ${dados.tituloTemaAssunto}
- Disciplina: ${dados.disciplina}
- Ano/Série: ${dados.anoSerie}
- Público-alvo: ${dados.publicoAlvo}
- Objetivos de Aprendizagem: ${dados.objetivosAprendizagem}
- Quantidade de Aulas: ${dados.quantidadeAulas}
- Quantidade de Diagnósticos: ${dados.quantidadeDiagnosticos}
- Quantidade de Avaliações: ${dados.quantidadeAvaliacoes}
${dados.cronograma ? `- Cronograma: ${dados.cronograma}` : ''}

**INSTRUÇÕES PARA A SEQUÊNCIA DIDÁTICA:**

1. **ESTRUTURA GERAL:**
   - Crie exatamente ${dados.quantidadeAulas} aulas detalhadas
   - Desenvolva ${dados.quantidadeDiagnosticos} diagnósticos (se maior que 0)
   - Elabore ${dados.quantidadeAvaliacoes} avaliações (se maior que 0)

2. **PARA CADA AULA, INCLUA:**
   - Número da aula
   - Título específico e engajador
   - 3-5 objetivos específicos
   - Conteúdo detalhado a ser trabalhado
   - Metodologia de ensino
   - 5-8 recursos necessários
   - Forma de avaliação
   - Duração estimada
   - Observações importantes

3. **PARA CADA DIAGNÓSTICO:**
   - Tipo de diagnóstico
   - Título
   - Objetivos
   - Instrumentos de aplicação
   - Critérios de análise
   - Momento de aplicação

4. **PARA CADA AVALIAÇÃO:**
   - Tipo de avaliação
   - Título
   - Objetivos
   - Instrumentos
   - Critérios de correção
   - Peso na nota
   - Momento de aplicação

**RESPONDA APENAS COM UM JSON VÁLIDO seguindo exatamente esta estrutura:**

{
  "tituloTemaAssunto": "${dados.tituloTemaAssunto}",
  "disciplina": "${dados.disciplina}",
  "anoSerie": "${dados.anoSerie}",
  "publicoAlvo": "${dados.publicoAlvo}",
  "objetivosAprendizagem": "${dados.objetivosAprendizagem}",
  "quantidadeAulas": ${dados.quantidadeAulas},
  "quantidadeDiagnosticos": ${dados.quantidadeDiagnosticos},
  "quantidadeAvaliacoes": ${dados.quantidadeAvaliacoes},
  "cronograma": "${dados.cronograma || ''}",
  "aulas": [
    {
      "numero": 1,
      "titulo": "Título da Aula 1",
      "objetivos": ["Objetivo 1", "Objetivo 2", "Objetivo 3"],
      "conteudo": "Descrição detalhada do conteúdo...",
      "metodologia": "Metodologia de ensino...",
      "recursos": ["Recurso 1", "Recurso 2", "Recurso 3"],
      "avaliacao": "Forma de avaliação...",
      "duracaoEstimada": "50 minutos",
      "observacoes": "Observações importantes..."
    }
  ],
  "diagnosticos": [
    {
      "tipo": "Diagnóstico Inicial",
      "titulo": "Título do Diagnóstico",
      "objetivos": ["Objetivo 1", "Objetivo 2"],
      "instrumentos": ["Instrumento 1", "Instrumento 2"],
      "criterios": ["Critério 1", "Critério 2"],
      "aplicacao": "Momento e forma de aplicação"
    }
  ],
  "avaliacoes": [
    {
      "tipo": "Avaliação Formativa",
      "titulo": "Título da Avaliação",
      "objetivos": ["Objetivo 1", "Objetivo 2"],
      "instrumentos": ["Instrumento 1", "Instrumento 2"],
      "criterios": ["Critério 1", "Critério 2"],
      "peso": "30%",
      "aplicacao": "Momento e forma de aplicação"
    }
  ],
  "recursos": ["Recurso geral 1", "Recurso geral 2"],
  "bibliografia": ["Referência 1", "Referência 2"],
  "observacoes": "Observações gerais da sequência didática...",
  "dataGeracao": "${new Date().toISOString()}"
}

IMPORTANTE: Responda APENAS com o JSON válido, sem texto adicional antes ou depois.
`;
  }

  private processarRespostaIA(resposta: string, dadosOriginais: SequenciaDidaticaData): SequenciaDidaticaCompleta {
    try {
      // Tentar parsear a resposta como JSON
      let dados: any;
      
      // Limpar a resposta removendo possíveis caracteres extras
      const respostaLimpa = resposta.trim().replace(/```json|```/g, '');
      
      try {
        dados = JSON.parse(respostaLimpa);
      } catch (parseError) {
        console.warn('⚠️ Erro ao parsear JSON, tentando extrair...');
        // Tentar extrair JSON da resposta
        const jsonMatch = respostaLimpa.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          dados = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Não foi possível extrair JSON válido da resposta');
        }
      }

      // Validar e garantir estrutura mínima
      const sequenciaCompleta: SequenciaDidaticaCompleta = {
        tituloTemaAssunto: dados.tituloTemaAssunto || dadosOriginais.tituloTemaAssunto,
        disciplina: dados.disciplina || dadosOriginais.disciplina,
        anoSerie: dados.anoSerie || dadosOriginais.anoSerie,
        publicoAlvo: dados.publicoAlvo || dadosOriginais.publicoAlvo,
        objetivosAprendizagem: dados.objetivosAprendizagem || dadosOriginais.objetivosAprendizagem,
        quantidadeAulas: parseInt(dadosOriginais.quantidadeAulas),
        quantidadeDiagnosticos: parseInt(dadosOriginais.quantidadeDiagnosticos),
        quantidadeAvaliacoes: parseInt(dadosOriginais.quantidadeAvaliacoes),
        cronograma: dados.cronograma || dadosOriginais.cronograma || '',
        aulas: dados.aulas || [],
        diagnosticos: dados.diagnosticos || [],
        avaliacoes: dados.avaliacoes || [],
        recursos: dados.recursos || [],
        bibliografia: dados.bibliografia || [],
        observacoes: dados.observacoes || '',
        dataGeracao: new Date().toISOString()
      };

      // Verificar se o número de aulas está correto
      const quantidadeEsperada = parseInt(dadosOriginais.quantidadeAulas);
      if (sequenciaCompleta.aulas.length !== quantidadeEsperada) {
        console.warn(`⚠️ Número de aulas geradas (${sequenciaCompleta.aulas.length}) diferente do esperado (${quantidadeEsperada})`);
      }

      return sequenciaCompleta;

    } catch (error) {
      console.error('❌ Erro ao processar resposta da IA:', error);
      
      // Retornar estrutura básica em caso de erro
      return {
        tituloTemaAssunto: dadosOriginais.tituloTemaAssunto,
        disciplina: dadosOriginais.disciplina,
        anoSerie: dadosOriginais.anoSerie,
        publicoAlvo: dadosOriginais.publicoAlvo,
        objetivosAprendizagem: dadosOriginais.objetivosAprendizagem,
        quantidadeAulas: parseInt(dadosOriginais.quantidadeAulas),
        quantidadeDiagnosticos: parseInt(dadosOriginais.quantidadeDiagnosticos),
        quantidadeAvaliacoes: parseInt(dadosOriginais.quantidadeAvaliacoes),
        cronograma: dadosOriginais.cronograma || '',
        aulas: [],
        diagnosticos: [],
        avaliacoes: [],
        recursos: [],
        bibliografia: [],
        observacoes: 'Erro na geração automática. Conteúdo deve ser desenvolvido manualmente.',
        dataGeracao: new Date().toISOString()
      };
    }
  }
}

// Instância singleton
export const sequenciaDidaticaBuilder = new SequenciaDidaticaBuilderClass();

// Export da classe também
export { SequenciaDidaticaBuilderClass as SequenciaDidaticaBuilder };

// Export default
export default sequenciaDidaticaBuilder;
