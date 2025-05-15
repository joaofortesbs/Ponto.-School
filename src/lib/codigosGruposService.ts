
/**
 * Serviço para gerenciar códigos de grupos de estudo
 * Versão simplificada e melhorada
 */
import { supabase } from './supabase';

// Caracteres permitidos para geração de códigos (excluindo caracteres ambíguos como 0/O, 1/I)
const CARACTERES_PERMITIDOS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Gera um código único para um grupo de estudo
 * @returns Código alfanumérico único no formato XXXX-YYYY
 */
export const gerarCodigoUnico = async (): Promise<string> => {
  // Função para gerar um código aleatório
  const gerarCodigo = () => {
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

    return codigo;
  };

  // Tentativas máximas para evitar loops infinitos
  const MAX_TENTATIVAS = 5;
  
  try {
    for (let tentativa = 0; tentativa < MAX_TENTATIVAS; tentativa++) {
      const codigo = gerarCodigo();
      
      // Verificar se o código já existe (primeiro na tabela de códigos)
      const { data: codigoExistente, error: codigoError } = await supabase
        .from('codigos_grupos_estudo')
        .select('codigo')
        .eq('codigo', codigo)
        .maybeSingle();
        
      if (codigoError) {
        console.error('Erro ao verificar código na tabela de códigos:', codigoError);
        // Se houver erro, verificar na tabela de grupos
        const { data: grupoExistente, error: grupoError } = await supabase
          .from('grupos_estudo')
          .select('id')
          .eq('codigo', codigo)
          .maybeSingle();
          
        if (grupoError || !grupoExistente) {
          // Se houver erro na consulta ou o código não existir, podemos usá-lo
          return codigo;
        }
      } else if (!codigoExistente) {
        // Código não encontrado na tabela de códigos, podemos usá-lo
        return codigo;
      }
      
      // Se chegou aqui, código já existe. Tentar novamente.
      console.log(`Código ${codigo} já existe. Tentando gerar outro...`);
    }

    // Se chegamos aqui, não conseguimos um código único após várias tentativas
    // Adicionar um timestamp ao código para garantir unicidade
    const timestamp = Date.now().toString().slice(-4);
    let codigo = '';
    
    // Gerar 3 caracteres aleatórios
    for (let i = 0; i < 3; i++) {
      codigo += CARACTERES_PERMITIDOS.charAt(
        Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
      );
    }
    
    // Adicionar timestamp e separador
    codigo += timestamp + '-';
    
    // Adicionar 4 caracteres aleatórios
    for (let i = 0; i < 4; i++) {
      codigo += CARACTERES_PERMITIDOS.charAt(
        Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
      );
    }
    
    return codigo;
  } catch (err) {
    console.error('Erro ao gerar código único:', err);
    // Em caso de falha, retornar um código com timestamp para garantir unicidade
    const fallback = `${CARACTERES_PERMITIDOS.charAt(Math.floor(Math.random() * CARACTERES_PERMITIDOS.length))}${Date.now().toString().slice(-6)}-${CARACTERES_PERMITIDOS.charAt(Math.floor(Math.random() * CARACTERES_PERMITIDOS.length))}${Date.now().toString().slice(-3)}`;
    return fallback;
  }
};

/**
 * Salva um código de grupo no banco de dados
 * @param grupoId ID do grupo
 * @param codigo Código a ser associado
 * @returns Sucesso ou erro da operação
 */
export const salvarCodigoNoBanco = async (grupoId: string, codigo: string) => {
  if (!grupoId || !codigo) {
    return { success: false, error: 'ID do grupo ou código não fornecido' };
  }

  try {
    // Normalizar código (maiúsculas)
    const codigoNormalizado = codigo.toUpperCase();

    // Atualizar na tabela principal de grupos
    const { error: grupoError } = await supabase
      .from('grupos_estudo')
      .update({ codigo: codigoNormalizado })
      .eq('id', grupoId);

    if (grupoError) {
      console.error('Erro ao salvar código na tabela grupos_estudo:', grupoError);
      return { success: false, error: grupoError };
    }

    // Inserir/atualizar na tabela de códigos
    // Primeiro, buscar informações do grupo para garantir consistência
    const { data: grupo, error: getGrupoError } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('id', grupoId)
      .single();

    if (getGrupoError || !grupo) {
      console.error('Erro ao buscar informações do grupo:', getGrupoError);
      return { success: true, warning: 'Código salvo na tabela principal, mas não na tabela de códigos' };
    }

    // Inserir na tabela de códigos
    const { error: codigoError } = await supabase
      .from('codigos_grupos_estudo')
      .upsert({
        codigo: codigoNormalizado,
        grupo_id: grupoId,
        nome: grupo.nome || 'Grupo sem nome',
        descricao: grupo.descricao || '',
        user_id: grupo.user_id,
        privado: grupo.privado || false,
        membros: grupo.membros || 1,
        visibilidade: grupo.visibilidade || 'todos',
        disciplina: grupo.disciplina || '',
        cor: grupo.cor || '#FF6B00',
        membros_ids: grupo.membros_ids || [],
        data_criacao: grupo.data_criacao || new Date().toISOString(),
        ultima_atualizacao: new Date().toISOString()
      }, { onConflict: 'codigo' });

    if (codigoError) {
      console.error('Erro ao salvar na tabela codigos_grupos_estudo:', codigoError);
      return { success: true, warning: 'Código salvo apenas na tabela principal' };
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
    const codigoNormalizado = codigo.toUpperCase().trim();

    // Primeiro, tentar buscar na tabela de códigos (mais otimizada)
    const { data: dadosCodigo, error: codigoError } = await supabase
      .from('codigos_grupos_estudo')
      .select('*')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();

    if (codigoError) {
      console.warn('Aviso: Erro ao buscar na tabela codigos_grupos_estudo:', codigoError);
      // Se falhar, tentar diretamente na tabela de grupos
      const { data: dadosGrupo, error: grupoError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('codigo', codigoNormalizado)
        .maybeSingle();

      if (grupoError) {
        console.error('Erro ao buscar grupo por código:', grupoError);
        return { success: false, error: grupoError };
      }

      if (!dadosGrupo) {
        return { success: false, error: 'Código não encontrado' };
      }

      return { success: true, data: dadosGrupo };
    }

    if (!dadosCodigo) {
      // Não encontrou na tabela de códigos, tentar na tabela principal
      const { data: dadosGrupo, error: grupoError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('codigo', codigoNormalizado)
        .maybeSingle();

      if (grupoError) {
        console.error('Erro ao buscar grupo por código:', grupoError);
        return { success: false, error: grupoError };
      }

      if (!dadosGrupo) {
        return { success: false, error: 'Código não encontrado' };
      }

      return { success: true, data: dadosGrupo };
    }

    // Se encontrou na tabela de códigos, mas queremos o grupo completo
    const { data: dadosGrupo, error: grupoError } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('id', dadosCodigo.grupo_id)
      .maybeSingle();

    if (grupoError || !dadosGrupo) {
      // Se falhar a busca do grupo pelo ID, retornar os dados do código
      return { success: true, data: dadosCodigo, source: 'codigo' };
    }

    return { success: true, data: dadosGrupo };
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
    const codigoNormalizado = codigo.toUpperCase().trim();

    // Verificar primeiro na tabela de códigos
    const { data: codigoData, error: codigoError } = await supabase
      .from('codigos_grupos_estudo')
      .select('codigo')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();

    if (!codigoError && codigoData) {
      return true;
    }

    // Se não encontrar ou houver erro, verificar na tabela de grupos
    const { data: grupoData, error: grupoError } = await supabase
      .from('grupos_estudo')
      .select('id')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();

    return !grupoError && !!grupoData;
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
    // Primeiro tenta interpretar o termo como um código direto
    if (termo.includes('-') || termo.length >= 4) {
      const codigoNormalizado = termo.toUpperCase().trim();
      
      // Verificar se é um código exato
      const { data: grupoPorCodigo, error: codigoError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('codigo', codigoNormalizado)
        .maybeSingle();
        
      if (!codigoError && grupoPorCodigo) {
        return { success: true, data: [grupoPorCodigo] };
      }
    }
    
    // Se não for um código exato ou não encontrar, fazer pesquisa ampla
    const { data, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .or(`nome.ilike.%${termo}%,descricao.ilike.%${termo}%,disciplina.ilike.%${termo}%,codigo.ilike.%${termo}%`)
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
