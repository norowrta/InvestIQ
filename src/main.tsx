import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

import "./components/css/variables.css";
import "./components/css/reset.css";
import "./components/css/main.css";

import App from "./App";
import Auth from "./components/pages/Auth/Auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./components/pages/dashboard/Dashboard";
import Reports from "./components/pages/reports/Reports";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: React.createElement(App),
      children: [
        {
          path: "auth",
          element: React.createElement(Auth),
        },
        {
          element: React.createElement(ProtectedRoute),
          children: [
            {
              index: true,
              element: React.createElement(Dashboard),
            },
            {
              path: "reports",
              element: React.createElement(Reports),
            },
          ],
        },
        {
          path: "*",
          element: React.createElement("div", null, "Page not found (404)"),
        },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  },
);

createRoot(document.getElementById("root")!).render(
  React.createElement(
    StrictMode,
    null,
    React.createElement(RouterProvider, { router }),
  ),
);
