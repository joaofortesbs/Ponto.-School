
const { createClient } = require('@supabase/supabase-js');

// Handler para aplicar migrações manualmente
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { migracao } = req.body;
    
    if (!migracao) {
      return res.status(400).json({ error: 'Nome da migração não fornecido' });
    }
    
    // Cria cliente do Supabase
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({ error: 'Credenciais do Supabase não configuradas' });
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Lê o arquivo de migração
    const fs = require('fs');
    const path = require('path');
    
    const migracaoPath = path.join(process.cwd(), 'supabase', 'migrations', migracao);
    
    if (!fs.existsSync(migracaoPath)) {
      return res.status(404).json({ error: 'Arquivo de migração não encontrado' });
    }
    
    const sqlContent = fs.readFileSync(migracaoPath, 'utf8');
    
    // Executa a migração SQL
    const { error } = await supabase.rpc('execute_sql', { sql: sqlContent });
    
    if (error) {
      console.error("Erro ao aplicar migração:", error);
      return res.status(500).json({ error: `Erro ao aplicar migração: ${error.message}` });
    }
    
    return res.status(200).json({ message: 'Migração aplicada com sucesso' });
    
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    return res.status(500).json({ error: 'Erro ao processar requisição' });
  }
}
