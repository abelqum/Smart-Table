"use client";

import { useState } from "react";

import {
  Building2,
  Circle,
  Edit3,
  Layers3,
  Plus,
  RectangleHorizontal,
  Save,
  Settings,
  Trash2,
  Users,
} from "lucide-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Swal from "sweetalert2";

import Modal from "@/components/ui/Modal";
import FormularioPiso from "@/components/configuracion/FormularioPiso";
import FormularioMesa from "@/components/configuracion/FormularioMesa";

import {
  obtenerRestaurante,
  actualizarRestaurante,
} from "@/services/restauranteService";

import {
  obtenerPisos,
  crearPiso,
  actualizarPiso,
  eliminarPiso,
} from "@/services/pisosService";

import {
  obtenerMesas,
  crearMesa,
  actualizarMesa,
  eliminarMesa,
} from "@/services/mesasService";

/**
 * Página de configuración general de SmartTable.
 *
 * Esta página consume los datos exclusivamente mediante servicios.
 *
 * Actualmente:
 *
 * Configuración
 *      ↓
 * Services
 *      ↓
 * clienteApi
 *      ↓
 * API Mock
 *
 * Posteriormente:
 *
 * Configuración
 *      ↓
 * Services
 *      ↓
 * clienteApi
 *      ↓
 * Express
 *      ↓
 * PostgreSQL
 */
export default function PaginaConfiguracion() {
  const clienteConsultas = useQueryClient();

  /*
   * Estos estados pertenecen únicamente a la interfaz.
   *
   * No almacenamos aquí datos provenientes del servidor.
   */
  const [modalPisoAbierto, setModalPisoAbierto] = useState(false);

  const [modalMesaAbierto, setModalMesaAbierto] = useState(false);

  const [pisoEditando, setPisoEditando] = useState(null);

  const [mesaEditando, setMesaEditando] = useState(null);

  /* =====================================================
     CONSULTAS
  ====================================================== */

  /**
   * GET /api/restaurante
   */
  const {
    data: restaurante,
    isLoading: cargandoRestaurante,
    isError: errorRestaurante,
  } = useQuery({
    queryKey: ["restaurante"],
    queryFn: obtenerRestaurante,
  });

  /**
   * GET /api/pisos
   */
  const {
    data: pisos = [],
    isLoading: cargandoPisos,
    isError: errorPisos,
  } = useQuery({
    queryKey: ["pisos"],
    queryFn: obtenerPisos,
  });

  /**
   * GET /api/mesas
   */
  const {
    data: mesas = [],
    isLoading: cargandoMesas,
    isError: errorMesas,
  } = useQuery({
    queryKey: ["mesas"],
    queryFn: () => obtenerMesas(),
  });

  /* =====================================================
     ACTUALIZACIÓN DE CONSULTAS
  ====================================================== */

  /**
   * Después de modificar la configuración invalidamos
   * las consultas relacionadas.
   *
   * TanStack Query volverá a obtener los datos actualizados.
   */
  function refrescarConfiguracion() {
    clienteConsultas.invalidateQueries({
      queryKey: ["restaurante"],
    });

    clienteConsultas.invalidateQueries({
      queryKey: ["pisos"],
    });

    clienteConsultas.invalidateQueries({
      queryKey: ["mesas"],
    });

    /*
     * La cantidad y estado de mesas también afectan
     * los indicadores del dashboard.
     */
    clienteConsultas.invalidateQueries({
      queryKey: ["dashboard"],
    });
  }

  /* =====================================================
     MUTACIONES
  ====================================================== */

  /**
   * PATCH /api/restaurante
   */
  const mutacionRestaurante = useMutation({
    mutationFn: actualizarRestaurante,

    onSuccess() {
      refrescarConfiguracion();
    },
  });

  /**
   * POST /api/pisos
   */
  const mutacionCrearPiso = useMutation({
    mutationFn: crearPiso,

    onSuccess() {
      refrescarConfiguracion();
    },
  });

  /**
   * PATCH /api/pisos/:id
   */
  const mutacionActualizarPiso = useMutation({
    mutationFn: ({ idPiso, datos }) => actualizarPiso(idPiso, datos),

    onSuccess() {
      refrescarConfiguracion();
    },
  });

  /**
   * DELETE /api/pisos/:id
   */
  const mutacionEliminarPiso = useMutation({
    mutationFn: eliminarPiso,

    onSuccess() {
      refrescarConfiguracion();
    },
  });

  /**
   * POST /api/mesas
   */
  const mutacionCrearMesa = useMutation({
    mutationFn: crearMesa,

    onSuccess() {
      refrescarConfiguracion();
    },
  });

  /**
   * PATCH /api/mesas/:id
   */
  const mutacionActualizarMesa = useMutation({
    mutationFn: ({ idMesa, datos }) => actualizarMesa(idMesa, datos),

    onSuccess() {
      refrescarConfiguracion();
    },
  });

  /**
   * DELETE /api/mesas/:id
   */
  const mutacionEliminarMesa = useMutation({
    mutationFn: eliminarMesa,

    onSuccess() {
      refrescarConfiguracion();
    },
  });

  /* =====================================================
     RESTAURANTE
  ====================================================== */

  /**
   * Guarda los datos generales del restaurante.
   *
   * No necesitamos mantener una copia de los datos
   * de la API mediante useState.
   *
   * FormData obtiene directamente los valores
   * actuales escritos en el formulario.
   */
  async function guardarRestaurante(evento) {
    evento.preventDefault();

    const formulario = new FormData(evento.currentTarget);

    const datos = {
      nombre: String(formulario.get("nombre") ?? "").trim(),

      telefono: String(formulario.get("telefono") ?? "").trim(),

      direccion: String(formulario.get("direccion") ?? "").trim(),
    };

    if (datos.nombre.length < 2) {
      await Swal.fire({
        icon: "warning",
        title: "Nombre requerido",
        text: "Ingresa un nombre válido para el restaurante.",
      });

      return;
    }

    try {
      await mutacionRestaurante.mutateAsync(datos);

      await Swal.fire({
        icon: "success",
        title: "Información actualizada",
        text: "Los datos del restaurante fueron guardados correctamente.",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: error.message,
      });
    }
  }

  /* =====================================================
     PISOS
  ====================================================== */

  /**
   * Crea un piso nuevo o actualiza uno existente.
   */
  async function guardarPiso(datos) {
    try {
      if (pisoEditando) {
        await mutacionActualizarPiso.mutateAsync({
          idPiso: pisoEditando.id,

          datos,
        });
      } else {
        await mutacionCrearPiso.mutateAsync(datos);
      }

      const estabaEditando = Boolean(pisoEditando);

      setModalPisoAbierto(false);
      setPisoEditando(null);

      await Swal.fire({
        icon: "success",

        title: estabaEditando ? "Piso actualizado" : "Piso creado",

        timer: 1300,
        showConfirmButton: false,
      });

      return true;
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: error.message,
      });

      return false;
    }
  }

  /**
   * Solicita confirmación antes de eliminar un piso.
   */
  async function confirmarEliminarPiso(piso) {
    const confirmacion = await Swal.fire({
      icon: "warning",

      title: `Eliminar ${piso.nombre}`,

      text: "Sólo puede eliminarse si no tiene mesas asociadas.",

      showCancelButton: true,

      confirmButtonText: "Eliminar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: "#e11d48",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await mutacionEliminarPiso.mutateAsync(piso.id);

      await Swal.fire({
        icon: "success",
        title: "Piso eliminado",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: error.message,
      });
    }
  }

  /* =====================================================
     MESAS
  ====================================================== */

  /**
   * Crea una mesa nueva o actualiza una existente.
   */
  async function guardarMesa(datos) {
    try {
      if (mesaEditando) {
        await mutacionActualizarMesa.mutateAsync({
          idMesa: mesaEditando.id,

          datos,
        });
      } else {
        await mutacionCrearMesa.mutateAsync(datos);
      }

      const estabaEditando = Boolean(mesaEditando);

      setModalMesaAbierto(false);
      setMesaEditando(null);

      await Swal.fire({
        icon: "success",

        title: estabaEditando ? "Mesa actualizada" : "Mesa creada",

        timer: 1300,
        showConfirmButton: false,
      });

      return true;
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: error.message,
      });

      return false;
    }
  }

  /**
   * Elimina una mesa después de solicitar confirmación.
   *
   * El backend será quien finalmente determine si la
   * eliminación está permitida.
   */
  async function confirmarEliminarMesa(mesa) {
    const confirmacion = await Swal.fire({
      icon: "warning",

      title: `Eliminar Mesa ${mesa.numero}`,

      text: "Esta acción quitará la mesa de la configuración del restaurante.",

      showCancelButton: true,

      confirmButtonText: "Eliminar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: "#e11d48",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await mutacionEliminarMesa.mutateAsync(mesa.id);

      await Swal.fire({
        icon: "success",
        title: "Mesa eliminada",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "No se pudo eliminar",
        text: error.message,
      });
    }
  }

  /* =====================================================
     ESTADOS DE CARGA
  ====================================================== */

  if (cargandoRestaurante || cargandoPisos || cargandoMesas) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Cargando configuración...
          </p>
        </div>
      </div>
    );
  }

  if (errorRestaurante || errorPisos || errorMesas || !restaurante) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <p className="font-semibold text-rose-800">
          No se pudo cargar la configuración.
        </p>

        <p className="mt-1 text-sm text-rose-600">
          Verifica la conexión con la API.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl">
        {/* =================================================
            ENCABEZADO
        ================================================== */}

        <div className="mb-7">
          <p className="text-sm font-medium text-emerald-600">Administración</p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            Configuración
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Administra la información general, los pisos y las mesas que forman
            parte del restaurante.
          </p>
        </div>

        {/* =================================================
            RESTAURANTE
        ================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-200 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Building2 size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Información del restaurante
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Datos generales utilizados por SmartTable.
              </p>
            </div>
          </div>

          <form
            onSubmit={guardarRestaurante}
            className="grid gap-5 p-5 md:grid-cols-2"
          >
            {/* Nombre */}
            <div>
              <label
                htmlFor="nombre"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Nombre
              </label>

              <input
                id="nombre"
                name="nombre"
                type="text"
                defaultValue={restaurante.nombre ?? ""}
                className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label
                htmlFor="telefono"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Teléfono
              </label>

              <input
                id="telefono"
                name="telefono"
                type="text"
                defaultValue={restaurante.telefono ?? ""}
                className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* Dirección */}
            <div className="md:col-span-2">
              <label
                htmlFor="direccion"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Dirección
              </label>

              <input
                id="direccion"
                name="direccion"
                type="text"
                defaultValue={restaurante.direccion ?? ""}
                className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={mutacionRestaurante.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={17} />

                {mutacionRestaurante.isPending
                  ? "Guardando..."
                  : "Guardar información"}
              </button>
            </div>
          </form>
        </section>

        {/* =================================================
            PISOS
        ================================================== */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Layers3 size={19} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">Pisos y zonas</h2>

                <p className="mt-1 text-xs text-slate-500">
                  Organiza las diferentes áreas físicas del restaurante.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setPisoEditando(null);
                setModalPisoAbierto(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <Plus size={17} />
              Nuevo piso
            </button>
          </div>

          {pisos.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {pisos.map((piso) => {
                const cantidadMesas = mesas.filter(
                  (mesa) => mesa.pisoId === piso.id,
                ).length;

                return (
                  <div
                    key={piso.id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {piso.nombre}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {cantidadMesas} {cantidadMesas === 1 ? "mesa" : "mesas"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPisoEditando(piso);
                          setModalPisoAbierto(true);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label={`Editar ${piso.nombre}`}
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => confirmarEliminarPiso(piso)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Eliminar ${piso.nombre}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center">
              <Layers3 size={32} className="mx-auto text-slate-300" />

              <p className="mt-4 font-semibold text-slate-700">
                No existen pisos configurados
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Crea el primer piso o zona del restaurante.
              </p>
            </div>
          )}
        </section>

        {/* =================================================
            MESAS
        ================================================== */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-semibold text-slate-900">Mesas</h2>

              <p className="mt-1 text-xs text-slate-500">
                Define las mesas, su capacidad, forma y ubicación.
              </p>
            </div>

            <button
              type="button"
              disabled={pisos.length === 0}
              onClick={() => {
                setMesaEditando(null);
                setModalMesaAbierto(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={17} />
              Nueva mesa
            </button>
          </div>

          {mesas.length > 0 ? (
            <>
              {/* Cabecera de escritorio */}
              <div className="hidden grid-cols-[110px_1fr_140px_140px_140px_100px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 lg:grid">
                <span>Mesa</span>
                <span>Piso</span>
                <span>Capacidad</span>
                <span>Forma</span>
                <span>Estado</span>
                <span>Acciones</span>
              </div>

              <div className="divide-y divide-slate-100">
                {mesas.map((mesa) => {
                  const piso = pisos.find((item) => item.id === mesa.pisoId);

                  return (
                    <div
                      key={mesa.id}
                      className="grid gap-3 px-5 py-4 lg:grid-cols-[110px_1fr_140px_140px_140px_100px] lg:items-center"
                    >
                      {/* Mesa */}
                      <p className="font-bold text-slate-900">
                        Mesa {mesa.numero}
                      </p>

                      {/* Piso */}
                      <p className="text-sm text-slate-600">
                        {piso?.nombre ?? "Sin piso"}
                      </p>

                      {/* Capacidad */}
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users size={15} />

                        <span>{mesa.capacidad}</span>
                      </div>

                      {/* Forma */}
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        {mesa.forma === "ROUND" ? (
                          <>
                            <Circle size={16} />
                            <span>Redonda</span>
                          </>
                        ) : (
                          <>
                            <RectangleHorizontal size={17} />
                            <span>Rectangular</span>
                          </>
                        )}
                      </div>

                      {/* Estado */}
                      <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {mesa.estado}
                      </span>

                      {/* Acciones */}
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setMesaEditando(mesa);
                            setModalMesaAbierto(true);
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          aria-label={`Editar Mesa ${mesa.numero}`}
                        >
                          <Edit3 size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => confirmarEliminarMesa(mesa)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Eliminar Mesa ${mesa.numero}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <Settings size={34} className="mx-auto text-slate-300" />

              <p className="mt-4 font-semibold text-slate-700">
                No existen mesas configuradas
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Agrega una mesa para comenzar a configurar el restaurante.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* =================================================
          MODAL PISO
      ================================================== */}

      <Modal
        abierto={modalPisoAbierto}
        titulo={pisoEditando ? "Editar piso" : "Nuevo piso"}
        descripcion="Define una zona física del restaurante."
        onCerrar={() => {
          setModalPisoAbierto(false);
          setPisoEditando(null);
        }}
      >
        <FormularioPiso
          key={pisoEditando?.id ?? "nuevo-piso"}
          valoresIniciales={pisoEditando}
          onGuardar={guardarPiso}
          onCancelar={() => {
            setModalPisoAbierto(false);
            setPisoEditando(null);
          }}
        />
      </Modal>

      {/* =================================================
          MODAL MESA
      ================================================== */}

      <Modal
        abierto={modalMesaAbierto}
        titulo={
          mesaEditando ? `Editar Mesa ${mesaEditando.numero}` : "Nueva mesa"
        }
        descripcion="Define las características básicas de la mesa."
        onCerrar={() => {
          setModalMesaAbierto(false);
          setMesaEditando(null);
        }}
      >
        <FormularioMesa
          key={mesaEditando?.id ?? "nueva-mesa"}
          pisos={pisos}
          valoresIniciales={mesaEditando}
          onGuardar={guardarMesa}
          onCancelar={() => {
            setModalMesaAbierto(false);
            setMesaEditando(null);
          }}
        />
      </Modal>
    </>
  );
}
