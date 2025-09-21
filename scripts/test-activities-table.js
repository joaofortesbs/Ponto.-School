
import { neonDB } from '../api/neon-db.js';

async function testActivitiesTable() {
  console.log('🔧 Testando tabela activities...');
  
  try {
    // 1. Testar conexão
    console.log('1️⃣ Testando conexão...');
    const connectionTest = await neonDB.testConnection();
    if (!connectionTest) {
      throw new Error('Falha na conexão');
    }
    
    // 2. Verificar se tabela existe
    console.log('2️⃣ Verificando se tabela activities existe...');
    const tableExists = await neonDB.tableExists('activities');
    console.log(`Tabela activities existe: ${tableExists}`);
    
    if (!tableExists) {
      console.log('3️⃣ Criando tabela activities...');
      await neonDB.createActivitiesTable();
    }
    
    // 4. Testar criação de atividade
    console.log('4️⃣ Testando criação de atividade...');
    const testActivity = {
      user_id: 'test-user-123',
      activity_code: `test-${Date.now()}`,
      type: 'lista-exercicios',
      title: 'Teste de Atividade',
      content: {
        description: 'Atividade de teste',
        questions: [],
        createdAt: new Date().toISOString(),
        isTest: true
      }
    };
    
    const createResult = await neonDB.createActivity(testActivity);
    console.log('Resultado da criação:', createResult);
    
    if (createResult.success && createResult.data.length > 0) {
      const createdActivity = createResult.data[0];
      console.log('✅ Atividade criada com sucesso:', createdActivity.activity_code);
      
      // 5. Testar busca por código
      console.log('5️⃣ Testando busca por código...');
      const findResult = await neonDB.findActivityByCode(createdActivity.activity_code);
      console.log('Resultado da busca:', findResult.success ? 'Encontrada' : 'Não encontrada');
      
      // 6. Testar busca por usuário
      console.log('6️⃣ Testando busca por usuário...');
      const userActivities = await neonDB.findActivitiesByUser(testActivity.user_id);
      console.log(`Atividades do usuário encontradas: ${userActivities.data?.length || 0}`);
      
      // 7. Testar atualização
      console.log('7️⃣ Testando atualização...');
      const updateResult = await neonDB.updateActivity(createdActivity.activity_code, {
        title: 'Teste Atualizado',
        content: {
          ...testActivity.content,
          updatedAt: new Date().toISOString()
        }
      });
      console.log('Resultado da atualização:', updateResult.success ? 'Sucesso' : 'Falha');
      
      // 8. Limpeza - deletar atividade de teste
      console.log('8️⃣ Limpando dados de teste...');
      const deleteResult = await neonDB.deleteActivity(createdActivity.activity_code);
      console.log('Resultado da deleção:', deleteResult.success ? 'Sucesso' : 'Falha');
      
    } else {
      throw new Error('Falha ao criar atividade de teste');
    }
    
    console.log('✅ Todos os testes passaram!');
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

testActivitiesTable();
