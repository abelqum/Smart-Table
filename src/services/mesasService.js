import { clienteApi } from "@/lib/api/clienteApi";
import { ENDPOINTS } from "@/lib/api/endpoints";

export function obtenerMesas(pisoId = null) {
  const endpoint = pisoId
    ? `${ENDPOINTS.mesas.listar}?pisoId=${pisoId}`
    : ENDPOINTS.mesas.listar;

  return clienteApi(endpoint);
}

export function obtenerMesa(idMesa) {
  return clienteApi(ENDPOINTS.mesas.obtener(idMesa));
}

export function crearMesa(datos) {
  return clienteApi(ENDPOINTS.mesas.crear, {
    metodo: "POST",
    cuerpo: datos,
  });
}

export function actualizarMesa(idMesa, datos) {
  return clienteApi(ENDPOINTS.mesas.actualizar(idMesa), {
    metodo: "PATCH",
    cuerpo: datos,
  });
}

export function eliminarMesa(idMesa) {
  return clienteApi(ENDPOINTS.mesas.eliminar(idMesa), {
    metodo: "DELETE",
  });
}

/**
 * Asigna un turno a una mesa.
 *
 * permitirExcesoCapacidad:
 *
 * false:
 * El grupo debe tener una cantidad de personas menor
 * o igual a la capacidad configurada.
 *
 * true:
 * Permite una excepción manual autorizada por la hostess.
 *
 * El backend será siempre la autoridad final para validar
 * esta regla.
 */
export function asignarTurnoAMesa(
  idMesa,
  idTurno,
  { permitirExcesoCapacidad = false } = {},
) {
  return clienteApi(ENDPOINTS.mesas.asignar(idMesa), {
    metodo: "POST",

    cuerpo: {
      turnoId: idTurno,
      permitirExcesoCapacidad,
    },
  });
}

export function registrarSalidaClientes(idMesa) {
  return clienteApi(ENDPOINTS.mesas.clientesRetirados(idMesa), {
    metodo: "POST",
  });
}

export function iniciarLimpiezaMesa(idMesa) {
  return clienteApi(ENDPOINTS.mesas.iniciarLimpieza(idMesa), {
    metodo: "POST",
  });
}

export function finalizarLimpiezaMesa(idMesa) {
  return clienteApi(ENDPOINTS.mesas.finalizarLimpieza(idMesa), {
    metodo: "POST",
  });
}
