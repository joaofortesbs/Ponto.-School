import { Client } from 'pg';

class NeonDBManager {
  constructor() {
    this.connectionConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
  }

  // Criar cliente de conexão
  createClient() {
    return new Client(this.connectionConfig);
  }

  // Executar query com gerenciamento de conexão
  async executeQuery(query, params = []) {
    const client = this.createClient();

    try {
      await client.connect();
      const result = await client.query(query, params);
      return {
        success: true,
        data: result.rows,
        rowCount: result.rowCount
      };
    } catch (error) {
      console.error('❌ Erro ao executar query:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      await client.end();
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

  // Criar tabela de perfis
  async createPerfilsTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS perfis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome_completo VARCHAR(255) NOT NULL,
        nome_usuario VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        tipo_conta VARCHAR(50) NOT NULL CHECK (tipo_conta IN ('Professor', 'Aluno', 'Coordenador')),
        pais VARCHAR(100) NOT NULL DEFAULT 'Brasil',
        estado VARCHAR(100) NOT NULL,
        instituicao_ensino VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const result = await this.executeQuery(createTableQuery);

    if (result.success) {
      console.log('✅ Tabela "perfis" criada com sucesso');

      // Criar índices para melhor performance
      await this.createPerfilsIndexes();

      // Criar trigger para atualizar updated_at
      await this.createUpdateTrigger();

      return true;
    } else {
      console.error('❌ Erro ao criar tabela "perfis":', result.error);
      return false;
    }
  }

  // Criar índices para a tabela perfis
  async createPerfilsIndexes() {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_perfis_email ON perfis(email);',
      'CREATE INDEX IF NOT EXISTS idx_perfis_nome_usuario ON perfis(nome_usuario);',
      'CREATE INDEX IF NOT EXISTS idx_perfis_tipo_conta ON perfis(tipo_conta);',
      'CREATE INDEX IF NOT EXISTS idx_perfis_created_at ON perfis(created_at);'
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

      DROP TRIGGER IF EXISTS update_perfis_updated_at ON perfis;
      CREATE TRIGGER update_perfis_updated_at
        BEFORE UPDATE ON perfis
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

    // Verificar se a tabela perfis existe
    const perfilsExists = await this.tableExists('perfis');

    if (!perfilsExists) {
      console.log('📝 Tabela "perfis" não existe, criando...');
      await this.createPerfilsTable();
    } else {
      console.log('✅ Tabela "perfis" já existe');
    }

    console.log('🎉 Banco de dados inicializado com sucesso!');
    return true;
  }

  // Buscar perfil por email
  async findProfileByEmail(email) {
    const query = 'SELECT * FROM perfis WHERE email = $1';
    return await this.executeQuery(query, [email]);
  }

  // Buscar perfil por nome de usuário
  async findProfileByUsername(username) {
    const query = 'SELECT * FROM perfis WHERE nome_usuario = $1';
    return await this.executeQuery(query, [username]);
  }

  // Buscar perfil por ID
  async findProfileById(id) {
    const query = 'SELECT * FROM perfis WHERE id = $1';
    return await this.executeQuery(query, [id]);
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

    const query = `
      INSERT INTO perfis (
        nome_completo, nome_usuario, email, senha_hash,
        tipo_conta, pais, estado, instituicao_ensino
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, nome_completo, nome_usuario, email, tipo_conta, pais, estado, instituicao_ensino, created_at
    `;

    const params = [
      nome_completo,
      nome_usuario,
      email,
      senha_hash,
      tipo_conta,
      pais,
      estado,
      instituicao_ensino
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
      UPDATE perfis 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, nome_completo, nome_usuario, email, tipo_conta, pais, estado, instituicao_ensino, updated_at
    `;

    return await this.executeQuery(query, values);
  }

  // Deletar perfil
  async deleteProfile(id) {
    const query = 'DELETE FROM perfis WHERE id = $1 RETURNING id';
    return await this.executeQuery(query, [id]);
  }

  // Listar perfis com filtros opcionais
  async listProfiles(filters = {}, limit = 50, offset = 0) {
    let query = 'SELECT id, nome_completo, nome_usuario, email, tipo_conta, pais, estado, instituicao_ensino, created_at FROM perfis';
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
    let query = 'SELECT COUNT(*) as total FROM perfis';
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
}

// Instância singleton do gerenciador
const neonDB = new NeonDBManager();

export { neonDB };
export default { neonDB };