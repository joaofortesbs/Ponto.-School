
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
// Script para ser executado pela API fix-tables.js
const { createClient } = require('@supabase/supabase-js');

// Obter credenciais do ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTablesApi() {
  console.log('🚀 Iniciando correção de tabelas via API...');

  try {
    // Verificar conexão com Supabase
    const { data: connectionTest, error: connectionError } = await supabase.auth.getSession();
    
    if (connectionError) {
      console.error('❌ Erro de conexão com Supabase:', connectionError);
      return { success: false, message: `Erro de conexão: ${connectionError.message}` };
    }
    
    console.log('✅ Conexão com Supabase estabelecida');
    
    // Tentar criar a função execute_sql se necessário
    try {
      await supabase.rpc('execute_sql', { sql_query: 'SELECT 1;' }).catch(async () => {
        console.log('Função execute_sql não existe, criando...');
        
        // Criar a função execute_sql diretamente via REST API
        const createFunctionResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            sql_query: `
              CREATE OR REPLACE FUNCTION execute_sql(sql_query text) 
              RETURNS void AS $$
              BEGIN
                EXECUTE sql_query;
              END;
              $$ LANGUAGE plpgsql SECURITY DEFINER;
            `
          })
        });
        
        if (!createFunctionResponse.ok) {
          console.warn('⚠️ Não foi possível criar função execute_sql via REST API');
        } else {
          console.log('✅ Função execute_sql criada com sucesso');
        }
      });
    } catch (functionError) {
      console.warn('⚠️ Não foi possível verificar/criar função execute_sql:', functionError);
    }
    
    // Criar tabela grupos_estudo
    try {
      const { data: gruposCheck, error: gruposCheckError } = await supabase
        .from('grupos_estudo')
        .select('id')
        .limit(1);
        
      if (gruposCheckError && gruposCheckError.code === '42P01') {
        console.log('Criando tabela grupos_estudo...');
        
        // Tentar usar RPC
        const { error: createError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.grupos_estudo (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              user_id UUID NOT NULL,
              nome TEXT NOT NULL,
              descricao TEXT,
              cor TEXT NOT NULL DEFAULT '#FF6B00',
              membros INTEGER NOT NULL DEFAULT 1,
              membros_ids JSONB DEFAULT '[]'::jsonb,
              topico TEXT,
              topico_nome TEXT,
              topico_icon TEXT,
              privado BOOLEAN DEFAULT false,
              visibilidade TEXT DEFAULT 'todos',
              codigo TEXT,
              disciplina TEXT DEFAULT 'Geral',
              data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
            
            CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON public.grupos_estudo(user_id);
            
            ALTER TABLE public.grupos_estudo ENABLE ROW LEVEL SECURITY;
            
            DROP POLICY IF EXISTS "Usuários podem visualizar grupos" ON public.grupos_estudo;
            CREATE POLICY "Usuários podem visualizar grupos"
              ON public.grupos_estudo FOR SELECT
              USING (true);
              
            DROP POLICY IF EXISTS "Usuários podem inserir grupos" ON public.grupos_estudo;
            CREATE POLICY "Usuários podem inserir grupos"
              ON public.grupos_estudo FOR INSERT
              WITH CHECK (true);
              
            DROP POLICY IF EXISTS "Usuários podem atualizar grupos" ON public.grupos_estudo;
            CREATE POLICY "Usuários podem atualizar grupos"
              ON public.grupos_estudo FOR UPDATE
              USING (true);
          `
        }).catch(() => ({ error: { message: "RPC não disponível" } }));
        
        if (createError) {
          console.error('❌ Erro ao criar tabela grupos_estudo via RPC:', createError);
          // Se o RPC falhar, podemos tentar outros métodos aqui
        } else {
          console.log('✅ Tabela grupos_estudo criada com sucesso');
        }
      } else if (gruposCheckError) {
        console.error('❌ Erro ao verificar tabela grupos_estudo:', gruposCheckError);
      } else {
        console.log('✅ Tabela grupos_estudo já existe');
      }
    } catch (gruposError) {
      console.error('❌ Erro ao criar tabela grupos_estudo:', gruposError);
    }
    
    // Criar tabela codigos_grupos_estudo
    try {
      const { data: codigosCheck, error: codigosCheckError } = await supabase
        .from('codigos_grupos_estudo')
        .select('codigo')
        .limit(1);
        
      if (codigosCheckError && codigosCheckError.code === '42P01') {
        console.log('Criando tabela codigos_grupos_estudo...');
        
        // Tentar usar RPC
        const { error: createError } = await supabase.rpc('execute_sql', {
          sql_query: `
            CREATE TABLE IF NOT EXISTS public.codigos_grupos_estudo (
              codigo VARCHAR(15) PRIMARY KEY,
              grupo_id UUID NOT NULL,
              nome VARCHAR NOT NULL,
              descricao TEXT,
              data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
              user_id UUID,
              privado BOOLEAN DEFAULT false,
              membros INTEGER DEFAULT 1,
              visibilidade VARCHAR,
              disciplina VARCHAR,
              cor VARCHAR DEFAULT '#FF6B00',
              membros_ids JSONB DEFAULT '[]'::jsonb,
              ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
            
            CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_grupo_id ON public.codigos_grupos_estudo(grupo_id);
            CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_user_id ON public.codigos_grupos_estudo(user_id);
            
            ALTER TABLE public.codigos_grupos_estudo ENABLE ROW LEVEL SECURITY;
            
            DROP POLICY IF EXISTS "Todos podem visualizar códigos" ON public.codigos_grupos_estudo;
            CREATE POLICY "Todos podem visualizar códigos"
              ON public.codigos_grupos_estudo FOR SELECT
              USING (true);
              
            DROP POLICY IF EXISTS "Todos podem inserir códigos" ON public.codigos_grupos_estudo;
            CREATE POLICY "Todos podem inserir códigos"
              ON public.codigos_grupos_estudo FOR INSERT
              WITH CHECK (true);
              
            DROP POLICY IF EXISTS "Todos podem atualizar códigos" ON public.codigos_grupos_estudo;
            CREATE POLICY "Todos podem atualizar códigos"
              ON public.codigos_grupos_estudo FOR UPDATE
              USING (true);
          `
        }).catch(() => ({ error: { message: "RPC não disponível" } }));
        
        if (createError) {
          console.error('❌ Erro ao criar tabela codigos_grupos_estudo via RPC:', createError);
          // Se o RPC falhar, podemos tentar outros métodos aqui
        } else {
          console.log('✅ Tabela codigos_grupos_estudo criada com sucesso');
        }
      } else if (codigosCheckError) {
        console.error('❌ Erro ao verificar tabela codigos_grupos_estudo:', codigosCheckError);
      } else {
        console.log('✅ Tabela codigos_grupos_estudo já existe');
      }
    } catch (codigosError) {
      console.error('❌ Erro ao criar tabela codigos_grupos_estudo:', codigosError);
    }
    
    // Verificar se as tabelas foram criadas com sucesso
    try {
      const { data: gruposVerify, error: gruposVerifyError } = await supabase
        .from('grupos_estudo')
        .select('id')
        .limit(1);
        
      const { data: codigosVerify, error: codigosVerifyError } = await supabase
        .from('codigos_grupos_estudo')
        .select('codigo')
        .limit(1);
      
      if (gruposVerifyError || codigosVerifyError) {
        return { 
          success: false, 
          message: "Algumas tabelas não foram criadas corretamente",
          gruposEstudo: gruposVerifyError ? "erro" : "ok",
          codigosGruposEstudo: codigosVerifyError ? "erro" : "ok"
        };
      }
      
      console.log('✅ Ambas as tabelas estão acessíveis');
      return { success: true, message: "Tabelas criadas e verificadas com sucesso" };
    } catch (verifyError) {
      console.error('❌ Erro ao verificar se as tabelas foram criadas:', verifyError);
      return { success: false, message: `Erro ao verificar tabelas: ${verifyError.message}` };
    }
  } catch (error) {
    console.error('❌ Erro durante a correção de tabelas:', error);
    return { success: false, message: `Erro: ${error.message}` };
  }
}

// Executar diretamente se for chamado como script
if (require.main === module) {
  fixTablesApi()
    .then(result => {
      console.log('Resultado:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = fixTablesApi;
/**
 * Script para iniciar um servidor API temporário para correção de tabelas
 * Este script é utilizado como fallback quando outros métodos falham
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Credenciais do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Credenciais do Supabase não encontradas no ambiente');
  process.exit(1);
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Criar servidor Express
const app = express();
const PORT = process.env.PORT || 3333;

// Middleware
app.use(cors());
app.use(express.json());

// Rota principal para correção de tabelas
app.post('/api/fix-tables', async (req, res) => {
  console.log('Solicitação recebida para corrigir tabelas');
  
  try {
    // Criar extensão uuid-ossp (importante para as tabelas)
    try {
      await supabase.rpc('execute_sql', { 
        sql_query: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` 
      });
      console.log('✅ Extensão uuid-ossp criada/verificada com sucesso');
    } catch (extError) {
      console.warn('⚠️ Não foi possível criar extensão uuid-ossp:', extError);
    }

    // Criar tabela grupos_estudo
    try {
      await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.grupos_estudo (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            nome TEXT NOT NULL,
            descricao TEXT,
            cor TEXT NOT NULL DEFAULT '#FF6B00',
            membros INTEGER NOT NULL DEFAULT 1,
            membros_ids JSONB DEFAULT '[]'::jsonb,
            topico TEXT,
            topico_nome TEXT,
            topico_icon TEXT,
            privado BOOLEAN DEFAULT false,
            visibilidade TEXT DEFAULT 'todos',
            codigo TEXT,
            disciplina TEXT DEFAULT 'Geral',
            data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON public.grupos_estudo(user_id);
          
          ALTER TABLE public.grupos_estudo ENABLE ROW LEVEL SECURITY;
          
          DO $$
          BEGIN
            BEGIN
              DROP POLICY IF EXISTS "Usuários podem visualizar grupos" ON public.grupos_estudo;
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              CREATE POLICY "Usuários podem visualizar grupos"
                ON public.grupos_estudo FOR SELECT
                USING (true);
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              DROP POLICY IF EXISTS "Usuários podem inserir grupos" ON public.grupos_estudo;
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              CREATE POLICY "Usuários podem inserir grupos"
                ON public.grupos_estudo FOR INSERT
                WITH CHECK (true);
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              DROP POLICY IF EXISTS "Usuários podem atualizar grupos" ON public.grupos_estudo;
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              CREATE POLICY "Usuários podem atualizar grupos"
                ON public.grupos_estudo FOR UPDATE
                USING (true);
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              DROP POLICY IF EXISTS "Usuários podem excluir grupos" ON public.grupos_estudo;
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              CREATE POLICY "Usuários podem excluir grupos"
                ON public.grupos_estudo FOR DELETE
                USING (true);
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
          END
          $$;
        `
      });
      console.log('✅ Tabela grupos_estudo criada com sucesso');
    } catch (gruposError) {
      console.error('❌ Erro ao criar tabela grupos_estudo:', gruposError);
      return res.status(500).json({ 
        success: false, 
        error: `Erro ao criar tabela grupos_estudo: ${gruposError.message}` 
      });
    }

    // Criar tabela codigos_grupos_estudo
    try {
      await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.codigos_grupos_estudo (
            codigo VARCHAR(15) PRIMARY KEY,
            grupo_id UUID NOT NULL,
            nome VARCHAR(255) NOT NULL,
            descricao TEXT,
            data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
            user_id UUID,
            privado BOOLEAN DEFAULT false,
            membros INTEGER DEFAULT 1,
            visibilidade VARCHAR(50),
            disciplina VARCHAR(100),
            cor VARCHAR(50) DEFAULT '#FF6B00',
            membros_ids JSONB DEFAULT '[]'::jsonb,
            ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_grupo_id ON public.codigos_grupos_estudo(grupo_id);
          CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_user_id ON public.codigos_grupos_estudo(user_id);
          
          ALTER TABLE public.codigos_grupos_estudo ENABLE ROW LEVEL SECURITY;
          
          DO $$
          BEGIN
            BEGIN
              DROP POLICY IF EXISTS "Todos podem visualizar códigos" ON public.codigos_grupos_estudo;
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              CREATE POLICY "Todos podem visualizar códigos"
                ON public.codigos_grupos_estudo FOR SELECT
                USING (true);
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              DROP POLICY IF EXISTS "Todos podem inserir códigos" ON public.codigos_grupos_estudo;
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              CREATE POLICY "Todos podem inserir códigos"
                ON public.codigos_grupos_estudo FOR INSERT
                WITH CHECK (true);
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              DROP POLICY IF EXISTS "Todos podem atualizar códigos" ON public.codigos_grupos_estudo;
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
            
            BEGIN
              CREATE POLICY "Todos podem atualizar códigos"
                ON public.codigos_grupos_estudo FOR UPDATE
                USING (true);
              EXCEPTION WHEN OTHERS THEN
              NULL;
            END;
          END
          $$;
        `
      });
      console.log('✅ Tabela codigos_grupos_estudo criada com sucesso');
    } catch (codigosError) {
      console.error('❌ Erro ao criar tabela codigos_grupos_estudo:', codigosError);
      return res.status(500).json({ 
        success: false, 
        error: `Erro ao criar tabela codigos_grupos_estudo: ${codigosError.message}` 
      });
    }

    // Verificar se as tabelas foram criadas corretamente
    try {
      const { data: gruposCheck, error: gruposCheckError } = await supabase
        .from('grupos_estudo')
        .select('id')
        .limit(1);
        
      if (gruposCheckError) {
        console.error('❌ Erro ao verificar tabela grupos_estudo:', gruposCheckError);
        return res.status(500).json({ 
          success: false, 
          error: `Erro ao verificar tabela grupos_estudo: ${gruposCheckError.message}` 
        });
      }
      
      const { data: codigosCheck, error: codigosCheckError } = await supabase
        .from('codigos_grupos_estudo')
        .select('codigo')
        .limit(1);
        
      if (codigosCheckError) {
        console.error('❌ Erro ao verificar tabela codigos_grupos_estudo:', codigosCheckError);
        return res.status(500).json({ 
          success: false, 
          error: `Erro ao verificar tabela codigos_grupos_estudo: ${codigosCheckError.message}` 
        });
      }
      
      console.log('✅ Ambas as tabelas verificadas com sucesso!');
      return res.status(200).json({ 
        success: true, 
        message: 'Tabelas criadas e verificadas com sucesso!' 
      });
    } catch (verifyError) {
      console.error('❌ Erro ao verificar tabelas:', verifyError);
      return res.status(500).json({ 
        success: false, 
        error: `Erro ao verificar tabelas: ${verifyError.message}` 
      });
    }
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return res.status(500).json({ 
      success: false, 
      error: `Erro geral: ${error.message}` 
    });
  }
});

// Rota de status
app.get('/api/fix-tables/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    message: 'API de correção de tabelas está operacional'
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor API de correção de tabelas rodando em http://0.0.0.0:${PORT}`);
  console.log(`Acesse http://0.0.0.0:${PORT}/api/fix-tables/status para verificar o status`);
  console.log('Para corrigir as tabelas, envie uma requisição POST para /api/fix-tables');
});
