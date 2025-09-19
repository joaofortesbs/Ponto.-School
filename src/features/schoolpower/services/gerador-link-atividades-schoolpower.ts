import { v4 as uuidv4 } from 'uuid';

// Interface para atividade compartilhável
export interface AtividadeCompartilhavel {
  id: string;
  titulo: string;
  tipo: string;
  dados: any;
  codigoUnico: string;
  linkPublico: string;
  criadoEm: string;
  expiracaoEm?: string;
  visualizacoes: number;
  ativa: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  sessaoOrigem?: string;
}

// Interface para dados de rastreamento UTM
export interface UTMData {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  sessionId?: string;
  referrer?: string;
  timestamp?: string;
}

// Classe para gerenciar localStorage com backup robusto
class LocalStorageManager {
  private static readonly ATIVIDADES_KEY = 'pontoschool_atividades_compartilhadas';
  private static readonly UTM_KEY = 'pontoschool_utm_tracking';
  private static readonly BACKUP_KEY = 'pontoschool_backup_atividades';

  static salvarAtividade(atividade: AtividadeCompartilhavel): boolean {
    try {
      const atividadesExistentes = this.obterAtividades();
      atividadesExistentes[atividade.id] = atividade;

      const dadosSerializados = JSON.stringify(atividadesExistentes);

      // Salvar nos três locais para redundância
      localStorage.setItem(this.ATIVIDADES_KEY, dadosSerializados);
      localStorage.setItem(this.BACKUP_KEY, dadosSerializados);
      sessionStorage.setItem(this.ATIVIDADES_KEY, dadosSerializados);

      console.log('✅ [LOCAL] Atividade salva com sucesso:', atividade.titulo);
      return true;
    } catch (error) {
      console.error('❌ [LOCAL] Erro ao salvar atividade:', error);
      return false;
    }
  }

  static obterAtividades(): Record<string, AtividadeCompartilhavel> {
    try {
      // Tentar localStorage primeiro
      let dados = localStorage.getItem(this.ATIVIDADES_KEY);

      // Se não encontrou, tentar backup
      if (!dados) {
        dados = localStorage.getItem(this.BACKUP_KEY);
      }

      // Se ainda não encontrou, tentar sessionStorage
      if (!dados) {
        dados = sessionStorage.getItem(this.ATIVIDADES_KEY);
      }

      return dados ? JSON.parse(dados) : {};
    } catch (error) {
      console.error('❌ [LOCAL] Erro ao obter atividades:', error);
      return {};
    }
  }

  static obterAtividade(id: string, codigoUnico: string): AtividadeCompartilhavel | null {
    try {
      const atividades = this.obterAtividades();
      const atividade = atividades[id];

      if (atividade && atividade.codigoUnico === codigoUnico && atividade.ativa) {
        // Incrementar visualizações
        atividade.visualizacoes += 1;
        this.salvarAtividade(atividade);

        console.log('✅ [LOCAL] Atividade encontrada:', atividade.titulo);
        return atividade;
      }

      console.log('❌ [LOCAL] Atividade não encontrada ou inativa');
      return null;
    } catch (error) {
      console.error('❌ [LOCAL] Erro ao buscar atividade:', error);
      return null;
    }
  }

  static salvarUTMData(utmData: UTMData): void {
    try {
      const utmAtual = this.obterUTMData();
      const novoUTM = { ...utmAtual, ...utmData, timestamp: new Date().toISOString() };

      localStorage.setItem(this.UTM_KEY, JSON.stringify(novoUTM));
      sessionStorage.setItem(this.UTM_KEY, JSON.stringify(novoUTM));

      console.log('✅ [UTM] Dados UTM salvos:', novoUTM);
    } catch (error) {
      console.error('❌ [UTM] Erro ao salvar dados UTM:', error);
    }
  }

  static obterUTMData(): UTMData {
    try {
      let dados = localStorage.getItem(this.UTM_KEY);
      if (!dados) {
        dados = sessionStorage.getItem(this.UTM_KEY);
      }

      return dados ? JSON.parse(dados) : {};
    } catch (error) {
      console.error('❌ [UTM] Erro ao obter dados UTM:', error);
      return {};
    }
  }

  static limparDadosExpirados(): void {
    try {
      const atividades = this.obterAtividades();
      const agora = new Date();
      let removeuAlguma = false;

      for (const [id, atividade] of Object.entries(atividades)) {
        if (atividade.expiracaoEm && new Date(atividade.expiracaoEm) < agora) {
          delete atividades[id];
          removeuAlguma = true;
          console.log('🗑️ [LOCAL] Atividade expirada removida:', atividade.titulo);
        }
      }

      if (removeuAlguma) {
        const dadosSerializados = JSON.stringify(atividades);
        localStorage.setItem(this.ATIVIDADES_KEY, dadosSerializados);
        localStorage.setItem(this.BACKUP_KEY, dadosSerializados);
        sessionStorage.setItem(this.ATIVIDADES_KEY, dadosSerializados);
      }
    } catch (error) {
      console.error('❌ [LOCAL] Erro ao limpar dados expirados:', error);
    }
  }
}

// Função para extrair dados UTM da URL
export const extrairUTMDaURL = (): UTMData => {
  const urlParams = new URLSearchParams(window.location.search);

  return {
    source: urlParams.get('utm_source') || undefined,
    medium: urlParams.get('utm_medium') || undefined,
    campaign: urlParams.get('utm_campaign') || undefined,
    content: urlParams.get('utm_content') || undefined,
    term: urlParams.get('utm_term') || undefined,
    sessionId: urlParams.get('session_id') || undefined,
    referrer: document.referrer || undefined,
    timestamp: new Date().toISOString()
  };
};

// Função para gerar link de compartilhamento
export const gerarLinkCompartilhamento = async (
  activityId: string,
  activityTitle: string,
  activityType: string,
  activityData: any
): Promise<string> => {
  try {
    console.log('🔗 [GERADOR] Iniciando geração de link para:', activityTitle);

    // Gerar código único
    const codigoUnico = uuidv4().replace(/-/g, '').substring(0, 16);

    // Obter dados UTM atuais
    const utmData = LocalStorageManager.obterUTMData();

    // Criar objeto da atividade
    const atividade: AtividadeCompartilhavel = {
      id: activityId,
      titulo: activityTitle,
      tipo: activityType,
      dados: activityData,
      codigoUnico,
      linkPublico: `${window.location.origin}/atividade/${activityId}/${codigoUnico}`,
      criadoEm: new Date().toISOString(),
      expiracaoEm: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
      visualizacoes: 0,
      ativa: true,
      utmSource: utmData.source,
      utmMedium: utmData.medium,
      utmCampaign: utmData.campaign,
      sessaoOrigem: utmData.sessionId || uuidv4()
    };

    // Salvar no localStorage
    const sucesso = LocalStorageManager.salvarAtividade(atividade);

    if (!sucesso) {
      throw new Error('Falha ao salvar atividade no localStorage');
    }

    // Limpar dados expirados
    LocalStorageManager.limparDadosExpirados();

    console.log('✅ [GERADOR] Link gerado com sucesso:', atividade.linkPublico);
    return atividade.linkPublico;

  } catch (error) {
    console.error('❌ [GERADOR] Erro ao gerar link:', error);
    throw error;
  }
};

// Função para buscar atividade compartilhada (usada na página pública)
export const buscarAtividadeCompartilhada = async (
  activityId: string,
  uniqueCode: string
): Promise<AtividadeCompartilhavel | null> => {
  try {
    console.log('🔍 [PÚBLICO] Buscando atividade:', { activityId, uniqueCode });

    // Extrair e salvar dados UTM da URL atual
    const utmData = extrairUTMDaURL();
    if (Object.keys(utmData).some(key => utmData[key as keyof UTMData])) {
      LocalStorageManager.salvarUTMData(utmData);
      console.log('📊 [UTM] Dados UTM capturados da URL:', utmData);
    }

    // Buscar atividade no localStorage
    const atividade = LocalStorageManager.obterAtividade(activityId, uniqueCode);

    if (!atividade) {
      console.log('❌ [PÚBLICO] Atividade não encontrada no localStorage');
      return null;
    }

    console.log('✅ [PÚBLICO] Atividade encontrada:', atividade.titulo);
    return atividade;

  } catch (error) {
    console.error('❌ [PÚBLICO] Erro ao buscar atividade:', error);
    return null;
  }
};

// Função para verificar se uma atividade existe
export const verificarAtividadeExiste = (activityId: string, uniqueCode: string): boolean => {
  try {
    const atividade = LocalStorageManager.obterAtividade(activityId, uniqueCode);
    return atividade !== null;
  } catch (error) {
    console.error('❌ [VERIFICAR] Erro ao verificar atividade:', error);
    return false;
  }
};

// Função para obter estatísticas de uma atividade
export const obterEstatisticasAtividade = (activityId: string): { visualizacoes: number; compartilhada: boolean } => {
  try {
    const atividades = LocalStorageManager.obterAtividades();
    const atividade = atividades[activityId];

    return {
      visualizacoes: atividade?.visualizacoes || 0,
      compartilhada: !!atividade
    };
  } catch (error) {
    console.error('❌ [STATS] Erro ao obter estatísticas:', error);
    return { visualizacoes: 0, compartilhada: false };
  }
};

// Função para capturar dados de conversão (quando usuário faz login via link)
export const capturarConversaoLogin = (userId: string): void => {
  try {
    const utmData = LocalStorageManager.obterUTMData();

    if (Object.keys(utmData).length > 0) {
      const dadosConversao = {
        ...utmData,
        userId,
        converteuEm: new Date().toISOString(),
        tipoConversao: 'login_via_compartilhamento'
      };

      localStorage.setItem('pontoschool_conversao_login', JSON.stringify(dadosConversao));

      console.log('📈 [CONVERSÃO] Login via compartilhamento capturado:', dadosConversao);

      // Limpar dados UTM após conversão
      localStorage.removeItem(LocalStorageManager['UTM_KEY']);
      sessionStorage.removeItem(LocalStorageManager['UTM_KEY']);
    }
  } catch (error) {
    console.error('❌ [CONVERSÃO] Erro ao capturar conversão:', error);
  }
};

// Inicializar sistema ao carregar o módulo
(() => {
  try {
    // Extrair UTM da URL se houver
    const utmData = extrairUTMDaURL();
    if (Object.keys(utmData).some(key => utmData[key as keyof UTMData])) {
      LocalStorageManager.salvarUTMData(utmData);
    }

    // Limpar dados expirados
    LocalStorageManager.limparDadosExpirados();

    console.log('🚀 [INIT] Sistema de compartilhamento inicializado');
  } catch (error) {
    console.error('❌ [INIT] Erro na inicialização:', error);
  }
})();