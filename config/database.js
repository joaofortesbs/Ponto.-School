// Configuração dos Bancos de Dados Neon Externos
// SEMPRE usar bancos Neon externos, nunca o banco nativo do Replit
// URLs HARDCODED para garantir funcionamento no deployment

// URLs DIRETAS E HARDCODED - Sempre disponíveis
const NEON_DATABASES = {
  // Banco ep-delicate-bush (usado no DEPLOYMENT/Publicado)
  deployment: {
    name: 'DEPLOYMENT Database',
    host: 'ep-delicate-bush-acsigqej',
    hardcodedUrl: 'postgresql://neondb_owner:npg_1Pbxc0ZjoGpS@ep-delicate-bush-acsigqej-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  },
  
  // Banco ep-spring-truth (usado no DEVELOPMENT/Replit)
  production: {
    name: 'PRODUCTION Database',
    host: 'ep-spring-truth-ach9qir9',
    hardcodedUrl: 'postgresql://neondb_owner:npg_1Pbxc0ZjoGpS@ep-spring-truth-ach9qir9-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  }
};

const DATABASE_CONFIG = {
  // Banco usado no DESENVOLVIMENTO (Replit) - ep-spring-truth
  development: {
    name: NEON_DATABASES.production.name,
    host: NEON_DATABASES.production.host,
    url: process.env.PRODUCTION_DB_URL || NEON_DATABASES.production.hardcodedUrl
  },
  
  // Banco usado no DEPLOYMENT (Publicado) - ep-delicate-bush
  production: {
    name: NEON_DATABASES.deployment.name,
    host: NEON_DATABASES.deployment.host,
    url: process.env.DEPLOYMENT_DB_URL || NEON_DATABASES.deployment.hardcodedUrl
  }
};

// Detectar ambiente com múltiplas verificações
const isDeployment = process.env.REPLIT_DEPLOYMENT === '1' || 
                     process.env.NODE_ENV === 'production' ||
                     process.env.REPL_DEPLOYMENT === '1' ||
                     process.env.REPLIT_ENV === 'production';

// Exportar configuração baseada no ambiente
export const getDatabaseUrl = () => {
  const config = isDeployment ? DATABASE_CONFIG.production : DATABASE_CONFIG.development;
  console.log(`📊 [Database Config] Ambiente: ${isDeployment ? 'DEPLOYMENT' : 'DEVELOPMENT'}`);
  console.log(`📊 [Database Config] Usando: ${config.name} (${config.host})`);
  console.log(`📊 [Database Config] URL disponível: ${config.url ? 'SIM' : 'NÃO'}`);
  return config.url;
};

// Exportar URLs diretas para uso em qualquer lugar
export const getDeploymentDatabaseUrl = () => {
  return process.env.DEPLOYMENT_DB_URL || NEON_DATABASES.deployment.hardcodedUrl;
};

export const getProductionDatabaseUrl = () => {
  return process.env.PRODUCTION_DB_URL || NEON_DATABASES.production.hardcodedUrl;
};

export default DATABASE_CONFIG;