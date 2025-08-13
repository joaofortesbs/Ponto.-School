import { geminiClient } from '@/utils/api/geminiClient';
import { SequenciaDidaticaData } from './sequenciaDidaticaProcessor';
import { sequenciaDidaticaPrompt } from '../../prompts/sequenciaDidaticaPrompt';

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

export interface SequenciaDidaticaResponse {
  titulo: string;
  introducao: string;
  aulas: {
    numero: number;
    titulo: string;
    objetivos: string[];
    conteudo: string;
    atividades: string[];
    recursos: string[];
    avaliacao: string;
    duracao: string;
  }[];
  avaliacaoFinal: {
    tipo: string;
    criterios: string[];
    descricao: string;
  };
  recursosGerais: string[];
  bibliografia: string[];
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

  static async generateSequenciaDidatica(data: SequenciaDidaticaData): Promise<SequenciaDidaticaResponse> {
    console.log('🎯 Gerando Sequência Didática:', data);

    if (!SequenciaDidaticaGenerator.instance) {
      SequenciaDidaticaGenerator.instance = new SequenciaDidaticaGenerator();
    }

    try {
      const prompt = sequenciaDidaticaPrompt(data);
      console.log('📝 Prompt gerado para Sequência Didática');

      const response = await geminiClient.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 4096
      });

      if (!response.success || !response.result) {
        throw new Error(response.error || 'Falha na geração da Sequência Didática');
      }

      console.log('✅ Resposta recebida da IA:', response.result.substring(0, 200) + '...');

      // Limpar e extrair JSON da resposta
      let cleanedResponse = response.result.trim();

      // Remover possível markdown formatting
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }

      // Remover outros possíveis prefixos/sufixos
      cleanedResponse = cleanedResponse.replace(/^[^{]*/, '').replace(/[^}]*$/, '');

      console.log('🧹 Resposta limpa:', cleanedResponse.substring(0, 200) + '...');

      // Parse da resposta JSON
      let parsedResponse: SequenciaDidaticaResponse;

      try {
        parsedResponse = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('❌ Erro no parsing JSON:', parseError);
        console.error('📄 Conteúdo que causou erro:', cleanedResponse.substring(0, 500));

        // Fallback: criar estrutura básica se parsing falhar
        parsedResponse = createFallbackSequenciaDidatica(data);
      }

      // Validação e sanitização
      parsedResponse = validateAndSanitizeResponse(parsedResponse, data);

      console.log('✅ Sequência Didática gerada com sucesso:', parsedResponse.titulo);
      return parsedResponse;

    } catch (error) {
      console.error('❌ Erro ao gerar Sequência Didática:', error);

      // Em caso de erro completo, retornar fallback
      return createFallbackSequenciaDidatica(data);
    }
  }
}

function createFallbackSequenciaDidatica(data: SequenciaDidaticaData): SequenciaDidaticaResponse {
  console.log('🔧 Criando Sequência Didática de fallback');

  const numAulas = parseInt(data.quantidadeAulas) || 4;
  const aulas = [];

  for (let i = 1; i <= numAulas; i++) {
    aulas.push({
      numero: i,
      titulo: `Aula ${i}: ${data.tituloTemaAssunto} - Parte ${i}`,
      objetivos: [
        `Compreender conceitos fundamentais sobre ${data.tituloTemaAssunto}`,
        `Aplicar conhecimentos na prática`,
        `Desenvolver habilidades de ${data.disciplina}`
      ],
      conteudo: `Conteúdo programático da aula ${i} sobre ${data.tituloTemaAssunto}. Este conteúdo será desenvolvido considerando o público-alvo: ${data.publicoAlvo}.`,
      atividades: [
        `Discussão em grupo sobre ${data.tituloTemaAssunto}`,
        `Exercícios práticos relacionados ao tema`,
        `Atividade de fixação do conteúdo`
      ],
      recursos: [
        'Quadro e marcador',
        'Material didático impresso',
        'Recursos audiovisuais'
      ],
      avaliacao: `Avaliação através de participação e exercícios práticos da aula ${i}`,
      duracao: '50 minutos'
    });
  }

  return {
    titulo: `Sequência Didática: ${data.tituloTemaAssunto}`,
    introducao: `Esta sequência didática foi desenvolvida para ${data.publicoAlvo} na disciplina de ${data.disciplina}, com foco em ${data.tituloTemaAssunto}. Os objetivos de aprendizagem incluem: ${data.objetivosAprendizagem}`,
    aulas,
    avaliacaoFinal: {
      tipo: 'Avaliação Formativa e Somativa',
      criterios: [
        'Compreensão dos conceitos apresentados',
        'Participação nas atividades propostas',
        'Aplicação prática do conhecimento',
        'Desenvolvimento das habilidades previstas'
      ],
      descricao: `Avaliação final contemplando os objetivos propostos para ${data.tituloTemaAssunto}`
    },
    recursosGerais: [
      'Material didático especializado',
      'Recursos tecnológicos',
      'Bibliografia complementar',
      'Ambiente adequado para aprendizagem'
    ],
    bibliografia: [
      'Referências bibliográficas específicas da disciplina',
      'Material complementar sobre o tema',
      'Recursos digitais e online'
    ]
  };
}

function validateAndSanitizeResponse(response: any, data: SequenciaDidaticaData): SequenciaDidaticaResponse {
  console.log('🔍 Validando e sanitizando resposta');

  // Garantir estrutura básica
  const sanitized: SequenciaDidaticaResponse = {
    titulo: response.titulo || `Sequência Didática: ${data.tituloTemaAssunto}`,
    introducao: response.introducao || `Sequência didática desenvolvida para ${data.publicoAlvo}`,
    aulas: [],
    avaliacaoFinal: response.avaliacaoFinal || {
      tipo: 'Avaliação Formativa',
      criterios: ['Participação', 'Compreensão', 'Aplicação prática'],
      descricao: 'Avaliação contínua do processo de aprendizagem'
    },
    recursosGerais: response.recursosGerais || ['Material didático', 'Recursos audiovisuais'],
    bibliografia: response.bibliografia || ['Bibliografia especializada da disciplina']
  };

  // Validar e sanitizar aulas
  if (response.aulas && Array.isArray(response.aulas)) {
    sanitized.aulas = response.aulas.map((aula: any, index: number) => ({
      numero: aula.numero || (index + 1),
      titulo: aula.titulo || `Aula ${index + 1}`,
      objetivos: Array.isArray(aula.objetivos) ? aula.objetivos : ['Objetivo da aula'],
      conteudo: aula.conteudo || 'Conteúdo da aula',
      atividades: Array.isArray(aula.atividades) ? aula.atividades : ['Atividade prática'],
      recursos: Array.isArray(aula.recursos) ? aula.recursos : ['Recursos básicos'],
      avaliacao: aula.avaliacao || 'Avaliação da aula',
      duracao: aula.duracao || '50 minutos'
    }));
  } else {
    // Criar aulas baseado na quantidade especificada
    const numAulas = parseInt(data.quantidadeAulas) || 4;
    for (let i = 1; i <= numAulas; i++) {
      sanitized.aulas.push({
        numero: i,
        titulo: `Aula ${i}: ${data.tituloTemaAssunto}`,
        objetivos: ['Objetivo da aula'],
        conteudo: `Conteúdo da aula ${i}`,
        atividades: ['Atividade prática'],
        recursos: ['Recursos necessários'],
        avaliacao: 'Avaliação da aula',
        duracao: '50 minutos'
      });
    }
  }

  return sanitized;
}

// Exportar instância singleton
export const sequenciaDidaticaGenerator = SequenciaDidaticaGenerator.getInstance();