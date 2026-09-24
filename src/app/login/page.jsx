"use client";

import { useRouter } from "next/navigation";

import { Eye, EyeOff, LockKeyhole, Mail, UtensilsCrossed } from "lucide-react";

import { useState } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { z } from "zod";

import Swal from "sweetalert2";

import { iniciarSesion } from "@/services/authService";

import { guardarTokenSesion } from "@/lib/auth/sesion";

const esquemaLogin = z.object({
  correo: z.string().trim().email("Ingresa un correo electrónico válido."),

  contrasena: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export default function PaginaLogin() {
  const router = useRouter();

  const clienteConsultas = useQueryClient();

  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const {
    register,
    handleSubmit,

    formState: { errors },
  } = useForm({
    resolver: zodResolver(esquemaLogin),

    defaultValues: {
      correo: "admin@smarttable.com",

      contrasena: "123456",
    },
  });

  const mutacionLogin = useMutation({
    mutationFn: iniciarSesion,
  });

  async function enviarFormulario(datos) {
    try {
      const respuesta = await mutacionLogin.mutateAsync({
        correo: datos.correo.trim(),

        contrasena: datos.contrasena,
      });

      guardarTokenSesion(respuesta.token);

      /*
       * Dejamos inmediatamente disponible el usuario
       * para cualquier componente que consulte la sesión.
       */
      clienteConsultas.setQueryData(["sesion"], respuesta.usuario);

      router.replace("/dashboard");
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo iniciar sesión",
        text: error.message,
        confirmButtonText: "Aceptar",
      });
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      {/* ===============================================
          PANEL IZQUIERDO
      ================================================ */}

      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="absolute -bottom-28 left-10 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
              <UtensilsCrossed size={24} />
            </div>

            <div>
              <p className="text-xl font-bold">SmartTable</p>

              <p className="text-sm text-slate-400">
                Gestión inteligente de mesas
              </p>
            </div>
          </div>
        </div>

        <div className="relative max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Operación del restaurante
          </p>

          <h1 className="mt-5 text-4xl font-bold leading-tight xl:text-5xl">
            Una vista clara de lo que ocurre en cada mesa.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
            Gestiona la lista de espera, asigna grupos, consulta la distribución
            del restaurante y coordina el ciclo de limpieza desde un mismo
            sistema.
          </p>
        </div>

        <p className="relative text-xs text-slate-500">
          SmartTable · Prototipo 1
        </p>
      </section>

      {/* ===============================================
          LOGIN
      ================================================ */}

      <section className="flex min-h-screen items-center justify-center p-5 sm:p-8 lg:min-h-0">
        <div className="w-full max-w-md">
          {/* Marca móvil */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <UtensilsCrossed size={22} />
            </div>

            <div>
              <p className="text-lg font-bold text-slate-950">SmartTable</p>

              <p className="text-xs text-slate-500">Gestión de mesas</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-emerald-600">Bienvenido</p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Iniciar sesión
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Ingresa tus credenciales para acceder al panel operativo de
              SmartTable.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(enviarFormulario)}
            className="mt-8 space-y-5"
          >
            {/* Correo */}
            <div>
              <label
                htmlFor="correo"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Correo electrónico
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="correo"
                  type="email"
                  autoComplete="email"
                  {...register("correo")}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              {errors.correo && (
                <p className="mt-2 text-xs font-medium text-rose-600">
                  {errors.correo.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="contrasena"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Contraseña
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="contrasena"
                  type={mostrarContrasena ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("contrasena")}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />

                <button
                  type="button"
                  onClick={() => setMostrarContrasena((valor) => !valor)}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  aria-label={
                    mostrarContrasena
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                >
                  {mostrarContrasena ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {errors.contrasena && (
                <p className="mt-2 text-xs font-medium text-rose-600">
                  {errors.contrasena.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={mutacionLogin.isPending}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {mutacionLogin.isPending
                ? "Iniciando sesión..."
                : "Iniciar sesión"}
            </button>
          </form>

          {/* Credenciales de demo */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-700">
              Acceso para demostración
            </p>

            <div className="mt-2 space-y-1 text-xs text-slate-500">
              <p>
                Correo:{" "}
                <span className="font-medium text-slate-700">
                  admin@smarttable.com
                </span>
              </p>

              <p>
                Contraseña:{" "}
                <span className="font-medium text-slate-700">123456</span>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Prototipo 1 · SmartTable
          </p>
        </div>
      </section>
    </main>
  );
}
