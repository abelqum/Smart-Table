"use client";

import { useMemo, useState } from "react";

import dynamic from "next/dynamic";

import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Swal from "sweetalert2";

import Modal from "@/components/ui/Modal";

import FormularioTurno from "@/components/turnos/FormularioTurno";

import {
  asignarTurnoAMesa,
  finalizarLimpiezaMesa,
  iniciarLimpiezaMesa,
  obtenerMesas,
  registrarSalidaClientes,
} from "@/services/mesasService";

import {
  actualizarTurno,
  cancelarTurno,
  crearTurno,
  llamarTurno,
  obtenerTurnos,
  obtenerTurnosParaMesa,
} from "@/services/turnosService";

import { obtenerPisos } from "@/services/pisosService";

import { obtenerPerfil } from "@/services/authService";

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

const nombresEstado = {
  AVAILABLE: "Disponible",

  OCCUPIED: "Ocupada",

  DIRTY: "Pendiente de limpieza",

  CLEANING: "En limpieza",

  BLOCKED: "Bloqueada",
};

const clasesEstado = {
  AVAILABLE: "bg-emerald-50 text-emerald-700",

  OCCUPIED: "bg-rose-50 text-rose-700",

  DIRTY: "bg-amber-50 text-amber-700",

  CLEANING: "bg-orange-50 text-orange-700",

  BLOCKED: "bg-slate-100 text-slate-600",
};

export default function PaginaOperacion() {
  const clienteConsultas = useQueryClient();

  const [pisoSeleccionadoId, setPisoSeleccionadoId] = useState(null);

  const [mesaSeleccionadaId, setMesaSeleccionadaId] = useState(null);

  const [modalTurnoAbierto, setModalTurnoAbierto] = useState(false);

  const [turnoEditando, setTurnoEditando] = useState(null);

  const { data: usuario } = useQuery({
    queryKey: ["sesion"],

    queryFn: obtenerPerfil,

    staleTime: 5 * 60 * 1000,
  });

  const puedeAdministrarTurnos = ["ADMIN", "HOSTESS"].includes(usuario?.rol);

  const puedeConfirmarCliente = ["ADMIN", "HOSTESS", "WAITER"].includes(
    usuario?.rol,
  );

  const puedeRegistrarSalida = ["ADMIN", "HOSTESS", "WAITER"].includes(
    usuario?.rol,
  );

  const puedeGestionarLimpieza = ["ADMIN", "HOSTESS", "CLEANING"].includes(
    usuario?.rol,
  );

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

    enabled: puedeAdministrarTurnos,
  });

  const pisoActualId = pisoSeleccionadoId ?? pisos[0]?.id ?? null;

  const pisoActual = pisos.find((piso) => piso.id === pisoActualId) ?? null;

  const mesasDelPiso = useMemo(
    () => mesas.filter((mesa) => mesa.pisoId === pisoActualId),

    [mesas, pisoActualId],
  );

  const mesaSeleccionada = useMemo(
    () => mesas.find((mesa) => mesa.id === mesaSeleccionadaId) ?? null,

    [mesas, mesaSeleccionadaId],
  );

  const {
    data: contextoMesa = null,

    isLoading: cargandoTurnosMesa,

    isError: errorTurnosMesa,
  } = useQuery({
    queryKey: ["turnos", "para-mesa", mesaSeleccionada?.id],

    queryFn: () => obtenerTurnosParaMesa(mesaSeleccionada.id),

    enabled: Boolean(
      puedeConfirmarCliente &&
      mesaSeleccionada?.id &&
      mesaSeleccionada.estado === "AVAILABLE",
    ),
  });

  function refrescarOperacion() {
    clienteConsultas.invalidateQueries({
      queryKey: ["mesas"],
    });

    clienteConsultas.invalidateQueries({
      queryKey: ["turnos"],
    });

    clienteConsultas.invalidateQueries({
      queryKey: ["turno-actual"],
    });

    clienteConsultas.invalidateQueries({
      queryKey: ["dashboard"],
    });

    clienteConsultas.invalidateQueries({
      queryKey: ["eventos"],
    });

    if (mesaSeleccionadaId) {
      clienteConsultas.invalidateQueries({
        queryKey: ["turnos", "para-mesa", mesaSeleccionadaId],
      });
    }
  }

  const mutacionCrearTurno = useMutation({
    mutationFn: crearTurno,

    onSuccess: refrescarOperacion,
  });

  const mutacionActualizarTurno = useMutation({
    mutationFn: ({ idTurno, datos }) => actualizarTurno(idTurno, datos),

    onSuccess: refrescarOperacion,
  });

  const mutacionCancelarTurno = useMutation({
    mutationFn: cancelarTurno,

    onSuccess: refrescarOperacion,
  });

  const mutacionLlamarTurno = useMutation({
    mutationFn: llamarTurno,

    onSuccess: refrescarOperacion,
  });

  const mutacionAsignar = useMutation({
    mutationFn: ({ idMesa, idTurno, permitirExcesoCapacidad }) =>
      asignarTurnoAMesa(idMesa, idTurno, {
        permitirExcesoCapacidad,
      }),

    onSuccess: refrescarOperacion,
  });

  const mutacionSalida = useMutation({
    mutationFn: registrarSalidaClientes,

    onSuccess: refrescarOperacion,
  });

  const mutacionIniciarLimpieza = useMutation({
    mutationFn: iniciarLimpiezaMesa,

    onSuccess: refrescarOperacion,
  });

  const mutacionFinalizarLimpieza = useMutation({
    mutationFn: finalizarLimpiezaMesa,

    onSuccess: refrescarOperacion,
  });

  function seleccionarPiso(idPiso) {
    setPisoSeleccionadoId(idPiso);

    setMesaSeleccionadaId(null);
  }

  function abrirNuevoTurno() {
    setTurnoEditando(null);

    setModalTurnoAbierto(true);
  }

  function abrirEdicionTurno(turno) {
    setTurnoEditando(turno);

    setModalTurnoAbierto(true);
  }

  function cerrarModalTurno() {
    setModalTurnoAbierto(false);

    setTurnoEditando(null);
  }

  async function manejarGuardarTurno(datos) {
    try {
      if (turnoEditando) {
        const turno = await mutacionActualizarTurno.mutateAsync({
          idTurno: turnoEditando.id,

          datos,
        });

        cerrarModalTurno();

        await Swal.fire({
          icon: "success",

          title: "Turno actualizado",

          text: `Turno #${turno.numero} fue actualizado correctamente.`,

          timer: 1400,

          showConfirmButton: false,
        });

        return true;
      }

      const turno = await mutacionCrearTurno.mutateAsync(datos);

      cerrarModalTurno();

      await Swal.fire({
        icon: "success",

        title: "Turno registrado",

        text: `Turno #${turno.numero} fue agregado a la lista de espera.`,
      });

      return true;
    } catch (error) {
      await Swal.fire({
        icon: "error",

        title: turnoEditando ? "No se pudo actualizar" : "No se pudo registrar",

        text: error.message,
      });

      return false;
    }
  }

  async function manejarLlamarTurno(turno) {
    const confirmacion = await Swal.fire({
      icon: "question",

      title: `Llamar Turno #${turno.numero}`,

      text: `${turno.nombre} · ${turno.personas} ${
        turno.personas === 1 ? "persona" : "personas"
      }`,

      showCancelButton: true,

      confirmButtonText: turno.llamadoEn ? "Volver a llamar" : "Llamar turno",

      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await mutacionLlamarTurno.mutateAsync(turno.id);
    } catch (error) {
      await Swal.fire({
        icon: "error",

        title: "No se pudo llamar el turno",

        text: error.message,
      });
    }
  }

  async function manejarCancelarTurno(turno) {
    const confirmacion = await Swal.fire({
      icon: "warning",

      title: `Cancelar Turno #${turno.numero}`,

      html: `
          <div style="line-height:1.7">
            <strong>${turno.nombre}</strong><br />

            ${turno.personas}
            ${turno.personas === 1 ? "persona" : "personas"}

            <p
              style="
                margin-top:12px;
                color:#64748b;
                font-size:14px;
              "
            >
              El turno saldrá de la lista
              de espera, pero permanecerá
              en el historial.
            </p>
          </div>
        `,

      showCancelButton: true,

      confirmButtonText: "Sí, cancelar turno",

      cancelButtonText: "No cancelar",

      confirmButtonColor: "#e11d48",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await mutacionCancelarTurno.mutateAsync(turno.id);

      await Swal.fire({
        icon: "success",

        title: "Turno cancelado",

        timer: 1300,

        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",

        title: "No se pudo cancelar",

        text: error.message,
      });
    }
  }

  async function manejarAsignacion(turno) {
    if (!mesaSeleccionada) {
      return;
    }

    const personasExtra = Math.max(
      0,

      turno.personas - mesaSeleccionada.capacidad,
    );

    const excedeCapacidad = personasExtra > 0;

    const confirmacion = await Swal.fire({
      icon: excedeCapacidad ? "warning" : "question",

      title: excedeCapacidad
        ? "Confirmar excepción de capacidad"
        : `Confirmar Turno #${turno.numero}`,

      html: `
          <div style="text-align:left; line-height:1.7">

            <p>
              <strong>
                Mesa ${mesaSeleccionada.numero}
              </strong>

              · capacidad ${mesaSeleccionada.capacidad}
            </p>

            <p style="margin-top:8px">

              <strong>
                Turno #${turno.numero}
              </strong>

              · ${turno.nombre}
            </p>

            <p>
              ${turno.personas}
              ${turno.personas === 1 ? "persona" : "personas"}
            </p>

            ${
              excedeCapacidad
                ? `
                  <p
                    style="
                      margin-top:10px;
                      color:#b45309
                    "
                  >
                    El grupo excede
                    la capacidad por
                    <strong>
                      ${personasExtra}
                    </strong>
                    persona(s).
                  </p>
                `
                : ""
            }

            <p
              style="
                margin-top:12px;
                color:#64748b
              "
            >
              Confirma únicamente
              cuando el cliente ya
              se encuentre físicamente
              en esta mesa y se haya
              verificado su nombre y
              número de turno.
            </p>
          </div>
        `,

      showCancelButton: true,

      confirmButtonText: excedeCapacidad
        ? "Autorizar y confirmar"
        : "Confirmar en esta mesa",

      cancelButtonText: "Cancelar",

      confirmButtonColor: excedeCapacidad ? "#d97706" : undefined,
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await mutacionAsignar.mutateAsync({
        idMesa: mesaSeleccionada.id,

        idTurno: turno.id,

        permitirExcesoCapacidad: excedeCapacidad,
      });

      await Swal.fire({
        icon: "success",

        title: "Cliente confirmado",

        text: `Turno #${turno.numero} quedó registrado en Mesa ${mesaSeleccionada.numero}.`,

        timer: 1500,

        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",

        title: "No se pudo confirmar la mesa",

        text: error.message,
      });
    }
  }

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

    const confirmacion = await Swal.fire({
      icon: "question",

      title: `Iniciar limpieza de Mesa ${mesaSeleccionada.numero}`,

      showCancelButton: true,

      confirmButtonText: "Iniciar limpieza",

      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
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

    const confirmacion = await Swal.fire({
      icon: "question",

      title: `Finalizar limpieza de Mesa ${mesaSeleccionada.numero}`,

      text: "La mesa volverá a estar disponible.",

      showCancelButton: true,

      confirmButtonText: "Finalizar limpieza",

      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
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
        <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
          <div>
            <p className="text-sm font-medium text-emerald-600">Operación</p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
              Estado del restaurante
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Consulta el plano y la lista de espera. La relación entre un turno
              y una mesa se confirma únicamente cuando el cliente ya está
              físicamente en ella.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {pisos.map((piso) => (
              <button
                key={piso.id}
                type="button"
                onClick={() => seleccionarPiso(piso.id)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  piso.id === pisoActualId
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {piso.nombre}
              </button>
            ))}
          </div>
        </div>

        <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs font-medium text-slate-600 shadow-sm">
              <span className="font-semibold text-slate-900">
                {pisoActual?.nombre ?? "Zona"}
              </span>

              <span className="h-4 w-px bg-slate-200" />

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

            <PlanoMesasKonva
              mesas={mesasDelPiso}
              mesaSeleccionadaId={mesaSeleccionadaId}
              onSeleccionarMesa={setMesaSeleccionadaId}
            />
          </div>

          <aside className="h-fit min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-24">
            {!mesaSeleccionada ? (
              puedeAdministrarTurnos ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-200 p-5">
                    <div>
                      <h2 className="font-semibold text-slate-900">
                        Lista de espera
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        {turnos.length}{" "}
                        {turnos.length === 1
                          ? "turno esperando"
                          : "turnos esperando"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={abrirNuevoTurno}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700"
                      aria-label="Registrar turno"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  {turnos.length > 0 ? (
                    <div className="max-h-[650px] divide-y divide-slate-100 overflow-y-auto">
                      {turnos.map((turno) => (
                        <article key={turno.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 min-w-20 shrink-0 items-center justify-center rounded-xl bg-slate-900 px-2 text-xs font-bold text-white">
                              Turno #{turno.numero}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {turno.nombre}
                              </p>

                              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                <Users size={13} />
                                {turno.personas}{" "}
                                {turno.personas === 1 ? "persona" : "personas"}
                              </p>

                              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                <MapPin size={13} />

                                {turno.pisoPreferido?.nombre ??
                                  "Sin preferencia"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <Clock3 size={12} />

                              {new Date(
                                turno.fechaHoraLlegada,
                              ).toLocaleTimeString("es-MX", {
                                hour: "2-digit",

                                minute: "2-digit",
                              })}
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => manejarLlamarTurno(turno)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700"
                                aria-label={`Llamar Turno #${turno.numero}`}
                                title="Llamar turno"
                              >
                                <BellRing size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() => abrirEdicionTurno(turno)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-sky-50 hover:text-sky-700"
                                aria-label={`Editar Turno #${turno.numero}`}
                                title="Editar turno"
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() => manejarCancelarTurno(turno)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                                aria-label={`Cancelar Turno #${turno.numero}`}
                                title="Cancelar turno"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {turno.llamadoEn && (
                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              <BellRing size={12} />
                              Llamado a las{" "}
                              {new Date(turno.llamadoEn).toLocaleTimeString(
                                "es-MX",
                                {
                                  hour: "2-digit",

                                  minute: "2-digit",
                                },
                              )}
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <CheckCircle2
                        size={30}
                        className="mx-auto text-emerald-500"
                      />

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
                      onClick={abrirNuevoTurno}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <Plus size={17} />
                      Registrar turno
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-6">
                  <h2 className="font-semibold text-slate-900">
                    Operación de mesas
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Selecciona una mesa en el plano para consultar su estado y
                    las acciones disponibles para tu rol.
                  </p>

                  <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                    {usuario?.rol === "WAITER"
                      ? "Como mesero puedes confirmar clientes en mesas disponibles y registrar cuando se retiran."
                      : "Como personal de limpieza puedes iniciar y finalizar la limpieza de las mesas."}
                  </div>
                </div>
              )
            ) : (
              <>
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                      Mesa seleccionada
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-950">
                      Mesa {mesaSeleccionada.numero}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {pisoActual?.nombre ?? "Zona"} ·{" "}
                      {mesaSeleccionada.capacidad}{" "}
                      {mesaSeleccionada.capacidad === 1
                        ? "persona"
                        : "personas"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMesaSeleccionadaId(null)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Cerrar mesa seleccionada"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="p-5">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      clasesEstado[mesaSeleccionada.estado] ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {nombresEstado[mesaSeleccionada.estado] ??
                      mesaSeleccionada.estado}
                  </span>

                  {mesaSeleccionada.estado === "AVAILABLE" &&
                    (puedeConfirmarCliente ? (
                      <div className="mt-5">
                        <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
                          <p className="text-sm font-semibold text-sky-900">
                            Confirmación física de la mesa
                          </p>

                          <p className="mt-1 text-xs leading-5 text-sky-700">
                            Selecciona al cliente únicamente cuando ya esté en
                            esta mesa y haya confirmado su nombre y número de
                            turno.
                          </p>
                        </div>

                        <h3 className="mt-5 text-sm font-semibold text-slate-900">
                          Turnos disponibles
                        </h3>

                        {cargandoTurnosMesa ? (
                          <p className="mt-4 text-sm text-slate-500">
                            Cargando turnos...
                          </p>
                        ) : errorTurnosMesa ? (
                          <p className="mt-4 text-sm text-rose-600">
                            No se pudieron cargar los turnos para esta mesa.
                          </p>
                        ) : contextoMesa?.turnos?.length > 0 ? (
                          <div className="mt-3 max-h-[430px] space-y-2 overflow-y-auto pr-1">
                            {contextoMesa.turnos.map((turno) => {
                              const personasExtra = Math.max(
                                0,

                                turno.personas - mesaSeleccionada.capacidad,
                              );

                              return (
                                <button
                                  key={turno.id}
                                  type="button"
                                  disabled={mutacionAsignar.isPending}
                                  onClick={() => manejarAsignacion(turno)}
                                  className="w-full rounded-xl border border-slate-200 p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40 disabled:opacity-50"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-sm font-bold text-slate-900">
                                        Turno #{turno.numero}
                                      </p>

                                      <p className="mt-1 truncate text-sm font-medium text-slate-700">
                                        {turno.nombre}
                                      </p>

                                      <p className="mt-1 text-xs text-slate-500">
                                        {turno.personas}{" "}
                                        {turno.personas === 1
                                          ? "persona"
                                          : "personas"}{" "}
                                        ·{" "}
                                        {turno.pisoPreferido?.nombre ??
                                          "Sin preferencia"}
                                      </p>
                                    </div>

                                    <div className="shrink-0 text-right">
                                      {turno.cabeEnMesa ? (
                                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                          Compatible
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                                          <AlertTriangle size={12} />+
                                          {personasExtra}
                                        </span>
                                      )}

                                      {turno.coincidePreferencia && (
                                        <p className="mt-2 text-[10px] font-semibold text-sky-600">
                                          Prefiere esta zona
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-center">
                            <Users
                              size={26}
                              className="mx-auto text-slate-300"
                            />

                            <p className="mt-2 text-sm font-semibold text-slate-700">
                              No hay turnos esperando
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-xl bg-slate-50 p-4">
                        <p className="text-sm font-semibold text-slate-700">
                          Sin acciones disponibles
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Tu rol no puede asignar clientes a una mesa
                          disponible.
                        </p>
                      </div>
                    ))}

                  {mesaSeleccionada.estado === "OCCUPIED" && (
                    <div className="mt-5">
                      {mesaSeleccionada.turnoAsignado ? (
                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                            Cliente confirmado
                          </p>

                          <p className="mt-2 text-lg font-bold text-slate-900">
                            Turno #{mesaSeleccionada.turnoAsignado.numero}
                          </p>

                          <p className="mt-1 font-semibold text-slate-700">
                            {mesaSeleccionada.turnoAsignado.nombre}
                          </p>

                          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                            <Users size={15} />
                            {mesaSeleccionada.turnoAsignado.personas}{" "}
                            {mesaSeleccionada.turnoAsignado.personas === 1
                              ? "persona"
                              : "personas"}
                          </p>

                          {mesaSeleccionada.turnoAsignado.excedeCapacidad && (
                            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                              <AlertTriangle
                                size={16}
                                className="mt-0.5 shrink-0 text-amber-600"
                              />

                              <p className="text-xs leading-5 text-amber-700">
                                Se autorizó una excepción de{" "}
                                {mesaSeleccionada.turnoAsignado.personasExtra}{" "}
                                lugar(es).
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">
                          La mesa se encuentra ocupada.
                        </p>
                      )}

                      {puedeRegistrarSalida && (
                        <button
                          type="button"
                          onClick={manejarSalidaClientes}
                          disabled={mutacionSalida.isPending}
                          className="mt-4 w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
                        >
                          Clientes se retiraron
                        </button>
                      )}
                    </div>
                  )}

                  {mesaSeleccionada.estado === "DIRTY" && (
                    <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
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
                        </div>
                      </div>

                      {puedeGestionarLimpieza && (
                        <button
                          type="button"
                          disabled={mutacionIniciarLimpieza.isPending}
                          onClick={manejarInicioLimpieza}
                          className="mt-4 w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
                        >
                          Iniciar limpieza
                        </button>
                      )}
                    </div>
                  )}

                  {mesaSeleccionada.estado === "CLEANING" && (
                    <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-4">
                      <div className="flex gap-3">
                        <Sparkles className="mt-0.5 shrink-0 text-orange-600" />

                        <div>
                          <p className="font-semibold text-orange-900">
                            Limpieza en proceso
                          </p>

                          <p className="mt-1 text-xs leading-5 text-orange-700">
                            Confirma cuando la mesa esté lista para recibir
                            clientes nuevamente.
                          </p>
                        </div>
                      </div>

                      {puedeGestionarLimpieza && (
                        <button
                          type="button"
                          disabled={mutacionFinalizarLimpieza.isPending}
                          onClick={manejarFinLimpieza}
                          className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Finalizar limpieza
                        </button>
                      )}
                    </div>
                  )}

                  {mesaSeleccionada.estado === "BLOCKED" && (
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-700">
                        Mesa bloqueada
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Esta mesa no puede utilizarse en este momento.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </aside>
        </section>
      </div>

      <Modal
        abierto={modalTurnoAbierto}
        titulo={
          turnoEditando
            ? `Editar Turno #${turnoEditando.numero}`
            : "Registrar nuevo turno"
        }
        descripcion={
          turnoEditando
            ? "Actualiza los datos mientras el turno continúe en espera."
            : "Agrega un cliente a la lista de espera."
        }
        onCerrar={cerrarModalTurno}
      >
        <FormularioTurno
          key={turnoEditando?.id ?? "nuevo-turno-operacion"}
          pisos={pisos}
          turnoInicial={turnoEditando}
          onGuardar={manejarGuardarTurno}
          onCancelar={cerrarModalTurno}
        />
      </Modal>
    </>
  );
}
