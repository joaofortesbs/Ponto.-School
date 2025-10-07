// Configuração dos Bancos de Dados Neon Externos
// SEMPRE usar bancos Neon externos, nunca o banco nativo do Replit
// URLs HARDCODED para garantir funcionamento no deployment

// POOLED Connection Strings (para PRODUCTION - com PgBouncer -pooler)
const NEON_POOLED = {
  deployment: {
    name: 'DEPLOYMENT Database (Pooled)',
    host: 'ep-delicate-bush-acsigqej-pooler',
    url: 'postgresql://neondb_owner:npg_1Pbxc0ZjoGpS@ep-delicate-bush-acsigqej-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  },
  production: {
    name: 'PRODUCTION Database (Pooled)',
    host: 'ep-spring-truth-ach9qir9-pooler',
    url: 'postgresql://neondb_owner:npg_1Pbxc0ZjoGpS@ep-spring-truth-ach9qir9-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  }
};

// DIRECT Connection Strings (para DEVELOPMENT - conexão direta)
const NEON_DIRECT = {
  deployment: {
    name: 'DEPLOYMENT Database (Direct)',
    host: 'ep-delicate-bush-acsigqej',
    url: 'postgresql://neondb_owner:npg_1Pbxc0ZjoGpS@ep-delicate-bush-acsigqej.sa-east-1.aws.neon.tech/neondb?sslmode=require'
  },
  production: {
    name: 'PRODUCTION Database (Direct)',
    host: 'ep-spring-truth-ach9qir9',
    url: 'postgresql://neondb_owner:npg_1Pbxc0ZjoGpS@ep-spring-truth-ach9qir9.sa-east-1.aws.neon.tech/neondb?sslmode=require'
  }
};

// Detectar ambiente de PRODUÇÃO
const isProduction = process.env.NODE_ENV === 'production' || 
                     process.env.REPLIT_DEPLOYMENT === '1' ||
                     process.env.REPL_DEPLOYMENT === '1' ||
                     process.env.REPLIT_ENV === 'production';

const DATABASE_CONFIG = {
  // DEVELOPMENT: Usar conexão DIRECT
  development: {
    name: NEON_DIRECT.production.name,
    host: NEON_DIRECT.production.host,
    url: process.env.DATABASE_URL || NEON_DIRECT.production.url,
    type: 'DIRECT'
  },
  
  // PRODUCTION: Usar conexão POOLED
  production: {
    name: NEON_POOLED.production.name,
    host: NEON_POOLED.production.host,
    url: process.env.PRODUCTION_DB_URL || NEON_POOLED.production.url,
    type: 'POOLED (PgBouncer)'
  }
};

// Exportar configuração baseada no ambiente
export const getDatabaseUrl = () => {
  const config = isProduction ? DATABASE_CONFIG.production : DATABASE_CONFIG.development;
  console.log(`📊 [Database Config] Ambiente: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`📊 [Database Config] Usando: ${config.name}`);
  console.log(`📊 [Database Config] Host: ${config.host}`);
  console.log(`📊 [Database Config] Tipo: ${config.type}`);
  console.log(`📊 [Database Config] URL disponível: ${config.url ? 'SIM' : 'NÃO'}`);
  return config.url;
};

// Exportar URLs específicas
export const getPooledDatabaseUrl = () => {
  return process.env.PRODUCTION_DB_URL || NEON_POOLED.production.url;
};

export const getDirectDatabaseUrl = () => {
  return process.env.DATABASE_URL || NEON_DIRECT.production.url;
};

export default DATABASE_CONFIG;