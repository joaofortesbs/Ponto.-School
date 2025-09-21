
const { Client } = require('pg');

// Configuração da conexão com o banco Neon
const connectionConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

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

  const client = new Client(connectionConfig);

  try {
    const { query, params = [] } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: 'Query é obrigatória' });
    }

    await client.connect();
    const result = await client.query(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
      rowCount: result.rowCount
    });

  } catch (error) {
    console.error('Erro na query do banco de dados:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno do servidor'
    });
  } finally {
    await client.end();
  }
}

module.exports = handler;
