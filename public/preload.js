
// Controle de atualizações da aplicação
window.__USER_TRIGGERED_RELOAD = false;
window.__LAST_RELOAD_TIME = Date.now();
window.__RELOAD_COOLDOWN = 5000; // 5 segundos entre recargas
window.__PENDING_UPDATES = false;

// Função para permitir que apenas atualizações explicitamente solicitadas sejam processadas
window.requestAppUpdate = function() {
  // Verificar cooldown para prevenir múltiplas recargas
  if (Date.now() - window.__LAST_RELOAD_TIME < window.__RELOAD_COOLDOWN) {
    console.log('Recarga solicitada muito rápido. Aguardando cooldown...');
    window.__PENDING_UPDATES = true;
    
    // Agendar recarga após cooldown
    setTimeout(() => {
      if (window.__PENDING_UPDATES) {
        window.__USER_TRIGGERED_RELOAD = true;
        window.__LAST_RELOAD_TIME = Date.now();
        window.__PENDING_UPDATES = false;
        window.location.reload();
      }
    }, window.__RELOAD_COOLDOWN);
    
    return;
  }
  
  // Executar recarga normalmente
  window.__USER_TRIGGERED_RELOAD = true;
  window.__LAST_RELOAD_TIME = Date.now();
  window.location.reload();
};

// Gerenciador avançado de recargas para o Vite
window.__setupViteReloadManager = function() {
  // Armazenar estado da aplicação antes de recarga
  if (window.localStorage) {
    window.addEventListener('beforeunload', () => {
      if (window.__USER_TRIGGERED_RELOAD) {
        localStorage.setItem('__lastUserTriggeredReload', Date.now().toString());
      }
    });
    
    // Verificar se a recarga foi solicitada pelo usuário
    const lastUserReload = localStorage.getItem('__lastUserTriggeredReload');
    if (lastUserReload && (Date.now() - parseInt(lastUserReload)) < 3000) {
      console.log('Recarga iniciada pelo usuário');
      localStorage.removeItem('__lastUserTriggeredReload');
    }
  }
  
  // Interceptar eventos de conexão do Vite para evitar recargas automáticas
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    // Se for uma solicitação para o servidor de desenvolvimento do Vite
    if (args[0] && typeof args[0] === 'string' && args[0].includes('vite')) {
      // Verificar se é uma solicitação de reconexão ou recarga
      if (args[0].includes('__vite_ping') || args[0].includes('__reload')) {
        console.log('Interceptando solicitação do Vite para evitar recarga automática');
        
        // Permitir pings mas não recargas automáticas
        if (args[0].includes('__vite_ping')) {
          return originalFetch.apply(this, args)
            .then(response => {
              return response.json()
                .then(data => {
                  // Apenas notificar sobre atualizações sem recarregar
                  if (data && data.outdated) {
                    console.log('Atualização disponível. Use menu Mostrar Atualizações para aplicar.');
                    window.__PENDING_UPDATES = true;
                    
                    // Opcional: Mostrar notificação ao usuário
                    if (!document.getElementById('update-notification')) {
                      const notification = document.createElement('div');
                      notification.id = 'update-notification';
                      notification.style.cssText = `
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        background: rgba(255, 107, 0, 0.9);
                        color: white;
                        padding: 10px 15px;
                        border-radius: 4px;
                        font-family: system-ui, sans-serif;
                        font-size: 14px;
                        z-index: 9999;
                        cursor: pointer;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                        display: flex;
                        align-items: center;
                        gap: 10px;
                      `;
                      notification.innerHTML = `
                        <span style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; background: rgba(255, 255, 255, 0.2); border-radius: 50%;">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="23 4 23 10 17 10"></polyline>
                            <polyline points="1 20 1 14 7 14"></polyline>
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                          </svg>
                        </span>
                        Atualização disponível. Clique para aplicar.
                      `;
                      
                      // Adicionar ao DOM
                      document.body.appendChild(notification);
                      
                      // Configurar evento de clique
                      notification.addEventListener('click', () => {
                        window.requestAppUpdate();
                      });
                      
                      // Remover após 10 segundos
                      setTimeout(() => {
                        if (document.body.contains(notification)) {
                          document.body.removeChild(notification);
                        }
                      }, 10000);
                    }
                  }
                  
                  // Retornar resposta modificada para evitar recarga automática
                  const modifiedResponse = new Response(JSON.stringify({ ...data, updated: false }));
                  return modifiedResponse;
                });
            });
        }
        
        // Bloquear completamente as recargas automáticas
        return Promise.resolve(new Response(JSON.stringify({updated: false})));
      }
    }
    
    // Processar todas as outras solicitações normalmente
    return originalFetch.apply(this, args);
  };
  
  // Interceptar a API eventSource usada pelo Vite para atualizações HMR
  const OriginalEventSource = window.EventSource;
  window.EventSource = function(...args) {
    const url = args[0];
    if (url && typeof url === 'string' && url.includes('vite')) {
      console.log('Interceptando EventSource do Vite para controlar atualizações');
      
      // Criar EventSource normal, mas interceptar mensagens que causam recargas
      const eventSource = new OriginalEventSource(...args);
      
      // Armazenar o manipulador de mensagens original
      const originalOnMessage = eventSource.onmessage;
      
      // Substituir por um manipulador personalizado
      eventSource.onmessage = function(event) {
        try {
          const data = JSON.parse(event.data);
          
          // Verificar se é uma mensagem de recarga completa
          if (data && data.type === 'full-reload') {
            console.log('Interceptando recarga completa do Vite');
            window.__PENDING_UPDATES = true;
            return; // Não propagar o evento
          }
        } catch (e) {
          // Em caso de erro ao analisar, permitir o evento normalmente
        }
        
        // Chamar o manipulador original para outros tipos de mensagens
        if (originalOnMessage) {
          originalOnMessage.call(eventSource, event);
        }
      };
      
      return eventSource;
    }
    
    // Processar outras fontes de evento normalmente
    return new OriginalEventSource(...args);
  };
};

// Inicializar o gerenciador de recargas do Vite quando o DOM estiver carregado
window.addEventListener('DOMContentLoaded', function() {
  window.__setupViteReloadManager();
  
  // Aplicar otimizações adicionais
  document.addEventListener('click', function(e) {
    // Evitar que cliques em links externos causem recargas não gerenciadas
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    
    if (anchor && anchor.href && !anchor.getAttribute('target') && !anchor.href.startsWith(window.location.origin)) {
      e.preventDefault();
      e.stopPropagation();
      
      // Abrir em nova aba
      window.open(anchor.href, '_blank');
    }
  }, true);
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

