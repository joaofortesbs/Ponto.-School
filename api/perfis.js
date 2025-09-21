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
    console.log('📝 Recebida requisição de criação de perfil:', req.body);

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
      console.log('❌ Campos obrigatórios ausentes');
      return res.status(400).json({ 
        error: 'Todos os campos são obrigatórios',
        missingFields: {
          nome_completo: !nome_completo,
          nome_usuario: !nome_usuario,
          email: !email,
          senha: !senha,
          tipo_conta: !tipo_conta,
          estado: !estado,
          instituicao_ensino: !instituicao_ensino
        }
      });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Email inválido:', email);
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Validar tipo de conta
    const tiposPermitidos = ['Professor', 'Aluno', 'Coordenador'];
    if (!tiposPermitidos.includes(tipo_conta)) {
      console.log('❌ Tipo de conta inválido:', tipo_conta);
      return res.status(400).json({ error: 'Tipo de conta inválido' });
    }

    // Verificar se email já existe
    console.log('🔍 Verificando se email já existe...');
    const emailExists = await neonDB.findProfileByEmail(email);
    if (emailExists.success && emailExists.data.length > 0) {
      console.log('❌ Email já em uso:', email);
      return res.status(409).json({ error: 'Email já está em uso' });
    }

    // Verificar se nome de usuário já existe
    console.log('🔍 Verificando se nome de usuário já existe...');
    const usernameExists = await neonDB.findProfileByUsername(nome_usuario);
    if (usernameExists.success && usernameExists.data.length > 0) {
      console.log('❌ Nome de usuário já em uso:', nome_usuario);
      return res.status(409).json({ error: 'Nome de usuário já está em uso' });
    }

    // Criptografar senha
    console.log('🔒 Criptografando senha...');
    const senha_hash = await bcrypt.hash(senha, 12);

    // Criar perfil
    console.log('💾 Criando perfil no banco de dados...');
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
      console.log('✅ Perfil criado com sucesso:', newProfile.id);
      
      return res.status(201).json({ 
        success: true,
        message: 'Perfil criado com sucesso',
        profile: newProfile 
      });
    } else {
      console.log('❌ Falha ao criar perfil no banco:', result.error);
      return res.status(500).json({ 
        success: false,
        error: 'Erro ao criar perfil no banco de dados',
        details: result.error 
      });
    }

  } catch (error) {
    console.error('❌ Erro ao criar perfil:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Login - verificar credenciais
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Tentativa de login para:', req.body.email);

    const { email, senha } = req.body;

    if (!email || !senha) {
      console.log('❌ Email ou senha ausentes');
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar perfil por email
    console.log('🔍 Buscando perfil por email...');
    const result = await neonDB.findProfileByEmail(email);

    if (!result.success || result.data.length === 0) {
      console.log('❌ Perfil não encontrado para email:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const profile = result.data[0];

    // Verificar senha
    console.log('🔒 Verificando senha...');
    const senhaValida = await bcrypt.compare(senha, profile.senha_hash);

    if (!senhaValida) {
      console.log('❌ Senha inválida para:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Login bem-sucedido
    delete profile.senha_hash;
    console.log('✅ Login realizado com sucesso para:', email);
    
    res.json({ 
      success: true,
      message: 'Login realizado com sucesso',
      profile 
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

export default router;