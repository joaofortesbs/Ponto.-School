
export { default as QuadroInterativoPreview } from './QuadroInterativoPreview';
export { default as quadroInterativoProcessor } from './quadroInterativoProcessor';
export { quadroInterativoFieldMapping } from './fieldMapping';
export { default as QuadroInterativoMonitor } from './QuadroInterativoMonitor';
export * from './quadroInterativoProcessor';

// Inicializar monitor automaticamente
import QuadroInterativoMonitor from './QuadroInterativoMonitor';

// Iniciar monitoramento quando o módulo for carregado
setTimeout(() => {
  QuadroInterativoMonitor.getInstance().startMonitoring();
  console.log('🔍 Sistema de monitoramento do Quadro Interativo inicializado');
}, 1000);
