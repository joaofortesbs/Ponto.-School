
// Script para criar um endpoint que facilita a correção das tabelas
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
const http = require('http');
const url = require('url');

// Servidor HTTP simples para fornecer endpoints de correção
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Responder às requisições OPTIONS (pré-requisição CORS)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Endpoint para executar o script de correção das tabelas
  if (path === '/api/fix-tables' && req.method === 'POST') {
    try {
      console.log('Recebido pedido para corrigir tabelas');
      
      // Executar o script fix-missing-tables.js
      const output = execSync('node scripts/fix-missing-tables.js', { encoding: 'utf8' });
      
      console.log('Script executado com sucesso:', output);
      
      // Responder com sucesso
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        message: 'Tabelas verificadas/criadas com sucesso',
        output
      }));
    } catch (error) {
      console.error('Erro ao executar script de correção:', error);
      
      // Responder com erro
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: `Erro ao corrigir tabelas: ${error.message}`,
        error: error.toString(),
        stack: error.stack
      }));
    }
    return;
  }

  // Endpoint para executar um workflow específico
  if (path === '/api/run-workflow' && req.method === 'POST') {
    let body = '';
    
    // Coletar dados enviados no corpo da requisição
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    // Processar a requisição quando todos os dados forem recebidos
    req.on('end', () => {
      try {
        const { workflow } = JSON.parse(body);
        
        if (!workflow) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, message: 'Nome do workflow não fornecido' }));
          return;
        }
        
        console.log(`Recebido pedido para executar workflow: ${workflow}`);
        
        try {
          // Executar o workflow específico
          let command;
          
          if (workflow === 'Corrigir Tabelas de Grupos') {
            command = 'node scripts/fix-missing-tables.js';
          } else if (workflow === 'Sync Códigos Grupos') {
            command = 'node scripts/sync-grupos-codigos.js';
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, message: `Workflow desconhecido: ${workflow}` }));
            return;
          }
          
          // Executar o comando
          const output = execSync(command, { encoding: 'utf8' });
          
          console.log(`Workflow '${workflow}' executado com sucesso:`, output);
          
          // Responder com sucesso
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: `Workflow '${workflow}' executado com sucesso`,
            output
          }));
        } catch (execError) {
          console.error(`Erro ao executar workflow '${workflow}':`, execError);
          
          // Responder com erro
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            message: `Erro ao executar workflow '${workflow}': ${execError.message}`,
            error: execError.toString(),
            stack: execError.stack
          }));
        }
      } catch (parseError) {
        console.error('Erro ao processar dados da requisição:', parseError);
        
        // Responder com erro
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          message: `Erro ao processar dados da requisição: ${parseError.message}`
        }));
      }
    });
    return;
  }

  // Endpoint para verificar se as tabelas existem
  if (path === '/api/check-tables' && req.method === 'GET') {
    try {
      console.log('Verificando existência das tabelas...');
      
      // Obter credenciais do ambiente
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          message: 'Credenciais do Supabase não encontradas'
        }));
        return;
      }
      
      // Criar cliente Supabase
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Verificar tabelas
      const promises = [
        supabase.from('grupos_estudo').select('id', { count: 'exact', head: true }),
        supabase.from('codigos_grupos_estudo').select('codigo', { count: 'exact', head: true })
      ];
      
      const [gruposResult, codigosResult] = await Promise.all(promises);
      
      const result = {
        gruposExiste: !gruposResult.error || gruposResult.error.code !== '42P01',
        codigosExiste: !codigosResult.error || codigosResult.error.code !== '42P01',
        gruposCount: gruposResult.count || 0,
        codigosCount: codigosResult.count || 0,
        gruposError: gruposResult.error ? { 
          code: gruposResult.error.code,
          message: gruposResult.error.message
        } : null,
        codigosError: codigosResult.error ? {
          code: codigosResult.error.code,
          message: codigosResult.error.message
        } : null
      };
      
      result.todasExistem = result.gruposExiste && result.codigosExiste;
      
      console.log('Resultado da verificação de tabelas:', result);
      
      // Responder com o resultado
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        ...result
      }));
    } catch (error) {
      console.error('Erro ao verificar tabelas:', error);
      
      // Responder com erro
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        message: `Erro ao verificar tabelas: ${error.message}`,
        error: error.toString()
      }));
    }
    return;
  }
  
  // Endpoint padrão para qualquer outra rota
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    success: false, 
    message: 'Endpoint não encontrado'
  }));
});

// Iniciar o servidor na porta 3333
const PORT = process.env.API_PORT || 3333;
server.listen(PORT, () => {
  console.log(`Servidor de API de correção de tabelas rodando na porta ${PORT}`);
  console.log(`Endpoints disponíveis:`);
  console.log(`- POST /api/fix-tables: Executa o script de correção de tabelas`);
  console.log(`- POST /api/run-workflow: Executa um workflow específico`);
  console.log(`- GET  /api/check-tables: Verifica se as tabelas existem`);
});

// Capturar sinais de encerramento para parar o servidor graciosamente
process.on('SIGTERM', () => {
  console.log('Recebido SIGTERM, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Recebido SIGINT, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});
