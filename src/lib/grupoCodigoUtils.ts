/**
 * Utilitários para gerenciar códigos dos grupos de estudo
 * Versão simplificada e otimizada
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
 * Verifica se um código de grupo existe
 * @param codigo Código a verificar
 * @returns true se o código existe, false caso contrário
 */
export const verificarSeCodigoExiste = async (codigo: string): Promise<boolean> => {
  if (!codigo || codigo.trim() === '') return false;

  try {
    const codigoNormalizado = codigo.trim().toUpperCase();

    // Verificar primeiro na tabela de códigos (mais eficiente)
    const { data, error } = await supabase
      .from('codigos_grupos_estudo')
      .select('codigo')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();

    if (error) {
      console.log("Aviso: Erro ao verificar na tabela de códigos, tentando na tabela de grupos");

      // Se falhar, verificar na tabela principal de grupos
      const { data: grupoData, error: grupoError } = await supabase
        .from('grupos_estudo')
        .select('codigo')
        .eq('codigo', codigoNormalizado)
        .maybeSingle();

      return !grupoError && !!grupoData;
    }

    return !!data;
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
  if (!codigo || codigo.trim() === '') return null;

  try {
    const codigoNormalizado = codigo.trim().toUpperCase();

    // Buscar grupo diretamente pelo código
    const { data, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();

    if (error || !data) {
      console.log("Grupo não encontrado diretamente. Tentando via tabela de códigos.");

      // Tentar via tabela de códigos
      const { data: codigoData, error: codigoError } = await supabase
        .from('codigos_grupos_estudo')
        .select('grupo_id')
        .eq('codigo', codigoNormalizado)
        .maybeSingle();

      if (codigoError || !codigoData) return null;

      // Buscar grupo pelo ID
      const { data: grupoData, error: grupoError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', codigoData.grupo_id)
        .maybeSingle();

      if (grupoError || !grupoData) return null;

      return {
        id: grupoData.id,
        codigo: grupoData.codigo,
        nome: grupoData.nome,
        descricao: grupoData.descricao,
        user_id: grupoData.user_id,
        privado: grupoData.privado,
        membros: grupoData.membros,
        visibilidade: grupoData.visibilidade,
        disciplina: grupoData.disciplina,
        cor: grupoData.cor,
        membros_ids: grupoData.membros_ids,
        data_criacao: grupoData.data_criacao,
        dataCriacao: grupoData.data_criacao
      };
    }

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
    console.error("Erro ao buscar grupo pelo código:", error);
    return null;
  }
};

/**
 * Verifica se um usuário tem relação com o grupo (criador ou membro)
 * @param codigo Código do grupo
 * @param userId ID do usuário
 * @returns Informações sobre a relação do usuário com o grupo
 */
export async function verificarRelacaoUsuarioComGrupo(codigo: string, userId: string) {
  if (!codigo || !userId) {
    return { grupoId: null, jaEMembro: false, pertenceAoUsuario: false, nomeGrupo: null };
  }

  try {
    const grupo = await buscarGrupoComCodigo(codigo);

    if (!grupo) {
      return { pertenceAoUsuario: false, jaEMembro: false, nomeGrupo: '', grupoId: null };
    }

    // Verificar se é o criador
    const pertenceAoUsuario = grupo.user_id === userId;

    // Verificar se é membro (na lista de membros)
    let membrosIds: string[] = [];
    try {
      membrosIds = Array.isArray(grupo.membros_ids) 
        ? grupo.membros_ids 
        : (typeof grupo.membros_ids === 'string' 
            ? JSON.parse(grupo.membros_ids as string) 
            : []);
    } catch (e) {
      membrosIds = [];
    }

    const jaEMembro = membrosIds.includes(userId);

    // Verificar no localStorage como backup
    let membroLocalStorage = false;
    try {
      if (typeof window !== 'undefined') {
        const gruposStorage = localStorage.getItem('epictus_grupos_estudo');
        if (gruposStorage) {
          const grupos = JSON.parse(gruposStorage);
          const grupoLocalStorage = grupos.find((g: any) => g.id === grupo.id);
          membroLocalStorage = !!grupoLocalStorage;
        }
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
 * @returns Código formatado no padrão XXXX-YYYY-ZZZZ
 */
export const gerarCodigoUnico = (): string => {
  // Caracteres permitidos (excluindo caracteres ambíguos como 0/O, 1/I)
  const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  // Gerar código
  let codigo = '';

  // Primeiro segmento (4 caracteres)
  for (let i = 0; i < 4; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }

  codigo += '-';

  // Segundo segmento (4 caracteres)
  for (let i = 0; i < 4; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }

  codigo += '-';

  // Terceiro segmento (4 caracteres)
  for (let i = 0; i < 4; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }

  return codigo;
};

/**
 * Salva um código de grupo no banco de dados e armazenamento local
 * @param grupoId ID do grupo
 * @param codigo Código a ser salvo
 * @returns true se salvo com sucesso, false caso contrário
 */
export const salvarCodigoGrupo = async (grupoId: string, codigo: string): Promise<boolean> => {
  if (!grupoId || !codigo) return false;

  try {
    const codigoNormalizado = codigo.toUpperCase();

    // Atualizar na tabela de grupos
    const { error } = await supabase
      .from('grupos_estudo')
      .update({ codigo: codigoNormalizado })
      .eq('id', grupoId);

    if (error) {
      console.error("Erro ao salvar código na tabela de grupos:", error);
      return false;
    }

    // Buscar dados completos do grupo para atualizar tabela de códigos
    const { data: grupo, error: grupoError } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('id', grupoId)
      .single();

    if (grupoError || !grupo) {
      console.error("Erro ao buscar dados do grupo para atualizar tabela de códigos:", grupoError);
      return false;
    }

    // Atualizar/inserir na tabela de códigos
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
      console.warn("Aviso: Erro ao atualizar tabela de códigos:", codigoError);
      // Não falhar completamente por causa disso
    }

    // Atualizar localStorage como backup
    try {
      if (typeof window !== 'undefined') {
        // Armazenamento de códigos
        const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
        const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
        codigosGrupos[grupoId] = codigoNormalizado;
        localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));

        // Atualizar nos grupos armazenados
        const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
        const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');
        const grupoIndex = grupos.findIndex((g: any) => g.id === grupoId);

        if (grupoIndex >= 0) {
          grupos[grupoIndex].codigo = codigoNormalizado;
          localStorage.setItem(GRUPOS_STORAGE_KEY, JSON.stringify(grupos));
        }
      }
    } catch (storageError) {
      console.warn("Aviso: Erro ao salvar código no localStorage:", storageError);
    }

    return true;
  } catch (error) {
    console.error("Erro ao salvar código de grupo:", error);
    return false;
  }
};

/**
 * Gera e salva um código único para um grupo
 * @param grupoId ID do grupo
 * @returns O código gerado
 */
export const gerarESalvarCodigoUnico = async (grupoId: string): Promise<string> => {
  try {
    // Verificar se o grupo já tem código
    const { data: grupoExistente, error: grupoError } = await supabase
      .from('grupos_estudo')
      .select('codigo')
      .eq('id', grupoId)
      .single();

    if (!grupoError && grupoExistente && grupoExistente.codigo) {
      console.log(`Grupo ${grupoId} já possui código ${grupoExistente.codigo}.`);
      return grupoExistente.codigo;
    }

    // Gerar um novo código único
    const codigo = gerarCodigoUnico();

    // Salvar o código
    const sucesso = await salvarCodigoGrupo(grupoId, codigo);

    if (!sucesso) {
      console.warn(`Aviso: Erro ao salvar código ${codigo} para grupo ${grupoId}.`);
    }

    return codigo;
  } catch (error) {
    console.error("Erro ao gerar e salvar código:", error);
    const fallbackCodigo = gerarCodigoUnico();
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

    // Preparar dados completos
    const dadosCompletos = {
      ...dados,
      codigo: codigo.toUpperCase(),
      data_criacao: new Date().toISOString()
    };

    // Inserir no banco de dados
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
      if (typeof window !== 'undefined') {
        const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
        const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');
        grupos.push(grupoLocal);
        localStorage.setItem(GRUPOS_STORAGE_KEY, JSON.stringify(grupos));
      }

      return grupoLocal;
    }

    // Adicionar na tabela de códigos
    try {
      await supabase
        .from('codigos_grupos_estudo')
        .upsert({
          codigo: codigo.toUpperCase(),
          grupo_id: data.id,
          nome: data.nome || 'Grupo sem nome',
          descricao: data.descricao || '',
          user_id: data.user_id,
          privado: data.privado || false,
          membros: data.membros || 1,
          visibilidade: data.visibilidade || 'todos',
          disciplina: data.disciplina || '',
          cor: data.cor || '#FF6B00',
          membros_ids: data.membros_ids || [],
          data_criacao: data.data_criacao || new Date().toISOString(),
          ultima_atualizacao: new Date().toISOString()
        }, { onConflict: 'codigo' });
    } catch (codigoError) {
      console.warn("Aviso: Erro ao adicionar código do grupo:", codigoError);
    }

    // Backup no localStorage
    if (typeof window !== 'undefined') {
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
  if (!userId) return [];

  try {
    // Lista para armazenar todos os grupos encontrados
    const todosGrupos = new Map<string, GrupoEstudo>();

    // Buscar grupos onde o usuário é criador ou membro
    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('*')
        .or(`user_id.eq.${userId},membros_ids.cs.{"${userId}"}`)
        .order('data_criacao', { ascending: false });

      if (!error && data && data.length > 0) {
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
      if (typeof window !== 'undefined') {
        const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
        const gruposLocal = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');

        gruposLocal
          .filter((g: any) => g.user_id === userId || g.criador === userId || 
                            (Array.isArray(g.membros_ids) && g.membros_ids.includes(userId)))
          .forEach((grupo: any) => {
            // Adicionar se não existir no mapa ou for um grupo local
            if (!todosGrupos.has(grupo.id) || grupo.id.startsWith('local_')) {
              todosGrupos.set(grupo.id, grupo);
            }
          });
      }
    } catch (storageError) {
      console.error("Erro ao buscar grupos no localStorage:", storageError);
    }

    return Array.from(todosGrupos.values());
  } catch (error) {
    console.error("Erro ao obter todos os grupos:", error);
    return [];
  }
};

/**
 * Sincroniza os códigos de grupos entre tabelas
 * @returns Resultado da sincronização
 */
export async function sincronizarCodigosGrupos() {
  console.log("Iniciando sincronização de códigos de grupos...");

  try {
    // Verificar tabelas
    try {
      const { error: errorGrupos } = await supabase
        .from('grupos_estudo')
        .select('id')
        .limit(1);

      if (errorGrupos) {
        console.error("Erro ao acessar tabela grupos_estudo:", errorGrupos);
        return { 
          success: false, 
          message: "Erro ao acessar tabela grupos_estudo. Execute o workflow 'Corrigir Tabelas de Grupos'.",
          total: 0, 
          sucessos: 0, 
          erros: 1, 
          ignorados: 0 
        };
      }

      const { error: errorCodigos } = await supabase
        .from('codigos_grupos_estudo')
        .select('codigo')
        .limit(1);

      if (errorCodigos) {
        console.error("Erro ao acessar tabela codigos_grupos_estudo:", errorCodigos);
        return { 
          success: false, 
          message: "Erro ao acessar tabela codigos_grupos_estudo. Execute o workflow 'Corrigir Tabelas de Grupos'.",
          total: 0, 
          sucessos: 0, 
          erros: 1, 
          ignorados: 0 
        };
      }
    } catch (error) {
      console.error("Erro ao verificar tabelas:", error);
      return { 
        success: false, 
        message: "Erro ao verificar tabelas. Execute o workflow 'Corrigir Tabelas de Grupos'.",
        total: 0, 
        sucessos: 0, 
        erros: 1, 
        ignorados: 0 
      };
    }

    // Etapa 1: Gerar códigos para grupos sem código
    const { data: gruposSemCodigo, error: errorBusca } = await supabase
      .from('grupos_estudo')
      .select('id, nome')
      .is('codigo', null);

    if (errorBusca) {
      console.error("Erro ao buscar grupos sem código:", errorBusca);
      return { 
        success: false, 
        message: "Erro ao buscar grupos sem código",
        total: 0, 
        sucessos: 0, 
        erros: 1, 
        ignorados: 0 
      };
    }

    console.log(`Encontrados ${gruposSemCodigo?.length || 0} grupos sem código`);

    let sucessosGeracao = 0;
    let errosGeracao = 0;

    // Gerar códigos para grupos sem código
    for (const grupo of gruposSemCodigo || []) {
      try {
        const codigo = gerarCodigoUnico();

        // Atualizar o grupo com o novo código
        const { error: updateError } = await supabase
          .from('grupos_estudo')
          .update({ codigo })
          .eq('id', grupo.id);

        if (updateError) {
          console.error(`Erro ao atualizar código para grupo ${grupo.id}:`, updateError);
          errosGeracao++;
        } else {
          console.log(`Código ${codigo} gerado para grupo ${grupo.id} (${grupo.nome || 'Sem nome'})`);
          sucessosGeracao++;
        }
      } catch (error) {
        console.error(`Erro ao gerar código para grupo ${grupo.id}:`, error);
        errosGeracao++;
      }
    }

    // Etapa 2: Sincronizar códigos entre tabelas
    const { data: gruposComCodigo, error: errorBuscaComCodigo } = await supabase
      .from('grupos_estudo')
      .select('*')
      .not('codigo', 'is', null);

    if (errorBuscaComCodigo) {
      console.error("Erro ao buscar grupos com código:", errorBuscaComCodigo);
      return { 
        success: false, 
        message: "Erro ao buscar grupos com código",
        total: gruposSemCodigo?.length || 0, 
        sucessos: sucessosGeracao, 
        erros: errosGeracao + 1, 
        ignorados: 0 
      };
    }

    console.log(`Encontrados ${gruposComCodigo?.length || 0} grupos com código para sincronizar`);

    let sucessosSincronizacao = 0;
    let errosSincronizacao = 0;
    let ignorados = 0;

    // Sincronizar códigos entre tabelas
    for (const grupo of gruposComCodigo || []) {
      try {
        if (!grupo.codigo) {
          console.log(`Grupo ${grupo.id} sem código. Ignorando.`);
          ignorados++;
          continue;
        }

        // Adicionar/atualizar na tabela de códigos
        const { error: upsertError } = await supabase
          .from('codigos_grupos_estudo')
          .upsert({
            codigo: grupo.codigo,
            grupo_id: grupo.id,
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

        if (upsertError) {
          console.error(`Erro ao sincronizar código ${grupo.codigo}:`, upsertError);
          errosSincronizacao++;
        } else {
          console.log(`Código ${grupo.codigo} sincronizado para grupo ${grupo.id} (${grupo.nome || 'Sem nome'})`);
          sucessosSincronizacao++;
        }
      } catch (error) {
        console.error(`Erro ao processar grupo ${grupo.id}:`, error);
        errosSincronizacao++;
      }
    }

    // Resultado final
    const totalSucessos = sucessosGeracao + sucessosSincronizacao;
    const totalErros = errosGeracao + errosSincronizacao;
    const totalProcessados = (gruposSemCodigo?.length || 0) + (gruposComCodigo?.length || 0);

    return {
      success: totalErros === 0,
      message: totalErros === 0 ? "Sincronização concluída com sucesso" : "Sincronização concluída com alguns erros",
      total: totalProcessados,
      sucessos: totalSucessos,
      erros: totalErros,
      ignorados
    };
  } catch (error) {
    console.error("Erro durante a sincronização:", error);
    return { 
      success: false, 
      message: "Erro durante a sincronização de códigos",
      total: 0, 
      sucessos: 0, 
      erros: 1, 
      ignorados: 0 
    };
  }
}

/**
 * Gera um código único para um grupo
 * @param {string} grupoId - ID do grupo
 * @returns {Promise<string>} Código único no formato XXXX-YYYY-ZZZZ
 */
export async function gerarCodigoUnicoGrupo(grupoId: string): Promise<string> {
  const tentativasMaximas = 5;
  let tentativas = 0;

  while (tentativas < tentativasMaximas) {
    // Gerar código aleatório
    const codigo = gerarCodigoAleatorio();

    // Verificar se o código já existe
    const { data, error } = await supabase
      .from('codigos_grupos_estudo')
      .select('codigo')
      .eq('codigo', codigo)
      .maybeSingle();

    if (error) {
      console.error("Erro ao verificar código:", error);
      // Continuar tentando mesmo com erro
    } else if (!data) {
      // Código não existe, podemos usá-lo
      return codigo;
    }

    tentativas++;
  }

  // Se chegou aqui, todas as tentativas falharam
  // Gerar um código com timestamp para garantir unicidade
  return `${gerarCodigoAleatorio().substring(0, 4)}-${Date.now().toString(36).substring(5)}`;
}

/**
 * Gera um código aleatório no formato XXXX-YYYY-ZZZZ
 * @returns {string} Código aleatório
 */
function gerarCodigoAleatorio(): string {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removidos caracteres ambíguos
  let codigo = '';

  // Primeira parte (4 caracteres)
  for (let i = 0; i < 4; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }

  // Adicionar hífen
  codigo += '-';

  // Segunda parte (4 caracteres)
  for (let i = 0; i < 4; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }

  // Adicionar hífen
  codigo += '-';

  // Terceira parte (4 caracteres)
  for (let i = 0; i < 4; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }

  return codigo;
}