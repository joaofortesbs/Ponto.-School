import express from 'express';
import bcrypt from 'bcryptjs';
import neonDB from './neon-db.js';

const router = express.Router();

// Buscar perfil por email
router.get('/', async (req, res) => {
  try {
    const { email, id } = req.query;

    if (!email && !id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email ou ID é obrigatório' 
      });
    }

    let result;
    if (id) {
      result = await neonDB.findProfileById(id);
    } else {
      result = await neonDB.findProfileByEmail(email);
    }

    if (result.success && result.data.length > 0) {
      const profile = result.data[0];
      // Não retornar a senha apenas para GET requests normais
      delete profile.senha_hash;
      
      console.log('✅ Perfil encontrado e retornado:', {
        id: profile.id,
        nome_completo: profile.nome_completo,
        nome_usuario: profile.nome_usuario,
        imagem_avatar: profile.imagem_avatar
      });
      
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
    console.error('Erro ao buscar perfil:', error);
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
      return res.status(400).json({ 
        success: false,
        error: 'Email e senha são obrigatórios' 
      });
    }

    // Buscar perfil por email
    console.log('🔍 Buscando perfil por email...');
    const result = await neonDB.findProfileByEmail(email);

    if (!result.success || result.data.length === 0) {
      console.log('❌ Perfil não encontrado para email:', email);
      return res.status(401).json({ 
        success: false,
        error: 'Credenciais inválidas' 
      });
    }

    const profile = result.data[0];

    // Verificar se senha_hash existe
    if (!profile.senha_hash) {
      console.log('❌ Senha hash não encontrada para:', email);
      return res.status(401).json({ 
        success: false,
        error: 'Credenciais inválidas' 
      });
    }

    // Verificar senha
    console.log('🔒 Verificando senha...');
    console.log('🔒 Senha fornecida:', senha ? 'Presente' : 'Ausente');
    console.log('🔒 Senha (comprimento):', senha?.length);
    console.log('🔒 Senha (primeiros 3 chars):', senha ? senha.substring(0, 3) : 'N/A');
    console.log('🔒 Senha (últimos 3 chars):', senha ? senha.substring(senha.length - 3) : 'N/A');
    console.log('🔒 Senha (tem espaços):', senha ? (senha.trim() !== senha) : 'N/A');
    console.log('🔒 Hash armazenado:', profile.senha_hash ? 'Presente' : 'Ausente');
    
    const senhaValida = await bcrypt.compare(senha, profile.senha_hash);

    if (!senhaValida) {
      console.log('❌ Senha inválida para:', email);
      return res.status(401).json({ 
        success: false,
        error: 'Credenciais inválidas' 
      });
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
      success: false,
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Atualizar avatar do usuário
router.patch('/avatar', async (req, res) => {
  try {
    const { email, avatar_url } = req.body;

    if (!email || !avatar_url) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email e URL do avatar são obrigatórios' 
      });
    }

    console.log('🖼️ Atualizando avatar para:', email);
    console.log('🖼️ Nova URL do avatar:', avatar_url);

    const query = `
      UPDATE usuarios 
      SET imagem_avatar = $1, updated_at = NOW()
      WHERE email = $2
      RETURNING id, nome_completo, nome_usuario, email, imagem_avatar, updated_at
    `;

    const result = await neonDB.executeQuery(query, [avatar_url, email]);

    if (result.success && result.data.length > 0) {
      console.log('✅ Avatar atualizado com sucesso no Neon');
      console.log('✅ Dados retornados:', result.data[0]);
      res.json({ 
        success: true, 
        data: result.data[0] 
      });
    } else {
      console.log('⚠️ Nenhum perfil encontrado para o email:', email);
      res.status(404).json({ 
        success: false, 
        error: 'Perfil não encontrado' 
      });
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar avatar:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Listar perfis com filtros opcionais
router.get('/list', async (req, res) => {
  try {
    const { limit, offset, ...filters } = req.query;
    const parsedLimit = parseInt(limit, 10) || 50;
    const parsedOffset = parseInt(offset, 10) || 0;

    const profiles = await neonDB.listProfiles(filters, parsedLimit, parsedOffset);

    if (profiles.success) {
      res.json({
        success: true,
        data: profiles.data,
        count: profiles.count
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro ao listar perfis',
        details: profiles.error
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

// Reset de senha - atualiza a senha no Neon DB
router.post('/reset-password', async (req, res) => {
  try {
    const { email, nova_senha } = req.body;

    if (!email || !nova_senha) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email e nova senha são obrigatórios' 
      });
    }

    // Validar nova senha (mínimo 6 caracteres)
    if (nova_senha.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'A nova senha deve ter pelo menos 6 caracteres' 
      });
    }

    console.log('🔄 Solicitação de reset de senha para:', email);

    // Verificar se o usuário existe
    const userResult = await neonDB.findProfileByEmail(email);
    
    if (!userResult.success || userResult.data.length === 0) {
      console.log('❌ Usuário não encontrado para reset:', email);
      return res.status(404).json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      });
    }

    // Hash da nova senha
    const nova_senha_hash = await bcrypt.hash(nova_senha, 12);

    // Atualizar senha no banco
    const query = `
      UPDATE usuarios 
      SET senha_hash = $1, updated_at = NOW()
      WHERE email = $2
      RETURNING id, nome_completo, email, updated_at
    `;

    const result = await neonDB.executeQuery(query, [nova_senha_hash, email]);

    if (result.success && result.data.length > 0) {
      console.log('✅ Senha atualizada com sucesso para:', email);
      res.json({ 
        success: true, 
        message: 'Senha atualizada com sucesso',
        data: {
          id: result.data[0].id,
          email: result.data[0].email
        }
      });
    } else {
      console.log('❌ Falha ao atualizar senha:', result.error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro ao atualizar senha' 
      });
    }
  } catch (error) {
    console.error('❌ Erro no reset de senha:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Verificar se email existe (para recuperação de senha)
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email é obrigatório' 
      });
    }

    const result = await neonDB.findProfileByEmail(email);
    
    if (result.success && result.data.length > 0) {
      res.json({ 
        success: true, 
        exists: true,
        message: 'Email encontrado'
      });
    } else {
      res.json({ 
        success: true, 
        exists: false,
        message: 'Email não encontrado'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao verificar email:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor'
    });
  }
});


export default router;