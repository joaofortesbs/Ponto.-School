
import { Client, Pool } from 'pg';

// Configuração da conexão com o banco Neon
const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Pool de conexões para melhor performance
export const pool = new Pool(connectionConfig);

// Cliente único para operações simples
export const createClient = () => new Client(connectionConfig);

// Função para testar a conexão
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return { success: true, timestamp: result.rows[0].now };
  } catch (error) {
    console.error('Erro na conexão com o banco:', error);
    return { success: false, error: error.message };
  }
}

// Função para executar queries
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const result = await pool.query(query, params);
    return { success: true, data: result.rows, rowCount: result.rowCount };
  } catch (error) {
    console.error('Erro ao executar query:', error);
    return { success: false, error: error.message };
  }
}
