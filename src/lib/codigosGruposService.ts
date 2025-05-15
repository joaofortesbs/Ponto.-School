
import { supabase } from './supabase';

/**
 * Serviço para gerenciar códigos de grupos de estudo
 * Centraliza todas as operações relacionadas aos códigos de grupos na plataforma
 */

// Caracteres permitidos para geração de códigos (excluindo caracteres ambíguos)
const CARACTERES_PERMITIDOS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Gera um código único para um grupo de estudo
 * @returns Código alfanumérico único de 7 caracteres
 */
export const gerarCodigoUnico = async (): Promise<string> => {
  // Tenta no máximo 10 vezes para evitar loops infinitos
  for (let tentativa = 0; tentativa < 10; tentativa++) {
    // Gerar código aleatório de 7 caracteres
    let codigo = '';
    for (let i = 0; i < 7; i++) {
      codigo += CARACTERES_PERMITIDOS.charAt(
        Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
      );
    }
    
    // Verificar se o código já existe no banco de dados
    const { data, error } = await supabase
      .from('codigos_grupos_estudo')
      .select('codigo')
      .eq('codigo', codigo)
      .single();
    
    if (error && error.code === 'PGRST116') { // Código não encontrado
      return codigo; // Código é único, podemos usá-lo
    }
    
    // Se chegou aqui, o código já existe ou houve um erro, tentaremos novamente
    console.log(`Código ${codigo} já existe ou erro ao verificar. Tentando novamente...`);
  }
  
  // Fallback: gera um código com timestamp para garantir unicidade
  const timestamp = Date.now().toString(36).substring(0, 3).toUpperCase();
  const randomPart = Array(4).fill(0).map(() => 
    CARACTERES_PERMITIDOS.charAt(Math.floor(Math.random() * CARACTERES_PERMITIDOS.length))
  ).join('');
  
  return randomPart + timestamp;
};

/**
 * Salva um código no banco de dados central
 * @param codigo Código do grupo
 * @param grupoData Dados do grupo a serem associados com o código
 * @returns Resultado da operação
 */
export const salvarCodigoNoBanco = async (codigo: string, grupoData: any) => {
  try {
    const { data, error } = await supabase
      .from('codigos_grupos_estudo')
      .upsert({
        codigo: codigo,
        grupo_id: grupoData.id,
        nome: grupoData.nome,
        descricao: grupoData.descricao,
        user_id: grupoData.user_id,
        privado: grupoData.privado || false,
        membros: grupoData.membros || 1,
        visibilidade: grupoData.visibilidade,
        disciplina: grupoData.disciplina,
        cor: grupoData.cor || '#FF6B00',
        membros_ids: grupoData.membros_ids || []
      }, { onConflict: 'codigo' });
    
    if (error) {
      console.error('Erro ao salvar código no banco central:', error);
      return { success: false, error };
    }
    
    console.log(`Código ${codigo} salvo com sucesso no banco central`);
    return { success: true, data };
  } catch (err) {
    console.error('Erro ao processar salvamento de código:', err);
    return { success: false, error: err };
  }
};

/**
 * Busca informações de um grupo pelo código
 * @param codigo Código do grupo a ser buscado
 * @returns Dados do grupo associado ao código
 */
export const buscarGrupoPorCodigo = async (codigo: string) => {
  if (!codigo) return { success: false, error: 'Código não fornecido' };
  
  try {
    const { data, error } = await supabase
      .from('codigos_grupos_estudo')
      .select('*')
      .eq('codigo', codigo.toUpperCase())
      .single();
    
    if (error) {
      console.error('Erro ao buscar grupo por código:', error);
      return { success: false, error };
    }
    
    if (!data) {
      return { success: false, error: 'Código não encontrado' };
    }
    
    // Buscar dados completos do grupo no grupos_estudo para garantir dados atualizados
    const { data: grupoCompleto, error: grupoError } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('id', data.grupo_id)
      .single();
      
    if (!grupoError && grupoCompleto) {
      return { success: true, data: grupoCompleto };
    }
    
    // Se não conseguir obter dados completos, retorna os dados do código
    return { success: true, data };
  } catch (err) {
    console.error('Erro ao processar busca por código:', err);
    return { success: false, error: err };
  }
};

/**
 * Atualiza informações de um grupo no banco de códigos
 * @param codigo Código do grupo
 * @param grupoData Novos dados do grupo
 */
export const atualizarDadosGrupoPorCodigo = async (codigo: string, grupoData: any) => {
  if (!codigo) return { success: false, error: 'Código não fornecido' };
  
  try {
    const { data, error } = await supabase
      .from('codigos_grupos_estudo')
      .update({
        nome: grupoData.nome,
        descricao: grupoData.descricao,
        privado: grupoData.privado,
        membros: grupoData.membros,
        visibilidade: grupoData.visibilidade,
        disciplina: grupoData.disciplina,
        cor: grupoData.cor,
        membros_ids: grupoData.membros_ids || [],
        ultima_atualizacao: new Date().toISOString()
      })
      .eq('codigo', codigo.toUpperCase());
    
    if (error) {
      console.error('Erro ao atualizar grupo por código:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Erro ao processar atualização por código:', err);
    return { success: false, error: err };
  }
};

/**
 * Lista todos os códigos disponíveis (limitado a 50 por padrão)
 * @param limite Quantidade máxima de resultados
 * @returns Lista de códigos e dados básicos dos grupos
 */
export const listarTodosCodigosGrupos = async (limite = 50) => {
  try {
    const { data, error } = await supabase
      .from('codigos_grupos_estudo')
      .select('codigo, nome, descricao, membros, disciplina, cor, privado, visibilidade')
      .order('data_criacao', { ascending: false })
      .limit(limite);
    
    if (error) {
      console.error('Erro ao listar códigos de grupos:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Erro ao processar listagem de códigos:', err);
    return { success: false, error: err };
  }
};

/**
 * Pesquisa códigos de grupos de estudos
 * @param termo Termo de pesquisa (nome do grupo ou disciplina)
 * @returns Lista de códigos filtrados
 */
export const pesquisarCodigosGrupos = async (termo: string) => {
  if (!termo) return listarTodosCodigosGrupos(10);
  
  try {
    // Consulta mais completa para obter todos os dados relevantes
    const { data, error } = await supabase
      .from('codigos_grupos_estudo')
      .select('*')
      .or(`nome.ilike.%${termo}%,descricao.ilike.%${termo}%,disciplina.ilike.%${termo}%`)
      .order('data_criacao', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Erro ao pesquisar códigos de grupos:', error);
      return { success: false, error };
    }
    
    // Verificar se temos resultados
    if (!data || data.length === 0) {
      console.log(`Nenhum grupo encontrado para o termo '${termo}'`);
      return { success: true, data: [] };
    }
    
    console.log(`Encontrados ${data.length} grupos relacionados ao termo '${termo}'`);
    
    // Para cada código encontrado, tentar buscar dados mais completos
    const resultadosCompletos = await Promise.all(
      data.map(async (grupo) => {
        try {
          // Verificar se há informações mais completas na tabela de grupos
          const { data: grupoCompleto, error: grupoError } = await supabase
            .from('grupos_estudo')
            .select('*')
            .eq('id', grupo.grupo_id)
            .single();
            
          if (!grupoError && grupoCompleto) {
            // Combinar informações, priorizando dados completos do grupo
            return {
              ...grupo,
              ...grupoCompleto,
              codigo: grupo.codigo // Garantir que o código seja mantido
            };
          }
          
          // Se não encontrar informações complementares, retornar o que já temos
          return grupo;
        } catch (e) {
          console.error(`Erro ao buscar dados completos para grupo ${grupo.grupo_id}:`, e);
          return grupo;
        }
      })
    );
    
    return { success: true, data: resultadosCompletos };
  } catch (err) {
    console.error('Erro ao processar pesquisa de códigos:', err);
    return { success: false, error: err };
  }
};
