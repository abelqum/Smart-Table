import EstructuraPanel from "@/components/layout/EstructuraPanel";

import ProveedorTiempoReal from "@/components/providers/ProveedorTiempoReal";

export default function LayoutPanel({ children }) {
  return (
    <ProveedorTiempoReal>
      <EstructuraPanel>{children}</EstructuraPanel>
    </ProveedorTiempoReal>
  );
}
