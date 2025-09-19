
import { v4 as uuidv4 } from 'uuid';

// Caracteres para geração de código único (Base62)
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

// Interface para os dados da atividade compartilhável
export interface AtividadeCompartilhavel {
  id: string;
  titulo: string;
  tipo: string;
  dados: any;
  criadoPor: string;
  criadoEm: string;
  codigoUnico: string;
  linkPublico: string;
  ativo: boolean;
}

// Interface para criar nova atividade compartilhável
export interface NovaAtividadeCompartilhavel {
  id: string;
  titulo: string;
  tipo: string;
  dados: any;
  criadoPor: string;
}

// Chave base para localStorage
const STORAGE_KEY = 'ponto_school_atividades_compartilhaveis';
const STORAGE_VERSION = '1.0';

class LocalStorageManager {
  private getStorageKey(): string {
    return `${STORAGE_KEY}_v${STORAGE_VERSION}`;
  }

  private getAllActivities(): AtividadeCompartilhavel[] {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('❌ Erro ao carregar atividades do localStorage:', error);
      return [];
    }
  }

  private saveAllActivities(activities: AtividadeCompartilhavel[]): boolean {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(activities));
      console.log('✅ Atividades salvas no localStorage:', activities.length);
      return true;
    } catch (error) {
      console.error('❌ Erro ao salvar atividades no localStorage:', error);
      return false;
    }
  }

  findByActivityId(activityId: string): AtividadeCompartilhavel | null {
    const activities = this.getAllActivities();
    return activities.find(activity => 
      activity.id === activityId && activity.ativo === true
    ) || null;
  }

  findByCode(activityId: string, codigoUnico: string): AtividadeCompartilhavel | null {
    const activities = this.getAllActivities();
    return activities.find(activity => 
      activity.id === activityId && 
      activity.codigoUnico === codigoUnico && 
      activity.ativo === true
    ) || null;
  }

  saveActivity(activity: AtividadeCompartilhavel): boolean {
    const activities = this.getAllActivities();
    const existingIndex = activities.findIndex(a => a.id === activity.id);
    
    if (existingIndex >= 0) {
      activities[existingIndex] = activity;
    } else {
      activities.push(activity);
    }
    
    return this.saveAllActivities(activities);
  }

  updateActivity(activityId: string, updates: Partial<AtividadeCompartilhavel>): boolean {
    const activities = this.getAllActivities();
    const index = activities.findIndex(a => a.id === activityId);
    
    if (index >= 0) {
      activities[index] = { ...activities[index], ...updates };
      return this.saveAllActivities(activities);
    }
    
    return false;
  }

  getAllByUser(userId: string): AtividadeCompartilhavel[] {
    const activities = this.getAllActivities();
    return activities.filter(activity => 
      activity.criadoPor === userId && activity.ativo === true
    );
  }

  deactivateActivity(activityId: string): boolean {
    return this.updateActivity(activityId, { 
      ativo: false,
      criadoEm: new Date().toISOString() // Atualizar timestamp de desativação
    });
  }

  codeExists(codigo: string): boolean {
    const activities = this.getAllActivities();
    return activities.some(activity => 
      activity.codigoUnico === codigo && activity.ativo === true
    );
  }
}

class GeradorLinkAtividadesSchoolPower {
  private readonly baseUrl: string;
  private storage: LocalStorageManager;

  constructor() {
    // URL base da plataforma
    this.baseUrl = window.location.origin;
    this.storage = new LocalStorageManager();
  }

  /**
   * Gera um código único aleatório usando Base62
   * @param tamanho - Tamanho do código (padrão: 8 caracteres)
   * @returns Código único gerado
   */
  private gerarCodigoUnico(tamanho: number = 8): string {
    let codigo = "";
    for (let i = 0; i < tamanho; i++) {
      codigo += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    return codigo;
  }

  /**
   * Gera um código único garantindo que não existe duplicata
   * @param tamanho - Tamanho do código
   * @returns Código único válido
   */
  private gerarCodigoUnicoValidado(tamanho: number = 8): string {
    let tentativas = 0;
    const maxTentativas = 10;

    while (tentativas < maxTentativas) {
      const codigo = this.gerarCodigoUnico(tamanho);
      
      if (!this.storage.codeExists(codigo)) {
        return codigo;
      }
      
      tentativas++;
    }

    // Se chegou aqui, aumenta o tamanho e tenta novamente
    return this.gerarCodigoUnicoValidado(tamanho + 1);
  }

  /**
   * Cria o link público completo para uma atividade
   * @param atividadeId - ID da atividade
   * @param codigoUnico - Código único gerado
   * @returns Link público completo
   */
  private criarLinkPublico(atividadeId: string, codigoUnico: string): string {
    return `${this.baseUrl}/atividade/${atividadeId}/${codigoUnico}`;
  }

  /**
   * Salva uma nova atividade compartilhável no localStorage
   * @param atividade - Dados da atividade
   * @returns Atividade compartilhável criada
   */
  async criarAtividadeCompartilhavel(atividade: NovaAtividadeCompartilhavel): Promise<AtividadeCompartilhavel | null> {
    try {
      console.log('🔗 [GERADOR] Iniciando geração de link para:', atividade.titulo);
      console.log('📋 [GERADOR] Dados recebidos completos:', atividade);

      // Validar dados obrigatórios
      if (!atividade.id) {
        throw new Error('ID da atividade é obrigatório');
      }
      if (!atividade.titulo) {
        throw new Error('Título da atividade é obrigatório');
      }
      
      // Primeiro, verifica se já existe uma atividade compartilhável para este ID
      console.log('🔍 [GERADOR] Verificando se já existe link para ID:', atividade.id);
      const existente = this.storage.findByActivityId(atividade.id);

      // Se já existe, retorna a existente
      if (existente) {
        console.log('♻️ [GERADOR] Link já existe, retornando link existente:', existente.linkPublico);
        console.log('🔑 [GERADOR] Código existente:', existente.codigoUnico);
        return existente;
      }

      console.log('🆕 [GERADOR] Criando novo link...');
      
      // Gera código único validado
      const codigoUnico = this.gerarCodigoUnicoValidado();
      console.log('🎯 [GERADOR] Código único:', codigoUnico);
      
      // Cria o link público
      const linkPublico = this.criarLinkPublico(atividade.id, codigoUnico);
      console.log('🔗 [GERADOR] Link público:', linkPublico);

      // Criar objeto da atividade compartilhável
      const novaAtividade: AtividadeCompartilhavel = {
        id: atividade.id,
        titulo: atividade.titulo,
        tipo: atividade.tipo,
        dados: atividade.dados || {},
        criadoPor: atividade.criadoPor,
        codigoUnico: codigoUnico,
        linkPublico: linkPublico,
        criadoEm: new Date().toISOString(),
        ativo: true
      };

      console.log('💾 [GERADOR] Salvando no localStorage:', novaAtividade);

      // Salva no localStorage
      const success = this.storage.saveActivity(novaAtividade);

      if (!success) {
        throw new Error('Falha ao salvar no localStorage');
      }

      console.log('✅ [GERADOR] Sucesso! Dados salvos');
      console.log('🎯 [GERADOR] Resultado final:', novaAtividade);
      
      // Validação final
      if (!novaAtividade.linkPublico) {
        throw new Error('Link público não foi gerado corretamente');
      }

      return novaAtividade;

    } catch (error) {
      console.error('❌ [GERADOR] Erro completo:', error);
      throw error;
    }
  }

  /**
   * Busca uma atividade compartilhável pelo código único
   * @param atividadeId - ID da atividade
   * @param codigoUnico - Código único da atividade
   * @returns Atividade encontrada ou null
   */
  async buscarAtividadePorCodigo(atividadeId: string, codigoUnico: string): Promise<AtividadeCompartilhavel | null> {
    try {
      console.log('🔍 Buscando atividade com código:', codigoUnico);

      const atividade = this.storage.findByCode(atividadeId, codigoUnico);

      if (!atividade) {
        console.log('⚠️ Atividade não encontrada');
        return null;
      }

      console.log('✅ Atividade encontrada:', atividade.titulo);
      return atividade;

    } catch (error) {
      console.error('❌ Erro ao buscar atividade:', error);
      return null;
    }
  }

  /**
   * Atualiza o link de uma atividade existente (gera novo código)
   * @param atividadeId - ID da atividade
   * @returns Nova atividade compartilhável ou null
   */
  async regenerarLinkAtividade(atividadeId: string): Promise<AtividadeCompartilhavel | null> {
    try {
      console.log('🔄 Regenerando link para atividade:', atividadeId);

      // Busca a atividade atual
      const atividadeAtual = this.storage.findByActivityId(atividadeId);

      if (!atividadeAtual) {
        console.error('❌ Atividade não encontrada para regenerar link');
        return null;
      }

      // Gera novo código único
      const novoCodigoUnico = this.gerarCodigoUnicoValidado();
      const novoLinkPublico = this.criarLinkPublico(atividadeId, novoCodigoUnico);

      // Atualiza no localStorage
      const success = this.storage.updateActivity(atividadeId, {
        codigoUnico: novoCodigoUnico,
        linkPublico: novoLinkPublico,
        criadoEm: new Date().toISOString() // Atualizar timestamp
      });

      if (!success) {
        console.error('❌ Erro ao regenerar link no localStorage');
        return null;
      }

      console.log('✅ Link regenerado com sucesso:', novoLinkPublico);

      // Buscar a atividade atualizada
      const atividadeAtualizada = this.storage.findByActivityId(atividadeId);
      return atividadeAtualizada;

    } catch (error) {
      console.error('❌ Erro ao regenerar link:', error);
      return null;
    }
  }

  /**
   * Desativa uma atividade compartilhável (remove acesso público)
   * @param atividadeId - ID da atividade
   * @returns True se desativado com sucesso
   */
  async desativarAtividade(atividadeId: string): Promise<boolean> {
    try {
      console.log('🚫 Desativando atividade:', atividadeId);

      const success = this.storage.deactivateActivity(atividadeId);

      if (success) {
        console.log('✅ Atividade desativada com sucesso');
      } else {
        console.error('❌ Erro ao desativar atividade');
      }

      return success;

    } catch (error) {
      console.error('❌ Erro ao desativar atividade:', error);
      return false;
    }
  }

  /**
   * Lista todas as atividades compartilháveis de um usuário
   * @param userId - ID do usuário
   * @returns Lista de atividades compartilháveis
   */
  async listarAtividadesDoUsuario(userId: string): Promise<AtividadeCompartilhavel[]> {
    try {
      console.log('📋 Listando atividades do usuário:', userId);

      const atividades = this.storage.getAllByUser(userId);
      
      // Ordenar por data de criação (mais recentes primeiro)
      atividades.sort((a, b) => 
        new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
      );

      return atividades;

    } catch (error) {
      console.error('❌ Erro ao listar atividades:', error);
      return [];
    }
  }
}

// Instância singleton do gerador
export const geradorLinkAtividades = new GeradorLinkAtividadesSchoolPower();

// Funções utilitárias para uso fácil
export const criarLinkAtividade = (atividade: NovaAtividadeCompartilhavel) => 
  geradorLinkAtividades.criarAtividadeCompartilhavel(atividade);

export const buscarAtividadeCompartilhada = (atividadeId: string, codigo: string) => 
  geradorLinkAtividades.buscarAtividadePorCodigo(atividadeId, codigo);

export const regenerarLinkAtividade = (atividadeId: string) => 
  geradorLinkAtividades.regenerarLinkAtividade(atividadeId);

export const desativarAtividadeCompartilhada = (atividadeId: string) => 
  geradorLinkAtividades.desativarAtividade(atividadeId);

export const listarAtividadesCompartilhadas = (userId: string) => 
  geradorLinkAtividades.listarAtividadesDoUsuario(userId);
