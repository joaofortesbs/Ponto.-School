
// Script para reiniciar a aplicação e garantir carregamento correto
console.log("Iniciando reinicialização da aplicação...");

// Função para verificar e corrigir problemas de CSS
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    let content = fs.readFileSync(mainTsxPath, 'utf8');
    
    // Verificar se há duplicação da classe ErrorBoundary
    if (content.includes('constructor(props)') && content.includes('constructor(props)')) {
      console.log('Corrigindo duplicação de código no main.tsx...');
      
      // Substituir todo o conteúdo do arquivo por uma versão correta
      const fixedContent = fs.readFileSync(path.join(__dirname, 'main.tsx.template'), 'utf8');
      fs.writeFileSync(mainTsxPath, fixedContent);
      console.log('main.tsx corrigido com sucesso!');
    }
    
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

// Limpar o cache do Vite
function clearViteCache() {
  try {
    const cacheDirs = [
      path.join(__dirname, '..', 'node_modules', '.vite'),
      path.join(__dirname, '..', '.vite')
    ];
    
    cacheDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`Cache removido: ${dir}`);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao limpar cache do Vite:', error);
    return false;
  }
}

// Executar todas as correções
async function runAllFixes() {
  console.log('Iniciando correções na aplicação...');
  
  const cssFix = fixIndexCss();
  const tsxFix = fixMainTsx();
  const viteFix = fixViteConfig();
  const cacheClear = clearViteCache();
  
  if (cssFix && tsxFix && viteFix && cacheClear) {
    console.log('Todas as correções foram aplicadas com sucesso!');
    console.log('Aplicação pronta para ser reiniciada.');
    
    // Podemos adicionar aqui um comando para reiniciar o servidor Vite
    // Por exemplo:
    // const { execSync } = require('child_process');
    // execSync('npm run dev', { stdio: 'inherit' });
    
    return true;
  } else {
    console.error('Algumas correções falharam. Verifique os logs para mais detalhes.');
    return false;
  }
}

// Executar o script
runAllFixes().catch(err => {
  console.error('Erro durante a execução do script:', err);
  process.exit(1);
});
