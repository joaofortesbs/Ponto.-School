import express from 'express';
import bcrypt from 'bcryptjs';
import neonDBModule from './neon-db.js';

const { neonDB } = neonDBModule;
const router = express.Router();

// Buscar perfil por email
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const result = await neonDB.findProfileByEmail(email);

    if (result.success && result.data.length > 0) {
      const profile = result.data[0];
      // Não retornar a senha
      delete profile.senha_hash;
      res.json({ profile });
    } else {
      res.status(404).json({ error: 'Perfil não encontrado' });
    }
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo perfil
router.post('/', async (req, res) => {
  try {
    const {
      nome_completo,
      nome_usuario,
      email,
      senha,
      tipo_conta,
      pais = 'Brasil',
      estado,
      instituicao_ensino
    } = req.body;

    // Validações básicas
    if (!nome_completo || !nome_usuario || !email || !senha || !tipo_conta || !estado || !instituicao_ensino) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Verificar se email já existe
    const emailExists = await neonDB.findProfileByEmail(email);
    if (emailExists.success && emailExists.data.length > 0) {
      return res.status(409).json({ error: 'Email já está em uso' });
    }

    // Verificar se nome de usuário já existe
    const usernameExists = await neonDB.findProfileByUsername(nome_usuario);
    if (usernameExists.success && usernameExists.data.length > 0) {
      return res.status(409).json({ error: 'Nome de usuário já está em uso' });
    }

    // Criptografar senha
    const senha_hash = await bcrypt.hash(senha, 12);

    // Criar perfil
    const result = await neonDB.createProfile({
      nome_completo,
      nome_usuario,
      email,
      senha_hash,
      tipo_conta,
      pais,
      estado,
      instituicao_ensino
    });

    if (result.success && result.data.length > 0) {
      const newProfile = result.data[0];
      // Não retornar a senha
      delete newProfile.senha_hash;
      res.status(201).json({ 
        message: 'Perfil criado com sucesso',
        profile: newProfile 
      });
    } else {
      res.status(500).json({ error: 'Erro ao criar perfil' });
    }

  } catch (error) {
    console.error('Erro ao criar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login - verificar credenciais
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar perfil por email
    const result = await neonDB.findProfileByEmail(email);

    if (!result.success || result.data.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const profile = result.data[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, profile.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Login bem-sucedido
    delete profile.senha_hash;
    res.json({ 
      message: 'Login realizado com sucesso',
      profile 
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;