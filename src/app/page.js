import { redirect } from "next/navigation";

/**
 * Página raíz de SmartTable.
 *
 * Mientras no exista autenticación real con JWT,
 * enviamos al usuario a la pantalla de inicio de sesión.
 */
export default function PaginaInicio() {
  redirect("/login");
}
