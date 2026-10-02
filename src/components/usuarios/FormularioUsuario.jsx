"use client";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

function crearEsquema(esEdicion) {
  return z
    .object({
      nombre: z.string().trim().min(2, "Ingresa el nombre del usuario."),

      correo: z
        .string()
        .trim()
        .toLowerCase()
        .email("Ingresa un correo electrónico válido."),

      rol: z.enum(["ADMIN", "HOSTESS", "WAITER", "CLEANING"]),

      contrasena: esEdicion
        ? z.string().optional()
        : z
            .string()
            .min(6, "La contraseña debe contener al menos 6 caracteres."),

      confirmarContrasena: esEdicion
        ? z.string().optional()
        : z.string().min(1, "Confirma la contraseña."),
    })
    .refine(
      (datos) => esEdicion || datos.contrasena === datos.confirmarContrasena,
      {
        message: "Las contraseñas no coinciden.",

        path: ["confirmarContrasena"],
      },
    );
}

export default function FormularioUsuario({
  usuarioInicial = null,
  onGuardar,
  onCancelar,
}) {
  const esEdicion = Boolean(usuarioInicial);

  const esquema = crearEsquema(esEdicion);

  const {
    register,
    handleSubmit,

    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),

    defaultValues: {
      nombre: usuarioInicial?.nombre ?? "",

      correo: usuarioInicial?.correo ?? "",

      rol: usuarioInicial?.rol ?? "WAITER",

      contrasena: "",

      confirmarContrasena: "",
    },
  });

  async function enviar(datos) {
    const datosEnviar = {
      nombre: datos.nombre,

      correo: datos.correo,

      rol: datos.rol,
    };

    if (!esEdicion) {
      datosEnviar.contrasena = datos.contrasena;
    }

    return onGuardar(datosEnviar);
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="space-y-5">
      <div>
        <label
          htmlFor="nombre"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Nombre completo
        </label>

        <input
          id="nombre"
          type="text"
          {...register("nombre")}
          className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />

        {errors.nombre && (
          <p className="mt-2 text-xs font-medium text-rose-600">
            {errors.nombre.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="correo"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Correo electrónico
        </label>

        <input
          id="correo"
          type="email"
          {...register("correo")}
          className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />

        {errors.correo && (
          <p className="mt-2 text-xs font-medium text-rose-600">
            {errors.correo.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="rol"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Rol
        </label>

        <select
          id="rol"
          {...register("rol")}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        >
          <option value="ADMIN">Administrador</option>

          <option value="HOSTESS">Hostess</option>

          <option value="WAITER">Mesero</option>

          <option value="CLEANING">Limpieza</option>
        </select>
      </div>

      {!esEdicion && (
        <>
          <div>
            <label
              htmlFor="contrasena"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Contraseña inicial
            </label>

            <input
              id="contrasena"
              type="password"
              autoComplete="new-password"
              {...register("contrasena")}
              className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />

            {errors.contrasena && (
              <p className="mt-2 text-xs font-medium text-rose-600">
                {errors.contrasena.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmarContrasena"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Confirmar contraseña
            </label>

            <input
              id="confirmarContrasena"
              type="password"
              autoComplete="new-password"
              {...register("confirmarContrasena")}
              className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />

            {errors.confirmarContrasena && (
              <p className="mt-2 text-xs font-medium text-rose-600">
                {errors.confirmarContrasena.message}
              </p>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {isSubmitting
            ? "Guardando..."
            : esEdicion
              ? "Guardar cambios"
              : "Crear usuario"}
        </button>
      </div>
    </form>
  );
}
