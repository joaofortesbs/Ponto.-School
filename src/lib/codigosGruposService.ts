/**
 * Serviço para gerenciar códigos de grupos de estudo
 * Centraliza todas as operações relacionadas aos códigos de grupos na plataforma
 */
import { supabase } from './supabase';

// Caracteres permitidos para geração de códigos (excluindo caracteres ambíguos)
const CARACTERES_PERMITIDOS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Gera um código único para um grupo de estudo
 * @returns Código alfanumérico único no formato XXXX-YYYY
 */
export const gerarCodigoUnico = async (): Promise<string> => {
  // Tentativas máximas para evitar loops infinitos
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    // Gerar primeiro segmento (4 caracteres)
    let codigo = '';
    for (let i = 0; i < 4; i++) {
      codigo += CARACTERES_PERMITIDOS.charAt(
        Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
      );
    }

    codigo += '-';

    // Gerar segundo segmento (4 caracteres)
    for (let i = 0; i < 4; i++) {
      codigo += CARACTERES_PERMITIDOS.charAt(
        Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
      );
    }

    // Verificar se o código já existe
    const { data, error } = await supabase
      .from('grupos_estudo')
      .select('id')
      .eq('codigo', codigo)
      .maybeSingle();

    if (error || !data) {
      // Código não encontrado, podemos usá-lo
      return codigo;
    }

    // Se chegou aqui, código já existe, tentaremos novamente
  }

  // Se não conseguir um código único após as tentativas, adicionar timestamp
  const timestamp = Date.now().toString().substring(9, 13);
  let codigo = '';

  // Gerar 3 caracteres aleatórios
  for (let i = 0; i < 3; i++) {
    codigo += CARACTERES_PERMITIDOS.charAt(
      Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
    );
  }

  // Adicionar timestamp
  codigo += timestamp;

  // Adicionar separador
  codigo += '-';

  // Adicionar 4 caracteres aleatórios
  for (let i = 0; i < 4; i++) {
    codigo += CARACTERES_PERMITIDOS.charAt(
      Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
    );
  }

  return codigo;
};

/**
 * Salva um código de grupo no banco de dados
 * @param grupoId ID do grupo
 * @param codigo Código a ser associado
 * @returns Sucesso ou erro da operação
 */
export const salvarCodigoNoBanco = async (grupoId: string, codigo: string) => {
  try {
    // Normalizar código
    const codigoNormalizado = codigo.toUpperCase();

    // Salvar/atualizar código na tabela principal de grupos
    const { error } = await supabase
      .from('grupos_estudo')
      .update({ codigo: codigoNormalizado })
      .eq('id', grupoId);

    if (error) {
      console.error('Erro ao salvar código no banco de dados:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('Erro ao processar salvamento de código:', err);
    return { success: false, error: err };
  }
};

/**
 * Busca informações de um grupo pelo código
 * @param codigo Código do grupo
 * @returns Dados do grupo associado ao código
 */
export const buscarGrupoPorCodigo = async (codigo: string) => {
  if (!codigo) return { success: false, error: 'Código não fornecido' };

  try {
    const codigoNormalizado = codigo.toUpperCase();

    // Buscar na tabela de grupos
    const { data, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar grupo por código:', error);
      return { success: false, error };
    }

    if (!data) {
      return { success: false, error: 'Código não encontrado' };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Erro ao buscar grupo por código:', err);
    return { success: false, error: err };
  }
};

/**
 * Verifica se um código de grupo existe
 * @param codigo Código a verificar
 * @returns true se existe, false caso contrário
 */
export const verificarCodigoExiste = async (codigo: string): Promise<boolean> => {
  if (!codigo) return false;

  try {
    const codigoNormalizado = codigo.toUpperCase();

    // Verificar na tabela de grupos
    const { data, error } = await supabase
      .from('grupos_estudo')
      .select('id')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();

    return !error && !!data;
  } catch (err) {
    console.error('Erro ao verificar existência de código:', err);
    return false;
  }
};

/**
 * Pesquisa códigos de grupos de estudos
 * @param termo Termo de pesquisa (nome, disciplina, etc)
 * @returns Lista de grupos encontrados
 */
export const pesquisarGruposPorTermo = async (termo: string) => {
  if (!termo) return { success: true, data: [] };

  try {
    // Consulta na tabela de grupos
    const { data, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .or(`nome.ilike.%${termo}%,descricao.ilike.%${termo}%,disciplina.ilike.%${termo}%`)
      .order('data_criacao', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Erro ao pesquisar grupos:', error);
      return { success: false, error };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Erro ao pesquisar grupos:', err);
    return { success: false, error: err };
  }
};