import { Router } from 'express';
import neonDB from './neon-db.js';

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function snakeToCamel(row) {
  if (!row) return null;
  return {
    tabId:                         row.id,
    title:                         row.title,
    icon:                          row.icon,
    hasActivity:                   row.has_activity,
    flowState:                     row.flow_state,
    flowData:                      row.flow_data ?? null,
    chosenActivities:              row.chosen_activities ?? [],
    chosenActivitiesSessionId:     row.chosen_activities_session_id ?? null,
    isDecisionComplete:            row.is_decision_complete,
    isContentGenerationComplete:   row.is_content_generation_complete,
    chatSessionId:                 row.chat_session_id ?? null,
    chatInitialMessageProcessed:   row.chat_initial_message_processed,
    chatLastProcessedMessage:      row.chat_last_processed_message ?? null,
    createdAt:                     new Date(row.created_at).getTime(),
    lastActiveAt:                  new Date(row.last_active_at).getTime(),
    chatMessages:                  [],
  };
}

function msgRowToMessage(row) {
  const content = row.content_json !== null ? row.content_json : row.content;
  return {
    id:          row.id,
    role:        row.role,
    type:        row.message_type,
    content,
    metadata:    row.metadata ?? {},
    attachments: row.attachments ?? [],
    timestamp:   new Date(row.created_at).getTime(),
  };
}

function serializeMsg(msg) {
  const isComplexContent = msg.content !== null && typeof msg.content === 'object';
  return {
    id:           msg.id,
    role:         msg.role ?? 'assistant',
    message_type: msg.type ?? 'text',
    content:      isComplexContent ? null : (msg.content ?? null),
    content_json: isComplexContent ? msg.content : null,
    metadata:     msg.metadata ?? null,
    attachments:  msg.attachments ?? [],
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// POST /api/sp/sessions — create or upsert a session
router.post('/sessions', async (req, res) => {
  try {
    const { userId, id, title, icon } = req.body;
    if (!userId || !id) {
      return res.status(400).json({ error: 'userId e id são obrigatórios' });
    }
    const query = `
      INSERT INTO sp_sessions (id, user_id, title, icon)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET
        title         = EXCLUDED.title,
        icon          = EXCLUDED.icon,
        last_active_at = NOW()
      RETURNING *
    `;
    const result = await neonDB.executeQuery(query, [id, userId, title ?? 'Home', icon ?? 'home']);
    if (!result.success) return res.status(500).json({ error: result.error });
    res.json({ success: true, session: snakeToCamel(result.data[0]) });
  } catch (err) {
    console.error('[SP Sessions] POST /sessions error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sp/sessions/:userId — list active sessions for a user
router.get('/sessions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT * FROM sp_sessions
      WHERE user_id = $1 AND is_active = true
      ORDER BY last_active_at DESC
    `;
    const result = await neonDB.executeQuery(query, [userId]);
    if (!result.success) return res.status(500).json({ error: result.error });
    res.json({ success: true, sessions: result.data.map(snakeToCamel) });
  } catch (err) {
    console.error('[SP Sessions] GET /sessions/:userId error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/sp/sessions/:sessionId — update session metadata/state
router.patch('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const {
      title, icon, hasActivity, flowState, flowData,
      chosenActivities, chosenActivitiesSessionId,
      isDecisionComplete, isContentGenerationComplete,
      chatSessionId, chatInitialMessageProcessed, chatLastProcessedMessage,
    } = req.body;

    const sets = [];
    const vals = [];
    let idx = 1;

    if (title !== undefined)                     { sets.push(`title = $${idx++}`);                          vals.push(title); }
    if (icon !== undefined)                      { sets.push(`icon = $${idx++}`);                           vals.push(icon); }
    if (hasActivity !== undefined)               { sets.push(`has_activity = $${idx++}`);                   vals.push(hasActivity); }
    if (flowState !== undefined)                 { sets.push(`flow_state = $${idx++}`);                     vals.push(flowState); }
    if (flowData !== undefined)                  { sets.push(`flow_data = $${idx++}`);                      vals.push(flowData ? JSON.stringify(flowData) : null); }
    if (chosenActivities !== undefined)          { sets.push(`chosen_activities = $${idx++}`);              vals.push(JSON.stringify(chosenActivities)); }
    if (chosenActivitiesSessionId !== undefined) { sets.push(`chosen_activities_session_id = $${idx++}`);  vals.push(chosenActivitiesSessionId); }
    if (isDecisionComplete !== undefined)        { sets.push(`is_decision_complete = $${idx++}`);           vals.push(isDecisionComplete); }
    if (isContentGenerationComplete !== undefined) { sets.push(`is_content_generation_complete = $${idx++}`); vals.push(isContentGenerationComplete); }
    if (chatSessionId !== undefined)             { sets.push(`chat_session_id = $${idx++}`);                vals.push(chatSessionId); }
    if (chatInitialMessageProcessed !== undefined) { sets.push(`chat_initial_message_processed = $${idx++}`); vals.push(chatInitialMessageProcessed); }
    if (chatLastProcessedMessage !== undefined)  { sets.push(`chat_last_processed_message = $${idx++}`);   vals.push(chatLastProcessedMessage); }

    if (sets.length === 0) return res.json({ success: true });

    sets.push(`last_active_at = NOW()`);
    vals.push(sessionId);

    const query = `UPDATE sp_sessions SET ${sets.join(', ')} WHERE id = $${idx} AND is_active = true`;
    const result = await neonDB.executeQuery(query, vals);
    if (!result.success) return res.status(500).json({ error: result.error });
    res.json({ success: true });
  } catch (err) {
    console.error('[SP Sessions] PATCH /sessions/:sessionId error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/sp/sessions/:sessionId — soft-delete
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const query = `UPDATE sp_sessions SET is_active = false WHERE id = $1`;
    const result = await neonDB.executeQuery(query, [sessionId]);
    if (!result.success) return res.status(500).json({ error: result.error });
    res.json({ success: true });
  } catch (err) {
    console.error('[SP Sessions] DELETE /sessions/:sessionId error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sp/sessions/:sessionId/messages — get all messages for a session
router.get('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const query = `
      SELECT * FROM sp_messages
      WHERE session_id = $1
      ORDER BY id ASC
    `;
    const result = await neonDB.executeQuery(query, [sessionId]);
    if (!result.success) return res.status(500).json({ error: result.error });
    res.json({ success: true, messages: result.data.map(msgRowToMessage) });
  } catch (err) {
    console.error('[SP Sessions] GET messages error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sp/sessions/:sessionId/messages — add a single message
router.post('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId, ...msg } = req.body;
    if (!msg || !msg.id) return res.status(400).json({ error: 'Mensagem inválida' });

    if (userId) {
      await neonDB.executeQuery(
        `INSERT INTO sp_sessions (id, user_id, title, icon) VALUES ($1, $2, 'Home', 'home') ON CONFLICT (id) DO NOTHING`,
        [sessionId, userId]
      );
    }

    const s = serializeMsg(msg);
    const query = `
      INSERT INTO sp_messages (id, session_id, role, message_type, content, content_json, metadata, attachments)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        content      = EXCLUDED.content,
        content_json = EXCLUDED.content_json,
        metadata     = EXCLUDED.metadata,
        attachments  = EXCLUDED.attachments
    `;
    const result = await neonDB.executeQuery(query, [
      s.id, sessionId, s.role, s.message_type,
      s.content, s.content_json ? JSON.stringify(s.content_json) : null,
      s.metadata ? JSON.stringify(s.metadata) : null,
      JSON.stringify(s.attachments),
    ]);
    if (!result.success) return res.status(500).json({ error: result.error });
    res.json({ success: true });
  } catch (err) {
    console.error('[SP Sessions] POST message error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sp/sessions/:sessionId/messages/batch — insert many messages at once
router.post('/sessions/:sessionId/messages/batch', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { messages, userId } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.json({ success: true, inserted: 0 });
    }

    if (userId) {
      await neonDB.executeQuery(
        `INSERT INTO sp_sessions (id, user_id, title, icon) VALUES ($1, $2, 'Home', 'home') ON CONFLICT (id) DO NOTHING`,
        [sessionId, userId]
      );
    }

    let inserted = 0;
    for (const msg of messages) {
      if (!msg || !msg.id) continue;
      const s = serializeMsg(msg);
      const query = `
        INSERT INTO sp_messages (id, session_id, role, message_type, content, content_json, metadata, attachments)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          content      = EXCLUDED.content,
          content_json = EXCLUDED.content_json,
          metadata     = EXCLUDED.metadata,
          attachments  = EXCLUDED.attachments
      `;
      const result = await neonDB.executeQuery(query, [
        s.id, sessionId, s.role, s.message_type,
        s.content, s.content_json ? JSON.stringify(s.content_json) : null,
        s.metadata ? JSON.stringify(s.metadata) : null,
        JSON.stringify(s.attachments),
      ]);
      if (result.success) inserted++;
    }
    res.json({ success: true, inserted });
  } catch (err) {
    console.error('[SP Sessions] POST batch messages error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
