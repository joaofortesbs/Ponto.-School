
// Compatibilidade com Supabase - usando novo sistema Neon
import { ApiClient } from "@/services/api-client";

// Objeto de compatibilidade que simula a API do Supabase mas usa nosso novo sistema
export const supabase = {
  auth: ApiClient.auth,
  from: (table: string) => ApiClient.from(table),
  rpc: ApiClient.rpc,
};

// Função auxiliar para verificar a conexão (agora usando Neon)
export const checkSupabaseConnection = async () => {
  try {
    const { database, message } = await ApiClient.testDatabase();
    console.log('Conexão com banco Neon:', message);
    return database === 'conectado';
  } catch (error) {
    console.error('Erro ao conectar com banco Neon:', error);
    return false;
  }
};

// Função de compatibilidade (não mais necessária com Neon)
export const setupSupabaseHealthCheck = async () => {
  console.log('Health check não necessário com banco Neon');
};
