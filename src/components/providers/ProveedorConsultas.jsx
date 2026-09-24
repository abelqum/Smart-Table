"use client";

import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Proveedor global de TanStack Query.
 *
 * Las consultas HTTP y su caché serán compartidas
 * por toda la aplicación.
 */
export default function ProveedorConsultas({ children }) {
  const [clienteConsultas] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            refetchOnWindowFocus: false,
          },

          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={clienteConsultas}>
      {children}
    </QueryClientProvider>
  );
}
