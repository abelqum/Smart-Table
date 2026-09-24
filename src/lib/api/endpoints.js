/**
 * Endpoints oficiales de SmartTable.
 *
 * Este archivo representa el contrato entre:
 *
 * - Next.js
 * - Backend Express
 * - futura aplicación Android
 *
 * Cuando construyamos el backend deberemos respetar estas rutas.
 */
export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    perfil: "/auth/me",
  },

  dashboard: {
    resumen: "/dashboard/resumen",
  },

  restaurante: {
    obtener: "/restaurante",
    actualizar: "/restaurante",
  },

  pisos: {
    listar: "/pisos",
    crear: "/pisos",

    actualizar(idPiso) {
      return `/pisos/${idPiso}`;
    },

    eliminar(idPiso) {
      return `/pisos/${idPiso}`;
    },
  },

  mesas: {
    listar: "/mesas",
    crear: "/mesas",

    obtener(idMesa) {
      return `/mesas/${idMesa}`;
    },

    actualizar(idMesa) {
      return `/mesas/${idMesa}`;
    },

    eliminar(idMesa) {
      return `/mesas/${idMesa}`;
    },

    asignar(idMesa) {
      return `/mesas/${idMesa}/asignar`;
    },

    clientesRetirados(idMesa) {
      return `/mesas/${idMesa}/clientes-retirados`;
    },

    iniciarLimpieza(idMesa) {
      return `/mesas/${idMesa}/limpieza/iniciar`;
    },

    finalizarLimpieza(idMesa) {
      return `/mesas/${idMesa}/limpieza/finalizar`;
    },
  },

  turnos: {
    listar: "/turnos",
    crear: "/turnos",

    cancelar(idTurno) {
      return `/turnos/${idTurno}/cancelar`;
    },
  },

  eventos: {
    listar: "/eventos",
  },
};
