import { clienteApi } from "@/lib/api/clienteApi";
import { ENDPOINTS } from "@/lib/api/endpoints";

export function obtenerPisos() {
  return clienteApi(ENDPOINTS.pisos.listar);
}

export function crearPiso(datos) {
  return clienteApi(ENDPOINTS.pisos.crear, {
    metodo: "POST",
    cuerpo: datos,
  });
}

export function actualizarPiso(idPiso, datos) {
  return clienteApi(ENDPOINTS.pisos.actualizar(idPiso), {
    metodo: "PATCH",
    cuerpo: datos,
  });
}

export function eliminarPiso(idPiso) {
  return clienteApi(ENDPOINTS.pisos.eliminar(idPiso), {
    metodo: "DELETE",
  });
}
