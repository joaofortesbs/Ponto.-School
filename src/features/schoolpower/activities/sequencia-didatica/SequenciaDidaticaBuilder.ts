
import { geminiClient } from '@/utils/api/geminiClient';

export interface SequenciaDidaticaAula {
  id: string;
  tipo: 'Aula' | 'Diagnostico' | 'Avaliacao';
  titulo: string;
  objetivo: string;
  resumo: string;
  ordem: number;
}

export interface SequenciaDidaticaData {
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
}

export interface SequenciaDidaticaResult {
  aulas: SequenciaDidaticaAula[];
  metadados: {
    totalAulas: number;
    totalDiagnosticos: number;
    totalAvaliacoes: number;
    disciplina: string;
    anoSerie: string;
  };
}

class SequenciaDidaticaBuilder {
  static async saveSequencia(data: any): Promise<void> {
    try {
      const key = `sequencia_didatica_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify(data));
      console.log('✅ Sequência didática salva:', key);
    } catch (error) {
      console.error('❌ Erro ao salvar sequência didática:', error);
      throw error;
    }
  }

  static async loadSequencia(key: string): Promise<any> {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Erro ao carregar sequência salva:', error);
      return null;
    }
  }

  static async generateSequenciaDidatica(formData: SequenciaDidaticaData): Promise<SequenciaDidaticaResult> {
    try {
      console.log('🚀 Iniciando geração da Sequência Didática com dados:', formData);

      const prompt = this.buildPrompt(formData);
      
      const response = await geminiClient.generateContent(prompt);
      
      if (!response || !response.text) {
        throw new Error('Resposta vazia da API Gemini');
      }

      const result = this.parseGeminiResponse(response.text(), formData);
      
      // Salvar resultado
      await this.saveSequencia(result);
      
      console.log('✅ Sequência Didática gerada com sucesso:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Erro ao gerar Sequência Didática:', error);
      throw new Error(`Falha na geração: ${error.message}`);
    }
  }

  private static buildPrompt(data: SequenciaDidaticaData): string {
    return `
# GERAÇÃO DE SEQUÊNCIA DIDÁTICA

## DADOS FORNECIDOS:
- **Título/Tema:** ${data.tituloTemaAssunto}
- **Ano/Série:** ${data.anoSerie}
- **Disciplina:** ${data.disciplina}
- **BNCC/Competências:** ${data.bnccCompetencias}
- **Público-alvo:** ${data.publicoAlvo}
- **Objetivos de Aprendizagem:** ${data.objetivosAprendizagem}
- **Quantidade de Aulas:** ${data.quantidadeAulas}
- **Quantidade de Diagnósticos:** ${data.quantidadeDiagnosticos}
- **Quantidade de Avaliações:** ${data.quantidadeAvaliacoes}
- **Cronograma:** ${data.cronograma}

## INSTRUÇÕES:
Gere uma sequência didática completa com as seguintes especificações:

1. **Total de atividades:** ${parseInt(data.quantidadeAulas) + parseInt(data.quantidadeDiagnosticos) + parseInt(data.quantidadeAvaliacoes)}
2. **Tipos de atividades:**
   - ${data.quantidadeAulas} Aulas
   - ${data.quantidadeDiagnosticos} Diagnósticos
   - ${data.quantidadeAvaliacoes} Avaliações

## FORMATO DE RESPOSTA (JSON):
Responda APENAS com um JSON válido no seguinte formato:

{
  "aulas": [
    {
      "id": "aula_1",
      "tipo": "Aula",
      "titulo": "Título da Aula",
      "objetivo": "Objetivo específico da aula",
      "resumo": "Resumo detalhado do que será abordado",
      "ordem": 1
    }
  ]
}

## REGRAS IMPORTANTES:
- Distribua as atividades de forma pedagógica (diagnósticos no início, aulas no meio, avaliações no final)
- Cada atividade deve ter título, objetivo e resumo únicos e relevantes
- Mantenha coerência com os objetivos de aprendizagem fornecidos
- Use linguagem adequada para ${data.anoSerie}
- Considere a disciplina ${data.disciplina} em todo o contexto

RESPONDA APENAS COM O JSON, SEM TEXTO ADICIONAL.
`;
  }

  private static parseGeminiResponse(responseText: string, formData: SequenciaDidaticaData): SequenciaDidaticaResult {
    try {
      // Limpar resposta e extrair JSON
      let cleanResponse = responseText.trim();
      
      // Remover markdown se presente
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsedData = JSON.parse(cleanResponse);
      
      if (!parsedData.aulas || !Array.isArray(parsedData.aulas)) {
        throw new Error('Formato de resposta inválido: propriedade "aulas" não encontrada');
      }

      return {
        aulas: parsedData.aulas,
        metadados: {
          totalAulas: parseInt(formData.quantidadeAulas),
          totalDiagnosticos: parseInt(formData.quantidadeDiagnosticos),
          totalAvaliacoes: parseInt(formData.quantidadeAvaliacoes),
          disciplina: formData.disciplina,
          anoSerie: formData.anoSerie
        }
      };
      
    } catch (error) {
      console.error('❌ Erro ao parsear resposta da IA:', error);
      console.error('📄 Resposta recebida:', responseText);
      
      // Fallback com dados básicos
      return this.generateFallbackSequencia(formData);
    }
  }

  private static generateFallbackSequencia(formData: SequenciaDidaticaData): SequenciaDidaticaResult {
    const aulas: SequenciaDidaticaAula[] = [];
    let ordem = 1;

    // Gerar diagnósticos
    for (let i = 1; i <= parseInt(formData.quantidadeDiagnosticos); i++) {
      aulas.push({
        id: `diagnostico_${i}`,
        tipo: 'Diagnostico',
        titulo: `Diagnóstico ${i} - ${formData.tituloTemaAssunto}`,
        objetivo: `Avaliar conhecimentos prévios sobre ${formData.tituloTemaAssunto}`,
        resumo: `Atividade diagnóstica para identificar o nível de conhecimento dos alunos sobre o tema.`,
        ordem: ordem++
      });
    }

    // Gerar aulas
    for (let i = 1; i <= parseInt(formData.quantidadeAulas); i++) {
      aulas.push({
        id: `aula_${i}`,
        tipo: 'Aula',
        titulo: `Aula ${i} - ${formData.tituloTemaAssunto}`,
        objetivo: `Desenvolver compreensão sobre aspectos específicos de ${formData.tituloTemaAssunto}`,
        resumo: `Conteúdo teórico e prático relacionado ao tema principal da sequência didática.`,
        ordem: ordem++
      });
    }

    // Gerar avaliações
    for (let i = 1; i <= parseInt(formData.quantidadeAvaliacoes); i++) {
      aulas.push({
        id: `avaliacao_${i}`,
        tipo: 'Avaliacao',
        titulo: `Avaliação ${i} - ${formData.tituloTemaAssunto}`,
        objetivo: `Verificar aprendizagem dos conteúdos abordados`,
        resumo: `Atividade avaliativa para mensurar o progresso dos alunos no tema estudado.`,
        ordem: ordem++
      });
    }

    return {
      aulas,
      metadados: {
        totalAulas: parseInt(formData.quantidadeAulas),
        totalDiagnosticos: parseInt(formData.quantidadeDiagnosticos),
        totalAvaliacoes: parseInt(formData.quantidadeAvaliacoes),
        disciplina: formData.disciplina,
        anoSerie: formData.anoSerie
      }
    };
  }
}

export default SequenciaDidaticaBuilder;
