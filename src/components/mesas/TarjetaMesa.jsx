import { Users } from "lucide-react";

import { combinarClases } from "@/lib/clases";

/*
 * Configuración visual de cada estado.
 *
 * Los códigos internos permanecen en inglés para mantener
 * consistencia posteriormente con backend y Android.
 */
const configuracionEstados = {
  AVAILABLE: {
    nombre: "Disponible",
    fondo: "bg-emerald-50",
    borde: "border-emerald-200",
    indicador: "bg-emerald-500",
    texto: "text-emerald-700",
  },

  OCCUPIED: {
    nombre: "Ocupada",
    fondo: "bg-rose-50",
    borde: "border-rose-200",
    indicador: "bg-rose-500",
    texto: "text-rose-700",
  },

  DIRTY: {
    nombre: "Pendiente de limpieza",
    fondo: "bg-amber-50",
    borde: "border-amber-200",
    indicador: "bg-amber-500",
    texto: "text-amber-700",
  },

  CLEANING: {
    nombre: "En limpieza",
    fondo: "bg-orange-50",
    borde: "border-orange-200",
    indicador: "bg-orange-500",
    texto: "text-orange-700",
  },

  BLOCKED: {
    nombre: "Bloqueada",
    fondo: "bg-slate-100",
    borde: "border-slate-300",
    indicador: "bg-slate-500",
    texto: "text-slate-600",
  },
};

export default function TarjetaMesa({
  numero,
  capacidad,
  estado,
  turnoAsignado = null,
  seleccionada = false,
  onClick,
}) {
  const configuracion =
    configuracionEstados[estado] ?? configuracionEstados.BLOCKED;

  return (
    <button
      type="button"
      onClick={onClick}
      className={combinarClases(
        "relative min-h-36 w-full rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-md",
        configuracion.fondo,
        configuracion.borde,
        seleccionada && "ring-2 ring-slate-900 ring-offset-2",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            Mesa
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">{numero}</p>
        </div>

        <span
          className={combinarClases(
            "h-3 w-3 rounded-full",
            configuracion.indicador,
          )}
        />
      </div>

      {turnoAsignado && (
        <div className="mt-3 rounded-lg bg-white/70 px-2.5 py-2">
          <p className="text-xs font-semibold text-slate-700">
            {turnoAsignado.turno} · {turnoAsignado.nombre}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-500">
            {turnoAsignado.personas} personas
          </p>
        </div>
      )}

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Users size={15} />

          <span>
            {capacidad} {capacidad === 1 ? "persona" : "personas"}
          </span>
        </div>

        <span
          className={combinarClases(
            "max-w-28 text-right text-xs font-semibold",
            configuracion.texto,
          )}
        >
          {configuracion.nombre}
        </span>
      </div>
    </button>
  );
}
