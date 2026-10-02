"use client";

import { KeyRound, Mail, Save, ShieldCheck, UserRound } from "lucide-react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Swal from "sweetalert2";

import {
  actualizarMiPerfil,
  cambiarContrasena,
  obtenerPerfil,
} from "@/services/authService";

const esquemaPerfil = z.object({
  nombre: z.string().trim().min(2, "Ingresa tu nombre."),

  correo: z
    .string()
    .trim()
    .toLowerCase()
    .email("Ingresa un correo electrónico válido."),
});

const esquemaContrasena = z
  .object({
    contrasenaActual: z.string().min(1, "Ingresa tu contraseña actual."),

    nuevaContrasena: z
      .string()
      .min(6, "La nueva contraseña debe contener al menos 6 caracteres."),

    confirmarContrasena: z.string().min(1, "Confirma tu nueva contraseña."),
  })
  .refine((datos) => datos.nuevaContrasena === datos.confirmarContrasena, {
    message: "Las contraseñas no coinciden.",

    path: ["confirmarContrasena"],
  });

const nombresRol = {
  ADMIN: "Administrador",

  HOSTESS: "Hostess",

  WAITER: "Mesero",

  CLEANING: "Limpieza",
};

function FormularioPerfil({ usuario }) {
  const clienteConsultas = useQueryClient();

  const {
    register,
    handleSubmit,

    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquemaPerfil),

    defaultValues: {
      nombre: usuario.nombre,

      correo: usuario.correo,
    },
  });

  const mutacion = useMutation({
    mutationFn: actualizarMiPerfil,
  });

  async function enviar(datos) {
    try {
      const usuarioActualizado = await mutacion.mutateAsync(datos);

      clienteConsultas.setQueryData(["sesion"], usuarioActualizado);

      await Swal.fire({
        icon: "success",

        title: "Perfil actualizado",

        timer: 1300,

        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",

        title: "No se pudo actualizar",

        text: error.message,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Nombre
        </label>

        <div className="relative">
          <UserRound
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            {...register("nombre")}
            className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        {errors.nombre && (
          <p className="mt-2 text-xs text-rose-600">{errors.nombre.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Correo
        </label>

        <div className="relative">
          <Mail
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="email"
            {...register("correo")}
            className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        {errors.correo && (
          <p className="mt-2 text-xs text-rose-600">{errors.correo.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        <Save size={17} />
        Guardar cambios
      </button>
    </form>
  );
}

function FormularioContrasena() {
  const {
    register,
    handleSubmit,
    reset,

    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquemaContrasena),

    defaultValues: {
      contrasenaActual: "",

      nuevaContrasena: "",

      confirmarContrasena: "",
    },
  });

  const mutacion = useMutation({
    mutationFn: cambiarContrasena,
  });

  async function enviar(datos) {
    try {
      await mutacion.mutateAsync(datos);

      reset();

      await Swal.fire({
        icon: "success",

        title: "Contraseña actualizada",

        text: "Tu nueva contraseña ya está activa.",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",

        title: "No se pudo cambiar la contraseña",

        text: error.message,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Contraseña actual
        </label>

        <input
          type="password"
          autoComplete="current-password"
          {...register("contrasenaActual")}
          className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />

        {errors.contrasenaActual && (
          <p className="mt-2 text-xs text-rose-600">
            {errors.contrasenaActual.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Nueva contraseña
        </label>

        <input
          type="password"
          autoComplete="new-password"
          {...register("nuevaContrasena")}
          className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />

        {errors.nuevaContrasena && (
          <p className="mt-2 text-xs text-rose-600">
            {errors.nuevaContrasena.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Confirmar nueva contraseña
        </label>

        <input
          type="password"
          autoComplete="new-password"
          {...register("confirmarContrasena")}
          className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />

        {errors.confirmarContrasena && (
          <p className="mt-2 text-xs text-rose-600">
            {errors.confirmarContrasena.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        <KeyRound size={17} />
        Cambiar contraseña
      </button>
    </form>
  );
}

export default function PaginaMiCuenta() {
  const {
    data: usuario,

    isLoading,
    isError,
  } = useQuery({
    queryKey: ["sesion"],

    queryFn: obtenerPerfil,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
      </div>
    );
  }

  if (isError || !usuario) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        No se pudo cargar tu cuenta.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-7">
        <p className="text-sm font-medium text-emerald-600">Perfil</p>

        <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">
          Mi cuenta
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Administra tus datos de acceso personales.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <UserRound size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">Datos personales</h2>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck size={13} />

                {nombresRol[usuario.rol] ?? usuario.rol}
              </div>
            </div>
          </div>

          <FormularioPerfil
            key={`${usuario.id}-${usuario.correo}`}
            usuario={usuario}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <KeyRound size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">Seguridad</h2>

              <p className="mt-1 text-xs text-slate-500">
                Cambia tu contraseña de SmartTable.
              </p>
            </div>
          </div>

          <FormularioContrasena />
        </section>
      </div>
    </div>
  );
}
