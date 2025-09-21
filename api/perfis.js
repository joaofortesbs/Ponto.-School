
import { neonDB } from './neon-db.js';
import bcrypt from 'bcryptjs';

async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        await handleGet(req, res);
        break;
      case 'POST':
        await handlePost(req, res);
        break;
      case 'PUT':
        await handlePut(req, res);
        break;
      case 'DELETE':
        await handleDelete(req, res);
        break;
      default:
        res.status(405).json({ success: false, error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('❌ Erro no endpoint de perfis:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
}

// GET - Buscar perfil(s)
async function handleGet(req, res) {
  const { id, email, username, tipo_conta, estado, page = 1, limit = 50 } = req.query;

  if (id) {
    // Buscar por ID
    const result = await neonDB.findProfileById(id);
    if (result.success && result.data.length > 0) {
      // Remover senha do resultado
      const { senha_hash, ...profile } = result.data[0];
      res.json({ success: true, data: profile });
    } else {
      res.status(404).json({ success: false, error: 'Perfil não encontrado' });
    }
  } else if (email) {
    // Buscar por email
    const result = await neonDB.findProfileByEmail(email);
    if (result.success && result.data.length > 0) {
      const { senha_hash, ...profile } = result.data[0];
      res.json({ success: true, data: profile });
    } else {
      res.status(404).json({ success: false, error: 'Perfil não encontrado' });
    }
  } else if (username) {
    // Buscar por username
    const result = await neonDB.findProfileByUsername(username);
    if (result.success && result.data.length > 0) {
      const { senha_hash, ...profile } = result.data[0];
      res.json({ success: true, data: profile });
    } else {
      res.status(404).json({ success: false, error: 'Perfil não encontrado' });
    }
  } else {
    // Listar perfis com filtros
    const filters = {};
    if (tipo_conta) filters.tipo_conta = tipo_conta;
    if (estado) filters.estado = estado;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const result = await neonDB.listProfiles(filters, parseInt(limit), offset);
    const total = await neonDB.countProfiles(filters);

    if (result.success) {
      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  }
}

// POST - Criar novo perfil
async function handlePost(req, res) {
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
    return res.status(400).json({
      success: false,
      error: 'Todos os campos obrigatórios devem ser preenchidos'
    });
  }

  // Verificar se email já existe
  const emailExists = await neonDB.findProfileByEmail(email);
  if (emailExists.success && emailExists.data.length > 0) {
    return res.status(409).json({
      success: false,
      error: 'Este email já está cadastrado'
    });
  }

  // Verificar se username já existe
  const usernameExists = await neonDB.findProfileByUsername(nome_usuario);
  if (usernameExists.success && usernameExists.data.length > 0) {
    return res.status(409).json({
      success: false,
      error: 'Este nome de usuário já está em uso'
    });
  }

  // Hash da senha
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
    res.status(201).json({
      success: true,
      data: newProfile,
      message: 'Perfil criado com sucesso'
    });
  } else {
    res.status(500).json({
      success: false,
      error: result.error || 'Erro ao criar perfil'
    });
  }
}

// PUT - Atualizar perfil
async function handlePut(req, res) {
  const { id } = req.query;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'ID do perfil é obrigatório'
    });
  }

  // Se está atualizando senha, fazer hash
  if (updateData.senha) {
    updateData.senha_hash = await bcrypt.hash(updateData.senha, 12);
    delete updateData.senha;
  }

  // Remover campos que não devem ser atualizados diretamente
  delete updateData.id;
  delete updateData.created_at;

  const result = await neonDB.updateProfile(id, updateData);

  if (result.success && result.data.length > 0) {
    res.json({
      success: true,
      data: result.data[0],
      message: 'Perfil atualizado com sucesso'
    });
  } else if (result.success && result.data.length === 0) {
    res.status(404).json({
      success: false,
      error: 'Perfil não encontrado'
    });
  } else {
    res.status(500).json({
      success: false,
      error: result.error || 'Erro ao atualizar perfil'
    });
  }
}

// DELETE - Deletar perfil
async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'ID do perfil é obrigatório'
    });
  }

  const result = await neonDB.deleteProfile(id);

  if (result.success && result.data.length > 0) {
    res.json({
      success: true,
      message: 'Perfil deletado com sucesso'
    });
  } else if (result.success && result.data.length === 0) {
    res.status(404).json({
      success: false,
      error: 'Perfil não encontrado'
    });
  } else {
    res.status(500).json({
      success: false,
      error: result.error || 'Erro ao deletar perfil'
    });
  }
}

export default handler;
