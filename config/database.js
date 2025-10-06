// Configuração dos Bancos de Dados Neon Externos
// SEMPRE usar bancos Neon externos, nunca o banco nativo do Replit

const DATABASE_CONFIG = {
  // Banco usado no DESENVOLVIMENTO (Replit)
  development: {
    name: 'PRODUCTION Database',
    host: 'ep-spring-truth-ach9qir9',
    url: process.env.PRODUCTION_DB_URL || 
         'postgresql://neondb_owner:npg_1Pbxc0ZjoGpS@ep-spring-truth-ach9qir9-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  },
  
  // Banco usado no DEPLOYMENT (Publicado)
  production: {
    name: 'DEPLOYMENT Database',
    host: 'ep-delicate-bush-acsigqej',
    url: process.env.DEPLOYMENT_DB_URL || 
         'postgresql://neondb_owner:npg_1Pbxc0ZjoGpS@ep-delicate-bush-acsigqej-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
  }
};

// Detectar ambiente
const isDeployment = process.env.REPLIT_DEPLOYMENT === '1' || 
                     process.env.NODE_ENV === 'production';

// Exportar configuração baseada no ambiente
export const getDatabaseUrl = () => {
  const config = isDeployment ? DATABASE_CONFIG.production : DATABASE_CONFIG.development;
  console.log(`📊 [Database Config] Usando: ${config.name} (${config.host})`);
  return config.url;
};

export default DATABASE_CONFIG;