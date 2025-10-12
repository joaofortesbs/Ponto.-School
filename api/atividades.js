import express from 'express';
import { Client } from 'pg';

const router = express.Router();

// Função para criar conexão com banco
const getDbClient = () => {
  let connectionString = process.env.DATABASE_URL;
  if (connectionString && connectionString.startsWith("psql '")) {
    connectionString = connectionString.replace("psql '", "").replace(/'$/, "");
  }
  
  return new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
};

// Salvar nova atividade
router.post('/', async (req, res) => {
  const client = getDbClient();
  
  try {
    const { id, id_user, tipo, id_json, school_points } = req.body;
    
    if (!id || !id_user || !tipo || !id_json) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: id, id_user, tipo, id_json'
      });
    }
    
    await client.connect();
    console.log('💾 Salvando atividade:', id, 'para usuário:', id_user, 'com', school_points || 100, 'SPs');
    
    // Inserir ou atualizar
    const query = `
      INSERT INTO atividades (id, id_user, tipo, id_json, school_points)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) 
      DO UPDATE SET 
        tipo = EXCLUDED.tipo,
        id_json = EXCLUDED.id_json,
        school_points = EXCLUDED.school_points,
        updated_at = NOW()
      RETURNING *;
    `;
    
    const result = await client.query(query, [id, id_user, tipo, JSON.stringify(id_json), school_points || 100]);
    
    console.log('✅ Atividade salva com sucesso:', result.rows[0].id);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Erro ao salvar atividade:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    await client.end();
  }
});

// Buscar atividades de um usuário
router.get('/user/:userId', async (req, res) => {
  const client = getDbClient();
  
  try {
    const { userId } = req.params;
    
    await client.connect();
    console.log('🔍 Buscando atividades do usuário:', userId);
    
    const query = `
      SELECT * FROM atividades 
      WHERE id_user = $1 
      ORDER BY updated_at DESC;
    `;
    
    const result = await client.query(query, [userId]);
    
    // Parsear id_json de volta para JSON
    const atividades = result.rows.map(row => ({
      ...row,
      id_json: typeof row.id_json === 'string' ? JSON.parse(row.id_json) : row.id_json
    }));
    
    console.log('✅ Encontradas', atividades.length, 'atividades');
    
    res.json({
      success: true,
      data: atividades
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar atividades:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    await client.end();
  }
});

// Buscar atividade específica
router.get('/:id', async (req, res) => {
  const client = getDbClient();
  
  try {
    const { id } = req.params;
    const { incluirCriador } = req.query;
    
    await client.connect();
    console.log('🔍 Buscando atividade:', id);
    
    let query = 'SELECT * FROM atividades WHERE id = $1;';
    
    // Se solicitado, fazer JOIN com tabela de usuários
    if (incluirCriador === 'true') {
      query = `
        SELECT 
          a.*,
          u.nome_completo as criador_nome,
          u.imagem_avatar as criador_avatar,
          u.nome_usuario as criador_username
        FROM atividades a
        LEFT JOIN usuarios u ON a.id_user = u.id
        WHERE a.id = $1;
      `;
    }
    
    const result = await client.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Atividade não encontrada'
      });
    }
    
    const atividade = {
      ...result.rows[0],
      id_json: typeof result.rows[0].id_json === 'string' 
        ? JSON.parse(result.rows[0].id_json) 
        : result.rows[0].id_json
    };
    
    // Se incluir criador, adicionar objeto criador
    if (incluirCriador === 'true' && result.rows[0].criador_nome) {
      atividade.criador = {
        nome_completo: result.rows[0].criador_nome,
        imagem_avatar: result.rows[0].criador_avatar,
        nome_usuario: result.rows[0].criador_username
      };
      
      // Remover campos temporários
      delete atividade.criador_nome;
      delete atividade.criador_avatar;
      delete atividade.criador_username;
    }
    
    res.json({
      success: true,
      data: atividade
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar atividade:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    await client.end();
  }
});

// Deletar atividade
router.delete('/:id', async (req, res) => {
  const client = getDbClient();
  
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    await client.connect();
    console.log('🗑️ Deletando atividade:', id);
    
    const query = userId
      ? 'DELETE FROM atividades WHERE id = $1 AND id_user = $2 RETURNING *;'
      : 'DELETE FROM atividades WHERE id = $1 RETURNING *;';
    
    const params = userId ? [id, userId] : [id];
    const result = await client.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Atividade não encontrada'
      });
    }
    
    console.log('✅ Atividade deletada:', id);
    
    res.json({
      success: true,
      message: 'Atividade deletada com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao deletar atividade:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    await client.end();
  }
});

export default router;
