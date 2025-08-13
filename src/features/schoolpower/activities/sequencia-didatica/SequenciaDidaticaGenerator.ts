import { geminiClient } from '@/utils/api/geminiClient';
import { SequenciaDidaticaData } from './sequenciaDidaticaProcessor';

export interface AulaData {
  id: string;
  titulo: string;
  objetivoEspecifico: string;
  resumoContexto: string;
  passoAPasso: {
    introducao: string;
    desenvolvimento: string;
    fechamento: string;
  };
  recursos: string[];
  atividadePratica: string;
  tempoEstimado: string;
  ordem: number;
}

export interface DiagnosticoData {
  id: string;
  titulo: string;
  tipo: 'diagnostico' | 'avaliacao';
  objetivos: string[];
  questoes: any[];
  criteriosAvaliacao: string;
  tempoEstimado: string;
  posicaoSequencia: number;
}

export interface SequenciaDidaticaCompleta {
  metadados: SequenciaDidaticaData;
  aulas: AulaData[];
  diagnosticos: DiagnosticoData[];
  avaliacoes: DiagnosticoData[];
  encadeamento: {
    progressaoDidatica: string;
    conexoesEntrAulas: string[];
  };
  cronogramaSugerido: {
    duracao: string;
    distribuicao: string;
    observacoes: string;
  };
  generatedAt: string;
  versao: string;
}

export class SequenciaDidaticaGenerator {
  private static instance: SequenciaDidaticaGenerator;

  static getInstance(): SequenciaDidaticaGenerator {
    if (!SequenciaDidaticaGenerator.instance) {
      SequenciaDidaticaGenerator.instance = new SequenciaDidaticaGenerator();
    }
    return SequenciaDidaticaGenerator.instance;
  }

  async gerarSequenciaCompleta(dados: SequenciaDidaticaData): Promise<SequenciaDidaticaCompleta> {
    console.log('🔄 Iniciando geração da Sequência Didática completa:', dados);

    try {
      const prompt = this.construirPromptCompleto(dados);
      console.log('📝 Prompt construído, enviando para IA...');

      const response = await geminiClient.generateContent(prompt);
      console.log('✅ Resposta recebida da IA');

      const sequenciaGerada = this.processarRespostaIA(response, dados);
      console.log('🎯 Sequência processada e estruturada');

      return sequenciaGerada;
    } catch (error) {
      console.error('❌ Erro na geração da Sequência Didática:', error);
      throw new Error(`Falha na geração: ${error.message}`);
    }
  }

  private construirPromptCompleto(dados: SequenciaDidaticaData): string {
    return `
# GERAÇÃO DE SEQUÊNCIA DIDÁTICA COMPLETA

## DADOS DE ENTRADA:
- **Título/Tema:** ${dados.tituloTemaAssunto}
- **Disciplina:** ${dados.disciplina}
- **Ano/Série:** ${dados.anoSerie}
- **Público-alvo:** ${dados.publicoAlvo}
- **BNCC/Competências:** ${dados.bnccCompetencias}
- **Objetivos de Aprendizagem:** ${dados.objetivosAprendizagem}
- **Quantidade de Aulas:** ${dados.quantidadeAulas}
- **Quantidade de Diagnósticos:** ${dados.quantidadeDiagnosticos}
- **Quantidade de Avaliações:** ${dados.quantidadeAvaliacoes}
- **Cronograma:** ${dados.cronograma}

## INSTRUÇÕES PARA GERAÇÃO:

Você deve gerar uma Sequência Didática COMPLETA e ESTRUTURADA seguindo estas especificações:

### 1. ESTRUTURA DE RESPOSTA (JSON):
\`\`\`json
{
  "aulas": [
    {
      "id": "aula_001",
      "titulo": "Título da Aula",
      "objetivoEspecifico": "Objetivo específico e claro",
      "resumoContexto": "Resumo contextual da aula",
      "passoAPasso": {
        "introducao": "Como iniciar a aula (5-10 min)",
        "desenvolvimento": "Atividades principais (25-30 min)",
        "fechamento": "Síntese e próximos passos (5-10 min)"
      },
      "recursos": ["Material 1", "Material 2", "Material 3"],
      "atividadePratica": "Descrição detalhada da atividade prática",
      "tempoEstimado": "45 minutos",
      "ordem": 1
    }
  ],
  "diagnosticos": [
    {
      "id": "diag_001",
      "titulo": "Diagnóstico Inicial",
      "tipo": "diagnostico",
      "objetivos": ["Identificar conhecimentos prévios"],
      "questoes": [],
      "criteriosAvaliacao": "Critérios específicos",
      "tempoEstimado": "30 minutos",
      "posicaoSequencia": 1
    }
  ],
  "avaliacoes": [
    {
      "id": "aval_001",
      "titulo": "Avaliação Formativa",
      "tipo": "avaliacao",
      "objetivos": ["Verificar aprendizagem"],
      "questoes": [],
      "criteriosAvaliacao": "Critérios específicos",
      "tempoEstimado": "50 minutos",
      "posicaoSequencia": 5
    }
  ],
  "encadeamento": {
    "progressaoDidatica": "Descrição da progressão lógica",
    "conexoesEntrAulas": ["Conexão 1", "Conexão 2"]
  },
  "cronogramaSugerido": {
    "duracao": "4 semanas",
    "distribuicao": "2 aulas por semana",
    "observacoes": "Observações importantes"
  }
}
\`\`\`

### 2. DIRETRIZES ESPECÍFICAS:

#### Para as AULAS:
- Crie exatamente ${dados.quantidadeAulas} aulas
- Cada aula deve ter progressão clara e lógica
- Passo a passo detalhado e prático
- Recursos específicos e acessíveis
- Atividades práticas envolventes
- Tempo estimado realista

#### Para DIAGNÓSTICOS:
- Crie exatamente ${dados.quantidadeDiagnosticos} diagnósticos
- Posicione estrategicamente na sequência
- Foque em identificar lacunas de aprendizagem
- Critérios claros de análise

#### Para AVALIAÇÕES:
- Crie exatamente ${dados.quantidadeAvaliacoes} avaliações
- Avalie competências desenvolvidas
- Critérios objetivos e transparentes
- Formatos diversificados

#### ENCADEAMENTO:
- Demonstre conexão entre todas as aulas
- Progressão didática clara e justificada
- Preparação para próximas etapas

### 3. QUALIDADE EXIGIDA:
- Conteúdo prático e aplicável
- Linguagem clara e direta
- Atividades engajadoras
- Recursos acessíveis
- Avaliação formativa contínua

**IMPORTANTE:** Retorne APENAS o JSON estruturado, sem texto adicional.
    `;
  }

  private processarRespostaIA(response: any, dadosOriginais: SequenciaDidaticaData): SequenciaDidaticaCompleta {
    console.log('🔍 Processando resposta da IA...');

    try {
      // Extrair JSON da resposta
      let jsonContent = response;
      if (typeof response === 'string') {
        // Tentar extrair JSON se vier como string
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonContent = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('JSON não encontrado na resposta');
        }
      }

      // Validar estrutura mínima
      if (!jsonContent.aulas || !Array.isArray(jsonContent.aulas)) {
        throw new Error('Estrutura de aulas inválida');
      }

      // Construir objeto completo
      const sequenciaCompleta: SequenciaDidaticaCompleta = {
        metadados: dadosOriginais,
        aulas: jsonContent.aulas || [],
        diagnosticos: jsonContent.diagnosticos || [],
        avaliacoes: jsonContent.avaliacoes || [],
        encadeamento: jsonContent.encadeamento || {
          progressaoDidatica: 'Progressão lógica e sequencial',
          conexoesEntrAulas: []
        },
        cronogramaSugerido: jsonContent.cronogramaSugerido || {
          duracao: `${dadosOriginais.quantidadeAulas} aulas`,
          distribuicao: 'Conforme cronograma escolar',
          observacoes: 'Ajustar conforme necessidade da turma'
        },
        generatedAt: new Date().toISOString(),
        versao: '1.0'
      };

      console.log('✅ Sequência estruturada com sucesso:', {
        aulas: sequenciaCompleta.aulas.length,
        diagnosticos: sequenciaCompleta.diagnosticos.length,
        avaliacoes: sequenciaCompleta.avaliacoes.length
      });

      return sequenciaCompleta;
    } catch (error) {
      console.error('❌ Erro ao processar resposta da IA:', error);

      // Retornar estrutura mínima em caso de erro
      return {
        metadados: dadosOriginais,
        aulas: [],
        diagnosticos: [],
        avaliacoes: [],
        encadeamento: {
          progressaoDidatica: 'Erro na geração - tente novamente',
          conexoesEntrAulas: []
        },
        cronogramaSugerido: {
          duracao: 'Não definido',
          distribuicao: 'Não definido',
          observacoes: 'Erro na geração'
        },
        generatedAt: new Date().toISOString(),
        versao: '1.0'
      };
    }
  }

  async regenerarSequencia(
    dadosOriginais: SequenciaDidaticaData, 
    dadosAlterados: Partial<SequenciaDidaticaData>
  ): Promise<SequenciaDidaticaCompleta> {
    console.log('🔄 Regenerando sequência com alterações:', dadosAlterados);

    const dadosCompletos = { ...dadosOriginais, ...dadosAlterados };
    return this.gerarSequenciaCompleta(dadosCompletos);
  }

  static async generateSequenciaDidatica(data: any): Promise<any> {
    console.log('🚀 Gerando Sequência Didática com dados:', data);

    try {
      // Dados básicos da sequência
      const sequenciaData = {
        titulo: data.tituloTemaAssunto || 'Sequência Didática',
        anoSerie: data.anoSerie || 'Não especificado',
        disciplina: data.disciplina || 'Não especificado',
        publicoAlvo: data.publicoAlvo || 'Estudantes',
        objetivos: data.objetivosAprendizagem || 'Objetivos a serem definidos',
        competencias: data.bnccCompetencias || 'Competências da BNCC',
        quantidadeAulas: parseInt(data.quantidadeAulas) || 1,
        quantidadeDiagnosticos: parseInt(data.quantidadeDiagnosticos) || 1,
        quantidadeAvaliacoes: parseInt(data.quantidadeAvaliacoes) || 1,
        cronograma: data.cronograma || 'Cronograma a ser definido',
        aulas: [],
        diagnosticos: [],
        avaliacoes: []
      };

      // Gerar aulas
      for (let i = 0; i < sequenciaData.quantidadeAulas; i++) {
        sequenciaData.aulas.push({
          numero: i + 1,
          titulo: `Aula ${i + 1}`,
          objetivos: `Objetivos específicos da aula ${i + 1}`,
          duracao: '50 minutos',
          atividades: ['Atividade introdutória', 'Desenvolvimento', 'Encerramento'],
          materiais: ['Material didático', 'Quadro', 'Recursos digitais'],
          metodologia: 'Metodologia ativa'
        });
      }

      // Gerar diagnósticos
      for (let i = 0; i < sequenciaData.quantidadeDiagnosticos; i++) {
        sequenciaData.diagnosticos.push({
          numero: i + 1,
          titulo: `Diagnóstico ${i + 1}`,
          descricao: `Avaliação diagnóstica ${i + 1}`,
          tipo: 'Diagnóstica',
          instrumentos: ['Observação', 'Questionário', 'Atividade prática']
        });
      }

      // Gerar avaliações
      for (let i = 0; i < sequenciaData.quantidadeAvaliacoes; i++) {
        sequenciaData.avaliacoes.push({
          numero: i + 1,
          titulo: `Avaliação ${i + 1}`,
          descricao: `Avaliação formativa/somativa ${i + 1}`,
          tipo: i === sequenciaData.quantidadeAvaliacoes - 1 ? 'Somativa' : 'Formativa',
          instrumentos: ['Prova', 'Trabalho', 'Apresentação']
        });
      }

      console.log('✅ Sequência Didática gerada:', sequenciaData);
      return sequenciaData;

    } catch (error) {
      console.error('❌ Erro ao gerar Sequência Didática:', error);
      throw error;
    }
  }
}

export const sequenciaDidaticaGenerator = SequenciaDidaticaGenerator;