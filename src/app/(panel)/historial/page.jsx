"use client";

import { useMemo, useState } from "react";

import { History, Search } from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import { obtenerEventos } from "@/services/eventosService";

import { obtenerConfiguracionEvento } from "@/lib/eventos";

export default function PaginaHistorial() {
  const [busqueda, setBusqueda] = useState("");

  const {
    data: eventos = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["eventos"],
    queryFn: obtenerEventos,
  });

  /**
   * El filtrado del Prototipo 1 se realiza localmente.
   *
   * Posteriormente podemos soportar:
   *
   * GET /api/eventos?busqueda=...
   *
   * sin modificar el diseño de esta página.
   */
  const eventosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return eventos;
    }

    return eventos.filter((evento) => {
      const configuracion = obtenerConfiguracionEvento(evento.tipo);

      const contenido = [
        evento.mesaNumero,
        evento.descripcion,
        evento.usuario,
        evento.origen,
        configuracion.nombre,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return contenido.includes(texto);
    });
  }, [eventos, busqueda]);

  if (isLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-slate-500">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <p className="font-semibold text-rose-800">
          No se pudo cargar el historial.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0">
      {/* Encabezado */}
      <div className="mb-7">
        <p className="text-sm font-medium text-emerald-600">
          Registro de actividad
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
          Historial
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Consulta los eventos ocurridos durante la operación del restaurante.
        </p>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Barra superior */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <History size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">Actividad</h2>

              <p className="mt-1 text-xs text-slate-500">
                {eventos.length}{" "}
                {eventos.length === 1
                  ? "evento registrado"
                  : "eventos registrados"}
              </p>
            </div>
          </div>

          {/* Buscador */}
          <div className="relative w-full sm:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
              placeholder="Buscar mesa, usuario, evento..."
              className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        {/* Encabezados escritorio */}
        {eventosFiltrados.length > 0 && (
          <div className="hidden grid-cols-[140px_180px_minmax(0,1fr)_160px_190px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 lg:grid">
            <span>Mesa</span>
            <span>Evento</span>
            <span>Descripción</span>
            <span>Usuario</span>
            <span>Fecha</span>
          </div>
        )}

        {/* Eventos */}
        {eventosFiltrados.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {eventosFiltrados.map((evento) => {
              const configuracion = obtenerConfiguracionEvento(evento.tipo);

              return (
                <div
                  key={evento.id}
                  className="grid min-w-0 gap-3 px-5 py-4 lg:grid-cols-[140px_180px_minmax(0,1fr)_160px_190px] lg:items-center"
                >
                  {/* Mesa */}
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {evento.mesaNumero
                        ? `Mesa ${evento.mesaNumero}`
                        : "Sistema"}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {evento.origen === "APP" ? "Aplicación" : "Panel web"}
                    </p>
                  </div>

                  {/* Evento */}
                  <div>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${configuracion.clases}`}
                    >
                      {configuracion.nombre}
                    </span>
                  </div>

                  {/* Descripción */}
                  <p className="min-w-0 text-sm leading-6 text-slate-600">
                    {evento.descripcion}
                  </p>

                  {/* Usuario */}
                  <div>
                    <p className="truncate text-sm font-medium text-slate-700">
                      {evento.usuario}
                    </p>
                  </div>

                  {/* Fecha */}
                  <div>
                    <p className="text-sm text-slate-600">
                      {new Date(evento.fechaHora).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(evento.fechaHora).toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Search size={34} className="mx-auto text-slate-300" />

            <p className="mt-4 font-semibold text-slate-700">
              {eventos.length === 0
                ? "Todavía no existe actividad"
                : "Sin resultados"}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              {eventos.length === 0
                ? "Los eventos del restaurante aparecerán aquí."
                : "Ningún evento coincide con la búsqueda."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
