import EstructuraPanel from "@/components/layout/EstructuraPanel";

/**
 * Layout compartido del panel principal de SmartTable.
 *
 * Todas las páginas colocadas dentro de la carpeta:
 *
 * src/app/(panel)/
 *
 * utilizarán automáticamente esta estructura.
 *
 * Por ejemplo:
 *
 * /dashboard
 * /operacion
 * /turnos
 * /historial
 * /configuracion
 *
 * EstructuraPanel contiene los elementos visuales comunes:
 *
 * - Sidebar
 * - Header
 * - Navegación
 * - Área principal de contenido
 *
 * TanStack Query NO se declara aquí porque ya existe
 * globalmente en src/app/layout.js mediante
 * ProveedorConsultas.
 */
export default function LayoutPanel({ children }) {
  return <EstructuraPanel>{children}</EstructuraPanel>;
}
