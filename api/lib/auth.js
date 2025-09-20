import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Função para gerar hash da senha
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Função para verificar senha
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Função para gerar token JWT
export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      username: user.username 
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

// Função para verificar token JWT
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
    // Verificar se o email já existe
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return { success: false, error: 'Email already registered' };
    }

    // Verificar se o username já existe (se fornecido)
    if (userData.username) {
      const cleanUsername = userData.username.trim().toLowerCase();
      const existingUsername = await query(
        'SELECT username FROM profiles WHERE LOWER(username) = $1',
        [cleanUsername]
      );

      if (existingUsername.rows.length > 0) {
        return { success: false, error: 'Username already taken' };
      }
    }

    // Hash da senha
    const passwordHash = await hashPassword(password);

    // Criar usuário
    const userResult = await query(
      'INSERT INTO users (email, password_hash, email_confirmed, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, email, created_at',
      [email, passwordHash, true]
    );

    const user = userResult.rows[0];

    // Criar perfil
    await query(
      'INSERT INTO profiles (id, email, display_name, full_name, username, institution, state, birth_date, plan_type, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())',
      [
        user.id,
        email,
        userData.display_name || userData.username || userData.full_name || email.split('@')[0],
        userData.full_name || '',
        userData.username || email.split('@')[0],
        userData.institution || '',
        userData.state || '',
        userData.birth_date || null,
        userData.plan_type || 'free'
      ]
    );

    const token = generateToken(user);

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
    console.error('Error in signUp:', error);
    return { success: false, error: 'Internal server error' };
  }
};

// Login do usuário
export const signIn = async (email, password) => {
  try {
    const result = await query(
      'SELECT u.id, u.email, u.password_hash, u.created_at, p.username, p.display_name FROM users u LEFT JOIN profiles p ON u.id = p.id WHERE u.email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'Invalid credentials' };
    }

    const user = result.rows[0];
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Atualizar último login
    await query(
      'UPDATE users SET last_sign_in_at = NOW(), updated_at = NOW() WHERE id = $1',
      [user.id]
    );

    const token = generateToken(user);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        created_at: user.created_at
      },
      token
    };
  } catch (error) {
    console.error('Error in signIn:', error);
    return { success: false, error: 'Internal server error' };
  }
};

// Obter usuário do token
export const getUserFromToken = async (token) => {
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    const result = await query(
      'SELECT u.id, u.email, u.created_at, p.username, p.display_name, p.full_name FROM users u LEFT JOIN profiles p ON u.id = p.id WHERE u.id = $1',
      [decoded.id]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error in getUserFromToken:', error);
    return null;
  }
};

// Middleware de autenticação
export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

