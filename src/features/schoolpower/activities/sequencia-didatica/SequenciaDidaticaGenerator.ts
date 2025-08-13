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
  atividades: {
    tipo: string;
    descricao: string;
    tempo: string;
  }[];
  avaliacao: string;
  tempoEstimado: string;
}

export interface DiagnosticoData {
  id: string;
  titulo: string;
  objetivo: string;
  tipo: string;
  instrumentos: string[];
  criteriosAvaliacao: string[];
  resultadosEsperados: string;
}

export interface AvaliacaoData {
  id: string;
  titulo: string;
  objetivo: string;
  tipo: string;
  instrumentos: string[];
  criteriosAvaliacao: string[];
  peso: number;
  dataPrevisao: string;
}

export interface SequenciaDidaticaCompleta {
  metadados: SequenciaDidaticaData;
  aulas: AulaData[];
  diagnosticos: DiagnosticoData[];
  avaliacoes: AvaliacaoData[];
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
      "atividades": [
        {
          "tipo": "Atividade Prática",
          "descricao": "Descrição da atividade",
          "tempo": "20 minutos"
        }
      ],
      "avaliacao": "Avaliação formativa",
      "tempoEstimado": "45 minutos"
    }
  ],
  "diagnosticos": [
    {
      "id": "diag_001",
      "titulo": "Diagnóstico Inicial",
      "objetivo": "Avaliar conhecimentos prévios",
      "tipo": "Diagnóstico Inicial",
      "instrumentos": ["Questionário", "Observação"],
      "criteriosAvaliacao": ["Conhecimento prévio", "Participação"],
      "resultadosEsperados": "Identificar lacunas de aprendizagem"
    }
  ],
  "avaliacoes": [
    {
      "id": "aval_001",
      "titulo": "Avaliação Formativa",
      "objetivo": "Verificar aprendizagem",
      "tipo": "Avaliação Formativa",
      "instrumentos": ["Prova", "Trabalho"],
      "criteriosAvaliacao": ["Conteúdo", "Aplicação"],
      "peso": 0.5,
      "dataPrevisao": "Semana 3"
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

#### ENcadeAMENTO:
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

  static async generateSequenciaDidatica(formData: SequenciaDidaticaData): Promise<SequenciaDidaticaCompleta> {
    console.log('🎯 Gerando Sequência Didática com dados:', formData);

    try {
      // Preparar estrutura base
      const sequenciaData: SequenciaDidaticaCompleta = {
        metadados: formData,
        aulas: [],
        diagnosticos: [],
        avaliacoes: [],
        encadeamento: {
          progressaoDidatica: '',
          conexoesEntrAulas: []
        },
        cronogramaSugerido: {
          duracao: '',
          distribuicao: '',
          observacoes: ''
        },
        generatedAt: new Date().toISOString(),
        versao: '1.0'
      };

      // Gerar aulas
      const quantidadeAulas = parseInt(formData.quantidadeAulas) || 4;
      console.log(`📚 Gerando ${quantidadeAulas} aulas`);

      for (let i = 0; i < quantidadeAulas; i++) {
        sequenciaData.aulas.push({
          id: `aula_${i + 1}`,
          titulo: `Aula ${i + 1}: ${formData.tituloTemaAssunto}`,
          objetivoEspecifico: `Desenvolver conhecimentos sobre ${formData.tituloTemaAssunto} - Parte ${i + 1}`,
          resumoContexto: `Esta aula aborda aspectos específicos de ${formData.tituloTemaAssunto}, construindo conhecimento de forma progressiva e contextualizada.`,
          passoAPasso: {
            introducao: `Introdução ao tema com revisão dos conceitos anteriores e apresentação dos objetivos da aula ${i + 1}.`,
            desenvolvimento: `Desenvolvimento prático dos conceitos através de exemplos, exercícios e discussões sobre ${formData.tituloTemaAssunto}.`,
            fechamento: `Síntese dos conteúdos abordados, esclarecimento de dúvidas e preparação para a próxima aula.`
          },
          recursos: [
            'Material didático impresso',
            'Quadro ou lousa digital',
            'Recursos audiovisuais',
            'Computador/tablet (se disponível)'
          ],
          atividades: [
            {
              tipo: 'Atividade Inicial',
              descricao: 'Dinâmica de aquecimento e revisão',
              tempo: '10 minutos'
            },
            {
              tipo: 'Atividade Principal',
              descricao: 'Desenvolvimento do conteúdo central',
              tempo: '25 minutos'
            },
            {
              tipo: 'Atividade de Fixação',
              descricao: 'Exercícios práticos e discussão',
              tempo: '15 minutos'
            }
          ],
          avaliacao: `Avaliação formativa através de participação, exercícios e questionamentos durante a aula ${i + 1}.`,
          tempoEstimado: '50 minutos'
        });
      }

      // Gerar diagnósticos
      const quantidadeDiagnosticos = parseInt(formData.quantidadeDiagnosticos) || 2;
      console.log(`🔍 Gerando ${quantidadeDiagnosticos} diagnósticos`);

      for (let i = 0; i < quantidadeDiagnosticos; i++) {
        sequenciaData.diagnosticos.push({
          id: `diagnostico_${i + 1}`,
          titulo: `Diagnóstico ${i + 1}: ${formData.tituloTemaAssunto}`,
          objetivo: `Avaliar o nível de compreensão dos estudantes sobre ${formData.tituloTemaAssunto}`,
          tipo: i === 0 ? 'Diagnóstico Inicial' : 'Diagnóstico Processual',
          instrumentos: [
            'Questionário diagnóstico',
            'Observação direta',
            'Atividade prática',
            'Discussão em grupo'
          ],
          criteriosAvaliacao: [
            'Conhecimento prévio do tema',
            'Capacidade de análise',
            'Participação e engajamento',
            'Identificação de dificuldades'
          ],
          resultadosEsperados: `Identificar pontos fortes e necessidades de aprendizagem relacionados a ${formData.tituloTemaAssunto}`
        });
      }

      // Gerar avaliações
      const quantidadeAvaliacoes = parseInt(formData.quantidadeAvaliacoes) || 2;
      console.log(`📝 Gerando ${quantidadeAvaliacoes} avaliações`);

      for (let i = 0; i < quantidadeAvaliacoes; i++) {
        sequenciaData.avaliacoes.push({
          id: `avaliacao_${i + 1}`,
          titulo: `Avaliação ${i + 1}: ${formData.tituloTemaAssunto}`,
          objetivo: `Verificar o aprendizado e desenvolvimento das competências relacionadas a ${formData.tituloTemaAssunto}`,
          tipo: i === 0 ? 'Avaliação Formativa' : 'Avaliação Somativa',
          instrumentos: [
            'Prova escrita',
            'Trabalho em grupo',
            'Apresentação oral',
            'Portfolio de atividades'
          ],
          criteriosAvaliacao: [
            'Domínio do conteúdo',
            'Aplicação prática',
            'Capacidade de síntese',
            'Criatividade e originalidade'
          ],
          peso: i === 0 ? 0.4 : 0.6,
          dataPrevisao: `A definir conforme cronograma`
        });
      }

      // Configurar encadeamento didático
      sequenciaData.encadeamento = {
        progressaoDidatica: `A sequência didática sobre ${formData.tituloTemaAssunto} foi estruturada de forma progressiva, partindo de conceitos básicos até aplicações mais complexas, garantindo a construção gradual do conhecimento.`,
        conexoesEntrAulas: sequenciaData.aulas.map((aula, index) => {
          if (index === 0) {
            return `${aula.titulo} - Introdução ao tema e conceitos fundamentais`;
          } else if (index === sequenciaData.aulas.length - 1) {
            return `${aula.titulo} - Síntese e aplicação dos conhecimentos adquiridos`;
          } else {
            return `${aula.titulo} - Desenvolvimento e aprofundamento dos conceitos`;
          }
        })
      };

      // Configurar cronograma
      sequenciaData.cronogramaSugerido = {
        duracao: `${quantidadeAulas} aulas + ${quantidadeDiagnosticos} diagnósticos + ${quantidadeAvaliacoes} avaliações`,
        distribuicao: 'Sugestão: 2 aulas por semana, com diagnósticos e avaliações intercalados',
        observacoes: formData.cronograma || 'Cronograma flexível, adaptável conforme necessidades da turma e calendário escolar'
      };

      console.log('✅ Sequência Didática gerada com sucesso');
      return sequenciaData;

    } catch (error) {
      console.error('❌ Erro ao gerar Sequência Didática:', error);
      throw new Error(`Erro na geração: ${error.message}`);
    }
  }

  async regenerateWithAI(formData: SequenciaDidaticaData): Promise<SequenciaDidaticaCompleta> {
    console.log('🤖 Regeneração com IA em desenvolvimento...');
    return SequenciaDidaticaGenerator.generateSequenciaDidatica(formData);
  }
}

// Exportar instância singleton
export const sequenciaDidaticaGenerator = SequenciaDidaticaGenerator.getInstance();