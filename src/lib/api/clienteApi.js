import { ejecutarApiMock } from "@/mocks/apiMock";
import { obtenerTokenSesion } from "@/lib/auth/sesion";

const URL_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const USAR_API_MOCK = process.env.NEXT_PUBLIC_USAR_API_MOCK === "true";

/**
 * Cliente HTTP oficial del frontend SmartTable.
 *
 * Todas las peticiones de la aplicación pasan por aquí.
 *
 * Actualmente:
 *
 * service
 *   ↓
 * clienteApi
 *   ↓
 * API Mock
 *
 * Posteriormente:
 *
 * service
 *   ↓
 * clienteApi
 *   ↓
 * Express
 *   ↓
 * PostgreSQL
 */
export async function clienteApi(endpoint, opciones = {}) {
  const {
    metodo = "GET",
    cuerpo = null,

    /*
     * Permite proporcionar manualmente un token si alguna
     * operación futura lo requiere.
     *
     * Normalmente se utiliza automáticamente la sesión actual.
     */
    token = null,
  } = opciones;

  const tokenSesion = token ?? obtenerTokenSesion();

  /*
   * API simulada.
   */
  if (USAR_API_MOCK) {
    const datosMock = await ejecutarApiMock({
      endpoint,
      metodo,
      cuerpo,
      token: tokenSesion,
    });

    /*
     * Una respuesta HTTP real entrega nuevos objetos
     * deserializados desde JSON.
     *
     * structuredClone evita que React comparta referencias
     * directamente con nuestra base de datos simulada.
     */
    return structuredClone(datosMock);
  }

  /*
   * API real.
   */
  const respuesta = await fetch(`${URL_API}${endpoint}`, {
    method: metodo,

    headers: {
      "Content-Type": "application/json",

      ...(tokenSesion
        ? {
            Authorization: `Bearer ${tokenSesion}`,
          }
        : {}),
    },

    body: cuerpo !== null ? JSON.stringify(cuerpo) : undefined,
  });

  let datos = null;

  const tipoContenido = respuesta.headers.get("content-type");

  if (tipoContenido?.includes("application/json")) {
    datos = await respuesta.json();
  }

  if (!respuesta.ok) {
    const error = new Error(
      datos?.mensaje ?? "Ocurrió un error al comunicarse con el servidor.",
    );

    /*
     * Conservar el código HTTP permitirá distinguir:
     *
     * 401 → sesión inválida
     * 403 → sin permisos
     * 404 → recurso inexistente
     * 500 → error del servidor
     */
    error.status = respuesta.status;

    throw error;
  }

  return datos;
}
