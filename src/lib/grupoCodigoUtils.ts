
/**
 * Utilitários para geração e gerenciamento de códigos de grupos de estudo
 */

import { supabase } from './supabase';
import { salvarGrupoLocal, obterGruposLocal } from './gruposEstudoStorage';

/**
 * Caracteres permitidos para geração de códigos únicos
 * Evitamos caracteres ambíguos como I, O, 0, 1
 */
const CARACTERES_PERMITIDOS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const COMPRIMENTO_CODIGO = 7;

/**
 * Gera um código único para um grupo de estudo
 * @returns Código único de 7 caracteres
 */
export const gerarCodigoGrupo = (): string => {
  let codigo = '';
  for (let i = 0; i < COMPRIMENTO_CODIGO; i++) {
    codigo += CARACTERES_PERMITIDOS.charAt(
      Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
    );
  }
  return codigo;
};

/**
 * Função auxiliar para gerar código único consistente
 * Usada por várias partes do sistema
 */
export const gerarCodigoUnico = (): string => {
  return gerarCodigoGrupo();
};

/**
 * Verifica se um código de grupo já existe
 * @param codigo - Código a ser verificado
 * @returns Boolean indicando se o código existe
 */
export const verificarCodigoExistente = async (codigo: string): Promise<boolean> => {
  if (!codigo || codigo.trim().length === 0) {
    return false;
  }
  
  // Normalizar o código (remover espaços e converter para maiúsculas)
  const codigoNormalizado = codigo.trim().toUpperCase();
  
  // Verificar primeiro no armazenamento local
  const gruposLocais = obterGruposLocal();
  const grupoLocalExistente = gruposLocais.some(
    grupo => grupo.codigo && grupo.codigo.toUpperCase() === codigoNormalizado
  );
  
  if (grupoLocalExistente) {
    return true;
  }
  
  // Verificar no Supabase
  try {
    const { data, error } = await supabase
      .from('grupos_estudo')
      .select('id')
      .eq('codigo', codigoNormalizado)
      .limit(1);
    
    if (error) {
      console.error('Erro ao verificar código no Supabase:', error);
      return false;
    }
    
    return (data && data.length > 0);
  } catch (error) {
    console.error('Erro ao acessar Supabase:', error);
    return false;
  }
};

/**
 * Busca um grupo pelo código
 * @param codigo - Código do grupo
 * @returns O grupo encontrado ou null
 */
export const buscarGrupoPorCodigo = async (codigo: string): Promise<any> => {
  if (!codigo || codigo.trim().length === 0) {
    return null;
  }
  
  // Normalizar o código
  const codigoNormalizado = codigo.trim().toUpperCase();
  
  // Verificar primeiro no armazenamento local
  const gruposLocais = obterGruposLocal();
  const grupoLocal = gruposLocais.find(
    grupo => grupo.codigo && grupo.codigo.toUpperCase() === codigoNormalizado
  );
  
  if (grupoLocal) {
    return grupoLocal;
  }
  
  // Buscar no Supabase
  try {
    const { data, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('codigo', codigoNormalizado)
      .single();
    
    if (error) {
      console.error('Erro ao buscar grupo no Supabase:', error);
      return null;
    }
    
    if (data) {
      // Salvar localmente para acesso futuro
      salvarGrupoLocal(data);
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao acessar Supabase:', error);
    return null;
  }
};

/**
 * Adiciona um usuário a um grupo pelo código
 * @param codigo - Código do grupo
 * @param senha - Senha (opcional, para grupos privados)
 * @returns Objeto com status e mensagem do resultado
 */
export const entrarEmGrupoPorCodigo = async (
  codigo: string, 
  senha?: string
): Promise<{ sucesso: boolean; mensagem: string; grupo?: any }> => {
  if (!codigo || codigo.trim().length === 0) {
    return {
      sucesso: false,
      mensagem: "Código não fornecido"
    };
  }
  
  // Normalizar o código
  const codigoNormalizado = codigo.trim().toUpperCase();
  
  // Buscar o grupo
  const grupo = await buscarGrupoPorCodigo(codigoNormalizado);
  
  if (!grupo) {
    return {
      sucesso: false,
      mensagem: "Grupo não encontrado. Verifique o código e tente novamente."
    };
  }
  
  // Verificar se o grupo é privado e requer senha
  if (grupo.privado || grupo.visibilidade === "Privado (apenas por convite)") {
    // Se o grupo é privado e não foi fornecida senha, retornar erro
    if (!senha && grupo.senha) {
      return {
        sucesso: false,
        mensagem: "Este grupo é privado e requer senha."
      };
    }
    
    // Se o grupo tem senha e ela não confere
    if (grupo.senha && senha !== grupo.senha) {
      return {
        sucesso: false,
        mensagem: "Senha incorreta."
      };
    }
  }
  
  try {
    // Obter dados do usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        sucesso: false,
        mensagem: "Você precisa estar logado para entrar em um grupo."
      };
    }
    
    // Verificar se o usuário já é membro
    const membrosIds = grupo.membros_ids || [];
    if (membrosIds.includes(user.id) || grupo.user_id === user.id) {
      return {
        sucesso: true,
        mensagem: "Você já é membro deste grupo.",
        grupo
      };
    }
    
    // Adicionar o usuário à lista de membros
    const novosMembrosIds = [...membrosIds, user.id];
    
    // Atualizar o grupo no Supabase
    const { error } = await supabase
      .from('grupos_estudo')
      .update({ 
        membros_ids: novosMembrosIds,
        membros: (grupo.membros || 1) + 1 // Incrementar contador de membros
      })
      .eq('id', grupo.id);
    
    if (error) {
      console.error('Erro ao adicionar usuário ao grupo:', error);
      return {
        sucesso: false,
        mensagem: "Ocorreu um erro ao tentar entrar no grupo. Tente novamente."
      };
    }
    
    // Atualizar o grupo localmente
    grupo.membros_ids = novosMembrosIds;
    grupo.membros = (grupo.membros || 1) + 1;
    salvarGrupoLocal(grupo);
    
    return {
      sucesso: true,
      mensagem: `Você entrou no grupo "${grupo.nome}" com sucesso!`,
      grupo
    };
  } catch (error) {
    console.error('Erro ao processar entrada no grupo:', error);
    return {
      sucesso: false,
      mensagem: "Ocorreu um erro inesperado. Tente novamente mais tarde."
    };
  }
};

/**
 * Atualiza o código de um grupo existente
 * @param grupoId - ID do grupo
 * @param codigo - Novo código a ser definido
 * @returns Boolean indicando sucesso da operação
 */
export const atualizarCodigoGrupo = async (grupoId: string, codigo: string): Promise<boolean> => {
  if (!grupoId || !codigo) return false;
  
  // VERIFICAR SE O CÓDIGO JÁ FOI DEFINIDO COMO PERMANENTE
  const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
  const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
  
  // Se o grupo já possui um código e a flag de permanente está definida, não permitir alteração
  if (codigosGrupos[grupoId] && localStorage.getItem(`grupo_codigo_gerado_${grupoId}`) === "true") {
    console.log(`Código do grupo ${grupoId} já está definido como permanente e não pode ser alterado.`);
    return false;
  }
  
  // Normalizar o código
  const codigoNormalizado = codigo.trim().toUpperCase();
  
  try {
    // Verificar se o código já está em uso
    const codigoExiste = await verificarCodigoExistente(codigoNormalizado);
    if (codigoExiste) {
      console.error('O código já está em uso por outro grupo');
      return false;
    }
    
    // Atualizar no Supabase
    const { error } = await supabase
      .from('grupos_estudo')
      .update({ codigo: codigoNormalizado })
      .eq('id', grupoId);
    
    if (error) {
      console.error('Erro ao atualizar código no Supabase:', error);
      return false;
    }
    
    // Atualizar também no armazenamento local
    const gruposLocais = obterGruposLocal();
    const grupoIndex = gruposLocais.findIndex(g => g.id === grupoId);
    
    if (grupoIndex >= 0) {
      gruposLocais[grupoIndex].codigo = codigoNormalizado;
      
      // Armazenar no storage dedicado
      codigosGrupos[grupoId] = codigoNormalizado;
      localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));
      
      // Definir este código como permanente
      localStorage.setItem(`grupo_codigo_gerado_${grupoId}`, "true");
      localStorage.setItem(`codigo_permanente_${codigoNormalizado}`, grupoId);
      
      // Atualizar o localStorage de grupos
      localStorage.setItem('epictus_grupos_estudo', JSON.stringify(gruposLocais));
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar código do grupo:', error);
    return false;
  }
};
