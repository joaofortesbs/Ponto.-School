/**
 * Utilitários para gerenciar códigos dos grupos de estudo
 * Este arquivo centraliza operações comuns relacionadas aos códigos dos grupos
 */
import { supabase } from '@/lib/supabase';
import { gerarCodigoUnico, salvarCodigoNoBanco, buscarGrupoPorCodigo } from './codigosGruposService';

/**
 * Obtém um código de grupo existente de várias fontes
 * @param grupoId - ID do grupo para buscar o código
 * @returns O código encontrado ou null se não existir
 */
export const obterCodigoGrupoExistente = async (grupoId: string): Promise<string | null> => {
  if (!grupoId) return null;

  try {
    // 1. Verificar primeiro no banco de dados central (principal)
    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('codigo')
        .eq('id', grupoId)
        .single();

      if (!error && data?.codigo) {
        console.log(`Código recuperado do banco de dados: ${data.codigo}`);

        // Salvar em storages locais como backup
        salvarCodigoEmStoragesLocais(grupoId, data.codigo);

        return data.codigo;
      }
    } catch (dbError) {
      console.error('Erro ao buscar código no banco de dados:', dbError);
    }

    // 2. Verificar no armazenamento dedicado para códigos (local)
    const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
    const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');

    if (codigosGrupos[grupoId]) {
      console.log(`Código recuperado do storage dedicado: ${codigosGrupos[grupoId]}`);

      // Tentar sincronizar com o banco de dados
      try {
        await supabase
          .from('grupos_estudo')
          .update({ codigo: codigosGrupos[grupoId] })
          .eq('id', grupoId);
      } catch (syncError) {
        console.error('Erro ao sincronizar código com banco de dados:', syncError);
      }

      return codigosGrupos[grupoId];
    }

    // 3. Verificar no localStorage de grupos
    const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
    const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');
    const grupo = grupos.find((g: any) => g.id === grupoId);

    if (grupo?.codigo) {
      console.log(`Código recuperado do localStorage: ${grupo.codigo}`);

      // Aproveitar para salvar no storage dedicado
      codigosGrupos[grupoId] = grupo.codigo;
      localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));

      // Tentar sincronizar com o banco de dados
      try {
        await supabase
          .from('grupos_estudo')
          .update({ codigo: grupo.codigo })
          .eq('id', grupoId);
      } catch (syncError) {
        console.error('Erro ao sincronizar código com banco de dados:', syncError);
      }

      return grupo.codigo;
    }

    // 4. Verificar na sessionStorage (mecanismo de recuperação)
    const sessionCodigo = sessionStorage.getItem(`grupo_codigo_${grupoId}`);
    if (sessionCodigo) {
      console.log(`Código recuperado da sessionStorage: ${sessionCodigo}`);

      // Sincronizar com outros armazenamentos
      salvarCodigoEmStoragesLocais(grupoId, sessionCodigo);

      // Tentar sincronizar com o banco de dados
      try {
        await supabase
          .from('grupos_estudo')
          .update({ codigo: sessionCodigo })
          .eq('id', grupoId);
      } catch (syncError) {
        console.error('Erro ao sincronizar código com banco de dados:', syncError);
      }

      return sessionCodigo;
    }
  } catch (error) {
    console.error('Erro ao buscar código de grupo:', error);
  }

  return null;
};

/**
 * Salva um código de grupo em múltiplas camadas de armazenamento
 * @param grupoId - ID do grupo
 * @param codigo - Código a ser salvo
 */
export const salvarCodigoGrupo = async (grupoId: string, codigo: string): Promise<void> => {
  if (!grupoId || !codigo) return;

  const codigoNormalizado = codigo.toUpperCase();

  try {
    // 1. Salvar no banco de dados central
    try {
      // Primeiro buscar os dados do grupo
      const { data: grupoData, error: grupoError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', grupoId)
        .single();

      if (!grupoError && grupoData) {
        // Atualizar o código no grupo
        const { error: updateError } = await supabase
          .from('grupos_estudo')
          .update({ codigo: codigoNormalizado })
          .eq('id', grupoId);

        if (updateError) {
          console.error('Erro ao atualizar código no grupo:', updateError);
        } else {
          console.log(`Código ${codigoNormalizado} atualizado com sucesso no grupo ${grupoId}`);
        }

        // Garantir que o código está na tabela central de códigos (independente do trigger)
        const { error: codigoError } = await supabase
          .from('codigos_grupos_estudo')
          .upsert({
            codigo: codigoNormalizado,
            grupo_id: grupoId,
            nome: grupoData.nome,
            descricao: grupoData.descricao || '',
            user_id: grupoData.user_id,
            privado: grupoData.privado || false,
            membros: grupoData.membros || 1,
            visibilidade: grupoData.visibilidade || 'todos',
            disciplina: grupoData.disciplina || '',
            cor: grupoData.cor || '#FF6B00',
            membros_ids: grupoData.membros_ids || [],
            ultima_atualizacao: new Date().toISOString()
          }, { onConflict: 'codigo' });

        if (codigoError) {
          console.error('Erro ao salvar na tabela central de códigos:', codigoError);
        } else {
          console.log(`Código ${codigoNormalizado} salvo com sucesso na tabela central`);
        }
      } else {
        // Se não encontrar o grupo, tentar salvar o código com dados mínimos
        console.warn(`Grupo ${grupoId} não encontrado. Tentando salvar código com dados mínimos.`);
        
        // Buscar informações básicas no localStorage
        const grupos = JSON.parse(localStorage.getItem('epictus_grupos_estudo') || '[]');
        const grupoLocal = grupos.find((g: any) => g.id === grupoId);
        
        if (grupoLocal) {
          const { error: codigoMinError } = await supabase
            .from('codigos_grupos_estudo')
            .upsert({
              codigo: codigoNormalizado,
              grupo_id: grupoId,
              nome: grupoLocal.nome || 'Grupo de Estudo',
              descricao: grupoLocal.descricao || '',
              user_id: grupoLocal.user_id,
              privado: grupoLocal.privado || false,
              membros: grupoLocal.membros || 1,
              visibilidade: grupoLocal.visibilidade || 'todos',
              disciplina: grupoLocal.disciplina || '',
              cor: grupoLocal.cor || '#FF6B00',
              membros_ids: grupoLocal.membros_ids || []
            }, { onConflict: 'codigo' });
            
          if (codigoMinError) {
            console.error('Erro ao salvar código mínimo na tabela central:', codigoMinError);
          } else {
            console.log(`Código ${codigoNormalizado} salvo com dados mínimos na tabela central`);
          }
        } else {
          console.error(`Não foi possível encontrar informações para o grupo ${grupoId}`);
        }
      }
    } catch (dbError) {
      console.error('Erro ao salvar código no banco de dados:', dbError);
    }

    // 2. Salvar em armazenamentos locais como backup
    salvarCodigoEmStoragesLocais(grupoId, codigoNormalizado);

    console.log(`Código ${codigoNormalizado} salvo com sucesso para o grupo ${grupoId}`);
  } catch (error) {
    console.error('Erro ao salvar código de grupo:', error);
  }
};

/**
 * Função auxiliar para salvar o código em armazenamentos locais
 * @param grupoId - ID do grupo
 * @param codigo - Código a ser salvo
 */
const salvarCodigoEmStoragesLocais = (grupoId: string, codigo: string): void => {
  try {
    // Salvar no armazenamento dedicado para códigos
    const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
    const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
    codigosGrupos[grupoId] = codigo.toUpperCase();
    localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));

    // Salvar no localStorage de grupos
    const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
    const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');
    const grupoIndex = grupos.findIndex((g: any) => g.id === grupoId);

    if (grupoIndex >= 0) {
      grupos[grupoIndex].codigo = codigo.toUpperCase();
      localStorage.setItem(GRUPOS_STORAGE_KEY, JSON.stringify(grupos));
    }

    // Salvar na sessionStorage para recuperação rápida
    sessionStorage.setItem(`grupo_codigo_${grupoId}`, codigo.toUpperCase());
  } catch (error) {
    console.error('Erro ao salvar código em armazenamentos locais:', error);
  }
};

/**
 * Gerar um código único para um grupo e salvar em todos os armazenamentos
 * @param grupoId - ID do grupo para o qual gerar código
 * @returns O código gerado
 */
export const gerarESalvarCodigoUnico = async (grupoId: string): Promise<string> => {
  try {
    // Primeiro verificar se já existe um código
    const codigoExistente = await obterCodigoGrupoExistente(grupoId);
    if (codigoExistente) {
      console.log(`Grupo ${grupoId} já possui o código ${codigoExistente}`);
      return codigoExistente;
    }

    console.log(`Gerando novo código para o grupo ${grupoId}...`);

    // Gerar um novo código único
    const novoCodigo = await gerarCodigoUnico();

    // Salvar o código em todos os lugares
    await salvarCodigoGrupo(grupoId, novoCodigo);

    console.log(`Novo código ${novoCodigo} gerado e salvo para o grupo ${grupoId}`);
    return novoCodigo;
  } catch (error) {
    console.error('Erro ao gerar e salvar código único:', error);

    // Fallback para garantir que sempre retornamos algo
    const fallbackCodigo = Array(7)
      .fill(0)
      .map(() => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 32)))
      .join('');

    try {
      await salvarCodigoGrupo(grupoId, fallbackCodigo);
    } catch (fallbackError) {
      console.error('Erro ao salvar código fallback:', fallbackError);
    }

    return fallbackCodigo;
  }
};

/**
 * Verifica se um código existe em qualquer grupo
 * @param codigo - Código a ser verificado
 * @returns true se o código existir em algum grupo
 */
export const verificarCodigoExiste = async (codigo: string): Promise<boolean> => {
  if (!codigo) return false;

  try {
    // Normalizar o código para comparação
    const codigoNormalizado = codigo.trim().toUpperCase();

    // Verificar no banco de dados central (principal)
    try {
      const { data, error } = await supabase
        .from('codigos_grupos_estudo')
        .select('codigo')
        .eq('codigo', codigoNormalizado)
        .single();

      if (!error && data) {
        console.log(`Código ${codigoNormalizado} encontrado no banco de dados central`);
        return true;
      }
    } catch (dbError) {
      console.error('Erro ao verificar código no banco de dados:', dbError);
    }

    // Verificar no armazenamento dedicado como fallback
    const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
    const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');

    // Verificar se o código existe como valor em qualquer entrada
    if (Object.values(codigosGrupos).some((c: any) => 
      c.toUpperCase() === codigoNormalizado)) {
      console.log(`Código ${codigoNormalizado} encontrado no storage local dedicado`);
      return true;
    }

    // Verificar também no localStorage de grupos
    const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
    const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');

    if (grupos.some((g: any) => 
      g.codigo && g.codigo.toUpperCase() === codigoNormalizado)) {
      console.log(`Código ${codigoNormalizado} encontrado no storage local de grupos`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Erro ao verificar existência de código:', error);
    return false;
  }
};

/**
 * Busca um grupo pelo seu código
 * @param codigo - Código do grupo a ser buscado
 * @returns O grupo encontrado ou null
 */
export const buscarGrupoComCodigo = async (codigo: string): Promise<any | null> => {
  if (!codigo) return null;

  try {
    // Normalizar o código
    const codigoNormalizado = codigo.trim().toUpperCase();

    // Buscar diretamente na tabela de códigos
    const { data, error } = await supabase
      .from('codigos_grupos_estudo')
      .select('*')
      .eq('codigo', codigoNormalizado)
      .single();

    if (error) {
      console.error('Erro ao buscar código no banco de dados:', error);

      // Fallback: buscar nos armazenamentos locais
      const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
      const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');

      const grupoEncontrado = grupos.find((g: any) => 
        g.codigo && g.codigo.toUpperCase() === codigoNormalizado);

      if (grupoEncontrado) {
        console.log(`Grupo para código ${codigoNormalizado} encontrado no armazenamento local`, grupoEncontrado);
        return grupoEncontrado;
      }

      return null;
    }

    if (!data) {
      console.log(`Nenhum grupo encontrado para o código ${codigoNormalizado}`);
      return null;
    }

    // Com o grupo_id do código, buscar informações completas na tabela grupos_estudo
    const { data: grupoCompleto, error: grupoError } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('id', data.grupo_id)
      .single();

    if (!grupoError && grupoCompleto) {
      console.log(`Grupo completo para código ${codigoNormalizado} encontrado:`, grupoCompleto);

      // Mesclamos os dados para ter informações completas
      return {
        ...grupoCompleto,
        codigo: codigoNormalizado
      };
    }

    // Se não encontrar na tabela principal, retornamos os dados da tabela de códigos
    console.log(`Informações parciais do grupo para código ${codigoNormalizado} encontradas na tabela de códigos`);
    return data;
  } catch (error) {
    console.error('Erro ao buscar grupo por código:', error);
    return null;
  }
};

// Verifica se um código de grupo existe no banco de dados
export const verificarSeCodigoExiste = async (codigo: string): Promise<boolean> => {
  try {
    if (!codigo || codigo.trim() === '') {
      return false;
    }

    const codigoNormalizado = codigo.trim().toUpperCase();

    // Consulta real no banco de dados
    const { data, error } = await supabase
      .from('codigos_grupos_estudo')
      .select('codigo')
      .eq('codigo', codigoNormalizado)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Código para 'not found'
        console.log(`Código ${codigoNormalizado} não encontrado no banco de dados`);
        return false;
      }
      console.error("Erro ao verificar código:", error);
      return false;
    }

    console.log(`Código ${codigoNormalizado} encontrado no banco de dados!`);
    return !!data;
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    return false;
  }
};

// Gera um código único para um grupo
export const gerarCodigoGrupo = (): string => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
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

// Registra um novo código de grupo no banco de dados
export const registrarCodigoGrupo = async (grupoId: string): Promise<string | null> => {
  try {
    const codigo = gerarCodigoGrupo();

    // Aqui seria feito o registro real no banco de dados
    // Exemplo de implementação real:
    /*
    const { data, error } = await supabase
      .from('codigos_grupos')
      .insert({
        codigo,
        grupo_id: grupoId,
        ativo: true,
        data_criacao: new Date(),
        data_expiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
      });

    if (error) {
      console.error("Erro ao registrar código:", error);
      return null;
    }
    */

    return codigo;
  } catch (error) {
    console.error("Erro ao registrar código:", error);
    return null;
  }
};

export const criarGrupo = async (dados: Omit<GrupoEstudo, 'id'>): Promise<GrupoEstudo | null> => {
  try {
    // Verificar se estamos online e tem conexão com Supabase
    let grupoSalvoRemotamente = false;
    let resultado: GrupoEstudo | null = null;

    try {
      // Gerar um código único para o grupo antes da inserção
      const codigo = await gerarCodigoUnico();
      
      // Adicionar o código ao objeto de dados
      const dadosComCodigo = {
        ...dados,
        codigo: codigo.toUpperCase()
      };

      // Tentar inserir no Supabase
      const { data, error } = await supabase
        .from('grupos_estudo')
        .insert(dadosComCodigo)
        .select('*')
        .single();

      if (!error && data) {
        console.log('Grupo criado com sucesso no Supabase:', data);
        grupoSalvoRemotamente = true;
        resultado = data;

        // Garantir que o código seja salvo na tabela de códigos de grupos
        try {
          const { error: codigoError } = await supabase
            .from('codigos_grupos_estudo')
            .upsert({
              codigo: data.codigo,
              grupo_id: data.id,
              nome: data.nome,
              descricao: data.descricao || '',
              user_id: data.user_id,
              privado: data.privado || false,
              membros: data.membros || 1,
              visibilidade: data.visibilidade || 'todos',
              disciplina: data.disciplina || '',
              cor: data.cor || '#FF6B00',
              membros_ids: data.membros_ids || []
            }, { onConflict: 'codigo' });

          if (codigoError) {
            console.error('Erro ao salvar código na tabela central:', codigoError);
          } else {
            console.log(`Código ${data.codigo} salvo com sucesso na tabela central de códigos`);
          }
        } catch (codigoError) {
          console.error('Erro ao processar salvamento do código:', codigoError);
        }

        // Salvar também no storage local para acesso rápido
        salvarGrupoLocal(data);
        return data;
      }
    } catch (supabaseError) {
      console.error('Erro ao criar grupo no Supabase:', supabaseError);
    }

    // Se chegou aqui, não conseguiu salvar no Supabase
    if (!grupoSalvoRemotamente) {
      console.log('Salvando grupo apenas localmente devido a falha no Supabase');

      // Gerar ID localmente
      const id = `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Gerar um código único para o grupo
      const codigo = await gerarCodigoUnico();

      // Criar grupo para armazenamento local
      const grupoLocal: GrupoEstudo = {
        ...dados,
        id,
        codigo: codigo.toUpperCase()
      };

      // Salvar localmente (apenas uma vez)
      salvarGrupoLocal(grupoLocal);
      resultado = grupoLocal;

      // Tentar salvar o código no banco de dados central, mesmo que o grupo seja local
      try {
        const { error: codigoError } = await supabase
          .from('codigos_grupos_estudo')
          .upsert({
            codigo: codigo.toUpperCase(),
            grupo_id: id,
            nome: dados.nome,
            descricao: dados.descricao || '',
            user_id: dados.user_id,
            privado: dados.privado || false,
            membros: dados.membros || 1,
            visibilidade: dados.visibilidade || 'todos',
            disciplina: dados.disciplina || '',
            cor: dados.cor || '#FF6B00',
            membros_ids: dados.membros_ids || []
          }, { onConflict: 'codigo' });

        if (codigoError) {
          console.error('Erro ao salvar código local na tabela central:', codigoError);
        } else {
          console.log(`Código ${codigo} de grupo local salvo com sucesso na tabela central`);
        }
      } catch (codigoError) {
        console.error('Erro ao processar salvamento do código local:', codigoError);
      }

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
    }

    return resultado;
  } catch (error) {
    console.error('Erro crítico ao criar grupo:', error);
    // Falha total, retornar nulo
    return null;
  }
};

const STORAGE_KEY = 'epictus_grupos_estudo';

// Função para salvar um grupo localmente
const salvarGrupoLocal = (grupo: GrupoEstudo): void => {
  try {
    // Obter grupos existentes
    const gruposExistentes = obterGruposLocal();

    // Verificar se o grupo já existe (para evitar duplicações)
    const grupoIndex = gruposExistentes.findIndex(g => g.id === grupo.id);

    if (grupoIndex >= 0) {
      // Grupo já existe, atualizar
      gruposExistentes[grupoIndex] = grupo;
    } else {
      // Grupo não existe, adicionar
      gruposExistentes.push(grupo);
    }

    // Salvar no localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gruposExistentes));

    // Backup na sessão (útil em navegações)
    sessionStorage.setItem(`${STORAGE_KEY}_session`, JSON.stringify(gruposExistentes));

    // Backup emergencial (para casos extremos)
    const chaveEmergencia = `${STORAGE_KEY}_emergency_${Date.now()}`;
    localStorage.setItem(chaveEmergencia, JSON.stringify([grupo]));

    // Limitar backups emergenciais (manter apenas os 5 mais recentes)
    const todasChaves = Object.keys(localStorage);
    const chavesEmergencia = todasChaves
      .filter(chave => chave.startsWith(`${STORAGE_KEY}_emergency_`))
      .sort()
      .slice(0, -5);

    chavesEmergencia.forEach(chave => localStorage.removeItem(chave));

    console.log('Grupo salvo localmente:', grupo);
  } catch (error) {
    console.error('Erro ao salvar grupo localmente:', error);
  }
};

// Função para obter todos os grupos locais
const obterGruposLocal = (): GrupoEstudo[] => {
  try {
    const gruposStr = localStorage.getItem(STORAGE_KEY) || '[]';
    return JSON.parse(gruposStr);
  } catch (error) {
    console.error('Erro ao obter grupos locais:', error);
    return [];
  }
};

export const obterTodosGrupos = async (userId: string): Promise<GrupoEstudo[]> => {
  try {
    // Obter a lista de grupos removidos
    const gruposRemovidosKey = 'grupos_removidos';
    const gruposRemovidosStr = localStorage.getItem(gruposRemovidosKey) || '[]';
    const gruposRemovidos = JSON.parse(gruposRemovidosStr);

    // Primeiro, garantir que temos os grupos locais (failsafe), excluindo os removidos
    let gruposLocais = obterGruposLocal()
      .filter(grupo => 
        grupo.user_id === userId && 
        !gruposRemovidos.includes(grupo.id)
      );

    // Criar um Map para rastreamento fácil de IDs
    const gruposMap = new Map<string, GrupoEstudo>();

    // Adicionar grupos locais ao Map
    gruposLocais.forEach(grupo => {
      gruposMap.set(grupo.id, grupo);
    });

    // Tentar obter backup da sessão
    try {
      const backupSessao = sessionStorage.getItem(`${STORAGE_KEY}_session`);
      if (backupSessao) {
        const gruposSessao = JSON.parse(backupSessao);
        console.log('Backup de sessão encontrado com', gruposSessao.length, 'grupos');

        // Adicionar apenas grupos que não estão no Map e não foram removidos
        gruposSessao
          .filter((g: GrupoEstudo) => 
            g.user_id === userId && 
            !gruposMap.has(g.id) && 
            !gruposRemovidos.includes(g.id)
          )
          .forEach((g: GrupoEstudo) => {
            gruposMap.set(g.id, g);
          });

        // Atualizar localStorage com os dados combinados
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(gruposMap.values())));
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
        return Array.from(gruposMap.values());
      }

      // Adicionar grupos do Supabase que não estão no Map e não foram removidos
      gruposSupabase
        .filter(grupo => !gruposRemovidos.includes(grupo.id))
        .forEach(grupo => {
          // Se já existe um grupo local com esse ID, o do Supabase tem prioridade
          gruposMap.set(grupo.id, grupo);
        });

      // Salvar apenas os grupos locais (que começam com 'local_')
      const apenasGruposLocais = Array.from(gruposMap.values())
        .filter(g => g.id.startsWith('local_'))
        .filter(g => !gruposRemovidos.includes(g.id));

      // Se houver alguma diferença, atualizar armazenamento local
      if (apenasGruposLocais.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(apenasGruposLocais));
      }

      return Array.from(gruposMap.values());
    } catch (supabaseError) {
      console.error('Erro ao acessar Supabase:', supabaseError);
      return Array.from(gruposMap.values());
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
        // Usar Map para evitar duplicações
        const gruposEmergenciaMap = new Map<string, GrupoEstudo>();

        for (const chave of chavesEmergencia) {
          try {
            const gruposChave = JSON.parse(localStorage.getItem(chave) || '[]');
            gruposChave.forEach((g: GrupoEstudo) => {
              if (g.user_id === userId && !gruposRemovidos.includes(g.id)) {
                gruposEmergenciaMap.set(g.id, g);
              }
            });
          } catch (e) {
            console.error('Erro ao recuperar backup de emergência:', e);
          }
        }

        return Array.from(gruposEmergenciaMap.values());
      }
    } catch (recoveryError) {
      console.error('Erro na recuperação de emergência:', recoveryError);
    }

    // Último recurso: retornar array vazio
    return [];
  }
};