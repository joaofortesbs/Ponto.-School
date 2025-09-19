
import { supabase } from '@/integrations/supabase/client';

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
}

// Interface para criar nova atividade compartilhável
export interface NovaAtividadeCompartilhavel {
  id: string;
  titulo: string;
  tipo: string;
  dados: any;
  criadoPor: string;
}

class GeradorLinkAtividadesSchoolPower {
  private readonly baseUrl: string;

  constructor() {
    // URL base da plataforma
    this.baseUrl = window.location.origin;
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
   * Verifica se um código único já existe no banco de dados
   * @param codigo - Código a ser verificado
   * @returns True se o código já existe, false caso contrário
   */
  private async codigoJaExiste(codigo: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('atividades_compartilhaveis')
        .select('codigo_unico')
        .eq('codigo_unico', codigo)
        .limit(1);

      if (error) {
        console.error('Erro ao verificar código único:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar código único:', error);
      return false;
    }
  }

  /**
   * Gera um código único garantindo que não existe duplicata
   * @param tamanho - Tamanho do código
   * @returns Código único válido
   */
  private async gerarCodigoUnicoValidado(tamanho: number = 8): Promise<string> {
    let tentativas = 0;
    const maxTentativas = 10;

    while (tentativas < maxTentativas) {
      const codigo = this.gerarCodigoUnico(tamanho);
      const existe = await this.codigoJaExiste(codigo);
      
      if (!existe) {
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
   * Salva uma nova atividade compartilhável no banco de dados
   * @param atividade - Dados da atividade
   * @returns Atividade compartilhável criada
   */
  async criarAtividadeCompartilhavel(atividade: NovaAtividadeCompartilhavel): Promise<AtividadeCompartilhavel | null> {
    try {
      console.log('🔗 Gerando link único para atividade:', atividade.titulo);
      
      // Primeiro, verifica se já existe uma atividade compartilhável para este ID
      const { data: existente, error: erroExistente } = await supabase
        .from('atividades_compartilhaveis')
        .select('*')
        .eq('atividade_id', atividade.id)
        .eq('ativo', true)
        .single();

      // Se já existe, retorna a existente
      if (!erroExistente && existente) {
        console.log('✅ Atividade já existe, retornando link existente:', existente.link_publico);
        return {
          id: existente.atividade_id,
          titulo: existente.titulo,
          tipo: existente.tipo,
          dados: existente.dados,
          criadoPor: existente.criado_por,
          criadoEm: existente.criado_em,
          codigoUnico: existente.codigo_unico,
          linkPublico: existente.link_publico
        };
      }

      // Gera código único validado
      const codigoUnico = await this.gerarCodigoUnicoValidado();
      console.log('🎯 Código único gerado:', codigoUnico);
      
      // Cria o link público
      const linkPublico = this.criarLinkPublico(atividade.id, codigoUnico);
      console.log('🔗 Link público gerado:', linkPublico);

      // Dados para salvar no banco
      const dadosParaSalvar = {
        atividade_id: atividade.id,
        titulo: atividade.titulo,
        tipo: atividade.tipo,
        dados: atividade.dados,
        criado_por: atividade.criadoPor,
        codigo_unico: codigoUnico,
        link_publico: linkPublico,
        criado_em: new Date().toISOString(),
        ativo: true
      };

      console.log('💾 Salvando dados no banco:', dadosParaSalvar);

      // Salva no banco de dados
      const { data, error } = await supabase
        .from('atividades_compartilhaveis')
        .insert([dadosParaSalvar])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao salvar atividade compartilhável:', error);
        return null;
      }

      console.log('✅ Dados salvos no banco:', data);
      console.log('✅ Atividade compartilhável criada com sucesso:', data.link_publico);

      // Retorna no formato esperado
      const resultado = {
        id: data.atividade_id,
        titulo: data.titulo,
        tipo: data.tipo,
        dados: data.dados,
        criadoPor: data.criado_por,
        criadoEm: data.criado_em,
        codigoUnico: data.codigo_unico,
        linkPublico: data.link_publico
      };

      console.log('🎯 Retornando resultado:', resultado);
      return resultado;

    } catch (error) {
      console.error('❌ Erro ao criar atividade compartilhável:', error);
      return null;
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

      const { data, error } = await supabase
        .from('atividades_compartilhaveis')
        .select('*')
        .eq('atividade_id', atividadeId)
        .eq('codigo_unico', codigoUnico)
        .eq('ativo', true)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar atividade:', error);
        return null;
      }

      if (!data) {
        console.log('⚠️ Atividade não encontrada');
        return null;
      }

      console.log('✅ Atividade encontrada:', data.titulo);

      return {
        id: data.atividade_id,
        titulo: data.titulo,
        tipo: data.tipo,
        dados: data.dados,
        criadoPor: data.criado_por,
        criadoEm: data.criado_em,
        codigoUnico: data.codigo_unico,
        linkPublico: data.link_publico
      };

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
      const { data: atividadeAtual, error: erroAtual } = await supabase
        .from('atividades_compartilhaveis')
        .select('*')
        .eq('atividade_id', atividadeId)
        .eq('ativo', true)
        .single();

      if (erroAtual || !atividadeAtual) {
        console.error('❌ Atividade não encontrada para regenerar link');
        return null;
      }

      // Gera novo código único
      const novoCodigoUnico = await this.gerarCodigoUnicoValidado();
      const novoLinkPublico = this.criarLinkPublico(atividadeId, novoCodigoUnico);

      // Atualiza no banco
      const { data, error } = await supabase
        .from('atividades_compartilhaveis')
        .update({
          codigo_unico: novoCodigoUnico,
          link_publico: novoLinkPublico,
          atualizado_em: new Date().toISOString()
        })
        .eq('atividade_id', atividadeId)
        .eq('ativo', true)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao regenerar link:', error);
        return null;
      }

      console.log('✅ Link regenerado com sucesso:', novoLinkPublico);

      return {
        id: data.atividade_id,
        titulo: data.titulo,
        tipo: data.tipo,
        dados: data.dados,
        criadoPor: data.criado_por,
        criadoEm: data.criado_em,
        codigoUnico: data.codigo_unico,
        linkPublico: data.link_publico
      };

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

      const { error } = await supabase
        .from('atividades_compartilhaveis')
        .update({
          ativo: false,
          desativado_em: new Date().toISOString()
        })
        .eq('atividade_id', atividadeId);

      if (error) {
        console.error('❌ Erro ao desativar atividade:', error);
        return false;
      }

      console.log('✅ Atividade desativada com sucesso');
      return true;

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

      const { data, error } = await supabase
        .from('atividades_compartilhaveis')
        .select('*')
        .eq('criado_por', userId)
        .eq('ativo', true)
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('❌ Erro ao listar atividades:', error);
        return [];
      }

      return data.map(item => ({
        id: item.atividade_id,
        titulo: item.titulo,
        tipo: item.tipo,
        dados: item.dados,
        criadoPor: item.criado_por,
        criadoEm: item.criado_em,
        codigoUnico: item.codigo_unico,
        linkPublico: item.link_publico
      }));

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
