import express from 'express';
import neonDB from './neon-db.js';

const router = express.Router();

async function ensureTables() {
  try {
    await neonDB.query(`
      CREATE TABLE IF NOT EXISTS agent_memory (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        session_id VARCHAR(255) NOT NULL,
        memory_type VARCHAR(50) NOT NULL DEFAULT 'working',
        category VARCHAR(255) NOT NULL DEFAULT '',
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP DEFAULT NULL
      )
    `);

    await neonDB.query(`
      CREATE TABLE IF NOT EXISTS agent_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        started_at TIMESTAMP DEFAULT NOW(),
        last_activity TIMESTAMP DEFAULT NOW(),
        status VARCHAR(50) DEFAULT 'active',
        summary TEXT DEFAULT '',
        capabilities_used JSONB DEFAULT '[]',
        activities_created JSONB DEFAULT '[]',
        metadata JSONB DEFAULT '{}'
      )
    `);

    await neonDB.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_memory_user ON agent_memory(user_id)
    `);
    await neonDB.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_memory_session ON agent_memory(session_id)
    `);
    await neonDB.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_memory_type ON agent_memory(memory_type)
    `);
    await neonDB.query(`
      CREATE INDEX IF NOT EXISTS idx_agent_sessions_user ON agent_sessions(user_id)
    `);

    console.log('✅ [AgentMemory] Tabelas verificadas/criadas');
  } catch (error) {
    console.error('❌ [AgentMemory] Erro ao criar tabelas:', error.message);
  }
}

let tablesInitialized = false;

async function authMiddleware(req, res, next) {
  const authToken = req.headers['x-auth-token'] || req.headers['authorization']?.replace('Bearer ', '');
  
  if (!authToken) {
    return res.status(401).json({ error: 'Authentication required. Send x-auth-token header.' });
  }

  try {
    const result = await neonDB.query(
      'SELECT id FROM usuarios WHERE id = $1 LIMIT 1',
      [authToken]
    );
    
    if (result.rows.length === 0) {
      console.warn('⚠️ [AgentMemory] Invalid auth token rejected:', authToken.substring(0, 8) + '...');
      return res.status(403).json({ error: 'Invalid authentication token.' });
    }

    req.authUserId = result.rows[0].id.toString();
    next();
  } catch (error) {
    console.error('❌ [AgentMemory] Auth validation error:', error.message);
    return res.status(500).json({ error: 'Authentication validation failed.' });
  }
}

router.post('/init', authMiddleware, async (req, res) => {
  try {
    if (!tablesInitialized) {
      await ensureTables();
      tablesInitialized = true;
    }
    res.json({ success: true });
  } catch (error) {
    console.error('❌ [AgentMemory] Init error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/items', authMiddleware, async (req, res) => {
  try {
    if (!tablesInitialized) {
      await ensureTables();
      tablesInitialized = true;
    }

    const { session_id, memory_type, category, content, metadata, expires_at } = req.body;
    const user_id = req.authUserId;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const result = await neonDB.query(
      `INSERT INTO agent_memory (user_id, session_id, memory_type, category, content, metadata, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        user_id,
        session_id || '',
        memory_type || 'working',
        category || '',
        content,
        JSON.stringify(metadata || {}),
        expires_at || null
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ [AgentMemory] Save error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/items', authMiddleware, async (req, res) => {
  try {
    if (!tablesInitialized) {
      await ensureTables();
      tablesInitialized = true;
    }

    const user_id = req.authUserId;
    const { session_id, memory_type, limit } = req.query;

    let query = 'SELECT * FROM agent_memory WHERE user_id = $1';
    const params = [user_id];
    let paramIndex = 2;

    if (session_id) {
      query += ` AND session_id = $${paramIndex++}`;
      params.push(session_id);
    }
    if (memory_type) {
      query += ` AND memory_type = $${paramIndex++}`;
      params.push(memory_type);
    }

    query += ' AND (expires_at IS NULL OR expires_at > NOW())';
    query += ' ORDER BY created_at DESC';
    query += ` LIMIT $${paramIndex++}`;
    params.push(parseInt(limit) || 50);

    const result = await neonDB.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ [AgentMemory] Get items error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post('/sessions', authMiddleware, async (req, res) => {
  try {
    if (!tablesInitialized) {
      await ensureTables();
      tablesInitialized = true;
    }

    const user_id = req.authUserId;
    const { session_id, status, capabilities_used, activities_created, metadata } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: 'session_id is required' });
    }

    const result = await neonDB.query(
      `INSERT INTO agent_sessions (session_id, user_id, status, capabilities_used, activities_created, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (session_id) DO UPDATE SET
         last_activity = NOW(),
         status = EXCLUDED.status
       RETURNING *`,
      [
        session_id,
        user_id,
        status || 'active',
        JSON.stringify(capabilities_used || []),
        JSON.stringify(activities_created || []),
        JSON.stringify(metadata || {})
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ [AgentMemory] Session create error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    if (!tablesInitialized) {
      await ensureTables();
      tablesInitialized = true;
    }

    const user_id = req.authUserId;
    const { limit } = req.query;

    const result = await neonDB.query(
      `SELECT * FROM agent_sessions 
       WHERE user_id = $1 
       ORDER BY last_activity DESC 
       LIMIT $2`,
      [user_id, parseInt(limit) || 10]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('❌ [AgentMemory] Get sessions error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/sessions/:sessionId', authMiddleware, async (req, res) => {
  try {
    if (!tablesInitialized) {
      await ensureTables();
      tablesInitialized = true;
    }

    const user_id = req.authUserId;
    const { sessionId } = req.params;
    const { summary, capabilities_used, activities_created, status, last_activity } = req.body;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (summary !== undefined) {
      updates.push(`summary = $${paramIndex++}`);
      params.push(summary);
    }
    if (capabilities_used !== undefined) {
      updates.push(`capabilities_used = $${paramIndex++}`);
      params.push(JSON.stringify(capabilities_used));
    }
    if (activities_created !== undefined) {
      updates.push(`activities_created = $${paramIndex++}`);
      params.push(JSON.stringify(activities_created));
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (last_activity !== undefined) {
      updates.push(`last_activity = $${paramIndex++}`);
      params.push(last_activity);
    }

    updates.push(`last_activity = NOW()`);

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(sessionId);
    params.push(user_id);
    const result = await neonDB.query(
      `UPDATE agent_sessions SET ${updates.join(', ')} WHERE session_id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ [AgentMemory] Update session error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
