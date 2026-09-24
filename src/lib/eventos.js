/**
 * Traduce los tipos técnicos de eventos que utiliza la API
 * a nombres apropiados para la interfaz.
 *
 * Conservamos los códigos técnicos porque serán útiles
 * posteriormente en backend, estadísticas y filtros.
 */
const configuracionEventos = {
  WAITLIST_CREATED: {
    nombre: "Turno registrado",
    clases: "bg-sky-50 text-sky-700 border-sky-200",
  },

  WAITLIST_CANCELLED: {
    nombre: "Turno cancelado",
    clases: "bg-slate-100 text-slate-600 border-slate-200",
  },

  TABLE_ASSIGNED: {
    nombre: "Mesa asignada",
    clases: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  TABLE_ASSIGNED_CAPACITY_OVERRIDE: {
    nombre: "Asignación con excepción",
    clases: "bg-amber-50 text-amber-700 border-amber-200",
  },

  CUSTOMERS_LEFT: {
    nombre: "Clientes se retiraron",
    clases: "bg-orange-50 text-orange-700 border-orange-200",
  },

  CLEANING_STARTED: {
    nombre: "Limpieza iniciada",
    clases: "bg-violet-50 text-violet-700 border-violet-200",
  },

  CLEANING_FINISHED: {
    nombre: "Limpieza finalizada",
    clases: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

export function obtenerConfiguracionEvento(tipo) {
  return (
    configuracionEventos[tipo] ?? {
      nombre: "Evento",
      clases: "bg-slate-100 text-slate-600 border-slate-200",
    }
  );
}
