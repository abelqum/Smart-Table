"use client";

import { useMemo, useState } from "react";

import dynamic from "next/dynamic";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MapPin,
  Plus,
  Sparkles,
  UserRoundPlus,
  Users,
} from "lucide-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Swal from "sweetalert2";

import Modal from "@/components/ui/Modal";
import FormularioTurno from "@/components/turnos/FormularioTurno";

import {
  obtenerMesas,
  asignarTurnoAMesa,
  registrarSalidaClientes,
  iniciarLimpiezaMesa,
  finalizarLimpiezaMesa,
} from "@/services/mesasService";

import { obtenerTurnos, crearTurno } from "@/services/turnosService";

import { obtenerPisos } from "@/services/pisosService";

/*
 * El plano usa Canvas mediante React Konva.
 * Lo cargamos únicamente en el navegador.
 */
const PlanoMesasKonva = dynamic(
  () => import("@/components/mesas/PlanoMesasKonva"),
  {
    ssr: false,

    loading: () => (
      <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-500">Cargando plano...</p>
      </div>
    ),
  },
);

export default function PaginaOperacion() {
  const clienteConsultas = useQueryClient();

  /*
   * Estado exclusivamente visual.
   */
  const [pisoSeleccionadoId, setPisoSeleccionadoId] = useState(null);

  const [mesaSeleccionadaId, setMesaSeleccionadaId] = useState(null);

  const [modalTurnoAbierto, setModalTurnoAbierto] = useState(false);

  const [modalAsignacionManualAbierto, setModalAsignacionManualAbierto] =
    useState(false);

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

  const {
    data: turnos = [],
    isLoading: cargandoTurnos,
    isError: errorTurnos,
  } = useQuery({
    queryKey: ["turnos"],
    queryFn: obtenerTurnos,
  });

  /*
   * Si todavía no existe una selección usamos
   * el primer piso configurado.
   */
  const pisoActualId = pisoSeleccionadoId ?? pisos[0]?.id ?? null;

  const pisoActual = pisos.find((piso) => piso.id === pisoActualId) ?? null;

  const mesasDelPiso = useMemo(() => {
    return mesas.filter((mesa) => mesa.pisoId === pisoActualId);
  }, [mesas, pisoActualId]);

  const mesaSeleccionada = useMemo(() => {
    return mesas.find((mesa) => mesa.id === mesaSeleccionadaId) ?? null;
  }, [mesas, mesaSeleccionadaId]);

  /*
   * Sugerencia automática:
   *
   * - respeta el orden de llegada;
   * - permite grupos iguales o menores a la capacidad;
   * - jamás excede automáticamente la capacidad.
   *
   * Mesa de 4:
   *
   * 1 persona  ✅
   * 2 personas ✅
   * 3 personas ✅
   * 4 personas ✅
   * 5 personas ❌ automático
   */
  const turnoSugerido = useMemo(() => {
    if (!mesaSeleccionada || mesaSeleccionada.estado !== "AVAILABLE") {
      return null;
    }

    return (
      turnos.find((turno) => turno.personas <= mesaSeleccionada.capacidad) ??
      null
    );
  }, [mesaSeleccionada, turnos]);

  /* =====================================================
     ACTUALIZACIÓN DE CACHÉ
  ====================================================== */

  function refrescarOperacion() {
    clienteConsultas.invalidateQueries({
      queryKey: ["mesas"],
    });

    clienteConsultas.invalidateQueries({
      queryKey: ["turnos"],
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

  const mutacionCrearTurno = useMutation({
    mutationFn: crearTurno,

    onSuccess() {
      refrescarOperacion();
    },
  });

  const mutacionAsignar = useMutation({
    mutationFn: ({ idMesa, idTurno, permitirExcesoCapacidad = false }) =>
      asignarTurnoAMesa(idMesa, idTurno, {
        permitirExcesoCapacidad,
      }),

    onSuccess() {
      refrescarOperacion();
    },
  });

  const mutacionSalida = useMutation({
    mutationFn: registrarSalidaClientes,

    onSuccess() {
      refrescarOperacion();
    },
  });

  const mutacionIniciarLimpieza = useMutation({
    mutationFn: iniciarLimpiezaMesa,

    onSuccess() {
      refrescarOperacion();
    },
  });

  const mutacionFinalizarLimpieza = useMutation({
    mutationFn: finalizarLimpiezaMesa,

    onSuccess() {
      refrescarOperacion();
    },
  });

  /* =====================================================
     TURNOS
  ====================================================== */

  async function manejarRegistroTurno(datos) {
    try {
      const turno = await mutacionCrearTurno.mutateAsync(datos);

      setModalTurnoAbierto(false);

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

  /* =====================================================
     ASIGNACIÓN AUTOMÁTICA
  ====================================================== */

  async function manejarAsignacionAutomatica() {
    if (!mesaSeleccionada || !turnoSugerido) {
      return;
    }

    const confirmacion = await Swal.fire({
      icon: "question",

      title: `Asignar ${turnoSugerido.turno}`,

      text: `${turnoSugerido.nombre}, ${turnoSugerido.personas} personas, será enviado a Mesa ${mesaSeleccionada.numero}.`,

      showCancelButton: true,

      confirmButtonText: "Asignar mesa",

      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await mutacionAsignar.mutateAsync({
        idMesa: mesaSeleccionada.id,

        idTurno: turnoSugerido.id,

        permitirExcesoCapacidad: false,
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
     ASIGNACIÓN MANUAL
  ====================================================== */

  async function manejarAsignacionManual(turno) {
    if (!mesaSeleccionada) {
      return;
    }

    const personasExtra = Math.max(
      0,
      turno.personas - mesaSeleccionada.capacidad,
    );

    const excedeCapacidad = personasExtra > 0;

    if (!excedeCapacidad) {
      const confirmacion = await Swal.fire({
        icon: "question",

        title: `Asignar ${turno.turno}`,

        text: `${turno.nombre}, ${turno.personas} personas, será asignado a Mesa ${mesaSeleccionada.numero}.`,

        showCancelButton: true,

        confirmButtonText: "Asignar",

        cancelButtonText: "Cancelar",
      });

      if (!confirmacion.isConfirmed) {
        return;
      }
    }

    if (excedeCapacidad) {
      const confirmacion = await Swal.fire({
        icon: "warning",

        title: "El grupo excede la capacidad",

        html: `
            <div style="text-align:left; line-height:1.6">
              <p>
                La <strong>Mesa ${mesaSeleccionada.numero}</strong>
                tiene capacidad configurada para
                <strong>${mesaSeleccionada.capacidad} personas</strong>.
              </p>

              <p style="margin-top:10px">
                El grupo <strong>${turno.turno}</strong>
                tiene
                <strong>${turno.personas} personas</strong>.
              </p>

              <p style="margin-top:10px">
                Se necesitan
                <strong>${personasExtra} lugar(es) adicional(es)</strong>.
              </p>

              <p style="margin-top:10px">
                Confirma únicamente si físicamente es posible
                realizar esta asignación, por ejemplo agregando
                una silla.
              </p>
            </div>
          `,

        showCancelButton: true,

        confirmButtonText: "Asignar de todas formas",

        cancelButtonText: "Cancelar",

        confirmButtonColor: "#d97706",
      });

      if (!confirmacion.isConfirmed) {
        return;
      }
    }

    try {
      await mutacionAsignar.mutateAsync({
        idMesa: mesaSeleccionada.id,

        idTurno: turno.id,

        permitirExcesoCapacidad: excedeCapacidad,
      });

      setModalAsignacionManualAbierto(false);

      await Swal.fire({
        icon: "success",

        title: "Mesa asignada",

        text: excedeCapacidad
          ? `Se registró una excepción de capacidad para Mesa ${mesaSeleccionada.numero}.`
          : `${turno.turno} fue asignado a Mesa ${mesaSeleccionada.numero}.`,

        timer: 1600,
        showConfirmButton: false,
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
     CICLO OPERATIVO DE LA MESA
  ====================================================== */

  async function manejarSalidaClientes() {
    if (!mesaSeleccionada) {
      return;
    }

    const confirmacion = await Swal.fire({
      icon: "question",

      title: "¿Los clientes se retiraron?",

      text: `Mesa ${mesaSeleccionada.numero} quedará pendiente de limpieza.`,

      showCancelButton: true,

      confirmButtonText: "Confirmar salida",

      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await mutacionSalida.mutateAsync(mesaSeleccionada.id);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo actualizar",
        text: error.message,
      });
    }
  }

  async function manejarInicioLimpieza() {
    if (!mesaSeleccionada) {
      return;
    }

    try {
      await mutacionIniciarLimpieza.mutateAsync(mesaSeleccionada.id);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo iniciar la limpieza",
        text: error.message,
      });
    }
  }

  async function manejarFinLimpieza() {
    if (!mesaSeleccionada) {
      return;
    }

    try {
      await mutacionFinalizarLimpieza.mutateAsync(mesaSeleccionada.id);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo finalizar la limpieza",
        text: error.message,
      });
    }
  }

  /* =====================================================
     CARGA / ERROR
  ====================================================== */

  if (cargandoPisos || cargandoMesas || cargandoTurnos) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-slate-500">Cargando operación...</p>
        </div>
      </div>
    );
  }

  if (errorPisos || errorMesas || errorTurnos) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <p className="font-semibold text-rose-800">
          No se pudo cargar la operación.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1500px] min-w-0">
        {/* =================================================
            ENCABEZADO
        ================================================== */}

        <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-medium text-emerald-600">Operación</p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
              Estado del restaurante
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Consulta el plano del restaurante, administra la lista de espera y
              controla el estado de cada mesa.
            </p>
          </div>

          {/* Selector de piso */}
          <div className="flex flex-wrap gap-2">
            {pisos.map((piso) => (
              <button
                key={piso.id}
                type="button"
                onClick={() => {
                  setPisoSeleccionadoId(piso.id);

                  setMesaSeleccionadaId(null);
                }}
                className={
                  pisoActualId === piso.id
                    ? "rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    : "rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                }
              >
                {piso.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* =================================================
            PLANO + LISTA DE ESPERA
        ================================================== */}

        <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            {/* Plano */}
            <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
              <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {pisoActual?.nombre ?? "Sin piso"}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {mesasDelPiso.length}{" "}
                      {mesasDelPiso.length === 1 ? "mesa" : "mesas"}
                    </p>
                  </div>
                </div>

                {/* Leyenda */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    Disponible
                  </span>

                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    Ocupada
                  </span>

                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    Sucia
                  </span>

                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    Limpieza
                  </span>
                </div>
              </div>

              {mesasDelPiso.length > 0 ? (
                <PlanoMesasKonva
                  mesas={mesasDelPiso}
                  editable={false}
                  mesaSeleccionadaId={mesaSeleccionadaId}
                  onSeleccionarMesa={setMesaSeleccionadaId}
                />
              ) : (
                <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <div>
                    <MapPin size={34} className="mx-auto text-slate-300" />

                    <p className="mt-4 font-semibold text-slate-700">
                      Este piso no tiene mesas
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Puedes agregarlas desde Configuración.
                    </p>
                  </div>
                </div>
              )}
            </article>

            {/* =================================================
                PANEL DE MESA SELECCIONADA
            ================================================== */}

            {mesaSeleccionada && (
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Mesa seleccionada
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-950">
                      Mesa {mesaSeleccionada.numero}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Capacidad configurada: {mesaSeleccionada.capacidad}{" "}
                      {mesaSeleccionada.capacidad === 1
                        ? "persona"
                        : "personas"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMesaSeleccionadaId(null)}
                    className="text-sm font-medium text-slate-400 transition hover:text-slate-700"
                  >
                    Cerrar
                  </button>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-5">
                  {/* =========================================
                      DISPONIBLE
                  ========================================== */}

                  {mesaSeleccionada.estado === "AVAILABLE" && (
                    <div className="space-y-4">
                      {turnoSugerido ? (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                          <div className="flex gap-3">
                            <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" />

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-emerald-900">
                                Grupo compatible sugerido
                              </p>

                              <p className="mt-1 text-sm text-emerald-700">
                                {turnoSugerido.turno} · {turnoSugerido.nombre} ·{" "}
                                {turnoSugerido.personas} personas
                              </p>

                              <p className="mt-2 text-xs leading-5 text-emerald-700/80">
                                Es el primer grupo de la fila que cabe dentro de
                                la capacidad de esta mesa.
                              </p>

                              <button
                                type="button"
                                disabled={mutacionAsignar.isPending}
                                onClick={manejarAsignacionAutomatica}
                                className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                              >
                                Asignar grupo sugerido
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-700">
                            Sin grupo compatible automáticamente
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            Puedes elegir manualmente otro grupo si la operación
                            permite realizar una excepción.
                          </p>
                        </div>
                      )}

                      {turnos.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setModalAsignacionManualAbierto(true)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <UserRoundPlus size={17} />
                          Asignar manualmente
                        </button>
                      )}
                    </div>
                  )}

                  {/* =========================================
                      OCUPADA
                  ========================================== */}

                  {mesaSeleccionada.estado === "OCCUPIED" && (
                    <div>
                      {mesaSeleccionada.turnoAsignado ? (
                        <div className="rounded-xl bg-slate-50 p-4">
                          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div>
                              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                Grupo actual
                              </p>

                              <p className="mt-1 font-semibold text-slate-900">
                                {mesaSeleccionada.turnoAsignado.turno} ·{" "}
                                {mesaSeleccionada.turnoAsignado.nombre}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                              <Users size={16} />
                              {mesaSeleccionada.turnoAsignado.personas} personas
                            </div>
                          </div>

                          {mesaSeleccionada.turnoAsignado.excedeCapacidad && (
                            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                              <AlertTriangle
                                size={16}
                                className="mt-0.5 shrink-0 text-amber-600"
                              />

                              <div>
                                <p className="text-xs font-semibold text-amber-800">
                                  Excepción de capacidad
                                </p>

                                <p className="mt-1 text-xs leading-5 text-amber-700">
                                  Se agregaron{" "}
                                  {mesaSeleccionada.turnoAsignado.personasExtra}{" "}
                                  lugar(es) adicionales para esta asignación.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">
                          La mesa se encuentra ocupada.
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={manejarSalidaClientes}
                        disabled={mutacionSalida.isPending}
                        className="mt-4 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
                      >
                        Clientes se retiraron
                      </button>
                    </div>
                  )}

                  {/* =========================================
                      SUCIA
                  ========================================== */}

                  {mesaSeleccionada.estado === "DIRTY" && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex gap-3">
                        <Sparkles className="mt-0.5 shrink-0 text-amber-600" />

                        <div>
                          <p className="font-semibold text-amber-900">
                            Pendiente de limpieza
                          </p>

                          <p className="mt-1 text-xs leading-5 text-amber-700">
                            La mesa debe limpiarse antes de volver a recibir
                            clientes.
                          </p>

                          <button
                            type="button"
                            disabled={mutacionIniciarLimpieza.isPending}
                            onClick={manejarInicioLimpieza}
                            className="mt-4 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
                          >
                            Iniciar limpieza
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =========================================
                      LIMPIEZA
                  ========================================== */}

                  {mesaSeleccionada.estado === "CLEANING" && (
                    <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                      <div className="flex gap-3">
                        <Sparkles className="mt-0.5 shrink-0 text-orange-600" />

                        <div>
                          <p className="font-semibold text-orange-900">
                            Limpieza en proceso
                          </p>

                          <p className="mt-1 text-xs leading-5 text-orange-700">
                            Cuando termine, confirma para dejar la mesa
                            disponible nuevamente.
                          </p>

                          <button
                            type="button"
                            disabled={mutacionFinalizarLimpieza.isPending}
                            onClick={manejarFinLimpieza}
                            className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            Finalizar limpieza
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            )}
          </div>

          {/* =================================================
              LISTA DE ESPERA
          ================================================== */}

          <aside className="h-fit w-full min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Lista de espera
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {turnos.length}{" "}
                  {turnos.length === 1 ? "grupo esperando" : "grupos esperando"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalTurnoAbierto(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700"
                aria-label="Registrar grupo"
              >
                <Plus size={18} />
              </button>
            </div>

            {turnos.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {turnos.map((turno, indice) => (
                  <div key={turno.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                        {turno.turno}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {turno.nombre}
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <Users size={13} />
                          {turno.personas} personas
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-400">
                      <span>Posición #{indice + 1}</span>

                      <span className="flex items-center gap-1">
                        <Clock3 size={12} />

                        {new Date(turno.fechaHoraLlegada).toLocaleTimeString(
                          "es-MX",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <CheckCircle2 size={30} className="mx-auto text-emerald-500" />

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Sin clientes esperando
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  La lista de espera está vacía.
                </p>
              </div>
            )}

            <div className="border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={() => setModalTurnoAbierto(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Plus size={17} />
                Registrar grupo
              </button>
            </div>
          </aside>
        </section>
      </div>

      {/* =================================================
          MODAL NUEVO TURNO
      ================================================== */}

      <Modal
        abierto={modalTurnoAbierto}
        titulo="Registrar nuevo grupo"
        descripcion="Agrega clientes a la lista de espera."
        onCerrar={() => setModalTurnoAbierto(false)}
      >
        <FormularioTurno
          onRegistrar={manejarRegistroTurno}
          onCancelar={() => setModalTurnoAbierto(false)}
        />
      </Modal>

      {/* =================================================
          MODAL ASIGNACIÓN MANUAL
      ================================================== */}

      <Modal
        abierto={modalAsignacionManualAbierto}
        titulo={
          mesaSeleccionada
            ? `Asignar Mesa ${mesaSeleccionada.numero}`
            : "Asignación manual"
        }
        descripcion={
          mesaSeleccionada
            ? `Capacidad configurada: ${mesaSeleccionada.capacidad} personas.`
            : ""
        }
        onCerrar={() => setModalAsignacionManualAbierto(false)}
      >
        <div className="space-y-3">
          {turnos.length > 0 ? (
            turnos.map((turno) => {
              const personasExtra = mesaSeleccionada
                ? Math.max(0, turno.personas - mesaSeleccionada.capacidad)
                : 0;

              const excedeCapacidad = personasExtra > 0;

              return (
                <button
                  key={turno.id}
                  type="button"
                  disabled={mutacionAsignar.isPending}
                  onClick={() => manejarAsignacionManual(turno)}
                  className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">
                      {turno.turno}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {turno.nombre}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {turno.personas}{" "}
                        {turno.personas === 1 ? "persona" : "personas"}
                      </p>
                    </div>
                  </div>

                  {excedeCapacidad ? (
                    <div className="shrink-0 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        <AlertTriangle size={13} />+{personasExtra}
                      </span>

                      <p className="mt-1 text-[10px] text-slate-400">
                        requiere excepción
                      </p>
                    </div>
                  ) : (
                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Compatible
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center">
              <Users size={30} className="mx-auto text-slate-300" />

              <p className="mt-3 text-sm font-semibold text-slate-700">
                No hay grupos esperando
              </p>
            </div>
          )}

          <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">
            <p className="text-xs leading-5 text-sky-700">
              Un grupo que excede la capacidad nunca será recomendado
              automáticamente. La hostess puede autorizar manualmente la
              excepción si físicamente es posible agregar lugares.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
