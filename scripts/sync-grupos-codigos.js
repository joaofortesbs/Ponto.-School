
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
