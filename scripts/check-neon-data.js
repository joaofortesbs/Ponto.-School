import pg from 'pg';

const { Pool } = pg;

const neonPool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_XjKY4iUb0sIW@ep-proud-scene-a5buudsi.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: { 
    rejectUnauthorized: false,
    require: true
  }
});

async function checkDatabase() {
  try {
    console.log('🔍 Verificando banco de dados Neon...\n');

    // Verificar todos os schemas
    const schemasResult = await neonPool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name;
    `);
    console.log('📂 Schemas encontrados:', schemasResult.rows.map(r => r.schema_name).join(', '));

    // Verificar todas as tabelas em todos os schemas
    const tablesResult = await neonPool.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY table_schema, table_name;
    `);
    
    console.log('\n📋 Tabelas encontradas:');
    for (const table of tablesResult.rows) {
      const countResult = await neonPool.query(`SELECT COUNT(*) FROM "${table.table_schema}"."${table.table_name}"`);
      console.log(`  - ${table.table_schema}.${table.table_name}: ${countResult.rows[0].count} registros`);
    }

    // Verificar tamanho do banco
    const sizeResult = await neonPool.query(`
      SELECT pg_size_pretty(pg_database_size('neondb')) as size;
    `);
    console.log(`\n💾 Tamanho do banco: ${sizeResult.rows[0].size}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await neonPool.end();
  }
}

checkDatabase();
