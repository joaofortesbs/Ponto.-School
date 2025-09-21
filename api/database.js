
const { neonDB } = require('./neon-db.js');

async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    const { query, params = [] } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query é obrigatória' });
    }

    const result = await neonDB.executeQuery(query, params);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        rowCount: result.rowCount
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Erro interno do servidor'
      });
    }

  } catch (error) {
    console.error('Erro na query do banco de dados:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  }
}

module.exports = handler;
