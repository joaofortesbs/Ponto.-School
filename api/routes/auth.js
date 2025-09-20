
import express from 'express';
import { signUp, signIn, getUserFromToken, authMiddleware } from '../lib/auth.js';
import { query } from '../lib/database.js';

const router = express.Router();

// Registrar usuário
router.post('/signup', async (req, res) => {
  try {
    const { email, password, userData } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await signUp(email, password, userData);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Definir cookie seguro
    res.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    res.json({
      success: true,
      user: result.user
    });
  } catch (error) {
    console.error('Signup route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login usuário
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await signIn(email, password);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Definir cookie seguro
    res.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    });

    res.json({
      success: true,
      user: result.user
    });
  } catch (error) {
    console.error('Signin route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout usuário
router.post('/signout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Obter usuário atual
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Verificar se username está disponível - versão melhorada
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Validações básicas
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ 
        available: false,
        error: 'Username é obrigatório' 
      });
    }

    // Limpar e validar o username
    const cleanUsername = username.trim().toLowerCase();
    
    // Verificar comprimento
    if (cleanUsername.length === 0) {
      return res.json({
        available: false,
        error: 'Username não pode estar vazio'
      });
    }

    if (cleanUsername.length < 3) {
      return res.json({
        available: false,
        error: 'Username deve ter pelo menos 3 caracteres'
      });
    }

    if (cleanUsername.length > 30) {
      return res.json({
        available: false,
        error: 'Username deve ter no máximo 30 caracteres'
      });
    }

    // Verificar se contém apenas caracteres válidos
    const validPattern = /^[a-z0-9_]+$/;
    if (!validPattern.test(cleanUsername)) {
      return res.json({
        available: false,
        error: 'Username deve conter apenas letras minúsculas, números e sublinhados'
      });
    }

    // Verificar palavras reservadas
    const reservedWords = ['admin', 'api', 'root', 'system', 'user', 'null', 'undefined', 'test', 'support'];
    if (reservedWords.includes(cleanUsername)) {
      return res.json({
        available: false,
        error: 'Este username está reservado'
      });
    }
    
    // Consultar banco de dados com timeout
    console.log(`Verificando username no banco: ${cleanUsername}`);
    
    let result;
    try {
      // Usar uma query mais específica e rápida
      result = await query(
        'SELECT 1 FROM profiles WHERE LOWER(username) = $1 LIMIT 1',
        [cleanUsername]
      );
    } catch (dbError) {
      console.error('Erro na consulta do banco de dados:', dbError);
      return res.status(500).json({ 
        available: false,
        error: 'Erro temporário no servidor. Tente novamente em alguns instantes.' 
      });
    }

    const isAvailable = result.rows.length === 0;

    console.log(`Username ${cleanUsername} disponível: ${isAvailable}`);

    res.json({
      available: isAvailable,
      message: isAvailable ? 'Username disponível' : 'Username já está em uso'
    });
  } catch (error) {
    console.error('Erro crítico ao verificar username:', error);
    res.status(500).json({ 
      available: false,
      error: 'Erro interno do servidor. Por favor, tente novamente.' 
    });
  }
});

// Resolver username → email para login
router.post('/resolve-username', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const result = await query(
      'SELECT u.email FROM profiles p JOIN users u ON p.id = u.id WHERE LOWER(p.username) = LOWER($1)',
      [username.trim()]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Username not found' });
    }
    
    res.json({ email: result.rows[0].email });
  } catch (error) {
    console.error('Error resolving username:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Criar/Atualizar perfil do usuário
router.post('/create-profile', authMiddleware, async (req, res) => {
  try {
    const { profileData } = req.body;
    const userId = req.user.id;

    if (!profileData) {
      return res.status(400).json({ error: 'Profile data is required' });
    }

    const result = await query(`
      INSERT INTO profiles (
        id, email, username, full_name, display_name, institution, state, birth_date, plan_type,
        level, rank, xp, coins, balance, expert_balance, activity_status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        full_name = EXCLUDED.full_name,
        display_name = EXCLUDED.display_name,
        institution = EXCLUDED.institution,
        state = EXCLUDED.state,
        birth_date = EXCLUDED.birth_date,
        plan_type = EXCLUDED.plan_type,
        updated_at = NOW()
      RETURNING *
    `, [
      userId,
      profileData.email || req.user.email,
      profileData.username,
      profileData.full_name,
      profileData.display_name || profileData.username,
      profileData.institution,
      profileData.state,
      profileData.birth_date,
      profileData.plan_type || 'lite',
      1, // level
      'Aprendiz', // rank
      0, // xp
      100, // coins
      150, // balance
      0, // expert_balance
      'online' // activity_status
    ]);

    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verificar disponibilidade de email
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ available: false, error: 'Email is required' });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({ available: false, error: 'Invalid email format' });
    }

    const result = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    res.json({ available: result.rows.length === 0 });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ available: false, error: 'Internal server error' });
  }
});

export default router;
