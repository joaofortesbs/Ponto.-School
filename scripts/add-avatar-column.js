
import { neonDB } from '../api/neon-db.js';

async function addAvatarColumn() {
  console.log('🔧 Adicionando coluna imagem_avatar à tabela usuarios...');

  const addColumnQuery = `
    ALTER TABLE usuarios 
    ADD COLUMN IF NOT EXISTS imagem_avatar TEXT;
  `;

  try {
    const result = await neonDB.executeQuery(addColumnQuery);
    
    if (result.success) {
      console.log('✅ Coluna imagem_avatar adicionada com sucesso!');
    } else {
      console.error('❌ Erro ao adicionar coluna:', result.error);
    }
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

addAvatarColumn();
