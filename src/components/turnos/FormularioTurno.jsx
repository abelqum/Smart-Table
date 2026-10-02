"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

const esquemaTurno = z.object({
  nombre: z.string().trim().min(2, "Ingresa el nombre del cliente."),

  personas: z.coerce
    .number()
    .int("La cantidad debe ser un número entero.")
    .min(1, "Debe existir al menos una persona.")
    .max(30, "El máximo permitido es de 30 personas."),

  pisoPreferidoId: z.string().optional(),
});

export default function FormularioTurno({
  pisos = [],
  turnoInicial = null,
  onGuardar,
  onCancelar,
}) {
  const esEdicion = Boolean(turnoInicial);

  const {
    register,
    handleSubmit,

    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquemaTurno),

    defaultValues: {
      nombre: turnoInicial?.nombre ?? "",

      personas: turnoInicial?.personas ?? 2,

      pisoPreferidoId: turnoInicial?.pisoPreferidoId
        ? String(turnoInicial.pisoPreferidoId)
        : "",
    },
  });

  async function enviarFormulario(datos) {
    return onGuardar({
      nombre: datos.nombre,

      personas: datos.personas,

      pisoPreferidoId: datos.pisoPreferidoId
        ? Number(datos.pisoPreferidoId)
        : null,
    });
  }

  return (
    <form onSubmit={handleSubmit(enviarFormulario)} className="space-y-5">
      <div>
        <label
          htmlFor="nombre"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Nombre del cliente
        </label>

        <input
          id="nombre"
          type="text"
          placeholder="Ej. Carlos"
          {...register("nombre")}
          className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />

        {errors.nombre && (
          <p className="mt-2 text-xs font-medium text-rose-600">
            {errors.nombre.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="personas"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Número de personas
        </label>

        <input
          id="personas"
          type="number"
          min="1"
          max="30"
          {...register("personas")}
          className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />

        {errors.personas && (
          <p className="mt-2 text-xs font-medium text-rose-600">
            {errors.personas.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="pisoPreferidoId"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Preferencia de zona
        </label>

        <select
          id="pisoPreferidoId"
          {...register("pisoPreferidoId")}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        >
          <option value="">Sin preferencia</option>

          {pisos.map((piso) => (
            <option key={piso.id} value={piso.id}>
              {piso.nombre}
            </option>
          ))}
        </select>

        <p className="mt-2 text-xs leading-5 text-slate-400">
          La preferencia ayuda al personal a organizar la espera, pero no obliga
          a asignar al cliente a esa zona.
        </p>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Guardando..."
            : esEdicion
              ? "Guardar cambios"
              : "Registrar turno"}
        </button>
      </div>
    </form>
  );
}
