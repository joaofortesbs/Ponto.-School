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
    // Criar tabela users (SCHEMA REAL - INTEGER)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Criar tabela profiles (SCHEMA REAL - com colunas corretas)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        full_name TEXT,
        display_name TEXT,
        instituição_ensino TEXT,
        estado_uf TEXT,
        role TEXT DEFAULT 'student',
        avatar_url TEXT,
        bio TEXT,
        password_hash TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

    // Criar tabela de tarefas (SCHEMA REAL - consistente)
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

    // Criar tabela bio (NOVA TABELA)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bio (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        descript TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
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

// TEMPORÁRIO: JWT_SECRET para desenvolvimento (DEVE ser definido via env em produção)
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key_temp_123456789012345678901234567890';
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  Usando JWT_SECRET temporário para desenvolvimento - DEFINA via env em produção!');
}

export const neonDB = {
  // Função para registrar usuário
  async register(email, password, userData = {}) {
    console.log('🔄 Iniciando registro para:', email);
    console.log('📝 Dados do usuário:', userData);
    
    try {
      // Verificar se usuário já existe na tabela users
      console.log('🔍 Verificando se usuário já existe...');
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        console.log('❌ Usuário já existe com este email');
        return {
          user: null,
          session: null,
          error: { message: 'Usuário já existe com este email' }
        };
      }

      console.log('✅ Email disponível, criando usuário...');

      // Hash da senha
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // 1. Inserir usuário na tabela users (email + password)
      console.log('📝 Inserindo na tabela users...');
      const userResult = await pool.query(
        `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *`,
        [email, passwordHash]
      );

      const user = userResult.rows[0];
      console.log('✅ Usuário criado com ID:', user.id);

      // 2. Inserir perfil na tabela profiles (dados complementares)
      console.log('📝 Inserindo perfil na tabela profiles...');
      const profileResult = await pool.query(
        `INSERT INTO profiles (
          user_id, email, full_name, display_name, instituição_ensino, estado_uf, role
        ) VALUES ($1, $2, $3, $4, $5, $6, 'student') RETURNING *`,
        [
          user.id,  // FK para users
          email,
          userData.full_name || '',
          userData.display_name || '',
          userData.instituição_ensino || '',
          userData.estado_uf || 'SP'
          // role 'student' já está hardcoded no SQL
        ]
      );

      const profile = profileResult.rows[0];
      console.log('✅ Perfil criado com sucesso:', profile.id);

      // Gerar token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('✅ Registro concluído com sucesso!');

      return {
        user: {
          id: user.id,
          email: user.email,
          full_name: profile.full_name,
          display_name: profile.display_name,
          role: profile.role
        },
        session: { access_token: token },
        error: null
      };

    } catch (error) {
      console.error('❌ Erro no registro:', error);
      console.error('❌ Stack trace:', error.stack);
      return {
        user: null,
        session: null,
        error: { message: 'Erro interno do servidor: ' + error.message }
      };
    }
  },

  // Função para fazer login
  async signInWithPassword(email, password) {
    try {
      // Buscar usuário na tabela users (para verificar password_hash)
      const userResult = await pool.query(
        'SELECT * FROM users WHERE email = $1',
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

      // Verificar senha
      const passwordValid = await bcrypt.compare(password, user.password_hash);
      if (!passwordValid) {
        return {
          user: null,
          session: null,
          error: { message: 'Senha incorreta' }
        };
      }

      // Buscar dados do perfil
      const profileResult = await pool.query(
        'SELECT * FROM profiles WHERE user_id = $1',
        [user.id]
      );

      let profile = null;
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      }

      // Atualizar último login
      await pool.query(
        'UPDATE users SET updated_at = NOW() WHERE id = $1',
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
          full_name: profile?.full_name || '',
          display_name: profile?.display_name || '',
          role: profile?.role || 'student'
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
      
      // CRÍTICO: Buscar por users.id (INTEGER) que está no JWT, não profile.id (UUID)
      const userResult = await pool.query(
        `SELECT 
          u.id as user_id, 
          u.email, 
          p.full_name, 
          p.display_name, 
          p.role,
          p.avatar_url,
          p.bio
        FROM users u 
        LEFT JOIN profiles p ON u.id = p.user_id 
        WHERE u.id = $1`,
        [decoded.userId]
      );

      if (userResult.rows.length === 0) {
        return {
          user: null,
          error: { message: 'Usuário não encontrado' }
        };
      }

      const userData = userResult.rows[0];
      return {
        user: {
          id: userData.user_id, // RETORNA INTEGER (users.id) NÃO UUID!
          email: userData.email,
          full_name: userData.full_name || '',
          display_name: userData.display_name || '',
          role: userData.role || 'student',
          avatar_url: userData.avatar_url,
          bio: userData.bio
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

  // Função para buscar perfil (CORRIGIDO - usa user_id)
  async getProfile(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM profiles WHERE user_id = $1',
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
  },

  // Função para atualizar perfil (IMPLEMENTADO)
  async updateProfile(userId, updates) {
    try {
      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');
      
      const values = [userId, ...Object.values(updates)];
      
      const result = await pool.query(
        `UPDATE profiles SET ${setClause}, updated_at = NOW() WHERE user_id = $1 RETURNING *`,
        values
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
      console.error('Erro ao atualizar perfil:', error);
      return {
        data: null,
        error: { message: 'Erro interno do servidor' }
      };
    }
  },

  // Função para logout (IMPLEMENTADO)
  async signOut() {
    // JWT stateless - apenas retorna sucesso
    // Em implementação mais avançada, poderia invalidar tokens
    return {
      error: null,
      message: 'Logout realizado com sucesso'
    };
  },

  // Função para testar conexão (IMPLEMENTADO)
  async testConnection() {
    try {
      const result = await pool.query('SELECT NOW() as timestamp, version() as version');
      return {
        success: true,
        data: result.rows[0],
        error: null
      };
    } catch (error) {
      console.error('Erro na conexão:', error);
      return {
        success: false,
        data: null,
        error: { message: 'Erro na conexão com banco de dados' }
      };
    }
  }
};