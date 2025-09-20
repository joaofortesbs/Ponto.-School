
import { Client, Pool } from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL não configurada. Configure o banco PostgreSQL no Replit.');
}

// Pool de conexões para melhor performance
export const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Cliente único para operações simples
export const client = new Client({
  connectionString: databaseUrl
});

// Função auxiliar para verificar a conexão
export const checkDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    
    try {
      const result = await client.query('SELECT NOW()');
      console.log('Conexão com PostgreSQL estabelecida com sucesso!');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao conectar com PostgreSQL:', error);
    return false;
  }
};

// Função para executar queries
export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

// Função para autenticação (substituindo Supabase Auth)
export const auth = {
  signUp: async (email: string, password: string, userData?: any) => {
    try {
      const hashedPassword = await hashPassword(password);
      
      const userResult = await query(`
        INSERT INTO users (email, password_hash, email_confirmed)
        VALUES ($1, $2, $3)
        RETURNING id, email, created_at
      `, [email, hashedPassword, false]);
      
      const user = userResult.rows[0];
      
      // Criar perfil
      await query(`
        INSERT INTO profiles (id, email, display_name, full_name, username)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        user.id,
        email,
        userData?.display_name || userData?.username || userData?.full_name || email,
        userData?.full_name,
        userData?.username
      ]);
      
      return { data: { user }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
  
  signIn: async (email: string, password: string) => {
    try {
      const result = await query(`
        SELECT id, email, password_hash, created_at
        FROM users
        WHERE email = $1
      `, [email]);
      
      if (result.rows.length === 0) {
        return { data: null, error: { message: 'Usuário não encontrado' } };
      }
      
      const user = result.rows[0];
      const isValidPassword = await verifyPassword(password, user.password_hash);
      
      if (!isValidPassword) {
        return { data: null, error: { message: 'Senha incorreta' } };
      }
      
      // Atualizar último login
      await query(`
        UPDATE users SET last_sign_in_at = NOW()
        WHERE id = $1
      `, [user.id]);
      
      return { data: { user: { id: user.id, email: user.email } }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },
  
  getUser: async () => {
    // Implementar lógica de sessão aqui
    const userId = getCurrentUserId(); // Implementar função de sessão
    if (!userId) return { data: { user: null }, error: null };
    
    try {
      const result = await query(`
        SELECT id, email, created_at
        FROM users
        WHERE id = $1
      `, [userId]);
      
      return { data: { user: result.rows[0] || null }, error: null };
    } catch (error) {
      return { data: { user: null }, error };
    }
  }
};

// Funções auxiliares para hash de senha
const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = require('bcrypt');
  return await bcrypt.hash(password, 10);
};

const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const bcrypt = require('bcrypt');
  return await bcrypt.compare(password, hash);
};

// Função para gerenciar sessão (implementar conforme necessário)
const getCurrentUserId = (): string | null => {
  // Implementar lógica de sessão (JWT, cookies, etc.)
  return localStorage.getItem('currentUserId');
};

export default { pool, client, query, auth, checkDatabaseConnection };
