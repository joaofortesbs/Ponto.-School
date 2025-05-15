/**
 * Utilitários para gerenciar códigos dos grupos de estudo
 * Versão simplificada e melhorada
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
  if (!codigo || codigo.trim() === '') return false;

  try {
    const codigoNormalizado = codigo.trim().toUpperCase();

    // Verificar na tabela de códigos (mais otimizado)
    const { data: codigoDados, error: codigoError } = await supabase
      .from('codigos_grupos_estudo')
      .select('codigo')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();

    if (!codigoError && codigoDados) {
      return true;
    }

    // Se não encontrar ou houver erro, verificar na tabela de grupos
    const { data: grupoDados, error: grupoError } = await supabase
      .from('grupos_estudo')
      .select('id')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();

    return !grupoError && !!grupoDados;
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

    // Buscar diretamente na tabela de grupos
    const { data, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar grupo por código:", error);

      // Tentar alternativa: buscar na tabela de códigos e depois o grupo
      const { data: codigoDados, error: codigoError } = await supabase
        .from('codigos_grupos_estudo')
        .select('grupo_id')
        .eq('codigo', codigoNormalizado)
        .maybeSingle();

      if (codigoError || !codigoDados) {
        return null;
      }

      // Buscar o grupo pelo ID
      const { data: grupoDados, error: grupoError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', codigoDados.grupo_id)
        .maybeSingle();

      if (grupoError || !grupoDados) {
        return null;
      }

      return {
        id: grupoDados.id,
        codigo: grupoDados.codigo,
        nome: grupoDados.nome,
        descricao: grupoDados.descricao,
        user_id: grupoDados.user_id,
        privado: grupoDados.privado,
        membros: grupoDados.membros,
        visibilidade: grupoDados.visibilidade,
        disciplina: grupoDados.disciplina,
        cor: grupoDados.cor,
        membros_ids: grupoDados.membros_ids,
        data_criacao: grupoDados.data_criacao,
        dataCriacao: grupoDados.data_criacao
      };
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
export async function verificarRelacaoUsuarioComGrupo(codigo: string, userId: string) {
  if (!codigo) {
    return { grupoId: null, jaEMembro: false, pertenceAoUsuario: false, nomeGrupo: null };
  }

  if (!userId) {
    console.error("UserId não fornecido para verificarRelacaoUsuarioComGrupo");
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
export const salvarCodigoGrupo = async (grupoId: string, codigo: string): Promise<boolean> => {
  if (!grupoId || !codigo) return false;

  try {
    const codigoNormalizado = codigo.toUpperCase();

    // Salvar no banco de dados
    const { error } = await supabase
      .from('grupos_estudo')
      .update({ codigo: codigoNormalizado })
      .eq('id', grupoId);

    if (error) {
      console.error("Erro ao salvar código no banco:", error);
      return false;
    }

    // Atualizar também na tabela de códigos
    try {
      // Buscar dados completos do grupo
      const { data: grupo, error: grupoError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', grupoId)
        .single();

      if (!grupoError && grupo) {
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
          console.warn("Aviso: Erro ao salvar na tabela de códigos:", codigoError);
        }
      }
    } catch (codigoTabError) {
      console.warn("Aviso: Erro ao atualizar tabela de códigos:", codigoTabError);
    }

    // Salvar no localStorage como backup
    try {
      if (typeof window !== 'undefined') {
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
      }
    } catch (storageError) {
      console.error("Erro ao salvar código no localStorage:", storageError);
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
      if (typeof window !== 'undefined') {
        const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
        const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');
        grupos.push(grupoLocal);
        localStorage.setItem(GRUPOS_STORAGE_KEY, JSON.stringify(grupos));
      }

      return grupoLocal;
    }

    // Grupo criado com sucesso no Supabase
    if (data) {
      // Adicionar/atualizar na tabela de códigos
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
        console.warn("Aviso: Erro ao sincronizar código do grupo:", codigoError);
      }

      // Backup no localStorage
      if (typeof window !== 'undefined') {
        const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
        const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');
        grupos.push(data);
        localStorage.setItem(GRUPOS_STORAGE_KEY, JSON.stringify(grupos));
      }
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

    // Buscar grupos no banco de dados
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
            // Apenas adicionar se ainda não existir ou for um grupo local
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
 * Sincroniza os códigos de grupos local e remotamente
 * Útil quando há grupos criados offline
 */
export async function sincronizarCodigosGrupos() {
  console.log("Iniciando sincronização de códigos de grupos");

  try {
    // Verificar se a tabela existe antes
    try {
      const { error: checkError } = await supabase
        .from('codigos_grupos_estudo')
        .select('codigo')
        .limit(1);

      if (checkError && checkError.code === '42P01') {
        console.error("Tabela codigos_grupos_estudo não existe!");
        return { 
          success: false, 
          message: "Tabela de códigos não existe. Execute o workflow 'Corrigir Tabelas de Grupos'.",
          total: 0,
          sucessos: 0,
          erros: 1,
          ignorados: 0
        };
      }
    } catch (checkError) {
      console.error("Erro ao verificar tabela:", checkError);
      return { 
        success: false, 
        message: "Erro ao verificar tabela de códigos",
        total: 0,
        sucessos: 0,
        erros: 1,
        ignorados: 0
      };
    }

    // Buscar todos os grupos
    const { data: grupos, error } = await supabase
      .from('grupos_estudo')
      .select('*');

    if (error) {
      console.error("Erro ao buscar grupos:", error);
      return { 
        success: false, 
        message: "Erro ao buscar grupos",
        total: 0,
        sucessos: 0,
        erros: 1,
        ignorados: 0
      };
    }

    console.log(`Encontrados ${grupos?.length || 0} grupos para sincronizar`);

    // Sincronizar códigos
    let sucessos = 0;
    let erros = 0;
    let ignorados = 0;
    let atualizados = 0;
    let adicionados = 0;

    // Processar grupos sem código primeiro
    for (const grupo of (grupos || []).filter(g => !g.codigo)) {
      try {
        // Gerar código único para o grupo
        const novoCodigo = await gerarCodigoUnicoGrupo(grupo.id);

        // Atualizar o grupo com o novo código
        const { error: updateError } = await supabase
          .from('grupos_estudo')
          .update({ codigo: novoCodigo })
          .eq('id', grupo.id);

        if (updateError) {
          console.error(`Erro ao gerar código para grupo ${grupo.id}:`, updateError);
          erros++;
        } else {
          console.log(`Código ${novoCodigo} gerado para grupo ${grupo.id} (${grupo.nome})`);

          // Adicionar à tabela de códigos
          const { error: insertError } = await supabase
            .from('codigos_grupos_estudo')
            .insert({
              codigo: novoCodigo,
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
            });

          if (insertError) {
            console.error(`Erro ao inserir código ${novoCodigo} na tabela de códigos:`, insertError);
            erros++;
          } else {
            adicionados++;
            sucessos++;
          }
        }
      } catch (grupoError) {
        console.error(`Erro ao processar grupo sem código ${grupo.id}:`, grupoError);
        erros++;
      }
    }

    // Processar grupos com código
    for (const grupo of (grupos || []).filter(g => g.codigo)) {
      try {
        // Verificar se o código já existe na tabela de códigos
        const { data: codigoExistente, error: checkError } = await supabase
          .from('codigos_grupos_estudo')
          .select('codigo')
          .eq('codigo', grupo.codigo)
          .maybeSingle();

        if (checkError) {
          console.error(`Erro ao verificar código ${grupo.codigo}:`, checkError);
          erros++;
          continue;
        }

        // Se não existir, inserir novo registro
        if (!codigoExistente) {
          const { error: insertError } = await supabase
            .from('codigos_grupos_estudo')
            .insert({
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
            });

          if (insertError) {
            console.error(`Erro ao sincronizar código ${grupo.codigo}:`, insertError);
            erros++;
          } else {
            console.log(`Código ${grupo.codigo} adicionado para grupo ${grupo.id} (${grupo.nome})`);
            adicionados++;
            sucessos++;
          }
        } else {
          // Se já existir, atualizar informações
          const { error: updateError } = await supabase
            .from('codigos_grupos_estudo')
            .update({
              nome: grupo.nome || 'Grupo sem nome',
              descricao: grupo.descricao || '',
              user_id: grupo.user_id,
              privado: grupo.privado || false,
              membros: grupo.membros || 1,
              visibilidade: grupo.visibilidade || 'todos',
              disciplina: grupo.disciplina || '',
              cor: grupo.cor || '#FF6B00',
              membros_ids: grupo.membros_ids || [],
              ultima_atualizacao: new Date().toISOString()
            })
            .eq('codigo', grupo.codigo);

          if (updateError) {
            console.error(`Erro ao atualizar código ${grupo.codigo}:`, updateError);
            erros++;
          } else {
            console.log(`Código ${grupo.codigo} atualizado para grupo ${grupo.id} (${grupo.nome})`);
            atualizados++;
            sucessos++;
          }
        }
      } catch (grupoError) {
        console.error(`Erro ao processar grupo ${grupo.id}:`, grupoError);
        erros++;
      }
    }

    console.log(`Sincronização concluída!`);
    console.log(`Total de grupos: ${grupos?.length || 0}`);
    console.log(`Novos códigos gerados: ${adicionados}`);
    console.log(`Códigos atualizados: ${atualizados}`);
    console.log(`Sucessos totais: ${sucessos}`);
    console.log(`Erros: ${erros}`);
    console.log(`Ignorados: ${ignorados}`);

    return {
      success: erros === 0,
      message: erros === 0 ? "Sincronização concluída com sucesso" : "Sincronização concluída com erros",
      total: (grupos || []).length,
      sucessos,
      erros,
      ignorados
    };
  } catch (error) {
    console.error("Erro ao sincronizar códigos:", error);
    return { 
      success: false, 
      message: "Erro ao sincronizar códigos",
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