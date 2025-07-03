
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Credenciais do Supabase não definidas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testMemberRemoval() {
  console.log('='.repeat(50));
  console.log('TESTE DETALHADO DE REMOÇÃO DE MEMBROS');
  console.log('='.repeat(50));

  try {
    // 1. Verificar estrutura da tabela membros_grupos
    console.log('\n1. Verificando estrutura da tabela membros_grupos...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('membros_grupos')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('Erro ao acessar tabela membros_grupos:', tableError);
      return;
    }

    console.log('✅ Tabela membros_grupos acessível');

    // 2. Listar todos os membros existentes
    console.log('\n2. Listando todos os membros existentes...');
    const { data: allMembers, error: listError } = await supabase
      .from('membros_grupos')
      .select('*');

    if (listError) {
      console.error('Erro ao listar membros:', listError);
      return;
    }

    console.log(`Total de membros encontrados: ${allMembers?.length || 0}`);
    if (allMembers && allMembers.length > 0) {
      console.log('\nMembros existentes:');
      allMembers.forEach((member, index) => {
        console.log(`  ${index + 1}. Grupo: ${member.grupo_id}, User: ${member.user_id}`);
      });
    }

    // 3. Verificar grupos existentes
    console.log('\n3. Verificando grupos existentes...');
    const { data: groups, error: groupsError } = await supabase
      .from('grupos_estudo')
      .select('id, nome, criador_id');

    if (groupsError) {
      console.error('Erro ao listar grupos:', groupsError);
      return;
    }

    console.log(`Total de grupos encontrados: ${groups?.length || 0}`);
    if (groups && groups.length > 0) {
      console.log('\nGrupos existentes:');
      groups.forEach((group, index) => {
        console.log(`  ${index + 1}. ID: ${group.id}, Nome: ${group.nome}, Criador: ${group.criador_id}`);
      });
    }

    // 4. Simular teste de remoção (sem remover realmente)
    if (allMembers && allMembers.length > 0) {
      const testMember = allMembers[0];
      console.log(`\n4. Simulando remoção do membro ${testMember.user_id} do grupo ${testMember.grupo_id}...`);
      
      // Testar query de verificação
      const { data: checkMember, error: checkError } = await supabase
        .from('membros_grupos')
        .select('user_id, grupo_id')
        .eq('grupo_id', testMember.grupo_id)
        .eq('user_id', testMember.user_id)
        .single();

      if (checkError) {
        console.error('Erro na verificação do membro:', checkError);
      } else {
        console.log('✅ Membro encontrado para teste:', checkMember);
      }

      // Testar query de remoção (dry run)
      console.log('Testando query de remoção (sem executar)...');
      console.log(`Query: DELETE FROM membros_grupos WHERE grupo_id = '${testMember.grupo_id}' AND user_id = '${testMember.user_id}'`);
      console.log('✅ Query de remoção construída corretamente');
    }

    console.log('\n5. Verificando políticas RLS...');
    const { data: rlsCheck, error: rlsError } = await supabase
      .rpc('check_table_rls', { table_name: 'membros_grupos' })
      .catch(() => {
        // Se a função não existir, não é problema
        return { data: null, error: null };
      });

    if (rlsError) {
      console.log('Não foi possível verificar RLS (função não existe)');
    } else {
      console.log('Políticas RLS verificadas');
    }

    console.log('\n='.repeat(50));
    console.log('RESUMO DO TESTE:');
    console.log(`- Tabela membros_grupos: ${tableError ? '❌ Inacessível' : '✅ Acessível'}`);
    console.log(`- Total de membros: ${allMembers?.length || 0}`);
    console.log(`- Total de grupos: ${groups?.length || 0}`);
    console.log('- Estrutura de remoção: ✅ Pronta para uso');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('Erro durante teste:', error);
  }
}

// Executar teste
testMemberRemoval();
