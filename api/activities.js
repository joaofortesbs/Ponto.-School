
import express from 'express';
import neonDBModule from './neon-db.js';

const { neonDB } = neonDBModule;
const router = express.Router();

// POST /api/activities - Criar nova atividade
router.post('/', async (req, res) => {
  try {
    console.log('📝 Recebida requisição de criação de atividade:', req.body);

    const {
      user_id,
      activity_code,
      type,
      title,
      content
    } = req.body;

    // Validação básica
    if (!user_id || !activity_code || !type || !content) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: user_id, activity_code, type, content'
      });
    }

    // Verificar se já existe uma atividade com este código
    const existingActivity = await neonDB.findActivityByCode(activity_code);
    if (existingActivity.success && existingActivity.data.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Atividade com este código já existe'
      });
    }

    const result = await neonDB.createActivity({
      user_id,
      activity_code,
      type,
      title,
      content
    });

    if (result.success && result.data.length > 0) {
      const activity = result.data[0];
      console.log('✅ Atividade criada com sucesso:', activity.activity_code);
      
      res.status(201).json({
        success: true,
        activity_code: activity.activity_code,
        data: activity
      });
    } else {
      console.error('❌ Erro ao criar atividade:', result.error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar atividade',
        details: result.error
      });
    }
  } catch (error) {
    console.error('❌ Erro interno ao criar atividade:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/activities/:code - Buscar atividade por código
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    console.log('🔍 Buscando atividade por código:', code);

    const result = await neonDB.findActivityByCode(code);

    if (result.success && result.data.length > 0) {
      const activity = result.data[0];
      
      // Parse do JSON content se necessário
      if (typeof activity.content === 'string') {
        try {
          activity.content = JSON.parse(activity.content);
        } catch (e) {
          console.warn('⚠️ Erro ao fazer parse do JSON content:', e);
        }
      }

      res.json({
        success: true,
        data: activity
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Atividade não encontrada'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao buscar atividade:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// PUT /api/activities/:code - Atualizar atividade
router.put('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { title, content } = req.body;
    
    console.log('📝 Atualizando atividade:', code);

    if (!content && !title) {
      return res.status(400).json({
        success: false,
        error: 'É necessário fornecer title ou content para atualização'
      });
    }

    const result = await neonDB.updateActivity(code, { title, content });

    if (result.success && result.data.length > 0) {
      const activity = result.data[0];
      
      // Parse do JSON content se necessário
      if (typeof activity.content === 'string') {
        try {
          activity.content = JSON.parse(activity.content);
        } catch (e) {
          console.warn('⚠️ Erro ao fazer parse do JSON content:', e);
        }
      }

      console.log('✅ Atividade atualizada com sucesso:', activity.activity_code);
      
      res.json({
        success: true,
        data: activity
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Atividade não encontrada'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar atividade:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/activities/user/:user_id - Listar atividades do usuário
router.get('/user/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log('🔍 Buscando atividades do usuário:', user_id);

    const result = await neonDB.findActivitiesByUser(user_id);

    if (result.success) {
      // Parse do JSON content para todas as atividades
      const activities = result.data.map(activity => {
        if (typeof activity.content === 'string') {
          try {
            activity.content = JSON.parse(activity.content);
          } catch (e) {
            console.warn('⚠️ Erro ao fazer parse do JSON content:', e);
          }
        }
        return activity;
      });

      res.json({
        success: true,
        data: activities,
        count: activities.length
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar atividades',
        details: result.error
      });
    }
  } catch (error) {
    console.error('❌ Erro ao buscar atividades do usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// DELETE /api/activities/:code - Deletar atividade
router.delete('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    console.log('🗑️ Deletando atividade:', code);

    const result = await neonDB.deleteActivity(code);

    if (result.success && result.data.length > 0) {
      console.log('✅ Atividade deletada com sucesso:', code);
      
      res.json({
        success: true,
        message: 'Atividade deletada com sucesso'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Atividade não encontrada'
      });
    }
  } catch (error) {
    console.error('❌ Erro ao deletar atividade:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

export default router;
