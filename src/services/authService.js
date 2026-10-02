import { clienteApi } from "@/lib/api/clienteApi";

import { ENDPOINTS } from "@/lib/api/endpoints";

export function iniciarSesion(credenciales) {
  return clienteApi(ENDPOINTS.auth.login, {
    metodo: "POST",

    cuerpo: credenciales,
  });
}

export function obtenerPerfil() {
  return clienteApi(ENDPOINTS.auth.perfil);
}

export function actualizarMiPerfil(datos) {
  return clienteApi(ENDPOINTS.auth.actualizarPerfil, {
    metodo: "PATCH",

    cuerpo: datos,
  });
}

export function cambiarContrasena(datos) {
  return clienteApi(ENDPOINTS.auth.cambiarContrasena, {
    metodo: "PATCH",

    cuerpo: datos,
  });
}
