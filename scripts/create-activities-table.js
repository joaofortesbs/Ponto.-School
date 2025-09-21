
const { Client } = require('pg');

async function createActivitiesTable() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('🔗 Conectado ao banco Neon');

    // Criar tabela activities
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        activity_code TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        title TEXT,
        content JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await client.query(createTableQuery);
    console.log('✅ Tabela "activities" criada com sucesso');

    // Criar índices para melhor performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_activities_activity_code ON activities(activity_code);',
      'CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);',
      'CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);'
    ];

    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }
    console.log('✅ Índices criados com sucesso');

    // Criar trigger para atualizar updated_at automaticamente
    const triggerQuery = `
      CREATE OR REPLACE FUNCTION update_activities_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_activities_updated_at ON activities;
      CREATE TRIGGER update_activities_updated_at
        BEFORE UPDATE ON activities
        FOR EACH ROW EXECUTE FUNCTION update_activities_updated_at();
    `;

    await client.query(triggerQuery);
    console.log('✅ Trigger de atualização automática criado com sucesso');

    console.log('🎉 Tabela activities configurada com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao configurar tabela activities:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createActivitiesTable();
