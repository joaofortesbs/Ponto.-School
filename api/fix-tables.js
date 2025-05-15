
// API endpoint para criar e verificar tabelas
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

// Endpoint para criar ou verificar tabelas
app.post('/', async (req, res) => {
  try {
    const { action, codigo } = req.body;
    
    switch (action) {
      case 'create_all_tables':
        await criarTodasTabelas();
        return res.json({ success: true, message: 'Todas as tabelas foram criadas com sucesso!' });
        
      case 'create_grupos_estudo':
        await criarTabelaGruposEstudo();
        return res.json({ success: true, message: 'Tabela grupos_estudo criada com sucesso!' });
        
      case 'create_codigos_grupos_estudo':
        await criarTabelaCodigosGruposEstudo();
        return res.json({ success: true, message: 'Tabela codigos_grupos_estudo criada com sucesso!' });
        
      case 'verificar_codigo':
        if (!codigo) {
          return res.status(400).json({ success: false, message: 'Código não fornecido!' });
        }
        const existe = await verificarCodigoExiste(codigo);
        return res.json({ success: true, existe });
        
      default:
        return res.status(400).json({ success: false, message: 'Ação não reconhecida!' });
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

// Função para criar todas as tabelas
async function criarTodasTabelas() {
  try {
    // Verificar/criar extensão UUID
    try {
      await supabase.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    } catch (err) {
      console.warn('Aviso ao criar extensão UUID:', err);
      // Continuar mesmo com erro na extensão
    }
    
    // Criar tabelas
    await criarTabelaGruposEstudo();
    await criarTabelaCodigosGruposEstudo();
    
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
      const { count } = await supabase
        .from('grupos_estudo')
        .select('*', { count: 'exact', head: true });
        
      console.log('Tabela grupos_estudo já existe');
      return true;
    } catch (checkErr) {
      // Se não existir, criar tabela
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
    }
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
      const { count } = await supabase
        .from('codigos_grupos_estudo')
        .select('*', { count: 'exact', head: true });
        
      console.log('Tabela codigos_grupos_estudo já existe');
      return true;
    } catch (checkErr) {
      // Se não existir, criar tabela
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
    }
  } catch (error) {
    console.error('Erro ao criar tabela codigos_grupos_estudo:', error);
    throw error;
  }
}

// Função para verificar se um código existe
async function verificarCodigoExiste(codigo) {
  try {
    // Limpar o código
    const codigoLimpo = codigo.replace(/[\s-]/g, '').toUpperCase();
    
    // Verificar se existe na tabela
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
