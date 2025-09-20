import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

// Configuração do pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Função para executar queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Função para verificar conexão
export const checkDatabaseConnection = async () => {
  try {
    const result = await query('SELECT NOW() as now, version() as version');
    console.log('✅ Database connected successfully:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Função para inicializar tabelas básicas
export const initTables = async () => {
  try {
    // Criar tabelas essenciais se não existirem
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(50) UNIQUE,
        full_name VARCHAR(255),
        display_name VARCHAR(255),
        institution VARCHAR(255),
        state VARCHAR(2),
        birth_date DATE,
        plan_type VARCHAR(50) DEFAULT 'free',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS user_id_control_by_uf (
        id SERIAL PRIMARY KEY,
        uf VARCHAR(2) NOT NULL,
        ano_mes VARCHAR(7) NOT NULL,
        tipo_conta VARCHAR(20) NOT NULL,
        last_id INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(uf, ano_mes, tipo_conta)
      )
    `);

    console.log('✅ Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize tables:', error);
    return false;
  }
};

export default pool;