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
  if (!codigo) {
    console.log('Código vazio, retornando null');
    return null;
  }

  try {
    // Normalizar o código
    const codigoNormalizado = codigo.trim().toUpperCase();
    console.log(`Buscando grupo com código: ${codigoNormalizado}`);

    // ETAPA 1: Buscar diretamente na tabela de códigos
    let grupoEncontrado = null;

    try {
      const { data: dataCodigos, error: codigosError } = await supabase
        .from('codigos_grupos_estudo')
        .select('*')
        .eq('codigo', codigoNormalizado)
        .maybeSingle();

      if (codigosError) {
        console.error('Erro ao buscar na tabela de códigos:', codigosError);
      } else if (dataCodigos) {
        console.log('Grupo encontrado na tabela de códigos:', dataCodigos);
        grupoEncontrado = dataCodigos;

        // Tentar complementar dados da tabela principal
        try {
          const { data: grupoCompleto, error: grupoError } = await supabase
            .from('grupos_estudo')
            .select('*')
            .eq('id', dataCodigos.grupo_id)
            .single();

          if (!grupoError && grupoCompleto) {
            console.log('Dados complementares encontrados na tabela de grupos:', grupoCompleto);

            // Mesclamos os dados para ter informações completas
            grupoEncontrado = {
              ...grupoCompleto,
              ...dataCodigos,
              codigo: codigoNormalizado
            };
          }
        } catch (complementError) {
          console.error('Erro ao buscar dados complementares:', complementError);
        }
      } else {
        console.log('Nenhum grupo encontrado na tabela de códigos');
      }
    } catch (error) {
      console.error('Exceção ao buscar na tabela de códigos:', error);
    }

    // ETAPA 2: Se não encontrou na tabela de códigos, buscar diretamente na tabela de grupos
    if (!grupoEncontrado) {
      try {
        const { data: dataGrupos, error: gruposError } = await supabase
          .from('grupos_estudo')
          .select('*')
          .eq('codigo', codigoNormalizado)
          .maybeSingle();

        if (gruposError) {
          console.error('Erro ao buscar na tabela de grupos:', gruposError);
        } else if (dataGrupos) {
          console.log('Grupo encontrado na tabela de grupos:', dataGrupos);
          grupoEncontrado = {
            ...dataGrupos,
            codigo: codigoNormalizado
          };

          // Sincronizar com a tabela de códigos para manter consistência
          try {
            const { error: syncError } = await supabase
              .from('codigos_grupos_estudo')
              .upsert({
                codigo: codigoNormalizado,
                grupo_id: dataGrupos.id,
                nome: dataGrupos.nome || 'Grupo sem nome',
                descricao: dataGrupos.descricao || '',
                user_id: dataGrupos.user_id,
                privado: dataGrupos.privado || false,
                membros: dataGrupos.membros || 1,
                visibilidade: dataGrupos.visibilidade || 'todos',
                disciplina: dataGrupos.disciplina || '',
                cor: dataGrupos.cor || '#FF6B00',
                membros_ids: dataGrupos.membros_ids || [],
                data_criacao: dataGrupos.data_criacao || new Date().toISOString(),
                ultima_atualizacao: new Date().toISOString()
              }, { onConflict: 'codigo' });

            if (syncError) {
              console.error('Erro ao sincronizar com tabela de códigos:', syncError);
            } else {
              console.log('Grupo sincronizado com a tabela de códigos');
            }
          } catch (syncError) {
            console.error('Exceção ao sincronizar com tabela de códigos:', syncError);
          }
        } else {
          console.log('Nenhum grupo encontrado na tabela de grupos');
        }
      } catch (error) {
        console.error('Exceção ao buscar na tabela de grupos:', error);
      }
    }

    // ETAPA 3: Se ainda não encontrou, buscar no localStorage
    if (!grupoEncontrado) {
      try {
        const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
        const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');

        const grupoLocal = grupos.find((g: any) => 
          g.codigo && g.codigo.toUpperCase() === codigoNormalizado);

        if (grupoLocal) {
          console.log('Grupo encontrado no localStorage:', grupoLocal);
          grupoEncontrado = grupoLocal;

          // Sincronizar com a tabela de códigos para futuros acessos
          try {
            const { error: syncError } = await supabase
              .from('codigos_grupos_estudo')
              .upsert({
                codigo: codigoNormalizado,
                grupo_id: grupoLocal.id,
                nome: grupoLocal.nome || 'Grupo sem nome',
                descricao: grupoLocal.descricao || '',
                user_id: grupoLocal.user_id || grupoLocal.criador,
                privado: grupoLocal.privado || false,
                membros: grupoLocal.membros || 1,
                visibilidade: grupoLocal.visibilidade || 'todos',
                disciplina: grupoLocal.disciplina || '',
                cor: grupoLocal.cor || '#FF6B00',
                membros_ids: grupoLocal.membros_ids || [],
                data_criacao: grupoLocal.dataCriacao || new Date().toISOString(),
                ultima_atualizacao: new Date().toISOString()
              }, { onConflict: 'codigo' });

            if (syncError) {
              console.error('Erro ao sincronizar grupo do localStorage:', syncError);
            } else {
              console.log('Grupo do localStorage sincronizado com a tabela de códigos');
            }
          } catch (syncError) {
            console.error('Exceção ao sincronizar grupo do localStorage:', syncError);
          }
        } else {
          console.log('Nenhum grupo encontrado no localStorage');
        }
      } catch (storageError) {
        console.error('Erro ao buscar no localStorage:', storageError);
      }
    }

    // Se não encontramos o grupo em nenhum lugar
    if (!grupoEncontrado) {
      console.log(`Nenhum grupo encontrado para o código ${codigoNormalizado} em nenhuma fonte`);
      return null;
    }

    return grupoEncontrado;
  } catch (error) {
    console.error('Erro ao buscar grupo por código:', error);
    return null;
  }
};

// Verifica se um código de grupo existe no banco de dados e o sincroniza se necessário
export const verificarSeCodigoExiste = async (codigo: string): Promise<boolean> => {
  try {
    if (!codigo || codigo.trim() === '') {
      console.log('Código vazio, retornando false');
      return false;
    }

    const codigoNormalizado = codigo.trim().toUpperCase();
    console.log(`Verificando se o código ${codigoNormalizado} existe...`);

    // Primeiro, verificar na tabela de códigos (a principal fonte de verdade)
    try {
      const { data: dataCodigos, error: errorCodigos } = await supabase
        .from('codigos_grupos_estudo')
        .select('codigo')
        .eq('codigo', codigoNormalizado)
        .maybeSingle();

      if (!errorCodigos && dataCodigos) {
        console.log(`Código ${codigoNormalizado} encontrado na tabela de códigos!`);
        return true;
      }

      if (errorCodigos && errorCodigos.code !== 'PGRST116') {
        console.error("Erro ao verificar código na tabela de códigos:", errorCodigos);
      }
    } catch (e) {
      console.error("Exceção ao verificar código na tabela de códigos:", e);
    }

    // Se não encontrou na tabela de códigos, verificar na tabela de grupos
    try {
      const { data: dataGrupos, error: errorGrupos } = await supabase
        .from('grupos_estudo')
        .select('*')  // Alterado para selecionar todos os campos para sincronização
        .eq('codigo', codigoNormalizado)
        .maybeSingle();

      if (!errorGrupos && dataGrupos) {
        console.log(`Código ${codigoNormalizado} encontrado na tabela de grupos!`);

        // Sincronizar automaticamente com a tabela de códigos
        try {
          const { error: syncError } = await supabase
            .from('codigos_grupos_estudo')
            .upsert({
              codigo: codigoNormalizado,
              grupo_id: dataGrupos.id,
              nome: dataGrupos.nome || 'Grupo sem nome',
              descricao: dataGrupos.descricao || '',
              user_id: dataGrupos.user_id,
              privado: dataGrupos.privado || false,
              membros: dataGrupos.membros || 1,
              visibilidade: dataGrupos.visibilidade || 'todos',
              disciplina: dataGrupos.disciplina || '',
              cor: dataGrupos.cor || '#FF6B00',
              membros_ids: dataGrupos.membros_ids || [],
              data_criacao: dataGrupos.data_criacao || new Date().toISOString(),
              ultima_atualizacao: new Date().toISOString()
            }, { onConflict: 'codigo' });

          if (syncError) {
            console.error('Erro ao sincronizar código com tabela de códigos:', syncError);
          } else {
            console.log('Código sincronizado com a tabela central');
          }
        } catch (syncError) {
          console.error('Erro ao sincronizar código:', syncError);
        }

        return true;
      }

      if (errorGrupos && errorGrupos.code !== 'PGRST116') {
        console.error("Erro ao verificar código na tabela de grupos:", errorGrupos);
      }
    } catch (e) {
      console.error("Exceção ao verificar código na tabela de grupos:", e);
    }

    // Verificar nos armazenamentos locais como último recurso e sincronizar se encontrado
    try {
      const grupos = JSON.parse(localStorage.getItem('epictus_grupos_estudo') || '[]');
      const grupo = grupos.find((g: any) => g.codigo && g.codigo.toUpperCase() === codigoNormalizado);

      if (grupo) {
        console.log(`Código ${codigoNormalizado} encontrado no storage de grupos`);

        // Sincronizar com a tabela de códigos
        try {
          const { error: syncError } = await supabase
            .from('codigos_grupos_estudo')
            .upsert({
              codigo: codigoNormalizado,
              grupo_id: grupo.id,
              nome: grupo.nome || 'Grupo sem nome',
              descricao: grupo.descricao || '',
              user_id: grupo.user_id || grupo.criador,
              privado: grupo.privado || false,
              membros: grupo.membros || 1,
              visibilidade: grupo.visibilidade || 'todos',
              disciplina: grupo.disciplina || '',
              cor: grupo.cor || '#FF6B00',
              membros_ids: grupo.membros_ids || [],
              data_criacao: grupo.dataCriacao || grupo.data_criacao || new Date().toISOString(),
              ultima_atualizacao: new Date().toISOString()
            }, { onConflict: 'codigo' });

          if (syncError) {
            console.error('Erro ao sincronizar grupo do localStorage:', syncError);
          } else {
            console.log('Grupo do localStorage sincronizado com a tabela de códigos');
          }
        } catch (syncError) {
          console.error('Exceção ao sincronizar grupo do localStorage:', syncError);
        }

        return true;
      }

      // Verificar separadamente no storage de códigos
      const codigosGrupos = JSON.parse(localStorage.getItem('epictus_codigos_grupo') || '{}');
      const grupoIdComCodigo = Object.entries(codigosGrupos).find(
        ([_, codigo]) => typeof codigo === 'string' && (codigo as string).toUpperCase() === codigoNormalizado
      );

      if (grupoIdComCodigo) {
        const [grupoId, _] = grupoIdComCodigo;
        console.log(`Código ${codigoNormalizado} encontrado no storage de códigos para o grupo ${grupoId}`);

        // Tentar buscar informações do grupo para sincronização
        const grupoLocal = grupos.find((g: any) => g.id === grupoId);
        if (grupoLocal) {
          try {
            const { error: syncError } = await supabase
              .from('codigos_grupos_estudo')
              .upsert({
                codigo: codigoNormalizado,
                grupo_id: grupoId,
                nome: grupoLocal.nome || 'Grupo sem nome',
                descricao: grupoLocal.descricao || '',
                user_id: grupoLocal.user_id || grupoLocal.criador,
                privado: grupoLocal.privado || false,
                membros: grupoLocal.membros || 1,
                visibilidade: grupoLocal.visibilidade || 'todos',
                disciplina: grupoLocal.disciplina || '',
                cor: grupoLocal.cor || '#FF6B00',
                membros_ids: grupoLocal.membros_ids || [],
                data_criacao: grupoLocal.dataCriacao || grupoLocal.data_criacao || new Date().toISOString(),
                ultima_atualizacao: new Date().toISOString()
              }, { onConflict: 'codigo' });

            if (syncError) {
              console.error('Erro ao sincronizar código do localStorage:', syncError);
            } else {
              console.log('Código do localStorage sincronizado com a tabela central');
            }
          } catch (syncError) {
            console.error('Exceção ao sincronizar código do localStorage:', syncError);
          }
        }

        return true;
      }
    } catch (e) {
      console.error("Erro ao verificar códigos no localStorage:", e);
    }

    console.log(`Código ${codigoNormalizado} não encontrado em nenhuma fonte`);
    return false;
  } catch (error) {
    console.error("Erro ao verificar código:", error);
    return false;
  }
};

/**
 * Verifica se um código pertence a um grupo criado pelo usuário ou do qual ele já é membro
 * @param codigo - O código do grupo a verificar
 * @param userId - ID do usuário atual
 * @returns Objeto contendo o resultado da verificação e detalhes do grupo, se aplicável
 */
export const verificarRelacaoUsuarioComGrupo = async (
  codigo: string, 
  userId: string
): Promise<{ 
  pertenceAoUsuario: boolean, 
  jaEMembro: boolean, 
  nomeGrupo: string,
  grupoId: string | null
}> => {
  try {
    if (!codigo || !userId) {
      console.log('Verificação abortada: código ou userId não fornecidos');
      return { pertenceAoUsuario: false, jaEMembro: false, nomeGrupo: '', grupoId: null };
    }

    const codigoNormalizado = codigo.trim().toUpperCase();
    console.log(`Verificando relação para o código: ${codigoNormalizado} e usuário: ${userId}`);

    // Primeiro verificar na tabela de códigos (principal fonte)
    let grupoInfo = null;

    // Buscar na tabela de códigos com manejo de erro melhorado
    try {
      const { data: dataCodigos, error: errorCodigos } = await supabase
        .from('codigos_grupos_estudo')
        .select('*')
        .eq('codigo', codigoNormalizado)
        .maybeSingle();

      if (errorCodigos) {
        console.error('Erro ao buscar na tabela de códigos:', errorCodigos);
      } else if (dataCodigos) {
        console.log('Grupo encontrado na tabela de códigos:', dataCodigos);
        grupoInfo = dataCodigos;
      } else {
        console.log('Nenhum grupo encontrado na tabela de códigos');
      }
    } catch (e) {
      console.error('Exceção ao buscar na tabela de códigos:', e);
    }

    // Se não encontrou na tabela de códigos, buscar na tabela de grupos
    if (!grupoInfo) {
      try {
        const { data: dataGrupos, error: errorGrupos } = await supabase
          .from('grupos_estudo')
          .select('*')
          .eq('codigo', codigoNormalizado)
          .maybeSingle();

        if (errorGrupos) {
          console.error('Erro ao buscar na tabela de grupos:', errorGrupos);
        } else if (dataGrupos) {
          console.log('Grupo encontrado na tabela de grupos:', dataGrupos);
          grupoInfo = dataGrupos;

          // Se encontrou na tabela de grupos, tentar sincronizar com a tabela de códigos
          try {
            const { error: syncError } = await supabase
              .from('codigos_grupos_estudo')
              .upsert({
                codigo: codigoNormalizado,
                grupo_id: dataGrupos.id,
                nome: dataGrupos.nome || 'Grupo sem nome',
                descricao: dataGrupos.descricao || '',
                user_id: dataGrupos.user_id,
                privado: dataGrupos.privado || false,
                membros: dataGrupos.membros || 1,
                visibilidade: dataGrupos.visibilidade || 'todos',
                disciplina: dataGrupos.disciplina || '',
                cor: dataGrupos.cor || '#FF6B00',
                membros_ids: dataGrupos.membros_ids || [],
                data_criacao: dataGrupos.data_criacao || new Date().toISOString(),
                ultima_atualizacao: new Date().toISOString()
              }, { onConflict: 'codigo' });

            if (syncError) {
              console.error('Erro ao sincronizar com tabela de códigos:', syncError);
            } else {
              console.log('Grupo sincronizado com a tabela de códigos');
            }
          } catch (syncError) {
            console.error('Exceção ao sincronizar com tabela de códigos:', syncError);
          }
        } else {
          console.log('Nenhum grupo encontrado na tabela de grupos');
        }
      } catch (e) {
        console.error('Exceção ao buscar na tabela de grupos:', e);
      }
    }

    // Verificar no localStorage como último recurso
    if (!grupoInfo) {
      try {
        const gruposStorage = localStorage.getItem('epictus_grupos_estudo');
        if (gruposStorage) {
          const grupos = JSON.parse(gruposStorage);
          const grupoLocalStorage = grupos.find((g: any) => g.codigo === codigoNormalizado);

          if (grupoLocalStorage) {
            console.log('Grupo encontrado no localStorage:', grupoLocalStorage);
            grupoInfo = grupoLocalStorage;

            // Tentar sincronizar este grupo com a tabela de códigos
            try {
              const { error: syncError } = await supabase
                .from('codigos_grupos_estudo')
                .upsert({
                  codigo: codigoNormalizado,
                  grupo_id: grupoLocalStorage.id,
                  nome: grupoLocalStorage.nome || 'Grupo sem nome',
                  descricao: grupoLocalStorage.descricao || '',
                  user_id: grupoLocalStorage.user_id || userId,
                  privado: grupoLocalStorage.privado || false,
                  membros: grupoLocalStorage.membros || 1,
                  visibilidade: grupoLocalStorage.visibilidade || 'todos',
                  disciplina: grupoLocalStorage.disciplina || '',
                  cor: grupoLocalStorage.cor || '#FF6B00',
                  membros_ids: grupoLocalStorage.membros_ids || [],
                  data_criacao: grupoLocalStorage.dataCriacao || new Date().toISOString(),
                  ultima_atualizacao: new Date().toISOString()
                }, { onConflict: 'codigo' });

              if (syncError) {
                console.error('Erro ao sincronizar grupo do localStorage:', syncError);
              } else {
                console.log('Grupo do localStorage sincronizado com a tabela de códigos');
              }
            } catch (syncError) {
              console.error('Exceção ao sincronizar grupo do localStorage:', syncError);
            }
          } else {
            console.log('Nenhum grupo com este código encontrado no localStorage');
          }
        }
      } catch (e) {
        console.error('Exceção ao verificar grupos no localStorage:', e);
      }
    }

    // Se não encontrou o grupo em nenhuma das fontes
    if (!grupoInfo) {
      console.log('Não foi possível encontrar o grupo em nenhuma fonte');
      return { pertenceAoUsuario: false, jaEMembro: false, nomeGrupo: '', grupoId: null };
    }

    // Verificar se o usuário é o criador do grupo
    const pertenceAoUsuario = grupoInfo.user_id === userId;
    console.log(`É o criador? ${pertenceAoUsuario} (user_id: ${grupoInfo.user_id}, userId: ${userId})`);

    // Verificar se o usuário já é membro
    let membrosIds = [];
    try {
      membrosIds = Array.isArray(grupoInfo.membros_ids) 
        ? grupoInfo.membros_ids 
        : (typeof grupoInfo.membros_ids === 'string' 
            ? JSON.parse(grupoInfo.membros_ids) 
            : []);
    } catch (e) {
      console.error('Erro ao processar membros_ids:', e);
      membrosIds = [];
    }

    const jaEMembro = membrosIds.includes(userId);
    console.log(`É membro? ${jaEMembro} (membros: ${JSON.stringify(membrosIds)})`);

    // Verificar também no localStorage
    let membroLocalStorage = false;
    try {
      const gruposStorage = localStorage.getItem('epictus_grupos_estudo');
      if (gruposStorage) {
        const grupos = JSON.parse(gruposStorage);
        const grupoLocalStorage = grupos.find((g: any) => 
          g.id === (grupoInfo.id || grupoInfo.grupo_id)
        );
        membroLocalStorage = !!grupoLocalStorage;
        console.log(`Está no localStorage? ${membroLocalStorage}`);
      }
    } catch (e) {
      console.error("Erro ao verificar grupos no localStorage:", e);
    }

    return { 
      pertenceAoUsuario, 
      jaEMembro: jaEMembro || membroLocalStorage || pertenceAoUsuario, 
      nomeGrupo: grupoInfo.nome || 'Grupo sem nome',
      grupoId: grupoInfo.id || grupoInfo.grupo_id
    };
  } catch (error) {
    console.error("Erro ao verificar relação do usuário com o grupo:", error);
    return { pertenceAoUsuario: false, jaEMembro: false, nomeGrupo: '', grupoId: null };
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

        // IMPORTANTE: Forçar inserção na tabela de códigos independente do trigger
        try {
          // Inserir diretamente na tabela de códigos para garantir que os dados estejam lá
          const { error: codigoError } = await supabase
            .from('codigos_grupos_estudo')
            .insert({
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
              membros_ids: data.membros_ids || [],
              data_criacao: new Date().toISOString()
            });

          if (codigoError) {
            console.error('Erro ao inserir na tabela de códigos:', codigoError);

            // Tentar upsert como fallback
            const { error: upsertError } = await supabase
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
                membros_ids: data.membros_ids || [],
                data_criacao: new Date().toISOString(),
                ultima_atualizacao: new Date().toISOString()
              }, { onConflict: 'codigo' });

            if (upsertError) {
              console.error('Erro ao fazer upsert na tabela de códigos:', upsertError);
            } else {
              console.log(`Código ${data.codigo} salvo com sucesso via upsert na tabela central`);
            }
          } else {
            console.log(`Código ${data.codigo} inserido com sucesso na tabela central de códigos`);
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

      // IMPORTANTE: Mesmo para grupos locais, garantir inserção na tabela central de códigos
      try {
        // Tentar inserção direta primeiro
        const { error: insertError } = await supabase
          .from('codigos_grupos_estudo')
          .insert({
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
            membros_ids: dados.membros_ids || [],
            data_criacao: new Date().toISOString()
          });

        if (insertError) {
          console.error('Erro ao inserir código na tabela central:', insertError);

          // Tentar upsert como fallback
          const { error: upsertError } = await supabase
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
              membros_ids: dados.membros_ids || [],
              data_criacao: new Date().toISOString(),
              ultima_atualizacao: new Date().toISOString()
            }, { onConflict: 'codigo' });

          if (upsertError) {
            console.error('Erro ao fazer upsert na tabela central:', upsertError);
          } else {
            console.log(`Código ${codigo} de grupo local salvo com sucesso na tabela central via upsert`);
          }
        } else {
          console.log(`Código ${codigo} de grupo local inserido com sucesso na tabela central`);
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

import { supabase } from "@/lib/supabase";

// Função para verificar se um código de grupo existe
export const verificarSeCodigoExiste = async (codigo: string) => {
  if (!codigo) return { existe: false, mensagem: "Código não fornecido" };

  try {
    // Normalizar o código (remover espaços, etc.)
    const codigoNormalizado = codigo.trim().toUpperCase();

    // Primeiro, verificar se a tabela codigos_grupos_estudo existe
    try {
      const { count, error: countError } = await supabase
        .from('codigos_grupos_estudo')
        .select('*', { count: 'exact', head: true });

      if (countError && countError.code === '42P01') {
        // A tabela não existe, vamos criá-la
        console.log("Tabela codigos_grupos_estudo não existe, criando...");
        const criada = await criarTabelaCodigosGrupos();

        if (!criada) {
          return { 
            existe: false, 
            mensagem: "Erro ao criar tabela de códigos. Por favor, tente novamente mais tarde." 
          };
        }

        // Tabela criada, mas como acabou de ser criada, não contém o código
        return { 
          existe: false, 
          mensagem: "Sistema de códigos inicializado. O código informado não foi encontrado." 
        };
      }
    } catch (tableCheckError) {
      console.error("Erro ao verificar se tabela existe:", tableCheckError);
    }

    // Verificar se o código existe na tabela específica
    const { data, error } = await supabase
      .from('codigos_grupos_estudo')
      .select('*')
      .eq('codigo', codigoNormalizado)
      .maybeSingle();

    if (error) {
      // Se o erro for de "não encontrado", o código não existe
      if (error.code === 'PGRST116') {
        return { existe: false, mensagem: "Código não encontrado" };
      }

      // Se for um erro de tabela inexistente, tentar criar
      if (error.code === '42P01') {
        console.error("Tabela codigos_grupos_estudo não existe:", error);
        // Tentar criar a tabela
        const criada = await criarTabelaCodigosGrupos();

        if (!criada) {
          return { 
            existe: false, 
            mensagem: "Erro ao criar tabela de códigos. Por favor, tente novamente após sincronizar os dados." 
          };
        }

        return { 
          existe: false, 
          mensagem: "Sistema de códigos está sendo inicializado. Tente novamente em alguns momentos." 
        };
      }

      // Para outros erros
      console.error("Erro ao verificar código:", error);
      return { 
        existe: false, 
        mensagem: `Erro ao verificar código: ${error.message}` 
      };
    }

    if (!data) {
      // Código não encontrado na tabela de códigos
      // Vamos verificar se ele existe na tabela de grupos
      try {
        const { data: grupoData, error: grupoError } = await supabase
          .from('grupos_estudo')
          .select('*')
          .eq('codigo', codigoNormalizado)
          .maybeSingle();

        if (grupoError) {
          if (grupoError.code === '42P01') {
            // Tabela grupos_estudo não existe
            return { 
              existe: false, 
              mensagem: "Sistema de grupos não está inicializado. Por favor, sincronize os dados." 
            };
          }

          console.error("Erro ao verificar código na tabela grupos:", grupoError);
          return { 
            existe: false, 
            mensagem: "Código não encontrado" 
          };
        }

        if (grupoData) {
          // Encontrou o grupo, agora vamos sincronizar com a tabela de códigos
          try {
            await supabase.from('codigos_grupos_estudo').insert({
              codigo: codigoNormalizado,
              grupo_id: grupoData.id,
              nome: grupoData.nome || 'Grupo sem nome',
              descricao: grupoData.descricao || '',
              user_id: grupoData.user_id,
              privado: grupoData.privado || false,
              membros: grupoData.membros || 1,
              visibilidade: grupoData.visibilidade || 'todos',
              disciplina: grupoData.disciplina || '',
              cor: grupoData.cor || '#FF6B00',
              membros_ids: grupoData.membros_ids || [],
              data_criacao: grupoData.data_criacao || new Date().toISOString(),
              ultima_atualizacao: new Date().toISOString()
            });

            // Grupo sincronizado na tabela de códigos
            return { 
              existe: true, 
              grupo: grupoData, 
              mensagem: "Código válido encontrado" 
            };
          } catch (syncError) {
            console.error("Erro ao sincronizar código com tabela de códigos:", syncError);
            // Mas ainda retornamos o grupo encontrado
            return { 
              existe: true, 
              grupo: grupoData, 
              mensagem: "Código válido encontrado" 
            };
          }
        }

        return { existe: false, mensagem: "Código não encontrado" };
      } catch (grupoCheckError) {
        console.error("Erro ao verificar código na tabela de grupos:", grupoCheckError);
        return { existe: false, mensagem: "Código não encontrado" };
      }
    }

    // Se chegou aqui, encontrou o código na tabela de códigos
    return { 
      existe: true, 
      grupo: data, 
      mensagem: "Código válido encontrado" 
    };

  } catch (error) {
    console.error("Exceção ao verificar código:", error);
    return { 
      existe: false, 
      mensagem: "Erro interno ao verificar código. Por favor, tente novamente." 
    };
  }
};

// Função para criar a tabela de códigos de grupo
const criarTabelaCodigosGrupos = async () => {
  try {
    console.log("Iniciando criação da tabela codigos_grupos_estudo...");

    // Primeiro, verificar se a extensão uuid-ossp está disponível
    try {
      await supabase.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
      console.log("Extensão uuid-ossp verificada/criada");
    } catch (extError) {
      console.log("Nota: Não foi possível criar extensão uuid-ossp, mas isso pode não ser um problema:", extError);
    }

    // Executar SQL para criar a tabela
    const { error } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.codigos_grupos_estudo (
        codigo VARCHAR(15) PRIMARY KEY,
        grupo_id UUID NOT NULL,
        nome VARCHAR NOT NULL,
        descricao TEXT,
        data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
        user_id UUID,
        privado BOOLEAN DEFAULT false,
        membros INTEGER DEFAULT 1,
        visibilidade VARCHAR,
        disciplina VARCHAR,
        cor VARCHAR DEFAULT '#FF6B00',
        membros_ids JSONB DEFAULT '[]'::jsonb,
        ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);

    if (error) {
      console.error("Erro ao criar tabela de códigos:", error);
      return false;
    }

    // Criar índices e políticas de segurança
    try {
      await supabase.query(`
        CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_grupo_id ON public.codigos_grupos_estudo(grupo_id);
        CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_user_id ON public.codigos_grupos_estudo(user_id);
      `);

      await supabase.query(`
        ALTER TABLE public.codigos_grupos_estudo ENABLE ROW LEVEL SECURITY;
      `);

      await supabase.query(`
        DROP POLICY IF EXISTS "Todos podem visualizar códigos" ON public.codigos_grupos_estudo;
        CREATE POLICY "Todos podem visualizar códigos"
          ON public.codigos_grupos_estudo FOR SELECT
          USING (true);
      `);

      await supabase.query(`
        DROP POLICY IF EXISTS "Todos podem inserir códigos" ON public.codigos_grupos_estudo;
        CREATE POLICY "Todos podem inserir códigos"
          ON public.codigos_grupos_estudo FOR INSERT
          WITH CHECK (true);
      `);

      await supabase.query(`
        DROP POLICY IF EXISTS "Todos podem atualizar códigos" ON public.codigos_grupos_estudo;
        CREATE POLICY "Todos podem atualizar códigos"
          ON public.codigos_grupos_estudo FOR UPDATE
          USING (true);
      `);
    } catch (policiesError) {
      console.warn("Aviso: Não foi possível criar todos os índices/políticas:", policiesError);
      // Continuamos mesmo se falhar a criação de políticas
    }

    console.log("Tabela de códigos de grupos criada com sucesso!");
    return true;
  } catch (error) {
    console.error("Exceção ao criar tabela de códigos:", error);
    return false;
  }
};

// Função para gerar um código único de grupo
export const gerarCodigoGrupo = () => {
  // Caracteres permitidos (removido caracteres ambíguos como 0/O, 1/I, etc.)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  // Gerar 4 letras e 4 números
  let codigo = '';

  // Primeira parte: 4 letras
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * 23); // Índice para pegar apenas letras
    codigo += chars[randomIndex];
  }

  codigo += '-'; // Separador

  // Segunda parte: 4 caracteres alfanuméricos
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    codigo += chars[randomIndex];
  }

  return codigo;
};

// Função para salvar um código na tabela
export const salvarCodigoGrupo = async (codigoData: any) => {
  try {
    // Verificar se a tabela existe e criar se necessário
    try {
      const { count, error } = await supabase
        .from('codigos_grupos_estudo')
        .select('*', { count: 'exact', head: true });

      if (error && error.code === '42P01') {
        // Tabela não existe, criar
        const criada = await criarTabelaCodigosGrupos();
        if (!criada) {
          return { 
            sucesso: false, 
            error: new Error("Não foi possível criar a tabela de códigos") 
          };
        }
      }
    } catch (e) {
      console.error("Erro ao verificar tabela de códigos:", e);
      const criada = await criarTabelaCodigosGrupos();
      if (!criada) {
        return { 
          sucesso: false, 
          error: new Error("Não foi possível criar a tabela de códigos") 
        };
      }
    }

    // Verificar se já existe um código igual
    const { data: existingCode, error: checkError } = await supabase
      .from('codigos_grupos_estudo')
      .select('codigo')
      .eq('codigo', codigoData.codigo)
      .maybeSingle();

    if (existingCode) {
      // Código já existe, gerar um novo código
      const novoCodigo = gerarCodigoGrupo();
      codigoData.codigo = novoCodigo;
    }

    // Inserir o código
    const { data, error } = await supabase
      .from('codigos_grupos_estudo')
      .upsert([codigoData], { onConflict: 'codigo' })
      .select();

    if (error) {
      console.error("Erro ao salvar código de grupo:", error);
      return { sucesso: false, error };
    }

    return { sucesso: true, data };
  } catch (error) {
    console.error("Exceção ao salvar código de grupo:", error);
    return { sucesso: false, error };
  }
};

// Função para criar a tabela grupos_estudo se não existir
export const criarTabelaGruposEstudo = async () => {
  try {
    console.log("Iniciando criação da tabela grupos_estudo...");

    // Executar SQL para criar a tabela
    const { error } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS public.grupos_estudo (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        nome TEXT NOT NULL,
        descricao TEXT,
        cor TEXT NOT NULL DEFAULT '#FF6B00',
        membros INTEGER NOT NULL DEFAULT 1,
        membros_ids JSONB DEFAULT '[]'::jsonb,
        topico TEXT,
        topico_nome TEXT,
        topico_icon TEXT,
        privado BOOLEAN DEFAULT false,
        visibilidade TEXT DEFAULT 'todos',
        codigo TEXT,
        disciplina TEXT DEFAULT 'Geral',
        data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);

    if (error) {
      console.error("Erro ao criar tabela grupos_estudo:", error);
      return false;
    }

    // Criar índices e políticas de segurança
    try {
      await supabase.query(`
        CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON public.grupos_estudo(user_id);
      `);

      await supabase.query(`
        ALTER TABLE public.grupos_estudo ENABLE ROW LEVEL SECURITY;
      `);

      await supabase.query(`
        DROP POLICY IF EXISTS "Usuários podem visualizar grupos" ON public.grupos_estudo;
        CREATE POLICY "Usuários podem visualizar grupos"
          ON public.grupos_estudo FOR SELECT
          USING (true);
      `);

      awaitsupabase.query(`
        DROP POLICY IF EXISTS "Usuários podem inserir grupos" ON public.grupos_estudo;
        CREATE POLICY "Usuários podem inserir grupos"
          ON public.grupos_estudo FOR INSERT
          WITH CHECK (true);
      `);
    } catch (policiesError) {
      console.warn("Aviso: Não foi possível criar todos os índices/políticas para grupos_estudo:", policiesError);
    }

    console.log("Tabela grupos_estudo criada com sucesso!");
    return true;
  } catch (error) {
    console.error("Exceção ao criar tabela grupos_estudo:", error);
    return false;
  }
};

// Função para sincronizar os códigos de grupos
export const sincronizarCodigosGrupos = async () => {
  try {
    console.log("Iniciando sincronização de códigos de grupos...");

    // Verificar se as tabelas existem
    let gruposExiste = false;
    let codigosExiste = false;

    try {
      const { count, error } = await supabase
        .from('grupos_estudo')
        .select('*', { count: 'exact', head: true });

      gruposExiste = !error;
    } catch (e) {
      gruposExiste = false;
    }

    try {
      const { count, error } = await supabase
        .from('codigos_grupos_estudo')
        .select('*', { count: 'exact', head: true });

      codigosExiste = !error;
    } catch (e) {
      codigosExiste = false;
    }

    // Criar tabelas se não existirem
    if (!gruposExiste) {
      const criada = await criarTabelaGruposEstudo();
      if (!criada) {
        return { 
          sucesso: false, 
          mensagem: "Não foi possível criar a tabela grupos_estudo" 
        };
      }
    }

    if (!codigosExiste) {
      const criada = await criarTabelaCodigosGrupos();
      if (!criada) {
        return { 
          sucesso: false, 
          mensagem: "Não foi possível criar a tabela codigos_grupos_estudo" 
        };
      }
    }

    // Buscar todos os grupos com código
    const { data: grupos, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .not('codigo', 'is', null);

    if (error) {
      console.error("Erro ao buscar grupos com código:", error);
      return { 
        sucesso: false, 
        mensagem: `Erro ao buscar grupos: ${error.message}` 
      };
    }

    // Sincronizar cada grupo
    let sucessos = 0;
    let erros = 0;

    for (const grupo of grupos || []) {
      try {
        const { error: insertError } = await supabase
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

        if (insertError) {
          console.error(`Erro ao sincronizar código ${grupo.codigo}:`, insertError);
          erros++;
        } else {
          sucessos++;
        }
      } catch (syncError) {
        console.error(`Erro ao sincronizar grupo ${grupo.id}:`, syncError);
        erros++;
      }
    }

    return { 
      sucesso: true, 
      mensagem: `Sincronização concluída. Sucessos: ${sucessos}, Erros: ${erros}` 
    };
  } catch (error) {
    console.error("Exceção ao sincronizar códigos de grupos:", error);
    return { 
      sucesso: false, 
      mensagem: "Erro interno ao sincronizar códigos de grupos" 
    };
  }
};