
const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL não configurada!');
  process.exit(1);
}

async function migrateData() {
  const client = new Client({ connectionString: databaseUrl });
  
  try {
    await client.connect();
    console.log('Conectado ao banco Neon PostgreSQL');
    
    // Buscar arquivo de backup mais recente
    const backupFiles = fs.readdirSync('.').filter(f => f.startsWith('supabase-backup-'));
    if (backupFiles.length === 0) {
      console.error('Nenhum arquivo de backup encontrado! Execute o script de backup primeiro.');
      return;
    }
    
    const latestBackup = backupFiles.sort().reverse()[0];
    console.log(`Usando backup: ${latestBackup}`);
    
    const backup = JSON.parse(fs.readFileSync(latestBackup, 'utf8'));
    
    // Migrar profiles para users e profiles
    if (backup.tables.profiles) {
      console.log('Migrando perfis...');
      
      for (const profile of backup.tables.profiles) {
        // Criar usuário
        await client.query(`
          INSERT INTO users (id, email, created_at, updated_at, email_confirmed)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING
        `, [profile.id, profile.email, profile.created_at, profile.updated_at, true]);
        
        // Criar perfil
        await client.query(`
          INSERT INTO profiles (id, avatar_url, bio, cover_url, created_at, display_name, email, full_name, role, updated_at, user_id, username)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            avatar_url = EXCLUDED.avatar_url,
            bio = EXCLUDED.bio,
            cover_url = EXCLUDED.cover_url,
            display_name = EXCLUDED.display_name,
            full_name = EXCLUDED.full_name,
            role = EXCLUDED.role,
            updated_at = EXCLUDED.updated_at,
            user_id = EXCLUDED.user_id,
            username = EXCLUDED.username
        `, [
          profile.id,
          profile.avatar_url,
          profile.bio,
          profile.cover_url,
          profile.created_at,
          profile.display_name,
          profile.email,
          profile.full_name,
          profile.role || 'user',
          profile.updated_at,
          profile.user_id,
          profile.username
        ]);
      }
      
      console.log(`✅ Migrados ${backup.tables.profiles.length} perfis`);
    }
    
    // Migrar flow_sessions
    if (backup.tables.flow_sessions) {
      console.log('Migrando sessões de flow...');
      
      for (const session of backup.tables.flow_sessions) {
        await client.query(`
          INSERT INTO flow_sessions (user_id, session_title, session_goal, start_time, end_time, duration_seconds, duration_formatted, subjects, progress, status, notes, xp_earned, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT DO NOTHING
        `, [
          session.user_id,
          session.session_title,
          session.session_goal,
          session.start_time,
          session.end_time,
          session.duration_seconds,
          session.duration_formatted,
          session.subjects,
          session.progress,
          session.status,
          session.notes,
          session.xp_earned,
          session.created_at,
          session.updated_at
        ]);
      }
      
      console.log(`✅ Migradas ${backup.tables.flow_sessions.length} sessões de flow`);
    }
    
    // Migrar user_streak
    if (backup.tables.user_streak) {
      console.log('Migrando sequências de estudo...');
      
      for (const streak of backup.tables.user_streak) {
        await client.query(`
          INSERT INTO user_streak (id, user_id, dias_consecutivos, recorde_dias, dias_para_proximo_nivel, meta_diaria, proxima_recompensa, ultimo_check_in, eventos, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (user_id) DO UPDATE SET
            dias_consecutivos = EXCLUDED.dias_consecutivos,
            recorde_dias = EXCLUDED.recorde_dias,
            dias_para_proximo_nivel = EXCLUDED.dias_para_proximo_nivel,
            meta_diaria = EXCLUDED.meta_diaria,
            proxima_recompensa = EXCLUDED.proxima_recompensa,
            ultimo_check_in = EXCLUDED.ultimo_check_in,
            eventos = EXCLUDED.eventos,
            updated_at = EXCLUDED.updated_at
        `, [
          streak.id,
          streak.user_id,
          streak.dias_consecutivos,
          streak.recorde_dias,
          streak.dias_para_proximo_nivel,
          streak.meta_diaria,
          streak.proxima_recompensa,
          streak.ultimo_check_in,
          JSON.stringify(streak.eventos),
          streak.created_at,
          streak.updated_at
        ]);
      }
      
      console.log(`✅ Migradas ${backup.tables.user_streak.length} sequências de estudo`);
    }
    
    // Migrar tarefas
    if (backup.tables.tarefas) {
      console.log('Migrando tarefas...');
      
      for (const tarefa of backup.tables.tarefas) {
        await client.query(`
          INSERT INTO tarefas (id, user_id, titulo, descricao, status, data_criacao, data_atualizacao)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `, [
          tarefa.id,
          tarefa.user_id,
          tarefa.titulo,
          tarefa.descricao,
          tarefa.status,
          tarefa.data_criacao,
          tarefa.data_atualizacao
        ]);
      }
      
      console.log(`✅ Migradas ${backup.tables.tarefas.length} tarefas`);
    }
    
    // Migrar grupos de estudo
    if (backup.tables.grupos_estudo) {
      console.log('Migrando grupos de estudo...');
      
      for (const grupo of backup.tables.grupos_estudo) {
        await client.query(`
          INSERT INTO grupos_estudo (id, criador_id, nome, descricao, disciplina_area, tipo_grupo, topico_especifico, tags, codigo_unico, is_private, is_public, is_visible_to_all, is_visible_to_partners, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO NOTHING
        `, [
          grupo.id,
          grupo.criador_id,
          grupo.nome,
          grupo.descricao,
          grupo.disciplina_area,
          grupo.tipo_grupo,
          grupo.topico_especifico,
          grupo.tags,
          grupo.codigo_unico,
          grupo.is_private,
          grupo.is_public,
          grupo.is_visible_to_all,
          grupo.is_visible_to_partners,
          grupo.created_at
        ]);
      }
      
      console.log(`✅ Migrados ${backup.tables.grupos_estudo.length} grupos de estudo`);
    }
    
    // Migrar outras tabelas conforme necessário...
    console.log('\n✅ Migração de dados concluída com sucesso!');
    
  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    await client.end();
  }
}

migrateData();
