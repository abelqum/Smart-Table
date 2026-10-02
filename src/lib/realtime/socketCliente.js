import { io } from "socket.io-client";

const URL_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const URL_SOCKET =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? URL_API.replace(/\/api\/?$/, "");

let socketCliente = null;

let tokenUtilizado = null;

function crearSocket() {
  return io(URL_SOCKET, {
    /*
     * Esperamos hasta tener el JWT.
     */
    autoConnect: false,

    /*
     * Dejamos que Socket.IO utilice su estrategia
     * normal:
     *
     * polling
     * ↓
     * upgrade a WebSocket
     *
     * Es más estable durante desarrollo que
     * obligar al navegador a iniciar directamente
     * con WebSocket.
     */
    reconnection: true,

    reconnectionAttempts: Infinity,

    reconnectionDelay: 1000,

    reconnectionDelayMax: 5000,

    timeout: 10000,
  });
}

export function conectarSocket(token) {
  if (!token) {
    return null;
  }

  if (!socketCliente) {
    socketCliente = crearSocket();
  }

  /*
   * Si cambia el JWT porque inició sesión
   * otro usuario, debemos autenticar nuevamente
   * la conexión.
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

export function obtenerSocket() {
  return socketCliente;
}

export function desconectarSocket() {
  if (!socketCliente) {
    return;
  }

  socketCliente.disconnect();

  socketCliente = null;

  tokenUtilizado = null;
}
