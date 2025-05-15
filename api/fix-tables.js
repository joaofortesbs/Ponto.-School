// Script para criar e corrigir tabelas relacionadas aos grupos de estudo
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
app.use(express.json());

// Inicializar cliente Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Endpoint para criar/corrigir tabelas
app.post('/', async (req, res) => {
  const { action } = req.body;

  try {
    if (action === 'create_grupos_estudo') {
      // Criar tabela grupos_estudo
      const { error: createError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.grupos_estudo (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            nome TEXT NOT NULL,
            descricao TEXT,
            materia TEXT,
            criado_por UUID REFERENCES auth.users(id),
            data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
            imagem_url TEXT,
            status TEXT DEFAULT 'ativo'
          );
        `
      });

      if (createError) {
        console.error('Erro ao criar tabela grupos_estudo:', createError);
        return res.status(500).json({ error: createError.message });
      }

      // Criar tabela grupos_estudo_membros
      const { error: membrosError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.grupos_estudo_membros (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            grupo_id UUID REFERENCES public.grupos_estudo(id) ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users(id),
            tipo_membro TEXT DEFAULT 'membro',
            data_entrada TIMESTAMP WITH TIME ZONE DEFAULT now(),
            UNIQUE(grupo_id, user_id)
          );
        `
      });

      if (membrosError) {
        console.error('Erro ao criar tabela grupos_estudo_membros:', membrosError);
        return res.status(500).json({ error: membrosError.message });
      }

      return res.status(200).json({ success: true, message: 'Tabela grupos_estudo criada com sucesso' });
    } 
    else if (action === 'create_codigos_grupos_estudo') {
      // Criar tabela codigos_grupos_estudo
      const { error } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.codigos_grupos_estudo (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            grupo_id UUID REFERENCES public.grupos_estudo(id) ON DELETE CASCADE,
            codigo TEXT UNIQUE NOT NULL,
            criado_por UUID REFERENCES auth.users(id),
            data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
            data_expiracao TIMESTAMP WITH TIME ZONE,
            usos_maximos INTEGER DEFAULT NULL,
            usos_atuais INTEGER DEFAULT 0
          );
        `
      });

      if (error) {
        console.error('Erro ao criar tabela codigos_grupos_estudo:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ success: true, message: 'Tabela codigos_grupos_estudo criada com sucesso' });
    }
    else {
      return res.status(400).json({ error: 'Ação inválida' });
    }
  } catch (error) {
    console.error('Erro ao executar ação:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Inicia o servidor se executado diretamente
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor de correção de tabelas rodando na porta ${PORT}`);
  });
}

// Exporta o app para uso em outros arquivos
module.exports = app;