
import express from 'express';
import { authMiddleware } from '../lib/auth.js';
import { query } from '../lib/database.js';

const router = express.Router();

// Buscar todas as tarefas do usuário
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, user_id, titulo, descricao, status, data_criacao, data_atualizacao FROM tarefas WHERE user_id = $1 ORDER BY data_criacao DESC',
      [req.user.id]
    );

    res.json({
      success: true,
      tasks: result.rows
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Criar nova tarefa
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await query(
      'INSERT INTO tarefas (user_id, titulo, descricao, status, data_criacao, data_atualizacao) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, user_id, titulo, descricao, status, data_criacao, data_atualizacao',
      [req.user.id, title, description || '', false]
    );

    res.json({
      success: true,
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Atualizar tarefa
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, status } = req.body;

    const setFields = [];
    const values = [];
    let paramCount = 1;

    if (titulo !== undefined) {
      setFields.push(`titulo = $${paramCount++}`);
      values.push(titulo);
    }
    if (descricao !== undefined) {
      setFields.push(`descricao = $${paramCount++}`);
      values.push(descricao);
    }
    if (status !== undefined) {
      setFields.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (setFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    setFields.push(`data_atualizacao = NOW()`);
    values.push(req.user.id, id);

    const result = await query(
      `UPDATE tarefas SET ${setFields.join(', ')} WHERE user_id = $${paramCount++} AND id = $${paramCount} RETURNING id, user_id, titulo, descricao, status, data_criacao, data_atualizacao`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      success: true,
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Alternar status de conclusão
router.put('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE tarefas SET status = NOT status, data_atualizacao = NOW() WHERE user_id = $1 AND id = $2 RETURNING id, user_id, titulo, descricao, status, data_criacao, data_atualizacao',
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      success: true,
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deletar tarefa
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM tarefas WHERE user_id = $1 AND id = $2 RETURNING id',
      [req.user.id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
