"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/*
 * Reglas básicas del formulario.
 *
 * El backend deberá volver a validar estos datos.
 * La validación del frontend nunca sustituye la del servidor.
 */
const esquemaPiso = z.object({
  nombre: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(60, "El nombre no puede superar 60 caracteres."),
});

export default function FormularioPiso({
  valoresIniciales = null,
  onGuardar,
  onCancelar,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquemaPiso),

    defaultValues: {
      nombre: valoresIniciales?.nombre ?? "",
    },
  });

  async function enviarFormulario(datos) {
    await onGuardar({
      nombre: datos.nombre.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit(enviarFormulario)} className="space-y-5">
      <div>
        <label
          htmlFor="nombrePiso"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Nombre del piso o zona
        </label>

        <input
          id="nombrePiso"
          type="text"
          placeholder="Ej. Planta baja"
          {...register("nombre")}
          className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />

        {errors.nombre && (
          <p className="mt-2 text-xs font-medium text-rose-600">
            {errors.nombre.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Guardando..."
            : valoresIniciales
              ? "Guardar cambios"
              : "Crear piso"}
        </button>
      </div>
    </form>
  );
}
