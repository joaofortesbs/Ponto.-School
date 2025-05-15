
// API endpoint para executar o script de correção de tabelas
const { execSync } = require('child_process');

export default function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

    console.log('Executando script de correção de tabelas...');
    
    try {
      // Executar o script fix-missing-tables.js
      const output = execSync('node scripts/fix-missing-tables.js', { encoding: 'utf8' });
      
      console.log('Script executado com sucesso:', output);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Tabelas corrigidas com sucesso',
        output
      });
    } catch (execError) {
      console.error('Erro ao executar script:', execError);
      
      return res.status(500).json({ 
        success: false, 
        message: `Erro ao executar script: ${execError.message}`,
        error: execError.toString()
      });
    }
  } catch (error) {
    console.error('Erro no endpoint:', error);
    
    return res.status(500).json({ 
      success: false, 
      message: `Erro no endpoint: ${error.message}`,
      error: error.toString() 
    });
  }
}
