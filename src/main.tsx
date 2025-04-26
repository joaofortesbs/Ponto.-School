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

// Configuração de tratamento global de erros aprimorada
const handleGlobalError = (event: ErrorEvent) => {
  console.error("Erro global capturado:", event.error || event.message);
  console.error("Localização do erro:", event.filename, "linha:", event.lineno, "coluna:", event.colono);
  
  // Capturar informações do stack trace se disponível
  if (event.error && event.error.stack) {
    console.error("Stack trace:", event.error.stack);
  }
  
  // Verificar se o erro está relacionado ao lucide-react (problema identificado)
  if (event.message && (
    event.message.includes("lucide-react") || 
    event.message.includes("Tool")
  )) {
    console.warn("Detectado erro relacionado a lucide-react - possivelmente um problema de importação");
  }
  
  // Não interrompe a aplicação aqui, apenas loga o erro
  event.preventDefault();
  
  // Contagem de erros para detectar cascatas
  window._errorCount = (window._errorCount || 0) + 1;
  
  // Se muitos erros ocorrerem em sequência, mostrar alerta
  if (window._errorCount > 10) {
    console.error("ALERTA: Muitos erros detectados - possível loop de erros");
    // Resetar contagem para não sobrecarregar o console
    window._errorCount = 0;
  }
};

// Registrar handler de erro global
window.addEventListener('error', handleGlobalError);

// Adicionar tratamento melhorado para promessas não tratadas
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Promessa não tratada:', event.reason);
  
  // Capturar mais informações sobre o erro da promessa
  if (event.reason instanceof Error) {
    console.warn('Detalhes do erro da promessa:', {
      message: event.reason.message,
      stack: event.reason.stack,
      name: event.reason.name
    });
  }
  
  // Verificar se é um erro de rede
  if (event.reason instanceof TypeError && 
      event.reason.message.includes('NetworkError')) {
    console.warn('Possível problema de rede detectado');
  }
  
  // Verificar problemas de dados
  if (event.reason && event.reason.message && 
      event.reason.message.includes('undefined is not')) {
    console.warn('Possível acesso a dados undefined detectado');
  }
});

// Detectar problemas de renderização React
window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ = window.__REACT_ERROR_OVERLAY_GLOBAL_HOOK__ || {};
const originalConsoleError = console.error;
console.error = function(...args) {
  // Capturar erros específicos do React
  if (args[0] && typeof args[0] === 'string') {
    if (args[0].includes('Invalid hook call')) {
      console.warn('ERRO CRÍTICO: Uso inválido de hook React detectado. Verifique chamadas de hooks em loops, condicionais ou componentes não-React.');
    }
    if (args[0].includes('Maximum update depth exceeded')) {
      console.warn('ERRO CRÍTICO: Profundidade máxima de atualização excedida. Possível loop infinito de renderização.');
    }
  }
  originalConsoleError.apply(console, args);
};

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