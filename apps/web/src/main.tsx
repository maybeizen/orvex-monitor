import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ToastProvider } from "@orvex/ui";

import { AuthProvider } from "@/components/auth/AuthProvider";
import { queryClient } from "@/lib/query-client";

import { App } from "./app";
import "./index.css";

const root = document.querySelector("#root");
if (root === null) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
