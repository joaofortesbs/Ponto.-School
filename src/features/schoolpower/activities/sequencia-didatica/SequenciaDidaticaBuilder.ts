
import { geminiClient } from '@/utils/api/geminiClient';
import { ActivityFormData } from '../../construction/types/ActivityTypes';
import { SequenciaDidaticaCompleta, AulaData, DiagnosticoData, AvaliacaoData } from './SequenciaDidaticaGenerator';

export interface SequenciaDidaticaBuildResult {
  success: boolean;
  data?: SequenciaDidaticaCompleta;
  error?: string;
}

export class SequenciaDidaticaBuilder {
  /**
   * Constrói uma sequência didática completa baseada nos dados do formulário
   */
  async construirSequenciaDidatica(formData: ActivityFormData): Promise<SequenciaDidaticaBuildResult> {
    console.log('🚀 SequenciaDidaticaBuilder: Iniciando construção da sequência didática');
    console.log('📊 Dados recebidos:', formData);

    try {
      // Validar dados obrigatórios
      const validacao = this.validarDados(formData);
      if (!validacao.valido) {
        return {
          success: false,
          error: validacao.erro
        };
      }

      // Construir o prompt para a IA
      const prompt = this.construirPrompt(formData);
      console.log('📝 Prompt construído para IA');

      // Gerar conteúdo com a IA Gemini
      const response = await geminiClient.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 4000
      });

      if (!response.success) {
        throw new Error(`Erro na geração da IA: ${response.error}`);
      }

      console.log('✅ Resposta da IA recebida');

      // Processar a resposta da IA
      const sequenciaProcessada = this.processarRespostaIA(response.result, formData);
      
      console.log('🔄 Sequência didática processada:', sequenciaProcessada);

      // Salvar no localStorage
      this.salvarSequencia(sequenciaProcessada);

      return {
        success: true,
        data: sequenciaProcessada
      };

    } catch (error) {
      console.error('❌ Erro na construção da sequência didática:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Constrói o prompt para a IA baseado nos dados do formulário
   */
  private construirPrompt(formData: ActivityFormData): string {
    return `
Crie uma sequência didática completa e detalhada com as seguintes especificações:

INFORMAÇÕES BÁSICAS:
- Título/Tema: ${formData.tituloTemaAssunto || formData.title}
- Disciplina: ${formData.disciplina || formData.subject}
- Ano/Série: ${formData.anoSerie || formData.schoolYear}
- Público-alvo: ${formData.publicoAlvo || 'Estudantes do ensino fundamental/médio'}
- Objetivos de Aprendizagem: ${formData.objetivosAprendizagem || formData.objectives}

ESTRUTURA REQUERIDA:
- Quantidade de Aulas: ${formData.quantidadeAulas || '4'}
- Quantidade de Diagnósticos: ${formData.quantidadeDiagnosticos || '1'}
- Quantidade de Avaliações: ${formData.quantidadeAvaliacoes || '1'}
- Competências BNCC: ${formData.bnccCompetencias || 'A definir'}

CRONOGRAMA: ${formData.cronograma || 'A definir conforme necessidades da turma'}

Por favor, retorne uma sequência didática completa no seguinte formato JSON:

{
  "tituloTemaAssunto": "string",
  "anoSerie": "string", 
  "disciplina": "string",
  "bnccCompetencias": "string",
  "publicoAlvo": "string",
  "objetivosAprendizagem": "string",
  "quantidadeAulas": "string",
  "quantidadeDiagnosticos": "string", 
  "quantidadeAvaliacoes": "string",
  "cronograma": "string",
  "duracaoTotal": "string",
  "materiaisNecessarios": ["string"],
  "competenciasDesenvolvidas": ["string"],
  "aulas": [
    {
      "numero": 1,
      "titulo": "string",
      "objetivo": "string",
      "conteudo": "string",
      "metodologia": "string",
      "recursos": ["string"],
      "atividadePratica": "string",
      "avaliacao": "string", 
      "tempoEstimado": "string"
    }
  ],
  "diagnosticos": [
    {
      "numero": 1,
      "titulo": "string",
      "objetivo": "string",
      "questoes": ["string"],
      "criteriosAvaliacao": "string",
      "tempoEstimado": "string"
    }
  ],
  "avaliacoes": [
    {
      "numero": 1,
      "titulo": "string", 
      "objetivo": "string",
      "formato": "string",
      "criterios": ["string"],
      "tempoEstimado": "string"
    }
  ]
}

INSTRUÇÕES ESPECÍFICAS:
1. Crie EXATAMENTE ${formData.quantidadeAulas || '4'} aulas detalhadas e progressivas
2. Desenvolva ${formData.quantidadeDiagnosticos || '1'} diagnóstico(s) para avaliar conhecimentos prévios
3. Elabore ${formData.quantidadeAvaliacoes || '1'} avaliação(ões) formativa(s) e/ou somativa(s)
4. Cada aula deve ter objetivos claros, conteúdo bem estruturado e atividades práticas
5. Inclua metodologias variadas e recursos diversificados
6. Garanta progressão lógica e coerência entre as aulas
7. Foque nos objetivos de aprendizagem definidos
8. Considere o nível de desenvolvimento do público-alvo

Retorne APENAS o JSON, sem texto adicional.
`;
  }

  /**
   * Processa a resposta da IA e converte para o formato esperado
   */
  private processarRespostaIA(respostaIA: string, formData: ActivityFormData): SequenciaDidaticaCompleta {
    try {
      // Tentar extrair JSON da resposta
      let jsonString = respostaIA.trim();
      
      // Remover possíveis prefixos/sufixos de markdown
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```\s*/, '').replace(/\s*```$/, '');
      }

      const dadosIA = JSON.parse(jsonString);
      console.log('📊 Dados parseados da IA:', dadosIA);

      // Garantir que todos os campos estão presentes com fallbacks mais robustos
      const sequenciaCompleta: SequenciaDidaticaCompleta = {
        tituloTemaAssunto: dadosIA.tituloTemaAssunto || formData.tituloTemaAssunto || formData.title || 'Sequência Didática',
        anoSerie: dadosIA.anoSerie || formData.anoSerie || formData.schoolYear || '6º Ano',
        disciplina: dadosIA.disciplina || formData.disciplina || formData.subject || 'Português',
        bnccCompetencias: dadosIA.bnccCompetencias || formData.bnccCompetencias || formData.competencies || 'Competências da BNCC a serem trabalhadas',
        publicoAlvo: dadosIA.publicoAlvo || formData.publicoAlvo || formData.context || 'Estudantes do Ensino Fundamental',
        objetivosAprendizagem: dadosIA.objetivosAprendizagem || formData.objetivosAprendizagem || formData.objectives || 'Desenvolver competências específicas da disciplina',
        quantidadeAulas: dadosIA.quantidadeAulas || formData.quantidadeAulas || '4',
        quantidadeDiagnosticos: dadosIA.quantidadeDiagnosticos || formData.quantidadeDiagnosticos || '1',
        quantidadeAvaliacoes: dadosIA.quantidadeAvaliacoes || formData.quantidadeAvaliacoes || '1',
        cronograma: dadosIA.cronograma || formData.cronograma || 'Cronograma flexível conforme o ritmo da turma',
        duracaoTotal: dadosIA.duracaoTotal || `${dadosIA.quantidadeAulas || formData.quantidadeAulas || '4'} aulas de 50 minutos`,
        materiaisNecessarios: Array.isArray(dadosIA.materiaisNecessarios) ? dadosIA.materiaisNecessarios : ['Quadro', 'Material didático', 'Recursos audiovisuais'],
        competenciasDesenvolvidas: Array.isArray(dadosIA.competenciasDesenvolvidas) ? dadosIA.competenciasDesenvolvidas : ['Compreensão', 'Análise', 'Aplicação'],
        aulas: this.processarAulas(dadosIA.aulas || [], parseInt(formData.quantidadeAulas || '4')),
        diagnosticos: this.processarDiagnosticos(dadosIA.diagnosticos || [], parseInt(formData.quantidadeDiagnosticos || '1')),
        avaliacoes: this.processarAvaliacoes(dadosIA.avaliacoes || [], parseInt(formData.quantidadeAvaliacoes || '1')),
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true
      };

      // Validar se a sequência tem o mínimo necessário
      if (sequenciaCompleta.aulas.length === 0) {
        console.warn('⚠️ Nenhuma aula foi processada, criando aulas básicas');
        sequenciaCompleta.aulas = this.gerarAulasBasicas(formData);
      }

      console.log('✅ Sequência didática completa processada:', {
        titulo: sequenciaCompleta.tituloTemaAssunto,
        disciplina: sequenciaCompleta.disciplina,
        aulasCount: sequenciaCompleta.aulas.length,
        diagnosticosCount: sequenciaCompleta.diagnosticos.length,
        avaliacoesCount: sequenciaCompleta.avaliacoes.length
      });
      
      return sequenciaCompleta;

    } catch (error) {
      console.error('❌ Erro ao processar resposta da IA:', error);
      console.log('📝 Resposta da IA que causou erro:', respostaIA);
      
      // Fallback: criar sequência básica com os dados do formulário
      console.log('🔄 Criando sequência fallback com dados do formulário');
      return this.criarSequenciaFallback(formData);
    }
  }

  /**
   * Processa as aulas recebidas da IA
   */
  private processarAulas(aulas: any[], quantidadeEsperada: number = 4): AulaData[] {
    const aulasProcessadas = aulas.map((aula, index) => ({
      numero: aula.numero || index + 1,
      titulo: aula.titulo || `Aula ${index + 1}`,
      objetivo: aula.objetivo || 'Objetivo a ser definido',
      conteudo: aula.conteudo || 'Conteúdo a ser desenvolvido',
      metodologia: aula.metodologia || 'Metodologia a ser aplicada',
      recursos: Array.isArray(aula.recursos) ? aula.recursos : ['Recursos básicos'],
      atividadePratica: aula.atividadePratica || 'Atividade prática a ser desenvolvida',
      avaliacao: aula.avaliacao || 'Avaliação da aula',
      tempoEstimado: aula.tempoEstimado || '50 minutos'
    }));

    // Se não temos aulas suficientes, gerar mais
    while (aulasProcessadas.length < quantidadeEsperada) {
      const numeroAula = aulasProcessadas.length + 1;
      aulasProcessadas.push({
        numero: numeroAula,
        titulo: `Aula ${numeroAula}: Desenvolvimento do Tema`,
        objetivo: 'Desenvolver conhecimentos específicos sobre o tema proposto',
        conteudo: 'Conteúdo programático conforme objetivos de aprendizagem',
        metodologia: 'Aula expositiva dialogada com atividades práticas',
        recursos: ['Quadro', 'Material didático', 'Projetor'],
        atividadePratica: 'Atividades práticas relacionadas ao conteúdo da aula',
        avaliacao: 'Participação e desenvolvimento das atividades propostas',
        tempoEstimado: '50 minutos'
      });
    }

    return aulasProcessadas;
  }

  /**
   * Gera aulas básicas quando a IA não consegue processar
   */
  private gerarAulasBasicas(formData: ActivityFormData): AulaData[] {
    const quantidadeAulas = parseInt(formData.quantidadeAulas || '4');
    const tema = formData.tituloTemaAssunto || formData.title || 'Tema da Sequência';
    
    return Array.from({ length: quantidadeAulas }, (_, index) => ({
      numero: index + 1,
      titulo: `Aula ${index + 1}: ${tema}`,
      objetivo: formData.objetivosAprendizagem || 'Desenvolver compreensão sobre o tema',
      conteudo: `Conteúdo da aula ${index + 1} sobre ${tema}`,
      metodologia: 'Aula expositiva dialogada com atividades práticas',
      recursos: ['Quadro', 'Material didático', 'Recursos audiovisuais'],
      atividadePratica: `Atividade prática relacionada ao conteúdo da aula ${index + 1}`,
      avaliacao: 'Participação e desenvolvimento das atividades propostas',
      tempoEstimado: '50 minutos'
    }));
  }

  /**
   * Processa os diagnósticos recebidos da IA
   */
  private processarDiagnosticos(diagnosticos: any[]): DiagnosticoData[] {
    return diagnosticos.map((diagnostico, index) => ({
      numero: diagnostico.numero || index + 1,
      titulo: diagnostico.titulo || `Diagnóstico ${index + 1}`,
      objetivo: diagnostico.objetivo || 'Avaliar conhecimentos prévios',
      questoes: Array.isArray(diagnostico.questoes) ? diagnostico.questoes : ['Questão diagnóstica'],
      criteriosAvaliacao: diagnostico.criteriosAvaliacao || 'Critérios a serem definidos',
      tempoEstimado: diagnostico.tempoEstimado || '30 minutos'
    }));
  }

  /**
   * Processa as avaliações recebidas da IA
   */
  private processarAvaliacoes(avaliacoes: any[]): AvaliacaoData[] {
    return avaliacoes.map((avaliacao, index) => ({
      numero: avaliacao.numero || index + 1,
      titulo: avaliacao.titulo || `Avaliação ${index + 1}`,
      objetivo: avaliacao.objetivo || 'Avaliar aprendizagem',
      formato: avaliacao.formato || 'Avaliação escrita',
      criterios: Array.isArray(avaliacao.criterios) ? avaliacao.criterios : ['Critério de avaliação'],
      tempoEstimado: avaliacao.tempoEstimado || '50 minutos'
    }));
  }

  /**
   * Cria uma sequência básica como fallback em caso de erro
   */
  private criarSequenciaFallback(formData: ActivityFormData): SequenciaDidaticaCompleta {
    const quantidadeAulas = parseInt(formData.quantidadeAulas || '4');
    const quantidadeDiagnosticos = parseInt(formData.quantidadeDiagnosticos || '1');
    const quantidadeAvaliacoes = parseInt(formData.quantidadeAvaliacoes || '1');

    // Gerar aulas básicas
    const aulas: AulaData[] = Array.from({ length: quantidadeAulas }, (_, index) => ({
      numero: index + 1,
      titulo: `Aula ${index + 1}: ${formData.tituloTemaAssunto || 'Conteúdo'}`,
      objetivo: formData.objetivosAprendizagem || 'Desenvolver compreensão sobre o tema',
      conteudo: `Conteúdo da aula ${index + 1} sobre ${formData.tituloTemaAssunto || 'o tema abordado'}`,
      metodologia: 'Aula expositiva dialogada com atividades práticas',
      recursos: ['Quadro', 'Material didático', 'Recursos audiovisuais'],
      atividadePratica: `Atividade prática relacionada ao conteúdo da aula ${index + 1}`,
      avaliacao: 'Participação e desenvolvimento das atividades propostas',
      tempoEstimado: '50 minutos'
    }));

    // Gerar diagnósticos básicos
    const diagnosticos: DiagnosticoData[] = Array.from({ length: quantidadeDiagnosticos }, (_, index) => ({
      numero: index + 1,
      titulo: `Diagnóstico ${index + 1}: Conhecimentos Prévios`,
      objetivo: 'Avaliar os conhecimentos prévios dos estudantes sobre o tema',
      questoes: [
        'O que você já sabe sobre este assunto?',
        'Qual sua experiência anterior com este tema?',
        'Quais são suas expectativas para este conteúdo?'
      ],
      criteriosAvaliacao: 'Identificação do nível de conhecimento prévio dos estudantes',
      tempoEstimado: '30 minutos'
    }));

    // Gerar avaliações básicas
    const avaliacoes: AvaliacaoData[] = Array.from({ length: quantidadeAvaliacoes }, (_, index) => ({
      numero: index + 1,
      titulo: `Avaliação ${index + 1}: Verificação da Aprendizagem`,
      objetivo: 'Verificar o alcance dos objetivos de aprendizagem propostos',
      formato: 'Avaliação mista (questões objetivas e subjetivas)',
      criterios: [
        'Compreensão dos conceitos apresentados',
        'Aplicação do conhecimento adquirido',
        'Qualidade das respostas e argumentação'
      ],
      tempoEstimado: '50 minutos'
    }));

    return {
      tituloTemaAssunto: formData.tituloTemaAssunto || formData.title || 'Sequência Didática',
      anoSerie: formData.anoSerie || formData.schoolYear || '',
      disciplina: formData.disciplina || formData.subject || '',
      bnccCompetencias: formData.bnccCompetencias || formData.competencies || '',
      publicoAlvo: formData.publicoAlvo || formData.context || '',
      objetivosAprendizagem: formData.objetivosAprendizagem || formData.objectives || '',
      quantidadeAulas: formData.quantidadeAulas || '4',
      quantidadeDiagnosticos: formData.quantidadeDiagnosticos || '1',
      quantidadeAvaliacoes: formData.quantidadeAvaliacoes || '1',
      cronograma: formData.cronograma || 'Cronograma flexível conforme necessidades da turma',
      duracaoTotal: `${quantidadeAulas} aulas de 50 minutos cada`,
      materiaisNecessarios: ['Quadro', 'Material didático', 'Recursos audiovisuais'],
      competenciasDesenvolvidas: ['Compreensão', 'Análise', 'Aplicação'],
      aulas,
      diagnosticos,
      avaliacoes,
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false
    };
  }

  /**
   * Salva a sequência didática no localStorage com múltiplas chaves para garantir compatibilidade
   */
  private salvarSequencia(sequencia: SequenciaDidaticaCompleta): void {
    try {
      const chaves = [
        'constructed_sequencia-didatica_sequencia-didatica',
        'schoolpower_sequencia-didatica_content',
        'activity_sequencia-didatica',
        'constructed_sequencia-didatica_latest'
      ];

      chaves.forEach(chave => {
        localStorage.setItem(chave, JSON.stringify(sequencia));
        console.log(`💾 Sequência didática salva com chave: ${chave}`);
      });

      // Também salvar no cache de atividades construídas
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities['sequencia-didatica'] = {
        generatedContent: sequencia,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
      
      console.log('✅ Sequência didática salva em todas as chaves necessárias');
    } catch (error) {
      console.error('❌ Erro ao salvar sequência no localStorage:', error);
    }
  }

  /**
   * Valida os dados necessários para construir a sequência
   */
  private validarDados(formData: ActivityFormData): { valido: boolean; erro?: string } {
    if (!formData.tituloTemaAssunto && !formData.title) {
      return { valido: false, erro: 'Título do tema/assunto é obrigatório' };
    }

    if (!formData.disciplina && !formData.subject) {
      return { valido: false, erro: 'Disciplina é obrigatória' };
    }

    if (!formData.anoSerie && !formData.schoolYear) {
      return { valido: false, erro: 'Ano/série é obrigatório' };
    }

    if (!formData.objetivosAprendizagem && !formData.objectives) {
      return { valido: false, erro: 'Objetivos de aprendizagem são obrigatórios' };
    }

    const quantidadeAulas = parseInt(formData.quantidadeAulas || '0');
    if (quantidadeAulas <= 0) {
      return { valido: false, erro: 'Quantidade de aulas deve ser maior que 0' };
    }

    const quantidadeDiagnosticos = parseInt(formData.quantidadeDiagnosticos || '0');
    if (quantidadeDiagnosticos < 0) {
      return { valido: false, erro: 'Quantidade de diagnósticos deve ser 0 ou maior' };
    }

    const quantidadeAvaliacoes = parseInt(formData.quantidadeAvaliacoes || '0');
    if (quantidadeAvaliacoes < 0) {
      return { valido: false, erro: 'Quantidade de avaliações deve ser 0 ou maior' };
    }

    return { valido: true };
  }

  /**
   * Carrega uma sequência salva do localStorage
   */
  carregarSequenciaSalva(): SequenciaDidaticaCompleta | null {
    try {
      const activityKey = 'constructed_sequencia-didatica_latest';
      const savedData = localStorage.getItem(activityKey);
      
      if (savedData) {
        return JSON.parse(savedData);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao carregar sequência salva:', error);
      return null;
    }
  }
}

export const sequenciaDidaticaBuilder = new SequenciaDidaticaBuilder();
