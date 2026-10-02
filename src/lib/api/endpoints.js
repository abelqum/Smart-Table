export const ENDPOINTS = {
  auth: {
    login: "/auth/login",

    perfil: "/auth/me",

    actualizarPerfil: "/auth/me",

    cambiarContrasena: "/auth/me/contrasena",
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

    actual: "/turnos/actual",

    paraMesa(idMesa) {
      return `/turnos/para-mesa/${idMesa}`;
    },

    actualizar(idTurno) {
      return `/turnos/${idTurno}`;
    },

    llamar(idTurno) {
      return `/turnos/${idTurno}/llamar`;
    },

    cancelar(idTurno) {
      return `/turnos/${idTurno}/cancelar`;
    },
  },

  usuarios: {
    listar: "/usuarios",

    crear: "/usuarios",

    actualizar(idUsuario) {
      return `/usuarios/${idUsuario}`;
    },

    restablecerContrasena(idUsuario) {
      return `/usuarios/${idUsuario}/restablecer-contrasena`;
    },
  },

  eventos: {
    listar: "/eventos",
  },
};
