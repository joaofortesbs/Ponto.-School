
import SequenciaDidaticaBuilder, { 
  SequenciaDidaticaData, 
  SequenciaDidaticaResult,
  SequenciaDidaticaAula 
} from './SequenciaDidaticaBuilder';

export class SequenciaDidaticaGenerator {
  static async generate(formData: SequenciaDidaticaData): Promise<SequenciaDidaticaResult> {
    try {
      console.log('🎯 SequenciaDidaticaGenerator: Iniciando geração com dados:', formData);
      
      // Validar dados obrigatórios
      if (!formData.tituloTemaAssunto || !formData.disciplina || !formData.anoSerie) {
        throw new Error('Dados obrigatórios ausentes para geração da sequência didática');
      }

      // Usar o builder para gerar a sequência
      const result = await SequenciaDidaticaBuilder.generateSequenciaDidatica(formData);
      
      console.log('✅ SequenciaDidaticaGenerator: Sequência gerada com sucesso');
      
      // Salvar no localStorage para acesso posterior
      const storageKey = `sequencia_didatica_generated_${Date.now()}`;
      localStorage.setItem(storageKey, JSON.stringify(result));
      
      return result;
      
    } catch (error) {
      console.error('❌ SequenciaDidaticaGenerator: Erro na geração:', error);
      throw error;
    }
  }

  static async loadFromStorage(activityId: string): Promise<SequenciaDidaticaResult | null> {
    try {
      // Tentar carregar dados salvos
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('sequencia_didatica_') && key.includes(activityId)
      );
      
      if (keys.length > 0) {
        const data = localStorage.getItem(keys[0]);
        return data ? JSON.parse(data) : null;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao carregar sequência do storage:', error);
      return null;
    }
  }

  static validateResult(result: SequenciaDidaticaResult): boolean {
    try {
      if (!result || !result.aulas || !Array.isArray(result.aulas)) {
        return false;
      }

      if (!result.metadados) {
        return false;
      }

      // Validar cada aula
      for (const aula of result.aulas) {
        if (!aula.id || !aula.tipo || !aula.titulo || !aula.objetivo || !aula.resumo) {
          return false;
        }
        
        if (!['Aula', 'Diagnostico', 'Avaliacao'].includes(aula.tipo)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Erro na validação da sequência:', error);
      return false;
    }
  }
}
