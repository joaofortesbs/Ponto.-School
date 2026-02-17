import neonDB from './neon-db.js';

// Função para inicializar o banco de dados
export const initializeDatabase = async () => {
  try {
    console.log('🚀 Inicializando banco de dados...');
    await neonDB.initializeDatabase();
    console.log('✅ Banco de dados inicializado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

// Função para testar conexão
export const testConnection = async () => {
  try {
    const isConnected = await neonDB.testConnection();
    return isConnected;
  } catch (error) {
    console.error('❌ Erro ao testar conexão:', error);
    throw error;
  }
};

// Exportar instância do neonDB
export { neonDB };

// Export padrão
export default {
  neonDB,
  initializeDatabase,
  testConnection
};