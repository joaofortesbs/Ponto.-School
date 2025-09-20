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

// Verificar se username está disponível
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const result = await query(
      'SELECT username FROM profiles WHERE username = $1',
      [username]
    );

    res.json({
      available: result.rows.length === 0
    });
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      'SELECT u.email FROM profiles p JOIN users u ON p.user_id = u.id WHERE p.username = $1',
      [username]
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

// Criar perfil de usuário
router.post('/create-profile', authMiddleware, async (req, res) => {
  try {
    const { 
      username, 
      full_name, 
      display_name, 
      institution, 
      state, 
      birth_date, 
      plan_type 
    } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Verificar se username já existe
    const existingUsername = await query(
      'SELECT id FROM profiles WHERE username = $1',
      [username]
    );

    if (existingUsername.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Verificar se perfil já existe para este usuário
    const existingProfile = await query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (existingProfile.rows.length > 0) {
      return res.status(400).json({ error: 'Profile already exists' });
    }

    // Criar perfil
    const result = await query(
      `INSERT INTO profiles (
        user_id, username, full_name, display_name, 
        institution, state, birth_date, plan_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, username, full_name, display_name, institution, state, birth_date, plan_type, created_at`,
      [
        req.user.userId,
        username,
        full_name || null,
        display_name || username,
        institution || null,
        state || null,
        birth_date || null,
        plan_type || 'lite'
      ]
    );

    res.json({
      success: true,
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Atualizar perfil de usuário
router.put('/update-profile', authMiddleware, async (req, res) => {
  try {
    const { 
      username, 
      full_name, 
      display_name, 
      institution, 
      state, 
      birth_date, 
      plan_type 
    } = req.body;

    // Verificar se perfil existe
    const existingProfile = await query(
      'SELECT id FROM profiles WHERE user_id = $1',
      [req.user.userId]
    );

    if (existingProfile.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Se username está sendo alterado, verificar se já existe
    if (username) {
      const existingUsername = await query(
        'SELECT id FROM profiles WHERE username = $1 AND user_id != $2',
        [username, req.user.userId]
      );

      if (existingUsername.rows.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }

    // Atualizar perfil
    const result = await query(
      `UPDATE profiles SET 
        username = COALESCE($2, username),
        full_name = COALESCE($3, full_name),
        display_name = COALESCE($4, display_name),
        institution = COALESCE($5, institution),
        state = COALESCE($6, state),
        birth_date = COALESCE($7, birth_date),
        plan_type = COALESCE($8, plan_type),
        updated_at = NOW()
      WHERE user_id = $1
      RETURNING id, username, full_name, display_name, institution, state, birth_date, plan_type, updated_at`,
      [
        req.user.userId,
        username,
        full_name,
        display_name,
        institution,
        state,
        birth_date,
        plan_type
      ]
    );

    res.json({
      success: true,
      profile: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;