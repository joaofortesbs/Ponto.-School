// MIGRADO: Este arquivo agora redireciona para a nova API
// Todas as chamadas diretas ao banco foram movidas para o backend

// Importar dos novos serviços de API
import { 
  auth, 
  authService,
  checkDatabaseConnection,
  checkAuthentication,
  User 
} from '@/services/api';

// Re-exportar para compatibilidade com código existente
export { auth, checkDatabaseConnection, checkAuthentication };
export type { User };

// Exportação de compatibilidade temporária para arquivos antigos
export const supabase = {
  auth: {
    signUp: auth.signUp,
    signIn: auth.signIn,
    signOut: auth.signOut,
    getUser: auth.getUser,
    getSession: auth.getUser, // Alias para compatibilidade
  },
  from: (table: string) => {
    console.warn(`supabase.from('${table}') is deprecated. Use API services instead.`);
    return {
      select: () => Promise.reject(new Error('Use API services instead of supabase.from()')),
      insert: () => Promise.reject(new Error('Use API services instead of supabase.from()')),
      update: () => Promise.reject(new Error('Use API services instead of supabase.from()')),
      delete: () => Promise.reject(new Error('Use API services instead of supabase.from()')),
      upsert: () => Promise.reject(new Error('Use API services instead of supabase.from()')),
    };
  },
  rpc: (fn: string) => {
    console.warn(`supabase.rpc('${fn}') is deprecated. Use API services instead.`);
    return Promise.reject(new Error('Use API services instead of supabase.rpc()'));
  },
};

// Mock da função query (não deve ser usada no frontend)
export const query = async (sql: string, params?: any[]) => {
  console.error('Direct database queries not allowed in frontend. Use API endpoints instead.');
  throw new Error('Direct database queries not allowed in client. Use API endpoints instead.');
};

// Outras exportações para compatibilidade
export const pool = null; // Não disponível no frontend
export const client = null; // Não disponível no frontend

// Export default para compatibilidade
export default supabase;