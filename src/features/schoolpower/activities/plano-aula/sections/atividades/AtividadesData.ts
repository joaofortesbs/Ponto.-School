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
  categoria?: string;
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
   * Extrai etapas de desenvolvimento de forma segura
   */
  private static extrairEtapasSeguramente(desenvolvimento: any, planoData: any, activityData: any): any[] {
    // Tentar múltiplas fontes de dados
    const fontes = [
      desenvolvimento?.etapas,
      planoData?.desenvolvimento?.etapas,
      activityData?.desenvolvimento?.etapas,
      activityData?.originalData?.desenvolvimento?.etapas
    ];

    for (const fonte of fontes) {
      if (Array.isArray(fonte) && fonte.length > 0) {
        console.log('📝 Etapas encontradas na fonte:', fonte.length);
        return fonte;
      }
    }

    console.log('📝 Nenhuma etapa encontrada, retornando array vazio');
    return [];
  }

  /**
   * Cria dados padrão de atividades
   */
  private static criarAtividadesPadrao(): AtividadesData {
    return {
      titulo: "Atividades e Recursos",
      descricao: "Lista de atividades e recursos para o plano de aula",
      total_items: 0,
      atividades_recursos: [],
      timestamp: new Date().toISOString(),
      plano_id: `plano_${Date.now()}`
    };
  }

  /**
   * Determina o tipo de recurso baseado no nome
   */
  private static determinarTipoRecurso(nomeRecurso: string): 'atividade' | 'recurso' | 'material' {
    const nome = nomeRecurso.toLowerCase();
    
    const atividades = ['lista', 'exercício', 'prova', 'quiz', 'jogo', 'simulado'];
    const recursos = ['slide', 'apresentação', 'mapa mental', 'texto'];
    
    if (atividades.some(palavra => nome.includes(palavra))) return 'atividade';
    if (recursos.some(palavra => nome.includes(palavra))) return 'recurso';
    
    return 'material';
  }

  /**
   * Categoriza por tipo de interação
   */
  private static categorizarPorTipoInteracao(tipoInteracao: string): string {
    const mapeamento: Record<string, string> = {
      'apresentacao': 'expositiva',
      'discussao': 'participativa', 
      'pratica': 'atividade',
      'grupo': 'colaborativa',
      'individual': 'individual'
    };

    return mapeamento[tipoInteracao] || 'geral';
  }

  /**
   * Processa dados de atividades vindos do desenvolvimento e outras fontes
   */
  static processarDadosAtividades(input: any): AtividadesData {
    console.log('🔄 AtividadesDataProcessor: Iniciando processamento', input);

    // Verificar se input existe e é válido
    if (!input || typeof input !== 'object') {
      console.warn('⚠️ Input inválido para AtividadesDataProcessor');
      return this.criarAtividadesPadrao();
    }

    const { planoData, activityData, desenvolvimento } = input;
    const atividadesRecursos: AtividadeRecurso[] = [];

    // Processar dados do desenvolvimento se disponível
    const etapasDesenvolvimento = this.extrairEtapasSeguramente(desenvolvimento, planoData, activityData);
    
    if (etapasDesenvolvimento && etapasDesenvolvimento.length > 0) {
      console.log('📝 Processando etapas do desenvolvimento:', etapasDesenvolvimento.length);
      
      etapasDesenvolvimento.forEach((etapa: any, index: number) => {
        if (!etapa || typeof etapa !== 'object') return;
        
        // Processar recursos da etapa de forma segura
        const recursos = Array.isArray(etapa.recursos) ? etapa.recursos : [];
        recursos.forEach((recurso: string) => {
          if (typeof recurso === 'string' && recurso.trim()) {
            atividadesRecursos.push({
              id: `desenvolvimento_${index}_${recurso.toLowerCase().replace(/\s+/g, '_')}`,
              nome: recurso,
              tipo: this.determinarTipoRecurso(recurso),
              descricao: `Recurso para a etapa: ${etapa.titulo || 'Etapa sem título'}`,
              origem: 'desenvolvimento',
              etapa_origem: etapa.titulo || `Etapa ${index + 1}`,
              categoria: 'material'
            });
          }
        });
        
        // Adicionar a própria etapa como atividade
        if (etapa.titulo) {
          atividadesRecursos.push({
            id: `etapa_${index}`,
            nome: etapa.titulo,
            tipo: 'atividade',
            descricao: etapa.descricao || 'Atividade de desenvolvimento',
            origem: 'desenvolvimento',
            etapa_origem: etapa.titulo,
            categoria: this.categorizarPorTipoInteracao(etapa.tipoInteracao)
          });
        }
      }); [];

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
              icone: this.getIconeForRecurso(recurso, schoolPowerActivity),
              origem: 'desenvolvimento',
              etapa_origem: etapa.titulo,
              schoolPowerActivity: schoolPowerActivity,
              categoria: this.determinarCategoria(recurso, schoolPowerActivity)
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
              icone: this.getIconeForRecurso(atividade.nome, atividade.schoolPowerActivity),
              origem: 'desenvolvimento',
              etapa_origem: etapa.titulo,
              schoolPowerActivity: atividade.schoolPowerActivity,
              categoria: this.determinarCategoria(atividade.nome, atividade.schoolPowerActivity)
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
          icone: this.getIconeForRecurso(material),
          origem: 'manual',
          categoria: this.determinarCategoria(material)
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
            icone: this.getIconeForRecurso(material),
            origem: 'manual',
            categoria: this.determinarCategoria(material)
          });
        }
      });
    }

    // Adicionar atividades do School Power automaticamente
    this.adicionarAtividadesSchoolPowerRelevantes(atividadesRecursos, planoData, activityData);

    // Remover duplicatas baseado no nome
    const atividadesUnicas = this.removerDuplicatas(atividadesRecursos);

    // Adicionar categorias automaticamente
    const atividadesComCategoria = atividadesUnicas.map(item => ({
      ...item,
      categoria: this.determinarCategoria(item.nome, item.schoolPowerActivity)
    }));


    const resultado: AtividadesData = {
      titulo: "Atividades e Recursos",
      descricao: "Atividades e recursos necessários para aplicar o plano de aula",
      total_items: atividadesComCategoria.length,
      atividades_recursos: atividadesComCategoria,
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
   * Obtém o ícone apropriado para um recurso
   */
  private static getIconeForRecurso(recurso: string, schoolPowerActivity?: any): string {
    if (schoolPowerActivity) {
      return schoolPowerActivity.icone || 'Activity';
    }

    // Determinar ícone baseado no nome do recurso
    const recursoLower = recurso.toLowerCase();

    if (recursoLower.includes('video') || recursoLower.includes('vídeo')) return 'Video';
    if (recursoLower.includes('apresentação') || recursoLower.includes('slide')) return 'Presentation';
    if (recursoLower.includes('jogo') || recursoLower.includes('game')) return 'Gamepad2';
    if (recursoLower.includes('texto') || recursoLower.includes('leitura')) return 'FileText';
    if (recursoLower.includes('exercício') || recursoLower.includes('atividade')) return 'PenTool';
    if (recursoLower.includes('discussão') || recursoLower.includes('debate')) return 'MessageSquare';
    if (recursoLower.includes('quadro') || recursoLower.includes('lousa')) return 'Square';
    if (recursoLower.includes('livro') || recursoLower.includes('material')) return 'BookOpen';
    if (recursoLower.includes('mapa') || recursoLower.includes('esquema')) return 'Map';
    if (recursoLower.includes('imagem') || recursoLower.includes('figura')) return 'Image';
    if (recursoLower.includes('grupo') || recursoLower.includes('equipe')) return 'Users';
    if (recursoLower.includes('experimento') || recursoLower.includes('laboratório')) return 'Beaker';

    return 'Activity'; // Ícone padrão
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
        categoria.toLowerCase()ase().includes(disciplina.toLowerCase())
      );
    });

    // Adicionar até 3 atividades mais relevantes
    atividadesRelevantes.slice(0, 3).forEach((activity, index) => {
      atividadesRecursos.push({
        id: `school-power-${index}`,
        nome: activity.name || activity.title || 'Atividade School Power',
        tipo: 'atividade',
        descricao: activity.description || 'Atividade gerada pelo School Power',
        icone: this.getIconeForRecurso(activity.name || activity.title || '', activity),
        origem: 'school_power',
        schoolPowerActivity: activity,
        categoria: this.determinarCategoria(activity.name || activity.title || '', activity)
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
   * Determina a categoria de um recurso
   */
  private static determinarCategoria(recurso: string, schoolPowerActivity?: any): string {
    if (schoolPowerActivity) {
      return schoolPowerActivity.categoria || 'Atividade Interativa';
    }

    const recursoLower = recurso.toLowerCase();

    if (recursoLower.includes('video') || recursoLower.includes('vídeo')) return 'Material Audiovisual';
    if (recursoLower.includes('apresentação') || recursoLower.includes('slide')) return 'Material de Apresentação';
    if (recursoLower.includes('jogo') || recursoLower.includes('game')) return 'Atividade Lúdica';
    if (recursoLower.includes('texto') || recursoLower.includes('leitura')) return 'Material Textual';
    if (recursoLower.includes('exercício') || recursoLower.includes('atividade')) return 'Atividade Prática';
    if (recursoLower.includes('discussão') || recursoLower.includes('debate')) return 'Atividade Colaborativa';
    if (recursoLower.includes('quadro') || recursoLower.includes('lousa')) return 'Material de Apoio';
    if (recursoLower.includes('livro') || recursoLower.includes('material')) return 'Material Didático';
    if (recursoLower.includes('experimento') || recursoLower.includes('laboratório')) return 'Atividade Experimental';

    return 'Material Geral';
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