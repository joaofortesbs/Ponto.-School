
import express from 'express';
import bcrypt from 'bcryptjs';
import neonDBModule from './neon-db.js';

const { neonDB } = neonDBModule;
const router = express.Router();

// Buscar perfil por email, username ou ID
router.get('/', async (req, res) => {
  try {
    const { email, username, id } = req.query;

    if (!email && !username && !id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, username ou ID é obrigatório' 
      });
    }

    let result;
    if (id) {
      result = await neonDB.findProfileById(id);
    } else if (username) {
      result = await neonDB.findProfileByUsername(username);
    } else {
      result = await neonDB.findProfileByEmail(email);
    }

    if (result.success && result.data.length > 0) {
      const profile = result.data[0];
      // Não retornar a senha
      delete profile.senha_hash;
      res.json({ 
        success: true, 
        data: profile 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'Perfil não encontrado' 
      });
    }
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
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

    // Validar campos obrigatórios
    if (!nome_completo || !nome_usuario || !email || !senha || !tipo_conta || !estado || !instituicao_ensino) {
      console.log('❌ Campos obrigatórios faltando');
      return res.status(400).json({ 
        success: false, 
        error: 'Todos os campos são obrigatórios',
        missing: {
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

    // Verificar se email já existe
    console.log('🔍 Verificando se email já existe:', email);
    const emailExists = await neonDB.findProfileByEmail(email);
    if (emailExists.success && emailExists.data.length > 0) {
      console.log('❌ Email já existe');
      return res.status(400).json({ 
        success: false, 
        error: 'Email já está em uso' 
      });
    }

    // Verificar se username já existe
    console.log('🔍 Verificando se username já existe:', nome_usuario);
    const usernameExists = await neonDB.findProfileByUsername(nome_usuario);
    if (usernameExists.success && usernameExists.data.length > 0) {
      console.log('❌ Username já existe');
      return res.status(400).json({ 
        success: false, 
        error: 'Nome de usuário já está em uso' 
      });
    }

    // Criptografar senha
    console.log('🔒 Criptografando senha...');
    const saltRounds = 12;
    const senha_hash = await bcrypt.hash(senha, saltRounds);

    // Criar perfil
    console.log('💾 Criando perfil no banco...');
    const profileData = {
      nome_completo,
      nome_usuario,
      email,
      senha_hash,
      tipo_conta,
      pais,
      estado,
      instituicao_ensino
    };

    const result = await neonDB.createProfile(profileData);

    if (result.success && result.data.length > 0) {
      const newProfile = result.data[0];
      console.log('✅ Perfil criado com sucesso:', newProfile.id);
      
      res.status(201).json({
        success: true,
        message: 'Perfil criado com sucesso',
        data: {
          id: newProfile.id,
          nome_completo: newProfile.nome_completo,
          nome_usuario: newProfile.nome_usuario,
          email: newProfile.email,
          tipo_conta: newProfile.tipo_conta,
          pais: newProfile.pais,
          estado: newProfile.estado,
          instituicao_ensino: newProfile.instituicao_ensino,
          created_at: newProfile.created_at
        }
      });
    } else {
      console.error('❌ Erro ao criar perfil:', result.error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro ao criar perfil',
        details: result.error 
      });
    }
  } catch (error) {
    console.error('❌ Erro interno ao criar perfil:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    console.log('🔑 Tentativa de login:', req.body.email);
    
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email e senha são obrigatórios' 
      });
    }

    // Buscar usuário
    const result = await neonDB.findProfileByEmail(email);
    
    if (!result.success || result.data.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Email ou senha incorretos' 
      });
    }

    const user = result.data[0];
    
    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    
    if (!senhaValida) {
      return res.status(401).json({ 
        success: false, 
        error: 'Email ou senha incorretos' 
      });
    }

    // Login bem-sucedido
    delete user.senha_hash; // Não enviar a senha
    
    console.log('✅ Login realizado com sucesso:', user.id);
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: user
    });
    
  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Atualizar perfil
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remover campos que não devem ser atualizados diretamente
    delete updateData.id;
    delete updateData.senha_hash;
    delete updateData.created_at;
    
    const result = await neonDB.updateProfile(id, updateData);
    
    if (result.success && result.data.length > 0) {
      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: result.data[0]
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'Perfil não encontrado ou erro na atualização',
        details: result.error 
      });
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Deletar perfil
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await neonDB.deleteProfile(id);
    
    if (result.success && result.data.length > 0) {
      res.json({
        success: true,
        message: 'Perfil deletado com sucesso'
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'Perfil não encontrado' 
      });
    }
  } catch (error) {
    console.error('❌ Erro ao deletar perfil:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Listar perfis
router.get('/list', async (req, res) => {
  try {
    const { 
      tipo_conta, 
      estado, 
      pais, 
      limit = 50, 
      offset = 0 
    } = req.query;
    
    const filters = {};
    if (tipo_conta) filters.tipo_conta = tipo_conta;
    if (estado) filters.estado = estado;
    if (pais) filters.pais = pais;
    
    const result = await neonDB.listProfiles(filters, parseInt(limit), parseInt(offset));
    
    if (result.success) {
      const total = await neonDB.countProfiles(filters);
      
      res.json({
        success: true,
        data: result.data,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Erro ao listar perfis',
        details: result.error 
      });
    }
  } catch (error) {
    console.error('❌ Erro ao listar perfis:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

export default router;
