
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
 * Gera um código único para o grupo de estudos
 */
export const gerarCodigoUnicoGrupo = async (): Promise<string> => {
  try {
    // Número máximo de tentativas para evitar loops infinitos
    const MAX_TENTATIVAS = 10;
    let tentativas = 0;
    let codigoGrupo: string;
    let codigoJaExiste = false;
    
    do {
      // Gerar um novo código
      codigoGrupo = gerarCodigoUnico();
      
      // Verificar se já existe
      codigoJaExiste = await verificarSeCodigoExiste(codigoGrupo);
      
      // Incrementar contador de tentativas
      tentativas++;
      
      // Se já tentamos muitas vezes, adicionar timestamp no final para garantir unicidade
      if (tentativas >= MAX_TENTATIVAS) {
        const timestamp = Date.now().toString(36).substring(0, 2).toUpperCase();
        codigoGrupo = codigoGrupo.substring(0, 5) + timestamp;
        break;
      }
    } while (codigoJaExiste);
    
    // Garantir que o código está em formato correto
    codigoGrupo = codigoGrupo.toUpperCase();

    // Verificar se o código tem o comprimento esperado (7 caracteres)
    if (codigoGrupo.length !== 7) {
      console.warn("Código gerado não tem o comprimento esperado:", codigoGrupo);
      // Ajustar o código para ter 7 caracteres se necessário
      if (codigoGrupo.length < 7) {
        // Adicionar caracteres aleatórios até completar 7
        while (codigoGrupo.length < 7) {
          codigoGrupo += CARACTERES_PERMITIDOS.charAt(
            Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
          );
        }
      } else if (codigoGrupo.length > 7) {
        // Truncar para 7 caracteres
        codigoGrupo = codigoGrupo.substring(0, 7);
      }
    }
    
    console.log(`Código único gerado após ${tentativas} tentativa(s):`, codigoGrupo);
    return codigoGrupo;
  } catch (error) {
    console.error("Erro ao gerar código único para grupo:", error);
    // Garantir que sempre retornamos um código, mesmo em caso de erro
    return `GE${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
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
