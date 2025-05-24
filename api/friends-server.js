
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');

// Configuração do ambiente
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsing JSON
app.use(express.json());
app.use(cors());

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do Neon DB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('Token não fornecido');
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, supabaseJwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Erro na verificação do token:', error.message);
    return res.status(403).json({ error: 'Token inválido ou expirado' });
  }
};

// Função auxiliar para verificar se os usuários são amigos
async function checkIfFriends(userId, otherUserId) {
  try {
    const { rows } = await pool.query(`
      SELECT 1 FROM friendships 
      WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
    `, [userId, otherUserId]);
    
    return rows.length > 0;
  } catch (error) {
    console.error('Erro ao verificar amizade:', error);
    return false;
  }
}

// Rota para buscar usuários
app.get('/api/search-users', authenticateToken, async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.sub;

    console.log(`Usuário ${userId} buscou por '${query}'`);
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query deve ter pelo menos 2 caracteres' });
    }

    // Buscar usuários no Supabase
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .neq('id', userId); // Excluir o próprio usuário

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }

    // Para cada usuário encontrado, verificar se já é amigo
    const usersWithFriendStatus = await Promise.all(users.map(async (user) => {
      const isFriend = await checkIfFriends(userId, user.id);
      return { ...user, isFriend };
    }));

    res.json(usersWithFriendStatus);
  } catch (error) {
    console.error('Erro na busca de usuários:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para enviar solicitação de amizade
app.post('/api/send-friend-request', authenticateToken, async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.sub;

    console.log(`Usuário ${senderId} está enviando solicitação para ${receiverId}`);

    // Verificar se o usuário está tentando adicionar a si mesmo
    if (senderId === receiverId) {
      return res.status(400).json({ success: false, error: 'Não pode adicionar a si mesmo' });
    }

    // Verificar se já existe uma solicitação pendente
    const { rows: existingRequests } = await pool.query(`
      SELECT * FROM friend_requests 
      WHERE 
        (sender_id = $1 AND receiver_id = $2 AND status = 'pending')
        OR
        (sender_id = $2 AND receiver_id = $1 AND status = 'pending')
    `, [senderId, receiverId]);

    if (existingRequests.length > 0) {
      console.log('Solicitação já existe');
      return res.status(400).json({ success: false, error: 'Solicitação já existe' });
    }

    // Verificar se já são amigos
    const isFriend = await checkIfFriends(senderId, receiverId);
    if (isFriend) {
      console.log('Usuários já são amigos');
      return res.status(400).json({ success: false, error: 'Vocês já são amigos' });
    }

    // Inserir nova solicitação de amizade
    await pool.query(`
      INSERT INTO friend_requests (sender_id, receiver_id, status)
      VALUES ($1, $2, 'pending')
    `, [senderId, receiverId]);

    console.log('Solicitação enviada com sucesso');
    res.json({ success: true, message: 'Solicitação enviada' });
  } catch (error) {
    console.error('Erro ao enviar solicitação de amizade:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Rota para aceitar solicitação de amizade
app.post('/api/accept-friend-request', authenticateToken, async (req, res) => {
  try {
    const { senderId } = req.body;
    const receiverId = req.user.sub;

    console.log(`Usuário ${receiverId} está aceitando solicitação de ${senderId}`);

    // Iniciar transação
    const client = await pool.connect();
    try {
      // Iniciar transação
      await client.query('BEGIN');

      // Verificar se existe uma solicitação pendente
      const { rows: pendingRequests } = await client.query(`
        SELECT * FROM friend_requests 
        WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'
      `, [senderId, receiverId]);

      if (pendingRequests.length === 0) {
        await client.query('ROLLBACK');
        console.log('Nenhuma solicitação pendente encontrada');
        return res.status(404).json({ success: false, error: 'Nenhuma solicitação pendente encontrada' });
      }

      // Atualizar status da solicitação para 'accepted'
      await client.query(`
        UPDATE friend_requests 
        SET status = 'accepted' 
        WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'
      `, [senderId, receiverId]);

      // Adicionar na tabela de amizades (sempre com o ID menor como user1_id)
      const user1 = senderId < receiverId ? senderId : receiverId;
      const user2 = senderId < receiverId ? receiverId : senderId;

      await client.query(`
        INSERT INTO friendships (user1_id, user2_id)
        VALUES ($1, $2)
        ON CONFLICT (user1_id, user2_id) DO NOTHING
      `, [user1, user2]);

      // Commit da transação
      await client.query('COMMIT');
      
      console.log('Amizade confirmada com sucesso');
      res.json({ success: true, message: 'Amizade confirmada' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao aceitar solicitação de amizade:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Rota para contar solicitações pendentes
app.get('/api/check-requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    console.log(`Usuário ${userId} está verificando solicitações pendentes`);

    const { rows } = await pool.query(`
      SELECT COUNT(*) FROM friend_requests 
      WHERE receiver_id = $1 AND status = 'pending'
    `, [userId]);

    const count = parseInt(rows[0].count);
    console.log(`${count} solicitações pendentes encontradas`);
    
    res.json({ count });
  } catch (error) {
    console.error('Erro ao verificar solicitações pendentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar solicitações pendentes com detalhes do perfil
app.get('/api/get-requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    console.log(`Usuário ${userId} está listando solicitações pendentes`);

    // Buscar IDs dos remetentes das solicitações pendentes
    const { rows: requests } = await pool.query(`
      SELECT sender_id FROM friend_requests 
      WHERE receiver_id = $1 AND status = 'pending'
    `, [userId]);

    if (requests.length === 0) {
      console.log('Nenhuma solicitação pendente');
      return res.json([]);
    }

    // Extrair os IDs dos remetentes
    const senderIds = requests.map(req => req.sender_id);

    // Buscar informações de perfil dos remetentes no Supabase
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', senderIds);

    if (error) {
      console.error('Erro ao buscar perfis:', error);
      return res.status(500).json({ error: 'Erro ao buscar perfis de usuários' });
    }

    console.log(`${profiles.length} perfis de remetentes encontrados`);
    res.json(profiles);
  } catch (error) {
    console.error('Erro ao listar solicitações pendentes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para rejeitar solicitação de amizade
app.delete('/api/reject-request', authenticateToken, async (req, res) => {
  try {
    const { senderId } = req.body;
    const receiverId = req.user.sub;

    console.log(`Usuário ${receiverId} está rejeitando solicitação de ${senderId}`);

    // Deletar a solicitação
    const { rowCount } = await pool.query(`
      DELETE FROM friend_requests 
      WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'
    `, [senderId, receiverId]);

    if (rowCount === 0) {
      console.log('Nenhuma solicitação encontrada para rejeitar');
      return res.status(404).json({ success: false, error: 'Nenhuma solicitação encontrada' });
    }

    console.log('Solicitação rejeitada com sucesso');
    res.json({ success: true, message: 'Solicitação rejeitada' });
  } catch (error) {
    console.error('Erro ao rejeitar solicitação de amizade:', error);
    res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Listar amigos
app.get('/api/friends', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    
    console.log(`Usuário ${userId} está listando seus amigos`);

    // Buscar IDs dos amigos
    const { rows: friendships } = await pool.query(`
      SELECT user1_id, user2_id FROM friendships 
      WHERE user1_id = $1 OR user2_id = $1
    `, [userId]);

    if (friendships.length === 0) {
      console.log('Nenhum amigo encontrado');
      return res.json([]);
    }

    // Extrair os IDs dos amigos
    const friendIds = friendships.map(friendship => 
      friendship.user1_id === userId ? friendship.user2_id : friendship.user1_id
    );

    // Buscar informações de perfil dos amigos no Supabase
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio')
      .in('id', friendIds);

    if (error) {
      console.error('Erro ao buscar perfis de amigos:', error);
      return res.status(500).json({ error: 'Erro ao buscar perfis de amigos' });
    }

    console.log(`${profiles.length} amigos encontrados`);
    res.json(profiles);
  } catch (error) {
    console.error('Erro ao listar amigos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar o servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de amizades rodando na porta ${PORT}`);
});

module.exports = app;
