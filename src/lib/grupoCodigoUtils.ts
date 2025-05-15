/**
 * Utilitários para gerenciar códigos dos grupos de estudo
 * Este arquivo centraliza operações comuns relacionadas aos códigos dos grupos
 */
import { supabase } from '@/lib/supabase';

// Interface para o tipo GrupoEstudo
export interface GrupoEstudo {
  id: string;
  codigo?: string;
  nome: string;
  descricao?: string;
  user_id: string;
  privado?: boolean;
  membros?: number;
  visibilidade?: string;
  disciplina?: string;
  cor?: string;
  membros_ids?: string[];
  data_criacao?: string;
  dataCriacao?: string;
  criador?: string;
}

/**
 * Verifica se um código existe no banco de dados
 * @param codigo Código a ser verificado
 * @returns true se o código existe
 */
export const verificarSeCodigoExiste = async (codigo: string): Promise<boolean> => {
  if (!codigo) return false;

  try {
    const codigoNormalizado = codigo.trim().toUpperCase();

    // Verificar na tabela de grupos
    const { data, error } = await supabase
      .from('grupos_estudo')
      .select('id')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();

    return !error && !!data;
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    return false;
  }
};

/**
 * Busca os detalhes de um grupo pelo código
 * @param codigo Código do grupo
 * @returns Detalhes do grupo ou null se não encontrado
 */
export const buscarGrupoComCodigo = async (codigo: string): Promise<GrupoEstudo | null> => {
  if (!codigo) return null;

  try {
    const codigoNormalizado = codigo.trim().toUpperCase();

    // Buscar diretamente na tabela de grupos
    const { data, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar grupo por código:", error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      codigo: data.codigo,
      nome: data.nome,
      descricao: data.descricao,
      user_id: data.user_id,
      privado: data.privado,
      membros: data.membros,
      visibilidade: data.visibilidade,
      disciplina: data.disciplina,
      cor: data.cor,
      membros_ids: data.membros_ids,
      data_criacao: data.data_criacao,
      dataCriacao: data.data_criacao
    };
  } catch (error) {
    console.error("Erro ao buscar grupo:", error);
    return null;
  }
};

/**
 * Verifica se um usuário tem relação com o grupo (criador ou membro)
 * @param codigo Código do grupo
 * @param userId ID do usuário
 * @returns Informações sobre a relação do usuário com o grupo
 */
export const verificarRelacaoUsuarioComGrupo = async (
  codigo: string,
  userId: string
): Promise<{
  pertenceAoUsuario: boolean;
  jaEMembro: boolean;
  nomeGrupo: string;
  grupoId: string | null;
}> => {
  if (!codigo || !userId) {
    return { pertenceAoUsuario: false, jaEMembro: false, nomeGrupo: '', grupoId: null };
  }

  try {
    const grupo = await buscarGrupoComCodigo(codigo);

    if (!grupo) {
      return { pertenceAoUsuario: false, jaEMembro: false, nomeGrupo: '', grupoId: null };
    }

    // Verificar se é o criador
    const pertenceAoUsuario = grupo.user_id === userId;

    // Verificar se é membro
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

    const jaEMembro = membrosIds.includes(userId);

    // Verificar no localStorage
    let membroLocalStorage = false;
    try {
      const gruposStorage = localStorage.getItem('epictus_grupos_estudo');
      if (gruposStorage) {
        const grupos = JSON.parse(gruposStorage);
        const grupoLocalStorage = grupos.find((g: any) => g.id === grupo.id);
        membroLocalStorage = !!grupoLocalStorage;
      }
    } catch (e) {
      console.error("Erro ao verificar grupos no localStorage:", e);
    }

    return {
      pertenceAoUsuario,
      jaEMembro: jaEMembro || membroLocalStorage || pertenceAoUsuario,
      nomeGrupo: grupo.nome || 'Grupo sem nome',
      grupoId: grupo.id
    };
  } catch (error) {
    console.error("Erro ao verificar relação do usuário com o grupo:", error);
    return { pertenceAoUsuario: false, jaEMembro: false, nomeGrupo: '', grupoId: null };
  }
};

/**
 * Gera um código único para um grupo
 * @returns Código formatado no padrão XXXX-YYYY
 */
export const gerarCodigoUnico = (): string => {
  // Caracteres permitidos (excluindo caracteres ambíguos como 0/O, 1/I)
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  // Gerar primeiro segmento (4 caracteres)
  let codigo = '';
  for (let i = 0; i < 4; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }

  codigo += '-';

  // Gerar segundo segmento (4 caracteres)
  for (let i = 0; i < 4; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }

  return codigo;
};

/**
 * Salva um código de grupo no banco de dados e armazenamento local
 * @param grupoId ID do grupo
 * @param codigo Código a ser salvo
 */
export const salvarCodigoGrupo = async (grupoId: string, codigo: string): Promise<void> => {
  if (!grupoId || !codigo) return;

  try {
    const codigoNormalizado = codigo.toUpperCase();

    // Salvar no banco de dados
    const { error } = await supabase
      .from('grupos_estudo')
      .update({ codigo: codigoNormalizado })
      .eq('id', grupoId);

    if (error) {
      console.error("Erro ao salvar código no banco:", error);
    }

    // Salvar no localStorage como backup
    try {
      // Armazenamento de códigos
      const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
      const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
      codigosGrupos[grupoId] = codigoNormalizado;
      localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));

      // Atualizar nos grupos
      const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
      const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');
      const grupoIndex = grupos.findIndex((g: any) => g.id === grupoId);

      if (grupoIndex >= 0) {
        grupos[grupoIndex].codigo = codigoNormalizado;
        localStorage.setItem(GRUPOS_STORAGE_KEY, JSON.stringify(grupos));
      }
    } catch (storageError) {
      console.error("Erro ao salvar código no localStorage:", storageError);
    }
  } catch (error) {
    console.error("Erro ao salvar código de grupo:", error);
  }
};

/**
 * Gera e salva um código único para um grupo
 * @param grupoId ID do grupo
 * @returns O código gerado
 */
export const gerarESalvarCodigoUnico = async (grupoId: string): Promise<string> => {
  try {
    // Gerar um novo código único
    const codigo = gerarCodigoUnico();

    // Salvar o código
    await salvarCodigoGrupo(grupoId, codigo);

    return codigo;
  } catch (error) {
    console.error("Erro ao gerar e salvar código:", error);

    // Fallback - gerar um código simples em caso de erro
    const fallbackCodigo = Array(4)
      .fill(0)
      .map(() => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 32)))
      .join('') + '-' + 
      Array(4)
      .fill(0)
      .map(() => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 32)))
      .join('');

    try {
      await salvarCodigoGrupo(grupoId, fallbackCodigo);
    } catch (fallbackError) {
      console.error("Erro ao salvar código fallback:", fallbackError);
    }

    return fallbackCodigo;
  }
};

/**
 * Cria um novo grupo de estudo
 * @param dados Dados do grupo a ser criado
 * @returns O grupo criado ou null em caso de erro
 */
export const criarGrupo = async (dados: Omit<GrupoEstudo, 'id'>): Promise<GrupoEstudo | null> => {
  try {
    // Gerar um código único
    const codigo = gerarCodigoUnico();

    // Adicionar o código aos dados
    const dadosCompletos = {
      ...dados,
      codigo: codigo.toUpperCase(),
      data_criacao: new Date().toISOString()
    };

    // Inserir no Supabase
    const { data, error } = await supabase
      .from('grupos_estudo')
      .insert(dadosCompletos)
      .select('*')
      .single();

    if (error) {
      console.error("Erro ao criar grupo:", error);

      // Fallback: criar grupo localmente
      const id = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const grupoLocal: GrupoEstudo = {
        ...dadosCompletos,
        id
      };

      // Salvar no localStorage
      const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
      const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');
      grupos.push(grupoLocal);
      localStorage.setItem(GRUPOS_STORAGE_KEY, JSON.stringify(grupos));

      return grupoLocal;
    }

    // Grupo criado com sucesso no Supabase
    if (data) {
      // Backup no localStorage
      const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
      const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');
      grupos.push(data);
      localStorage.setItem(GRUPOS_STORAGE_KEY, JSON.stringify(grupos));
    }

    return data;
  } catch (error) {
    console.error("Erro ao criar grupo:", error);
    return null;
  }
};

/**
 * Obtém todos os grupos de um usuário
 * @param userId ID do usuário
 * @returns Lista de grupos do usuário
 */
export const obterTodosGrupos = async (userId: string): Promise<GrupoEstudo[]> => {
  try {
    // Lista para armazenar todos os grupos encontrados
    const todosGrupos = new Map<string, GrupoEstudo>();

    // Buscar grupos no banco de dados
    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('user_id', userId)
        .order('data_criacao', { ascending: false });

      if (!error && data) {
        // Adicionar grupos ao mapa
        data.forEach(grupo => {
          todosGrupos.set(grupo.id, {
            id: grupo.id,
            codigo: grupo.codigo,
            nome: grupo.nome,
            descricao: grupo.descricao,
            user_id: grupo.user_id,
            privado: grupo.privado,
            membros: grupo.membros,
            visibilidade: grupo.visibilidade,
            disciplina: grupo.disciplina,
            cor: grupo.cor,
            membros_ids: grupo.membros_ids,
            data_criacao: grupo.data_criacao,
            dataCriacao: grupo.data_criacao
          });
        });
      }
    } catch (dbError) {
      console.error("Erro ao buscar grupos no banco:", dbError);
    }

    // Buscar grupos no localStorage como backup
    try {
      const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
      const gruposLocal = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');

      gruposLocal
        .filter((g: any) => g.user_id === userId || g.criador === userId)
        .forEach((grupo: any) => {
          // Apenas adicionar se ainda não existir ou for um grupo local
          if (!todosGrupos.has(grupo.id) || grupo.id.startsWith('local_')) {
            todosGrupos.set(grupo.id, grupo);
          }
        });
    } catch (storageError) {
      console.error("Erro ao buscar grupos no localStorage:", storageError);
    }

    return Array.from(todosGrupos.values());
  } catch (error) {
    console.error("Erro ao obter todos os grupos:", error);
    return [];
  }
};