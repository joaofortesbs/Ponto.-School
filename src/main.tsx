import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

// Simplificando a inicialização para evitar erros
console.log("Iniciando aplicação...");

// Renderiza a aplicação com carregamento direto
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

console.log('Aplicação inicializada.');
