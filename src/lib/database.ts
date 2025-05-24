
import { supabase, checkSupabaseConnection } from './supabase';
import { neonPool, checkNeonConnection, initializeDatabase as initNeonDb } from './neon-db';

// Enumeração para os tipos de banco de dados disponíveis
export enum DatabaseType {
  SUPABASE = 'supabase',
  NEON = 'neon'
}

// Estado atual do banco de dados
let currentDatabase: DatabaseType = DatabaseType.SUPABASE;

// Alternar entre os bancos de dados
export const switchDatabase = (type: DatabaseType) => {
  currentDatabase = type;
  console.log(`Banco de dados alterado para: ${type}`);
};

// Obter o cliente atual do banco de dados
export const getCurrentDbClient = () => {
  return currentDatabase === DatabaseType.SUPABASE ? supabase : neonPool;
};

// Verificar conexão com o banco de dados atual
export const checkDbConnection = async () => {
  if (currentDatabase === DatabaseType.SUPABASE) {
    return await checkSupabaseConnection();
  } else {
    return await checkNeonConnection();
  }
};

// Inicializar banco de dados
export const initializeDatabase = async () => {
  try {
    // Verificar conexão com Supabase
    const supabaseConnected = await checkSupabaseConnection();
    
    // Verificar conexão com Neon
    const neonConnected = await checkNeonConnection();
    
    if (!supabaseConnected && !neonConnected) {
      console.error('Falha na conexão com ambos os bancos de dados');
      return false;
    }
    
    // Se Neon estiver conectado, inicializar
    if (neonConnected) {
      await initNeonDb();
    }
    
    // Definir banco de dados padrão
    if (supabaseConnected) {
      switchDatabase(DatabaseType.SUPABASE);
    } else if (neonConnected) {
      switchDatabase(DatabaseType.NEON);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    return false;
  }
};

// Executar query no banco de dados atual
export const executeDbQuery = async (query: string, params: any[] = []) => {
  try {
    if (currentDatabase === DatabaseType.SUPABASE) {
      // Para Supabase, converter a query SQL para chamada de API Supabase
      // Isso é uma simplificação, na prática precisaria mapear SQL para API Supabase
      console.warn('Execução direta de SQL no Supabase não implementada');
      return null;
    } else {
      // Para Neon, executar query diretamente
      const client = await neonPool.connect();
      try {
        const result = await client.query(query, params);
        return result;
      } finally {
        client.release();
      }
    }
  } catch (error) {
    console.error('Erro ao executar query:', error);
    throw error;
  }
};
