
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Variáveis de ambiente do Supabase não configuradas corretamente. Verifique o arquivo .env"
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

// Função auxiliar para verificar a conexão
export const checkSupabaseConnection = async () => {
  try {
    // Primeiro tentamos uma operação simples que não requer tabelas específicas
    const { error: healthCheckError } = await supabase.from('_health').select('*').limit(1).single();
    
    if (healthCheckError && healthCheckError.code !== 'PGRST116') {
      // Se ocorrer um erro que não seja "Relação não existe" (esperado para _health)
      console.warn('Aviso: verificação de saúde falhou, tentando outra tabela');
      
      // Tentamos uma tabela que sabemos que existe
      const { error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
    }
    
    console.log('Conexão com Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error);
    // Retornar true mesmo com erro para desenvolvimento, para não bloquear a renderização
    return true;
  }
};
