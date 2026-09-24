import { combinarClases } from "@/lib/clases";

/*
 * Cada tono contiene clases completas de Tailwind.
 *
 * Evitamos construir dinámicamente clases como:
 *
 * bg-${color}-100
 *
 * porque Tailwind necesita poder detectar las clases utilizadas
 * durante el proceso de compilación.
 */
const estilosPorTono = {
  verde: {
    fondoIcono: "bg-emerald-50",
    colorIcono: "text-emerald-600",
  },

  rojo: {
    fondoIcono: "bg-rose-50",
    colorIcono: "text-rose-600",
  },

  amarillo: {
    fondoIcono: "bg-amber-50",
    colorIcono: "text-amber-600",
  },

  azul: {
    fondoIcono: "bg-sky-50",
    colorIcono: "text-sky-600",
  },
};

/**
 * Tarjeta utilizada para presentar indicadores generales
 * dentro del dashboard.
 */
export default function TarjetaResumen({
  titulo,
  valor,
  descripcion,
  icono: Icono,
  tono = "verde",
}) {
  const estilo = estilosPorTono[tono] ?? estilosPorTono.verde;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{titulo}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {valor}
          </p>
        </div>

        <div
          className={combinarClases(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            estilo.fondoIcono,
            estilo.colorIcono,
          )}
        >
          <Icono size={21} />
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">{descripcion}</p>
    </article>
  );
}
