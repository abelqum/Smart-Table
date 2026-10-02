import { clienteApi } from "@/lib/api/clienteApi";

import { ENDPOINTS } from "@/lib/api/endpoints";

export function obtenerUsuarios() {
  return clienteApi(ENDPOINTS.usuarios.listar);
}

export function crearUsuario(datos) {
  return clienteApi(ENDPOINTS.usuarios.crear, {
    metodo: "POST",

    cuerpo: datos,
  });
}

export function actualizarUsuario(idUsuario, datos) {
  return clienteApi(ENDPOINTS.usuarios.actualizar(idUsuario), {
    metodo: "PATCH",

    cuerpo: datos,
  });
}

export function restablecerContrasenaUsuario(idUsuario, nuevaContrasena) {
  return clienteApi(ENDPOINTS.usuarios.restablecerContrasena(idUsuario), {
    metodo: "POST",

    cuerpo: {
      nuevaContrasena,
    },
  });
}
