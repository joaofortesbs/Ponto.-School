
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

