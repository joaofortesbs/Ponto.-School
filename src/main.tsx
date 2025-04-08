import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TempoDevtools } from "tempo-devtools";
import { preloadAllComponents } from "./lib/preload";

// Inicializa o sistema de desenvolvimento
TempoDevtools.init();

// Pré-carrega todos os componentes antes mesmo de renderizar a aplicação
preloadAllComponents();

// Cria um evento personalizado para indicar que a aplicação está pronta
const appReadyEvent = new CustomEvent('appComponentsReady', { detail: { ready: true } });

// Renderiza a aplicação com carregamento instantâneo
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

// Dispara o evento de que os componentes estão prontos
document.dispatchEvent(appReadyEvent);
console.log('Aplicação inicializada com carregamento instantâneo de componentes.');
