"use client";

import { useEffect } from "react";

import useRestauranteStore from "@/stores/useRestauranteStore";

/**
 * Reactiva el estado persistido de Zustand cuando la aplicación
 * ya se encuentra ejecutándose en el navegador.
 *
 * Esto evita conflictos entre el renderizado del servidor de Next
 * y localStorage, que únicamente existe en el navegador.
 */
export default function SincronizadorEstadoLocal() {
  useEffect(() => {
    useRestauranteStore.persist.rehydrate();
  }, []);

  return null;
}
