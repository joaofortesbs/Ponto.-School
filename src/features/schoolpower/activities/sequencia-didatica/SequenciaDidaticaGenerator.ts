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

#### ENcadeamento:
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

  async generateFromFormData(formData: SequenciaDidaticaData): Promise<SequenciaDidaticaCompleta> {
    try {
      console.log('🤖 Iniciando geração de Sequência Didática com IA:', formData);

      const quantidadeAulas = parseInt(formData.quantidadeAulas) || 4;
      const quantidadeDiagnosticos = parseInt(formData.quantidadeDiagnosticos) || 1;
      const quantidadeAvaliacoes = parseInt(formData.quantidadeAvaliacoes) || 2;


  // Métodos auxiliares para geração de conteúdo básico
  private generateBasicAulas(formData: SequenciaDidaticaData, quantidade: number): AulaData[] {
    const aulas: AulaData[] = [];
    
    for (let i = 0; i < quantidade; i++) {
      aulas.push({
        id: `aula_${i + 1}`,
        titulo: `Aula ${i + 1}: ${formData.tituloTemaAssunto} - Parte ${i + 1}`,
        objetivoEspecifico: `Desenvolver compreensão sobre ${formData.tituloTemaAssunto} com foco nos objetivos específicos da aula ${i + 1}`,
        resumoContexto: `Esta aula aborda aspectos fundamentais de ${formData.tituloTemaAssunto}, adequada para ${formData.anoSerie}`,
        passoAPasso: {
          introducao: `Apresentação inicial do conteúdo de ${formData.tituloTemaAssunto} (10 min)`,
          desenvolvimento: `Desenvolvimento prático e teórico dos conceitos principais (30 min)`,
          fechamento: `Síntese dos aprendizados e preparação para próxima aula (10 min)`
        },
        recursos: ['Quadro/lousa', 'Material didático impresso', 'Projetor/slides', 'Exercícios práticos'],
        atividades: [
          {
            tipo: 'Exposição dialogada',
            descricao: `Apresentação do tema ${formData.tituloTemaAssunto} com participação ativa dos estudantes`,
            tempo: '15 min'
          },
          {
            tipo: 'Atividade prática',
            descricao: `Exercícios aplicados sobre o conteúdo trabalhado na aula`,
            tempo: '20 min'
          },
          {
            tipo: 'Discussão em grupo',
            descricao: `Compartilhamento de resultados e reflexões sobre o aprendizado`,
            tempo: '15 min'
          }
        ],
        avaliacao: 'Avaliação formativa através da participação nas atividades, resolução de exercícios e observação da compreensão dos conceitos',
        tempoEstimado: '50 min'
      });
    }
    
    return aulas;
  }

  private generateBasicDiagnosticos(formData: SequenciaDidaticaData, quantidade: number): DiagnosticoData[] {
    const diagnosticos: DiagnosticoData[] = [];
    
    for (let i = 0; i < quantidade; i++) {
      diagnosticos.push({
        id: `diagnostico_${i + 1}`,
        titulo: `Diagnóstico ${i + 1}: Avaliação de Conhecimentos - ${formData.tituloTemaAssunto}`,
        objetivo: `Identificar o nível de conhecimento prévio dos estudantes sobre ${formData.tituloTemaAssunto}`,
        tipo: i === 0 ? 'Diagnóstico Inicial' : 'Diagnóstico Processual',
        instrumentos: [
          'Questionário estruturado',
          'Observação sistemática',
          'Atividade investigativa',
          'Conversa dirigida'
        ],
        criteriosAvaliacao: [
          'Conhecimentos prévios sobre o tema',
          'Capacidade de raciocínio lógico',
          'Habilidades de comunicação e expressão',
          'Interesse e motivação para o conteúdo',
          'Dificuldades identificadas'
        ],
        resultadosEsperados: `Mapear o perfil de conhecimento da turma sobre ${formData.tituloTemaAssunto} para adequar as estratégias pedagógicas`
      });
    }
    
    return diagnosticos;
  }

  private generateBasicAvaliacoes(formData: SequenciaDidaticaData, quantidade: number): AvaliacaoData[] {
    const avaliacoes: AvaliacaoData[] = [];
    
    for (let i = 0; i < quantidade; i++) {
      avaliacoes.push({
        id: `avaliacao_${i + 1}`,
        titulo: `Avaliação ${i + 1}: ${formData.tituloTemaAssunto}`,
        objetivo: `Verificar a aprendizagem e compreensão dos objetivos propostos sobre ${formData.tituloTemaAssunto}`,
        tipo: i === 0 ? 'Avaliação Formativa' : 'Avaliação Somativa',
        instrumentos: [
          'Prova escrita com questões objetivas e discursivas',
          'Trabalho em equipe',
          'Apresentação oral',
          'Portfólio de atividades'
        ],
        criteriosAvaliacao: [
          'Compreensão conceitual do conteúdo',
          'Aplicação prática do conhecimento adquirido',
          'Capacidade de análise e síntese',
          'Criatividade e originalidade nas respostas',
          'Uso adequado da linguagem técnica'
        ],
        peso: i === 0 ? 0.4 : 0.6,
        dataPrevisao: `A ser definida conforme cronograma da escola`
      });
    }
    
    return avaliacoes;


  // Método estático para facilitar o uso da classe
  static async generateSequenciaDidatica(formData: SequenciaDidaticaData): Promise<SequenciaDidaticaCompleta> {
    const generator = SequenciaDidaticaGenerator.getInstance();
    return generator.generateFromFormData(formData);
  }

  }


      // Validar dados antes da geração
      if (!formData.tituloTemaAssunto?.trim()) {
        throw new Error('Título do tema/assunto é obrigatório para gerar a sequência');
      }

      // Gerar conteúdo com IA do Gemini
      const prompt = this.createSequenciaDidaticaPrompt(formData);
      console.log('📝 Prompt gerado para IA');

      let aiResponse;
      try {
        console.log('🔄 Enviando requisição para Gemini API...');
        aiResponse = await geminiClient.generateContent(prompt);
        console.log('✅ Resposta da IA recebida com sucesso');
        
        // Log detalhado da resposta para debug
        if (typeof aiResponse === 'string') {
          console.log('📄 Resposta da IA (texto):', aiResponse.substring(0, 500) + '...');
        } else {
          console.log('📄 Resposta da IA (objeto):', Object.keys(aiResponse));
        }
      } catch (error) {
        console.error('❌ Erro na API Gemini:', error);
        console.warn('⚠️ Gerando conteúdo estruturado padrão...');
        aiResponse = this.generateFallbackContent(formData);
      }

      // Processar resposta da IA e estruturar dados
      const sequenciaData = this.processAIResponse(aiResponse, formData, quantidadeAulas, quantidadeDiagnosticos, quantidadeAvaliacoes);

      // Validar se a sequência foi gerada corretamente
      if (!sequenciaData.aulas || sequenciaData.aulas.length === 0) {
        console.warn('⚠️ Nenhuma aula foi gerada, criando estrutura básica...');
        sequenciaData.aulas = this.generateBasicAulas(formData, quantidadeAulas);
      }

      if (!sequenciaData.diagnosticos || sequenciaData.diagnosticos.length === 0) {
        console.warn('⚠️ Nenhum diagnóstico foi gerado, criando estrutura básica...');
        sequenciaData.diagnosticos = this.generateBasicDiagnosticos(formData, quantidadeDiagnosticos);
      }

      if (!sequenciaData.avaliacoes || sequenciaData.avaliacoes.length === 0) {
        console.warn('⚠️ Nenhuma avaliação foi gerada, criando estrutura básica...');
        sequenciaData.avaliacoes = this.generateBasicAvaliacoes(formData, quantidadeAvaliacoes);
      }

      console.log('✅ Sequência Didática gerada com sucesso:', {
        aulas: sequenciaData.aulas.length,
        diagnosticos: sequenciaData.diagnosticos.length,
        avaliacoes: sequenciaData.avaliacoes.length
      });

      return sequenciaData;

    } catch (error) {
      console.error('❌ Erro ao gerar Sequência Didática:', error);
      throw new Error(`Erro na geração: ${error.message}`);
    }
  }

  private createSequenciaDidaticaPrompt(dados: SequenciaDidaticaData): string {
    return `GERE UMA SEQUÊNCIA DIDÁTICA COMPLETA ESTRUTURADA

# DADOS DE ENTRADA:
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

# INSTRUÇÕES PARA GERAÇÃO:

Você deve gerar uma Sequência Didática COMPLETA seguindo EXATAMENTE a estrutura JSON abaixo:

## ESTRUTURA OBRIGATÓRIA (JSON):
\`\`\`json
{
  "aulas": [
    {
      "id": "aula_001",
      "titulo": "Título específico da aula",
      "objetivoEspecifico": "Objetivo claro e mensurável",
      "resumoContexto": "Contexto pedagógico da aula",
      "passoAPasso": {
        "introducao": "Como iniciar a aula (5-10 min)",
        "desenvolvimento": "Atividades principais (25-35 min)",
        "fechamento": "Síntese e próximos passos (5-10 min)"
      },
      "recursos": ["Recurso 1", "Recurso 2", "Recurso 3"],
      "atividades": [
        {
          "tipo": "Tipo da atividade",
          "descricao": "Descrição detalhada",
          "tempo": "XX minutos"
        }
      ],
      "avaliacao": "Método de avaliação da aula",
      "tempoEstimado": "XX minutos"
    }
  ],
  "diagnosticos": [
    {
      "id": "diag_001",
      "titulo": "Nome do diagnóstico",
      "objetivo": "Objetivo do diagnóstico",
      "tipo": "Tipo do diagnóstico",
      "instrumentos": ["Instrumento 1", "Instrumento 2"],
      "criteriosAvaliacao": ["Critério 1", "Critério 2"],
      "resultadosEsperados": "O que se espera identificar"
    }
  ],
  "avaliacoes": [
    {
      "id": "aval_001",
      "titulo": "Nome da avaliação",
      "objetivo": "Objetivo da avaliação",
      "tipo": "Tipo da avaliação",
      "instrumentos": ["Instrumento 1", "Instrumento 2"],
      "criteriosAvaliacao": ["Critério 1", "Critério 2"],
      "peso": 0.5,
      "dataPrevisao": "Quando aplicar"
    }
  ],
  "encadeamento": {
    "progressaoDidatica": "Descrição da progressão lógica",
    "conexoesEntrAulas": ["Conexão 1", "Conexão 2"]
  },
  "cronogramaSugerido": {
    "duracao": "Duração total",
    "distribuicao": "Como distribuir no tempo",
    "observacoes": "Observações importantes"
  }
}
\`\`\`

## DIRETRIZES ESPECÍFICAS:

### Para as AULAS (exatamente ${dados.quantidadeAulas} aulas):
- Progressão clara e lógica
- Passo a passo detalhado e prático
- Recursos específicos e acessíveis
- Atividades engajadoras e adequadas ao ${dados.anoSerie}
- Tempo estimado realista (45-50 min por aula)
- Alinhamento com os objetivos: ${dados.objetivosAprendizagem}

### Para DIAGNÓSTICOS (exatamente ${dados.quantidadeDiagnosticos} diagnósticos):
- Posicionamento estratégico na sequência
- Instrumentos adequados ao ${dados.anoSerie}
- Critérios claros de análise
- Foco em identificar lacunas de aprendizagem

### Para AVALIAÇÕES (exatamente ${dados.quantidadeAvaliacoes} avaliações):
- Avaliação das competências: ${dados.bnccCompetencias}
- Critérios objetivos e transparentes
- Formatos diversificados adequados à disciplina ${dados.disciplina}
- Alinhamento com objetivos de aprendizagem

### ENCADEAMENTO:
- Demonstre conexão clara entre todas as aulas
- Progressão didática justificada
- Preparação adequada para próximas etapas

**IMPORTANTE:** 
1. Retorne APENAS o JSON estruturado, sem texto adicional
2. Garanta que todos os arrays tenham o número correto de elementos
3. Use linguagem adequada ao ${dados.anoSerie}
4. Mantenha foco no tema: ${dados.tituloTemaAssunto}
5. Considere o contexto: ${dados.publicoAlvo}`;
  }

  private processAIResponse(aiResponse: any, formData: SequenciaDidaticaData, quantidadeAulas: number, quantidadeDiagnosticos: number, quantidadeAvaliacoes: number): SequenciaDidaticaCompleta {
    // Criar estrutura básica da sequência
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

    // Tentar extrair dados da resposta da IA
    let aiData = null;
    try {
      const responseText = typeof aiResponse === 'string' ? aiResponse : aiResponse?.text || JSON.stringify(aiResponse);
      aiData = JSON.parse(responseText);
    } catch (error) {
      console.warn('⚠️ Erro ao parsear resposta da IA, usando dados estruturados padrão');
    }

    // Gerar aulas (com IA ou padrão)
    for (let i = 0; i < quantidadeAulas; i++) {
      const aulaIA = aiData?.aulas?.[i];
      sequenciaData.aulas.push({
        id: `aula_${i + 1}`,
        titulo: aulaIA?.titulo || `Aula ${i + 1}: ${formData.tituloTemaAssunto} - Parte ${i + 1}`,
        objetivoEspecifico: aulaIA?.objetivoEspecifico || `Desenvolver compreensão sobre ${formData.tituloTemaAssunto} - Objetivo ${i + 1}`,
        resumoContexto: aulaIA?.resumoContexto || `Contexto pedagógico da aula ${i + 1} sobre ${formData.tituloTemaAssunto}`,
        passoAPasso: {
          introducao: aulaIA?.passoAPasso?.introducao || `Introdução: Apresentação do tema ${formData.tituloTemaAssunto} (15 min)`,
          desenvolvimento: aulaIA?.passoAPasso?.desenvolvimento || `Desenvolvimento: Exploração prática do conteúdo (25 min)`,
          fechamento: aulaIA?.passoAPasso?.fechamento || `Fechamento: Síntese e avaliação da aprendizagem (10 min)`
        },
        recursos: aulaIA?.recursos || ['Quadro', 'Material didático', 'Projetor', 'Material impresso'],
        atividades: aulaIA?.atividades || [
          {
            tipo: 'Exposição dialogada',
            descricao: `Apresentação do tema ${formData.tituloTemaAssunto} com participação dos estudantes`,
            tempo: '15 min'
          },
          {
            tipo: 'Atividade prática',
            descricao: `Exercício aplicado sobre o conteúdo trabalhado`,
            tempo: '20 min'
          },
          {
            tipo: 'Discussão em grupo',
            descricao: `Compartilhamento de resultados e reflexões`,
            tempo: '15 min'
          }
        ],
        avaliacao: aulaIA?.avaliacao || 'Avaliação formativa através da participação, exercícios práticos e observação direta',
        tempoEstimado: aulaIA?.tempoEstimado || '50 min'
      });
    }

    // Gerar diagnósticos
    for (let i = 0; i < quantidadeDiagnosticos; i++) {
      const diagnosticoIA = aiData?.diagnosticos?.[i];
      sequenciaData.diagnosticos.push({
        id: `diagnostico_${i + 1}`,
        titulo: diagnosticoIA?.titulo || `Diagnóstico ${i + 1}: ${formData.tituloTemaAssunto}`,
        objetivo: diagnosticoIA?.objetivo || `Identificar conhecimentos prévios sobre ${formData.tituloTemaAssunto}`,
        tipo: diagnosticoIA?.tipo || (i === 0 ? 'Diagnóstico Inicial' : 'Diagnóstico Processual'),
        instrumentos: diagnosticoIA?.instrumentos || ['Questionário diagnóstico', 'Observação sistemática', 'Atividade investigativa'],
        criteriosAvaliacao: diagnosticoIA?.criteriosAvaliacao || [
          'Conhecimentos prévios sobre o tema',
          'Capacidade de raciocínio',
          'Habilidades de comunicação',
          'Interesse e motivação'
        ],
        resultadosEsperados: diagnosticoIA?.resultadosEsperados || `Mapear o perfil de conhecimento da turma sobre ${formData.tituloTemaAssunto}`
      });
    }

    // Gerar avaliações
    for (let i = 0; i < quantidadeAvaliacoes; i++) {
      const avaliacaoIA = aiData?.avaliacoes?.[i];
      sequenciaData.avaliacoes.push({
        id: `avaliacao_${i + 1}`,
        titulo: avaliacaoIA?.titulo || `Avaliação ${i + 1}: ${formData.tituloTemaAssunto}`,
        objetivo: avaliacaoIA?.objetivo || `Verificar a aprendizagem dos objetivos propostos sobre ${formData.tituloTemaAssunto}`,
        tipo: avaliacaoIA?.tipo || (i === 0 ? 'Avaliação Formativa' : 'Avaliação Somativa'),
        instrumentos: avaliacaoIA?.instrumentos || ['Prova escrita', 'Trabalho em equipe', 'Apresentação oral'],
        criteriosAvaliacao: avaliacaoIA?.criteriosAvaliacao || [
          'Compreensão conceitual',
          'Aplicação prática do conhecimento',
          'Capacidade de síntese e análise',
          'Criatividade e originalidade'
        ],
        peso: avaliacaoIA?.peso || (i === 0 ? 0.4 : 0.6),
        dataPrevisao: avaliacaoIA?.dataPrevisao || `A definir conforme cronograma`
      });
    }

    // Configurar encadeamento didático
    sequenciaData.encadeamento = {
      progressaoDidatica: aiData?.encadeamento?.progressaoDidatica || `A sequência didática sobre ${formData.tituloTemaAssunto} foi estruturada de forma progressiva, partindo de conceitos básicos até aplicações mais complexas, garantindo a construção gradual do conhecimento pelos estudantes do ${formData.anoSerie}.`,
      conexoesEntrAulas: aiData?.encadeamento?.conexoesEntrAulas || sequenciaData.aulas.map((aula, index) => {
        if (index === 0) {
          return `${aula.titulo} - Introdução ao tema e levantamento de conhecimentos prévios`;
        } else if (index === sequenciaData.aulas.length - 1) {
          return `${aula.titulo} - Síntese, aplicação e consolidação dos conhecimentos adquiridos`;
        } else {
          return `${aula.titulo} - Desenvolvimento e aprofundamento progressivo dos conceitos`;
        }
      })
    };

    // Configurar cronograma
    sequenciaData.cronogramaSugerido = {
      duracao: aiData?.cronogramaSugerido?.duracao || `${quantidadeAulas} aulas + ${quantidadeDiagnosticos} diagnósticos + ${quantidadeAvaliacoes} avaliações`,
      distribuicao: aiData?.cronogramaSugerido?.distribuicao || 'Sugestão: 2 aulas por semana, com diagnósticos no início e meio do processo, e avaliações distribuídas ao longo da sequência',
      observacoes: aiData?.cronogramaSugerido?.observacoes || formData.cronograma || 'Cronograma flexível, adaptável conforme necessidades da turma e calendário escolar. Considerar feriados e eventos institucionais.'
    };

    return sequenciaData;
  }

  private generateFallbackContent(formData: SequenciaDidaticaData): any {
    const quantidadeAulas = parseInt(formData.quantidadeAulas) || 4;
    const quantidadeDiagnosticos = parseInt(formData.quantidadeDiagnosticos) || 1;
    const quantidadeAvaliacoes = parseInt(formData.quantidadeAvaliacoes) || 2;

    const fallbackData = {
      aulas: this.generateBasicAulas(formData, quantidadeAulas),
      diagnosticos: this.generateBasicDiagnosticos(formData, quantidadeDiagnosticos),
      avaliacoes: this.generateBasicAvaliacoes(formData, quantidadeAvaliacoes),
      encadeamento: {
        progressaoDidatica: `A sequência didática sobre "${formData.tituloTemaAssunto}" foi estruturada de forma progressiva para ${formData.anoSerie}, partindo de conceitos básicos até aplicações mais complexas, garantindo a construção gradual do conhecimento pelos estudantes.`,
        conexoesEntrAulas: [
          `Aula 1 - Introdução ao tema e levantamento de conhecimentos prévios sobre ${formData.tituloTemaAssunto}`,
          `Aulas 2-${Math.max(1, quantidadeAulas-1)} - Desenvolvimento e aprofundamento progressivo dos conceitos`,
          `Aula ${quantidadeAulas} - Síntese, aplicação e consolidação dos conhecimentos adquiridos`
        ]
      },
      cronogramaSugerido: {
        duracao: `${quantidadeAulas} aulas + ${quantidadeDiagnosticos} diagnósticos + ${quantidadeAvaliacoes} avaliações`,
        distribuicao: `Sugestão: 2 aulas por semana para ${formData.anoSerie}, com diagnósticos no início e avaliações distribuídas ao longo da sequência`,
        observacoes: formData.cronograma || `Cronograma flexível, adaptável conforme necessidades da turma de ${formData.anoSerie} e calendário escolar. Considerar feriados e eventos institucionais.`
      }
    };

    return {
      text: JSON.stringify(fallbackData)
    };
  }

  async regenerateWithAI(formData: SequenciaDidaticaData): Promise<SequenciaDidaticaCompleta> {
    console.log('🤖 Regeneração com IA em desenvolvimento...');
    return SequenciaDidaticaGenerator.generateSequenciaDidatica(formData);
  }
}

// Exportar instância singleton
export const sequenciaDidaticaGenerator = SequenciaDidaticaGenerator.getInstance();