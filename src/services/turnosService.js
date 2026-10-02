import { clienteApi } from "@/lib/api/clienteApi";
import { ENDPOINTS } from "@/lib/api/endpoints";

export function obtenerTurnos() {
  return clienteApi(ENDPOINTS.turnos.listar);
}

export function obtenerTurnoActual() {
  return clienteApi(ENDPOINTS.turnos.actual);
}

export function obtenerTurnosParaMesa(idMesa) {
  return clienteApi(ENDPOINTS.turnos.paraMesa(idMesa));
}

export function crearTurno(datos) {
  return clienteApi(ENDPOINTS.turnos.crear, {
    metodo: "POST",
    cuerpo: datos,
  });
}

export function actualizarTurno(idTurno, datos) {
  return clienteApi(ENDPOINTS.turnos.actualizar(idTurno), {
    metodo: "PATCH",
    cuerpo: datos,
  });
}

export function llamarTurno(idTurno) {
  return clienteApi(ENDPOINTS.turnos.llamar(idTurno), {
    metodo: "POST",
  });
}

export function cancelarTurno(idTurno) {
  return clienteApi(ENDPOINTS.turnos.cancelar(idTurno), {
    metodo: "POST",
  });
}
