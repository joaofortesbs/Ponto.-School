import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

// Melhorando a inicialização da aplicação
console.log("Iniciando aplicação...");

// Função para garantir que o DOM esteja carregado
const initApp = () => {
  try {
    const rootElement = document.getElementById("root");
    
    if (!rootElement) {
      console.error("Elemento root não encontrado. Tentando novamente em 100ms...");
      setTimeout(initApp, 100);
      return;
    }
    
    // Renderizar a aplicação
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
    
    console.log('Aplicação inicializada com sucesso.');
  } catch (error) {
    console.error("Erro ao inicializar aplicação:", error);
    console.log("Tentando novamente em 500ms...");
    setTimeout(initApp, 500);
  }
};

// Iniciar a aplicação após o DOM carregar completamente
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  // DOM já carregado, inicializar imediatamente
  initApp();
}

// Fallback para iniciar mesmo que outros métodos falhem
setTimeout(() => {
  if (!window.appInitialized) {
    console.log("Inicialização de fallback após timeout");
    initApp();
  }
}, 1000);
