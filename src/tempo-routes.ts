
import { RouteObject } from "react-router-dom";
import React from "react";

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
  // Rotas da aplicação (protegidas)
  {
    path: "/",
    element: lazy(() => import("./components/home"))
  },
  {
    path: "/dashboard",
    element: lazy(() => import("./pages/dashboard"))
  },
  {
    path: "/school-power",
    element: lazy(() => import("./pages/school-power"))
  },
  {
    path: "/atividade/:id/:code?",
    element: lazy(() => import("./pages/atividade/[id]"))
  }
];

export default routes;tes;
