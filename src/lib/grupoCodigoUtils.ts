
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
      const { data: grupoData, error: grupoError } = await supabase
        .from('grupos_estudo')
        .select('*')
        .eq('id', grupoId)
        .single();
        
      if (!grupoError && grupoData) {
        // Atualizar o código no grupo
        await supabase
          .from('grupos_estudo')
          .update({ codigo: codigoNormalizado })
          .eq('id', grupoId);
          
        // Atualizar ou inserir na tabela de códigos
        // O trigger deve fazer isso automaticamente, mas fazemos aqui como garantia
        await salvarCodigoNoBanco(codigoNormalizado, {
          ...grupoData,
          codigo: codigoNormalizado
        });
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
    
    // Buscar no banco de dados central
    const resultado = await buscarGrupoPorCodigo(codigoNormalizado);
    
    if (resultado.success && resultado.data) {
      return resultado.data;
    }
    
    // Fallback: buscar nos armazenamentos locais
    const GRUPOS_STORAGE_KEY = 'epictus_grupos_estudo';
    const grupos = JSON.parse(localStorage.getItem(GRUPOS_STORAGE_KEY) || '[]');
    
    const grupoEncontrado = grupos.find((g: any) => 
      g.codigo && g.codigo.toUpperCase() === codigoNormalizado);
      
    if (grupoEncontrado) {
      return grupoEncontrado;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar grupo por código:', error);
    return null;
  }
};
import { supabase } from "./supabase";

// Verifica se um código de grupo existe no banco de dados
export const verificarSeCodigoExiste = async (codigo: string): Promise<boolean> => {
  try {
    // Simular verificação para fins de demonstração
    // Aqui seria feita uma verificação real no banco de dados
    // Exemplo de implementação real:
    /*
    const { data, error } = await supabase
      .from('codigos_grupos')
      .select('*')
      .eq('codigo', codigo)
      .eq('ativo', true)
      .single();
      
    if (error) {
      console.error("Erro ao verificar código:", error);
      return false;
    }
    
    return !!data;
    */
    
    // Simulação para fins de demonstração
    return new Promise((resolve) => {
      setTimeout(() => {
        // Aceitar qualquer código que tenha pelo menos 6 caracteres
        // Em produção, isso seria substituído pela verificação real
        resolve(codigo.length >= 6);
      }, 1000);
    });
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
