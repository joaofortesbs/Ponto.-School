import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET environment variable is required!');
  process.exit(1);
}
const SALT_ROUNDS = 12;

// Gerar hash da senha
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// Verificar senha
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Gerar JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId, exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) }, // 24 horas
    JWT_SECRET
  );
};

// Verificar JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Registrar usuário
export const signUp = async (email, password, userData = {}) => {
  try {
    // Verificar se email já existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Email already registered');
    }

    // Hash da senha
    const passwordHash = await hashPassword(password);

    // Criar usuário
    const userResult = await query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, passwordHash]
    );

    const user = userResult.rows[0];

    // Criar perfil se dados fornecidos
    if (userData && Object.keys(userData).length > 0) {
      const {
        username,
        full_name,
        display_name,
        institution,
        state,
        birth_date,
        plan_type = 'free'
      } = userData;

      await query(
        `INSERT INTO profiles (user_id, username, full_name, display_name, institution, state, birth_date, plan_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.id, username, full_name, display_name, institution, state, birth_date, plan_type]
      );
    }

    // Gerar token
    const token = generateToken(user.id);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      token
    };
  } catch (error) {
    console.error('SignUp error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Login usuário
export const signIn = async (email, password) => {
  try {
    // Buscar usuário
    const userResult = await query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = userResult.rows[0];

    // Verificar senha
    const validPassword = await verifyPassword(password, user.password_hash);
    if (!validPassword) {
      throw new Error('Invalid email or password');
    }

    // Gerar token
    const token = generateToken(user.id);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      token
    };
  } catch (error) {
    console.error('SignIn error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Obter usuário pelo token
export const getUserFromToken = async (token) => {
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return { success: false, error: 'Invalid token' };
    }

    const userResult = await query(
      `SELECT u.id, u.email, p.username, p.full_name, p.display_name, p.institution, p.state, p.plan_type
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return { success: false, error: 'User not found' };
    }

    const user = userResult.rows[0];
    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('GetUser error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Middleware para verificar autenticação
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.auth_token || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const result = await getUserFromToken(token);
    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    req.user = result.user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};