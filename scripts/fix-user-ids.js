
// Script para corrigir IDs de usuários
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Inicializa o cliente Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sua-instancia.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para gerar um ID de usuário
function generateUserId(uf = 'BR', planType = 'lite') {
  const dataAtual = new Date();
  const anoMes = `${dataAtual.getFullYear().toString().slice(-2)}${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}`;
  const tipoConta = planType.toLowerCase() === 'premium' ? 1 : 2;
  const sequencial = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  
  return `${uf}${anoMes}${tipoConta}${sequencial}`;
}

// Função para executar SQL personalizado
async function executeSql(sql) {
  try {
    const { error } = await supabase.rpc('execute_sql', { sql_query: sql });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao executar SQL:', error);
    return false;
  }
}

// Função principal para corrigir IDs de usuários
async function fixUserIds() {
  console.log('Iniciando correção de IDs de usuários...');
  
  try {
    // 1. Atualiza o trigger para garantir que novos usuários recebam IDs
    const triggerSql = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      DECLARE
        gen_user_id TEXT;
        user_plan TEXT;
      BEGIN
        -- Define o plano padrão como 'lite' caso não esteja definido nos metadados
        user_plan := COALESCE(NEW.raw_user_meta_data->>'plan_type', 'lite');
        
        -- Gera um ID de usuário com formato BR + AnoMês + TipoConta(2=lite, 1=premium) + 6 dígitos aleatórios
        gen_user_id := 'BR' || 
                      to_char(NOW(), 'YYMM') || 
                      CASE WHEN user_plan = 'premium' THEN '1' ELSE '2' END ||
                      lpad(floor(random() * 1000000)::text, 6, '0');
        
        INSERT INTO public.profiles (
          id,
          email,
          display_name,
          full_name,
          username,
          institution,
          user_id,
          plan_type,
          role,
          birth_date
        )
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', NEW.email),
          NEW.raw_user_meta_data->>'full_name',
          NEW.raw_user_meta_data->>'username',
          NEW.raw_user_meta_data->>'institution',
          gen_user_id,
          user_plan,
          'student',
          (NEW.raw_user_meta_data->>'birth_date')::DATE
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    
    const triggerResult = await executeSql(triggerSql);
    console.log('Atualização do trigger:', triggerResult ? 'Sucesso' : 'Falha');
    
    // 2. Busca todos os perfis sem ID
    const { data: profilesWithoutId, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, plan_type')
      .or('user_id.is.null,user_id.eq.');
    
    if (fetchError) {
      console.error('Erro ao buscar perfis sem ID:', fetchError);
      return;
    }
    
    console.log(`Encontrados ${profilesWithoutId?.length || 0} perfis sem ID.`);
    
    // 3. Atualiza cada perfil com um novo ID
    let successCount = 0;
    
    if (profilesWithoutId?.length) {
      for (const profile of profilesWithoutId) {
        const newId = generateUserId('BR', profile.plan_type || 'lite');
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            user_id: newId,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);
        
        if (updateError) {
          console.error(`Erro ao atualizar ID do perfil ${profile.id}:`, updateError);
        } else {
          successCount++;
          console.log(`Perfil ${profile.id} atualizado com ID: ${newId}`);
        }
      }
    }
    
    console.log(`Processo concluído. ${successCount} perfis atualizados com sucesso.`);
    
  } catch (error) {
    console.error('Erro durante o processo de correção de IDs:', error);
  }
}

// Executar o script
fixUserIds()
  .then(() => {
    console.log('Script finalizado.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });
