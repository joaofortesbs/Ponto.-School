
// Script para verificar e corrigir problemas de renderização
console.log("Iniciando verificação de problemas de renderização...");

// Função para verificar conectividade com supabase
async function checkSupabaseConnection() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://supabase-fallback-url.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'fallback-key';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      console.error("Erro ao verificar conexão com Supabase:", error.message);
      return false;
    }
    
    console.log("Conexão com Supabase verificada com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao verificar conexão com Supabase:", error);
    console.log("Usando armazenamento local como fallback");
    return false;
  }
}

// Verificar se arquivos CSS estão corretos
const fs = require('fs');
const path = require('path');

function checkCssFiles() {
  const cssDir = path.join(__dirname, '..', 'src', 'styles');
  
  try {
    const files = fs.readdirSync(cssDir);
    console.log("Arquivos CSS encontrados:", files);
    
    // Verificar se o arquivo principal index.css está correto
    const indexCssPath = path.join(__dirname, '..', 'src', 'index.css');
    let indexCss = fs.readFileSync(indexCssPath, 'utf8');
    
    // Garantir que as importações estão no início
    if (indexCss.includes('@import') && !indexCss.startsWith('@import')) {
      console.log("Corrigindo ordem das importações em index.css");
      
      // Extrair todas as importações
      const importRegex = /@import\s+["']([^"']+)["'];/g;
      const imports = [];
      let match;
      
      while ((match = importRegex.exec(indexCss)) !== null) {
        imports.push(match[0]);
      }
      
      // Remover importações originais
      indexCss = indexCss.replace(importRegex, '');
      
      // Adicionar importações no início
      indexCss = imports.join('\n') + '\n\n' + indexCss;
      
      fs.writeFileSync(indexCssPath, indexCss);
      console.log("index.css corrigido com sucesso");
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao verificar arquivos CSS:", error);
    return false;
  }
}

// Executar verificações
async function runChecks() {
  console.log("Verificando configurações da aplicação...");
  
  const supabaseOk = await checkSupabaseConnection();
  const cssOk = checkCssFiles();
  
  if (supabaseOk && cssOk) {
    console.log("Todas as verificações foram concluídas com sucesso!");
  } else {
    console.log("Algumas verificações falharam. Verifique os logs acima para mais detalhes.");
  }
}

runChecks().catch(err => {
  console.error("Erro durante a verificação:", err);
});
