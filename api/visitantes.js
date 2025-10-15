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

// POST /api/visitantes - Registrar nova visita
router.post('/', async (req, res) => {
  const client = getDbClient();
  
  const { 
    codigo_atividade, 
    id_usuario_visitante, 
    nome_visitante, 
    email_visitante, 
    tipo_visitante = 'anonimo',
    ip_address,
    user_agent
  } = req.body;

  console.log('📊 [VISITANTES] Registrando novo acesso:', { codigo_atividade, nome_visitante, tipo_visitante });

  try {
    await client.connect();

    // Verifica se já existe visita hoje do mesmo IP/código
    const checkQuery = `
      SELECT id FROM visitantes_atividades 
      WHERE codigo_atividade = $1 
      AND ip_address = $2 
      AND DATE(data_acesso) = CURRENT_DATE
    `;
    
    const checkResult = await client.query(checkQuery, [codigo_atividade, ip_address]);

    if (checkResult.rows.length > 0) {
      console.log('⚠️ [VISITANTES] Visita duplicada - já registrada hoje');
      await client.end();
      return res.json({ 
        success: true, 
        message: 'Visita já registrada hoje',
        isDuplicate: true 
      });
    }

    // Registra nova visita
    const insertQuery = `
      INSERT INTO visitantes_atividades 
      (codigo_atividade, id_usuario_visitante, nome_visitante, email_visitante, tipo_visitante, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await client.query(insertQuery, [
      codigo_atividade,
      id_usuario_visitante || null,
      nome_visitante || 'Visitante Anônimo',
      email_visitante || null,
      tipo_visitante,
      ip_address || 'unknown',
      user_agent || 'unknown'
    ]);

    console.log('✅ [VISITANTES] Visita registrada com sucesso:', result.rows[0].id);

    await client.end();

    res.json({ 
      success: true, 
      message: 'Visita registrada com sucesso',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ [VISITANTES] Erro ao registrar visita:', error);
    await client.end();
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao registrar visita',
      details: error.message 
    });
  }
});

// GET /api/visitantes/:userId - Buscar estatísticas do usuário
router.get('/:userId', async (req, res) => {
  const client = getDbClient();
  const { userId } = req.params;
  
  console.log('📈 [VISITANTES] Buscando estatísticas para usuário:', userId);

  try {
    await client.connect();

    // Busca todas as atividades do usuário
    const atividadesQuery = `
      SELECT id as codigo_atividade 
      FROM atividades 
      WHERE id_user = $1
    `;
    
    const atividadesResult = await client.query(atividadesQuery, [userId]);
    const codigosAtividades = atividadesResult.rows.map(row => row.codigo_atividade);

    if (codigosAtividades.length === 0) {
      await client.end();
      return res.json({
        success: true,
        data: {
          totalVisitas: 0,
          visitasHoje: 0,
          visitantes: [],
          visitasPorAtividade: []
        }
      });
    }

    // Busca estatísticas gerais
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT id) as total_visitas,
        COUNT(DISTINCT CASE WHEN DATE(data_acesso) = CURRENT_DATE THEN id END) as visitas_hoje,
        COUNT(DISTINCT ip_address) as visitantes_unicos
      FROM visitantes_atividades
      WHERE codigo_atividade = ANY($1)
    `;

    const statsResult = await client.query(statsQuery, [codigosAtividades]);

    // Busca lista de visitantes recentes (últimos 50)
    const visitantesQuery = `
      SELECT 
        v.id,
        v.codigo_atividade,
        v.nome_visitante,
        v.email_visitante,
        v.tipo_visitante,
        v.data_acesso,
        (a.id_json::jsonb)->>'title' as titulo_atividade
      FROM visitantes_atividades v
      LEFT JOIN atividades a ON a.id = v.codigo_atividade
      WHERE v.codigo_atividade = ANY($1)
      ORDER BY v.data_acesso DESC
      LIMIT 50
    `;

    const visitantesResult = await client.query(visitantesQuery, [codigosAtividades]);

    // Busca visitas por atividade
    const porAtividadeQuery = `
      SELECT 
        v.codigo_atividade,
        (a.id_json::jsonb)->>'title' as titulo_atividade,
        COUNT(*) as total_visitas,
        COUNT(DISTINCT v.ip_address) as visitantes_unicos
      FROM visitantes_atividades v
      LEFT JOIN atividades a ON a.id = v.codigo_atividade
      WHERE v.codigo_atividade = ANY($1)
      GROUP BY v.codigo_atividade, a.id_json
      ORDER BY total_visitas DESC
    `;

    const porAtividadeResult = await client.query(porAtividadeQuery, [codigosAtividades]);

    const estatisticas = {
      totalVisitas: parseInt(statsResult.rows[0]?.total_visitas || 0),
      visitasHoje: parseInt(statsResult.rows[0]?.visitas_hoje || 0),
      visitantesUnicos: parseInt(statsResult.rows[0]?.visitantes_unicos || 0),
      visitantes: visitantesResult.rows,
      visitasPorAtividade: porAtividadeResult.rows
    };

    console.log('✅ [VISITANTES] Estatísticas calculadas:', {
      total: estatisticas.totalVisitas,
      hoje: estatisticas.visitasHoje,
      unicos: estatisticas.visitantesUnicos
    });

    await client.end();

    res.json({ 
      success: true, 
      data: estatisticas 
    });

  } catch (error) {
    console.error('❌ [VISITANTES] Erro ao buscar estatísticas:', error);
    await client.end();
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar estatísticas',
      details: error.message 
    });
  }
});

// GET /api/visitantes/atividade/:codigoAtividade - Buscar visitantes de uma atividade
router.get('/atividade/:codigoAtividade', async (req, res) => {
  const client = getDbClient();
  const { codigoAtividade } = req.params;
  
  console.log('👥 [VISITANTES] Buscando visitantes da atividade:', codigoAtividade);

  try {
    await client.connect();

    const query = `
      SELECT 
        id,
        nome_visitante,
        email_visitante,
        tipo_visitante,
        data_acesso,
        ip_address
      FROM visitantes_atividades
      WHERE codigo_atividade = $1
      ORDER BY data_acesso DESC
    `;

    const result = await client.query(query, [codigoAtividade]);

    console.log(`✅ [VISITANTES] Encontrados ${result.rows.length} visitantes`);

    await client.end();

    res.json({ 
      success: true, 
      data: result.rows 
    });

  } catch (error) {
    console.error('❌ [VISITANTES] Erro ao buscar visitantes:', error);
    await client.end();
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar visitantes',
      details: error.message 
    });
  }
});

export default router;
