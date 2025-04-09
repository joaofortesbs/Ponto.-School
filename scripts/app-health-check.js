
// Script para verificar a saúde da aplicação e solucionar problemas comuns

// Verificar dependências
const checkDependencies = () => {
  console.log("Verificando dependências...");
  
  try {
    // Testando dependências essenciais
    require('@supabase/supabase-js');
    require('react');
    require('react-dom');
    require('react-router-dom');
    
    console.log("✅ Todas as dependências essenciais estão instaladas.");
    return true;
  } catch (error) {
    console.error("❌ Erro ao verificar dependências:", error.message);
    console.log("Sugestão: Execute 'npm install' para reinstalar as dependências.");
    return false;
  }
};

// Verificar variáveis de ambiente
const checkEnvironment = () => {
  console.log("Verificando variáveis de ambiente...");
  
  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error(`❌ Variáveis de ambiente necessárias não encontradas: ${missing.join(', ')}`);
    console.log("Sugestão: Verifique o arquivo .env e adicione as variáveis necessárias.");
    return false;
  }
  
  console.log("✅ Variáveis de ambiente configuradas corretamente.");
  return true;
};

// Verificar arquivos críticos
const checkCriticalFiles = () => {
  console.log("Verificando arquivos críticos...");
  
  const fs = require('fs');
  const criticalFiles = [
    './src/App.tsx',
    './src/main.tsx',
    './src/lib/supabase.ts',
    './.env'
  ];
  
  const missing = criticalFiles.filter(file => !fs.existsSync(file));
  
  if (missing.length > 0) {
    console.error(`❌ Arquivos críticos não encontrados: ${missing.join(', ')}`);
    console.log("Sugestão: Restaure os arquivos faltantes do repositório original.");
    return false;
  }
  
  console.log("✅ Todos os arquivos críticos estão presentes.");
  return true;
};

// Executar todas as verificações
const runHealthCheck = () => {
  console.log("=== INICIANDO VERIFICAÇÃO DE SAÚDE DA APLICAÇÃO ===");
  
  const dependenciesOk = checkDependencies();
  const environmentOk = checkEnvironment();
  const filesOk = checkCriticalFiles();
  
  console.log("\n=== RESUMO DA VERIFICAÇÃO ===");
  console.log(`Dependências: ${dependenciesOk ? '✅ OK' : '❌ Problemas encontrados'}`);
  console.log(`Variáveis de ambiente: ${environmentOk ? '✅ OK' : '❌ Problemas encontrados'}`);
  console.log(`Arquivos críticos: ${filesOk ? '✅ OK' : '❌ Problemas encontrados'}`);
  
  if (dependenciesOk && environmentOk && filesOk) {
    console.log("\n✅ APLICAÇÃO SAUDÁVEL: Todos os sistemas estão funcionando corretamente.");
  } else {
    console.log("\n❌ PROBLEMAS DETECTADOS: Corrija os problemas acima para que a aplicação funcione corretamente.");
  }
};

// Executar verificação
runHealthCheck();
