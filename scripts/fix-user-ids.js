
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
async function generateUserId(uf = 'SP', planType = 'lite') {
  // Garante que a UF seja válida e em maiúsculas
  if (!uf || uf.length !== 2 || uf === 'BR') {
    uf = 'SP';
  }
  uf = uf.toUpperCase();
  
  // Gera o formato correto de ano/mês
  const dataAtual = new Date();
  const anoMes = `${dataAtual.getFullYear().toString().slice(-2)}${(dataAtual.getMonth() + 1).toString().padStart(2, '0')}`;
  
  // Define o tipo de conta (1 para premium/full, 2 para lite)
  const tipoConta = planType.toLowerCase() === 'premium' || planType.toLowerCase() === 'full' ? 1 : 2;
  
  try {
    // Obtém o próximo ID sequencial
    const { data: controlData, error: controlError } = await supabase
      .from('user_id_control')
      .select('last_id')
      .single();
    
    let nextId = 1; // Começa do 1 se não existir
    
    if (controlError && controlError.code !== 'PGRST116') {
      console.error('Erro ao obter controle de ID:', controlError);
    } else if (controlData) {
      nextId = controlData.last_id + 1;
      
      // Atualiza o contador
      await supabase
        .from('user_id_control')
        .update({ last_id: nextId })
        .eq('id', controlData.id);
    } else {
      // Cria o registro inicial
      await supabase
        .from('user_id_control')
        .insert([{ last_id: nextId }]);
    }
    
    // Formata o número sequencial com zeros à esquerda
    const sequencial = nextId.toString().padStart(6, '0');
    return `${uf}${anoMes}${tipoConta}${sequencial}`;
    
  } catch (error) {
    console.error('Erro ao gerar ID de usuário:', error);
    // Fallback para um ID baseado em timestamp
    const sequencial = Date.now().toString().slice(-6);
    return `${uf}${anoMes}${tipoConta}${sequencial}`;
  }
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
    // 1. Atualiza a tabela de controle se necessário
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS user_id_control (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        last_id INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Inserir valor inicial se a tabela estiver vazia
      INSERT INTO user_id_control (last_id)
      SELECT 0
      WHERE NOT EXISTS (SELECT 1 FROM user_id_control);
    `;
    
    const tableResult = await executeSql(createTableSql);
    console.log('Verificação da tabela de controle:', tableResult ? 'Sucesso' : 'Falha');
    
    // 2. Criar ou atualizar o trigger para novos usuários
    const triggerSql = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      DECLARE
        gen_user_id TEXT;
        user_plan TEXT;
        user_state TEXT;
        id_tipo INT;
        next_seq INT;
      BEGIN
        -- Define o plano padrão como 'lite' caso não esteja definido nos metadados
        user_plan := COALESCE(NEW.raw_user_meta_data->>'plan_type', 'lite');
        user_state := COALESCE(NEW.raw_user_meta_data->>'state', 'SP');
        
        -- Valida o estado
        IF user_state IS NULL OR length(user_state) != 2 OR user_state = 'BR' THEN
          user_state := 'SP';
        END IF;
        
        -- Define o tipo de conta (1=full/premium, 2=lite)
        id_tipo := CASE WHEN user_plan = 'premium' OR user_plan = 'full' THEN 1 ELSE 2 END;
        
        -- Obtém o próximo número sequencial
        UPDATE user_id_control 
        SET last_id = last_id + 1 
        RETURNING last_id INTO next_seq;
        
        -- Se não houver registro na tabela de controle, cria um
        IF next_seq IS NULL THEN
          INSERT INTO user_id_control (last_id) VALUES (1) RETURNING last_id INTO next_seq;
        END IF;
        
        -- Gera um ID de usuário com formato UF + AnoMês + TipoConta + 6 dígitos sequenciais
        gen_user_id := user_state || 
                      to_char(NOW(), 'YYMM') || 
                      id_tipo ||
                      lpad(next_seq::text, 6, '0');
        
        INSERT INTO public.profiles (
          id,
          email,
          display_name,
          full_name,
          username,
          institution,
          state,
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
          user_state,
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
    
    // 3. Busca todos os perfis sem ID ou com ID incorreto
    const { data: profilesWithoutId, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email, plan_type, state')
      .or('user_id.is.null,user_id.eq.,user_id.like.BR%');
    
    if (fetchError) {
      console.error('Erro ao buscar perfis sem ID:', fetchError);
      return;
    }
    
    console.log(`Encontrados ${profilesWithoutId?.length || 0} perfis com ID incorreto ou ausente.`);
    
    // 4. Atualiza cada perfil com um novo ID
    let successCount = 0;
    
    if (profilesWithoutId?.length) {
      for (const profile of profilesWithoutId) {
        // Determina a UF do usuário
        let uf = profile.state;
        if (!uf || uf.length !== 2 || uf === 'BR') {
          uf = 'SP'; // Default para SP se não houver estado válido
          
          // Atualiza o estado para SP no perfil
          await supabase
            .from('profiles')
            .update({ state: uf })
            .eq('id', profile.id);
        }
        
        // Gera um novo ID usando a UF e o plano
        const newId = await generateUserId(uf, profile.plan_type || 'lite');
        
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
    
    console.log(`Atualização concluída. ${successCount} perfis atualizados com sucesso.`);
    
  } catch (error) {
    console.error('Erro ao corrigir IDs:', error);
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
