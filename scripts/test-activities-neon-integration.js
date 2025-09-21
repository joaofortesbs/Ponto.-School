
const { neonDB } = require('../api/neon-db.js');

async function testActivitiesIntegration() {
  console.log('🧪 Testando integração Activities + Neon...');
  
  try {
    // 1. Testar conexão
    console.log('\n1️⃣ Testando conexão...');
    const connectionOk = await neonDB.testConnection();
    if (!connectionOk) {
      throw new Error('Falha na conexão com Neon');
    }
    console.log('✅ Conexão OK');

    // 2. Verificar se tabela existe
    console.log('\n2️⃣ Verificando tabela activities...');
    const tableExists = await neonDB.tableExists('activities');
    if (!tableExists) {
      console.log('⚠️ Tabela activities não existe, criando...');
      await neonDB.createActivitiesTable();
    }
    console.log('✅ Tabela activities OK');

    // 3. Teste de criação de atividade
    console.log('\n3️⃣ Testando criação de atividade...');
    const testActivity = {
      user_id: 'test_user_' + Date.now(),
      activity_code: 'test_sp_' + Date.now(),
      type: 'lista-exercicios',
      title: 'Atividade de Teste School Power',
      content: {
        originalData: { subject: 'Matemática', theme: 'Álgebra' },
        generatedContent: { exercises: ['Ex 1', 'Ex 2'] },
        schoolPowerMetadata: {
          constructedAt: new Date().toISOString(),
          source: 'test_script',
          isBuilt: true
        }
      }
    };

    const createResult = await neonDB.createActivity(testActivity);
    if (!createResult.success) {
      throw new Error('Falha ao criar atividade: ' + createResult.error);
    }
    console.log('✅ Atividade criada:', createResult.data[0]?.activity_code);

    // 4. Teste de busca por código
    console.log('\n4️⃣ Testando busca por código...');
    const findResult = await neonDB.findActivityByCode(testActivity.activity_code);
    if (!findResult.success || findResult.data.length === 0) {
      throw new Error('Falha ao buscar atividade');
    }
    console.log('✅ Atividade encontrada:', findResult.data[0].title);

    // 5. Teste de busca por usuário
    console.log('\n5️⃣ Testando busca por usuário...');
    const userActivities = await neonDB.findActivitiesByUser(testActivity.user_id);
    if (!userActivities.success) {
      throw new Error('Falha ao buscar atividades do usuário');
    }
    console.log('✅ Atividades do usuário encontradas:', userActivities.data.length);

    // 6. Teste de atualização
    console.log('\n6️⃣ Testando atualização...');
    const updateResult = await neonDB.updateActivity(testActivity.activity_code, {
      title: 'Atividade Atualizada',
      content: {
        ...testActivity.content,
        updated: true,
        updatedAt: new Date().toISOString()
      }
    });
    if (!updateResult.success) {
      throw new Error('Falha ao atualizar atividade');
    }
    console.log('✅ Atividade atualizada');

    // 7. Limpeza - deletar atividade de teste
    console.log('\n7️⃣ Limpando dados de teste...');
    const deleteResult = await neonDB.deleteActivity(testActivity.activity_code);
    if (!deleteResult.success) {
      console.warn('⚠️ Falha ao deletar atividade de teste');
    } else {
      console.log('✅ Dados de teste removidos');
    }

    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Integração Activities + Neon está funcionando corretamente');

  } catch (error) {
    console.error('\n❌ TESTE FALHOU:', error.message);
    process.exit(1);
  }
}

testActivitiesIntegration();
