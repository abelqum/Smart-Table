"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import {
  Bell,
  ChevronDown,
  History,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Map,
  Menu,
  Settings,
  Store,
  UtensilsCrossed,
  X,
} from "lucide-react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { combinarClases } from "@/lib/clases";

import { obtenerPerfil } from "@/services/authService";

import { obtenerRestaurante } from "@/services/restauranteService";

import { eliminarTokenSesion } from "@/lib/auth/sesion";

const opcionesNavegacion = [
  {
    nombre: "Dashboard",
    ruta: "/dashboard",
    icono: LayoutDashboard,
  },
  {
    nombre: "Operación",
    ruta: "/operacion",
    icono: Store,
  },
  {
    nombre: "Turnos",
    ruta: "/turnos",
    icono: ListOrdered,
  },
  {
    nombre: "Historial",
    ruta: "/historial",
    icono: History,
  },
];

const opcionesAdministracion = [
  {
    nombre: "Distribución",
    ruta: "/distribucion",
    icono: Map,
  },
  {
    nombre: "Configuración",
    ruta: "/configuracion",
    icono: Settings,
  },
];

/**
 * Convierte el rol técnico recibido desde la API
 * en una etiqueta adecuada para la interfaz.
 */
function obtenerNombreRol(rol) {
  const roles = {
    ADMIN: "Administrador",
    HOSTESS: "Hostess",
    WAITER: "Mesero",
    CLEANING: "Limpieza",
    FLOOR_MANAGER: "Jefe de piso",
  };

  return roles[rol] ?? rol ?? "Usuario";
}

/**
 * Obtiene hasta dos iniciales del nombre del usuario.
 */
function obtenerIniciales(nombre) {
  if (!nombre) {
    return "US";
  }

  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

export default function EstructuraPanel({ children }) {
  const rutaActual = usePathname();

  const router = useRouter();

  const clienteConsultas = useQueryClient();

  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);

  /* =====================================================
     SESIÓN
  ====================================================== */

  /**
   * GET /api/auth/me
   *
   * Ésta es la consulta que valida que la sesión
   * almacenada siga siendo válida.
   */
  const {
    data: usuario,
    isLoading: validandoSesion,
    isError: errorSesion,
    error: detalleErrorSesion,
    refetch: reintentarSesion,
  } = useQuery({
    queryKey: ["sesion"],
    queryFn: obtenerPerfil,

    /*
     * Una sesión inválida no necesita múltiples
     * reintentos automáticos.
     */
    retry: false,

    staleTime: 5 * 60 * 1000,
  });

  /*
   * Obtenemos también el nombre real configurado
   * del restaurante para mostrarlo en el panel.
   */
  const { data: restaurante } = useQuery({
    queryKey: ["restaurante"],
    queryFn: obtenerRestaurante,

    enabled: Boolean(usuario),
  });

  /**
   * Si el servidor responde 401, eliminamos el token
   * local y enviamos al usuario al login.
   *
   * No utilizamos setState dentro del efecto.
   * Estamos sincronizando React con el router y
   * almacenamiento externo.
   */
  useEffect(() => {
    if (!errorSesion || detalleErrorSesion?.status !== 401) {
      return;
    }

    eliminarTokenSesion();

    router.replace("/login");
  }, [errorSesion, detalleErrorSesion, router]);

  function esRutaActiva(ruta) {
    return rutaActual === ruta || rutaActual.startsWith(`${ruta}/`);
  }

  function cerrarSesion() {
    /*
     * JWT es stateless en este Prototipo 1.
     * Cerrar sesión consiste en eliminar el token.
     */
    eliminarTokenSesion();

    /*
     * Eliminamos información cacheada asociada
     * a la sesión anterior.
     *
     * Esto NO elimina los datos de la API Mock.
     */
    clienteConsultas.clear();

    router.replace("/login");
  }

  function renderizarOpcion(opcion) {
    const Icono = opcion.icono;

    const activa = esRutaActiva(opcion.ruta);

    return (
      <Link
        key={opcion.ruta}
        href={opcion.ruta}
        onClick={() => setMenuMovilAbierto(false)}
        className={combinarClases(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",

          activa
            ? "bg-emerald-50 text-emerald-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
        )}
      >
        <Icono size={19} strokeWidth={activa ? 2.3 : 1.9} />

        <span>{opcion.nombre}</span>
      </Link>
    );
  }

  function contenidoBarraLateral() {
    return (
      <>
        {/* Marca */}
        <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
            <UtensilsCrossed size={22} />
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight text-slate-950">
              SmartTable
            </p>

            <p className="text-xs text-slate-500">Gestión de mesas</p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex flex-1 flex-col px-3 py-5">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Operación
          </p>

          <div className="space-y-1">
            {opcionesNavegacion.map(renderizarOpcion)}
          </div>

          <p className="mb-2 mt-8 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Administración
          </p>

          <div className="space-y-1">
            {opcionesAdministracion.map(renderizarOpcion)}
          </div>
        </nav>

        {/* Restaurante */}
        <div className="border-t border-slate-200 p-4">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs font-medium text-slate-400">Restaurante</p>

            <p className="mt-1 truncate text-sm font-semibold text-slate-800">
              {restaurante?.nombre ?? "SmartTable"}
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Sesión activa
            </div>
          </div>
        </div>
      </>
    );
  }

  /* =====================================================
     VALIDACIÓN DE SESIÓN
  ====================================================== */

  if (validandoSesion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Validando sesión...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Si recibimos 401, useEffect realizará la redirección.
   */
  if (errorSesion && detalleErrorSesion?.status === 401) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Redirigiendo al inicio de sesión...
        </p>
      </div>
    );
  }

  /*
   * Otros errores no deben cerrar la sesión automáticamente.
   * Podría tratarse simplemente de una caída temporal de API.
   */
  if (errorSesion) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
          <p className="font-semibold text-slate-900">
            No se pudo validar la sesión
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {detalleErrorSesion?.message ??
              "No fue posible comunicarse con el servidor."}
          </p>

          <button
            type="button"
            onClick={() => reintentarSesion()}
            className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  const iniciales = obtenerIniciales(usuario.nombre);

  const nombreRol = obtenerNombreRol(usuario.rol);

  /* =====================================================
     PANEL
  ====================================================== */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar escritorio */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        {contenidoBarraLateral()}
      </aside>

      {/* Fondo menú móvil */}
      {menuMovilAbierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setMenuMovilAbierto(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* Sidebar móvil */}
      <aside
        className={combinarClases(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-2xl transition-transform duration-300 lg:hidden",

          menuMovilAbierto ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <button
          type="button"
          onClick={() => setMenuMovilAbierto(false)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          aria-label="Cerrar menú"
        >
          <X size={20} />
        </button>

        {contenidoBarraLateral()}
      </aside>

      {/* Área principal */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuMovilAbierto(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                SmartTable
              </p>

              <p className="text-sm font-semibold text-slate-800">
                Panel de operación
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">
              Prototipo 1
            </span>

            {/* Notificaciones visuales */}
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
              aria-label="Notificaciones"
            >
              <Bell size={19} />
            </button>

            {/* Usuario */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuUsuarioAbierto((valor) => !valor)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2 transition hover:bg-slate-50"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                  {iniciales}
                </div>

                <div className="hidden max-w-40 text-left md:block">
                  <p className="truncate text-xs font-semibold text-slate-800">
                    {usuario.nombre}
                  </p>

                  <p className="truncate text-[11px] text-slate-500">
                    {nombreRol}
                  </p>
                </div>

                <ChevronDown
                  size={15}
                  className="hidden text-slate-400 md:block"
                />
              </button>

              {/* Menú de usuario */}
              {menuUsuarioAbierto && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-100 p-4">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {usuario.nombre}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {usuario.correo}
                    </p>

                    <span className="mt-3 inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      {nombreRol}
                    </span>
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      onClick={cerrarSesion}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                    >
                      <LogOut size={17} />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
