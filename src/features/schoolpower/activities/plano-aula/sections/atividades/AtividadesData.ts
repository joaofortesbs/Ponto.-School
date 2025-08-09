
import { DesenvolvimentoData, EtapaDesenvolvimento } from '../desenvolvimento/DesenvolvimentoData';
import schoolPowerActivitiesData from '../../../../data/schoolPowerActivities.json';

export interface AtividadeRecurso {
  id: string;
  nome: string;
  tipo: 'atividade' | 'recurso' | 'material';
  descricao?: string;
  icone?: string;
  origem: 'desenvolvimento' | 'school_power' | 'manual';
  etapa_origem?: string;
  schoolPowerActivity?: any;
}

export interface AtividadesData {
  titulo: string;
  descricao: string;
  total_items: number;
  atividades_recursos: AtividadeRecurso[];
  timestamp: string;
  plano_id: string;
}

export class AtividadesDataProcessor {
  /**
   * Processa dados de atividades vindos do desenvolvimento e outras fontes
   */
  static processarDadosAtividades(input: any): AtividadesData {
    console.log('🔄 AtividadesDataProcessor: Iniciando processamento', input);

    const { planoData, activityData, desenvolvimento } = input;
    const atividadesRecursos: AtividadeRecurso[] = [];

    // Processar dados do desenvolvimento se disponível
    if (desenvolvimento?.etapas || planoData?.desenvolvimento?.etapas) {
      const etapas = desenvolvimento?.etapas || planoData?.desenvolvimento?.etapas || [];
      
      etapas.forEach((etapa: EtapaDesenvolvimento, index: number) => {
        // Extrair recursos utilizados
        if (etapa.recursosUtilizados && Array.isArray(etapa.recursosUtilizados)) {
          etapa.recursosUtilizados.forEach((recurso: string, recursoIndex: number) => {
            // Verificar se é uma atividade do School Power
            const schoolPowerActivity = this.findSchoolPowerActivity(recurso);
            
            atividadesRecursos.push({
              id: `etapa-${index}-recurso-${recursoIndex}`,
              nome: recurso,
              tipo: schoolPowerActivity ? 'atividade' : 'recurso',
              descricao: etapa.descricao || `Recurso da etapa: ${etapa.titulo}`,
              origem: 'desenvolvimento',
              etapa_origem: etapa.titulo,
              schoolPowerActivity: schoolPowerActivity
            });
          });
        }

        // Extrair atividades mencionadas na descrição
        if (etapa.descricao) {
          const atividadesEncontradas = this.extrairAtividadesDaDescricao(etapa.descricao);
          atividadesEncontradas.forEach((atividade, atIndex) => {
            atividadesRecursos.push({
              id: `etapa-${index}-atividade-${atIndex}`,
              nome: atividade.nome,
              tipo: 'atividade',
              descricao: atividade.descricao,
              origem: 'desenvolvimento',
              etapa_origem: etapa.titulo,
              schoolPowerActivity: atividade.schoolPowerActivity
            });
          });
        }
      });
    }

    // Processar materiais do plano geral
    if (planoData?.materiais && Array.isArray(planoData.materiais)) {
      planoData.materiais.forEach((material: string, index: number) => {
        atividadesRecursos.push({
          id: `material-${index}`,
          nome: material,
          tipo: 'material',
          descricao: `Material necessário para o plano de aula`,
          origem: 'manual'
        });
      });
    }

    // Processar recursos do activityData
    if (activityData?.originalData?.materiais && Array.isArray(activityData.originalData.materiais)) {
      activityData.originalData.materiais.forEach((material: string, index: number) => {
        // Evitar duplicatas
        const jaExiste = atividadesRecursos.some(item => 
          item.nome.toLowerCase() === material.toLowerCase()
        );

        if (!jaExiste) {
          atividadesRecursos.push({
            id: `activity-material-${index}`,
            nome: material,
            tipo: 'material',
            descricao: `Material do plano de aula`,
            origem: 'manual'
          });
        }
      });
    }

    // Adicionar atividades do School Power automaticamente
    this.adicionarAtividadesSchoolPowerRelevantes(atividadesRecursos, planoData, activityData);

    // Remover duplicatas baseado no nome
    const atividadesUnicas = this.removerDuplicatas(atividadesRecursos);

    const resultado: AtividadesData = {
      titulo: "Atividades e Recursos",
      descricao: "Atividades e recursos necessários para aplicar o plano de aula",
      total_items: atividadesUnicas.length,
      atividades_recursos: atividadesUnicas,
      timestamp: new Date().toISOString(),
      plano_id: activityData?.id || planoData?.id || `plano_${Date.now()}`
    };

    console.log('✅ AtividadesDataProcessor: Processamento concluído', resultado);
    return resultado;
  }

  /**
   * Encontra atividade correspondente no School Power
   */
  private static findSchoolPowerActivity(nomeRecurso: string): any {
    if (!nomeRecurso) return null;

    const nomeNormalizado = nomeRecurso.toLowerCase();
    
    return schoolPowerActivitiesData.find(activity => {
      const nomeActivity = (activity.name || activity.title || '').toLowerCase();
      const descricaoActivity = (activity.description || '').toLowerCase();
      
      return nomeActivity.includes(nomeNormalizado) || 
             nomeNormalizado.includes(nomeActivity) ||
             descricaoActivity.includes(nomeNormalizado);
    });
  }

  /**
   * Extrai atividades mencionadas na descrição de uma etapa
   */
  private static extrairAtividadesDaDescricao(descricao: string): Array<{nome: string, descricao: string, schoolPowerActivity?: any}> {
    const atividades: Array<{nome: string, descricao: string, schoolPowerActivity?: any}> = [];
    
    // Palavras-chave que indicam atividades
    const palavrasChave = [
      'exercício', 'exercícios', 'atividade', 'atividades',
      'questão', 'questões', 'problema', 'problemas',
      'tarefa', 'tarefas', 'prática', 'práticas'
    ];

    const descricaoLower = descricao.toLowerCase();
    
    palavrasChave.forEach(palavra => {
      if (descricaoLower.includes(palavra)) {
        // Procurar atividades do School Power relacionadas
        const atividadesRelacionadas = schoolPowerActivitiesData.filter(activity => {
          const nomeActivity = (activity.name || activity.title || '').toLowerCase();
          const descricaoActivity = (activity.description || '').toLowerCase();
          
          return nomeActivity.includes(palavra) || descricaoActivity.includes(palavra);
        });

        atividadesRelacionadas.forEach(activity => {
          atividades.push({
            nome: activity.name || activity.title || palavra,
            descricao: activity.description || `Atividade relacionada a ${palavra}`,
            schoolPowerActivity: activity
          });
        });
      }
    });

    return atividades;
  }

  /**
   * Adiciona atividades do School Power relevantes ao contexto
   */
  private static adicionarAtividadesSchoolPowerRelevantes(
    atividadesRecursos: AtividadeRecurso[], 
    planoData: any, 
    activityData: any
  ): void {
    // Obter disciplina do plano
    const disciplina = planoData?.disciplina || activityData?.originalData?.disciplina || '';
    const tema = planoData?.tema || activityData?.originalData?.tema || '';

    // Selecionar atividades relevantes
    const atividadesRelevantes = schoolPowerActivitiesData.filter(activity => {
      const tags = activity.tags || [];
      const categoria = activity.category || '';
      
      // Verificar se a atividade é relevante para a disciplina ou tema
      return tags.some((tag: string) => 
        disciplina.toLowerCase().includes(tag.toLowerCase()) ||
        tema.toLowerCase().includes(tag.toLowerCase()) ||
        categoria.toLowerCase().includes(disciplina.toLowerCase())
      );
    });

    // Adicionar até 3 atividades mais relevantes
    atividadesRelevantes.slice(0, 3).forEach((activity, index) => {
      atividadesRecursos.push({
        id: `school-power-${index}`,
        nome: activity.name || activity.title || 'Atividade School Power',
        tipo: 'atividade',
        descricao: activity.description || 'Atividade gerada pelo School Power',
        origem: 'school_power',
        schoolPowerActivity: activity
      });
    });
  }

  /**
   * Remove duplicatas baseado no nome
   */
  private static removerDuplicatas(atividades: AtividadeRecurso[]): AtividadeRecurso[] {
    const nomesVistos = new Set<string>();
    return atividades.filter(atividade => {
      const nomeNormalizado = atividade.nome.toLowerCase().trim();
      if (nomesVistos.has(nomeNormalizado)) {
        return false;
      }
      nomesVistos.add(nomeNormalizado);
      return true;
    });
  }

  /**
   * Valida se os dados processados estão corretos
   */
  static validarDados(dados: AtividadesData): { valido: boolean; erros: string[] } {
    const erros: string[] = [];

    if (!dados.titulo || dados.titulo.trim() === '') {
      erros.push('Título é obrigatório');
    }

    if (!dados.atividades_recursos || dados.atividades_recursos.length === 0) {
      erros.push('Pelo menos uma atividade ou recurso deve estar presente');
    }

    if (dados.total_items !== dados.atividades_recursos.length) {
      erros.push('Total de items não confere com o número de atividades/recursos');
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }
}

export default AtividadesDataProcessor;
