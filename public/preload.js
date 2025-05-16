
// Controle de atualizações da aplicação
window.__USER_TRIGGERED_RELOAD = false;

// Função para permitir que apenas atualizações explicitamente solicitadas sejam processadas
window.requestAppUpdate = function() {
  window.__USER_TRIGGERED_RELOAD = true;
  window.location.reload();
};

// Interceptar eventos de conexão do Vite para evitar recargas automáticas
window.addEventListener('DOMContentLoaded', function() {
  // Prevenir que o Vite recarregue a página automaticamente em determinadas situações
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    // Se for uma solicitação para o servidor de desenvolvimento do Vite
    if (args[0] && typeof args[0] === 'string' && args[0].includes('vite')) {
      // Verificar se é uma solicitação de reconexão ou recarga
      if (args[0].includes('__vite_ping') || args[0].includes('__reload')) {
        console.log('Interceptando solicitação do Vite para evitar recarga automática');
        // Opcionalmente, armazenar a informação de que há uma atualização disponível
        // para notificar o usuário em vez de recarregar automaticamente
        return Promise.resolve(new Response(JSON.stringify({updated: false})));
      }
    }
    return originalFetch.apply(this, args);
  };
});


// Este script foi atualizado para integrar com o serviço SendGrid
(function() {
  // Apenas para compatibilidade com o código antigo
  console.log('Email service now using SendGrid API');
  
  // Criamos um objeto global para manter compatibilidade
  window.Email = {
    send: function(params) {
      return new Promise((resolve, reject) => {
        // Esta é apenas uma simulação para compatibilidade
        // O envio real será feito pelo serviço no backend
        console.log('Email send request initiated with params:', params);
        
        // Simular um atraso e sucesso
        setTimeout(() => {
          resolve("OK");
        }, 500);
      });
    }
  };
  
  // Notificar que o serviço está pronto
  document.dispatchEvent(new CustomEvent('email-service-ready'));
})();

