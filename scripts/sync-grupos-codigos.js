
/**
 * Script para sincronizar códigos de grupos entre o banco de dados e armazenamentos locais
 * Usado para garantir que todos os grupos de estudo tenham códigos únicos registrados
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configurações de conexão com o Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://seu-projeto.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sua-chave-anonima';

// Caracteres permitidos para geração de códigos (excluindo caracteres ambíguos)
const CARACTERES_PERMITIDOS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// Cria um cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para gerar um código único
const gerarCodigoUnico = async () => {
  // Gerar código aleatório de 7 caracteres
  let codigo = '';
  for (let i = 0; i < 7; i++) {
    codigo += CARACTERES_PERMITIDOS.charAt(
      Math.floor(Math.random() * CARACTERES_PERMITIDOS.length)
    );
  }
  
  // Verificar se o código já existe no banco de dados
  const { data } = await supabase
    .from('codigos_grupos_estudo')
    .select('codigo')
    .eq('codigo', codigo);
  
  if (data && data.length > 0) {
    // Código já existe, gerar outro recursivamente
    return gerarCodigoUnico();
  }
  
  return codigo;
};

// Função principal de sincronização
const sincronizarCodigosGrupos = async () => {
  console.log('Iniciando sincronização de códigos de grupos...');
  
  try {
    // 1. Buscar todos os grupos de estudo
    const { data: grupos, error: gruposError } = await supabase
      .from('grupos_estudo')
      .select('*');
      
    if (gruposError) {
      throw new Error(`Erro ao buscar grupos: ${gruposError.message}`);
    }
    
    console.log(`Encontrados ${grupos?.length || 0} grupos de estudo.`);
    
    // 2. Verificar quais grupos não têm código e gerar para eles
    let gruposAtualizados = 0;
    let codigosInseridos = 0;
    
    for (const grupo of grupos || []) {
      if (!grupo.codigo) {
        // Gerar um novo código único para o grupo
        const novoCodigo = await gerarCodigoUnico();
        console.log(`Gerando código ${novoCodigo} para o grupo ${grupo.id} (${grupo.nome})`);
        
        // Atualizar o grupo no banco de dados
        const { error: updateError } = await supabase
          .from('grupos_estudo')
          .update({ codigo: novoCodigo })
          .eq('id', grupo.id);
          
        if (updateError) {
          console.error(`Erro ao atualizar código para o grupo ${grupo.id}: ${updateError.message}`);
          continue;
        }
        
        gruposAtualizados++;
      }
      
      // 3. Verificar se o grupo já existe na tabela de códigos
      const { data: codigoExistente, error: codigoError } = await supabase
        .from('codigos_grupos_estudo')
        .select('codigo')
        .eq('codigo', grupo.codigo)
        .maybeSingle();
        
      if (codigoError && codigoError.code !== 'PGRST116') {
        console.error(`Erro ao verificar código na tabela de códigos: ${codigoError.message}`);
        continue;
      }
      
      // 4. Se o código não existir na tabela de códigos, inserir
      if (!codigoExistente) {
        const { error: insertError } = await supabase
          .from('codigos_grupos_estudo')
          .insert({
            codigo: grupo.codigo,
            grupo_id: grupo.id,
            nome: grupo.nome,
            descricao: grupo.descricao,
            user_id: grupo.user_id,
            privado: grupo.privado || false,
            membros: grupo.membros || 1,
            visibilidade: grupo.visibilidade,
            disciplina: grupo.disciplina,
            cor: grupo.cor || '#FF6B00',
            membros_ids: grupo.membros_ids || []
          });
          
        if (insertError) {
          console.error(`Erro ao inserir código na tabela de códigos: ${insertError.message}`);
          continue;
        }
        
        codigosInseridos++;
      }
    }
    
    console.log(`Sincronização concluída: ${gruposAtualizados} grupos atualizados, ${codigosInseridos} códigos inseridos.`);
    return { success: true, gruposAtualizados, codigosInseridos };
  } catch (error) {
    console.error('Erro durante a sincronização:', error);
    return { success: false, error: error.message };
  }
};

// Executar o script se for chamado diretamente
if (require.main === module) {
  sincronizarCodigosGrupos()
    .then((resultado) => {
      console.log('Resultado da sincronização:', resultado);
      process.exit(resultado.success ? 0 : 1);
    })
    .catch((erro) => {
      console.error('Erro fatal na sincronização:', erro);
      process.exit(1);
    });
}

module.exports = {
  sincronizarCodigosGrupos,
  gerarCodigoUnico
};
