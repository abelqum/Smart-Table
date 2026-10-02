"use client";

import { BellRing, Users } from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import { obtenerTurnoActual } from "@/services/turnosService";

export default function PaginaTurnoActual() {
  const {
    data: turno,

    isLoading,

    isError,
  } = useQuery({
    queryKey: ["turno-actual"],

    queryFn: obtenerTurnoActual,
  });
  if (isLoading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-slate-500">
            Cargando turno actual...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <p className="font-semibold text-rose-800">
          No se pudo consultar el turno actual.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-150px)] w-full max-w-5xl items-center justify-center py-8">
      <section className="w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Turno actual
          </p>
        </div>

        {turno ? (
          <div className="px-6 py-14 text-center md:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <BellRing size={30} />
            </div>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Favor de pasar
            </p>

            <p className="mt-4 text-7xl font-black tracking-tight text-slate-950 sm:text-8xl md:text-9xl">
              #{turno.numero}
            </p>

            <h1 className="mt-7 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
              {turno.nombre}
            </h1>

            <div className="mt-6 flex items-center justify-center gap-2 text-lg font-semibold text-slate-500 md:text-2xl">
              <Users size={24} />
              {turno.personas} {turno.personas === 1 ? "persona" : "personas"}
            </div>
          </div>
        ) : (
          <div className="px-6 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <BellRing size={30} />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-800">
              Ningún turno llamado
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Cuando la hostess llame un turno, aparecerán aquí su número,
              nombre y cantidad de personas.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
