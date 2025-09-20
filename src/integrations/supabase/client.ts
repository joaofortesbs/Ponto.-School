// ARQUIVO DE COMPATIBILIDADE TEMPORÁRIO
// Este arquivo existe apenas para evitar erros de importação
// TODO: Remover quando todos os arquivos forem migrados para usar API endpoints

console.warn('DEPRECATED: src/integrations/supabase/client.ts is deprecated. Use API endpoints instead.');

// Exportações vazias para compatibilidade
export const supabase = {
  from: (table: string) => ({
    select: () => Promise.reject(new Error('Use API endpoints instead')),
    insert: () => Promise.reject(new Error('Use API endpoints instead')),
    update: () => Promise.reject(new Error('Use API endpoints instead')),
    delete: () => Promise.reject(new Error('Use API endpoints instead')),
    upsert: () => Promise.reject(new Error('Use API endpoints instead')),
  }),
  rpc: () => Promise.reject(new Error('Use API endpoints instead')),
  auth: {
    signUp: () => Promise.reject(new Error('Use API endpoints instead')),
    signIn: () => Promise.reject(new Error('Use API endpoints instead')),
    signOut: () => Promise.reject(new Error('Use API endpoints instead')),
  }
};

export const database = supabase;
export default supabase;