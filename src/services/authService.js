import { clienteApi } from "@/lib/api/clienteApi";
import { ENDPOINTS } from "@/lib/api/endpoints";

/**
 * POST /api/auth/login
 */
export function iniciarSesion(credenciales) {
  return clienteApi(ENDPOINTS.auth.login, {
    metodo: "POST",
    cuerpo: credenciales,
  });
}

/**
 * GET /api/auth/me
 *
 * El clienteApi agrega automáticamente:
 *
 * Authorization: Bearer <token>
 */
export function obtenerPerfil() {
  return clienteApi(ENDPOINTS.auth.perfil);
}
