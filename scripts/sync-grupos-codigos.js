
/**
 * Script para sincronizar todos os grupos de estudo com o banco de códigos
 * Este script deve ser executado após a criação da nova tabela de códigos
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Inicializar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://YOUR_SUPABASE_URL.supabase.co',
  process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY'
);

async function syncGruposCodigos() {
  console.log('Iniciando sincronização de códigos de grupos...');
  
  try {
    // Buscar todos os grupos de estudo
    const { data: grupos, error } = await supabase
      .from('grupos_estudo')
      .select('*');
      
    if (error) {
      throw new Error(`Erro ao buscar grupos: ${error.message}`);
    }
    
    console.log(`Encontrados ${grupos?.length || 0} grupos para sincronizar`);
    
    // Contador de sucessos
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    // Processar cada grupo
    for (const grupo of grupos || []) {
      try {
        // Verificar se o grupo já tem código
        if (!grupo.codigo) {
          console.log(`Grupo ID ${grupo.id} não possui código, será ignorado`);
          skippedCount++;
          continue;
        }
        
        // Inserir no banco de códigos
        const { error: insertError } = await supabase
          .from('codigos_grupos_estudo')
          .upsert({
            codigo: grupo.codigo,
            grupo_id: grupo.id,
            nome: grupo.nome || 'Grupo sem nome',
            descricao: grupo.descricao,
            user_id: grupo.user_id,
            privado: grupo.privado || false,
            membros: grupo.membros || 1,
            visibilidade: grupo.visibilidade,
            disciplina: grupo.disciplina,
            cor: grupo.cor || '#FF6B00',
            membros_ids: grupo.membros_ids || []
          }, { onConflict: 'codigo' });
          
        if (insertError) {
          console.error(`Erro ao inserir código ${grupo.codigo} para grupo ${grupo.id}: ${insertError.message}`);
          errorCount++;
        } else {
          console.log(`Código ${grupo.codigo} sincronizado com sucesso para grupo ${grupo.id}`);
          successCount++;
        }
      } catch (itemError) {
        console.error(`Erro ao processar grupo ${grupo.id}: ${itemError.message}`);
        errorCount++;
      }
    }
    
    console.log('--------- RESUMO DA SINCRONIZAÇÃO ---------');
    console.log(`Total de grupos: ${grupos?.length || 0}`);
    console.log(`Códigos sincronizados com sucesso: ${successCount}`);
    console.log(`Grupos sem código (ignorados): ${skippedCount}`);
    console.log(`Erros: ${errorCount}`);
    console.log('-------------------------------------------');
    
  } catch (error) {
    console.error('Erro durante sincronização:', error);
    process.exit(1);
  }
}

// Executar o script
syncGruposCodigos()
  .then(() => {
    console.log('Sincronização concluída!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Falha na sincronização:', err);
    process.exit(1);
  });
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const fs = require('fs');

// Função para gerar código aleatório de 7 caracteres (letras e números)
function gerarCodigoUnico() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removendo caracteres confusos como I, O, 0, 1
  let codigo = '';
  
  for (let i = 0; i < 7; i++) {
    const indiceAleatorio = crypto.randomInt(0, caracteres.length);
    codigo += caracteres.charAt(indiceAleatorio);
  }
  
  return codigo;
}

// Inicializar Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://jgefqmwfsotipfkgpuqd.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZWZxbXdmc290aXBma2dwdXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU1MzU2NTMsImV4cCI6MjAyMTExMTY1M30.XWP-Qp8yz5tnV_BNo-XNLs5vFnfJ0h1xud7wjNUvsAI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function sincronizarCodigosGrupos() {
  console.log('Iniciando sincronização de códigos de grupos...');
  
  try {
    // Verificar se a tabela codigos_grupos existe
    const { error: checkError } = await supabase
      .from('codigos_grupos')
      .select('id', { count: 'exact', head: true });
    
    if (checkError) {
      console.log('Criando tabela codigos_grupos...');
      
      // Tabela não existe, vamos criá-la
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS codigos_grupos (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          codigo VARCHAR(7) UNIQUE NOT NULL,
          grupo_id UUID NOT NULL,
          nome_grupo TEXT NOT NULL,
          descricao TEXT,
          criado_por UUID NOT NULL,
          data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          ativo BOOLEAN DEFAULT TRUE
        );
        
        CREATE INDEX IF NOT EXISTS idx_codigos_grupos_codigo ON codigos_grupos(codigo);
        CREATE INDEX IF NOT EXISTS idx_codigos_grupos_grupo_id ON codigos_grupos(grupo_id);
      `;
      
      // Executar a criação da tabela
      const { error: createError } = await supabase.rpc('execute_sql', { sql: createTableSQL });
      
      if (createError) {
        console.error('Erro ao criar tabela codigos_grupos:', createError);
        return;
      }
      
      console.log('Tabela codigos_grupos criada com sucesso!');
    }
    
    // Buscar grupos de estudo que não têm código
    const { data: grupos, error: gruposError } = await supabase
      .from('grupos_estudo')
      .select('id, nome, descricao, criador_id')
      .not('id', 'in', (sb) => 
        sb.from('codigos_grupos').select('grupo_id')
      );
    
    if (gruposError) {
      console.error('Erro ao buscar grupos sem código:', gruposError);
      return;
    }
    
    console.log(`Encontrados ${grupos?.length || 0} grupos sem código.`);
    
    // Gerar e salvar códigos para cada grupo
    if (grupos && grupos.length > 0) {
      for (const grupo of grupos) {
        // Gerar código único
        let codigoUnico = gerarCodigoUnico();
        let codigoExiste = true;
        
        // Verificar se o código já existe e gerar novo se necessário
        while (codigoExiste) {
          const { data, error } = await supabase
            .from('codigos_grupos')
            .select('codigo')
            .eq('codigo', codigoUnico)
            .maybeSingle();
          
          if (error) {
            console.error('Erro ao verificar código:', error);
            break;
          }
          
          if (!data) {
            codigoExiste = false;
          } else {
            codigoUnico = gerarCodigoUnico();
          }
        }
        
        // Inserir código na tabela
        const { error: insertError } = await supabase
          .from('codigos_grupos')
          .insert({
            codigo: codigoUnico,
            grupo_id: grupo.id,
            nome_grupo: grupo.nome,
            descricao: grupo.descricao || '',
            criado_por: grupo.criador_id,
            ativo: true
          });
        
        if (insertError) {
          console.error(`Erro ao inserir código para grupo ${grupo.id}:`, insertError);
        } else {
          console.log(`Código ${codigoUnico} gerado para grupo "${grupo.nome}" (${grupo.id})`);
        }
      }
      
      console.log('Sincronização de códigos concluída com sucesso!');
    } else {
      console.log('Nenhum grupo precisa de código. Tudo sincronizado!');
    }
  } catch (error) {
    console.error('Erro inesperado durante a sincronização:', error);
  }
}

// Executar a sincronização
sincronizarCodigosGrupos().catch(console.error);
