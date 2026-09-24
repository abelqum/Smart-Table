"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const esquemaMesa = z.object({
  numero: z
    .string()
    .trim()
    .min(1, "Ingresa el número o identificador de la mesa.")
    .max(20, "El identificador es demasiado largo."),

  capacidad: z.coerce
    .number()
    .int("La capacidad debe ser un número entero.")
    .min(1, "La mesa debe admitir al menos una persona.")
    .max(30, "La capacidad máxima permitida es 30."),

  pisoId: z.coerce.number().min(1, "Selecciona un piso."),

  forma: z.enum(["RECTANGLE", "ROUND"]),
});

export default function FormularioMesa({
  pisos,
  valoresIniciales = null,
  onGuardar,
  onCancelar,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquemaMesa),

    defaultValues: {
      numero: valoresIniciales?.numero ?? "",

      capacidad: valoresIniciales?.capacidad ?? 4,

      pisoId: valoresIniciales?.pisoId ?? pisos[0]?.id ?? "",

      forma: valoresIniciales?.forma ?? "RECTANGLE",
    },
  });

  async function enviarFormulario(datos) {
    await onGuardar({
      numero: datos.numero.trim(),

      capacidad: Number(datos.capacidad),

      pisoId: Number(datos.pisoId),

      forma: datos.forma,
    });
  }

  return (
    <form onSubmit={handleSubmit(enviarFormulario)} className="space-y-5">
      {/* Número */}
      <div>
        <label
          htmlFor="numeroMesa"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Número o identificador
        </label>

        <input
          id="numeroMesa"
          type="text"
          placeholder="Ej. 01"
          {...register("numero")}
          className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />

        {errors.numero && (
          <p className="mt-2 text-xs font-medium text-rose-600">
            {errors.numero.message}
          </p>
        )}
      </div>

      {/* Capacidad */}
      <div>
        <label
          htmlFor="capacidadMesa"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Capacidad
        </label>

        <input
          id="capacidadMesa"
          type="number"
          min="1"
          max="30"
          {...register("capacidad")}
          className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />

        {errors.capacidad && (
          <p className="mt-2 text-xs font-medium text-rose-600">
            {errors.capacidad.message}
          </p>
        )}
      </div>

      {/* Piso */}
      <div>
        <label
          htmlFor="pisoMesa"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Piso o zona
        </label>

        <select
          id="pisoMesa"
          {...register("pisoId")}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        >
          {pisos.map((piso) => (
            <option key={piso.id} value={piso.id}>
              {piso.nombre}
            </option>
          ))}
        </select>

        {errors.pisoId && (
          <p className="mt-2 text-xs font-medium text-rose-600">
            {errors.pisoId.message}
          </p>
        )}
      </div>

      {/* Forma */}
      <div>
        <label
          htmlFor="formaMesa"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Forma
        </label>

        <select
          id="formaMesa"
          {...register("forma")}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        >
          <option value="RECTANGLE">Rectangular</option>

          <option value="ROUND">Redonda</option>
        </select>
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
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {isSubmitting
            ? "Guardando..."
            : valoresIniciales
              ? "Guardar cambios"
              : "Crear mesa"}
        </button>
      </div>
    </form>
  );
}
