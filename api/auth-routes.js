import express from 'express';
import { neonDB } from './neon-db.js';

const router = express.Router();

// Middleware para verificar autenticação
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token de acesso necessário' });
    }

    const { user, error } = await neonDB.verifyToken(token);
    
    if (error || !user) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Rota de registro
router.post('/register', async (req, res) => {
  try {
    const { email, password, userData } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Email inválido' 
      });
    }

    // Validação básica de senha
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Senha deve ter pelo menos 6 caracteres' 
      });
    }

    const { user, session, error } = await neonDB.register(email, password, userData);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (!user) {
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }

    // Fazer login automaticamente após registro
    const { user: loginUser, session: loginSession, error: loginError } = await neonDB.signInWithPassword(email, password);

    if (loginError || !loginSession) {
      // Usuário foi criado mas login falhou
      return res.status(201).json({ 
        user,
        message: 'Usuário criado com sucesso. Faça login para continuar.'
      });
    }

    res.status(201).json({
      user: loginUser,
      session: loginSession,
      message: 'Registro realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }

    const { user, session, error } = await neonDB.signInWithPassword(email, password);

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    if (!user || !session) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    res.json({
      user,
      session,
      message: 'Login realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para verificar token
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    // Se chegou até aqui, o token é válido (middleware authenticateToken passou)
    res.json({
      user: req.user,
      message: 'Token válido'
    });
  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar perfil do usuário
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { data: profile, error } = await neonDB.getProfile(req.user.id);

    if (error) {
      return res.status(404).json({ error: error.message });
    }

    res.json({
      profile,
      message: 'Perfil recuperado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para atualizar perfil do usuário
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    // SEGURANÇA: Whitelist de campos permitidos para atualização
    const allowedFields = [
      'display_name', 
      'bio', 
      'avatar_url', 
      'instituição_ensino', 
      'estado_uf',
      'full_name'
    ];
    
    const updates = {};
    
    // Aplicar apenas campos permitidos
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    
    // Validar se há campos para atualizar
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Nenhum campo válido fornecido para atualização' });
    }

    const { data: updatedProfile, error } = await neonDB.updateProfile(req.user.id, updates);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      profile: updatedProfile,
      message: 'Perfil atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Com JWT, o logout é feito no lado cliente removendo o token
    // Esta rota pode ser usada para invalidar tokens em uma implementação mais avançada
    
    const { error } = await neonDB.signOut();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de teste de conexão com banco (CORRIGIDO)
router.get('/test-db', async (req, res) => {
  try {
    const result = await neonDB.testConnection();
    
    res.json({
      database: result.success ? 'conectado' : 'desconectado',
      message: result.success ? 'Banco Neon funcionando corretamente' : 'Erro na conexão com banco Neon',
      data: result.data
    });

  } catch (error) {
    console.error('Erro no teste de conexão:', error);
    res.status(500).json({ 
      database: 'erro',
      error: 'Erro interno do servidor' 
    });
  }
});

export default router;