"use client";

import { useEffect, useRef, useState } from "react";

import { Circle, Group, Layer, Line, Rect, Stage, Text } from "react-konva";

/*
 * El restaurante se dibuja utilizando un sistema de coordenadas
 * virtual independiente del tamaño real del navegador.
 *
 * De esta manera una mesa situada en:
 *
 * x: 300
 * y: 200
 *
 * conserva esas coordenadas tanto en una laptop como
 * en una pantalla más pequeña.
 */
const ANCHO_VIRTUAL = 1100;
const ALTO_VIRTUAL = 650;

const TAMANO_MESA_RECTANGULAR = {
  ancho: 140,
  alto: 90,
};

const RADIO_MESA_REDONDA = 58;

/*
 * Colores usados por las mesas dependiendo de su estado.
 *
 * Aquí utilizamos valores reales de color porque Konva dibuja
 * sobre Canvas y no utiliza clases CSS de Tailwind.
 */
const configuracionEstados = {
  AVAILABLE: {
    fondo: "#ecfdf5",
    borde: "#10b981",
    texto: "#047857",
    nombre: "Disponible",
  },

  OCCUPIED: {
    fondo: "#fff1f2",
    borde: "#f43f5e",
    texto: "#be123c",
    nombre: "Ocupada",
  },

  DIRTY: {
    fondo: "#fffbeb",
    borde: "#f59e0b",
    texto: "#b45309",
    nombre: "Sucia",
  },

  CLEANING: {
    fondo: "#fff7ed",
    borde: "#f97316",
    texto: "#c2410c",
    nombre: "En limpieza",
  },

  BLOCKED: {
    fondo: "#f1f5f9",
    borde: "#64748b",
    texto: "#475569",
    nombre: "Bloqueada",
  },
};

/**
 * Plano 2D reutilizable de SmartTable.
 *
 * Props:
 *
 * mesas:
 * Mesas que deben mostrarse.
 *
 * editable:
 * Determina si pueden arrastrarse.
 *
 * mesaSeleccionadaId:
 * Mesa actualmente seleccionada.
 *
 * onSeleccionarMesa:
 * Callback cuando se pulsa una mesa.
 *
 * onMoverMesa:
 * Callback cuando termina de arrastrarse una mesa.
 */
export default function PlanoMesasKonva({
  mesas = [],
  editable = false,
  mesaSeleccionadaId = null,
  onSeleccionarMesa = null,
  onMoverMesa = null,
}) {
  const contenedorRef = useRef(null);

  const [anchoContenedor, setAnchoContenedor] = useState(ANCHO_VIRTUAL);

  /**
   * ResizeObserver detecta cambios reales en el tamaño
   * del contenedor.
   *
   * El setState ocurre dentro del callback del observador,
   * no directamente dentro del cuerpo del efecto.
   */
  useEffect(() => {
    const elemento = contenedorRef.current;

    if (!elemento) {
      return;
    }

    const observador = new ResizeObserver((entradas) => {
      const entrada = entradas[0];

      if (!entrada) {
        return;
      }

      const nuevoAncho = entrada.contentRect.width;

      if (nuevoAncho > 0) {
        setAnchoContenedor(nuevoAncho);
      }
    });

    observador.observe(elemento);

    return () => {
      observador.disconnect();
    };
  }, []);

  /*
   * Escala que transforma nuestro lienzo virtual
   * al ancho disponible.
   */
  const escala = anchoContenedor / ANCHO_VIRTUAL;

  const altoVisual = ALTO_VIRTUAL * escala;

  /**
   * Mantiene una mesa dentro de los límites
   * visibles del restaurante.
   */
  function limitarPosicion(posicionX, posicionY) {
    const margen = 75;

    return {
      x: Math.max(margen, Math.min(posicionX, ANCHO_VIRTUAL - margen)),

      y: Math.max(margen, Math.min(posicionY, ALTO_VIRTUAL - margen)),
    };
  }

  /**
   * Se ejecuta cuando el usuario termina de arrastrar una mesa.
   */
  function manejarFinArrastre(evento, mesa) {
    if (!editable) {
      return;
    }

    const posicion = limitarPosicion(evento.target.x(), evento.target.y());

    /*
     * Recolocamos también visualmente el nodo en caso
     * de que intentara salir de los límites.
     */
    evento.target.position(posicion);

    if (onMoverMesa) {
      onMoverMesa(mesa.id, {
        posicionX: Math.round(posicion.x),

        posicionY: Math.round(posicion.y),
      });
    }
  }

  /**
   * Genera líneas de cuadrícula cada 50 unidades.
   *
   * La cuadrícula ayuda al administrador a acomodar
   * visualmente las mesas.
   */
  const lineasVerticales = [];

  for (let x = 0; x <= ANCHO_VIRTUAL; x += 50) {
    lineasVerticales.push(
      <Line
        key={`vertical-${x}`}
        points={[x, 0, x, ALTO_VIRTUAL]}
        stroke="#e2e8f0"
        strokeWidth={1}
        listening={false}
      />,
    );
  }

  const lineasHorizontales = [];

  for (let y = 0; y <= ALTO_VIRTUAL; y += 50) {
    lineasHorizontales.push(
      <Line
        key={`horizontal-${y}`}
        points={[0, y, ANCHO_VIRTUAL, y]}
        stroke="#e2e8f0"
        strokeWidth={1}
        listening={false}
      />,
    );
  }

  return (
    <div
      ref={contenedorRef}
      className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white"
    >
      <Stage
        width={anchoContenedor}
        height={altoVisual}
        scaleX={escala}
        scaleY={escala}
      >
        {/* Fondo y cuadrícula */}
        <Layer listening={false}>
          <Rect
            x={0}
            y={0}
            width={ANCHO_VIRTUAL}
            height={ALTO_VIRTUAL}
            fill="#f8fafc"
          />

          {lineasVerticales}
          {lineasHorizontales}
        </Layer>

        {/* Mesas */}
        <Layer>
          {mesas.map((mesa) => {
            const estado =
              configuracionEstados[mesa.estado] ?? configuracionEstados.BLOCKED;

            const seleccionada = mesa.id === mesaSeleccionadaId;

            const posicionX = mesa.posicionX ?? 120;

            const posicionY = mesa.posicionY ?? 120;

            const esRedonda = mesa.forma === "ROUND";

            return (
              <Group
                key={mesa.id}
                x={posicionX}
                y={posicionY}
                draggable={editable}
                onClick={() => onSeleccionarMesa?.(mesa.id)}
                onTap={() => onSeleccionarMesa?.(mesa.id)}
                onDragStart={() => onSeleccionarMesa?.(mesa.id)}
                onDragEnd={(evento) => manejarFinArrastre(evento, mesa)}
              >
                {/* Forma de la mesa */}
                {esRedonda ? (
                  <Circle
                    radius={RADIO_MESA_REDONDA}
                    fill={estado.fondo}
                    stroke={seleccionada ? "#0f172a" : estado.borde}
                    strokeWidth={seleccionada ? 4 : 2}
                    shadowColor="#0f172a"
                    shadowBlur={seleccionada ? 12 : 4}
                    shadowOpacity={seleccionada ? 0.18 : 0.07}
                  />
                ) : (
                  <Rect
                    x={-TAMANO_MESA_RECTANGULAR.ancho / 2}
                    y={-TAMANO_MESA_RECTANGULAR.alto / 2}
                    width={TAMANO_MESA_RECTANGULAR.ancho}
                    height={TAMANO_MESA_RECTANGULAR.alto}
                    cornerRadius={18}
                    fill={estado.fondo}
                    stroke={seleccionada ? "#0f172a" : estado.borde}
                    strokeWidth={seleccionada ? 4 : 2}
                    shadowColor="#0f172a"
                    shadowBlur={seleccionada ? 12 : 4}
                    shadowOpacity={seleccionada ? 0.18 : 0.07}
                  />
                )}

                {/* Número */}
                <Text
                  x={-65}
                  y={-26}
                  width={130}
                  align="center"
                  text={`Mesa ${mesa.numero}`}
                  fontSize={18}
                  fontStyle="bold"
                  fill="#0f172a"
                  listening={false}
                />

                {/* Capacidad */}
                <Text
                  x={-65}
                  y={-2}
                  width={130}
                  align="center"
                  text={`${mesa.capacidad} ${
                    mesa.capacidad === 1 ? "persona" : "personas"
                  }`}
                  fontSize={12}
                  fill="#64748b"
                  listening={false}
                />

                {/* Estado */}
                <Text
                  x={-65}
                  y={19}
                  width={130}
                  align="center"
                  text={estado.nombre}
                  fontSize={11}
                  fontStyle="bold"
                  fill={estado.texto}
                  listening={false}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
