import express from 'express';

const router = express.Router();

export function createCalendarEventsRouter(neonDB) {
  router.post('/', async (req, res) => {
    try {
      const { userId, title, eventDate, startTime, endTime, isAllDay, repeat, icon, labels, labelColors, linkedActivities, createdBy } = req.body;

      if (!userId || !title || !eventDate) {
        return res.status(400).json({ success: false, error: 'userId, title e eventDate são obrigatórios' });
      }

      const result = await neonDB.executeQuery(
        `INSERT INTO calendar_events (user_id, title, event_date, start_time, end_time, is_all_day, repeat, icon, labels, label_colors, linked_activities, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          userId,
          title,
          eventDate,
          startTime || null,
          endTime || null,
          isAllDay || false,
          repeat || 'none',
          icon || 'pencil',
          JSON.stringify(labels || []),
          JSON.stringify(labelColors || {}),
          JSON.stringify(linkedActivities || []),
          createdBy || 'user'
        ]
      );

      if (!result.success) {
        return res.status(500).json({ success: false, error: result.error });
      }

      return res.status(201).json({ success: true, data: result.data[0] });
    } catch (error) {
      console.error('❌ [CalendarEvents] Erro ao criar evento:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  router.post('/batch', async (req, res) => {
    try {
      const { events } = req.body;

      if (!events || !Array.isArray(events) || events.length === 0) {
        return res.status(400).json({ success: false, error: 'Array de events é obrigatório' });
      }

      const created = [];
      const errors = [];

      for (const evt of events) {
        const { userId, title, eventDate, startTime, endTime, isAllDay, repeat, icon, labels, labelColors, linkedActivities, createdBy } = evt;

        if (!userId || !title || !eventDate) {
          errors.push({ event: evt, error: 'userId, title e eventDate são obrigatórios' });
          continue;
        }

        const result = await neonDB.executeQuery(
          `INSERT INTO calendar_events (user_id, title, event_date, start_time, end_time, is_all_day, repeat, icon, labels, label_colors, linked_activities, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           RETURNING *`,
          [
            userId,
            title,
            eventDate,
            startTime || null,
            endTime || null,
            isAllDay || false,
            repeat || 'none',
            icon || 'pencil',
            JSON.stringify(labels || []),
            JSON.stringify(labelColors || {}),
            JSON.stringify(linkedActivities || []),
            createdBy || 'jota_ia'
          ]
        );

        if (result.success) {
          created.push(result.data[0]);
        } else {
          errors.push({ event: evt, error: result.error });
        }
      }

      return res.status(201).json({ success: true, data: { created, errors, total: events.length, successCount: created.length } });
    } catch (error) {
      console.error('❌ [CalendarEvents] Erro ao criar eventos em batch:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { month, year } = req.query;

      let query = 'SELECT * FROM calendar_events WHERE user_id = $1';
      const params = [userId];

      if (month && year) {
        query += ` AND EXTRACT(MONTH FROM event_date) = $2 AND EXTRACT(YEAR FROM event_date) = $3`;
        params.push(parseInt(month), parseInt(year));
      }

      query += ' ORDER BY event_date ASC, start_time ASC';

      const result = await neonDB.executeQuery(query, params);

      if (!result.success) {
        return res.status(500).json({ success: false, error: result.error });
      }

      return res.json({ success: true, data: result.data });
    } catch (error) {
      console.error('❌ [CalendarEvents] Erro ao buscar eventos:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  router.put('/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;
      const { title, eventDate, startTime, endTime, isAllDay, repeat, icon, labels, labelColors, linkedActivities } = req.body;

      const result = await neonDB.executeQuery(
        `UPDATE calendar_events SET
          title = COALESCE($1, title),
          event_date = COALESCE($2, event_date),
          start_time = $3,
          end_time = $4,
          is_all_day = COALESCE($5, is_all_day),
          repeat = COALESCE($6, repeat),
          icon = COALESCE($7, icon),
          labels = COALESCE($8, labels),
          label_colors = COALESCE($9, label_colors),
          linked_activities = COALESCE($10, linked_activities),
          updated_at = NOW()
        WHERE id = $11
        RETURNING *`,
        [
          title || null,
          eventDate || null,
          startTime !== undefined ? startTime : null,
          endTime !== undefined ? endTime : null,
          isAllDay !== undefined ? isAllDay : null,
          repeat || null,
          icon || null,
          labels ? JSON.stringify(labels) : null,
          labelColors ? JSON.stringify(labelColors) : null,
          linkedActivities ? JSON.stringify(linkedActivities) : null,
          eventId
        ]
      );

      if (!result.success) {
        return res.status(500).json({ success: false, error: result.error });
      }

      if (result.data.length === 0) {
        return res.status(404).json({ success: false, error: 'Evento não encontrado' });
      }

      return res.json({ success: true, data: result.data[0] });
    } catch (error) {
      console.error('❌ [CalendarEvents] Erro ao atualizar evento:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  router.delete('/:eventId', async (req, res) => {
    try {
      const { eventId } = req.params;

      const result = await neonDB.executeQuery(
        'DELETE FROM calendar_events WHERE id = $1 RETURNING id',
        [eventId]
      );

      if (!result.success) {
        return res.status(500).json({ success: false, error: result.error });
      }

      if (result.data.length === 0) {
        return res.status(404).json({ success: false, error: 'Evento não encontrado' });
      }

      return res.json({ success: true, message: 'Evento deletado com sucesso' });
    } catch (error) {
      console.error('❌ [CalendarEvents] Erro ao deletar evento:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

export default router;
