import { clienteApi } from "@/lib/api/clienteApi";
import { ENDPOINTS } from "@/lib/api/endpoints";

export function obtenerRestaurante() {
  return clienteApi(ENDPOINTS.restaurante.obtener);
}

export function actualizarRestaurante(datos) {
  return clienteApi(ENDPOINTS.restaurante.actualizar, {
    metodo: "PATCH",
    cuerpo: datos,
  });
}
