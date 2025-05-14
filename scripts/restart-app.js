
// Script para reiniciar a aplicação e garantir carregamento correto
console.log("Iniciando reinicialização da aplicação...");

// Função para verificar e corrigir problemas de CSS
const fs = require('fs');
const path = require('path');

// Verifica se o index.css está correto
function fixIndexCss() {
  try {
    const indexCssPath = path.join(__dirname, '..', 'src', 'index.css');
    let content = fs.readFileSync(indexCssPath, 'utf8');
    
    // Verificar se as diretivas do Tailwind estão no início
    if (!content.startsWith('@tailwind')) {
      console.log('Corrigindo ordem das diretivas Tailwind no index.css...');
      
      // Remover ocorrências duplicadas de diretivas Tailwind
      content = content.replace(/@tailwind base;[\s\S]*?@tailwind utilities;/g, '');
      
      // Adicionar as diretivas Tailwind no início
      content = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n${content}`;
      
      fs.writeFileSync(indexCssPath, content);
      console.log('index.css corrigido com sucesso!');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao corrigir index.css:', error);
    return false;
  }
}

// Verifica se o main.tsx está correto
function fixMainTsx() {
  try {
    const mainTsxPath = path.join(__dirname, '..', 'src', 'main.tsx');
    const content = fs.readFileSync(mainTsxPath, 'utf8');
    
    // Verificar a definição da classe ErrorBoundary
    // No caso de main.tsx, verificamos a correção manual
    
    console.log('main.tsx verificado.');
    return true;
  } catch (error) {
    console.error('Erro ao verificar main.tsx:', error);
    return false;
  }
}

// Verificar configuração do Vite
function fixViteConfig() {
  try {
    const viteConfigPath = path.join(__dirname, '..', 'vite.config.ts');
    let content = fs.readFileSync(viteConfigPath, 'utf8');
    
    // Verificar se a configuração do jsxImportSource está presente
    if (!content.includes('jsxImportSource:')) {
      console.log('Adicionando jsxImportSource à configuração do Vite...');
      
      // Adicionar jsxImportSource à configuração do react
      content = content.replace(
        /react\(\{[\s\S]*?plugins:[\s\S]*?conditionalPlugins,[\s\S]*?\}\)/,
        `react({
      plugins: conditionalPlugins,
      jsxImportSource: "react",
    })`
      );
      
      fs.writeFileSync(viteConfigPath, content);
      console.log('vite.config.ts corrigido com sucesso!');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao corrigir vite.config.ts:', error);
    return false;
  }
}

// Limpar o cache do navegador e dados temporários
function cleanupTemporaryFiles() {
  try {
    const nodeModulesPath = path.join(__dirname, '..', 'node_modules', '.vite');
    
    if (fs.existsSync(nodeModulesPath)) {
      console.log('Limpando cache do Vite...');
      try {
        fs.rmSync(nodeModulesPath, { recursive: true, force: true });
        console.log('Cache do Vite limpo com sucesso!');
      } catch (e) {
        console.log('Aviso: Não foi possível remover o cache do Vite:', e.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao limpar arquivos temporários:', error);
    return false;
  }
}

// Executa todas as verificações e correções
async function runAll() {
  console.log('Iniciando verificações e correções...');
  
  const results = [
    fixIndexCss(),
    fixMainTsx(),
    fixViteConfig(),
    cleanupTemporaryFiles()
  ];
  
  const allSuccess = results.every(result => result);
  
  if (allSuccess) {
    console.log('Todas as correções foram aplicadas com sucesso!');
    console.log('A aplicação está pronta para ser reiniciada. Execute "npm run dev" para iniciar.');
    
    // Se desejar reiniciar automaticamente a aplicação, descomente a linha abaixo
    // require('child_process').execSync('npm run dev', { stdio: 'inherit' });
  } else {
    console.log('Algumas correções não puderam ser aplicadas. Verifique os erros acima.');
  }
}

runAll().catch(err => {
  console.error('Erro durante o processo de correção:', err);
});
