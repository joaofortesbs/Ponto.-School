import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WEBP_QUALITY = 82;
const DIRECTORIES_TO_SCAN = ['public', 'public/images', 'public/lovable-uploads'];

let conversionStats = {
  startTime: null,
  endTime: null,
  totalPngsFound: 0,
  totalWebpsCreated: 0,
  totalOriginalSize: 0,
  totalNewSize: 0,
  convertedFiles: [],
  updatedReferences: [],
  errors: []
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function calculateSavings(original, converted) {
  const savings = ((original - converted) / original * 100).toFixed(1);
  return `${savings}%`;
}

async function findPngFiles(directory) {
  const pngFiles = [];
  const rootDir = path.join(__dirname, '..');
  
  for (const dir of DIRECTORIES_TO_SCAN) {
    const fullPath = path.join(rootDir, dir);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️ Diretório não encontrado: ${fullPath}`);
      continue;
    }
    
    const files = fs.readdirSync(fullPath);
    
    for (const file of files) {
      if (file.toLowerCase().endsWith('.png')) {
        const filePath = path.join(fullPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isFile()) {
          pngFiles.push({
            fullPath: filePath,
            relativePath: path.relative(rootDir, filePath),
            fileName: file,
            directory: dir
          });
        }
      }
    }
  }
  
  return pngFiles;
}

async function convertPngToWebp(pngFile) {
  try {
    const webpFileName = pngFile.fileName.replace(/\.png$/i, '.webp');
    const webpPath = path.join(path.dirname(pngFile.fullPath), webpFileName);
    
    const originalStats = fs.statSync(pngFile.fullPath);
    const originalSize = originalStats.size;
    
    await sharp(pngFile.fullPath)
      .webp({ quality: WEBP_QUALITY })
      .toFile(webpPath);
    
    const newStats = fs.statSync(webpPath);
    const newSize = newStats.size;
    
    const result = {
      original: pngFile.relativePath,
      converted: path.relative(path.join(__dirname, '..'), webpPath),
      originalSize,
      newSize,
      savings: calculateSavings(originalSize, newSize)
    };
    
    console.log(`✅ Convertido: ${pngFile.fileName}`);
    console.log(`   Original: ${formatBytes(originalSize)} → WebP: ${formatBytes(newSize)} (economia: ${result.savings})`);
    
    return result;
  } catch (error) {
    console.error(`❌ Erro ao converter ${pngFile.fileName}: ${error.message}`);
    conversionStats.errors.push({
      file: pngFile.relativePath,
      error: error.message
    });
    return null;
  }
}

async function findAndUpdateReferences(rootDir) {
  const extensions = ['.html', '.jsx', '.tsx', '.js', '.ts', '.css', '.scss', '.json'];
  const excludeDirs = ['node_modules', '.git', 'dist', 'build', 'attached_assets', '.local', '.replit', '.cache', '.config', '.upm'];
  const excludeFiles = ['package-lock.json', 'filesystem_state.json'];
  const updatedFiles = [];
  
  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name)) {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (extensions.includes(ext) && !excludeFiles.includes(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          const pngPattern = /(['"`/])((?:[^'"`\n]*\/)?(?:[a-zA-Z0-9_\-\.]+)\.png)(['"`])/gi;
          const matches = content.match(pngPattern);
          
          if (matches && matches.length > 0) {
            const pngRefs = matches.filter(m => {
              return !m.includes('node_modules') && 
                     !m.includes('attached_assets') &&
                     (m.includes('/images/') || 
                      m.includes('/lovable-uploads/') || 
                      m.includes('public/') ||
                      m.match(/^['"`]\/[^\/]+\.png['"`]$/));
            });
            
            if (pngRefs.length > 0) {
              let updatedContent = content;
              let replacements = [];
              
              for (const ref of pngRefs) {
                const updatedRef = ref.replace(/\.png(['"`])$/i, '.webp$1');
                if (updatedRef !== ref) {
                  updatedContent = updatedContent.split(ref).join(updatedRef);
                  replacements.push({ from: ref, to: updatedRef });
                }
              }
              
              if (replacements.length > 0) {
                fs.writeFileSync(fullPath, updatedContent, 'utf-8');
                updatedFiles.push({
                  file: path.relative(rootDir, fullPath),
                  replacements
                });
                console.log(`📝 Atualizado: ${path.relative(rootDir, fullPath)} (${replacements.length} referências)`);
              }
            }
          }
        }
      }
    }
  }
  
  scanDirectory(rootDir);
  return updatedFiles;
}

export async function runConversion() {
  console.log('\n🖼️  ========================================');
  console.log('   CONVERSÃO PNG → WebP');
  console.log('   ========================================\n');
  
  conversionStats = {
    startTime: Date.now(),
    endTime: null,
    totalPngsFound: 0,
    totalWebpsCreated: 0,
    totalOriginalSize: 0,
    totalNewSize: 0,
    convertedFiles: [],
    updatedReferences: [],
    errors: []
  };
  
  const rootDir = path.join(__dirname, '..');
  
  console.log('📂 Escaneando diretórios para arquivos PNG...\n');
  const pngFiles = await findPngFiles(rootDir);
  conversionStats.totalPngsFound = pngFiles.length;
  
  console.log(`📊 Total de arquivos PNG encontrados: ${pngFiles.length}\n`);
  
  if (pngFiles.length === 0) {
    console.log('⚠️ Nenhum arquivo PNG encontrado nos diretórios especificados.');
    conversionStats.endTime = Date.now();
    return conversionStats;
  }
  
  console.log('🔄 Iniciando conversão...\n');
  
  for (const pngFile of pngFiles) {
    const result = await convertPngToWebp(pngFile);
    if (result) {
      conversionStats.convertedFiles.push(result);
      conversionStats.totalWebpsCreated++;
      conversionStats.totalOriginalSize += result.originalSize;
      conversionStats.totalNewSize += result.newSize;
    }
  }
  
  console.log('\n📝 Atualizando referências no código...\n');
  conversionStats.updatedReferences = await findAndUpdateReferences(rootDir);
  
  conversionStats.endTime = Date.now();
  const executionTime = ((conversionStats.endTime - conversionStats.startTime) / 1000).toFixed(2);
  
  console.log('\n📊 ========================================');
  console.log('   RESUMO DA CONVERSÃO');
  console.log('   ========================================\n');
  console.log(`   PNGs encontrados: ${conversionStats.totalPngsFound}`);
  console.log(`   WebPs criados: ${conversionStats.totalWebpsCreated}`);
  console.log(`   Tamanho original total: ${formatBytes(conversionStats.totalOriginalSize)}`);
  console.log(`   Tamanho convertido total: ${formatBytes(conversionStats.totalNewSize)}`);
  console.log(`   Economia total: ${calculateSavings(conversionStats.totalOriginalSize, conversionStats.totalNewSize)}`);
  console.log(`   Arquivos com referências atualizadas: ${conversionStats.updatedReferences.length}`);
  console.log(`   Erros: ${conversionStats.errors.length}`);
  console.log(`   Tempo de execução: ${executionTime}s`);
  console.log('\n   ========================================\n');
  
  return conversionStats;
}

export function getConversionStats() {
  return {
    ...conversionStats,
    executionTimeMs: conversionStats.endTime ? conversionStats.endTime - conversionStats.startTime : null,
    totalSavingsPercent: conversionStats.totalOriginalSize > 0 
      ? calculateSavings(conversionStats.totalOriginalSize, conversionStats.totalNewSize)
      : '0%',
    totalOriginalSizeFormatted: formatBytes(conversionStats.totalOriginalSize),
    totalNewSizeFormatted: formatBytes(conversionStats.totalNewSize)
  };
}

export async function deletePngFiles() {
  const rootDir = path.join(__dirname, '..');
  const pngFiles = await findPngFiles(rootDir);
  let deletedCount = 0;
  
  for (const pngFile of pngFiles) {
    const webpPath = pngFile.fullPath.replace(/\.png$/i, '.webp');
    
    if (fs.existsSync(webpPath)) {
      try {
        fs.unlinkSync(pngFile.fullPath);
        console.log(`🗑️ Deletado: ${pngFile.relativePath}`);
        deletedCount++;
      } catch (error) {
        console.error(`❌ Erro ao deletar ${pngFile.relativePath}: ${error.message}`);
      }
    }
  }
  
  console.log(`\n✅ Total de PNGs deletados: ${deletedCount}`);
  return deletedCount;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runConversion().then(() => {
    console.log('✅ Conversão concluída!');
  }).catch(error => {
    console.error('❌ Erro durante conversão:', error);
    process.exit(1);
  });
}
