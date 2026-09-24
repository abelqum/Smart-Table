import { clienteApi } from "@/lib/api/clienteApi";
import { ENDPOINTS } from "@/lib/api/endpoints";

export function obtenerTurnos() {
  return clienteApi(ENDPOINTS.turnos.listar);
}

export function crearTurno(datos) {
  return clienteApi(ENDPOINTS.turnos.crear, {
    metodo: "POST",
    cuerpo: datos,
  });
}

export function cancelarTurno(idTurno) {
  return clienteApi(ENDPOINTS.turnos.cancelar(idTurno), {
    metodo: "POST",
  });
}
