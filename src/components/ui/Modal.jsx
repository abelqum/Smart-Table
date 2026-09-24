"use client";

import { X } from "lucide-react";

export default function Modal({
  abierto,
  titulo,
  descripcion,
  children,
  onCerrar,
}) {
  if (!abierto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Fondo */}
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={onCerrar}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
      />

      {/* Ventana */}
      <section className="relative z-10 w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-950">{titulo}</h2>

            {descripcion && (
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {descripcion}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar"
          >
            <X size={19} />
          </button>
        </header>

        <div className="p-6">{children}</div>
      </section>
    </div>
  );
}
