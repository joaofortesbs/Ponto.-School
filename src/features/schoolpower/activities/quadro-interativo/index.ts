
// Exportações principais
export { default as QuadroInterativoPreview } from './QuadroInterativoPreview';
export { default as EditActivity } from './EditActivity';
export { quadroInterativoFieldMapping } from './fieldMapping';
export { prepareQuadroInterativoDataForModal } from './quadroInterativoProcessor';

// Exportar e inicializar monitor
export { default as QuadroInterativoMonitor } from './QuadroInterativoMonitor';

// Inicialização automática do sistema
console.log('🎯 [QUADRO INTERATIVO] Inicializando sistema exclusivo');

// Importar e inicializar monitor automaticamente
import('./QuadroInterativoMonitor').then(({ default: QuadroInterativoMonitor }) => {
  const monitor = QuadroInterativoMonitor.getInstance();
  
  // Aguardar um pouco para garantir que o DOM esteja pronto
  setTimeout(() => {
    monitor.startMonitoring();
    console.log('✅ [QUADRO INTERATIVO] Monitor inicializado automaticamente');
  }, 2000);
}).catch(error => {
  console.error('❌ [QUADRO INTERATIVO] Erro ao inicializar monitor:', error);
});

// Verificar e limpar dados obsoletos na inicialização
setTimeout(() => {
  try {
    const keys = Object.keys(localStorage);
    const quadroKeys = keys.filter(key => 
      key.includes('quadro') && 
      key.includes('triggered') && 
      localStorage.getItem(key)
    );
    
    quadroKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        const timestamp = new Date(data.timestamp || 0);
        const now = new Date();
        
        // Remover marcadores com mais de 10 minutos
        if (now.getTime() - timestamp.getTime() > 10 * 60 * 1000) {
          localStorage.removeItem(key);
          console.log('🧹 [QUADRO INTERATIVO] Limpeza automática:', key);
        }
      } catch (e) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('⚠️ [QUADRO INTERATIVO] Erro na limpeza inicial:', error);
  }
}, 3000);

// Função utilitária para debug manual
(window as any).debugQuadroInterativo = () => {
  const keys = Object.keys(localStorage);
  const quadroKeys = keys.filter(key => key.includes('quadro'));
  
  console.log('🔍 [DEBUG] Chaves relacionadas ao Quadro Interativo:', quadroKeys);
  
  quadroKeys.forEach(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      console.log(`📊 [DEBUG] ${key}:`, data);
    } catch (e) {
      console.log(`📊 [DEBUG] ${key}: ${localStorage.getItem(key)}`);
    }
  });
};

console.log('✅ [QUADRO INTERATIVO] Sistema exclusivo inicializado');
