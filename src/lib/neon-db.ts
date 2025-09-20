import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Configuração do pool de conexões com Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const SALT_ROUNDS = 12;

// Interface para o usuário
export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  display_name?: string;
  bio?: string;
  user_id?: string;
  instituição_ensino?: string;
  estado_uf?: string;
}

// Interface para sessão
export interface Session {
  access_token: string;
  user: User;
}

// Classe principal do banco de dados
export class NeonDB {
  // Método para testar conexão
  async testConnection(): Promise<boolean> {
    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('Conexão com Neon estabelecida com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao conectar com Neon:', error);
      return false;
    }
  }

  // Gerar ID sequencial de usuário (como no Supabase)
  async generateSequentialUserId(uf: string, tipoConta: number): Promise<string | null> {
    const client = await pool.connect();
    try {
      // Gerar número sequencial baseado no último ID do estado
      const year = new Date().getFullYear().toString().slice(-2);
      const query = `
        SELECT user_id FROM profiles 
        WHERE user_id LIKE $1 
        ORDER BY user_id DESC 
        LIMIT 1
      `;
      const pattern = `${uf}%${tipoConta}${year}%`;
      const result = await client.query(query, [pattern]);
      
      let nextNumber = 1;
      if (result.rows.length > 0) {
        const lastId = result.rows[0].user_id;
        const numberPart = lastId.substring(2, 6);
        nextNumber = parseInt(numberPart) + 1;
      }
      
      const formattedNumber = nextNumber.toString().padStart(4, '0');
      const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const day = new Date().getDate().toString().padStart(2, '0');
      
      return `${uf}${formattedNumber}${tipoConta}${year}${month}${day}`;
    } catch (error) {
      console.error('Erro ao gerar ID sequencial:', error);
      return null;
    } finally {
      client.release();
    }
  }

  // Registrar novo usuário
  async signUp(email: string, password: string, userData?: Partial<User>): Promise<{ user: User | null; error: any }> {
    const client = await pool.connect();
    try {
      // Verificar se email já existe
      const existingUser = await client.query('SELECT id FROM profiles WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return { user: null, error: { message: 'Usuário já existe com este email' } };
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      
      // Gerar ID único
      const id = uuidv4();
      
      // Gerar user_id sequencial
      const uf = userData?.estado_uf || 'SP';
      const tipoConta = 2; // Padrão: básico
      const userId = await this.generateSequentialUserId(uf, tipoConta);
      
      // Inserir usuário
      const insertQuery = `
        INSERT INTO profiles (
          id, email, password_hash, full_name, role, avatar_url, 
          display_name, bio, user_id, instituição_ensino, estado_uf,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING id, email, full_name, role, avatar_url, created_at, updated_at, 
                  display_name, bio, user_id, instituição_ensino, estado_uf
      `;
      
      const values = [
        id,
        email,
        hashedPassword,
        userData?.full_name || '',
        userData?.role || 'user',
        userData?.avatar_url || '',
        userData?.display_name || userData?.full_name || '',
        userData?.bio || '',
        userId,
        userData?.instituição_ensino || '',
        uf
      ];
      
      const result = await client.query(insertQuery, values);
      const user = result.rows[0];
      
      return { user, error: null };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { user: null, error };
    } finally {
      client.release();
    }
  }

  // Login do usuário
  async signInWithPassword(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: any }> {
    const client = await pool.connect();
    try {
      // Buscar usuário por email
      const query = `
        SELECT id, email, password_hash, full_name, role, avatar_url, 
               created_at, updated_at, display_name, bio, user_id, 
               instituição_ensino, estado_uf 
        FROM profiles 
        WHERE email = $1
      `;
      const result = await client.query(query, [email]);
      
      if (result.rows.length === 0) {
        return { user: null, session: null, error: { message: 'Usuário não encontrado' } };
      }
      
      const dbUser = result.rows[0];
      
      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, dbUser.password_hash);
      if (!isPasswordValid) {
        return { user: null, session: null, error: { message: 'Senha incorreta' } };
      }
      
      // Remover hash da senha do objeto retornado
      const { password_hash, ...user } = dbUser;
      
      // Gerar token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      const session: Session = {
        access_token: token,
        user
      };
      
      return { user, session, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      return { user: null, session: null, error };
    } finally {
      client.release();
    }
  }

  // Verificar token JWT
  async verifyToken(token: string): Promise<{ user: User | null; error: any }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      const client = await pool.connect();
      try {
        const query = `
          SELECT id, email, full_name, role, avatar_url, created_at, updated_at, 
                 display_name, bio, user_id, instituição_ensino, estado_uf 
          FROM profiles 
          WHERE id = $1
        `;
        const result = await client.query(query, [decoded.userId]);
        
        if (result.rows.length === 0) {
          return { user: null, error: { message: 'Usuário não encontrado' } };
        }
        
        return { user: result.rows[0], error: null };
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return { user: null, error };
    }
  }

  // Buscar perfil do usuário
  async getProfile(userId: string): Promise<{ data: User | null; error: any }> {
    const client = await pool.connect();
    try {
      const query = `
        SELECT id, email, full_name, role, avatar_url, created_at, updated_at, 
               display_name, bio, user_id, instituição_ensino, estado_uf 
        FROM profiles 
        WHERE id = $1
      `;
      const result = await client.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return { data: null, error: { message: 'Perfil não encontrado' } };
      }
      
      return { data: result.rows[0], error: null };
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return { data: null, error };
    } finally {
      client.release();
    }
  }

  // Atualizar perfil do usuário
  async updateProfile(userId: string, updates: Partial<User>): Promise<{ data: User | null; error: any }> {
    const client = await pool.connect();
    try {
      const fields = [];
      const values = [];
      let valueIndex = 1;
      
      // Construir query dinamicamente
      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id' && value !== undefined) {
          fields.push(`${key} = $${valueIndex}`);
          values.push(value);
          valueIndex++;
        }
      }
      
      if (fields.length === 0) {
        return { data: null, error: { message: 'Nenhum campo para atualizar' } };
      }
      
      fields.push(`updated_at = NOW()`);
      values.push(userId);
      
      const query = `
        UPDATE profiles 
        SET ${fields.join(', ')} 
        WHERE id = $${valueIndex}
        RETURNING id, email, full_name, role, avatar_url, created_at, updated_at, 
                  display_name, bio, user_id, instituição_ensino, estado_uf
      `;
      
      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        return { data: null, error: { message: 'Perfil não encontrado' } };
      }
      
      return { data: result.rows[0], error: null };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { data: null, error };
    } finally {
      client.release();
    }
  }

  // Logout (no lado cliente, apenas remover token)
  async signOut(): Promise<{ error: any }> {
    // No caso do JWT, o logout é feito no lado cliente removendo o token
    return { error: null };
  }
}

// Instância singleton
export const neonDB = new NeonDB();

// Função para verificar conexão na inicialização
export const checkNeonConnection = async () => {
  return await neonDB.testConnection();
};