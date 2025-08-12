
import { geminiClient } from '../../../../utils/api/geminiClient';

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

export interface SequenciaDidaticaResult {
  success: boolean;
  data?: any;
  error?: string;
}

class SequenciaDidaticaBuilder {
  async construirSequenciaDidatica(data: SequenciaDidaticaData): Promise<SequenciaDidaticaResult> {
    try {
      console.log('🚀 Iniciando construção da Sequência Didática...');
      console.log('📊 Dados recebidos:', data);

      // Validar dados obrigatórios
      if (!data.tituloTemaAssunto || !data.disciplina || !data.anoSerie || !data.publicoAlvo || !data.objetivosAprendizagem) {
        console.error('❌ Dados obrigatórios faltando');
        return {
          success: false,
          error: 'Dados obrigatórios não fornecidos'
        };
      }

      // Converter strings para números
      const quantidadeAulas = parseInt(data.quantidadeAulas) || 4;
      const quantidadeDiagnosticos = parseInt(data.quantidadeDiagnosticos) || 1;
      const quantidadeAvaliacoes = parseInt(data.quantidadeAvaliacoes) || 2;

      console.log('📋 Quantidades validadas:', {
        aulas: quantidadeAulas,
        diagnosticos: quantidadeDiagnosticos,
        avaliacoes: quantidadeAvaliacoes
      });

      // Criar prompt para a IA
      const prompt = `
Você é um especialista em educação. Crie uma sequência didática detalhada com base nas seguintes informações:

DADOS DA SEQUÊNCIA DIDÁTICA:
- Título/Tema: ${data.tituloTemaAssunto}
- Disciplina: ${data.disciplina}
- Ano/Série: ${data.anoSerie}
- Público-alvo: ${data.publicoAlvo}
- Objetivos de Aprendizagem: ${data.objetivosAprendizagem}
- Quantidade de Aulas: ${quantidadeAulas}
- Quantidade de Diagnósticos: ${quantidadeDiagnosticos}
- Quantidade de Avaliações: ${quantidadeAvaliacoes}
${data.cronograma ? `- Cronograma: ${data.cronograma}` : ''}

RETORNE UM JSON VÁLIDO com a seguinte estrutura:
{
  "tituloTemaAssunto": "${data.tituloTemaAssunto}",
  "disciplina": "${data.disciplina}",
  "anoSerie": "${data.anoSerie}",
  "publicoAlvo": "${data.publicoAlvo}",
  "objetivosAprendizagem": "${data.objetivosAprendizagem}",
  "quantidadeAulas": "${quantidadeAulas}",
  "quantidadeDiagnosticos": "${quantidadeDiagnosticos}",
  "quantidadeAvaliacoes": "${quantidadeAvaliacoes}",
  "cronograma": "cronograma detalhado",
  "aulas": [
    {
      "numero": 1,
      "titulo": "título da aula",
      "descricao": "descrição detalhada",
      "objetivos": ["objetivo 1", "objetivo 2"],
      "metodologia": "metodologia utilizada",
      "recursos": ["recurso 1", "recurso 2"],
      "duracao": "50 minutos",
      "atividades": ["atividade 1", "atividade 2"]
    }
  ],
  "diagnosticos": [
    {
      "numero": 1,
      "titulo": "título do diagnóstico",
      "descricao": "descrição",
      "tipo": "Diagnóstica",
      "instrumentos": ["instrumento 1"],
      "duracao": "tempo estimado"
    }
  ],
  "avaliacoes": [
    {
      "numero": 1,
      "titulo": "título da avaliação",
      "descricao": "descrição",
      "tipo": "Formativa/Somativa",
      "instrumentos": ["instrumento 1"],
      "peso": "porcentagem"
    }
  ]
}

Crie ${quantidadeAulas} aulas detalhadas, ${quantidadeDiagnosticos} diagnósticos e ${quantidadeAvaliacoes} avaliações seguindo a estrutura acima.
`;

      console.log('🤖 Enviando prompt para IA...');

      // Chamar a IA
      const result = await geminiClient.generate(prompt);

      if (!result.success) {
        console.error('❌ Erro na IA:', result.error);
        return this.getFallbackSequencia(data);
      }

      console.log('✅ Resposta da IA recebida');

      // Verificar se os dados estão no formato correto
      let sequenciaData = result.data;
      
      // Se a resposta veio como string de conteúdo, tentar extrair JSON
      if (sequenciaData && sequenciaData.content && typeof sequenciaData.content === 'string') {
        try {
          sequenciaData = JSON.parse(sequenciaData.content);
        } catch (error) {
          console.error('❌ Erro ao parsear JSON da resposta:', error);
          return this.getFallbackSequencia(data);
        }
      }

      // Validar estrutura da resposta
      if (!sequenciaData || !sequenciaData.aulas || !Array.isArray(sequenciaData.aulas)) {
        console.error('❌ Estrutura de resposta inválida');
        return this.getFallbackSequencia(data);
      }

      console.log('✅ Sequência Didática construída com sucesso');
      console.log('📊 Estrutura final:', {
        aulas: sequenciaData.aulas?.length || 0,
        diagnosticos: sequenciaData.diagnosticos?.length || 0,
        avaliacoes: sequenciaData.avaliacoes?.length || 0
      });

      return {
        success: true,
        data: sequenciaData
      };

    } catch (error) {
      console.error('❌ Erro na construção da Sequência Didática:', error);
      return this.getFallbackSequencia(data);
    }
  }

  private getFallbackSequencia(data: SequenciaDidaticaData): SequenciaDidaticaResult {
    console.log('🔄 Usando fallback para Sequência Didática');

    const quantidadeAulas = parseInt(data.quantidadeAulas) || 4;
    const quantidadeDiagnosticos = parseInt(data.quantidadeDiagnosticos) || 1;
    const quantidadeAvaliacoes = parseInt(data.quantidadeAvaliacoes) || 2;

    // Gerar aulas baseadas na quantidade solicitada
    const aulas = [];
    for (let i = 1; i <= quantidadeAulas; i++) {
      aulas.push({
        numero: i,
        titulo: `Aula ${i} - ${data.tituloTemaAssunto}`,
        descricao: `Desenvolvimento do tema ${data.tituloTemaAssunto} - parte ${i}`,
        objetivos: [`Objetivo específico da aula ${i}`, "Desenvolver conhecimentos práticos"],
        metodologia: "Aula expositiva dialogada com atividades práticas",
        recursos: ["Quadro", "Material didático", "Recursos audiovisuais"],
        duracao: "50 minutos",
        atividades: [`Atividade prática ${i}`, "Discussão em grupo", "Exercícios aplicados"]
      });
    }

    // Gerar diagnósticos
    const diagnosticos = [];
    for (let i = 1; i <= quantidadeDiagnosticos; i++) {
      diagnosticos.push({
        numero: i,
        titulo: `Diagnóstico ${i}`,
        descricao: `Avaliação diagnóstica ${i} sobre ${data.tituloTemaAssunto}`,
        tipo: "Diagnóstica",
        instrumentos: ["Questionário", "Observação"],
        duracao: "30 minutos"
      });
    }

    // Gerar avaliações
    const avaliacoes = [];
    for (let i = 1; i <= quantidadeAvaliacoes; i++) {
      avaliacoes.push({
        numero: i,
        titulo: `Avaliação ${i}`,
        descricao: `Avaliação ${i} dos conhecimentos sobre ${data.tituloTemaAssunto}`,
        tipo: i === quantidadeAvaliacoes ? "Somativa" : "Formativa",
        instrumentos: ["Prova escrita", "Atividades práticas"],
        peso: `${Math.round(100/quantidadeAvaliacoes)}%`
      });
    }

    const fallbackData = {
      tituloTemaAssunto: data.tituloTemaAssunto,
      disciplina: data.disciplina,
      anoSerie: data.anoSerie,
      publicoAlvo: data.publicoAlvo,
      objetivosAprendizagem: data.objetivosAprendizagem,
      quantidadeAulas: data.quantidadeAulas,
      quantidadeDiagnosticos: data.quantidadeDiagnosticos,
      quantidadeAvaliacoes: data.quantidadeAvaliacoes,
      cronograma: data.cronograma || `Sequência de ${quantidadeAulas} aulas distribuídas adequadamente`,
      aulas,
      diagnosticos,
      avaliacoes
    };

    return {
      success: true,
      data: fallbackData
    };
  }
}

export const sequenciaDidaticaBuilder = new SequenciaDidaticaBuilder();
export default sequenciaDidaticaBuilder;
