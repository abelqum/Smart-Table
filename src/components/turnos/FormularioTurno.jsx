"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/*
 * Reglas del formulario.
 */
const esquemaTurno = z.object({
  nombre: z.string().trim().min(2, "Ingresa el nombre del cliente."),

  personas: z.coerce
    .number()
    .int("La cantidad debe ser un número entero.")
    .min(1, "Debe existir al menos una persona.")
    .max(30, "El máximo permitido es de 30 personas."),
});

export default function FormularioTurno({ onRegistrar, onCancelar }) {
  const {
    register,
    handleSubmit,
    reset,

    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquemaTurno),

    defaultValues: {
      nombre: "",
      personas: 2,
    },
  });

  async function enviarFormulario(datos) {
    const resultado = await onRegistrar(datos);

    /*
     * Si el componente padre no devuelve false,
     * consideramos exitoso el registro.
     */
    if (resultado !== false) {
      reset();
    }
  }

  function cancelarFormulario() {
    reset();

    if (onCancelar) {
      onCancelar();
    }
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
          placeholder="Ej. Gerardo"
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

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        {onCancelar && (
          <button
            type="button"
            onClick={cancelarFormulario}
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
          {isSubmitting ? "Registrando..." : "Registrar turno"}
        </button>
      </div>
    </form>
  );
}
