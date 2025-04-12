import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import './lib/username-initializer.ts'
import { preInitializeWebNodes } from './lib/web-persistence.ts'

// PRIORIDADE MÁXIMA: Inicializar teias antes de qualquer outro código
// Esta função é executada imediatamente, antes mesmo da montagem do React
(function inicializarTeiasComPrioridadeMaxima() {
  console.log("Inicializando sistema de teias com prioridade máxima");
  
  // Executa sincronamente para garantir disponibilidade imediata
  preInitializeWebNodes();
  
  // Método alternativo para garantir disponibilidade em páginas de autenticação
  if (window.location.pathname.includes('/login') || window.location.pathname.includes('/register')) {
    console.log("Página de autenticação detectada, preparando teias prioritárias");
    
    // Adiciona um estilo global temporário para garantir que o container das teias seja visível imediatamente
    const style = document.createElement('style');
    style.textContent = `
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, rgba(0,20,39,0.9) 0%, rgba(41,51,92,0.9) 100%);
        z-index: -1;
      }
    `;
    document.head.appendChild(style);
    
    // Remover o estilo quando a aplicação real estiver carregada
    window.addEventListener('load', () => {
      setTimeout(() => {
        style.remove();
      }, 500);
    });
  }
})();

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

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>,
    );

    console.log('Aplicação inicializada com sucesso.');
  } catch (error) {
    console.error("Erro ao inicializar aplicação:", error);

    // Tentar renderizar uma versão mínima da aplicação
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="font-family: system-ui, sans-serif; padding: 2rem; text-align: center;">
          <h1>Erro ao carregar aplicação</h1>
          <p>Ocorreu um erro ao inicializar a aplicação. Tente recarregar a página.</p>
          <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; margin-top: 1rem; cursor: pointer;">
            Recarregar
          </button>
        </div>
      `;
    }
  }
};

// Inicializar a aplicação
initializeApp();