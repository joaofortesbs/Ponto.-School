
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Aplicando migração para a tabela de eventos do calendário...');

try {
  // Verificar se a pasta de migrações existe
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error('Pasta de migrações não encontrada:', migrationsDir);
    process.exit(1);
  }

  // Executar a migração com o Supabase CLI
  execSync('npx supabase migration up', { stdio: 'inherit' });
  
  console.log('Migração aplicada com sucesso!');
  console.log('A tabela calendar_events foi criada no banco de dados.');
} catch (error) {
  console.error('Erro ao aplicar migração:', error.message);
  process.exit(1);
}
