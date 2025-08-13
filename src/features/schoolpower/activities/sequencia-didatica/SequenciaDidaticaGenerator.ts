
import { GeminiClient } from '@/utils/api/geminiClient';
import { sequenciaDidaticaPrompt } from '../../prompts/sequenciaDidaticaPrompt';

export interface SequenciaDidaticaData {
  tituloTemaAssunto: string;
  objetivosAprendizagem: string;
  quantidadeAulas: number;
  quantidadeDiagnosticos: number;
  quantidadeAvaliacoes: number;
  aulas: AulaData[];
  diagnosticos: DiagnosticoData[];
  avaliacoes: AvaliacaoData[];
}

export interface AulaData {
  titulo: string;
  objetivoEspecifico: string;
  resumo: string;
  etapas: EtapaAula[];
  recursos: string[];
  atividadePratica: string;
  duracao: string;
}

export interface EtapaAula {
  tipo: string;
  tempo: string;
  descricao: string;
  cor: string;
}

export interface DiagnosticoData {
  titulo: string;
  objetivoAvaliativo: string;
  tipoAvaliacao: string;
  quantidadeQuestoes: number;
  formato: string;
  criteriosCorrecao: CriterioCorrecao[];
  tempo: string;
}

export interface CriterioCorrecao {
  faixa: string;
  resultado: string;
  cor: string;
}

export interface AvaliacaoData {
  titulo: string;
  objetivoAvaliativo: string;
  tipoAvaliacao: string;
  quantidadeQuestoes: number;
  valorTotal: string;
  composicao: ComposicaoAvaliacao[];
  gabarito: string;
  tempo: string;
}

export interface ComposicaoAvaliacao {
  tipo: string;
  quantidade: number;
  pontos: string;
}

export class SequenciaDidaticaGenerator {
  private geminiClient: GeminiClient;

  constructor() {
    this.geminiClient = new GeminiClient();
  }

  async generateSequenciaDidatica(contextData: any): Promise<SequenciaDidaticaData> {
    try {
      console.log('🎯 Iniciando geração da Sequência Didática com dados:', contextData);

      // Construir o prompt específico para Sequência Didática
      const prompt = this.buildSequenciaDidaticaPrompt(contextData);
      console.log('📝 Prompt construído para Gemini API');

      // Chamar a API Gemini
      const response = await this.geminiClient.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 8000,
        topP: 0.9,
        topK: 40
      });

      if (!response.success) {
        throw new Error(`Erro na API Gemini: ${response.error}`);
      }

      // Processar a resposta da IA
      const sequenciaData = this.parseGeminiResponse(response.data);
      console.log('✅ Sequência Didática gerada com sucesso');

      return sequenciaData;
    } catch (error) {
      console.error('❌ Erro ao gerar Sequência Didática:', error);
      throw error;
    }
  }

  private buildSequenciaDidaticaPrompt(contextData: any): string {
    const {
      disciplina = 'Matemática',
      tema = 'Funções do 1º Grau',
      anoEscolaridade = '9º ano',
      objetivos = 'Compreender e aplicar conceitos de função linear',
      quantidadeAulas = 4,
      quantidadeDiagnosticos = 2,
      quantidadeAvaliacoes = 2,
      duracaoAula = '50 minutos'
    } = contextData;

    return `
Crie uma sequência didática completa e detalhada seguindo rigorosamente o formato JSON abaixo:

CONTEXTO EDUCACIONAL:
- Disciplina: ${disciplina}
- Tema: ${tema}
- Ano de Escolaridade: ${anoEscolaridade}
- Objetivos de Aprendizagem: ${objetivos}
- Quantidade de Aulas: ${quantidadeAulas}
- Quantidade de Diagnósticos: ${quantidadeDiagnosticos}
- Quantidade de Avaliações: ${quantidadeAvaliacoes}
- Duração por Aula: ${duracaoAula}

FORMATO DE RESPOSTA OBRIGATÓRIO (JSON):
{
  "tituloTemaAssunto": "Título claro e específico do tema",
  "objetivosAprendizagem": "Objetivos detalhados de aprendizagem",
  "quantidadeAulas": ${quantidadeAulas},
  "quantidadeDiagnosticos": ${quantidadeDiagnosticos},
  "quantidadeAvaliacoes": ${quantidadeAvaliacoes},
  "aulas": [
    {
      "titulo": "Título específico da aula",
      "objetivoEspecifico": "Objetivo específico desta aula",
      "resumo": "Resumo detalhado do conteúdo da aula",
      "etapas": [
        {
          "tipo": "Introdução",
          "tempo": "10 min",
          "descricao": "Descrição detalhada da etapa",
          "cor": "green"
        },
        {
          "tipo": "Desenvolvimento",
          "tempo": "30 min",
          "descricao": "Descrição detalhada da etapa",
          "cor": "orange"
        },
        {
          "tipo": "Fechamento",
          "tempo": "10 min",
          "descricao": "Descrição detalhada da etapa",
          "cor": "purple"
        }
      ],
      "recursos": ["Recurso 1", "Recurso 2", "Recurso 3"],
      "atividadePratica": "Descrição detalhada da atividade prática",
      "duracao": "${duracaoAula}"
    }
  ],
  "diagnosticos": [
    {
      "titulo": "Título específico do diagnóstico",
      "objetivoAvaliativo": "Objetivo específico da avaliação diagnóstica",
      "tipoAvaliacao": "Quiz Interativo",
      "quantidadeQuestoes": 8,
      "formato": "Múltipla escolha",
      "criteriosCorrecao": [
        {
          "faixa": "Excelente (7-8 acertos)",
          "resultado": "Pronto para avançar",
          "cor": "text-green-600"
        },
        {
          "faixa": "Bom (5-6 acertos)",
          "resultado": "Revisão leve",
          "cor": "text-yellow-600"
        },
        {
          "faixa": "Precisa melhorar (<5)",
          "resultado": "Revisão necessária",
          "cor": "text-red-600"
        }
      ],
      "tempo": "20 min"
    }
  ],
  "avaliacoes": [
    {
      "titulo": "Título específico da avaliação",
      "objetivoAvaliativo": "Objetivo específico da avaliação somativa",
      "tipoAvaliacao": "Prova Escrita",
      "quantidadeQuestoes": 12,
      "valorTotal": "10,0 pontos",
      "composicao": [
        {
          "tipo": "Múltipla escolha",
          "quantidade": 8,
          "pontos": "6,0 pts"
        },
        {
          "tipo": "Discursivas",
          "quantidade": 4,
          "pontos": "4,0 pts"
        }
      ],
      "gabarito": "Disponível após aplicação com critérios detalhados",
      "tempo": "45 min"
    }
  ]
}

INSTRUÇÕES IMPORTANTES:
1. Gere exatamente ${quantidadeAulas} aulas completas
2. Gere exatamente ${quantidadeDiagnosticos} diagnósticos completos
3. Gere exatamente ${quantidadeAvaliacoes} avaliações completas
4. Cada aula deve ter pelo menos 3 etapas (Introdução, Desenvolvimento, Fechamento)
5. Os recursos devem ser específicos e adequados ao tema
6. As atividades práticas devem ser detalhadas e aplicáveis
7. Critérios de correção devem ser claros e objetivos
8. Responda APENAS com o JSON válido, sem texto adicional
`;
  }

  private parseGeminiResponse(responseText: string): SequenciaDidaticaData {
    try {
      // Extrair JSON da resposta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Formato JSON inválido na resposta da IA');
      }

      const jsonString = jsonMatch[0];
      const parsedData = JSON.parse(jsonString);

      // Validar estrutura obrigatória
      if (!parsedData.tituloTemaAssunto || !parsedData.objetivosAprendizagem) {
        throw new Error('Dados obrigatórios ausentes na resposta da IA');
      }

      if (!parsedData.aulas || !Array.isArray(parsedData.aulas)) {
        throw new Error('Array de aulas inválido na resposta da IA');
      }

      if (!parsedData.diagnosticos || !Array.isArray(parsedData.diagnosticos)) {
        throw new Error('Array de diagnósticos inválido na resposta da IA');
      }

      if (!parsedData.avaliacoes || !Array.isArray(parsedData.avaliacoes)) {
        throw new Error('Array de avaliações inválido na resposta da IA');
      }

      // Adicionar metadados de geração
      parsedData.isGeneratedByAI = true;
      parsedData.generatedAt = new Date().toISOString();

      console.log('🎯 Sequência Didática processada com sucesso:', {
        titulo: parsedData.tituloTemaAssunto,
        aulas: parsedData.aulas.length,
        diagnosticos: parsedData.diagnosticos.length,
        avaliacoes: parsedData.avaliacoes.length
      });

      return parsedData as SequenciaDidaticaData;
    } catch (error) {
      console.error('❌ Erro ao processar resposta da IA:', error);
      throw new Error(`Erro ao processar resposta da IA: ${error.message}`);
    }
  }

  async updateFieldData(field: string, value: any, fullData: SequenciaDidaticaData): Promise<SequenciaDidaticaData> {
    try {
      console.log(`🔄 Atualizando campo ${field} com valor:`, value);

      // Atualizar o campo específico
      const updatedData = { ...fullData };
      
      if (field.includes('_')) {
        // Campo aninhado (ex: aula_1_titulo)
        const [type, index, fieldName] = field.split('_');
        const arrayIndex = parseInt(index) - 1;

        if (type === 'aula' && updatedData.aulas[arrayIndex]) {
          updatedData.aulas[arrayIndex][fieldName] = value;
        } else if (type === 'diagnostico' && updatedData.diagnosticos[arrayIndex]) {
          updatedData.diagnosticos[arrayIndex][fieldName] = value;
        } else if (type === 'avaliacao' && updatedData.avaliacoes[arrayIndex]) {
          updatedData.avaliacoes[arrayIndex][fieldName] = value;
        }
      } else {
        // Campo principal
        updatedData[field] = value;
      }

      // Salvar no localStorage
      const storageKey = `sequencia_didatica_${Date.now()}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedData));

      console.log('✅ Campo atualizado e salvo com sucesso');
      return updatedData;
    } catch (error) {
      console.error('❌ Erro ao atualizar campo:', error);
      throw error;
    }
  }
}
