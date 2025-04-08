import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { LogoManager } from "./components/LogoManager";

// Simplificando a inicialização para evitar erros
console.log("Iniciando aplicação...");

// Garantir que o elemento root existe
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Elemento root não encontrado no DOM!");
} else {
  // Inicializar a logo antes de renderizar a aplicação
  window.PONTO_SCHOOL_CONFIG = {
    defaultLogo: "/images/logo-oficial.png",
    logoLoaded: true,
    logoVersion: 1,
  };

  // Renderiza a aplicação com carregamento direto
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <LogoManager />
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  );

  console.log('Aplicação inicializada.');
}
