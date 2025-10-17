import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from "@/components/ui/toaster";
import { UsernameProvider } from './context/UsernameContext';
import { ThemeProvider } from './context/ThemeContext';
import { preInitializeWebNodes } from './lib/web-persistence';
import { preloadIcons } from './lib/icons-preloader';

const queryClient = new QueryClient();

console.log("Iniciando aplicação...");

// Pré-inicializar as teias antes de tudo
preInitializeWebNodes();

// Pré-carregar ícones no localStorage
preloadIcons().catch(error => {
  console.error('Erro ao pré-carregar ícones:', error);
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemento root não encontrado");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <UsernameProvider>
          <ThemeProvider>
            <App />
            <Toaster />
          </ThemeProvider>
        </UsernameProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);