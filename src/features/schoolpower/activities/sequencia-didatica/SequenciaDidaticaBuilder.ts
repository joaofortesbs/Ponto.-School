
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

      // Validar dados obrigatórios
      const validacao = validateSequenciaDidaticaData(sequenciaData);
      if (!validacao.valid) {
        return {
          success: false,
          error: `Dados inválidos: ${validacao.errors.join(', ')}`
        };
      }

      console.log('✅ Dados validados com sucesso');

      // Gerar sequência com o generator
      const sequenciaCompleta = await sequenciaDidaticaGenerator.gerarSequenciaDidatica(sequenciaData);
      
      console.log('🎯 Sequência didática gerada:', {
        titulo: sequenciaCompleta.tituloTemaAssunto,
        disciplina: sequenciaCompleta.disciplina,
        aulasCount: sequenciaCompleta.aulas.length,
        diagnosticosCount: sequenciaCompleta.diagnosticos.length,
        avaliacoesCount: sequenciaCompleta.avaliacoes.length
      });

      // Salvar no localStorage com todas as chaves necessárias
      this.salvarSequencia(sequenciaCompleta);

      return {
        success: true,
        data: sequenciaCompleta
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
   * Salva a sequência didática no localStorage com múltiplas chaves para garantir compatibilidade
   */
  private salvarSequencia(sequencia: SequenciaDidaticaCompleta): void {
    console.log('💾 Salvando sequência didática no localStorage');
    
    try {
      const dataToSave = JSON.stringify(sequencia);
      
      // Salvar com todas as chaves necessárias
      SequenciaDidaticaBuilder.STORAGE_KEYS.forEach(chave => {
        localStorage.setItem(chave, dataToSave);
        console.log(`✅ Sequência salva com chave: ${chave}`);
      });

      // Também salvar no cache de atividades construídas
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities['sequencia-didatica'] = {
        generatedContent: sequencia,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
      
      console.log('✅ Sequência didática salva em todas as chaves necessárias');
      
      // Log para debug
      console.log('🔍 Verificação de salvamento:', {
        chavesPrincipais: SequenciaDidaticaBuilder.STORAGE_KEYS.map(key => ({
          key,
          exists: !!localStorage.getItem(key)
        })),
        constructedActivitiesExists: !!localStorage.getItem('constructedActivities')
      });
      
    } catch (error) {
      console.error('❌ Erro ao salvar sequência no localStorage:', error);
    }
  }

  /**
   * Carrega uma sequência salva do localStorage
   */
  carregarSequenciaSalva(): SequenciaDidaticaCompleta | null {
    console.log('🔍 Carregando sequência salva do localStorage');
    
    try {
      // Tentar carregar das chaves em ordem de prioridade
      for (const chave of SequenciaDidaticaBuilder.STORAGE_KEYS) {
        const savedData = localStorage.getItem(chave);
        if (savedData) {
          console.log(`✅ Sequência encontrada na chave: ${chave}`);
          const parsed = JSON.parse(savedData);
          console.log('📊 Dados carregados:', {
            titulo: parsed.tituloTemaAssunto,
            aulasCount: parsed.aulas?.length || 0,
            diagnosticosCount: parsed.diagnosticos?.length || 0,
            avaliacoesCount: parsed.avaliacoes?.length || 0
          });
          return parsed;
        }
      }
      
      console.log('⚠️ Nenhuma sequência salva encontrada');
      return null;
    } catch (error) {
      console.error('❌ Erro ao carregar sequência salva:', error);
      return null;
    }
  }

  /**
   * Limpa todas as sequências salvas
   */
  limparSequenciasSalvas(): void {
    console.log('🗑️ Limpando sequências salvas');
    
    SequenciaDidaticaBuilder.STORAGE_KEYS.forEach(chave => {
      localStorage.removeItem(chave);
      console.log(`🗑️ Removido: ${chave}`);
    });

    // Limpar do cache de atividades construídas também
    const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
    delete constructedActivities['sequencia-didatica'];
    localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
    
    console.log('✅ Todas as sequências foram removidas');
  }
}

export const sequenciaDidaticaBuilder = new SequenciaDidaticaBuilder();
