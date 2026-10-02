"use client";

import { useState } from "react";

import {
  BellRing,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Swal from "sweetalert2";

import Modal from "@/components/ui/Modal";

import FormularioTurno from "@/components/turnos/FormularioTurno";

import {
  actualizarTurno,
  cancelarTurno,
  crearTurno,
  llamarTurno,
  obtenerTurnos,
} from "@/services/turnosService";

import { obtenerPisos } from "@/services/pisosService";

export default function PaginaTurnos() {
  const clienteConsultas = useQueryClient();

  const [modalAbierto, setModalAbierto] = useState(false);

  const [turnoEditando, setTurnoEditando] = useState(null);

  const {
    data: turnos = [],

    isLoading: cargandoTurnos,

    isError: errorTurnos,
  } = useQuery({
    queryKey: ["turnos"],

    queryFn: obtenerTurnos,
  });

  const {
    data: pisos = [],

    isLoading: cargandoPisos,

    isError: errorPisos,
  } = useQuery({
    queryKey: ["pisos"],

    queryFn: obtenerPisos,
  });

  function refrescarDatos() {
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
  }

  const mutacionCrear = useMutation({
    mutationFn: crearTurno,

    onSuccess: refrescarDatos,
  });

  const mutacionActualizar = useMutation({
    mutationFn: ({ idTurno, datos }) => actualizarTurno(idTurno, datos),

    onSuccess: refrescarDatos,
  });

  const mutacionCancelar = useMutation({
    mutationFn: cancelarTurno,

    onSuccess: refrescarDatos,
  });

  const mutacionLlamar = useMutation({
    mutationFn: llamarTurno,

    onSuccess: refrescarDatos,
  });

  function abrirNuevoTurno() {
    setTurnoEditando(null);

    setModalAbierto(true);
  }

  function abrirEdicion(turno) {
    setTurnoEditando(turno);

    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);

    setTurnoEditando(null);
  }

  async function manejarGuardar(datos) {
    try {
      if (turnoEditando) {
        const turno = await mutacionActualizar.mutateAsync({
          idTurno: turnoEditando.id,

          datos,
        });

        cerrarModal();

        await Swal.fire({
          icon: "success",

          title: "Turno actualizado",

          text: `Turno #${turno.numero} fue actualizado correctamente.`,

          timer: 1500,

          showConfirmButton: false,
        });

        return true;
      }

      const turno = await mutacionCrear.mutateAsync(datos);

      cerrarModal();

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

  async function manejarLlamar(turno) {
    const confirmacion = await Swal.fire({
      icon: "question",

      title: `Llamar Turno #${turno.numero}`,

      html: `
          <div style="line-height:1.7">
            <strong>${turno.nombre}</strong><br />
            ${turno.personas}
            ${turno.personas === 1 ? "persona" : "personas"}
          </div>
        `,

      showCancelButton: true,

      confirmButtonText: turno.llamadoEn ? "Volver a llamar" : "Llamar turno",

      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await mutacionLlamar.mutateAsync(turno.id);

      await Swal.fire({
        icon: "success",

        title: `Turno #${turno.numero} llamado`,

        timer: 1300,

        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",

        title: "No se pudo llamar el turno",

        text: error.message,
      });
    }
  }

  async function manejarCancelacion(turno) {
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
              El turno dejará de aparecer
              en la lista de espera,
              pero permanecerá en el historial.
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
      await mutacionCancelar.mutateAsync(turno.id);

      await Swal.fire({
        icon: "success",

        title: "Turno cancelado",

        text: `Turno #${turno.numero} fue retirado de la lista de espera.`,

        timer: 1500,

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

  if (cargandoTurnos || cargandoPisos) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-slate-500">Cargando turnos...</p>
        </div>
      </div>
    );
  }

  if (errorTurnos || errorPisos) {
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
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-emerald-600">
              Lista de espera
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
              Turnos
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Registra, edita, llama o cancela turnos. La mesa no se asigna
              aquí: se confirma cuando el cliente ya se encuentra físicamente en
              una mesa.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirNuevoTurno}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus size={18} />
            Nuevo turno
          </button>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[110px_minmax(0,1fr)_110px_180px_130px_130px_150px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 xl:grid">
            <span>Turno</span>

            <span>Cliente</span>

            <span>Personas</span>

            <span>Preferencia</span>

            <span>Llegada</span>

            <span>Llamado</span>

            <span className="text-right">Acciones</span>
          </div>

          {turnos.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {turnos.map((turno) => (
                <article
                  key={turno.id}
                  className="grid min-w-0 gap-4 px-5 py-4 xl:grid-cols-[110px_minmax(0,1fr)_110px_180px_130px_130px_150px] xl:items-center"
                >
                  <div>
                    <span className="inline-flex rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
                      Turno #{turno.numero}
                    </span>
                  </div>

                  <p className="min-w-0 truncate font-semibold text-slate-800">
                    {turno.nombre}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users size={16} className="text-slate-400" />

                    {turno.personas}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={16} className="shrink-0 text-slate-400" />

                    <span className="truncate">
                      {turno.pisoPreferido?.nombre ?? "Sin preferencia"}
                    </span>
                  </div>

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

                  <div>
                    {turno.llamadoEn ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <BellRing size={13} />

                        {new Date(turno.llamadoEn).toLocaleTimeString("es-MX", {
                          hour: "2-digit",

                          minute: "2-digit",
                        })}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">
                        Aún no llamado
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 xl:justify-end">
                    <button
                      type="button"
                      disabled={mutacionLlamar.isPending}
                      onClick={() => manejarLlamar(turno)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
                      aria-label={`Llamar Turno #${turno.numero}`}
                      title="Llamar turno"
                    >
                      <BellRing size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => abrirEdicion(turno)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-sky-50 hover:text-sky-700"
                      aria-label={`Editar Turno #${turno.numero}`}
                      title="Editar turno"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      disabled={mutacionCancelar.isPending}
                      onClick={() => manejarCancelacion(turno)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      aria-label={`Cancelar Turno #${turno.numero}`}
                      title="Cancelar turno"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users size={36} className="mx-auto text-slate-300" />

              <p className="mt-4 font-semibold text-slate-700">
                No hay clientes esperando
              </p>

              <p className="mt-1 text-sm text-slate-400">
                La lista de espera está vacía.
              </p>

              <button
                type="button"
                onClick={abrirNuevoTurno}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={17} />
                Registrar turno
              </button>
            </div>
          )}
        </section>
      </div>

      <Modal
        abierto={modalAbierto}
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
        onCerrar={cerrarModal}
      >
        <FormularioTurno
          key={turnoEditando?.id ?? "nuevo-turno"}
          pisos={pisos}
          turnoInicial={turnoEditando}
          onGuardar={manejarGuardar}
          onCancelar={cerrarModal}
        />
      </Modal>
    </>
  );
}
