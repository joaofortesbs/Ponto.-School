import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import './lib/username-initializer.ts'
import { preInitializeWebNodes } from './lib/web-persistence.ts'

// PRIORIDADE MÁXIMA: Inicializar teias antes de qualquer outro código
// Esta função é executada imediatamente e de forma confiável
function inicializarTeiasComPrioridadeMaxima() {
  console.log("Inicializando sistema de teias com prioridade máxima");
  
  try {
    // Definir variável global para indicar que a inicialização começou
    window.__teiasStarted = true;
    
    // Executar a pré-inicialização sincronamente
    preInitializeWebNodes();
    
    // Verificar se estamos em uma página de autenticação
    const isAuthPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
    if (isAuthPage) {
      console.log("Página de autenticação detectada, preparando teias prioritárias");
      
      // Adicionar classe ao body para estilização imediata
      document.body.classList.add('auth-page-loading');
      
      // Criar e adicionar estilo temporário para garantir fundo visível
      const style = document.createElement('style');
      style.textContent = `
        .auth-page-loading {
          background: linear-gradient(135deg, rgba(0,0,0,1) 0%, rgba(10,5,0,0.95) 100%);
        }
        
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(0,0,0,0.98) 0%, rgba(26,13,0,0.95) 100%);
          z-index: -1;
        }
        
        /* Adicionar fade-in para o corpo da página */
        body {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
      
      // Remover o estilo quando a aplicação estiver carregada
      window.addEventListener('load', () => {
        setTimeout(() => {
          document.body.classList.remove('auth-page-loading');
          // Manter o estilo por um tempo para garantir transição suave
          setTimeout(() => {
            style.remove();
          }, 500);
        }, 300);
      });
      
      // Garantir que o evento de teias prontas seja disparado
      requestAnimationFrame(() => {
        document.dispatchEvent(new CustomEvent('WebTeiasProntas'));
      });
    }
    
    // Marcar como inicializado
    window.__teiasInitialized = true;
  } catch (error) {
    console.error("Erro na inicialização das teias:", error);
    
    // Mesmo em caso de erro, garantimos a renderização
    requestAnimationFrame(() => {
      document.dispatchEvent(new CustomEvent('WebTeiasProntas'));
    });
  }
}

// Executar inicialização prioritária imediatamente
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

// Função para inicializar a aplicação com tratamento de erros
const initializeApp = () => {
  try {
    const rootElement = document.getElementById("root");

    if (!rootElement) {
      throw new Error("Elemento root não encontrado");
    }

    // Renderizar a aplicação com tratamento de erros
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ErrorBoundary>
      </React.StrictMode>,
    );

    console.log('Aplicação inicializada com sucesso.');
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