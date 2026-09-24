"use client";

import { Armchair, Clock3, Sparkles, Users } from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import TarjetaResumen from "@/components/dashboard/TarjetaResumen";

import { obtenerResumenDashboard } from "@/services/dashboardService";
import { obtenerTurnos } from "@/services/turnosService";
import { obtenerEventos } from "@/services/eventosService";

/**
 * Dashboard principal de SmartTable.
 *
 * Esta página no sabe si los datos vienen de:
 *
 * - API Mock
 * - Express
 * - PostgreSQL
 *
 * Únicamente consume los servicios correspondientes.
 *
 * Actualmente:
 *
 * Dashboard
 *    ↓
 * services
 *    ↓
 * clienteApi
 *    ↓
 * API Mock
 *
 * Posteriormente:
 *
 * Dashboard
 *    ↓
 * services
 *    ↓
 * clienteApi
 *    ↓
 * Express
 *    ↓
 * PostgreSQL
 */
export default function PaginaDashboard() {
  /**
   * Obtiene los indicadores generales del restaurante.
   *
   * Endpoint futuro:
   * GET /api/dashboard/resumen
   */
  const {
    data: resumen,
    isLoading: cargandoResumen,
    isError: errorResumen,
    error: detalleErrorResumen,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: obtenerResumenDashboard,
  });

  /**
   * Obtiene los grupos que actualmente se encuentran
   * en la lista de espera.
   *
   * Endpoint futuro:
   * GET /api/turnos
   */
  const {
    data: turnos = [],
    isLoading: cargandoTurnos,
    isError: errorTurnos,
  } = useQuery({
    queryKey: ["turnos"],
    queryFn: obtenerTurnos,
  });

  /**
   * Obtiene el historial de eventos.
   *
   * Endpoint futuro:
   * GET /api/eventos
   */
  const {
    data: eventos = [],
    isLoading: cargandoEventos,
    isError: errorEventos,
  } = useQuery({
    queryKey: ["eventos"],
    queryFn: obtenerEventos,
  });

  /**
   * Mientras cualquiera de las consultas principales
   * siga cargando mostramos un estado temporal.
   */
  if (cargandoResumen || cargandoTurnos || cargandoEventos) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Cargando dashboard...
          </p>
        </div>
      </div>
    );
  }

  /**
   * Si alguna consulta falla mostramos un mensaje.
   *
   * Después podremos convertir esto en un componente
   * reutilizable para toda la aplicación.
   */
  if (errorResumen || errorTurnos || errorEventos || !resumen) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <p className="font-semibold text-rose-800">
          No se pudo cargar el dashboard.
        </p>

        <p className="mt-2 text-sm leading-6 text-rose-600">
          {detalleErrorResumen?.message ??
            "Ocurrió un problema al obtener la información del sistema."}
        </p>
      </div>
    );
  }

  /**
   * El dashboard únicamente necesita mostrar los últimos
   * cinco eventos.
   */
  const actividadReciente = eventos.slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl">
      {/* =====================================================
          ENCABEZADO
      ====================================================== */}
      <div className="mb-7">
        <p className="text-sm font-medium text-emerald-600">Resumen general</p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
          Dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Consulta el estado actual de las mesas, los grupos en espera y la
          actividad reciente del restaurante.
        </p>
      </div>

      {/* =====================================================
          INDICADORES PRINCIPALES
      ====================================================== */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaResumen
          titulo="Mesas disponibles"
          valor={resumen.disponibles}
          descripcion={`De ${resumen.totalMesas} mesas registradas.`}
          icono={Armchair}
          tono="verde"
        />

        <TarjetaResumen
          titulo="Mesas ocupadas"
          valor={resumen.ocupadas}
          descripcion="Actualmente atendiendo clientes."
          icono={Users}
          tono="rojo"
        />

        <TarjetaResumen
          titulo="Pendientes de limpieza"
          valor={resumen.pendientesLimpieza}
          descripcion={`${resumen.enLimpieza} mesa(s) actualmente en limpieza.`}
          icono={Sparkles}
          tono="amarillo"
        />

        <TarjetaResumen
          titulo="Grupos esperando"
          valor={resumen.turnosEsperando}
          descripcion="Actualmente en la lista de espera."
          icono={Clock3}
          tono="azul"
        />
      </section>

      {/* =====================================================
          LISTA DE ESPERA + ACTIVIDAD RECIENTE
      ====================================================== */}
      <section className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Lista de espera */}
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Lista de espera</h2>

              <p className="mt-1 text-xs text-slate-500">
                Próximos grupos pendientes de asignación
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {turnos.length} {turnos.length === 1 ? "grupo" : "grupos"}
            </span>
          </div>

          {turnos.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {turnos.slice(0, 5).map((turno, indice) => (
                <div
                  key={turno.id}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  {/* Código del turno */}
                  <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                    {turno.turno}
                  </div>

                  {/* Cliente */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {turno.nombre}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {turno.personas}{" "}
                      {turno.personas === 1 ? "persona" : "personas"}
                    </p>
                  </div>

                  {/* Posición */}
                  <div className="hidden text-right sm:block">
                    <p className="text-xs font-semibold text-slate-600">
                      #{indice + 1}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      posición
                    </p>
                  </div>

                  {/* Hora de llegada */}
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-600">
                      {new Date(turno.fechaHoraLlegada).toLocaleTimeString(
                        "es-MX",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">llegada</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center">
              <Users size={32} className="mx-auto text-slate-300" />

              <p className="mt-4 text-sm font-semibold text-slate-700">
                No hay grupos esperando
              </p>

              <p className="mt-1 text-xs text-slate-400">
                La lista de espera se encuentra vacía.
              </p>
            </div>
          )}
        </article>

        {/* Actividad reciente */}
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="font-semibold text-slate-900">Actividad reciente</h2>

            <p className="mt-1 text-xs text-slate-500">
              Últimos eventos registrados
            </p>
          </div>

          {actividadReciente.length > 0 ? (
            <div className="mt-5 space-y-5">
              {actividadReciente.map((evento) => (
                <div key={evento.id} className="flex gap-3">
                  {/* Indicador */}
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />

                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {evento.mesaNumero
                          ? `Mesa ${evento.mesaNumero}`
                          : "Sistema"}
                      </p>

                      <span className="shrink-0 text-xs text-slate-400">
                        {new Date(evento.fechaHora).toLocaleTimeString(
                          "es-MX",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {evento.descripcion}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {evento.usuario}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <Clock3 size={30} className="mx-auto text-slate-300" />

              <p className="mt-3 text-sm font-medium text-slate-500">
                Sin actividad registrada
              </p>
            </div>
          )}
        </article>
      </section>

      {/* =====================================================
          OCUPACIÓN
      ====================================================== */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-900">Ocupación actual</h2>

            <p className="mt-1 text-xs text-slate-500">
              Porcentaje de mesas actualmente ocupadas.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-2xl font-bold text-slate-950">
              {resumen.porcentajeOcupacion}%
            </p>

            <p className="text-xs text-slate-400">
              {resumen.ocupadas} de {resumen.totalMesas}
            </p>
          </div>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{
              width: `${Math.min(resumen.porcentajeOcupacion, 100)}%`,
            }}
          />
        </div>

        {/* Distribución rápida */}
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-emerald-50 p-3">
            <p className="text-xs text-emerald-600">Disponibles</p>

            <p className="mt-1 text-lg font-bold text-emerald-800">
              {resumen.disponibles}
            </p>
          </div>

          <div className="rounded-xl bg-rose-50 p-3">
            <p className="text-xs text-rose-600">Ocupadas</p>

            <p className="mt-1 text-lg font-bold text-rose-800">
              {resumen.ocupadas}
            </p>
          </div>

          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-xs text-amber-600">Sucias</p>

            <p className="mt-1 text-lg font-bold text-amber-800">
              {resumen.pendientesLimpieza}
            </p>
          </div>

          <div className="rounded-xl bg-orange-50 p-3">
            <p className="text-xs text-orange-600">En limpieza</p>

            <p className="mt-1 text-lg font-bold text-orange-800">
              {resumen.enLimpieza}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
