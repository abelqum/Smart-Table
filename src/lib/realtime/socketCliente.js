import { io } from "socket.io-client";

const URL_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const URL_SOCKET =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? URL_API.replace(/\/api\/?$/, "");

let socketCliente = null;

let tokenUtilizado = null;

/**
 * Crea la instancia de Socket.IO.
 *
 * Se utiliza autoConnect=false porque primero
 * debemos colocar el JWT en el handshake.
 */
function crearSocket() {
  return io(URL_SOCKET, {
    autoConnect: false,

    reconnection: true,

    reconnectionAttempts: Infinity,

    reconnectionDelay: 1000,

    reconnectionDelayMax: 5000,

    timeout: 10000,
  });
}

/**
 * Inicia la conexión en tiempo real utilizando
 * el mismo JWT de la API REST.
 */
export function conectarSocket(token) {
  if (!token) {
    return null;
  }

  if (!socketCliente) {
    socketCliente = crearSocket();
  }

  /*
   * Si cambia el JWT, debemos actualizar
   * la autenticación del handshake.
   */
  if (tokenUtilizado !== token) {
    if (socketCliente.connected) {
      socketCliente.disconnect();
    }

    tokenUtilizado = token;

    socketCliente.auth = {
      token,
    };
  }

  if (!socketCliente.connected) {
    socketCliente.connect();
  }

  return socketCliente;
}

/**
 * Permite consultar la instancia actual
 * cuando otro módulo necesita conocerla.
 */
export function obtenerSocket() {
  return socketCliente;
}

/**
 * Finaliza por completo la conexión.
 *
 * Al colocar la referencia en null garantizamos
 * que una futura sesión cree un socket nuevo.
 */
export function desconectarSocket() {
  if (!socketCliente) {
    return;
  }

  socketCliente.disconnect();

  socketCliente = null;

  tokenUtilizado = null;
}
