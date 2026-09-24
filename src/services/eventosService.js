import { clienteApi } from "@/lib/api/clienteApi";
import { ENDPOINTS } from "@/lib/api/endpoints";

export function obtenerEventos() {
  return clienteApi(ENDPOINTS.eventos.listar);
}
