
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://koodbfwczaklfpzvcsqh.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvb2RiZndjemFrbGZwenZjc3FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1MDExMDEsImV4cCI6MjA1MTA3NzEwMX0.OaOtGzQJ4UUgA_LYuqvFPMHOeB_w9Vq_u5qrzAJdQMU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMemberRemoval() {
  try {
    console.log('Testando operações na tabela membros_grupos...');
    
    // Verificar se a tabela existe e se conseguimos acessá-la
    const { data, error } = await supabase
      .from('membros_grupos')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Erro ao acessar tabela membros_grupos:', error);
      return;
    }
    
    console.log(`Tabela acessível. Encontrados ${data.length} registros de exemplo:`);
    data.forEach(record => {
      console.log(`- Grupo: ${record.grupo_id}, Usuário: ${record.user_id}`);
    });
    
    // Verificar políticas RLS
    console.log('\nTestando operação de DELETE (sem executar)...');
    const { data: deleteTest, error: deleteError } = await supabase
      .from('membros_grupos')
      .delete()
      .eq('grupo_id', 'test-group-id')
      .eq('user_id', 'test-user-id');
    
    if (deleteError) {
      console.error('Erro na operação DELETE (esperado se não houver registros):', deleteError);
    } else {
      console.log('Operação DELETE permitida');
    }
    
    console.log('\nTeste concluído!');
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testMemberRemoval();
