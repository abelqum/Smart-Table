import "./globals.css";

import ProveedorConsultas from "@/components/providers/ProveedorConsultas";

export const metadata = {
  title: {
    default: "SmartTable",
    template: "%s | SmartTable",
  },

  description:
    "Sistema inteligente para la gestión y rotación de mesas en restaurantes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <ProveedorConsultas>{children}</ProveedorConsultas>
      </body>
    </html>
  );
}
