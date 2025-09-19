import { RouteObject } from "react-router-dom";
import React from "react";
import { Routes } from "@tempotbh/core";
import PublicActivityPage from "./pages/atividade/[id]";

export const routes: RouteObject[] = [
  {
    path: '/fluxograma/:title/:username/:userId',
    element: React.lazy(() => import('./pages/fluxograma/[title]/[username]/[userId]')),
  },
  {
    path: "/profile",
    element: lazy(() => import("./pages/profile"))
  },
  // Página pública de atividade (com código único opcional)
  {
    path: "/atividade/:id/:code?",
    element: PublicActivityPage
  },
];

export default routes;