"use client";

import { useMemo, useState } from "react";

import dynamic from "next/dynamic";
import Link from "next/link";

import {
  ArrowLeft,
  CircleDot,
  Grid3X3,
  Move,
  RotateCcw,
  Save,
  Users,
} from "lucide-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Swal from "sweetalert2";

import { obtenerMesas, actualizarMesa } from "@/services/mesasService";

import { obtenerPisos } from "@/services/pisosService";

/*
 * React Konva se carga exclusivamente en el navegador.
 *
 * Esto evita intentar inicializar Canvas durante
 * el renderizado del servidor de Next.js.
 */
const PlanoMesasKonva = dynamic(
  () => import("@/components/mesas/PlanoMesasKonva"),
  {
    ssr: false,

    loading: () => (
      <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-500">Cargando editor...</p>
      </div>
    ),
  },
);

export default function PaginaDistribucion() {
  const clienteConsultas = useQueryClient();

  /*
   * El piso seleccionado es estado propio de la interfaz.
   * No necesita guardarse en backend.
   */
  const [pisoSeleccionadoId, setPisoSeleccionadoId] = useState(null);

  const [mesaSeleccionadaId, setMesaSeleccionadaId] = useState(null);

  /*
   * Aquí sólo almacenamos los cambios que todavía
   * NO han sido enviados al backend.
   *
   * Ejemplo:
   *
   * {
   *   4: {
   *     posicionX: 300,
   *     posicionY: 220
   *   }
   * }
   *
   * No duplicamos todas las mesas en useState.
   */
  const [cambiosPosicion, setCambiosPosicion] = useState({});

  /* =====================================================
     CONSULTAS
  ====================================================== */

  const {
    data: pisos = [],
    isLoading: cargandoPisos,
    isError: errorPisos,
  } = useQuery({
    queryKey: ["pisos"],
    queryFn: obtenerPisos,
  });

  const {
    data: mesas = [],
    isLoading: cargandoMesas,
    isError: errorMesas,
  } = useQuery({
    queryKey: ["mesas"],
    queryFn: () => obtenerMesas(),
  });

  /*
   * Si todavía no seleccionamos nada, utilizamos
   * automáticamente el primer piso disponible.
   */
  const pisoActualId = pisoSeleccionadoId ?? pisos[0]?.id ?? null;

  const pisoActual = pisos.find((piso) => piso.id === pisoActualId) ?? null;

  /*
   * Aplicamos sobre cada mesa los cambios locales pendientes.
   *
   * Los datos originales siguen perteneciendo a TanStack Query.
   */
  const mesasDelPiso = useMemo(() => {
    return mesas
      .filter((mesa) => mesa.pisoId === pisoActualId)
      .map((mesa) => ({
        ...mesa,

        ...(cambiosPosicion[mesa.id] ?? {}),
      }));
  }, [mesas, pisoActualId, cambiosPosicion]);

  const mesaSeleccionada = useMemo(() => {
    return mesasDelPiso.find((mesa) => mesa.id === mesaSeleccionadaId) ?? null;
  }, [mesasDelPiso, mesaSeleccionadaId]);

  const cantidadCambios = Object.keys(cambiosPosicion).length;

  const hayCambios = cantidadCambios > 0;

  /* =====================================================
     GUARDADO
  ====================================================== */

  /**
   * Guarda únicamente las mesas que fueron movidas.
   *
   * Cada actualización utiliza:
   *
   * PATCH /api/mesas/:id
   *
   * Por ahora responde la API Mock.
   * Después responderá Express.
   */
  const mutacionGuardar = useMutation({
    mutationFn: async (posiciones) => {
      const operaciones = Object.entries(posiciones).map(([idMesa, posicion]) =>
        actualizarMesa(Number(idMesa), {
          posicionX: posicion.posicionX,

          posicionY: posicion.posicionY,
        }),
      );

      return Promise.all(operaciones);
    },

    async onSuccess() {
      await clienteConsultas.invalidateQueries({
        queryKey: ["mesas"],
      });

      setCambiosPosicion({});

      await Swal.fire({
        icon: "success",
        title: "Distribución guardada",
        text: "Las posiciones de las mesas fueron actualizadas.",
        timer: 1500,
        showConfirmButton: false,
      });
    },

    async onError(error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: error.message,
      });
    },
  });

  /**
   * Actualiza únicamente la posición pendiente
   * de una determinada mesa.
   */
  function manejarMovimientoMesa(idMesa, nuevaPosicion) {
    setCambiosPosicion((cambiosActuales) => ({
      ...cambiosActuales,

      [idMesa]: nuevaPosicion,
    }));
  }

  /**
   * Distribuye automáticamente las mesas en filas.
   *
   * Esta función sólo modifica la vista local.
   * El usuario todavía debe pulsar "Guardar distribución".
   */
  function acomodarAutomaticamente() {
    const nuevasPosiciones = {};

    mesasDelPiso.forEach((mesa, indice) => {
      const columna = indice % 4;

      const fila = Math.floor(indice / 4);

      nuevasPosiciones[mesa.id] = {
        posicionX: 140 + columna * 260,

        posicionY: 120 + fila * 180,
      };
    });

    setCambiosPosicion(nuevasPosiciones);
  }

  /**
   * Descarta todos los movimientos no guardados.
   */
  async function descartarCambios() {
    if (!hayCambios) {
      return;
    }

    const confirmacion = await Swal.fire({
      icon: "warning",

      title: "Descartar cambios",

      text: "Las mesas volverán a sus últimas posiciones guardadas.",

      showCancelButton: true,

      confirmButtonText: "Descartar",

      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    setCambiosPosicion({});
  }

  /**
   * Antes de cambiar de piso comprobamos si existen
   * movimientos pendientes.
   */
  async function cambiarPiso(nuevoPisoId) {
    if (nuevoPisoId === pisoActualId) {
      return;
    }

    if (hayCambios) {
      const confirmacion = await Swal.fire({
        icon: "warning",

        title: "Cambios sin guardar",

        text: "Si cambias de piso se descartarán los movimientos actuales.",

        showCancelButton: true,

        confirmButtonText: "Cambiar de piso",

        cancelButtonText: "Cancelar",
      });

      if (!confirmacion.isConfirmed) {
        return;
      }
    }

    setCambiosPosicion({});

    setMesaSeleccionadaId(null);

    setPisoSeleccionadoId(nuevoPisoId);
  }

  /* =====================================================
     ESTADOS DE PÁGINA
  ====================================================== */

  if (cargandoPisos || cargandoMesas) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-slate-500">
            Cargando distribución...
          </p>
        </div>
      </div>
    );
  }

  if (errorPisos || errorMesas) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <p className="font-semibold text-rose-800">
          No se pudo cargar la distribución.
        </p>

        <p className="mt-1 text-sm text-rose-600">
          Verifica la conexión con la API.
        </p>
      </div>
    );
  }

  if (pisos.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <Grid3X3 size={36} className="mx-auto text-slate-300" />

        <h1 className="mt-4 text-lg font-bold text-slate-900">
          Primero necesitas un piso
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Crea un piso desde Configuración antes de diseñar la distribución.
        </p>

        <Link
          href="/configuracion"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft size={17} />
          Ir a configuración
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] min-w-0 overflow-x-hidden">
      {/* =================================================
          ENCABEZADO
      ================================================== */}

      <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-medium text-emerald-600">
            Configuración visual
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            Distribución del restaurante
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Arrastra las mesas para representar su ubicación física dentro de
            cada piso.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={acomodarAutomaticamente}
            disabled={mesasDelPiso.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <Grid3X3 size={17} />
            Acomodar
          </button>

          <button
            type="button"
            onClick={descartarCambios}
            disabled={!hayCambios}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={17} />
            Descartar
          </button>

          <button
            type="button"
            disabled={!hayCambios || mutacionGuardar.isPending}
            onClick={() => mutacionGuardar.mutate(cambiosPosicion)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={17} />

            {mutacionGuardar.isPending
              ? "Guardando..."
              : "Guardar distribución"}
          </button>
        </div>
      </div>

      {/* =================================================
          SELECTOR DE PISO
      ================================================== */}

      <section className="mb-5 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold text-slate-800">Piso actual</p>

          <p className="mt-1 text-xs text-slate-500">
            Selecciona el área que deseas editar.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {pisos.map((piso) => (
            <button
              key={piso.id}
              type="button"
              onClick={() => cambiarPiso(piso.id)}
              className={
                piso.id === pisoActualId
                  ? "rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              }
            >
              {piso.nombre}
            </button>
          ))}
        </div>
      </section>

      {/* =================================================
          EDITOR + INFORMACIÓN
      ================================================== */}

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* Canvas */}
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">
                {pisoActual?.nombre}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {mesasDelPiso.length}{" "}
                {mesasDelPiso.length === 1 ? "mesa" : "mesas"} configuradas
              </p>
            </div>

            {hayCambios && (
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                {cantidadCambios}{" "}
                {cantidadCambios === 1
                  ? "cambio pendiente"
                  : "cambios pendientes"}
              </span>
            )}
          </div>

          {mesasDelPiso.length > 0 ? (
            <PlanoMesasKonva
              mesas={mesasDelPiso}
              editable
              mesaSeleccionadaId={mesaSeleccionadaId}
              onSeleccionarMesa={setMesaSeleccionadaId}
              onMoverMesa={manejarMovimientoMesa}
            />
          ) : (
            <div className="flex min-h-[450px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div>
                <Grid3X3 size={38} className="mx-auto text-slate-300" />

                <p className="mt-4 font-semibold text-slate-700">
                  Este piso no tiene mesas
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Agrega mesas desde Configuración.
                </p>

                <Link
                  href="/configuracion"
                  className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                >
                  Configurar mesas
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Panel lateral */}
        <aside className="h-fit w-full min-w-0 max-w-full rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Move size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">Propiedades</h2>

                <p className="mt-1 text-xs text-slate-500">Mesa seleccionada</p>
              </div>
            </div>
          </div>

          {mesaSeleccionada ? (
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Mesa
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {mesaSeleccionada.numero}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <CircleDot size={20} />
                </div>
              </div>

              <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
                <div>
                  <p className="text-xs text-slate-400">Capacidad</p>

                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Users size={15} />
                    {mesaSeleccionada.capacidad} personas
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Forma</p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {mesaSeleccionada.forma === "ROUND"
                      ? "Redonda"
                      : "Rectangular"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Posición X</p>

                  <p className="mt-1 font-mono text-sm text-slate-700">
                    {Math.round(mesaSeleccionada.posicionX ?? 0)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Posición Y</p>

                  <p className="mt-1 font-mono text-sm text-slate-700">
                    {Math.round(mesaSeleccionada.posicionY ?? 0)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Estado operativo</p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {mesaSeleccionada.estado}
                  </p>
                </div>
              </div>

              <Link
                href="/configuracion"
                className="mt-6 block w-full rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Editar datos de mesa
              </Link>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Move size={30} className="mx-auto text-slate-300" />

              <p className="mt-4 text-sm font-semibold text-slate-700">
                Selecciona una mesa
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Pulsa o arrastra una mesa para consultar su información.
              </p>
            </div>
          )}
        </aside>
      </section>

      {/* Ayuda */}
      <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4">
        <p className="text-sm font-semibold text-sky-900">¿Cómo funciona?</p>

        <p className="mt-1 text-xs leading-5 text-sky-700">
          Arrastra las mesas hasta representar la distribución física del
          restaurante. Los movimientos permanecen pendientes hasta pulsar
          Guardar distribución.
        </p>
      </div>
    </div>
  );
}
