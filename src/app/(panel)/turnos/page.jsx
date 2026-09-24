"use client";

import { useMemo, useState } from "react";

import {
  AlertCircle,
  Clock3,
  Plus,
  Trash2,
  Users,
  Utensils,
} from "lucide-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Swal from "sweetalert2";

import Modal from "@/components/ui/Modal";
import FormularioTurno from "@/components/turnos/FormularioTurno";

import {
  obtenerTurnos,
  crearTurno,
  cancelarTurno,
} from "@/services/turnosService";

import { obtenerMesas, asignarTurnoAMesa } from "@/services/mesasService";

export default function PaginaTurnos() {
  const clienteConsultas = useQueryClient();

  const [modalAbierto, setModalAbierto] = useState(false);

  /* =====================================================
     CONSULTAS
  ====================================================== */

  const {
    data: turnos = [],
    isLoading: cargandoTurnos,
    isError: errorTurnos,
  } = useQuery({
    queryKey: ["turnos"],
    queryFn: obtenerTurnos,
  });

  const {
    data: mesas = [],
    isLoading: cargandoMesas,
    isError: errorMesas,
  } = useQuery({
    queryKey: ["mesas"],
    queryFn: () => obtenerMesas(),
  });

  /**
   * Buscamos para cada grupo la mesa disponible
   * compatible que desperdicie menos lugares.
   *
   * Ejemplo:
   *
   * Grupo de 2:
   *
   * Mesa capacidad 2 → preferida
   * Mesa capacidad 4 → compatible
   * Mesa capacidad 6 → compatible
   *
   * Nunca se considera una mesa cuya capacidad
   * sea menor al número de personas.
   */
  const sugerencias = useMemo(() => {
    const resultado = {};

    turnos.forEach((turno) => {
      const compatibles = mesas
        .filter(
          (mesa) =>
            mesa.estado === "AVAILABLE" && mesa.capacidad >= turno.personas,
        )
        .sort((mesaA, mesaB) => mesaA.capacidad - mesaB.capacidad);

      resultado[turno.id] = compatibles[0] ?? null;
    });

    return resultado;
  }, [turnos, mesas]);

  /* =====================================================
     ACTUALIZACIÓN
  ====================================================== */

  function refrescarDatos() {
    clienteConsultas.invalidateQueries({
      queryKey: ["turnos"],
    });

    clienteConsultas.invalidateQueries({
      queryKey: ["mesas"],
    });

    clienteConsultas.invalidateQueries({
      queryKey: ["dashboard"],
    });

    clienteConsultas.invalidateQueries({
      queryKey: ["eventos"],
    });
  }

  /* =====================================================
     MUTACIONES
  ====================================================== */

  const mutacionCrear = useMutation({
    mutationFn: crearTurno,

    onSuccess() {
      refrescarDatos();
    },
  });

  const mutacionCancelar = useMutation({
    mutationFn: cancelarTurno,

    onSuccess() {
      refrescarDatos();
    },
  });

  const mutacionAsignar = useMutation({
    mutationFn: ({ idMesa, idTurno }) =>
      asignarTurnoAMesa(idMesa, idTurno, {
        /*
         * Desde esta pantalla nunca se permiten
         * excepciones de capacidad.
         */
        permitirExcesoCapacidad: false,
      }),

    onSuccess() {
      refrescarDatos();
    },
  });

  /* =====================================================
     ACCIONES
  ====================================================== */

  async function manejarRegistro(datos) {
    try {
      const turno = await mutacionCrear.mutateAsync(datos);

      setModalAbierto(false);

      await Swal.fire({
        icon: "success",
        title: "Turno registrado",
        text: `${turno.turno} fue agregado a la lista de espera.`,
      });

      return true;
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo registrar",
        text: error.message,
      });

      return false;
    }
  }

  async function manejarCancelacion(turno) {
    const confirmacion = await Swal.fire({
      icon: "warning",

      title: `Retirar ${turno.turno}`,

      text: `${turno.nombre} será eliminado de la lista de espera.`,

      showCancelButton: true,

      confirmButtonText: "Retirar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: "#e11d48",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await mutacionCancelar.mutateAsync(turno.id);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo retirar",
        text: error.message,
      });
    }
  }

  async function manejarAsignacion(turno, mesa) {
    /*
     * Validación defensiva en frontend.
     *
     * El backend también tendrá esta validación.
     */
    if (turno.personas > mesa.capacidad) {
      await Swal.fire({
        icon: "warning",

        title: "Asignación manual requerida",

        text: "Este grupo supera la capacidad de la mesa. Realiza la excepción desde Operación.",
      });

      return;
    }

    const lugaresLibres = mesa.capacidad - turno.personas;

    const confirmacion = await Swal.fire({
      icon: "question",

      title: `Asignar ${turno.turno}`,

      html: `
          <div style="text-align:left; line-height:1.7">
            <p>
              <strong>${turno.nombre}</strong>
              · ${turno.personas} personas
            </p>

            <p style="margin-top:8px">
              Mesa <strong>${mesa.numero}</strong>
              · capacidad ${mesa.capacidad}
            </p>

            ${
              lugaresLibres > 0
                ? `
                  <p style="margin-top:8px; color:#64748b">
                    Quedarán ${lugaresLibres}
                    lugar(es) disponibles.
                  </p>
                `
                : `
                  <p style="margin-top:8px; color:#047857">
                    La capacidad coincide exactamente con el grupo.
                  </p>
                `
            }
          </div>
        `,

      showCancelButton: true,

      confirmButtonText: "Asignar mesa",

      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await mutacionAsignar.mutateAsync({
        idMesa: mesa.id,
        idTurno: turno.id,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo asignar",
        text: error.message,
      });
    }
  }

  /* =====================================================
     ESTADOS
  ====================================================== */

  if (cargandoTurnos || cargandoMesas) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-slate-500">Cargando turnos...</p>
        </div>
      </div>
    );
  }

  if (errorTurnos || errorMesas) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <p className="font-semibold text-rose-800">
          No se pudo cargar la lista de espera.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl min-w-0">
        {/* =================================================
            ENCABEZADO
        ================================================== */}

        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-emerald-600">
              Lista de espera
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
              Turnos
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Administra los grupos en espera y consulta la mejor mesa
              disponible según su capacidad.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus size={18} />
            Nuevo turno
          </button>
        </div>

        {/* Regla operativa */}
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-sky-600" />

          <div>
            <p className="text-sm font-semibold text-sky-900">
              Asignación por capacidad
            </p>

            <p className="mt-1 text-xs leading-5 text-sky-700">
              SmartTable recomienda únicamente mesas cuya capacidad sea igual o
              mayor al tamaño del grupo. Las excepciones, como agregar una silla
              adicional, se autorizan manualmente desde Operación.
            </p>
          </div>
        </div>

        {/* =================================================
            LISTA
        ================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[100px_minmax(0,1fr)_120px_150px_220px_60px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 lg:grid">
            <span>Turno</span>
            <span>Cliente</span>
            <span>Personas</span>
            <span>Llegada</span>
            <span>Mejor mesa disponible</span>
            <span />
          </div>

          {turnos.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {turnos.map((turno, indice) => {
                const mesa = sugerencias[turno.id];

                return (
                  <div
                    key={turno.id}
                    className="grid min-w-0 gap-4 px-5 py-4 lg:grid-cols-[100px_minmax(0,1fr)_120px_150px_220px_60px] lg:items-center"
                  >
                    {/* Turno */}
                    <div>
                      <span className="inline-flex rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
                        {turno.turno}
                      </span>

                      <p className="mt-1 text-[10px] text-slate-400 lg:hidden">
                        Posición #{indice + 1}
                      </p>
                    </div>

                    {/* Cliente */}
                    <p className="min-w-0 truncate font-semibold text-slate-800">
                      {turno.nombre}
                    </p>

                    {/* Personas */}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users size={16} className="text-slate-400" />

                      {turno.personas}
                    </div>

                    {/* Llegada */}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock3 size={16} className="text-slate-400" />

                      {new Date(turno.fechaHoraLlegada).toLocaleTimeString(
                        "es-MX",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </div>

                    {/* Mesa sugerida */}
                    {mesa ? (
                      <button
                        type="button"
                        disabled={mutacionAsignar.isPending}
                        onClick={() => manejarAsignacion(turno, mesa)}
                        className="flex w-fit items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-left transition hover:bg-emerald-100 disabled:opacity-50"
                      >
                        <Utensils
                          size={16}
                          className="shrink-0 text-emerald-600"
                        />

                        <div>
                          <p className="text-sm font-semibold text-emerald-800">
                            Mesa {mesa.numero}
                          </p>

                          <p className="text-[11px] text-emerald-600">
                            Capacidad {mesa.capacidad}
                          </p>
                        </div>
                      </button>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-slate-400">
                          Sin mesa compatible
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          Esperar disponibilidad
                        </p>
                      </div>
                    )}

                    {/* Cancelar */}
                    <button
                      type="button"
                      disabled={mutacionCancelar.isPending}
                      onClick={() => manejarCancelacion(turno)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      aria-label={`Retirar ${turno.turno}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users size={36} className="mx-auto text-slate-300" />

              <p className="mt-4 font-semibold text-slate-700">
                No hay grupos esperando
              </p>

              <p className="mt-1 text-sm text-slate-400">
                La lista de espera está vacía.
              </p>

              <button
                type="button"
                onClick={() => setModalAbierto(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={17} />
                Registrar grupo
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Nuevo turno */}
      <Modal
        abierto={modalAbierto}
        titulo="Registrar nuevo grupo"
        descripcion="Agrega un cliente a la lista de espera."
        onCerrar={() => setModalAbierto(false)}
      >
        <FormularioTurno
          onRegistrar={manejarRegistro}
          onCancelar={() => setModalAbierto(false)}
        />
      </Modal>
    </>
  );
}
