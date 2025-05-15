
/**
 * Serviço para gerenciar códigos de grupos de estudo
 * Versão simplificada e otimizada
 */
import { supabase } from './supabase';

// Caracteres permitidos para geração de códigos (excluindo caracteres ambíguos como 0/O, 1/I)
const CARACTERES_PERMITIDOS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Gera um código único para um grupo de estudo
 * @returns Código alfanumérico único no formato XXXX-YYYY-ZZZZ
 */
export const gerarCodigoUnico = async (): Promise<string> => {
  // Função para gerar um código aleatório
  const gerarCodigo = () => {
    let codigo = '';
    
    // Primeira parte (4 caracteres)
    for (let i = 0; i < 4; i++) {
      codigo += CARACTERES_PERMITIDOS.charAt(
        Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
      );
    }
    
    codigo += '-';
    
    // Segunda parte (4 caracteres)
    for (let i = 0; i < 4; i++) {
      codigo += CARACTERES_PERMITIDOS.charAt(
        Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
      );
    }
    
    codigo += '-';
    
    // Terceira parte (4 caracteres)
    for (let i = 0; i < 4; i++) {
      codigo += CARACTERES_PERMITIDOS.charAt(
        Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
      );
    }
    
    return codigo;
  };

  // Máximo de tentativas para encontrar um código único
  const MAX_TENTATIVAS = 5;
  
  try {
    for (let tentativa = 0; tentativa < MAX_TENTATIVAS; tentativa++) {
      const codigo = gerarCodigo();
      
      // Verificar se o código já existe
      const { data, error } = await supabase
        .from('codigos_grupos_estudo')
        .select('codigo')
        .eq('codigo', codigo)
        .maybeSingle();
        
      if (error) {
        console.log('Aviso: Erro ao verificar código. Tentando alternativa...');
        
        // Verificar na tabela principal
        const { data: grupoData, error: grupoError } = await supabase
          .from('grupos_estudo')
          .select('id')
          .eq('codigo', codigo)
          .maybeSingle();
          
        if (grupoError || !grupoData) {
          // Se não encontrou ou houve erro, o código provavelmente está disponível
          return codigo;
        }
      } else if (!data) {
        // Código não existe na tabela de códigos
        return codigo;
      }
      
      // Se chegou aqui, o código já existe
      console.log(`Código ${codigo} já existe. Gerando outro...`);
    }

    // Se todas as tentativas falharem, adicionar timestamp para garantir unicidade
    const timestamp = Date.now().toString().slice(-4);
    const codigo = `${CARACTERES_PERMITIDOS.charAt(
      Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
    )}${CARACTERES_PERMITIDOS.charAt(
      Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
    )}${CARACTERES_PERMITIDOS.charAt(
      Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
    )}${timestamp}-${CARACTERES_PERMITIDOS.charAt(
      Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
    )}${CARACTERES_PERMITIDOS.charAt(
      Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
    )}${CARACTERES_PERMITIDOS.charAt(
      Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
    )}${CARACTERES_PERMITIDOS.charAt(
      Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
    )}`;
    
    return codigo;
  } catch (err) {
    console.error('Erro ao gerar código único:', err);
    
    // Código de contingência em caso de falha
    const fallback = `${CARACTERES_PERMITIDOS.charAt(Math.floor(Math.random() * CARACTERES_PERMITIDOS.length))}${Date.now().toString().slice(-5)}-${CARACTERES_PERMITIDOS.charAt(Math.floor(Math.random() * CARACTERES_PERMITIDOS.length))}${Date.now().toString().slice(-4)}`;
    return fallback;
  }
};

/**
 * Salva um código de grupo no banco de dados
 * @param grupoId ID do grupo
 * @param codigo Código a ser associado
 * @returns Resultado da operação
 */
export const salvarCodigoNoBanco = async (grupoId: string, codigo: string) => {
  if (!grupoId || !codigo) {
    return { success: false, error: 'ID do grupo ou código não fornecido' };
  }

  try {
    // Normalizar código
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

    // Buscar informações do grupo para garantir consistência
    const { data: grupo, error: getGrupoError } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('id', grupoId)
      .single();

    if (getGrupoError || !grupo) {
      console.error('Erro ao buscar informações do grupo:', getGrupoError);
      return { success: true, warning: 'Código salvo na tabela principal, mas não na tabela de códigos' };
    }

    // Inserir/atualizar na tabela de códigos
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
      console.warn('Aviso: Erro ao salvar na tabela codigos_grupos_estudo:', codigoError);
      return { success: true, warning: 'Código salvo na tabela principal, mas não na tabela de códigos' };
    }

    return { success: true };
  } catch (err) {
    console.error('Erro ao salvar código:', err);
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

    // Buscar primeiro diretamente na tabela de grupos (mais direto)
    const { data: dadosGrupo, error: grupoError } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();
      
    if (!grupoError && dadosGrupo) {
      return { success: true, data: dadosGrupo };
    }
    
    if (grupoError) {
      console.warn('Aviso: Erro ao buscar na tabela de grupos. Tentando via códigos...', grupoError);
    }
    
    // Se não encontrou ou deu erro, tentar via tabela de códigos
    const { data: dadosCodigo, error: codigoError } = await supabase
      .from('codigos_grupos_estudo')
      .select('*')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();
      
    if (codigoError) {
      console.error('Erro ao buscar código:', codigoError);
      return { success: false, error: 'Erro ao buscar código' };
    }
    
    if (!dadosCodigo) {
      return { success: false, error: 'Código não encontrado' };
    }
    
    // Se encontrou na tabela de códigos, buscar o grupo principal
    const { data: grupoCompleto, error: grupoCompletoError } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('id', dadosCodigo.grupo_id)
      .maybeSingle();
      
    if (grupoCompletoError || !grupoCompleto) {
      // Se não conseguir buscar o grupo completo, retornar os dados da tabela de códigos
      return { success: true, data: dadosCodigo, source: 'codigo' };
    }
    
    return { success: true, data: grupoCompleto };
  } catch (err) {
    console.error('Erro ao buscar grupo por código:', err);
    return { success: false, error: 'Erro ao processar busca' };
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

    // Verificar na tabela de grupos (mais direto)
    const { data: grupoData, error: grupoError } = await supabase
      .from('grupos_estudo')
      .select('id')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();
      
    if (!grupoError && grupoData) {
      return true;
    }
    
    // Se não encontrou ou deu erro, verificar na tabela de códigos
    const { data: codigoData, error: codigoError } = await supabase
      .from('codigos_grupos_estudo')
      .select('codigo')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();
      
    return !codigoError && !!codigoData;
  } catch (err) {
    console.error('Erro ao verificar código:', err);
    return false;
  }
};

/**
 * Pesquisa códigos de grupos de estudos
 * @param termo Termo de pesquisa (nome, disciplina, código)
 * @returns Lista de grupos encontrados
 */
export const pesquisarGruposPorTermo = async (termo: string) => {
  if (!termo) return { success: true, data: [] };

  try {
    // Normalizar o termo
    const termoNormalizado = termo.trim();
    
    // Se parece com um código (tem hífen ou pelo menos 4 caracteres), verificar primeiro como código exato
    if (termoNormalizado.includes('-') || termoNormalizado.length >= 4) {
      const codigoNormalizado = termoNormalizado.toUpperCase();
      
      // Buscar por código exato
      const { data: grupoPorCodigo, error: codigoError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('codigo', codigoNormalizado)
        .maybeSingle();
        
      if (!codigoError && grupoPorCodigo) {
        return { success: true, data: [grupoPorCodigo] };
      }
    }
    
    // Não encontrou como código exato, fazer busca ampla
    const { data, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .or(`nome.ilike.%${termoNormalizado}%,descricao.ilike.%${termoNormalizado}%,disciplina.ilike.%${termoNormalizado}%,codigo.ilike.%${termoNormalizado}%`)
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

/**
 * Verifica se um código de grupo existe
 * @param codigo O código a ser verificado
 * @returns Objeto indicando se o código existe e dados do grupo
 */
export async function verificarCodigoGrupo(codigo: string) {
  if (!codigo) {
    return { existe: false, grupo: null, error: "Código não fornecido" };
  }

  try {
    const codigoNormalizado = codigo.trim().toUpperCase();
    
    // Buscar diretamente na tabela de grupos
    const { data: grupoData, error: grupoError } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();
      
    if (!grupoError && grupoData) {
      return { existe: true, grupo: grupoData, error: null };
    }
    
    if (grupoError) {
      console.warn("Aviso: Erro ao verificar código na tabela de grupos. Tentando via códigos...");
    }
    
    // Buscar na tabela de códigos
    const { data: codigoData, error: codigoError } = await supabase
      .from('codigos_grupos_estudo')
      .select('*')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();
      
    if (codigoError) {
      console.error("Erro ao verificar código na tabela de códigos:", codigoError);
      return { existe: false, grupo: null, error: "Erro ao verificar código" };
    }
    
    if (!codigoData) {
      return { existe: false, grupo: null, error: null };
    }
    
    // Se encontrou na tabela de códigos, buscar o grupo completo
    const { data: grupoCompleto, error: grupoCompletoError } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('id', codigoData.grupo_id)
      .maybeSingle();
      
    if (grupoCompletoError || !grupoCompleto) {
      // Se não conseguir buscar o grupo completo, retornar os dados da tabela de códigos
      return { existe: true, grupo: codigoData, error: null };
    }
    
    return { existe: true, grupo: grupoCompleto, error: null };
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    return { existe: false, grupo: null, error: "Erro ao verificar código" };
  }
}

/**
 * Adiciona um usuário a um grupo usando o código
 * @param codigo Código do grupo
 * @param userId ID do usuário
 * @returns Objeto indicando sucesso ou falha
 */
export async function adicionarUsuarioAoGrupoPorCodigo(codigo: string, userId: string) {
  if (!codigo || !userId) {
    return { success: false, message: "Código ou userId não fornecido" };
  }

  try {
    // Verificar se o código existe
    const { existe, grupo, error } = await verificarCodigoGrupo(codigo);
    
    if (error) {
      return { success: false, message: error };
    }
    
    if (!existe || !grupo) {
      return { success: false, message: "Código de grupo não encontrado" };
    }
    
    // Verificar se o usuário já é membro
    let membrosIds = [];
    try {
      membrosIds = Array.isArray(grupo.membros_ids) 
        ? grupo.membros_ids 
        : (typeof grupo.membros_ids === 'string' 
            ? JSON.parse(grupo.membros_ids) 
            : []);
    } catch (e) {
      membrosIds = [];
    }
    
    if (membrosIds.includes(userId)) {
      return { success: false, message: "Você já é membro deste grupo", grupo };
    }
    
    // Adicionar usuário ao grupo
    membrosIds.push(userId);
    
    // Atualizar grupo
    const { error: updateError } = await supabase
      .from('grupos_estudo')
      .update({ 
        membros_ids: membrosIds,
        membros: membrosIds.length 
      })
      .eq('id', grupo.id);
      
    if (updateError) {
      console.error("Erro ao adicionar usuário ao grupo:", updateError);
      return { success: false, message: "Erro ao adicionar usuário ao grupo" };
    }
    
    // Atualizar na tabela de códigos
    const { error: updateCodigoError } = await supabase
      .from('codigos_grupos_estudo')
      .update({ 
        membros_ids: membrosIds,
        membros: membrosIds.length,
        ultima_atualizacao: new Date().toISOString()
      })
      .eq('codigo', codigo.toUpperCase());
      
    if (updateCodigoError) {
      console.warn("Aviso: Erro ao atualizar tabela de códigos:", updateCodigoError);
      // Não falhar por causa disso
    }
    
    // Retornar grupo atualizado
    const grupoAtualizado = {
      ...grupo,
      membros_ids: membrosIds,
      membros: membrosIds.length
    };
    
    return { 
      success: true, 
      message: `Você foi adicionado ao grupo: ${grupo.nome}`, 
      grupo: grupoAtualizado 
    };
  } catch (error) {
    console.error("Erro ao adicionar usuário ao grupo:", error);
    return { success: false, message: "Erro ao adicionar usuário ao grupo" };
  }
}
