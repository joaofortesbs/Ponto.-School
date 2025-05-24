
/**
 * Cliente de conexão ao banco de dados PostgreSQL do Replit
 */

import { Pool } from 'pg';

// Verificar se a variável de ambiente DATABASE_URL está definida
const databaseUrl = import.meta.env.DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    "Variável de ambiente DATABASE_URL não configurada. Verifique se você criou um banco de dados no Replit."
  );
}

// Configurar o pool de conexões para melhor desempenho
// Alteramos a URL para usar o pooler do serviço Replit PostgreSQL
const connectionPoolUrl = databaseUrl ? databaseUrl.replace('.us-east-2', '-pooler.us-east-2') : '';

// Criar o pool de conexões
export const dbPool = new Pool({
  connectionString: connectionPoolUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Função para verificar a conexão com o banco de dados
export const checkDatabaseConnection = async () => {
  try {
    // Primeiro verificamos se o pool foi inicializado corretamente
    if (!dbPool) {
      console.error('Pool de conexão não inicializado corretamente');
      return false;
    }

    // Tentamos uma operação simples para verificar conexão
    const client = await dbPool.connect();
    try {
      const result = await client.query('SELECT NOW() as now');
      console.log('Conexão com banco de dados estabelecida com sucesso!');
      console.log('Hora do servidor:', result.rows[0].now);
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao conectar com banco de dados:', error);
    return false;
  }
};

// Função auxiliar para executar consultas
export const query = async (text: string, params: any[] = []) => {
  const client = await dbPool.connect();
  try {
    const start = Date.now();
    const res = await client.query(text, params);
    const duration = Date.now() - start;
    console.log('Consulta executada', { text, duration, rows: res.rowCount });
    return res;
  } finally {
    client.release();
  }
};

// Função para inserir um perfil de usuário
export const createUserProfile = async (profileData: {
  id: string;
  display_name?: string;
  email?: string;
  username?: string;
}) => {
  const { id, display_name, email, username } = profileData;
  
  try {
    const result = await query(
      `INSERT INTO profiles (id, display_name, email, username) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (id) DO UPDATE 
       SET display_name = $2, email = $3, username = $4, updated_at = NOW()
       RETURNING *`,
      [id, display_name, email, username]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar/atualizar perfil:', error);
    throw error;
  }
};

// Função para buscar um perfil de usuário
export const getUserProfile = async (userId: string) => {
  try {
    const result = await query('SELECT * FROM profiles WHERE id = $1', [userId]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    throw error;
  }
};

// Exportar para uso no resto da aplicação
export default {
  query,
  checkDatabaseConnection,
  createUserProfile,
  getUserProfile,
};
