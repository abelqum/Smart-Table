const CLAVE_TOKEN = "smarttable-token";

/**
 * Guarda el token entregado por la API.
 *
 * Para el Prototipo 1 usamos localStorage.
 * Cuando implementemos autenticación definitiva podremos
 * revisar si migramos a cookies HttpOnly.
 */
export function guardarTokenSesion(token) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(CLAVE_TOKEN, token);
}

/**
 * Obtiene el token de la sesión actual.
 */
export function obtenerTokenSesion() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(CLAVE_TOKEN);
}

/**
 * Elimina exclusivamente la sesión.
 *
 * No borra los datos de demostración almacenados
 * por nuestra API Mock.
 */
export function eliminarTokenSesion() {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(CLAVE_TOKEN);
}
