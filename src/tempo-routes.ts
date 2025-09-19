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
  {
    path: "/atividade/:id",
    element: PublicActivityPage
  },
];

export default routes;