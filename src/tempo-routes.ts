
import { RouteObject } from "react-router-dom";
import React from "react";
import { Routes } from "@tempotbh/core";
import PublicActivityPage from "./pages/atividade/[id]";

// Função lazy helper
const lazy = (importFunc: () => Promise<any>) => React.lazy(importFunc);

export const routes: RouteObject[] = [
  {
    path: '/fluxograma/:title/:username/:userId',
    element: React.lazy(() => import('./pages/fluxograma/[title]/[username]/[userId]')),
  },
  {
    path: "/profile",
    element: lazy(() => import("./pages/profile"))
  },
  // Página pública de atividade (DEVE estar ANTES de outras rotas protegidas)
  {
    path: "/atividade/:id/:code?",
    element: PublicActivityPage
  },
  // Outras rotas da aplicação (protegidas)
  {
    path: "/",
    element: lazy(() => import("./components/home"))
  },
  {
    path: "/dashboard",
    element: lazy(() => import("./pages/dashboard"))
  }
];

export default routes;
