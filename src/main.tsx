import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import './lib/username-initializer.ts'
import { preInitializeWebNodes } from './lib/web-persistence.ts'

// PRIORIDADE MÁXIMA: Inicializar teias antes de qualquer outro código
// Esta função é executada imediatamente, antes mesmo da montagem do React
function inicializarTeiasComPrioridadeMaxima() {
  console.log("Inicializando sistema de teias com prioridade máxima");

  try {
    // Executa sincronamente para garantir disponibilidade imediata
    preInitializeWebNodes();

    // Método para garantir disponibilidade em páginas de autenticação
    if (window.location.pathname.includes('/login') || window.location.pathname.includes('/register')) {
      console.log("Página de autenticação detectada, preparando teias prioritárias");

      // Adiciona um fundo temporário para melhorar a experiência visual enquanto carrega
      document.body.classList.add('auth-page-loading');

      // Adiciona um estilo global temporário para garantir que o container das teias seja visível imediatamente
      const style = document.createElement('style');
      style.textContent = `
        .auth-page-loading {
          background: linear-gradient(135deg, rgba(0,20,39,1) 0%, rgba(41,51,92,1) 100%);
        }
      `;

/**
 * Função para evitar recargas automáticas indesejadas da aplicação
 */
function preventUnwantedReloads() {
  // Criar identificador único para a sessão atual
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  sessionStorage.setItem('currentSessionId', sessionId);

  // Interceptar eventos de beforeunload para prevenir recargas acidentais
  window.addEventListener('beforeunload', (event) => {
    // Apenas perguntar se parece ser uma recarga não intencional
    const isIntentionalNavigation = sessionStorage.getItem('intentionalNavigation') === 'true';
    
    if (!isIntentionalNavigation && !window.location.href.includes('/auth/')) {
      sessionStorage.removeItem('intentionalNavigation');
      // Mensagem de confirmação para evitar recargas acidentais
      const message = 'Há mudanças não salvas. Deseja realmente sair?';
      event.returnValue = message;
      return message;
    }
  });

  // Sobrescrever o método de recarga para marcar recargas intencionais
  const originalReload = window.location.reload;
  window.location.reload = function(...args) {
    sessionStorage.setItem('intentionalNavigation', 'true');
    return originalReload.apply(this, args);
  };

  // Interceptar cliques em links para marcar navegações intencionais
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');
    
    if (anchor && anchor.href && !anchor.getAttribute('target')) {
      sessionStorage.setItem('intentionalNavigation', 'true');
    }
  });

  // Detectar e cancelar múltiplas tentativas de recarga em curto período
  let reloadAttempts = 0;
  const reloadThreshold = 3;
  const reloadTimeWindow = 5000; // 5 segundos
  
  window.addEventListener('error', () => {
    reloadAttempts++;
    
    setTimeout(() => {
      reloadAttempts--;
    }, reloadTimeWindow);
    
    if (reloadAttempts >= reloadThreshold) {
      console.error('Múltiplas tentativas de recarga detectadas. Estabilizando aplicação...');
      reloadAttempts = 0;
      
      // Mostrar mensagem ao usuário
      const errorMessage = document.createElement('div');
      errorMessage.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(255, 107, 0, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        font-family: system-ui, sans-serif;
      `;
      errorMessage.innerText = 'Estabilizando a aplicação, por favor aguarde...';
      document.body.appendChild(errorMessage);
      
      // Remover após 5 segundos
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 5000);
      
      return true; // Prevenir recarga automática
    }
    
    return false;
  });
}

// Inicializar prevenção de recargas
preventUnwantedReloads();


        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(0,20,39,0.95) 0%, rgba(41,51,92,0.95) 100%);
          z-index: -1;
        }
      `;
      document.head.appendChild(style);

      // Remover o estilo quando a aplicação real estiver carregada
      window.addEventListener('load', () => {
        setTimeout(() => {
          document.body.classList.remove('auth-page-loading');
          style.remove();
        }, 300);
      });

      // Disparar evento de teias prontas para garantir renderização dos componentes
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('WebTeiasProntas'));
      }, 100);
    }
  } catch (error) {
    console.error("Erro na inicialização das teias:", error);
  }
}

// Executar inicialização prioritária
inicializarTeiasComPrioridadeMaxima();

// Configuração de tratamento global de erros
const handleGlobalError = (event: ErrorEvent) => {
  console.error("Erro global capturado:", event.error || event.message);
  // Não interrompe a aplicação aqui, apenas loga o erro
  event.preventDefault();
};

// Registrar handler de erro global
window.addEventListener('error', handleGlobalError);

// Adicionar tratamento para promessas não tratadas
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Promessa não tratada:', event.reason);
  // Não cancela o evento para permitir outros handlers
});

// Impedir recargas automáticas indesejadas da página
if (import.meta.hot) {
  // Prevenir que certos erros façam a página recarregar completamente
  import.meta.hot.on('vite:beforeUpdate', (data) => {
    // Verificar se a atualização foi solicitada pelo usuário
    if (!window.__USER_TRIGGERED_RELOAD) {
      // Se o erro for em um arquivo CSS ou algum recurso não crítico, aceitar atualizações parciais
      // mas prevenir recargas completas da página
      if (data && data.updates && data.updates.some(update => update.type === 'css-update')) {
        console.log('Aceitando atualização de CSS sem recarregar a página');
      } else {
        // Caso seja uma atualização de módulo JavaScript significativa,
        // mostrar uma notificação para o usuário antes de aplicar
        const shouldReload = false; // Por padrão, não recarregar automaticamente
        
        if (!shouldReload) {
          console.log('Atualização detectada mas não aplicada para evitar interrupção');
          // Opcional: isso pode ser modificado para mostrar uma notificação ao usuário
          // permitindo que ele escolha quando atualizar
          return;
        }
      }
    }
  });
}

// Desativar a reconexão automática do servidor WebSocket do Vite em produção
if (import.meta.env.PROD) {
  window.__VITE_PREVENT_RECONNECT = true;
}

console.log("Iniciando aplicação...");

// Inicializar a aplicação com otimização de renderização
const initializeApp = () => {
  try {
    const rootElement = document.getElementById("root");

    if (!rootElement) {
      throw new Error("Elemento root não encontrado");
    }

    // Desativar o StrictMode em produção para evitar renderizações duplas
    const isDevMode = import.meta.env.MODE === 'development';

    // Pré-renderizar um loading state para feedback visual imediato
    rootElement.innerHTML = `
      <div id="initial-loader" style="position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #000000 0%, #1a0d00 50%, #0e0500 100%); z-index: 9999;">
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div style="width: 50px; height: 50px; border: 3px solid transparent; border-top-color: #FF6B00; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <p style="color: white; margin-top: 20px; font-family: system-ui, sans-serif;">Carregando...</p>
        </div>
      </div>
      <style>
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    `;

    // Pré-inicializar dados importantes
    window.preloadStartTime = Date.now();

    // Renderização otimizada usando requestIdleCallback ou fallback
    const renderApp = () => {
      const AppRoot = (
        <ErrorBoundary>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ErrorBoundary>
      );

      ReactDOM.createRoot(rootElement).render(
        isDevMode ? <React.StrictMode>{AppRoot}</React.StrictMode> : AppRoot
      );

      console.log('Aplicação inicializada com sucesso.');

      // Remover o loader inicial após um breve período
      setTimeout(() => {
        const loader = document.getElementById('initial-loader');
        if (loader) {
          loader.style.opacity = '0';
          loader.style.transition = 'opacity 0.3s ease-out';
          setTimeout(() => loader.remove(), 300);
        }
      }, 200);
    };

    // Renderizar imediatamente sem esperar por idle callback
    // para garantir carregamento rápido
    renderApp();

    // Timeout reduzido para garantir que a UI não fique presa em carregamento
    setTimeout(() => {
      if (document.getElementById('initial-loader')) {
        console.warn("Timeout de carregamento atingido. Forçando renderização.");
        renderApp();
      }
    }, 2000);

  } catch (error) {
    console.error("Erro ao inicializar aplicação:", error);

    // Tentar renderizar uma versão mínima da aplicação
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="font-family: system-ui, sans-serif; padding: 2rem; text-align: center; background: linear-gradient(135deg, rgba(0,20,39,1) 0%, rgba(41,51,92,1) 100%); min-height: 100vh; color: white;">
          <h1>Erro ao carregar aplicação</h1>
          <p>Ocorreu um erro ao inicializar a aplicação. Tente recarregar a página.</p>
          <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; margin-top: 1rem; cursor: pointer; background: #FF6B00; color: white; border: none; border-radius: 4px;">
            Recarregar
          </button>
        </div>
      `;
    }
  }
};

// Componente ErrorBoundary para capturar erros durante a renderização
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(0,20,39,1) 0%, rgba(41,51,92,1) 100%)',
          minHeight: '100vh',
          color: 'white'
        }}>
          <h1>Algo deu errado</h1>
          <p>Ocorreu um erro ao renderizar a aplicação. Tente recarregar a página.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1rem',
              marginTop: '1rem',
              cursor: 'pointer',
              background: '#FF6B00',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Recarregar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Inicializar a aplicação
initializeApp();