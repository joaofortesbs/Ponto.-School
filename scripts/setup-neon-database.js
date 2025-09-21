
const { Client } = require('pg');

async function setupDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    await client.connect();
    console.log('🔗 Conectado ao banco Neon');

    // Criar tabela de perfis
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS perfis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome_completo VARCHAR(255) NOT NULL,
        nome_usuario VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        tipo_conta VARCHAR(50) NOT NULL CHECK (tipo_conta IN ('Professor', 'Aluno', 'Coordenador')),
        pais VARCHAR(100) NOT NULL DEFAULT 'Brasil',
        estado VARCHAR(100) NOT NULL,
        instituicao_ensino VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await client.query(createTableQuery);
    console.log('✅ Tabela "perfis" criada com sucesso');

    // Criar índices para melhor performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_perfis_email ON perfis(email);',
      'CREATE INDEX IF NOT EXISTS idx_perfis_nome_usuario ON perfis(nome_usuario);',
      'CREATE INDEX IF NOT EXISTS idx_perfis_tipo_conta ON perfis(tipo_conta);'
    ];

    for (const indexQuery of indexes) {
      await client.query(indexQuery);
    }
    console.log('✅ Índices criados com sucesso');

    // Criar trigger para atualizar updated_at
    const triggerQuery = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_perfis_updated_at ON perfis;
      CREATE TRIGGER update_perfis_updated_at
        BEFORE UPDATE ON perfis
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    await client.query(triggerQuery);
    console.log('✅ Trigger de atualização criado com sucesso');

    console.log('🎉 Banco de dados configurado com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
