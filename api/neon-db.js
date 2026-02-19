import { Client, Pool } from 'pg';
import { getInitialPowersForNewUsers } from './config/powers.js';

class NeonDBManager {
  constructor() {
    const dbEnvVars = [
      'DATABASE_URL',
      'DEPLOYMENT_DB_URL',
      'PRODUCTION_DB_URL',
      'NEON_DATABASE_URL'
    ];

    let connectionString = null;
    let selectedSecret = null;

    for (const envVar of dbEnvVars) {
      const url = process.env[envVar];
      if (url && url.length > 10) {
        connectionString = url;
        selectedSecret = envVar;
        console.log(`🎯 [NeonDB] Encontrada variável válida: ${envVar}`);
        break; 
      }
    }

    if (!connectionString) {
      throw new Error('❌ [NeonDB] Nenhuma variável de ambiente de banco de dados encontrada. Configure DATABASE_URL.');
    }

    const isProduction = process.env.NODE_ENV === 'production' || 
                         process.env.REPLIT_DEPLOYMENT === '1' ||
                         process.env.REPL_DEPLOYMENT === '1';

    console.log('🔗 [NeonDB] ==========================================');
    console.log(`   - Ambiente: ${isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO'}`);
    console.log(`   - Secret Selecionado: ${selectedSecret}`);
    console.log('🔗 [NeonDB] ==========================================');
    
    const needsSsl = connectionString.includes('neon.tech') || connectionString.includes('supabase');
    
    this.connectionConfig = {
      connectionString: connectionString,
      ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
    
    // Criar pool de conexões
    this.pool = new Pool(this.connectionConfig);
    
    // Handler para erros do pool
    this.pool.on('error', (err) => {
      console.error('❌ [NeonDB Pool] Erro inesperado:', err.message);
    });
  }

  // Criar cliente de conexão (manter compatibilidade)
  createClient() {
    return new Client(this.connectionConfig);
  }

  // Executar query COM RETRY e EXPONENTIAL BACKOFF (para lidar com Neon auto-suspend)
  async executeQuery(query, params = [], retries = 3) {
    let attempt = 0;
    
    while (attempt < retries) {
      try {
        // Usar pool ao invés de criar novo client
        const result = await this.pool.query(query, params);
        
        // Se bem-sucedido, retornar imediatamente
        return {
          success: true,
          data: result.rows,
          rowCount: result.rowCount
        };
      } catch (error) {
        attempt++;
        
        // Verificar se é erro reconectável (Neon suspend, ECONNRESET, SSL, terminated)
        const isReconnectable = 
          error.code === 'ECONNRESET' || 
          error.code === 'ENOTFOUND' ||
          error.code === 'ETIMEDOUT' ||
          error.message.includes('terminated') || 
          error.message.includes('SSL') ||
          error.message.includes('Connection') ||
          error.message.includes('timeout');
        
        if (isReconnectable && attempt < retries) {
          // Exponential backoff: 1s, 2s, 4s
          const waitTime = 1000 * Math.pow(2, attempt - 1);
          console.warn(`⚠️ [NeonDB Retry] Query falhou (tentativa ${attempt}/${retries}): ${error.message}`);
          console.log(`🔄 [NeonDB Retry] Aguardando ${waitTime}ms antes de retentar...`);
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          // Erro não reconectável ou max retries atingido
          if (attempt >= retries) {
            console.error(`❌ [NeonDB] Falha após ${retries} tentativas: ${error.message}`);
          } else {
            console.error('❌ [NeonDB] Erro não reconectável:', error.message);
          }
          
          return {
            success: false,
            error: error.message,
            code: error.code
          };
        }
      }
    }
    
    // Fallback (nunca deve chegar aqui)
    return {
      success: false,
      error: 'Falha após max retries'
    };
  }
  
  // Fechar pool (chamar ao desligar servidor)
  async closePool() {
    try {
      await this.pool.end();
      console.log('✅ [NeonDB] Pool de conexões encerrado');
    } catch (error) {
      console.error('❌ [NeonDB] Erro ao fechar pool:', error.message);
    }
  }

  // Verificar se uma tabela existe
  async tableExists(tableName) {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `;

    const result = await this.executeQuery(query, [tableName]);
    return result.success && result.data[0]?.exists;
  }

  // Criar tabela de usuários
  async createPerfilsTable() {
    // Obter valor inicial de Powers da configuração centralizada
    const initialPowers = getInitialPowersForNewUsers();
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS usuarios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome_completo VARCHAR(255) NOT NULL,
        nome_usuario VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        tipo_conta VARCHAR(50) NOT NULL CHECK (tipo_conta IN ('Professor', 'Aluno', 'Coordenador')),
        pais VARCHAR(100) NOT NULL DEFAULT 'Brasil',
        estado VARCHAR(100) NOT NULL,
        instituicao_ensino VARCHAR(255) NOT NULL,
        imagem_avatar TEXT,
        powers_carteira INTEGER NOT NULL DEFAULT ${initialPowers},
        stars_carteira INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const result = await this.executeQuery(createTableQuery);

    if (result.success) {
      console.log('✅ Tabela "usuarios" criada com sucesso');

      // Criar índices para melhor performance
      await this.createPerfilsIndexes();

      // Criar trigger para atualizar updated_at
      await this.createUpdateTrigger();

      return true;
    } else {
      console.error('❌ Erro ao criar tabela "usuarios":', result.error);
      return false;
    }
  }

  // Criar índices para a tabela usuarios
  async createPerfilsIndexes() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);',
      'CREATE INDEX IF NOT EXISTS idx_usuarios_nome_usuario ON usuarios(nome_usuario);',
      'CREATE INDEX IF NOT EXISTS idx_usuarios_tipo_conta ON usuarios(tipo_conta);',
      'CREATE INDEX IF NOT EXISTS idx_usuarios_created_at ON usuarios(created_at);'
    ];

    for (const indexQuery of indexes) {
      const result = await this.executeQuery(indexQuery);
      if (!result.success) {
        console.error('❌ Erro ao criar índice:', result.error);
      }
    }

    console.log('✅ Índices da tabela "perfis" criados com sucesso');
  }

  // Criar trigger para atualizar updated_at automaticamente
  async createUpdateTrigger() {
    const triggerQuery = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
      CREATE TRIGGER update_usuarios_updated_at
        BEFORE UPDATE ON usuarios
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    const result = await this.executeQuery(triggerQuery);
    if (result.success) {
      console.log('✅ Trigger de atualização automática criado com sucesso');
    } else {
      console.error('❌ Erro ao criar trigger:', result.error);
    }
  }

  // Testar conexão com o banco
  async testConnection() {
    try {
      const result = await this.executeQuery('SELECT NOW() as timestamp, version() as version');
      if (result.success) {
        console.log('🔗 Conexão com Neon estabelecida com sucesso');
        console.log('⏰ Timestamp do servidor:', result.data[0].timestamp);
        return true;
      } else {
        console.error('❌ Falha na conexão:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro na conexão com o banco:', error);
      return false;
    }
  }

  // Inicializar banco de dados (criar tabelas necessárias)
  async initializeDatabase() {
    console.log('🚀 Inicializando banco de dados...');

    // Testar conexão primeiro
    const connectionOk = await this.testConnection();
    if (!connectionOk) {
      throw new Error('Falha na conexão com o banco de dados');
    }

    // Verificar se a tabela usuarios existe
    const usuariosExists = await this.tableExists('usuarios');

    if (!usuariosExists) {
      console.log('📝 Tabela "usuarios" não existe, criando...');
      await this.createPerfilsTable();
    } else {
      console.log('✅ Tabela "usuarios" já existe');
    }

    console.log('🎉 Banco de dados inicializado com sucesso!');
    return true;
  }

  // Buscar perfil por email (inclui powers_carteira para evitar segunda chamada)
  async findProfileByEmail(email) {
    try {
      console.log('🔍 Buscando perfil por email:', email);
      const query = 'SELECT id, nome_completo, nome_usuario, email, senha_hash, tipo_conta, pais, estado, instituicao_ensino, imagem_avatar, powers_carteira, stars_carteira, created_at, updated_at FROM usuarios WHERE email = $1';
      const result = await this.executeQuery(query, [email]);

      console.log('📊 Resultado da busca:', result.data.length > 0 ? 'Encontrado' : 'Não encontrado');

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('❌ Erro ao buscar perfil por email:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Buscar perfil por nome de usuário
  async findProfileByUsername(username) {
    try {
      console.log('🔍 Buscando perfil por nome de usuário:', username);
      const query = 'SELECT * FROM usuarios WHERE nome_usuario = $1';
      const result = await this.executeQuery(query, [username]);

      console.log('📊 Resultado da busca por username:', result.data.length > 0 ? 'Encontrado' : 'Não encontrado');

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('❌ Erro ao buscar perfil por username:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Buscar perfil por ID
  async findProfileById(id) {
    try {
      console.log('🔍 Buscando perfil por ID:', id);
      const query = 'SELECT * FROM usuarios WHERE id = $1';
      const result = await this.executeQuery(query, [id]);

      console.log('📊 Resultado da busca:', result.data.length > 0 ? 'Encontrado' : 'Não encontrado');

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('❌ Erro ao buscar perfil por ID:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Criar novo perfil
  async createProfile(profileData) {
    const {
      nome_completo,
      nome_usuario,
      email,
      senha_hash,
      tipo_conta,
      pais = 'Brasil',
      estado,
      instituicao_ensino
    } = profileData;

    // Usar configuração de Powers (importada no topo do arquivo)
    const initialPowers = getInitialPowersForNewUsers();
    
    console.log(`[NEON-DB] Criando usuário com ${initialPowers} Powers iniciais`);

    const query = `
      INSERT INTO usuarios (
        nome_completo, nome_usuario, email, senha_hash,
        tipo_conta, pais, estado, instituicao_ensino, powers_carteira
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, nome_completo, nome_usuario, email, tipo_conta, pais, estado, instituicao_ensino, powers_carteira, created_at
    `;

    const params = [
      nome_completo,
      nome_usuario,
      email,
      senha_hash,
      tipo_conta,
      pais,
      estado,
      instituicao_ensino,
      initialPowers
    ];

    return await this.executeQuery(query, params);
  }

  // Atualizar perfil
  async updateProfile(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return { success: false, error: 'Nenhum campo para atualizar' };
    }

    values.push(id);
    const query = `
      UPDATE usuarios 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, nome_completo, nome_usuario, email, tipo_conta, pais, estado, instituicao_ensino, updated_at
    `;

    return await this.executeQuery(query, values);
  }

  // Deletar perfil
  async deleteProfile(id) {
    const query = 'DELETE FROM usuarios WHERE id = $1 RETURNING id';
    return await this.executeQuery(query, [id]);
  }

  // Listar perfis com filtros opcionais
  async listProfiles(filters = {}, limit = 50, offset = 0) {
    let query = 'SELECT id, nome_completo, nome_usuario, email, tipo_conta, pais, estado, instituicao_ensino, created_at FROM usuarios';
    const conditions = [];
    const values = [];
    let paramCount = 1;

    // Aplicar filtros
    if (filters.tipo_conta) {
      conditions.push(`tipo_conta = $${paramCount}`);
      values.push(filters.tipo_conta);
      paramCount++;
    }

    if (filters.estado) {
      conditions.push(`estado = $${paramCount}`);
      values.push(filters.estado);
      paramCount++;
    }

    if (filters.pais) {
      conditions.push(`pais = $${paramCount}`);
      values.push(filters.pais);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    values.push(limit, offset);

    return await this.executeQuery(query, values);
  }

  // Contar total de perfis
  async countProfiles(filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM usuarios';
    const conditions = [];
    const values = [];
    let paramCount = 1;

    // Aplicar filtros
    if (filters.tipo_conta) {
      conditions.push(`tipo_conta = $${paramCount}`);
      values.push(filters.tipo_conta);
      paramCount++;
    }

    if (filters.estado) {
      conditions.push(`estado = $${paramCount}`);
      values.push(filters.estado);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await this.executeQuery(query, values);
    return result.success ? parseInt(result.data[0].total) : 0;
  }

  // =================
  // MÉTODOS PARA ATIVIDADES
  // =================

  // Criar nova atividade
  async createActivity(activityData) {
    const {
      user_id,
      codigo_unico,
      tipo,
      titulo,
      descricao,
      conteudo
    } = activityData;

    const query = `
      INSERT INTO atividades (user_id, codigo_unico, tipo, titulo, descricao, conteudo)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, codigo_unico, tipo, titulo, descricao, conteudo, criado_em, atualizado_em
    `;

    const params = [user_id, codigo_unico, tipo, titulo, descricao, JSON.stringify(conteudo)];

    try {
      console.log('💾 Criando nova atividade:', { codigo_unico, tipo, titulo });
      const result = await this.executeQuery(query, params);
      
      if (result.success) {
        console.log('✅ Atividade criada com sucesso:', result.data[0]);
        return result;
      } else {
        console.error('❌ Erro ao criar atividade:', result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Erro ao criar atividade:', error);
      return { success: false, error: error.message };
    }
  }

  // Atualizar atividade existente
  async updateActivity(codigo_unico, updateData) {
    const { titulo, descricao, conteudo } = updateData;

    const query = `
      UPDATE atividades 
      SET titulo = $2, descricao = $3, conteudo = $4, atualizado_em = NOW()
      WHERE codigo_unico = $1
      RETURNING id, user_id, codigo_unico, tipo, titulo, descricao, conteudo, criado_em, atualizado_em
    `;

    const params = [codigo_unico, titulo, descricao, JSON.stringify(conteudo)];

    try {
      console.log('🔄 Atualizando atividade:', codigo_unico);
      const result = await this.executeQuery(query, params);
      
      if (result.success && result.data.length > 0) {
        console.log('✅ Atividade atualizada com sucesso');
        return result;
      } else {
        console.log('⚠️ Nenhuma atividade encontrada para atualizar');
        return { success: false, error: 'Atividade não encontrada' };
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar atividade:', error);
      return { success: false, error: error.message };
    }
  }

  // Buscar atividades do usuário
  async getUserActivities(user_id) {
    const query = `
      SELECT id, id_user, tipo, id_json, stars, created_at, updated_at
      FROM atividades 
      WHERE id_user = $1 
      ORDER BY updated_at DESC
      LIMIT 100
    `;

    try {
      console.log('🔍 Buscando atividades do usuário:', user_id);
      const result = await this.executeQuery(query, [user_id]);
      
      if (result.success) {
        console.log('✅ Encontradas', result.data.length, 'atividades do usuário');
        return result;
      } else {
        console.error('❌ Erro ao buscar atividades do usuário:', result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Erro ao buscar atividades do usuário:', error);
      return { success: false, error: error.message };
    }
  }

  // Buscar atividade por código único (adaptado para estrutura antiga)
  async getActivityByCode(codigo_unico) {
    const query = `
      SELECT 
        id as codigo_unico,
        id_user as user_id,
        tipo,
        id_json as conteudo,
        created_at as criado_em,
        updated_at as atualizado_em
      FROM atividades 
      WHERE id = $1
    `;

    try {
      console.log('🔍 Buscando atividade por código:', codigo_unico);
      const result = await this.executeQuery(query, [codigo_unico]);
      
      if (result.success) {
        if (result.data.length > 0) {
          // Parsear id_json se for string
          const atividade = result.data[0];
          if (typeof atividade.conteudo === 'string') {
            atividade.conteudo = JSON.parse(atividade.conteudo);
          }
          
          // Extrair título e descrição do conteúdo JSON
          atividade.titulo = atividade.conteudo?.title || atividade.conteudo?.titulo || 'Atividade';
          atividade.descricao = atividade.conteudo?.description || atividade.conteudo?.descricao || '';
          
          console.log('✅ Atividade encontrada:', atividade.titulo);
          return { success: true, data: [atividade] };
        } else {
          console.log('⚠️ Nenhuma atividade encontrada com esse código');
          return { success: false, error: 'Atividade não encontrada' };
        }
      } else {
        console.error('❌ Erro ao buscar atividade:', result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Erro ao buscar atividade por código:', error);
      return { success: false, error: error.message };
    }
  }

  // Deletar atividade
  async deleteActivity(codigo_unico, user_id) {
    const query = `
      DELETE FROM atividades 
      WHERE codigo_unico = $1 AND user_id = $2
      RETURNING id, titulo
    `;

    try {
      console.log('🗑️ Deletando atividade:', codigo_unico);
      const result = await this.executeQuery(query, [codigo_unico, user_id]);
      
      if (result.success && result.data.length > 0) {
        console.log('✅ Atividade deletada com sucesso');
        return result;
      } else {
        console.log('⚠️ Nenhuma atividade encontrada para deletar');
        return { success: false, error: 'Atividade não encontrada ou sem permissão' };
      }
    } catch (error) {
      console.error('❌ Erro ao deletar atividade:', error);
      return { success: false, error: error.message };
    }
  }
}

// Exportar instância única (singleton)
const neonDB = new NeonDBManager();
export default neonDB;
