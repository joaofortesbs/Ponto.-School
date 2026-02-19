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

  router.get('/:userId/range', async (req, res) => {
    try {
      const { userId } = req.params;
      const { dateFrom, dateTo, labels, createdBy } = req.query;

      if (!dateFrom || !dateTo) {
        return res.status(400).json({ success: false, error: 'dateFrom e dateTo são obrigatórios (formato YYYY-MM-DD)' });
      }

      let query = 'SELECT * FROM calendar_events WHERE user_id = $1 AND event_date >= $2 AND event_date <= $3';
      const params = [userId, dateFrom, dateTo];

      if (createdBy) {
        params.push(createdBy);
        query += ` AND created_by = $${params.length}`;
      }

      query += ' ORDER BY event_date ASC, start_time ASC';

      const result = await neonDB.executeQuery(query, params);

      if (!result.success) {
        return res.status(500).json({ success: false, error: result.error });
      }

      let events = result.data;
      if (labels) {
        const filterLabels = labels.split(',').map(l => l.trim().toLowerCase());
        events = events.filter(evt => {
          const evtLabels = (typeof evt.labels === 'string' ? JSON.parse(evt.labels) : evt.labels) || [];
          return evtLabels.some(l => filterLabels.includes(l.toLowerCase()));
        });
      }

      return res.json({ success: true, data: events, total: events.length });
    } catch (error) {
      console.error('❌ [CalendarEvents] Erro ao buscar eventos por range:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/:userId/event/:eventId', async (req, res) => {
    try {
      const { userId, eventId } = req.params;

      const result = await neonDB.executeQuery(
        'SELECT * FROM calendar_events WHERE id = $1 AND user_id = $2',
        [eventId, userId]
      );

      if (!result.success) {
        return res.status(500).json({ success: false, error: result.error });
      }

      if (result.data.length === 0) {
        return res.status(404).json({ success: false, error: 'Evento não encontrado' });
      }

      return res.json({ success: true, data: result.data[0] });
    } catch (error) {
      console.error('❌ [CalendarEvents] Erro ao buscar evento específico:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  router.get('/:userId/availability', async (req, res) => {
    try {
      const { userId } = req.params;
      const { dateFrom, dateTo } = req.query;

      if (!dateFrom || !dateTo) {
        return res.status(400).json({ success: false, error: 'dateFrom e dateTo são obrigatórios (formato YYYY-MM-DD)' });
      }

      const result = await neonDB.executeQuery(
        `SELECT event_date, COUNT(*) as event_count, 
                json_agg(json_build_object('id', id, 'title', title, 'start_time', start_time, 'end_time', end_time, 'is_all_day', is_all_day)) as events
         FROM calendar_events 
         WHERE user_id = $1 AND event_date >= $2 AND event_date <= $3
         GROUP BY event_date
         ORDER BY event_date ASC`,
        [userId, dateFrom, dateTo]
      );

      if (!result.success) {
        return res.status(500).json({ success: false, error: result.error });
      }

      const busyDays = {};
      for (const row of result.data) {
        const dateStr = row.event_date instanceof Date
          ? row.event_date.toISOString().split('T')[0]
          : String(row.event_date).split('T')[0];
        busyDays[dateStr] = {
          event_count: parseInt(row.event_count),
          events: typeof row.events === 'string' ? JSON.parse(row.events) : row.events
        };
      }

      const start = new Date(dateFrom + 'T00:00:00');
      const end = new Date(dateTo + 'T00:00:00');
      const freeDays = [];
      const busyDaysList = [];
      const cursor = new Date(start);

      while (cursor <= end) {
        const dateStr = cursor.toISOString().split('T')[0];
        const dayOfWeek = cursor.getDay();
        const isWeekday = dayOfWeek !== 0 && dayOfWeek !== 6;

        if (busyDays[dateStr]) {
          busyDaysList.push({ date: dateStr, ...busyDays[dateStr], is_weekday: isWeekday });
        } else if (isWeekday) {
          freeDays.push({ date: dateStr, is_weekday: true });
        }

        cursor.setDate(cursor.getDate() + 1);
      }

      return res.json({
        success: true,
        data: {
          period: { from: dateFrom, to: dateTo },
          free_days: freeDays,
          busy_days: busyDaysList,
          summary: {
            total_free_weekdays: freeDays.length,
            total_busy_days: busyDaysList.length,
            total_events: Object.values(busyDays).reduce((sum, d) => sum + d.event_count, 0)
          }
        }
      });
    } catch (error) {
      console.error('❌ [CalendarEvents] Erro ao analisar disponibilidade:', error);
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
