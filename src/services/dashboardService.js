import { clienteApi } from "@/lib/api/clienteApi";
import { ENDPOINTS } from "@/lib/api/endpoints";

export function obtenerResumenDashboard() {
  return clienteApi(ENDPOINTS.dashboard.resumen);
}
