import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const { Pool } = pg;

// Configurar pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Testar conexão
pool.query('SELECT NOW() as now, version() as version')
  .then(result => {
    console.log('✅ Database connected successfully:', result.rows[0]);
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err);
  });

// Função para inicializar tabelas se não existirem
const initializeTables = async () => {
  console.log('🔄 Inicializando tabelas...');
  
  try {
    // Criar tabela users (compatível com estrutura existente)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email_confirmed BOOLEAN DEFAULT FALSE,
        last_sign_in_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Criar tabela profiles
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255),
        username VARCHAR(50) UNIQUE,
        full_name VARCHAR(255),
        display_name VARCHAR(255),
        institution VARCHAR(255),
        state VARCHAR(2),
        birth_date DATE,
        plan_type VARCHAR(50) DEFAULT 'lite',
        level INTEGER DEFAULT 1,
        rank VARCHAR(50) DEFAULT 'Aprendiz',
        xp INTEGER DEFAULT 0,
        coins INTEGER DEFAULT 100,
        bio TEXT,
        phone VARCHAR(20),
        location VARCHAR(100),
        occupation VARCHAR(100),
        education VARCHAR(200),
        interests TEXT,
        website VARCHAR(255),
        social_links JSONB DEFAULT '{}',
        student_title TEXT,
        activity_status VARCHAR(20) DEFAULT 'online',
        cover_url TEXT,
        avatar_url TEXT,
        balance INTEGER DEFAULT 150,
        expert_balance INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Criar tabela de controle de IDs por UF
    await pool.query(`
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

    // Criar tabela de tarefas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tarefas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        titulo TEXT NOT NULL,
        descricao TEXT,
        status BOOLEAN DEFAULT FALSE,
        data_criacao TIMESTAMP DEFAULT NOW(),
        data_atualizacao TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing tables:', error);
    throw error;
  }
};

// Inicializar tabelas
initializeTables();

// SEGURANÇA: JWT_SECRET obrigatório
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('ERRO CRÍTICO: JWT_SECRET não definido');
  process.exit(1);
}

export const neonDB = {
  // Função para registrar usuário
  async register(email, password, userData = {}) {
    try {
      // Verificar se usuário já existe
      const existingUser = await pool.query(
        'SELECT id FROM profiles WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return {
          user: null,
          session: null,
          error: { message: 'Usuário já existe com este email' }
        };
      }

      // Hash da senha
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Inserir perfil direto na tabela profiles (deixar id ser gerado automaticamente)
      const profileResult = await pool.query(
        `INSERT INTO profiles (
          email, full_name, display_name, instituição_ensino, estado_uf, password_hash, role
        ) VALUES ($1, $2, $3, $4, $5, $6, 'student') RETURNING *`,
        [
          email,
          userData.full_name || '',
          userData.display_name || '',
          userData.instituição_ensino || '',
          userData.estado_uf || '',
          passwordHash
        ]
      );

      const user = profileResult.rows[0];

      // Gerar token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          display_name: user.display_name,
          role: user.role
        },
        session: { access_token: token },
        error: null
      };

    } catch (error) {
      console.error('Erro no registro:', error);
      return {
        user: null,
        session: null,
        error: { message: 'Erro interno do servidor' }
      };
    }
  },

  // Função para fazer login
  async signInWithPassword(email, password) {
    try {
      // Buscar usuário na tabela profiles
      const userResult = await pool.query(
        'SELECT * FROM profiles WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        return {
          user: null,
          session: null,
          error: { message: 'Usuário não encontrado' }
        };
      }

      const user = userResult.rows[0];

      // Verificar se tem senha (usuários criados pelo sistema novo)
      if (!user.password_hash) {
        return {
          user: null,
          session: null,
          error: { message: 'Usuário não tem senha configurada. Use a recuperação de senha.' }
        };
      }

      // Verificar senha
      const passwordValid = await bcrypt.compare(password, user.password_hash);
      if (!passwordValid) {
        return {
          user: null,
          session: null,
          error: { message: 'Senha incorreta' }
        };
      }

      // Atualizar último login
      await pool.query(
        'UPDATE profiles SET updated_at = NOW() WHERE id = $1',
        [user.id]
      );

      // Gerar token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          display_name: user.display_name,
          role: user.role
        },
        session: { access_token: token },
        error: null
      };

    } catch (error) {
      console.error('Erro no login:', error);
      return {
        user: null,
        session: null,
        error: { message: 'Erro interno do servidor' }
      };
    }
  },

  // Função para verificar token
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Buscar dados atualizados do usuário
      const userResult = await pool.query(
        'SELECT * FROM profiles WHERE id = $1',
        [decoded.userId]
      );

      if (userResult.rows.length === 0) {
        return {
          user: null,
          error: { message: 'Usuário não encontrado' }
        };
      }

      const user = userResult.rows[0];
      return {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          display_name: user.display_name,
          role: user.role
        },
        error: null
      };

    } catch (error) {
      return {
        user: null,
        error: { message: 'Token inválido' }
      };
    }
  },

  // Função para buscar perfil
  async getProfile(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM profiles WHERE id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return {
          data: null,
          error: { message: 'Usuário não encontrado' }
        };
      }

      return {
        data: result.rows[0],
        error: null
      };

    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return {
        data: null,
        error: { message: 'Erro interno do servidor' }
      };
    }
  }
};