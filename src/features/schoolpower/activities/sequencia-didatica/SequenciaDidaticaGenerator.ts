import { geminiClient } from '@/utils/api/geminiClient';
import { SequenciaDidaticaData } from './sequenciaDidaticaProcessor';

export interface AulaData {
  numero: number;
  titulo: string;
  objetivo: string;
  conteudo: string;
  metodologia: string;
  recursos: string[];
  atividadePratica: string;
  avaliacao: string;
  tempoEstimado: string;
}

export interface DiagnosticoData {
  numero: number;
  titulo: string;
  objetivo: string;
  questoes: string[];
  criteriosAvaliacao: string;
  tempoEstimado: string;
}

export interface AvaliacaoData {
  numero: number;
  titulo: string;
  objetivo: string;
  formato: string;
  criterios: string[];
  tempoEstimado: string;
}

export interface SequenciaDidaticaCompleta {
  tituloTemaAssunto: string;
  anoSerie: string;
  disciplina: string;
  bnccCompetencias: string;
  publicoAlvo: string;
  objetivosAprendizagem: string;
  quantidadeAulas: string;
  quantidadeDiagnosticos: string;
  quantidadeAvaliacoes: string;
  cronograma: string;
  duracaoTotal: string;
  materiaisNecessarios: string[];
  competenciasDesenvolvidas: string[];
  aulas: AulaData[];
  diagnosticos: DiagnosticoData[];
  avaliacoes: AvaliacaoData[];
  generatedAt: string;
  isGeneratedByAI: boolean;
}

export class SequenciaDidaticaGenerator {
  private static instance: SequenciaDidaticaGenerator;

  static getInstance(): SequenciaDidaticaGenerator {
    if (!SequenciaDidaticaGenerator.instance) {
      SequenciaDidaticaGenerator.instance = new SequenciaDidaticaGenerator();
    }
    return SequenciaDidaticaGenerator.instance;
  }

  async gerarSequenciaDidatica(dados: SequenciaDidaticaData): Promise<SequenciaDidaticaCompleta> {
    console.log('🚀 Gerando Sequência Didática com dados:', dados);

    try {
      const prompt = this.construirPrompt(dados);
      console.log('📝 Prompt construído para IA:', prompt);

      const response = await geminiClient.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 4000
      });

      if (!response.success) {
        throw new Error(`Erro na geração: ${response.error}`);
      }

      const sequenciaCompleta = this.processarResposta(response.result, dados);
      console.log('✅ Sequência Didática gerada:', sequenciaCompleta);

      return sequenciaCompleta;
    } catch (error) {
      console.error('❌ Erro na geração:', error);
      return this.criarSequenciaFallback(dados);
    }
  }

  private construirPrompt(dados: SequenciaDidaticaData): string {
    return `
Crie uma sequência didática COMPLETA e estruturada com as seguintes especificações:

## DADOS BÁSICOS:
- Título: ${dados.tituloTemaAssunto}
- Disciplina: ${dados.disciplina}
- Ano/Série: ${dados.anoSerie}
- Público-alvo: ${dados.publicoAlvo}
- Objetivos: ${dados.objetivosAprendizagem}
- BNCC: ${dados.bnccCompetencias || 'A definir conforme currículo'}

## ESTRUTURA REQUERIDA:
- Quantidade de Aulas: ${dados.quantidadeAulas}
- Quantidade de Diagnósticos: ${dados.quantidadeDiagnosticos}
- Quantidade de Avaliações: ${dados.quantidadeAvaliacoes}
- Cronograma: ${dados.cronograma || 'Flexível conforme ritmo da turma'}

Retorne APENAS um JSON válido no seguinte formato:

{
  "tituloTemaAssunto": "${dados.tituloTemaAssunto}",
  "anoSerie": "${dados.anoSerie}",
  "disciplina": "${dados.disciplina}",
  "bnccCompetencias": "${dados.bnccCompetencias || 'Competências BNCC específicas para o tema'}",
  "publicoAlvo": "${dados.publicoAlvo}",
  "objetivosAprendizagem": "${dados.objetivosAprendizagem}",
  "quantidadeAulas": "${dados.quantidadeAulas}",
  "quantidadeDiagnosticos": "${dados.quantidadeDiagnosticos}",
  "quantidadeAvaliacoes": "${dados.quantidadeAvaliacoes}",
  "cronograma": "Cronograma detalhado e específico para ${dados.tituloTemaAssunto}",
  "duracaoTotal": "${dados.quantidadeAulas} aulas de 50 minutos cada - Total: ${parseInt(dados.quantidadeAulas) * 50} minutos",
  "materiaisNecessarios": ["Lista específica de materiais para ${dados.tituloTemaAssunto}"],
  "competenciasDesenvolvidas": ["Competências específicas desenvolvidas no tema"],
  "aulas": [
    {
      "numero": 1,
      "titulo": "Título específico da Aula 1 sobre ${dados.tituloTemaAssunto}",
      "objetivo": "Objetivo específico e detalhado da primeira aula",
      "conteudo": "Conteúdo específico e detalhado para ${dados.tituloTemaAssunto}",
      "metodologia": "Metodologia específica adequada ao tema e público",
      "recursos": ["Recursos específicos necessários"],
      "atividadePratica": "Atividade prática específica relacionada ao tema",
      "avaliacao": "Critério de avaliação específico da aula",
      "tempoEstimado": "50 minutos"
    }
  ],
  "diagnosticos": [
    {
      "numero": 1,
      "titulo": "Diagnóstico específico para ${dados.tituloTemaAssunto}",
      "objetivo": "Objetivo específico do diagnóstico",
      "questoes": ["Questões específicas sobre ${dados.tituloTemaAssunto}"],
      "criteriosAvaliacao": "Critérios específicos de avaliação diagnóstica",
      "tempoEstimado": "30 minutos"
    }
  ],
  "avaliacoes": [
    {
      "numero": 1,
      "titulo": "Avaliação específica de ${dados.tituloTemaAssunto}",
      "objetivo": "Objetivo específico da avaliação",
      "formato": "Formato específico adequado ao tema",
      "criterios": ["Critérios específicos de avaliação"],
      "tempoEstimado": "50 minutos"
    }
  ]
}

INSTRUÇÕES ESPECÍFICAS:
1. Crie EXATAMENTE ${dados.quantidadeAulas} aulas detalhadas e progressivas
2. Desenvolva ${dados.quantidadeDiagnosticos} diagnóstico(s) completo(s)
3. Elabore ${dados.quantidadeAvaliacoes} avaliação(ões) adequada(s)
4. Garanta progressão lógica entre as aulas
5. Foque nos objetivos definidos
6. Use metodologias variadas e recursos adequados

Retorne APENAS o JSON válido, sem texto adicional.
`;
  }

  private processarResposta(resposta: string, dados: SequenciaDidaticaData): SequenciaDidaticaCompleta {
    try {
      // Limpar resposta
      let jsonString = resposta.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```\s*/, '').replace(/\s*```$/, '');
      }

      const dadosIA = JSON.parse(jsonString);
      console.log('📊 Dados parseados da IA:', dadosIA);

      // Processar aulas
      const aulas = this.processarAulas(dadosIA.aulas || [], parseInt(dados.quantidadeAulas));
      const diagnosticos = this.processarDiagnosticos(dadosIA.diagnosticos || [], parseInt(dados.quantidadeDiagnosticos));
      const avaliacoes = this.processarAvaliacoes(dadosIA.avaliacoes || [], parseInt(dados.quantidadeAvaliacoes));

      const sequenciaCompleta: SequenciaDidaticaCompleta = {
        tituloTemaAssunto: dadosIA.tituloTemaAssunto || dados.tituloTemaAssunto,
        anoSerie: dadosIA.anoSerie || dados.anoSerie,
        disciplina: dadosIA.disciplina || dados.disciplina,
        bnccCompetencias: dadosIA.bnccCompetencias || dados.bnccCompetencias || 'A definir',
        publicoAlvo: dadosIA.publicoAlvo || dados.publicoAlvo,
        objetivosAprendizagem: dadosIA.objetivosAprendizagem || dados.objetivosAprendizagem,
        quantidadeAulas: dadosIA.quantidadeAulas || dados.quantidadeAulas,
        quantidadeDiagnosticos: dadosIA.quantidadeDiagnosticos || dados.quantidadeDiagnosticos,
        quantidadeAvaliacoes: dadosIA.quantidadeAvaliacoes || dados.quantidadeAvaliacoes,
        cronograma: dadosIA.cronograma || dados.cronograma || 'Cronograma flexível',
        duracaoTotal: dadosIA.duracaoTotal || `${dados.quantidadeAulas} aulas de 50 minutos`,
        materiaisNecessarios: Array.isArray(dadosIA.materiaisNecessarios) 
          ? dadosIA.materiaisNecessarios 
          : ['Quadro', 'Material didático', 'Recursos audiovisuais'],
        competenciasDesenvolvidas: Array.isArray(dadosIA.competenciasDesenvolvidas) 
          ? dadosIA.competenciasDesenvolvidas 
          : ['Compreensão', 'Análise', 'Aplicação'],
        aulas,
        diagnosticos,
        avaliacoes,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true
      };

      console.log('✅ Sequência processada com sucesso:', {
        titulo: sequenciaCompleta.tituloTemaAssunto,
        aulasCount: sequenciaCompleta.aulas.length,
        diagnosticosCount: sequenciaCompleta.diagnosticos.length,
        avaliacoesCount: sequenciaCompleta.avaliacoes.length
      });

      return sequenciaCompleta;
    } catch (error) {
      console.error('❌ Erro ao processar resposta da IA:', error);
      return this.criarSequenciaFallback(dados);
    }
  }

  private processarAulas(aulas: any[], quantidade: number): AulaData[] {
    const aulasProcessadas = aulas.map((aula, index) => ({
      numero: aula.numero || index + 1,
      titulo: aula.titulo || `Aula ${index + 1}`,
      objetivo: aula.objetivo || 'Objetivo a ser definido',
      conteudo: aula.conteudo || 'Conteúdo a ser desenvolvido',
      metodologia: aula.metodologia || 'Metodologia a ser aplicada',
      recursos: Array.isArray(aula.recursos) ? aula.recursos : ['Recursos básicos'],
      atividadePratica: aula.atividadePratica || 'Atividade prática relacionada',
      avaliacao: aula.avaliacao || 'Observação da participação',
      tempoEstimado: aula.tempoEstimado || '50 minutos'
    }));

    // Garantir quantidade correta de aulas
    while (aulasProcessadas.length < quantidade) {
      const numeroAula = aulasProcessadas.length + 1;
      aulasProcessadas.push({
        numero: numeroAula,
        titulo: `Aula ${numeroAula}: Desenvolvimento`,
        objetivo: 'Desenvolver conhecimentos específicos',
        conteudo: 'Conteúdo programático da aula',
        metodologia: 'Aula expositiva dialogada',
        recursos: ['Quadro', 'Material didático'],
        atividadePratica: 'Atividade prática relacionada',
        avaliacao: 'Participação e desenvolvimento',
        tempoEstimado: '50 minutos'
      });
    }

    return aulasProcessadas.slice(0, quantidade);
  }

  private processarDiagnosticos(diagnosticos: any[], quantidade: number): DiagnosticoData[] {
    const diagnosticosProcessados = diagnosticos.map((diag, index) => ({
      numero: diag.numero || index + 1,
      titulo: diag.titulo || `Diagnóstico ${index + 1}`,
      objetivo: diag.objetivo || 'Avaliar conhecimentos',
      questoes: Array.isArray(diag.questoes) ? diag.questoes : ['Questão diagnóstica'],
      criteriosAvaliacao: diag.criteriosAvaliacao || 'Critérios de avaliação',
      tempoEstimado: diag.tempoEstimado || '30 minutos'
    }));

    while (diagnosticosProcessados.length < quantidade) {
      const numero = diagnosticosProcessados.length + 1;
      diagnosticosProcessados.push({
        numero,
        titulo: `Diagnóstico ${numero}`,
        objetivo: 'Avaliar conhecimentos dos estudantes',
        questoes: ['O que você já conhece sobre este tema?'],
        criteriosAvaliacao: 'Identificação do nível de conhecimento',
        tempoEstimado: '30 minutos'
      });
    }

    return diagnosticosProcessados.slice(0, quantidade);
  }

  private processarAvaliacoes(avaliacoes: any[], quantidade: number): AvaliacaoData[] {
    const avaliacoesProcessadas = avaliacoes.map((aval, index) => ({
      numero: aval.numero || index + 1,
      titulo: aval.titulo || `Avaliação ${index + 1}`,
      objetivo: aval.objetivo || 'Verificar aprendizagem',
      formato: aval.formato || 'Avaliação escrita',
      criterios: Array.isArray(aval.criterios) ? aval.criterios : ['Compreensão dos conceitos'],
      tempoEstimado: aval.tempoEstimado || '50 minutos'
    }));

    while (avaliacoesProcessadas.length < quantidade) {
      const numero = avaliacoesProcessadas.length + 1;
      avaliacoesProcessadas.push({
        numero,
        titulo: `Avaliação ${numero}`,
        objetivo: 'Verificar alcance dos objetivos',
        formato: 'Avaliação mista',
        criterios: ['Compreensão', 'Aplicação'],
        tempoEstimado: '50 minutos'
      });
    }

    return avaliacoesProcessadas.slice(0, quantidade);
  }

  private criarSequenciaFallback(dados: SequenciaDidaticaData): SequenciaDidaticaCompleta {
    console.log('🔄 Criando sequência fallback');

    const quantAulas = parseInt(dados.quantidadeAulas || '4');
    const quantDiag = parseInt(dados.quantidadeDiagnosticos || '1');
    const quantAval = parseInt(dados.quantidadeAvaliacoes || '1');

    const aulas = Array.from({ length: quantAulas }, (_, i) => ({
      numero: i + 1,
      titulo: `Aula ${i + 1}: ${dados.tituloTemaAssunto}`,
      objetivo: dados.objetivosAprendizagem || 'Desenvolver competências',
      conteudo: `Conteúdo da aula ${i + 1}`,
      metodologia: 'Aula expositiva dialogada',
      recursos: ['Quadro', 'Material didático'],
      atividadePratica: `Atividade prática da aula ${i + 1}`,
      avaliacao: 'Observação da participação',
      tempoEstimado: '50 minutos'
    }));

    const diagnosticos = Array.from({ length: quantDiag }, (_, i) => ({
      numero: i + 1,
      titulo: `Diagnóstico ${i + 1}`,
      objetivo: 'Avaliar conhecimentos prévios',
      questoes: ['O que você já conhece sobre este tema?'],
      criteriosAvaliacao: 'Identificação do nível de conhecimento',
      tempoEstimado: '30 minutos'
    }));

    const avaliacoes = Array.from({ length: quantAval }, (_, i) => ({
      numero: i + 1,
      titulo: `Avaliação ${i + 1}`,
      objetivo: 'Verificar aprendizagem',
      formato: 'Avaliação mista',
      criterios: ['Compreensão', 'Aplicação'],
      tempoEstimado: '50 minutos'
    }));

    return {
      tituloTemaAssunto: dados.tituloTemaAssunto,
      anoSerie: dados.anoSerie,
      disciplina: dados.disciplina,
      bnccCompetencias: dados.bnccCompetencias || 'A definir',
      publicoAlvo: dados.publicoAlvo,
      objetivosAprendizagem: dados.objetivosAprendizagem,
      quantidadeAulas: dados.quantidadeAulas,
      quantidadeDiagnosticos: dados.quantidadeDiagnosticos,
      quantidadeAvaliacoes: dados.quantidadeAvaliacoes,
      cronograma: dados.cronograma || 'Cronograma flexível',
      duracaoTotal: `${quantAulas} aulas de 50 minutos`,
      materiaisNecessarios: ['Quadro', 'Material didático', 'Recursos audiovisuais'],
      competenciasDesenvolvidas: ['Compreensão', 'Análise', 'Aplicação'],
      aulas,
      diagnosticos,
      avaliacoes,
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false
    };
  }
}

export const sequenciaDidaticaGenerator = SequenciaDidaticaGenerator.getInstance();