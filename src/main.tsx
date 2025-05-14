import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import './lib/username-initializer.ts'
import { preInitializeWebNodes } from './lib/web-persistence.ts'

// Garantir que a inicialização não cause problemas de renderização
window.addEventListener('DOMContentLoaded', () => {
  console.log("DOM carregado completamente, verificando inicialização da aplicação");
});

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

console.log("Iniciando aplicação...");

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