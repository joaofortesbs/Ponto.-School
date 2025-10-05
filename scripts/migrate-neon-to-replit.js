import pg from 'pg';

const { Pool } = pg;

const neonConnectionString = 'postgresql://neondb_owner:npg_pbB26RKGeTmL@ep-floral-rice-afq0ee1h.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require';
const replitConnectionString = process.env.DATABASE_URL;

console.log('🔑 Testando conexão com Neon...');
console.log('📍 Host: ep-floral-rice-afq0ee1h.c-2.us-west-2.aws.neon.tech');
console.log('👤 User: neondb_owner');
console.log('🗄️ Database: neondb\n');

const neonPool = new Pool({
  connectionString: neonConnectionString,
  ssl: { 
    rejectUnauthorized: false,
    require: true
  },
  connectionTimeoutMillis: 10000
});

const replitPool = new Pool({
  connectionString: replitConnectionString,
  ssl: { rejectUnauthorized: false }
});

async function getTables(pool) {
  const result = await pool.query(`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);
  return result.rows.map(row => row.tablename);
}

async function getTableSchema(pool, tableName) {
  const result = await pool.query(`
    SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position;
  `, [tableName]);
  return result.rows;
}

async function getTableData(pool, tableName) {
  const result = await pool.query(`SELECT * FROM "${tableName}"`);
  return result.rows;
}

async function createTable(pool, tableName, schema) {
  const columns = schema.map(col => {
    let def = `"${col.column_name}" ${col.data_type}`;
    
    if (col.character_maximum_length) {
      def += `(${col.character_maximum_length})`;
    }
    
    if (col.is_nullable === 'NO') {
      def += ' NOT NULL';
    }
    
    if (col.column_default) {
      def += ` DEFAULT ${col.column_default}`;
    }
    
    return def;
  }).join(', ');

  const createTableSQL = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns})`;
  
  console.log(`📝 Criando tabela: ${tableName}`);
  await pool.query(createTableSQL);
}

async function insertData(pool, tableName, data) {
  if (data.length === 0) {
    console.log(`⚠️  Tabela ${tableName} está vazia, pulando...`);
    return;
  }

  const columns = Object.keys(data[0]);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const columnNames = columns.map(c => `"${c}"`).join(', ');

  console.log(`📥 Inserindo ${data.length} registros em ${tableName}...`);

  for (const row of data) {
    const values = columns.map(col => row[col]);
    const insertSQL = `INSERT INTO "${tableName}" (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
    
    try {
      await pool.query(insertSQL, values);
    } catch (error) {
      console.error(`❌ Erro ao inserir em ${tableName}:`, error.message);
    }
  }
}

async function migrateDatabase() {
  try {
    console.log('🚀 Iniciando migração do Neon para Replit...\n');

    console.log('🔍 Conectando ao banco Neon externo...');
    const neonTables = await getTables(neonPool);
    console.log(`✅ Encontradas ${neonTables.length} tabelas no Neon:`, neonTables.join(', '));
    console.log('');

    console.log('🔍 Conectando ao banco Replit...');
    await replitPool.query('SELECT 1');
    console.log('✅ Conectado ao banco Replit\n');

    for (const tableName of neonTables) {
      console.log(`\n📋 Processando tabela: ${tableName}`);
      console.log('─'.repeat(50));

      const schema = await getTableSchema(neonPool, tableName);
      console.log(`📊 Schema com ${schema.length} colunas`);

      await createTable(replitPool, tableName, schema);

      const data = await getTableData(neonPool, tableName);
      console.log(`📦 ${data.length} registros encontrados`);

      await insertData(replitPool, tableName, data);
      console.log(`✅ Tabela ${tableName} migrada com sucesso!`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Migração concluída com sucesso!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await neonPool.end();
    await replitPool.end();
  }
}

migrateDatabase().catch(console.error);
