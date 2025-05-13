
/**
 * Sistema simples de armazenamento para grupos de estudo
 * Usa localStorage como fallback quando o banco de dados falha
 */

import { supabase } from './supabase';

export interface GrupoEstudo {
  id: string;
  user_id: string;
  nome: string;
  descricao?: string;
  cor: string;
  membros: number;
  topico?: string;
  topico_nome?: string;
  topico_icon?: string;
  privado?: boolean;
  visibilidade?: string;
  codigo?: string;
  data_criacao: string;
  disciplina?: string;
}

// Caracteres permitidos para códigos de grupo (sem caracteres ambíguos como I, O, 0, 1)
const CARACTERES_PERMITIDOS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Salva o código de um grupo em múltiplas camadas de armazenamento para garantir persistência
 * @param grupoId - ID do grupo
 * @param codigo - Código de convite gerado
 * @returns boolean indicando se conseguiu salvar no servidor
 */
export const salvarCodigoGrupo = async (grupoId: string, codigo: string): Promise<boolean> => {
  let sucessoLocal = false;
  let sucessoServidor = false;
  
  // 1. Salvar no armazenamento dedicado (principal)
  try {
    const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
    const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
    codigosGrupos[grupoId] = codigo;
    localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));
    console.log(`Código ${codigo} armazenado no storage dedicado para grupo ${grupoId}`);
    sucessoLocal = true;
  } catch (storageError) {
    console.error('Erro ao salvar no storage dedicado:', storageError);
  }

  // 2. Salvar no localStorage de grupos (backup secundário)
  try {
    // Verificar primeiro no armazenamento padronizado
    const grupos = obterGruposLocal();
    const grupoIndex = grupos.findIndex(g => g.id === grupoId);
    
    if (grupoIndex >= 0) {
      grupos[grupoIndex].codigo = codigo;
      localStorage.setItem('epictus_grupos_estudo', JSON.stringify(grupos));
      console.log(`Código ${codigo} armazenado no localStorage para grupo ${grupoId}`);
      sucessoLocal = true;
    }
    
    // Para compatibilidade, verificar também o armazenamento legado
    const gruposLegados = obterGruposLocalStorage();
    const grupoLegadoIndex = gruposLegados.findIndex(g => g.id === grupoId);
    
    if (grupoLegadoIndex >= 0) {
      gruposLegados[grupoLegadoIndex].codigo = codigo;
      localStorage.setItem('grupos_estudo', JSON.stringify(gruposLegados));
    }
  } catch (localError) {
    console.error('Erro ao salvar no localStorage:', localError);
  }
  
  // 3. Salvar no sessionStorage (recuperação em caso de falhas)
  try {
    const backupKey = `grupo_codigo_${grupoId}`;
    sessionStorage.setItem(backupKey, codigo);
  } catch (sessionError) {
    console.error('Erro ao salvar no sessionStorage:', sessionError);
  }
    
  // 4. Tentar salvar no Supabase
  try {
    const { error } = await supabase
      .from('grupos_estudo')
      .update({ codigo })
      .eq('id', grupoId);
    
    if (error) {
      console.error('Erro ao atualizar código no Supabase:', error);
    } else {
      console.log(`Código ${codigo} salvo com sucesso no Supabase para grupo ${grupoId}`);
      sucessoServidor = true;
    }
  } catch (serverError) {
    console.error('Erro ao acessar Supabase:', serverError);
  }
  
  // Retornar true se conseguiu salvar em pelo menos uma das camadas
  return sucessoLocal || sucessoServidor;
};

/**
 * Obtém grupos de estudo do localStorage
 */
const obterGruposLocalStorage = (): GrupoEstudo[] => {
  try {
    const gruposStr = localStorage.getItem('grupos_estudo');
    return gruposStr ? JSON.parse(gruposStr) : [];
  } catch (e) {
    console.error('Erro ao obter grupos do localStorage:', e);
    return [];
  }
};

const COMPRIMENTO_CODIGO = 7; // Código com 7 caracteres conforme a especificação

/**
 * Gera uma string aleatória para ser usada como código de grupo
 */
export const gerarStringAleatoria = (comprimento = COMPRIMENTO_CODIGO, caracteres = CARACTERES_PERMITIDOS): string => {
  let resultado = '';
  const caracteresLength = caracteres.length;

  for (let i = 0; i < comprimento; i++) {
    resultado += caracteres.charAt(Math.floor(Math.random() * caracteresLength));
  }

  return resultado;
};

/**
 * Verifica se um código de grupo já existe no armazenamento
 * Nota: Trata códigos como não sensíveis a maiúsculas/minúsculas
 */
export const verificarSeCodigoExiste = async (codigo: string): Promise<boolean> => {
  try {
    // Verificar primeiro em localStorage
    const gruposLocais = obterGruposLocal();
    const existeLocal = gruposLocais.some((grupo: any) => 
      grupo.codigo && grupo.codigo.toUpperCase() === codigo.toUpperCase()
    );
    
    if (existeLocal) {
      console.log('Código já existe localmente:', codigo);
      return true;
    }
    
    // Verificar no Supabase
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data, error } = await supabase
          .from('grupos_estudo')
          .select('id')
          .eq('codigo', codigo.toUpperCase())
          .limit(1);
        
        if (error) {
          console.error('Erro ao verificar código no Supabase:', error);
          return false;
        }
        
        return data && data.length > 0;
      }
    } catch (error) {
      console.error('Erro ao comunicar com Supabase:', error);
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar se código existe:', error);
    return false;
  }
};

/**
 * Obtém um grupo pelo seu código único
 * @param codigo - Código único do grupo
 * @returns O grupo encontrado ou null
 */
export const obterGrupoPorCodigo = async (codigo: string): Promise<GrupoEstudo | null> => {
  try {
    // Normalizar o código
    codigo = codigo.trim().toUpperCase();
    
    // Verificar primeiro no localStorage
    const gruposLocais = obterGruposLocal();
    const grupoLocal = gruposLocais.find(grupo => 
      grupo.codigo && grupo.codigo.toUpperCase() === codigo
    );
    
    if (grupoLocal) {
      console.log('Grupo encontrado localmente pelo código:', codigo);
      return grupoLocal;
    }
    
    // Verificar no Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('Usuário não autenticado ao buscar grupo por código');
      return null;
    }
    
    const { data, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('codigo', codigo)
      .single();
    
    if (error) {
      console.error('Erro ao buscar grupo por código no Supabase:', error);
      return null;
    }
    
    if (data) {
      // Salvar localmente para acesso futuro mais rápido
      salvarGrupoLocal(data);
      return data;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao obter grupo por código:', error);
    return null;
  }
};

/**
 * Adiciona o usuário atual a um grupo específico
 * @param grupoId - ID do grupo
 * @returns true se o usuário foi adicionado com sucesso
 */
export const adicionarUsuarioAoGrupo = async (grupoId: string): Promise<boolean> => {
  try {
    // Obter dados do usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Usuário não autenticado ao tentar entrar no grupo');
      return false;
    }
    
    // Obter o grupo do Supabase
    const { data: grupo, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('id', grupoId)
      .single();
    
    if (error || !grupo) {
      console.error('Erro ao obter grupo para adicionar usuário:', error);
      return false;
    }
    
    // Verificar se o usuário já é membro do grupo
    const membrosIds = grupo.membros_ids || [];
    if (membrosIds.includes(user.id) || grupo.user_id === user.id) {
      // Usuário já é membro, não precisa adicionar
      return true;
    }
    
    // Adicionar o usuário à lista de membros
    const novosMembrosIds = [...membrosIds, user.id];
    
    // Atualizar o grupo no Supabase
    const { error: updateError } = await supabase
      .from('grupos_estudo')
      .update({ 
        membros_ids: novosMembrosIds,
        membros: (grupo.membros || 1) + 1 // Incrementar contador de membros
      })
      .eq('id', grupoId);
    
    if (updateError) {
      console.error('Erro ao adicionar usuário ao grupo:', updateError);
      return false;
    }
    
    // Atualizar grupo local
    grupo.membros_ids = novosMembrosIds;
    grupo.membros = (grupo.membros || 1) + 1;
    salvarGrupoLocal(grupo);
    
    return true;
  } catch (error) {
    console.error('Erro ao adicionar usuário ao grupo:', error);
    return false;
  }
};

/**
 * Gera um código único para o grupo de estudos
 * O código é gerado apenas uma vez para cada grupo e persistido
 * Uma vez gerado, o mesmo código será sempre retornado
 */
export const gerarCodigoUnicoGrupo = async (grupoId?: string): Promise<string> => {
  try {
    // Se um grupoId não foi fornecido, gerar apenas um código temporário
    // Este código não será salvo e é apenas para visualização
    if (!grupoId) {
      console.log("Gerando código temporário de exemplo (não persistente)");
      let codigoTemp = gerarCodigoUnico().toUpperCase();
      if (codigoTemp.length !== 7) {
        codigoTemp = codigoTemp.padEnd(7, 'A').substring(0, 7);
      }
      return codigoTemp;
    }
    
    // VERIFICAÇÃO DIRETA NO STORAGE LOCAL DEDICADO PARA CÓDIGOS
    // Esta é uma verificação separada do armazenamento de grupos
    const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
    
    try {
      // Verificar no storage dedicado para códigos
      const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
      
      // Se já existe um código para este grupo, retornar
      if (codigosGrupos[grupoId]) {
        console.log(`Código permanente existente encontrado no storage dedicado:`, codigosGrupos[grupoId]);
        return codigosGrupos[grupoId];
      }
    } catch (e) {
      console.error("Erro ao verificar storage dedicado de códigos:", e);
    }
    
    // VERIFICAÇÃO EM MÚLTIPLAS CAMADAS (FALLBACK):
    // 1. Verificar no localStorage de grupos
    const grupos = obterGruposLocal();
    const grupoExistente = grupos.find(g => g.id === grupoId);
    
    if (grupoExistente && grupoExistente.codigo) {
      console.log(`Código existente encontrado no localStorage:`, grupoExistente.codigo);
      
      // Salvar também no storage dedicado
      try {
        const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
        codigosGrupos[grupoId] = grupoExistente.codigo;
        localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));
        console.log(`Código salvo no storage dedicado:`, grupoExistente.codigo);
      } catch (e) {
        console.error("Erro ao salvar no storage dedicado:", e);
      }
      
      // Garantir que o código também existe no Supabase (sincronização silenciosa)
      try {
        const { data, error } = await supabase
          .from('grupos_estudo')
          .select('codigo')
          .eq('id', grupoId)
          .single();
        
        if (error || !data || !data.codigo) {
          // Se não existir no Supabase, sincronizar silenciosamente
          await supabase
            .from('grupos_estudo')
            .update({ codigo: grupoExistente.codigo })
            .eq('id', grupoId);
          
          console.log(`Código sincronizado com Supabase:`, grupoExistente.codigo);
        }
      } catch (e) {
        console.error("Erro na sincronização silenciosa:", e);
      }
      
      return grupoExistente.codigo;
    }
    
    // 2. Se não encontrou no localStorage, verificar no Supabase
    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('codigo')
        .eq('id', grupoId)
        .single();
        
      if (!error && data && data.codigo) {
        console.log(`Código encontrado no banco de dados:`, data.codigo);
        
        // Salvar no storage dedicado
        try {
          const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
          codigosGrupos[grupoId] = data.codigo;
          localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));
          console.log(`Código do Supabase salvo no storage dedicado:`, data.codigo);
        } catch (e) {
          console.error("Erro ao salvar no storage dedicado:", e);
        }
        
        // Atualizar também o localStorage de grupos para futuras consultas
        const grupoIndex = grupos.findIndex(g => g.id === grupoId);
        if (grupoIndex >= 0) {
          grupos[grupoIndex].codigo = data.codigo;
          localStorage.setItem('epictus_grupos_estudo', JSON.stringify(grupos));
          console.log(`Código do Supabase atualizado no localStorage:`, data.codigo);
        }
        
        return data.codigo;
      }
    } catch (supabaseError) {
      console.error('Erro ao buscar código existente no Supabase:', supabaseError);
    }
    
    // 3. Verificar no sessionStorage (mecanismo de recuperação)
    try {
      const backupKey = `grupo_codigo_${grupoId}`;
      const sessionCodigo = sessionStorage.getItem(backupKey);
      if (sessionCodigo) {
        console.log(`Código recuperado do sessionStorage:`, sessionCodigo);
        
        // Salvar nos storages permanentes
        try {
          // Salvar no storage dedicado
          const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
          codigosGrupos[grupoId] = sessionCodigo;
          localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));
          
          // Atualizar grupo no localStorage
          const grupoIndex = grupos.findIndex(g => g.id === grupoId);
          if (grupoIndex >= 0) {
            grupos[grupoIndex].codigo = sessionCodigo;
            localStorage.setItem('epictus_grupos_estudo', JSON.stringify(grupos));
          }
          
          console.log(`Código do sessionStorage propagado para storages permanentes:`, sessionCodigo);
        } catch (e) {
          console.error("Erro ao salvar código do sessionStorage nos storages permanentes:", e);
        }
        
        return sessionCodigo;
      }
    } catch (e) {
      console.error("Erro ao verificar sessionStorage:", e);
    }
    
    // 4. Se chegou aqui, significa que o código realmente não existe e precisa ser gerado
    console.log(`Nenhum código encontrado para o grupo ${grupoId}, gerando um novo...`);
    
    // Gerar novo código único
    let codigoGrupo = gerarCodigoUnico().toUpperCase();
    
    // Verificar se o código tem o comprimento esperado (7 caracteres)
    if (codigoGrupo.length !== 7) {
      if (codigoGrupo.length < 7) {
        // Adicionar caracteres aleatórios até completar 7
        while (codigoGrupo.length < 7) {
          codigoGrupo += CARACTERES_PERMITIDOS.charAt(
            Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
          );
        }
      } else {
        // Truncar para 7 caracteres
        codigoGrupo = codigoGrupo.substring(0, 7);
      }
    }
    
    // Adicionar um timestamp parcial para garantir unicidade
    // Últimos 2 caracteres do timestamp convertido para base 36 (alfanumérico)
    const timestamp = Date.now().toString(36).substring(0, 2).toUpperCase();
    codigoGrupo = codigoGrupo.substring(0, 5) + timestamp;
    
    // PERSISTÊNCIA EM MÚLTIPLAS CAMADAS:
    // 1. Salvar no storage dedicado (principal)
    try {
      const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
      codigosGrupos[grupoId] = codigoGrupo;
      localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));
      console.log(`Código ${codigoGrupo} persistido no storage dedicado para o grupo ${grupoId}`);
    } catch (e) {
      console.error("Erro ao salvar no storage dedicado:", e);
    }
    
    // 2. Salvar no localStorage de grupos (secundário)
    const grupoIndex = grupos.findIndex(g => g.id === grupoId);
    if (grupoIndex >= 0) {
      grupos[grupoIndex].codigo = codigoGrupo;
      localStorage.setItem('epictus_grupos_estudo', JSON.stringify(grupos));
      console.log(`Código ${codigoGrupo} persistido no localStorage para o grupo ${grupoId}`);
    }
    
    // 3. Salvar no Supabase
    try {
      const { error } = await supabase
        .from('grupos_estudo')
        .update({ codigo: codigoGrupo })
        .eq('id', grupoId);
        
      if (error) {
        console.error('Erro ao salvar código no Supabase:', error);
      } else {
        console.log(`Código ${codigoGrupo} persistido no Supabase para o grupo ${grupoId}`);
      }
    } catch (supabaseError) {
      console.error('Erro ao acessar Supabase para salvar código:', supabaseError);
    }
    
    // 4. Cópia de segurança adicional no sessionStorage (para recuperação em caso de falhas)
    try {
      const backupKey = `grupo_codigo_${grupoId}`;
      sessionStorage.setItem(backupKey, codigoGrupo);
    } catch (e) {
      console.error("Erro ao criar backup no sessionStorage:", e);
    }
    
    console.log(`Novo código único gerado e persistido em todos os storages:`, codigoGrupo);
    return codigoGrupo;
  } catch (error) {
    console.error("Erro crítico ao gerar/recuperar código único para grupo:", error);
    
    // MECANISMO DE RECUPERAÇÃO DE EMERGÊNCIA:
    // 1. Tentar recuperar do sessionStorage
    if (grupoId) {
      try {
        const backupKey = `grupo_codigo_${grupoId}`;
        const backupCodigo = sessionStorage.getItem(backupKey);
        if (backupCodigo) {
          console.log("Recuperado código de backup do sessionStorage:", backupCodigo);
          return backupCodigo;
        }
      } catch (e) {
        console.error("Erro na tentativa de recuperação do sessionStorage:", e);
      }
    }
    
    // 2. Último recurso: gerar código de emergência
    const codigoEmergencia = `GE${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    
    // Tentar salvar para que não precise gerar novo código na próxima vez
    if (grupoId) {
      const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
      
      try {
        // Salvar no storage dedicado
        const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
        codigosGrupos[grupoId] = codigoEmergencia;
        localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));
        
        // Salvar também no localStorage de grupos
        const grupos = obterGruposLocal();
        const grupoIndex = grupos.findIndex(g => g.id === grupoId);
        
        if (grupoIndex >= 0) {
          grupos[grupoIndex].codigo = codigoEmergencia;
          localStorage.setItem('epictus_grupos_estudo', JSON.stringify(grupos));
        }
        
        // Tentar também salvar no sessionStorage como backup
        const backupKey = `grupo_codigo_${grupoId}`;
        sessionStorage.setItem(backupKey, codigoEmergencia);
        
        console.log("Código de emergência salvo em todos os storages:", codigoEmergencia);
      } catch (saveError) {
        console.error('Erro ao salvar código de emergência:', saveError);
      }
    }
    
    return codigoEmergencia;
  }
};

// Chave para armazenamento local
const STORAGE_KEY = 'epictus_grupos_estudo';

/**
 * Salva um grupo no armazenamento local
 */
export const salvarGrupoLocal = (grupo: GrupoEstudo): void => {
  try {
    // Buscar grupos existentes
    const gruposExistentes = obterGruposLocal();

    // Verificar se o grupo já existe
    const grupoExistente = gruposExistentes.findIndex(g => g.id === grupo.id);

    if (grupoExistente >= 0) {
      // Atualizar grupo existente
      gruposExistentes[grupoExistente] = grupo;
    } else {
      // Adicionar novo grupo
      gruposExistentes.push(grupo);
    }

    // Criar backup do estado atual antes de salvar
    const gruposAtuais = localStorage.getItem(STORAGE_KEY);
    if (gruposAtuais) {
      localStorage.setItem(`${STORAGE_KEY}_backup`, gruposAtuais);
    }

    // Salvar no localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gruposExistentes));
    console.log('Grupo salvo localmente com sucesso', grupo);

    // Sincronização com sessionStorage para recuperação em caso de perda do localStorage
    try {
      sessionStorage.setItem(`${STORAGE_KEY}_session`, JSON.stringify(gruposExistentes));
    } catch (sessionError) {
      console.error('Erro ao criar cópia de segurança na sessão:', sessionError);
    }
  } catch (error) {
    console.error('Erro ao salvar grupo localmente:', error);

    // Tentar salvar em um formato alternativo em caso de erro
    try {
      localStorage.setItem(`${STORAGE_KEY}_emergency_${Date.now()}`, JSON.stringify([grupo]));
    } catch (emergencyError) {
      console.error('Erro crítico ao salvar em modo emergência:', emergencyError);
    }
  }
};

/**
 * Obtém todos os grupos do armazenamento local
 */
export const obterGruposLocal = (): GrupoEstudo[] => {
  try {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (!dados) return [];

    const gruposParsed = JSON.parse(dados);
    console.log('Grupos recuperados do armazenamento local:', gruposParsed.length);
    return gruposParsed;
  } catch (error) {
    console.error('Erro ao obter grupos locais:', error);

    // Tentar recuperar backup caso a primeira tentativa falhe
    try {
      const backupDados = localStorage.getItem(`${STORAGE_KEY}_backup`);
      if (backupDados) {
        console.log('Usando backup de grupos estudos');
        return JSON.parse(backupDados);
      }
    } catch (backupError) {
      console.error('Falha ao recuperar backup:', backupError);
    }

    return [];
  }
};

/**
 * Limpa os grupos salvos localmente
 */
export const limparGruposLocal = (): void => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(`${STORAGE_KEY}_session`);
};

/**
 * Remove um grupo específico do armazenamento local
 */
export const removerGrupoLocal = (grupoId: string): boolean => {
  try {
    // Obter grupos existentes
    const gruposExistentes = obterGruposLocal();

    // Filtrar removendo o grupo com o ID especificado
    const gruposFiltrados = gruposExistentes.filter(g => g.id !== grupoId);

    // Se não houve alteração, o grupo não existia
    if (gruposExistentes.length === gruposFiltrados.length) {
      return false;
    }

    // Salvar a nova lista de grupos
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gruposFiltrados));

    // Atualizar também o backup na sessão
    try {
      sessionStorage.setItem(`${STORAGE_KEY}_session`, JSON.stringify(gruposFiltrados));
    } catch (sessionError) {
      console.error('Erro ao atualizar backup na sessão:', sessionError);
    }

    // Limpar também quaisquer backups de emergência que possam conter este grupo
    try {
      const todasChaves = Object.keys(localStorage);
      const chavesEmergencia = todasChaves.filter(chave => chave.startsWith(`${STORAGE_KEY}_emergency_`));

      for (const chave of chavesEmergencia) {
        try {
          const gruposEmergencia = JSON.parse(localStorage.getItem(chave) || '[]');
          const gruposEmergenciaFiltrados = gruposEmergencia.filter((g: any) => g.id !== grupoId);
          localStorage.setItem(chave, JSON.stringify(gruposEmergenciaFiltrados));
        } catch (e) {
          console.error('Erro ao atualizar backup de emergência:', e);
        }
      }
    } catch (backupError) {
      console.error('Erro ao limpar backups de emergência:', backupError);
    }

    console.log('Grupo removido localmente com sucesso', grupoId);
    return true;
  } catch (error) {
    console.error('Erro ao remover grupo localmente:', error);
    return false;
  }
};

/**
 * Exclui um grupo do Supabase
 */
export const excluirGrupo = async (grupoId: string, userId: string): Promise<boolean> => {
  try {
    // Primeiro remover localmente para garantir resposta rápida na interface
    removerGrupoLocal(grupoId);

    // Se for um ID local, não precisamos tentar remover do Supabase
    if (grupoId.startsWith('local_')) {
      return true;
    }

    // Tentar excluir do Supabase
    const { error } = await supabase
      .from('grupos_estudo')
      .delete()
      .eq('id', grupoId)
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao excluir grupo do banco de dados:', error);
      return false;
    }

    console.log('Grupo excluído com sucesso do banco de dados', grupoId);
    return true;
  } catch (error) {
    console.error('Erro ao excluir grupo:', error);
    return false;
  }
};

/**
 * Cria um grupo no Supabase com fallback para armazenamento local
 */
export const criarGrupo = async (dados: Omit<GrupoEstudo, 'id'>): Promise<GrupoEstudo | null> => {
  try {
    // Tentar inserir no Supabase
    const { data, error } = await supabase
      .from('grupos_estudo')
      .insert(dados)
      .select('*')
      .single();

    if (error) {
      console.error('Erro ao criar grupo no banco de dados:', error);

      // Gerar ID localmente
      const id = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // Criar grupo para armazenamento local
      const grupoLocal: GrupoEstudo = {
        ...dados,
        id
      };

      // Salvar localmente
      // salvarGrupoLocal(grupoLocal); // This line was removed to avoid double saving

      // Mostrar notificação sobre o armazenamento local
      const element = document.createElement('div');
      element.style.position = 'fixed';
      element.style.top = '20px';
      element.style.left = '50%';
      element.style.transform = 'translateX(-50%)';
      element.style.padding = '10px 20px';
      element.style.background = '#FFA500';
      element.style.color = 'white';
      element.style.borderRadius = '4px';
      element.style.zIndex = '9999';
      element.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      element.textContent = 'Grupo salvo localmente. Será sincronizado quando o banco de dados estiver disponível.';
      document.body.appendChild(element);

      // Remover após 5 segundos
      setTimeout(() => {
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.5s';
        setTimeout(() => {
          document.body.removeChild(element);
        }, 500);
      }, 5000);

      return grupoLocal;
    }

    return data;
  } catch (error) {
    console.error('Erro ao criar grupo:', error);

    // Falha total, retornar nulo
    return null;
  }
};

/**
 * Obtém todos os grupos de estudo (do Supabase + localStorage)
 */
export const obterTodosGrupos = async (userId: string): Promise<GrupoEstudo[]> => {
  try {
    // Obter a lista de grupos removidos
    const gruposRemovidosKey = 'grupos_removidos';
    const gruposRemovidosStr = localStorage.getItem(gruposRemovidosKey) || '[]';
    const gruposRemovidos = JSON.parse(gruposRemovidosStr);

    // Primeiro, garantir que temos os grupos locais (failsafe), excluindo os removidos
    let gruposLocais = obterGruposLocal()
      .filter(grupo => grupo.user_id === userId)
      .filter(grupo => !gruposRemovidos.includes(grupo.id));

    // Tentar obter backup da sessão
    try {
      const backupSessao = sessionStorage.getItem(`${STORAGE_KEY}_session`);
      if (backupSessao) {
        const gruposSessao = JSON.parse(backupSessao);
        console.log('Backup de sessão encontrado com', gruposSessao.length, 'grupos');

        // Combinar com grupos locais existentes (evitando duplicatas e grupos removidos)
        const gruposLocaisIds = new Set(gruposLocais.map(g => g.id));

        const gruposSessaoFiltrados = gruposSessao
          .filter((g: GrupoEstudo) => 
            g.user_id === userId && 
            !gruposLocaisIds.has(g.id) && 
            !gruposRemovidos.includes(g.id)
          );

        if (gruposSessaoFiltrados.length > 0) {
          console.log('Adicionando', gruposSessaoFiltrados.length, 'grupos do backup de sessão');
          gruposLocais = [...gruposLocais, ...gruposSessaoFiltrados];

          // Atualizar localStorage com os dados combinados
          localStorage.setItem(STORAGE_KEY, JSON.stringify(gruposLocais));
        }
      }
    } catch (sessionError) {
      console.error('Erro ao recuperar backup de sessão:', sessionError);
    }

    // Agora tentar obter do Supabase
    try {
      const { data: gruposSupabase, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('user_id', userId)
        .order('data_criacao', { ascending: false });

      if (error) {
        console.error('Erro ao buscar grupos do banco de dados:', error);
        // Se falhar o Supabase, retornar apenas grupos locais
        return gruposLocais;
      }

      // Filtrar grupos do Supabase para excluir os grupos removidos
      const gruposSupabaseFiltrados = gruposSupabase.filter(
        grupo => !gruposRemovidos.includes(grupo.id)
      );

      // Filtrar grupos locais para incluir apenas os que não estão no Supabase
      const gruposLocaisFiltrados = gruposLocais.filter(
        grupoLocal => !gruposSupabaseFiltrados.some(grupoRemoto => grupoRemoto.id === grupoLocal.id)
      );

      // Combinar ambos
      const todosGrupos = [...gruposSupabaseFiltrados, ...gruposLocaisFiltrados];

      // Certificar-se de que os grupos locais estão atualizados
      if (todosGrupos.length !== gruposLocais.length) {
        // Salvar apenas os grupos locais (que começam com 'local_')
        const apenasGruposLocais = todosGrupos
          .filter(g => g.id.startsWith('local_'))
          .filter(g => !gruposRemovidos.includes(g.id));

        // Se houver alguma diferença, atualizar armazenamento local
        if (apenasGruposLocais.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(apenasGruposLocais));
        }
      }

      return todosGrupos;
    } catch (supabaseError) {
      console.error('Erro ao acessar Supabase:', supabaseError);
      return gruposLocais;
    }
  } catch (error) {
    console.error('Erro ao obter todos os grupos:', error);

    // Obter a lista de grupos removidos para filtrar recuperações de emergência
    const gruposRemovidosKey = 'grupos_removidos';
    const gruposRemovidosStr = localStorage.getItem(gruposRemovidosKey) || '[]';
    const gruposRemovidos = JSON.parse(gruposRemovidosStr);

    // Tentar recuperar grupos de qualquer fonte possível
    try {
      // Verificar backup no localStorage
      const backup = localStorage.getItem(`${STORAGE_KEY}_backup`);
      if (backup) {
        const gruposBackup = JSON.parse(backup);
        return gruposBackup
          .filter((g: GrupoEstudo) => g.user_id === userId)
          .filter((g: GrupoEstudo) => !gruposRemovidos.includes(g.id));
      }

      // Verificar backups de emergência
      const todasChaves = Object.keys(localStorage);
      const chavesEmergencia = todasChaves.filter(chave => chave.startsWith(`${STORAGE_KEY}_emergency_`));

      if (chavesEmergencia.length > 0) {
        // Combinar todos os backups de emergência
        let gruposEmergencia: GrupoEstudo[] = [];

        for (const chave of chavesEmergencia) {
          try {
            const gruposChave = JSON.parse(localStorage.getItem(chave) || '[]');
            gruposEmergencia = [...gruposEmergencia, ...gruposChave];
          } catch (e) {
            console.error('Erro ao recuperar backup de emergência:', e);
          }
        }

        return gruposEmergencia
          .filter(g => g.user_id === userId)
          .filter(g => !gruposRemovidos.includes(g.id));
      }
    } catch (recoveryError) {
      console.error('Erro na recuperação de emergência:', recoveryError);
    }

    // Último recurso: retornar array vazio
    return [];
  }
};

/**
 * Tenta sincronizar grupos locais com o banco de dados
 */
export const sincronizarGruposLocais = async (userId: string): Promise<void> => {
  try {
    const gruposLocais = obterGruposLocal()
      .filter(grupo => 
        grupo.user_id === userId && 
        grupo.id.startsWith('local_')
      );

    if (gruposLocais.length === 0) return;

    console.log(`Tentando sincronizar ${gruposLocais.length} grupos locais`);

    for (const grupo of gruposLocais) {
      // Remover o ID local para que o Supabase gere um novo
      const { id, ...dadosGrupo } = grupo;

      // Tentar inserir no Supabase
      const { error } = await supabase
        .from('grupos_estudo')
        .insert(dadosGrupo);

      if (!error) {
        console.log(`Grupo sincronizado com sucesso: ${grupo.nome}`);
        // Remover do armazenamento local após sincronizar
        const gruposAtualizados = obterGruposLocal().filter(g => g.id !== grupo.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gruposAtualizados));
      }
    }
  } catch (error) {
    console.error('Erro ao sincronizar grupos locais:', error);
  }
};

// Funções para gerar e verificar códigos de grupo
export const gerarCodigoUnico = (): string => {
  // Usar apenas letras maiúsculas e números que são facilmente distinguíveis
  // Excluindo caracteres como O e 0, I e 1, que podem causar confusão
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let resultado = '';
  for (let i = 0; i < 7; i++) {
    resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return resultado;
};

export const removerGrupo = (grupoId: string) => {
  const grupos = getGruposFromStorage();
  const gruposAtualizados = grupos.filter(grupo => grupo.id !== grupoId);
  saveGruposToStorage(gruposAtualizados);

  // Adicionar o ID do grupo à lista de grupos removidos
  const gruposRemovidosKey = 'grupos_removidos';
  const gruposRemovidosStr = localStorage.getItem(gruposRemovidosKey) || '[]';
  const gruposRemovidos = JSON.parse(gruposRemovidosStr);

  if (!gruposRemovidos.includes(grupoId)) {
    gruposRemovidos.push(grupoId);
    localStorage.setItem(gruposRemovidosKey, JSON.stringify(gruposRemovidos));
  }

  return gruposAtualizados;
};

// Função auxiliar para obter grupos do localStorage (para compatibilidade)
const getGruposFromStorage = (): GrupoEstudo[] => {
  try {
    const dados = localStorage.getItem(STORAGE_KEY);
    if (!dados) return [];
    return JSON.parse(dados);
  } catch (error) {
    console.error('Erro ao obter grupos do storage:', error);
    return [];
  }
};

// Função auxiliar para salvar grupos no localStorage (para compatibilidade)
const saveGruposToStorage = (grupos: GrupoEstudo[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(grupos));
  } catch (error) {
    console.error('Erro ao salvar grupos no storage:', error);
  }
};

// Verificar se um grupo está na lista de removidos
export const isGrupoRemovido = (grupoId: string): boolean => {
  const gruposRemovidosKey = 'grupos_removidos';
  const gruposRemovidosStr = localStorage.getItem(gruposRemovidosKey) || '[]';
  const gruposRemovidos = JSON.parse(gruposRemovidosStr);
  return gruposRemovidos.includes(grupoId);
};

// Método para filtrar grupos que foram removidos
export const filtrarGruposRemovidos = (grupos: any[]): any[] => {
  const gruposRemovidosKey = 'grupos_removidos';
  const gruposRemovidosStr = localStorage.getItem(gruposRemovidosKey) || '[]';
  const gruposRemovidos = JSON.parse(gruposRemovidosStr);

  return grupos.filter(grupo => !gruposRemovidos.includes(grupo.id));
};
