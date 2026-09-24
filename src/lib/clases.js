import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases CSS y resuelve conflictos entre clases de Tailwind.
 *
 * Ejemplo:
 * combinarClases(
 *   "px-4 py-2",
 *   estaActivo && "bg-emerald-600 text-white"
 * );
 *
 * clsx:
 * Permite agregar clases de manera condicional.
 *
 * tailwind-merge:
 * Elimina conflictos entre clases de Tailwind.
 * Por ejemplo, si existen "p-2" y "p-4", conserva la última.
 */
export function combinarClases(...clases) {
  return twMerge(clsx(...clases));
}
