
import { geminiClient } from '@/utils/api/geminiClient';

export interface AulaData {
  id: string;
  numero: number;
  titulo: string;
  objetivoEspecifico: string;
  resumo: string;
  etapas: {
    introducao: {
      tempo: string;
      descricao: string;
      cor: string;
    };
    desenvolvimento: {
      tempo: string;
      descricao: string;
      cor: string;
    };
    fechamento: {
      tempo: string;
      descricao: string;
      cor: string;
    };
  };
  recursos: string[];
  atividadePratica: string;
  tempoTotal: string;
}

export interface DiagnosticoData {
  id: string;
  numero: number;
  titulo: string;
  objetivoAvaliativo: string;
  tipoAvaliacao: string;
  quantidadeQuestoes: number;
  formato: string;
  criteriosCorrecao: {
    faixa: string;
    resultado: string;
    cor: string;
  }[];
  tempo: string;
}

export interface AvaliacaoData {
  id: string;
  numero: number;
  titulo: string;
  objetivoAvaliativo: string;
  tipoAvaliacao: string;
  quantidadeQuestoes: number;
  valorTotal: string;
  composicao: {
    tipo: string;
    quantidade: number;
    pontos: string;
  }[];
  gabarito: string;
  tempo: string;
}

export interface SequenciaDidaticaCompleta {
  id: string;
  titulo: string;
  disciplina: string;
  anoSerie: string;
  objetivosAprendizagem: string;
  publicoAlvo: string;
  bnccCompetencias: string;
  cronograma: string;
  aulas: AulaData[];
  diagnosticos: DiagnosticoData[];
  avaliacoes: AvaliacaoData[];
  resumoEstatistico: {
    totalAulas: number;
    totalDiagnosticos: number;
    totalAvaliacoes: number;
    tempoTotalMinutos: number;
  };
  metadados: {
    dataGeracao: string;
    versao: string;
    sistemaGerador: string;
  };
}

export class SequenciaDidaticaGenerator {
  private static instance: SequenciaDidaticaGenerator;

  static getInstance(): SequenciaDidaticaGenerator {
    if (!SequenciaDidaticaGenerator.instance) {
      SequenciaDidaticaGenerator.instance = new SequenciaDidaticaGenerator();
    }
    return SequenciaDidaticaGenerator.instance;
  }

  async gerarSequenciaCompleta(dados: any): Promise<SequenciaDidaticaCompleta> {
    console.log('🔄 Iniciando geração da Sequência Didática completa:', dados);

    try {
      const prompt = this.construirPromptCompleto(dados);
      console.log('📝 Prompt construído, enviando para IA...');

      const response = await geminiClient.generateContent(prompt);
      console.log('✅ Resposta recebida da IA');

      const sequenciaGerada = this.processarRespostaIA(response, dados);
      console.log('🎯 Sequência processada e estruturada');

      // Salvar no localStorage para persistência
      const storageKey = `constructed_sequencia-didatica_${dados.id || Date.now()}`;
      localStorage.setItem(storageKey, JSON.stringify(sequenciaGerada));
      console.log('💾 Sequência salva no localStorage:', storageKey);

      return sequenciaGerada;
    } catch (error) {
      console.error('❌ Erro na geração da Sequência Didática:', error);
      throw new Error(`Falha na geração: ${error.message}`);
    }
  }

  private construirPromptCompleto(dados: any): string {
    return `
# GERAÇÃO DE SEQUÊNCIA DIDÁTICA COMPLETA

Você é um especialista em pedagogia e criação de sequências didáticas. Gere uma sequência didática completa e detalhada baseada nos dados fornecidos.

## DADOS DE ENTRADA:
- **Título/Tema:** ${dados.tituloTemaAssunto || dados.title || 'Não especificado'}
- **Disciplina:** ${dados.disciplina || dados.subject || 'Não especificado'}
- **Ano/Série:** ${dados.anoSerie || dados.schoolYear || 'Não especificado'}
- **Público-alvo:** ${dados.publicoAlvo || 'Estudantes do ensino fundamental/médio'}
- **Objetivos de Aprendizagem:** ${dados.objetivosAprendizagem || dados.objectives || 'Desenvolver competências específicas'}
- **Competências BNCC:** ${dados.bnccCompetencias || 'A definir conforme disciplina'}
- **Quantidade de Aulas:** ${dados.quantidadeAulas || '4'}
- **Quantidade de Diagnósticos:** ${dados.quantidadeDiagnosticos || '2'}
- **Quantidade de Avaliações:** ${dados.quantidadeAvaliacoes || '2'}
- **Cronograma:** ${dados.cronograma || 'A ser desenvolvido ao longo de 2-3 semanas'}

## INSTRUÇÕES DE GERAÇÃO:

Gere uma resposta JSON válida seguindo EXATAMENTE esta estrutura:

\`\`\`json
{
  "id": "sequencia-didatica-${Date.now()}",
  "titulo": "${dados.tituloTemaAssunto || dados.title || 'Sequência Didática'}",
  "disciplina": "${dados.disciplina || dados.subject}",
  "anoSerie": "${dados.anoSerie || dados.schoolYear}",
  "objetivosAprendizagem": "${dados.objetivosAprendizagem || dados.objectives}",
  "publicoAlvo": "${dados.publicoAlvo}",
  "bnccCompetencias": "${dados.bnccCompetencias}",
  "cronograma": "${dados.cronograma}",
  "aulas": [
    ${this.gerarTemplateAulas(parseInt(dados.quantidadeAulas || '4'))}
  ],
  "diagnosticos": [
    ${this.gerarTemplateDiagnosticos(parseInt(dados.quantidadeDiagnosticos || '2'))}
  ],
  "avaliacoes": [
    ${this.gerarTemplateAvaliacoes(parseInt(dados.quantidadeAvaliacoes || '2'))}
  ],
  "resumoEstatistico": {
    "totalAulas": ${dados.quantidadeAulas || 4},
    "totalDiagnosticos": ${dados.quantidadeDiagnosticos || 2},
    "totalAvaliacoes": ${dados.quantidadeAvaliacoes || 2},
    "tempoTotalMinutos": ${(parseInt(dados.quantidadeAulas || '4') * 50) + (parseInt(dados.quantidadeDiagnosticos || '2') * 20) + (parseInt(dados.quantidadeAvaliacoes || '2') * 45)}
  },
  "metadados": {
    "dataGeracao": "${new Date().toISOString()}",
    "versao": "1.0",
    "sistemaGerador": "School Power IA"
  }
}
\`\`\`

**IMPORTANTE:** 
- Gere conteúdo pedagógico rico e contextualizado
- Mantenha coerência entre todos os elementos
- Use linguagem adequada ao nível educacional
- Inclua recursos diversificados e metodologias ativas
- Certifique-se de que o JSON está válido e completo
- NÃO inclua comentários no JSON
- NÃO use caracteres especiais que quebrem o JSON
`;
  }

  private gerarTemplateAulas(quantidade: number): string {
    const aulas = [];
    for (let i = 1; i <= quantidade; i++) {
      aulas.push(`
    {
      "id": "aula-${i}",
      "numero": ${i},
      "titulo": "Aula ${i}: [Título específico relacionado ao tema]",
      "objetivoEspecifico": "Objetivo específico da aula ${i}",
      "resumo": "Resumo contextualizado da aula ${i}",
      "etapas": {
        "introducao": {
          "tempo": "10 min",
          "descricao": "Introdução contextualizada",
          "cor": "green"
        },
        "desenvolvimento": {
          "tempo": "30 min",
          "descricao": "Desenvolvimento principal",
          "cor": "orange"
        },
        "fechamento": {
          "tempo": "10 min",
          "descricao": "Fechamento e síntese",
          "cor": "purple"
        }
      },
      "recursos": ["Quadro", "Material impresso", "Recursos digitais"],
      "atividadePratica": "Atividade prática específica da aula ${i}",
      "tempoTotal": "50 min"
    }`);
    }
    return aulas.join(',');
  }

  private gerarTemplateDiagnosticos(quantidade: number): string {
    const diagnosticos = [];
    for (let i = 1; i <= quantidade; i++) {
      diagnosticos.push(`
    {
      "id": "diagnostico-${i}",
      "numero": ${i},
      "titulo": "Diagnóstico ${i}: [Título específico]",
      "objetivoAvaliativo": "Objetivo avaliativo do diagnóstico ${i}",
      "tipoAvaliacao": "Quiz Interativo",
      "quantidadeQuestoes": 8,
      "formato": "Múltipla escolha",
      "criteriosCorrecao": [
        {
          "faixa": "Excelente (8-7 acertos)",
          "resultado": "Pronto para avançar",
          "cor": "text-green-600"
        },
        {
          "faixa": "Bom (6-5 acertos)",
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
    }`);
    }
    return diagnosticos.join(',');
  }

  private gerarTemplateAvaliacoes(quantidade: number): string {
    const avaliacoes = [];
    for (let i = 1; i <= quantidade; i++) {
      avaliacoes.push(`
    {
      "id": "avaliacao-${i}",
      "numero": ${i},
      "titulo": "Avaliação ${i}: [Título específico]",
      "objetivoAvaliativo": "Objetivo avaliativo da avaliação ${i}",
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
    }`);
    }
    return avaliacoes.join(',');
  }

  private processarRespostaIA(response: any, dadosOriginais: any): SequenciaDidaticaCompleta {
    try {
      console.log('🔄 Processando resposta da IA...');
      
      let content = '';
      if (response?.candidates?.[0]?.content?.parts?.[0]?.text) {
        content = response.candidates[0].content.parts[0].text;
      } else if (typeof response === 'string') {
        content = response;
      } else {
        throw new Error('Formato de resposta inválido da IA');
      }

      // Extrair JSON da resposta
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON não encontrado na resposta da IA');
      }

      const sequenciaData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      
      // Validar estrutura básica
      if (!sequenciaData.aulas || !sequenciaData.diagnosticos || !sequenciaData.avaliacoes) {
        throw new Error('Estrutura de dados incompleta na resposta da IA');
      }

      console.log('✅ Resposta da IA processada com sucesso');
      return sequenciaData;

    } catch (error) {
      console.error('❌ Erro ao processar resposta da IA:', error);
      
      // Fallback: gerar estrutura básica com os dados fornecidos
      console.log('🔄 Gerando estrutura de fallback...');
      return this.gerarEstruturaNFallback(dadosOriginais);
    }
  }

  private gerarEstruturaNFallback(dados: any): SequenciaDidaticaCompleta {
    const quantidadeAulas = parseInt(dados.quantidadeAulas || '4');
    const quantidadeDiagnosticos = parseInt(dados.quantidadeDiagnosticos || '2');
    const quantidadeAvaliacoes = parseInt(dados.quantidadeAvaliacoes || '2');

    // Gerar aulas
    const aulas: AulaData[] = [];
    for (let i = 1; i <= quantidadeAulas; i++) {
      aulas.push({
        id: `aula-${i}`,
        numero: i,
        titulo: `Aula ${i}: ${dados.tituloTemaAssunto || 'Conteúdo Programático'}`,
        objetivoEspecifico: `Desenvolver competências específicas relacionadas ao ${dados.tituloTemaAssunto || 'tema da disciplina'}`,
        resumo: `Contextualização e desenvolvimento do conteúdo da aula ${i}`,
        etapas: {
          introducao: {
            tempo: "10 min",
            descricao: "Apresentação do tema e contextualização",
            cor: "green"
          },
          desenvolvimento: {
            tempo: "30 min",
            descricao: "Desenvolvimento principal do conteúdo",
            cor: "orange"
          },
          fechamento: {
            tempo: "10 min",
            descricao: "Síntese e esclarecimento de dúvidas",
            cor: "purple"
          }
        },
        recursos: ["Quadro branco", "Material impresso", "Recursos digitais", "Livro didático"],
        atividadePratica: `Atividade prática contextualizada para a aula ${i}`,
        tempoTotal: "50 min"
      });
    }

    // Gerar diagnósticos
    const diagnosticos: DiagnosticoData[] = [];
    for (let i = 1; i <= quantidadeDiagnosticos; i++) {
      diagnosticos.push({
        id: `diagnostico-${i}`,
        numero: i,
        titulo: `Avaliação Diagnóstica ${i}`,
        objetivoAvaliativo: `Identificar conhecimentos prévios sobre ${dados.tituloTemaAssunto || 'o tema'}`,
        tipoAvaliacao: "Quiz Interativo",
        quantidadeQuestoes: 8,
        formato: "Múltipla escolha",
        criteriosCorrecao: [
          {
            faixa: "Excelente (8-7 acertos)",
            resultado: "Pronto para avançar",
            cor: "text-green-600"
          },
          {
            faixa: "Bom (6-5 acertos)",
            resultado: "Revisão leve",
            cor: "text-yellow-600"
          },
          {
            faixa: "Precisa melhorar (<5)",
            resultado: "Revisão necessária",
            cor: "text-red-600"
          }
        ],
        tempo: "20 min"
      });
    }

    // Gerar avaliações
    const avaliacoes: AvaliacaoData[] = [];
    for (let i = 1; i <= quantidadeAvaliacoes; i++) {
      avaliacoes.push({
        id: `avaliacao-${i}`,
        numero: i,
        titulo: `Avaliação ${i}: ${dados.tituloTemaAssunto || 'Conteúdo Programático'}`,
        objetivoAvaliativo: `Avaliar a compreensão e aplicação dos conceitos de ${dados.tituloTemaAssunto || 'tema estudado'}`,
        tipoAvaliacao: "Prova Escrita",
        quantidadeQuestoes: 12,
        valorTotal: "10,0 pontos",
        composicao: [
          {
            tipo: "Múltipla escolha",
            quantidade: 8,
            pontos: "6,0 pts"
          },
          {
            tipo: "Discursivas",
            quantidade: 4,
            pontos: "4,0 pts"
          }
        ],
        gabarito: "Disponível após aplicação com critérios detalhados de correção",
        tempo: "45 min"
      });
    }

    return {
      id: `sequencia-didatica-${Date.now()}`,
      titulo: dados.tituloTemaAssunto || dados.title || 'Sequência Didática',
      disciplina: dados.disciplina || dados.subject || 'Disciplina',
      anoSerie: dados.anoSerie || dados.schoolYear || 'Ano/Série',
      objetivosAprendizagem: dados.objetivosAprendizagem || dados.objectives || 'Desenvolver competências específicas',
      publicoAlvo: dados.publicoAlvo || 'Estudantes do ensino fundamental/médio',
      bnccCompetencias: dados.bnccCompetencias || 'Competências BNCC aplicáveis',
      cronograma: dados.cronograma || 'Desenvolvimento ao longo de 2-3 semanas',
      aulas,
      diagnosticos,
      avaliacoes,
      resumoEstatistico: {
        totalAulas: quantidadeAulas,
        totalDiagnosticos: quantidadeDiagnosticos,
        totalAvaliacoes: quantidadeAvaliacoes,
        tempoTotalMinutos: (quantidadeAulas * 50) + (quantidadeDiagnosticos * 20) + (quantidadeAvaliacoes * 45)
      },
      metadados: {
        dataGeracao: new Date().toISOString(),
        versao: "1.0",
        sistemaGerador: "School Power IA"
      }
    };
  }
}

export const sequenciaDidaticaGenerator = SequenciaDidaticaGenerator.getInstance();
