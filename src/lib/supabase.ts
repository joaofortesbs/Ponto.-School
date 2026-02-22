
import { supabase as _supabase } from "@/integrations/supabase/client";

export const supabase = _supabase;

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    if (!_supabase) {
      console.error('Cliente Supabase não inicializado corretamente');
      return false;
    }

    const { error } = await _supabase.from('profiles').select('count').limit(1);

    if (error) {
      if (error.code === 'PGRST204') {
        console.log('Conexão com Supabase estabelecida com sucesso!');
        return true;
      }
      console.error('Erro ao conectar com Supabase:', error);
      return false;
    }

    console.log('Conexão com Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error);
    return false;
  }
};

export const setupSupabaseHealthCheck = async (): Promise<void> => {
  console.warn('Chave de serviço do Supabase não configurada para criar função de ping');
};
