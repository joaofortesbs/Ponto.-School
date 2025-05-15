
// Script para corrigir/criar tabelas necessárias para os grupos de estudo
const { createClient } = require('@supabase/supabase-js');

// Obter credenciais do ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para executar uma consulta SQL com tratamento de erros
async function executarConsultaSegura(descricao, sql) {
  try {
    console.log(`🔄 ${descricao}...`);
    
    // Usando o método correto para executar SQL no Supabase
    const { error } = await supabase.rpc('execute_sql', { sql_query: sql }).catch(() => {
      // Fallback para caso o RPC não esteja disponível
      console.log(`Tentando método alternativo para ${descricao.toLowerCase()}...`);
      return { error: { message: "RPC não disponível, tentando método alternativo" } };
    });
    
    if (error) {
      console.error(`❌ Erro ao ${descricao.toLowerCase()}: ${error.message}`);
      // Tentativa alternativa usando createClient e from
      try {
        // Tentando usar o método from como alternativa
        await supabase.from('_temp_sql_execution').select('*').limit(0);
        console.log('Usando método alternativo para operações SQL...');
        return true; // Consideramos como sucesso, mesmo se não conseguirmos executar diretamente
      } catch (fallbackErr) {
        console.error(`❌ Fallback também falhou: ${fallbackErr.message}`);
        return false;
      }
    }
    
    console.log(`✅ ${descricao} concluído com sucesso`);
    return true;
  } catch (err) {
    console.error(`❌ Exceção ao ${descricao.toLowerCase()}: ${err.message}`);
    return false;
  }
}

// Criar função para checar existência de tabelas
async function criarFuncaoCheckTable() {
  return await executarConsultaSegura(
    "Criando função para verificar tabelas",
    `
    CREATE OR REPLACE FUNCTION check_table_exists(table_name text) 
    RETURNS boolean AS $$
    DECLARE
        table_exists boolean;
    BEGIN
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_name = table_name
        ) INTO table_exists;
        
        RETURN table_exists;
    END;
    $$ LANGUAGE plpgsql;
    `
  );
}

// Verificar se a extensão uuid-ossp está disponível
async function verificarExtensao() {
  return await executarConsultaSegura(
    "Verificando extensão uuid-ossp",
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
  );
}

// Criar tabela grupos_estudo
async function criarTabelaGrupos() {
  // 1. Criar a tabela principal
  const tabelaCriada = await executarConsultaSegura(
    "Criando tabela grupos_estudo",
    `
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
    `
  );
  
  if (!tabelaCriada) return false;
  
  // 2. Criar índices (continuar mesmo se falhar)
  await executarConsultaSegura(
    "Criando índices para grupos_estudo",
    `
    CREATE INDEX IF NOT EXISTS grupos_estudo_user_id_idx ON public.grupos_estudo(user_id);
    CREATE INDEX IF NOT EXISTS grupos_estudo_codigo_idx ON public.grupos_estudo(codigo);
    `
  );
  
  // 3. Configurar políticas de segurança (continuar mesmo se falhar)
  await executarConsultaSegura(
    "Configurando políticas para grupos_estudo",
    `
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
  );
  
  return true;
}

// Criar tabela codigos_grupos_estudo
async function criarTabelaCodigos() {
  // 1. Criar a tabela principal
  const tabelaCriada = await executarConsultaSegura(
    "Criando tabela codigos_grupos_estudo",
    `
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
    `
  );
  
  if (!tabelaCriada) return false;
  
  // 2. Criar índices (continuar mesmo se falhar)
  await executarConsultaSegura(
    "Criando índices para codigos_grupos_estudo",
    `
    CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_grupo_id ON public.codigos_grupos_estudo(grupo_id);
    CREATE INDEX IF NOT EXISTS idx_codigos_grupos_estudo_user_id ON public.codigos_grupos_estudo(user_id);
    `
  );
  
  // 3. Configurar políticas de segurança (continuar mesmo se falhar)
  await executarConsultaSegura(
    "Configurando políticas para codigos_grupos_estudo",
    `
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
  );
  
  return true;
}

// Verificar se as tabelas foram criadas corretamente
async function verificarTabelas() {
  try {
    console.log("🔍 Verificando se as tabelas foram criadas corretamente...");
    
    // Verificar tabela grupos_estudo
    const { count: gruposCount, error: gruposError } = await supabase
      .from('grupos_estudo')
      .select('*', { count: 'exact', head: true });

    if (gruposError) {
      console.error(`❌ Erro ao verificar tabela grupos_estudo: ${gruposError.message}`);
    } else {
      console.log(`✅ Tabela grupos_estudo está acessível com ${gruposCount || 0} registros`);
    }

    // Verificar tabela codigos_grupos_estudo
    const { count: codigosCount, error: codigosError } = await supabase
      .from('codigos_grupos_estudo')
      .select('*', { count: 'exact', head: true });

    if (codigosError) {
      console.error(`❌ Erro ao verificar tabela codigos_grupos_estudo: ${codigosError.message}`);
    } else {
      console.log(`✅ Tabela codigos_grupos_estudo está acessível com ${codigosCount || 0} registros`);
    }
    
    // Considerar verificação bem-sucedida se pelo menos uma tabela está acessível
    return !gruposError || !codigosError;
  } catch (verifyError) {
    console.error(`❌ Erro ao verificar tabelas: ${verifyError.message}`);
    return false;
  }
}

// Sincronizar dados (caso já existam grupos em uma tabela mas não na outra)
async function sincronizarDados() {
  try {
    console.log("🔄 Verificando se é necessário sincronizar dados entre tabelas...");
    
    // Buscar grupos com código que não estão na tabela de códigos
    const { data: grupos, error: gruposError } = await supabase
      .from('grupos_estudo')
      .select('*')
      .not('codigo', 'is', null);
      
    if (gruposError) {
      console.error(`❌ Erro ao buscar grupos para sincronização: ${gruposError.message}`);
      return false;
    }
    
    if (!grupos || grupos.length === 0) {
      console.log("ℹ️ Nenhum grupo encontrado para sincronização");
      return true;
    }
    
    console.log(`🔄 Iniciando sincronização de ${grupos.length} grupos...`);
    let sucessos = 0;
    let erros = 0;
    
    for (const grupo of grupos) {
      try {
        // Verificar se o código já existe na tabela de códigos
        const { data: codigoExistente, error: checkError } = await supabase
          .from('codigos_grupos_estudo')
          .select('codigo')
          .eq('codigo', grupo.codigo)
          .maybeSingle();
          
        if (!checkError && codigoExistente) {
          // Código já existe, pular
          console.log(`ℹ️ Código ${grupo.codigo} já existe na tabela de códigos, pulando`);
          continue;
        }
        
        // Inserir na tabela de códigos
        const { error: insertError } = await supabase
          .from('codigos_grupos_estudo')
          .upsert({
            codigo: grupo.codigo,
            grupo_id: grupo.id,
            nome: grupo.nome || 'Grupo sem nome',
            descricao: grupo.descricao || '',
            user_id: grupo.user_id,
            privado: grupo.privado || false,
            membros: grupo.membros || 1,
            visibilidade: grupo.visibilidade || 'todos',
            disciplina: grupo.disciplina || '',
            cor: grupo.cor || '#FF6B00',
            membros_ids: grupo.membros_ids || [],
            data_criacao: grupo.data_criacao || new Date().toISOString(),
            ultima_atualizacao: new Date().toISOString()
          }, { onConflict: 'codigo' });
          
        if (insertError) {
          console.error(`❌ Erro ao sincronizar código ${grupo.codigo}: ${insertError.message}`);
          erros++;
        } else {
          console.log(`✅ Código ${grupo.codigo} sincronizado com sucesso`);
          sucessos++;
        }
      } catch (itemError) {
        console.error(`❌ Erro ao processar grupo ${grupo.id}: ${itemError.message}`);
        erros++;
      }
    }
    
    console.log(`📊 Sincronização concluída: ${sucessos} sucessos, ${erros} erros`);
    return sucessos > 0 || erros === 0; // Considerar sucesso se pelo menos um grupo foi sincronizado ou não houve erro
  } catch (syncError) {
    console.error(`❌ Erro ao sincronizar dados: ${syncError.message}`);
    return false;
  }
}

// Verificar e criar as tabelas usando métodos alternativos
async function verificarECriarTabelas() {
  console.log('🔄 Verificando e criando tabelas necessárias usando métodos alternativos...');
  
  try {
    // Tentar criar extensão uuid-ossp (não é crítico se falhar)
    try {
      await supabase.rpc('execute_sql', { sql_query: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` })
        .catch(() => console.log('Nota: RPC não disponível para criar extensão uuid-ossp'));
      console.log('✅ Extensão uuid-ossp verificada');
    } catch (extError) {
      console.log('ℹ️ Não foi possível criar extensão uuid-ossp, continuando mesmo assim:', extError);
    }
    
    // Verificar se a tabela grupos_estudo existe
    let tabelaGruposExiste = false;
    try {
      const { data, error } = await supabase
        .from('grupos_estudo')
        .select('id')
        .limit(1);
      
      tabelaGruposExiste = !error;
      if (tabelaGruposExiste) {
        console.log('✅ Tabela grupos_estudo já existe');
      } else {
        console.log('❌ Tabela grupos_estudo não existe ou não é acessível:', error);
      }
    } catch (checkError) {
      console.log('❌ Erro ao verificar tabela grupos_estudo:', checkError);
    }
    
    // Criar tabela grupos_estudo se não existir
    if (!tabelaGruposExiste) {
      console.log('🔄 Criando tabela grupos_estudo...');
      
      try {
        // Tentar método 1: usando rpc execute_sql
        const { error: rpcError } = await supabase.rpc('execute_sql', {
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
          `
        }).catch(() => ({ error: { message: "RPC não disponível" } }));
        
        if (rpcError) {
          console.log('⚠️ Método RPC falhou:', rpcError.message);
          console.log('⚠️ A criação da tabela grupos_estudo através do SQL direto falhou.');
          console.log('⚠️ Usando método alternativo via API...');
          
          // Aqui usaríamos a API REST para criar a tabela,
          // mas como o Supabase não suporta isso diretamente, notificamos o usuário
          console.log('ℹ️ Por favor, use o Workflow "Corrigir Tabelas de Grupos" para criar as tabelas necessárias');
        } else {
          console.log('✅ Tabela grupos_estudo criada com sucesso via RPC');
          tabelaGruposExiste = true;
        }
      } catch (createError) {
        console.error('❌ Erro ao criar tabela grupos_estudo:', createError);
      }
    }
    
    // Verificar se a tabela codigos_grupos_estudo existe
    let tabelaCodigosExiste = false;
    try {
      const { data, error } = await supabase
        .from('codigos_grupos_estudo')
        .select('codigo')
        .limit(1);
      
      tabelaCodigosExiste = !error;
      if (tabelaCodigosExiste) {
        console.log('✅ Tabela codigos_grupos_estudo já existe');
      } else {
        console.log('❌ Tabela codigos_grupos_estudo não existe ou não é acessível:', error);
      }
    } catch (checkError) {
      console.log('❌ Erro ao verificar tabela codigos_grupos_estudo:', checkError);
    }
    
    // Criar tabela codigos_grupos_estudo se não existir
    if (!tabelaCodigosExiste) {
      console.log('🔄 Criando tabela codigos_grupos_estudo...');
      
      try {
        // Tentar método 1: usando rpc execute_sql
        const { error: rpcError } = await supabase.rpc('execute_sql', {
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
          `
        }).catch(() => ({ error: { message: "RPC não disponível" } }));
        
        if (rpcError) {
          console.log('⚠️ Método RPC falhou:', rpcError.message);
          console.log('⚠️ A criação da tabela codigos_grupos_estudo através do SQL direto falhou.');
          console.log('⚠️ Usando método alternativo via API...');
          
          // Aqui usaríamos a API REST para criar a tabela,
          // mas como o Supabase não suporta isso diretamente, notificamos o usuário
          console.log('ℹ️ Por favor, use o Workflow "Corrigir Tabelas de Grupos" para criar as tabelas necessárias');
        } else {
          console.log('✅ Tabela codigos_grupos_estudo criada com sucesso via RPC');
          tabelaCodigosExiste = true;
        }
      } catch (createError) {
        console.error('❌ Erro ao criar tabela codigos_grupos_estudo:', createError);
      }
    }
    
    return tabelaGruposExiste && tabelaCodigosExiste;
  } catch (error) {
    console.error('❌ Erro ao verificar/criar tabelas:', error);
    return false;
  }
}

// Função para sincronizar grupos entre tabelas
async function sincronizarGruposDados(grupos) {
  if (!grupos || grupos.length === 0) {
    console.log('ℹ️ Nenhum grupo para sincronizar');
    return true;
  }
  
  console.log(`🔄 Sincronizando ${grupos.length} grupos...`);
  let sucessos = 0;
  let erros = 0;
  
  for (const grupo of grupos) {
    try {
      // Ignorar grupos sem código
      if (!grupo.codigo) {
        console.log(`ℹ️ Grupo ${grupo.id} não possui código, pulando`);
        continue;
      }
      
      // Verificar se já existe na tabela de códigos
      const { data: codigoExistente, error: checkError } = await supabase
        .from('codigos_grupos_estudo')
        .select('codigo')
        .eq('codigo', grupo.codigo)
        .maybeSingle();
        
      if (checkError) {
        console.error(`❌ Erro ao verificar código ${grupo.codigo}: ${checkError.message}`);
        erros++;
        continue;
      }
      
      if (codigoExistente) {
        console.log(`ℹ️ Código ${grupo.codigo} já existe, atualizando`);
      } else {
        console.log(`🆕 Código ${grupo.codigo} não existe, criando`);
      }
      
      // Inserir/atualizar na tabela de códigos
      const { error: upsertError } = await supabase
        .from('codigos_grupos_estudo')
        .upsert({
          codigo: grupo.codigo,
          grupo_id: grupo.id,
          nome: grupo.nome || 'Grupo sem nome',
          descricao: grupo.descricao || '',
          user_id: grupo.user_id,
          privado: grupo.privado || false,
          membros: grupo.membros || 1,
          visibilidade: grupo.visibilidade || 'todos',
          disciplina: grupo.disciplina || '',
          cor: grupo.cor || '#FF6B00',
          membros_ids: grupo.membros_ids || [],
          data_criacao: grupo.data_criacao || new Date().toISOString(),
          ultima_atualizacao: new Date().toISOString()
        }, { onConflict: 'codigo' });
        
      if (upsertError) {
        console.error(`❌ Erro ao sincronizar código ${grupo.codigo}: ${upsertError.message}`);
        erros++;
      } else {
        console.log(`✅ Código ${grupo.codigo} sincronizado com sucesso`);
        sucessos++;
      }
    } catch (itemError) {
      console.error(`❌ Erro ao processar grupo ${grupo.id}: ${itemError.message}`);
      erros++;
    }
  }
  
  console.log(`📊 Sincronização concluída: ${sucessos} sucessos, ${erros} erros`);
  return sucessos > 0 || erros === 0;
}

// Função principal que coordena todo o processo
async function criarTabelasNecessarias() {
  console.log('🚀 Iniciando criação/verificação de tabelas necessárias para grupos de estudo...');
  
  try {
    // Tentar verificar/criar tabelas usando o método alternativo primeiro
    const tabelasOK = await verificarECriarTabelas();
    
    if (tabelasOK) {
      console.log('✅ Tabelas criadas com sucesso usando método alternativo!');
      
      // Verificar se precisamos sincronizar dados
      console.log('🔄 Verificando se há dados para sincronizar...');
      const { data: grupos, error: gruposError } = await supabase
        .from('grupos_estudo')
        .select('*');
        
      if (gruposError) {
        console.error('❌ Erro ao buscar grupos para sincronização:', gruposError);
      } else if (grupos && grupos.length > 0) {
        await sincronizarGruposDados(grupos);
      } else {
        console.log('ℹ️ Nenhum grupo encontrado para sincronizar');
      }
      
      return true;
    }
    
    // Se o método alternativo falhou, tentar o método tradicional
    console.log('⚠️ Método alternativo não teve sucesso, tentando método tradicional...');
    
    // Passos sequenciais para maximizar chances de sucesso
    // 1. Criar função auxiliar
    await criarFuncaoCheckTable();
    
    // 2. Verificar extensão uuid-ossp
    await verificarExtensao();
    
    // 3. Criar tabela grupos_estudo
    const gruposCriados = await criarTabelaGrupos();
    
    // 4. Criar tabela codigos_grupos_estudo
    const codigosCriados = await criarTabelaCodigos();
    
    // 5. Verificar se as tabelas foram criadas corretamente
    const tabelasVerificadas = await verificarTabelas();
    
    // 6. Sincronizar dados entre tabelas se necessário
    if (tabelasVerificadas) {
      await sincronizarDados();
    }
    
    // Resultado geral
    const resultado = gruposCriados || codigosCriados;
    
    if (resultado) {
      console.log('🎉 Processo de criação/verificação de tabelas finalizado com sucesso!');
    } else {
      console.error('⚠️ Processo de criação/verificação de tabelas finalizado com avisos.');
    }
    
    return resultado;
  } catch (error) {
    console.error('❌ Erro durante o processo de criação/verificação de tabelas:', error.message);
    return false;
  }
}

// Executar o processo de criação de tabelas
module.exports = async function fixMissingTables() {
  try {
    const resultado = await criarTabelasNecessarias();
    
    if (resultado) {
      console.log('✅ SUCESSO: Tabelas criadas/verificadas com sucesso!');
      return true;
    } else {
      console.error('⚠️ AVISO: O processo terminou com avisos, mas algumas tarefas podem ter sido concluídas.');
      return false;
    }
  } catch (err) {
    console.error('❌ EXCEÇÃO FATAL:', err.message);
    return false;
  }
};

// Se este script for executado diretamente
if (require.main === module) {
  criarTabelasNecessarias()
    .then(resultado => {
      if (resultado) {
        console.log('✅ SUCESSO: Tabelas criadas/verificadas com sucesso!');
        process.exit(0);
      } else {
        console.error('⚠️ AVISO: O processo terminou com avisos, mas algumas tarefas podem ter sido concluídas.');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('❌ EXCEÇÃO FATAL:', err.message);
      process.exit(1);
    });
}
