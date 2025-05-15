// API para corrigir tabelas do banco de dados
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

// Inicializar express
const app = express();
app.use(express.json());
app.use(cors());

// Obter credenciais do ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Inicializar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// Endpoint de verificação de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API de correção de tabelas está funcionando!' });
});

// Endpoint principal
app.post('/', async (req, res) => {
  try {
    const { action, codigo } = req.body;

    if (!action) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ação não especificada!' 
      });
    }

    switch (action) {
      case 'check_tables':
        const statusTabelas = await verificarTabelas();
        return res.json({ 
          success: true, 
          status: statusTabelas 
        });

      case 'create_all_tables':
        await criarTodasTabelas();
        return res.json({ 
          success: true, 
          message: 'Todas as tabelas foram criadas com sucesso!' 
        });

      case 'create_grupos_estudo':
        await criarTabelaGruposEstudo();
        return res.json({ 
          success: true, 
          message: 'Tabela grupos_estudo criada com sucesso!' 
        });

      case 'create_codigos_grupos_estudo':
        await criarTabelaCodigosGruposEstudo();
        return res.json({ 
          success: true, 
          message: 'Tabela codigos_grupos_estudo criada com sucesso!' 
        });

      case 'verificar_codigo':
        if (!codigo) {
          return res.status(400).json({ 
            success: false, 
            message: 'Código não fornecido!' 
          });
        }
        const existe = await verificarCodigoExiste(codigo);
        return res.json({ 
          success: true, 
          existe 
        });

      case 'force_create_tables':
        await forcarCriacaoTabelas();
        return res.json({ 
          success: true, 
          message: 'Tabelas criadas de forma forçada com sucesso!' 
        });

      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Ação não reconhecida!' 
        });
    }
  } catch (error) {
    console.error('Erro na API de correção de tabelas:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erro ao processar solicitação',
      error: error.message || 'Erro desconhecido'
    });
  }
});

// Função para verificar estado das tabelas
async function verificarTabelas() {
  try {
    const status = {
      grupos_estudo: { existe: false, registros: 0 },
      codigos_grupos_estudo: { existe: false, registros: 0 }
    };

    // Verificar tabela grupos_estudo
    try {
      const { count, error } = await supabase
        .from('grupos_estudo')
        .select('*', { count: 'exact', head: true });

      if (!error) {
        status.grupos_estudo.existe = true;
        status.grupos_estudo.registros = count || 0;
      }
    } catch (err) {
      // Tabela não existe
    }

    // Verificar tabela codigos_grupos_estudo
    try {
      const { count, error } = await supabase
        .from('codigos_grupos_estudo')
        .select('*', { count: 'exact', head: true });

      if (!error) {
        status.codigos_grupos_estudo.existe = true;
        status.codigos_grupos_estudo.registros = count || 0;
      }
    } catch (err) {
      // Tabela não existe
    }

    return status;
  } catch (error) {
    console.error('Erro ao verificar status das tabelas:', error);
    throw error;
  }
}

// Função para criar todas as tabelas
async function criarTodasTabelas() {
  try {
    // Verificar/criar extensão UUID
    try {
      await supabase.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
      console.log('Extensão UUID verificada/criada');
    } catch (err) {
      console.warn('Aviso ao criar extensão UUID:', err);
      // Continuar mesmo com erro na extensão
    }

    // Criar tabelas
    await criarTabelaGruposEstudo();
    await criarTabelaCodigosGruposEstudo();

    console.log('Todas as tabelas criadas com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao criar todas as tabelas:', error);
    throw error;
  }
}

// Função para criar tabela grupos_estudo
async function criarTabelaGruposEstudo() {
  try {
    // Verificar se a tabela já existe
    try {
      const { count, error } = await supabase
        .from('grupos_estudo')
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`Tabela grupos_estudo já existe com ${count || 0} registros`);
        return true;
      }
    } catch (checkErr) {
      // Tabela não existe, continuar com criação
    }

    // Criar a tabela
    const sqlQuery = `
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
    `;

    await supabase.query(sqlQuery);

    // Criar índices e políticas
    try {
      await supabase.query(`CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON public.grupos_estudo(user_id);`);
    } catch (err) {
      console.warn('Aviso ao criar índice:', err);
    }

    try {
      await supabase.query(`ALTER TABLE public.grupos_estudo ENABLE ROW LEVEL SECURITY;`);
    } catch (err) {
      console.warn('Aviso ao habilitar RLS:', err);
    }

    try {
      await supabase.query(`
        DROP POLICY IF EXISTS "Usuários podem visualizar grupos" ON public.grupos_estudo;
        CREATE POLICY "Usuários podem visualizar grupos"
          ON public.grupos_estudo FOR SELECT
          USING (true);
      `);
    } catch (err) {
      console.warn('Aviso ao criar política SELECT:', err);
    }

    try {
      await supabase.query(`
        DROP POLICY IF EXISTS "Usuários podem inserir grupos" ON public.grupos_estudo;
        CREATE POLICY "Usuários podem inserir grupos"
          ON public.grupos_estudo FOR INSERT
          WITH CHECK (true);
      `);
    } catch (err) {
      console.warn('Aviso ao criar política INSERT:', err);
    }

    try {
      await supabase.query(`
        DROP POLICY IF EXISTS "Usuários podem atualizar grupos" ON public.grupos_estudo;
        CREATE POLICY "Usuários podem atualizar grupos"
          ON public.grupos_estudo FOR UPDATE
          USING (true);
      `);
    } catch (err) {
      console.warn('Aviso ao criar política UPDATE:', err);
    }

    try {
      await supabase.query(`
        DROP POLICY IF EXISTS "Usuários podem excluir grupos" ON public.grupos_estudo;
        CREATE POLICY "Usuários podem excluir grupos"
          ON public.grupos_estudo FOR DELETE
          USING (true);
      `);
    } catch (err) {
      console.warn('Aviso ao criar política DELETE:', err);
    }

    console.log('Tabela grupos_estudo criada com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao criar tabela grupos_estudo:', error);
    throw error;
  }
}

// Função para criar tabela codigos_grupos_estudo
async function criarTabelaCodigosGruposEstudo() {
  try {
    // Verificar se a tabela já existe
    try {
      const { count, error } = await supabase
        .from('codigos_grupos_estudo')
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`Tabela codigos_grupos_estudo já existe com ${count || 0} registros`);
        return true;
      }
    } catch (checkErr) {
      // Tabela não existe, continuar com criação
    }

    // Criar a tabela
    const sqlQuery = `
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
    `;

    await supabase.query(sqlQuery);

    // Criar índices e políticas
    try {
      await supabase.query(`
        CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_grupo_id ON public.codigos_grupos_estudo(grupo_id);
        CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_user_id ON public.codigos_grupos_estudo(user_id);
      `);
    } catch (err) {
      console.warn('Aviso ao criar índices:', err);
    }

    try {
      await supabase.query(`ALTER TABLE public.codigos_grupos_estudo ENABLE ROW LEVEL SECURITY;`);
    } catch (err) {
      console.warn('Aviso ao habilitar RLS:', err);
    }

    try {
      await supabase.query(`
        DROP POLICY IF EXISTS "Todos podem visualizar códigos" ON public.codigos_grupos_estudo;
        CREATE POLICY "Todos podem visualizar códigos"
          ON public.codigos_grupos_estudo FOR SELECT
          USING (true);
      `);
    } catch (err) {
      console.warn('Aviso ao criar política SELECT:', err);
    }

    try {
      await supabase.query(`
        DROP POLICY IF EXISTS "Todos podem inserir códigos" ON public.codigos_grupos_estudo;
        CREATE POLICY "Todos podem inserir códigos"
          ON public.codigos_grupos_estudo FOR INSERT
          WITH CHECK (true);
      `);
    } catch (err) {
      console.warn('Aviso ao criar política INSERT:', err);
    }

    try {
      await supabase.query(`
        DROP POLICY IF EXISTS "Todos podem atualizar códigos" ON public.codigos_grupos_estudo;
        CREATE POLICY "Todos podem atualizar códigos"
          ON public.codigos_grupos_estudo FOR UPDATE
          USING (true);
      `);
    } catch (err) {
      console.warn('Aviso ao criar política UPDATE:', err);
    }

    console.log('Tabela codigos_grupos_estudo criada com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao criar tabela codigos_grupos_estudo:', error);
    throw error;
  }
}

// Função para forçar a criação das tabelas (DROP e CREATE)
async function forcarCriacaoTabelas() {
  try {
    console.log('Iniciando criação forçada de tabelas...');

    // 1. Extensão UUID
    try {
      await supabase.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
      console.log('Extensão UUID criada com sucesso');
    } catch (err) {
      console.warn('Aviso ao criar extensão UUID:', err.message);
    }

    // 2. Tabela grupos_estudo
    try {
      // Remover tabela se existir
      try {
        await supabase.query(`DROP TABLE IF EXISTS public.grupos_estudo CASCADE;`);
        console.log('Tabela grupos_estudo removida');
      } catch (dropErr) {
        console.warn('Aviso ao remover tabela:', dropErr.message);
      }

      // Criar tabela
      await supabase.query(`
        CREATE TABLE public.grupos_estudo (
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
      `);
      console.log('Tabela grupos_estudo criada');

      // Criar índice
      try {
        await supabase.query(`CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON public.grupos_estudo(user_id);`);
      } catch (indexErr) {
        console.warn('Aviso ao criar índice:', indexErr.message);
      }

      // Configurar RLS
      try {
        await supabase.query(`
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

          DROP POLICY IF EXISTS "Usuários podem excluir grupos" ON public.grupos_estudo;
          CREATE POLICY "Usuários podem excluir grupos"
            ON public.grupos_estudo FOR DELETE
            USING (true);
        `);
      } catch (rlsErr) {
        console.warn('Aviso ao configurar RLS:', rlsErr.message);
      }
    } catch (err) {
      console.error('Erro ao criar tabela grupos_estudo:', err.message);
    }

    // 3. Tabela codigos_grupos_estudo
    try {
      // Remover tabela se existir
      try {
        await supabase.query(`DROP TABLE IF EXISTS public.codigos_grupos_estudo CASCADE;`);
        console.log('Tabela codigos_grupos_estudo removida');
      } catch (dropErr) {
        console.warn('Aviso ao remover tabela:', dropErr.message);
      }

      // Criar tabela
      await supabase.query(`
        CREATE TABLE public.codigos_grupos_estudo (
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
      `);
      console.log('Tabela codigos_grupos_estudo criada');

      // Criar índices
      try {
        await supabase.query(`
          CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_grupo_id ON public.codigos_grupos_estudo(grupo_id);
          CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_user_id ON public.codigos_grupos_estudo(user_id);
        `);
      } catch (indexErr) {
        console.warn('Aviso ao criar índices:', indexErr.message);
      }

      // Configurar RLS
      try {
        await supabase.query(`
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
        `);
      } catch (rlsErr) {
        console.warn('Aviso ao configurar RLS:', rlsErr.message);
      }
    } catch (err) {
      console.error('Erro ao criar tabela codigos_grupos_estudo:', err.message);
    }

    console.log('Processo de criação forçada concluído!');
    return true;
  } catch (error) {
    console.error('Erro durante criação forçada de tabelas:', error);
    throw error;
  }
}

// Função para verificar se um código existe
async function verificarCodigoExiste(codigo) {
  try {
    // Limpar o código
    const codigoLimpo = codigo.replace(/[\s-]/g, '').toUpperCase();

    // Verificar se a tabela existe
    try {
      const { count, error } = await supabase
        .from('codigos_grupos_estudo')
        .select('*', { count: 'exact', head: true });

      if (error) {
        // Tabela não existe
        return false;
      }
    } catch (err) {
      // Erro ao verificar tabela
      return false;
    }

    // Verificar se existe o código
    const { data, error } = await supabase
      .from('codigos_grupos_estudo')
      .select('codigo')
      .eq('codigo', codigoLimpo)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Código não encontrado
        return false;
      }
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Erro ao verificar código:', error);
    return false;
  }
}

// Porta para servidor
const PORT = process.env.PORT || 3001;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`API de correção de tabelas rodando na porta ${PORT}`);
});

// Exportar app para possível uso com serverless
module.exports = app;