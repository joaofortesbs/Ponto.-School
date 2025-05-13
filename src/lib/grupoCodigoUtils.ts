
/**
 * Utilitários para gerenciar códigos de grupos de estudo
 */
import { supabase } from './supabase';

/**
 * Gera um código aleatório para um grupo de estudo
 * @returns Uma string aleatória de 8 caracteres
 */
export const gerarCodigoGrupo = (): string => {
  // Caracteres permitidos (sem caracteres ambíguos como 0/O, 1/I, etc.)
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = '';
  
  // Gera um código de 8 caracteres
  for (let i = 0; i < 8; i++) {
    const indice = Math.floor(Math.random() * caracteres.length);
    codigo += caracteres[indice];
  }
  
  return codigo;
};

/**
 * Verifica se um código de grupo já existe no banco de dados
 * @param codigo O código a ser verificado
 * @returns true se o código já existe, false caso contrário
 */
export const verificarSeCodigoExiste = async (codigo: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('grupos_estudo')
      .select('id')
      .eq('codigo', codigo)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error("Erro ao verificar código:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    return false;
  }
};

/**
 * Gera um código único para grupo que não existe no banco de dados
 * @returns Um código único garantido
 */
export const gerarCodigoUnico = async (): Promise<string> => {
  let codigo = gerarCodigoGrupo();
  let codigoExiste = await verificarSeCodigoExiste(codigo);
  
  // Tenta até 5 vezes para evitar loop infinito
  let tentativas = 0;
  
  while (codigoExiste && tentativas < 5) {
    codigo = gerarCodigoGrupo();
    codigoExiste = await verificarSeCodigoExiste(codigo);
    tentativas++;
  }
  
  return codigo;
};

/**
 * Busca um grupo pelo código
 * @param codigo Código do grupo
 * @returns Dados do grupo ou null se não encontrado
 */
export const buscarGrupoPorCodigo = async (codigo: string) => {
  try {
    const { data, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('codigo', codigo)
      .single();
    
    if (error) {
      console.error("Erro ao buscar grupo por código:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao buscar grupo por código:", error);
    return null;
  }
};

/**
 * Adiciona um usuário a um grupo pelo código
 * @param codigo Código do grupo
 * @param userId ID do usuário
 * @returns Objeto com sucesso e mensagem
 */
export const entrarGrupoPorCodigo = async (codigo: string) => {
  try {
    // Verifica se o grupo existe
    const grupo = await buscarGrupoPorCodigo(codigo);
    
    if (!grupo) {
      return { 
        sucesso: false, 
        mensagem: "Código de grupo inválido ou não encontrado." 
      };
    }
    
    // Se o grupo for privado e não tiver código, retorna erro
    if (grupo.privado && !codigo) {
      return {
        sucesso: false,
        mensagem: "Este é um grupo privado, você precisa do código de convite."
      };
    }
    
    // Obtém o usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        sucesso: false,
        mensagem: "Você precisa estar logado para entrar em um grupo."
      };
    }
    
    // Incrementa o número de membros do grupo
    const { error: updateError } = await supabase
      .from('grupos_estudo')
      .update({ 
        membros: (grupo.membros || 0) + 1 
      })
      .eq('id', grupo.id);
    
    if (updateError) {
      console.error("Erro ao atualizar número de membros:", updateError);
      return {
        sucesso: false,
        mensagem: "Erro ao entrar no grupo. Tente novamente."
      };
    }
    
    return {
      sucesso: true,
      mensagem: "Você entrou no grupo com sucesso!",
      grupo
    };
  } catch (error) {
    console.error("Erro ao entrar no grupo:", error);
    return {
      sucesso: false,
      mensagem: "Ocorreu um erro ao tentar entrar no grupo."
    };
  }
};

/**
 * Atualiza o código de um grupo existente
 * @param grupoId ID do grupo
 * @returns Novo código ou null em caso de erro
 */
export const atualizarCodigoGrupo = async (grupoId: string): Promise<string | null> => {
  try {
    const novoCodigo = await gerarCodigoUnico();
    
    const { error } = await supabase
      .from('grupos_estudo')
      .update({ codigo: novoCodigo })
      .eq('id', grupoId);
    
    if (error) {
      console.error("Erro ao atualizar código do grupo:", error);
      return null;
    }
    
    return novoCodigo;
  } catch (error) {
    console.error("Erro ao atualizar código do grupo:", error);
    return null;
  }
};
