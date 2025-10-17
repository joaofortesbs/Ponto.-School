import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from "./App.tsx";
import { UsernameProvider } from './components/UsernameProvider';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from "@/components/ui/toaster";
import { preInitializeWebNodes } from './lib/web-persistence';
import { preloadIcons } from './lib/icons-preloader';
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

console.log("🚀 Iniciando aplicação Ponto School...");

// Pré-inicializar as teias antes de tudo
preInitializeWebNodes();

// Pré-carregar ícones no localStorage
preloadIcons().catch(error => {
  console.error('❌ Erro ao pré-carregar ícones:', error);
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("❌ Elemento root não encontrado");
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