export { supabase } from '@/integrations/supabase/client';

export const checkSupabaseConnection = async (): Promise<boolean> => {
  console.log('[Auth] Sistema de autenticação via backend Neon ativo');
  return true;
};

export const setupSupabaseHealthCheck = async (): Promise<void> => {
  console.log('[Auth] Health check via backend');
};
