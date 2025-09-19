import { RouteObject } from "react-router-dom";
import React from "react";

export const routes: RouteObject[] = [
  {
    path: '/fluxograma/:title/:username/:userId',
    element: React.lazy(() => import('./pages/fluxograma/[title]/[username]/[userId]')),
  },
];

export default routes;