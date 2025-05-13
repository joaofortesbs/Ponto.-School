
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
const COMPRIMENTO_CODIGO = 7; // Código com 7 caracteres

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
 * Verifica se um código de grupo já existe usando o servidor dedicado
 * Nota: Trata códigos como não sensíveis a maiúsculas/minúsculas
 */
export const verificarSeCodigoExiste = async (codigo: string): Promise<boolean> => {
  try {
    // Normalizar o código (maiúsculas e sem espaços)
    codigo = codigo.trim().toUpperCase();
    
    // 1. VERIFICAR NO SERVIDOR DEDICADO
    try {
      const resposta = await fetch(`/api/codigos-grupo/verificar/${codigo}`);
      const dados = await resposta.json();
      
      if (dados.sucesso) {
        console.log('Verificação de código realizada no servidor:', dados.existe);
        return dados.existe;
      } else {
        throw new Error("Erro na resposta do servidor");
      }
    } catch (serverError) {
      console.error('Erro ao verificar código no servidor dedicado:', serverError);
      
      // 2. FALLBACK PARA FONTES LOCAIS SE O SERVIDOR FALHAR
      console.log('Recorrendo a fontes locais para verificação do código...');
      
      // Verificar primeiro no storage dedicado para códigos
      try {
        const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
        const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
        
        // Verificar se algum grupo tem este código
        const codigosExistentes = Object.values(codigosGrupos);
        if (codigosExistentes.includes(codigo)) {
          console.log('Código encontrado no storage dedicado:', codigo);
          return true;
        }
      } catch (storageError) {
        console.error('Erro ao verificar storage dedicado:', storageError);
      }
      
      // Verificar em localStorage
      const gruposLocais = obterGruposLocal();
      const existeLocal = gruposLocais.some((grupo: any) => 
        grupo.codigo && grupo.codigo.toUpperCase() === codigo
      );
      
      if (existeLocal) {
        console.log('Código existe localmente:', codigo);
        return true;
      }
      
      // Verificar no Supabase como último recurso
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data, error } = await supabase
            .from('grupos_estudo')
            .select('id')
            .eq('codigo', codigo)
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
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar se código existe:', error);
    return false;
  }
};

/**
 * Obtém um grupo pelo seu código único usando o servidor dedicado
 * @param codigo - Código único do grupo
 * @returns O grupo encontrado ou null
 */
export const obterGrupoPorCodigo = async (codigo: string): Promise<GrupoEstudo | null> => {
  try {
    // Normalizar o código
    codigo = codigo.trim().toUpperCase();
    
    // 1. VERIFICAR NO SERVIDOR DEDICADO
    try {
      // Obter a sessão do usuário atual para validação de acesso
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('Usuário não autenticado ao buscar grupo por código');
        return null;
      }
      
      const userId = session.user.id;
      
      // Primeira etapa: verificar se o código existe e se temos acesso
      const validacaoResposta = await fetch('/api/codigos-grupo/validar-acesso', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codigo,
          userId
        })
      });
      
      const validacaoDados = await validacaoResposta.json();
      
      if (!validacaoDados.sucesso || !validacaoDados.acesso) {
        console.log('Acesso negado ao grupo pelo servidor:', validacaoDados.mensagem);
        return null;
      }
      
      // Se temos acesso, obter os detalhes do grupo
      const grupoId = validacaoDados.grupoId;
      
      // Agora buscar os detalhes completos do grupo (pelo seu ID)
      try {
        // Verificar primeiro no armazenamento local para resposta rápida
        const gruposLocais = obterGruposLocal();
        const grupoLocal = gruposLocais.find(grupo => grupo.id === grupoId);
        
        if (grupoLocal) {
          console.log('Grupo encontrado localmente pelo ID:', grupoId);
          return grupoLocal;
        }
        
        // Se não encontrado localmente, buscar no Supabase
        const { data, error } = await supabase
          .from('grupos_estudo')
          .select('*')
          .eq('id', grupoId)
          .single();
        
        if (error) {
          console.error('Erro ao buscar grupo por ID no Supabase:', error);
          return null;
        }
        
        if (data) {
          // Salvar localmente para acesso futuro mais rápido
          salvarGrupoLocal(data);
          return data;
        }
      } catch (e) {
        console.error('Erro ao obter detalhes do grupo após validação:', e);
      }
    } catch (serverError) {
      console.error('Erro ao comunicar com o servidor de códigos:', serverError);
      
      // 2. FALLBACK PARA FONTES LOCAIS SE O SERVIDOR FALHAR
      console.log('Recorrendo a fontes locais para buscar grupo por código...');
      
      // Verificar primeiro no localStorage
      const gruposLocais = obterGruposLocal();
      const grupoLocal = gruposLocais.find(grupo => 
        grupo.codigo && grupo.codigo.toUpperCase() === codigo
      );
      
      if (grupoLocal) {
        console.log('Grupo encontrado localmente pelo código:', codigo);
        return grupoLocal;
      }
      
      // Verificar no Supabase como último recurso
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
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao obter grupo por código:', error);
    return null;
  }
};

/**
 * Adiciona o usuário atual a um grupo específico
 * Integra com o servidor de códigos para garantir acesso aos grupos privados
 * @param grupoId - ID do grupo
 * @param codigo - Código do grupo (opcional, se disponível)
 * @returns true se o usuário foi adicionado com sucesso
 */
export const adicionarUsuarioAoGrupo = async (grupoId: string, codigo?: string): Promise<boolean> => {
  try {
    // Obter dados do usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Usuário não autenticado ao tentar entrar no grupo');
      return false;
    }
    
    // Se o código foi fornecido, validar o acesso pelo servidor primeiro
    if (codigo) {
      try {
        const codigoNormalizado = codigo.trim().toUpperCase();
        
        const validacaoResposta = await fetch('/api/codigos-grupo/validar-acesso', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            codigo: codigoNormalizado,
            userId: user.id
          })
        });
        
        const validacaoDados = await validacaoResposta.json();
        
        if (!validacaoDados.sucesso || !validacaoDados.acesso) {
          console.error('Acesso negado pelo servidor de códigos:', validacaoDados.mensagem);
          return false;
        }
        
        console.log('Acesso ao grupo validado pelo servidor de códigos');
      } catch (serverError) {
        console.error('Erro ao validar acesso com o servidor de códigos:', serverError);
        // Continuamos com o fluxo normal como fallback
      }
    }
    
    // Obter o grupo do Supabase
    const { data: grupo, error } = await supabase
      .from('grupos_estudo')
      .select('*')
      .eq('id', grupoId)
      .single();
    
    if (error || !grupo) {
      console.error('Erro ao obter grupo para adicionar usuário:', error);
      
      // Tentar obter do armazenamento local como fallback
      const gruposLocais = obterGruposLocal();
      const grupoLocal = gruposLocais.find(g => g.id === grupoId);
      
      if (!grupoLocal) {
        return false;
      }
      
      // Se encontrou localmente, usar este
      // Verificar se o usuário já é membro
      const membrosIdsLocal = grupoLocal.membros_ids || [];
      if (membrosIdsLocal.includes(user.id) || grupoLocal.user_id === user.id) {
        return true; // Já é membro
      }
      
      // Adicionar localmente
      const novosMembrosIdsLocal = [...membrosIdsLocal, user.id];
      grupoLocal.membros_ids = novosMembrosIdsLocal;
      grupoLocal.membros = (grupoLocal.membros || 1) + 1;
      
      // Salvar localmente e marcar para sincronização posterior
      salvarGrupoLocal(grupoLocal);
      
      // Marcar para sincronização quando o servidor estiver disponível
      try {
        const gruposPendentes = JSON.parse(localStorage.getItem('epictus_grupos_pendentes_sync') || '[]');
        if (!gruposPendentes.includes(grupoId)) {
          gruposPendentes.push(grupoId);
          localStorage.setItem('epictus_grupos_pendentes_sync', JSON.stringify(gruposPendentes));
        }
      } catch (e) {
        console.error('Erro ao marcar grupo para sincronização:', e);
      }
      
      return true;
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
      console.error('Erro ao adicionar usuário ao grupo no Supabase:', updateError);
      
      // Ainda atualiza localmente mesmo com erro no Supabase
      grupo.membros_ids = novosMembrosIds;
      grupo.membros = (grupo.membros || 1) + 1;
      salvarGrupoLocal(grupo);
      
      // Marcar para sincronização posterior
      try {
        const gruposPendentes = JSON.parse(localStorage.getItem('epictus_grupos_pendentes_sync') || '[]');
        if (!gruposPendentes.includes(grupoId)) {
          gruposPendentes.push(grupoId);
          localStorage.setItem('epictus_grupos_pendentes_sync', JSON.stringify(gruposPendentes));
        }
      } catch (e) {
        console.error('Erro ao marcar grupo para sincronização após falha:', e);
      }
      
      return true; // Retornamos true pois o usuário foi adicionado localmente
    }
    
    // Se o grupo é privado, notificar o servidor de códigos
    if (grupo.privado || grupo.visibilidade === "Privado (apenas por convite)") {
      try {
        // Obter o código do grupo
        let codigoGrupo = grupo.codigo;
        
        if (!codigoGrupo) {
          // Se não tiver código, obter através da função principal
          codigoGrupo = await gerarCodigoUnicoGrupo(grupoId);
        }
        
        // Notificar o servidor sobre o novo membro permitido
        await fetch('/api/codigos-grupo/adicionar-membro', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            grupoId,
            userId: user.id,
            adminId: grupo.user_id
          })
        });
        
        console.log('Servidor de códigos notificado sobre novo membro');
      } catch (serverError) {
        console.error('Erro ao notificar servidor de códigos sobre novo membro:', serverError);
        // Não bloqueamos o fluxo por falha nesta notificação
      }
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
 * Gera um código único para o grupo de estudos usando o servidor dedicado
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
    
    // 1. VERIFICAR NA CACHE LOCAL PRIMEIRO (para resposta rápida em caso de reconexão)
    const CODIGOS_STORAGE_KEY = 'epictus_codigos_grupo';
    
    try {
      // Verificar no storage dedicado para códigos
      const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
      
      // Se já existe um código para este grupo, retornar da cache enquanto valida com o servidor
      if (codigosGrupos[grupoId]) {
        const codigoCache = codigosGrupos[grupoId];
        console.log(`Código encontrado na cache local:`, codigoCache);
        
        // Em paralelo, verificar com o servidor se o código ainda é válido
        setTimeout(async () => {
          try {
            const resposta = await fetch(`/api/codigos-grupo/verificar/${codigoCache}`);
            const dados = await resposta.json();
            
            // Se o código não existe mais no servidor, vamos apagá-lo da cache
            if (!dados.existe) {
              const codigosAtualizados = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
              delete codigosAtualizados[grupoId];
              localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosAtualizados));
              console.log(`Código removido da cache por não existir mais no servidor:`, codigoCache);
            }
          } catch (e) {
            console.error("Erro ao validar código com o servidor:", e);
          }
        }, 100);
        
        return codigoCache;
      }
    } catch (e) {
      console.error("Erro ao verificar cache local de códigos:", e);
    }
    
    // 2. TENTAR CONSULTAR O SERVIDOR DEDICADO
    try {
      // Obter a sessão do usuário atual para o userId
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      
      // Obter as informações do grupo para enviar ao servidor
      let nomeGrupo = "";
      let privado = false;
      
      try {
        const grupos = obterGruposLocal();
        const grupoExistente = grupos.find(g => g.id === grupoId);
        
        if (grupoExistente) {
          nomeGrupo = grupoExistente.nome || "Grupo de Estudo";
          privado = grupoExistente.privado || grupoExistente.visibilidade === "Privado (apenas por convite)";
        }
      } catch (e) {
        console.error("Erro ao obter informações do grupo local:", e);
      }
      
      // Solicitar o código ao servidor dedicado
      const resposta = await fetch('/api/codigos-grupo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          grupoId,
          userId,
          nome: nomeGrupo,
          privado
        })
      });
      
      const dados = await resposta.json();
      
      if (dados.sucesso && dados.codigo) {
        const codigoServidor = dados.codigo;
        
        // Salvar código na cache local para acesso mais rápido
        try {
          const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
          codigosGrupos[grupoId] = codigoServidor;
          localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));
          console.log(`Código ${codigoServidor} do servidor salvo na cache local`);
        } catch (e) {
          console.error("Erro ao salvar código do servidor na cache:", e);
        }
        
        // Atualizar código no grupo local
        try {
          const grupos = obterGruposLocal();
          const grupoIndex = grupos.findIndex(g => g.id === grupoId);
          
          if (grupoIndex >= 0) {
            grupos[grupoIndex].codigo = codigoServidor;
            localStorage.setItem('epictus_grupos_estudo', JSON.stringify(grupos));
            console.log(`Código do servidor atualizado no localStorage:`, codigoServidor);
          }
        } catch (e) {
          console.error("Erro ao atualizar grupo local com código do servidor:", e);
        }
        
        // Sincronizar com Supabase em segundo plano
        try {
          const { error } = await supabase
            .from('grupos_estudo')
            .update({ codigo: codigoServidor })
            .eq('id', grupoId);
            
          if (error) {
            console.error('Erro ao sincronizar código com Supabase:', error);
          } else {
            console.log(`Código ${codigoServidor} sincronizado com Supabase`);
          }
        } catch (e) {
          console.error("Erro ao sincronizar com Supabase:", e);
        }
        
        console.log(`Código obtido do servidor dedicado:`, codigoServidor);
        return codigoServidor;
      } else {
        console.error("Erro na resposta do servidor de códigos:", dados);
        throw new Error("Erro ao obter código do servidor");
      }
    } catch (serverError) {
      console.error("Erro ao comunicar com o servidor de códigos:", serverError);
      
      // 3. FALLBACK PARA FONTES LOCAIS DE DADOS
      // Se o servidor falhar, recorrer às fontes locais
      console.log("Recorrendo a fontes locais de dados como fallback...");
      
      // Verificar primeiro no localStorage de grupos
      try {
        const grupos = obterGruposLocal();
        const grupoExistente = grupos.find(g => g.id === grupoId);
        
        if (grupoExistente && grupoExistente.codigo) {
          console.log(`Código existente encontrado no localStorage:`, grupoExistente.codigo);
          
          // Salvar também no storage dedicado
          try {
            const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
            codigosGrupos[grupoId] = grupoExistente.codigo;
            localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));
          } catch (e) {
            console.error("Erro ao salvar no storage dedicado:", e);
          }
          
          return grupoExistente.codigo;
        }
      } catch (e) {
        console.error("Erro ao verificar grupos locais:", e);
      }
      
      // Verificar no Supabase como fallback secundário
      try {
        const { data, error } = await supabase
          .from('grupos_estudo')
          .select('codigo')
          .eq('id', grupoId)
          .single();
          
        if (!error && data && data.codigo) {
          console.log(`Código encontrado no banco de dados:`, data.codigo);
          
          // Salvar na cache local
          try {
            const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
            codigosGrupos[grupoId] = data.codigo;
            localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));
          } catch (e) {
            console.error("Erro ao salvar código do Supabase na cache:", e);
          }
          
          return data.codigo;
        }
      } catch (e) {
        console.error("Erro ao verificar no Supabase:", e);
      }
      
      // Se chegou aqui, gerar um código offline e sincronizar posteriormente
      console.log("Gerando código offline como último recurso...");
      let codigoOffline = gerarCodigoUnico().toUpperCase();
      
      // Normalizar para 7 caracteres
      if (codigoOffline.length !== 7) {
        if (codigoOffline.length < 7) {
          codigoOffline = codigoOffline.padEnd(7, 'A');
        } else {
          codigoOffline = codigoOffline.substring(0, 7);
        }
      }
      
      // Marcar como offline adicionando "OFF" no início (será substituído quando online)
      const codigoFinal = codigoOffline;
      
      // Salvar na cache local
      try {
        const codigosGrupos = JSON.parse(localStorage.getItem(CODIGOS_STORAGE_KEY) || '{}');
        codigosGrupos[grupoId] = codigoFinal;
        localStorage.setItem(CODIGOS_STORAGE_KEY, JSON.stringify(codigosGrupos));
        
        // Marcar para sincronização posterior
        const pendentesSync = JSON.parse(localStorage.getItem('epictus_codigos_pendentes_sync') || '[]');
        if (!pendentesSync.includes(grupoId)) {
          pendentesSync.push(grupoId);
          localStorage.setItem('epictus_codigos_pendentes_sync', JSON.stringify(pendentesSync));
        }
      } catch (e) {
        console.error("Erro ao salvar código offline na cache:", e);
      }
      
      return codigoFinal;
    }
  } catch (error) {
    console.error("Erro crítico ao gerar/recuperar código único para grupo:", error);
    
    // MECANISMO DE RECUPERAÇÃO DE EMERGÊNCIA
    // Gerar código de emergência
    const codigoEmergencia = `GE${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    console.log("Gerando código de emergência:", codigoEmergencia);
    
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
