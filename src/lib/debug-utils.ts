
// Utilitários para depuração

/**
 * Monitora exceções e erros não tratados na aplicação
 */
export function setupErrorTracking(callback: (error: Error, info: string) => void) {
  // Monitorar erros não tratados
  window.addEventListener('error', (event) => {
    callback(event.error || new Error(event.message), 'window.error');
    // Não impedir o comportamento padrão do navegador
    return false;
  });

  // Monitorar rejeições de promises não tratadas
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    callback(error, 'unhandledRejection');
  });

  // Adicionar um log para confirmar que o rastreamento foi configurado
  console.log('[DEBUG] Rastreamento de erros configurado');
  
  return () => {
    window.removeEventListener('error', () => {});
    window.removeEventListener('unhandledrejection', () => {});
  };
}

/**
 * Verifica se há vazamentos de memória potenciais
 */
export function checkMemoryLeaks() {
  if (window.performance && (window.performance as any).memory) {
    const memory = (window.performance as any).memory;
    const usedHeapSize = memory.usedJSHeapSize;
    const totalHeapSize = memory.totalJSHeapSize;
    const limit = memory.jsHeapSizeLimit;
    
    const usagePercentage = (usedHeapSize / limit) * 100;
    
    console.log(`[DEBUG] Uso de memória: ${formatBytes(usedHeapSize)} / ${formatBytes(totalHeapSize)} (${usagePercentage.toFixed(2)}% do limite)`);
    
    if (usagePercentage > 90) {
      console.warn('[DEBUG] Uso de memória alto. Possível vazamento de memória.');
    }
  } else {
    console.log('[DEBUG] Performance API não disponível para verificação de memória');
  }
}

/**
 * Formata bytes para uma representação legível
 */
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Rastreia tempo de carregamento de componentes React
 */
export function trackComponentPerformance(
  componentName: string, 
  startTime: number
) {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`[DEBUG] ${componentName} renderizado em ${duration.toFixed(2)}ms`);
  
  if (duration > 100) {
    console.warn(`[DEBUG] Renderização lenta detectada em ${componentName}`);
  }
  
  return duration;
}

/**
 * Analisa problemas com imagens carregadas na aplicação
 */
export function analyzeImageLoading() {
  const images = document.querySelectorAll('img');
  const issues: { src: string, issue: string }[] = [];
  
  images.forEach(img => {
    if (!img.complete) {
      issues.push({
        src: img.src,
        issue: 'Imagem não carregada completamente'
      });
    } else if (img.naturalHeight === 0) {
      issues.push({
        src: img.src,
        issue: 'Imagem carregada com altura zero (provavelmente quebrada)'
      });
    }
  });
  
  if (issues.length > 0) {
    console.warn('[DEBUG] Problemas com imagens detectados:', issues);
  } else {
    console.log('[DEBUG] Todas as imagens carregadas corretamente');
  }
  
  return issues;
}

/**
 * Analisa problemas de rede na aplicação
 */
export function analyzeNetworkIssues() {
  if (window.performance && window.performance.getEntriesByType) {
    const resources = window.performance.getEntriesByType('resource');
    const issues: any[] = [];
    
    resources.forEach((resource: any) => {
      // Verificar recursos lentos (> 1s)
      if (resource.duration > 1000) {
        issues.push({
          url: resource.name,
          type: resource.initiatorType,
          duration: resource.duration,
          issue: 'Carregamento lento'
        });
      }
      
      // Verificar recursos que falharam (tamanho zero)
      if (resource.transferSize === 0 && !resource.name.includes('data:')) {
        issues.push({
          url: resource.name,
          type: resource.initiatorType,
          issue: 'Falha no carregamento (tamanho zero)'
        });
      }
    });
    
    if (issues.length > 0) {
      console.warn('[DEBUG] Problemas de rede detectados:', issues);
    } else {
      console.log('[DEBUG] Nenhum problema de rede detectado');
    }
    
    return issues;
  }
  
  console.log('[DEBUG] Performance API não disponível para análise de rede');
  return [];
}

/**
 * Analisa problemas de localStorage
 */
export function analyzeLocalStorage() {
  try {
    const size = calculateLocalStorageSize();
    console.log(`[DEBUG] Tamanho do localStorage: ${formatBytes(size)}`);
    
    if (size > 4 * 1024 * 1024) {
      console.warn('[DEBUG] LocalStorage próximo do limite (5MB)');
    }
    
    return {
      size,
      itemCount: Object.keys(localStorage).length,
      isNearLimit: size > 4 * 1024 * 1024
    };
  } catch (error) {
    console.error('[DEBUG] Erro ao analisar localStorage:', error);
    return {
      error: String(error),
      size: 0,
      itemCount: 0,
      isNearLimit: false
    };
  }
}

/**
 * Calcula o tamanho aproximado do localStorage
 */
function calculateLocalStorageSize() {
  let size = 0;
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || '';
    const value = localStorage.getItem(key) || '';
    size += key.length + value.length;
  }
  
  // Converte para bytes (2 bytes por caractere em UTF-16)
  return size * 2;
}
