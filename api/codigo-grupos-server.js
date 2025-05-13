
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Inicializar o servidor
const app = express();
const PORT = process.env.PORT || 3030;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Caminho para o banco de dados JSON
const DB_PATH = path.join(__dirname, '../data/codigos-grupos.json');

// Garantir que o diretório data existe
const ensureDbDirectory = () => {
  const dir = path.join(__dirname, '../data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ codigos: [] }));
  }
};

// Carrega o banco de dados
const loadDb = () => {
  ensureDbDirectory();
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao carregar o banco de dados de códigos:', error);
    return { codigos: [] };
  }
};

// Salva o banco de dados
const saveDb = (db) => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    return true;
  } catch (error) {
    console.error('Erro ao salvar o banco de dados de códigos:', error);
    return false;
  }
};

// Gera um código único para grupos (apenas letras maiúsculas e números, excluindo caracteres ambíguos)
const gerarCodigoUnico = () => {
  const CARACTERES_PERMITIDOS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const COMPRIMENTO_CODIGO = 7;
  
  let codigo = '';
  for (let i = 0; i < COMPRIMENTO_CODIGO; i++) {
    codigo += CARACTERES_PERMITIDOS.charAt(Math.floor(Math.random() * CARACTERES_PERMITIDOS.length));
  }
  
  return codigo;
};

// Rota para criar um novo código de grupo
app.post('/api/codigos-grupo', (req, res) => {
  try {
    const { grupoId, userId, nome, privado, membrosPermitidos = [] } = req.body;
    
    if (!grupoId || !userId) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'grupoId e userId são obrigatórios' 
      });
    }
    
    const db = loadDb();
    
    // Verificar se já existe um código para este grupo
    const codigoExistente = db.codigos.find(c => c.grupoId === grupoId);
    if (codigoExistente) {
      return res.json({ 
        sucesso: true, 
        codigo: codigoExistente.codigo,
        mensagem: 'Código existente recuperado' 
      });
    }
    
    // Gerar um novo código único
    let codigo = gerarCodigoUnico();
    let tentativas = 0;
    const MAX_TENTATIVAS = 10;
    
    // Verificar se o código já existe e gerar outro se necessário
    while (db.codigos.some(c => c.codigo === codigo) && tentativas < MAX_TENTATIVAS) {
      codigo = gerarCodigoUnico();
      tentativas++;
    }
    
    if (tentativas >= MAX_TENTATIVAS) {
      return res.status(500).json({ 
        sucesso: false, 
        mensagem: 'Não foi possível gerar um código único após várias tentativas' 
      });
    }
    
    // Criar o registro do código
    const novoCodigo = {
      id: uuidv4(),
      codigo,
      grupoId,
      criadorId: userId,
      nome: nome || 'Grupo de Estudo',
      privado: !!privado,
      membrosPermitidos,
      dataCriacao: new Date().toISOString()
    };
    
    // Salvar no banco de dados
    db.codigos.push(novoCodigo);
    if (saveDb(db)) {
      return res.status(201).json({
        sucesso: true,
        codigo,
        mensagem: 'Código criado com sucesso'
      });
    } else {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao salvar o código no banco de dados'
      });
    }
  } catch (error) {
    console.error('Erro ao criar código de grupo:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor'
    });
  }
});

// Rota para verificar se um código existe
app.get('/api/codigos-grupo/verificar/:codigo', (req, res) => {
  try {
    const { codigo } = req.params;
    const codigoNormalizado = codigo.trim().toUpperCase();
    
    const db = loadDb();
    const codigoInfo = db.codigos.find(c => c.codigo === codigoNormalizado);
    
    if (codigoInfo) {
      return res.json({
        sucesso: true,
        existe: true,
        privado: codigoInfo.privado,
        grupoId: codigoInfo.grupoId,
        nome: codigoInfo.nome
      });
    } else {
      return res.json({
        sucesso: true,
        existe: false
      });
    }
  } catch (error) {
    console.error('Erro ao verificar código de grupo:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor'
    });
  }
});

// Rota para validar a entrada em um grupo privado
app.post('/api/codigos-grupo/validar-acesso', (req, res) => {
  try {
    const { codigo, userId } = req.body;
    
    if (!codigo || !userId) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Código e userId são obrigatórios'
      });
    }
    
    const codigoNormalizado = codigo.trim().toUpperCase();
    const db = loadDb();
    const codigoInfo = db.codigos.find(c => c.codigo === codigoNormalizado);
    
    if (!codigoInfo) {
      return res.json({
        sucesso: false,
        mensagem: 'Código de grupo inválido'
      });
    }
    
    // Se o grupo não é privado ou se o usuário é o criador, permitir acesso
    if (!codigoInfo.privado || codigoInfo.criadorId === userId) {
      return res.json({
        sucesso: true,
        acesso: true,
        grupoId: codigoInfo.grupoId,
        nome: codigoInfo.nome
      });
    }
    
    // Verificar se o usuário está na lista de membros permitidos
    if (codigoInfo.membrosPermitidos.includes(userId)) {
      return res.json({
        sucesso: true,
        acesso: true,
        grupoId: codigoInfo.grupoId,
        nome: codigoInfo.nome
      });
    }
    
    // Acesso negado para grupos privados
    return res.json({
      sucesso: true,
      acesso: false,
      mensagem: 'Este grupo é privado e você não tem permissão para entrar'
    });
  } catch (error) {
    console.error('Erro ao validar acesso ao grupo:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor'
    });
  }
});

// Rota para adicionar membros permitidos a um grupo
app.post('/api/codigos-grupo/adicionar-membro', (req, res) => {
  try {
    const { grupoId, userId, adminId } = req.body;
    
    if (!grupoId || !userId || !adminId) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'grupoId, userId e adminId são obrigatórios'
      });
    }
    
    const db = loadDb();
    const codigoIndex = db.codigos.findIndex(c => c.grupoId === grupoId);
    
    if (codigoIndex === -1) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Grupo não encontrado'
      });
    }
    
    const codigoInfo = db.codigos[codigoIndex];
    
    // Verificar se quem está adicionando é o criador do grupo
    if (codigoInfo.criadorId !== adminId) {
      return res.status(403).json({
        sucesso: false,
        mensagem: 'Apenas o criador do grupo pode adicionar membros'
      });
    }
    
    // Adicionar o membro se ainda não estiver na lista
    if (!codigoInfo.membrosPermitidos.includes(userId)) {
      db.codigos[codigoIndex].membrosPermitidos.push(userId);
      
      if (saveDb(db)) {
        return res.json({
          sucesso: true,
          mensagem: 'Membro adicionado com sucesso'
        });
      } else {
        return res.status(500).json({
          sucesso: false,
          mensagem: 'Erro ao salvar alterações no banco de dados'
        });
      }
    } else {
      return res.json({
        sucesso: true,
        mensagem: 'Membro já está na lista de permitidos'
      });
    }
  } catch (error) {
    console.error('Erro ao adicionar membro ao grupo:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor'
    });
  }
});

// Rota para obter informações de um grupo pelo código
app.get('/api/codigos-grupo/:codigo', (req, res) => {
  try {
    const { codigo } = req.params;
    const codigoNormalizado = codigo.trim().toUpperCase();
    
    const db = loadDb();
    const codigoInfo = db.codigos.find(c => c.codigo === codigoNormalizado);
    
    if (codigoInfo) {
      // Não retornar a lista completa de membros permitidos por questões de privacidade
      const { membrosPermitidos, ...infoPublica } = codigoInfo;
      
      return res.json({
        sucesso: true,
        grupo: infoPublica
      });
    } else {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Código não encontrado'
      });
    }
  } catch (error) {
    console.error('Erro ao obter informações do grupo:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro interno do servidor'
    });
  }
});

// Rota para saúde do servidor
app.get('/api/saude', (req, res) => {
  res.json({ status: 'operacional', mensagem: 'Servidor de códigos de grupo funcionando normalmente' });
});

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  ensureDbDirectory();
  console.log(`Servidor de códigos de grupo rodando na porta ${PORT}`);
});

module.exports = app;
