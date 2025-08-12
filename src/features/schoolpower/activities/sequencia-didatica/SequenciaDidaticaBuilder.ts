
import { geminiClient } from '@/utils/api/geminiClient';
import { ActivityFormData } from '../../construction/types/ActivityTypes';
import { 
  SequenciaDidaticaCompleta, 
  sequenciaDidaticaGenerator 
} from './SequenciaDidaticaGenerator';
import { 
  processSequenciaDidaticaData, 
  validateSequenciaDidaticaData, 
  activityFormToSequenciaData 
} from './sequenciaDidaticaProcessor';

export interface SequenciaDidaticaBuildResult {
  success: boolean;
  data?: SequenciaDidaticaCompleta;
  error?: string;
}

export class SequenciaDidaticaBuilder {
  private static readonly STORAGE_KEYS = [
    'constructed_sequencia-didatica_sequencia-didatica',
    'schoolpower_sequencia-didatica_content',
    'activity_sequencia-didatica',
    'constructed_sequencia-didatica_latest'
  ];

  /**
   * Constrói uma sequência didática completa baseada nos dados do formulário
   */
  async construirSequenciaDidatica(formData: ActivityFormData): Promise<SequenciaDidaticaBuildResult> {
    console.log('🚀 SequenciaDidaticaBuilder: Iniciando construção da sequência didática');
    console.log('📊 Dados recebidos:', formData);

    try {
      // Converter dados do formulário
      const sequenciaData = activityFormToSequenciaData(formData);
      console.log('🔄 Dados convertidos:', sequenciaData);

      // Validar dados
      const validation = validateSequenciaDidaticaData(sequenciaData);
      if (!validation.valid) {
        console.error('❌ Dados inválidos:', validation.errors);
        return {
          success: false,
          error: `Dados inválidos: ${validation.errors.join(', ')}`
        };
      }

      console.log('✅ Dados validados com sucesso');

      // Gerar sequência didática usando o generator
      const sequenciaCompleta = await sequenciaDidaticaGenerator.gerarSequenciaDidatica(sequenciaData);
      
      console.log('🎯 Sequência gerada:', {
        titulo: sequenciaCompleta.tituloTemaAssunto,
        aulas: sequenciaCompleta.aulas?.length || 0,
        diagnosticos: sequenciaCompleta.diagnosticos?.length || 0,
        avaliacoes: sequenciaCompleta.avaliacoes?.length || 0
      });

      // Salvar em múltiplas chaves para compatibilidade
      await this.salvarSequenciaDidatica(sequenciaCompleta);

      return {
        success: true,
        data: sequenciaCompleta
      };

    } catch (error) {
      console.error('❌ Erro na construção da sequência didática:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na construção'
      };
    }
  }

  /**
   * Salva a sequência didática em múltiplas chaves do localStorage
   */
  private async salvarSequenciaDidatica(sequencia: SequenciaDidaticaCompleta): Promise<void> {
    try {
      const dataToSave = JSON.stringify(sequencia);
      
      // Salvar em todas as chaves para garantir compatibilidade
      this.STORAGE_KEYS.forEach(key => {
        localStorage.setItem(key, dataToSave);
        console.log(`💾 Sequência salva na chave: ${key}`);
      });

      // Também salvar na estrutura de atividades construídas
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities['sequencia-didatica'] = {
        generatedContent: sequencia,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

      console.log('✅ Sequência didática salva em todas as chaves necessárias');
    } catch (error) {
      console.error('❌ Erro ao salvar sequência didática:', error);
      throw new Error('Erro ao salvar dados da sequência didática');
    }
  }

  /**
   * Carrega uma sequência didática salva
   */
  static carregarSequenciaDidatica(): SequenciaDidaticaCompleta | null {
    for (const key of SequenciaDidaticaBuilder.STORAGE_KEYS) {
      try {
        const saved = localStorage.getItem(key);
        if (saved) {
          const data = JSON.parse(saved);
          console.log(`📥 Sequência carregada da chave: ${key}`);
          return data;
        }
      } catch (error) {
        console.error(`❌ Erro ao carregar da chave ${key}:`, error);
      }
    }
    
    console.log('⚠️ Nenhuma sequência didática encontrada no localStorage');
    return null;
  }

  /**
   * Limpa todas as sequências didáticas salvas
   */
  static limparSequenciasDidaticas(): void {
    SequenciaDidaticaBuilder.STORAGE_KEYS.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Limpar também da estrutura de atividades construídas
    try {
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      delete constructedActivities['sequencia-didatica'];
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
    } catch (error) {
      console.error('Erro ao limpar constructedActivities:', error);
    }
    
    console.log('🗑️ Todas as sequências didáticas foram limpas do localStorage');
  }
}

export const sequenciaDidaticaBuilder = new SequenciaDidaticaBuilder();
