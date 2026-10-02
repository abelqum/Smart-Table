"use client";

import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { obtenerTokenSesion } from "@/lib/auth/sesion";

import {
  conectarSocket,
  desconectarSocket,
} from "@/lib/realtime/socketCliente";

const CLAVES_POR_RECURSO = {
  mesas: ["mesas"],

  turnos: ["turnos"],

  turnoActual: ["turno-actual"],

  dashboard: ["dashboard"],

  eventos: ["eventos"],

  pisos: ["pisos"],

  restaurante: ["restaurante"],

  usuarios: ["usuarios"],

  sesion: ["sesion"],
};

const RECURSOS_PRINCIPALES = [
  "mesas",
  "turnos",
  "turnoActual",
  "dashboard",
  "eventos",
  "pisos",
  "restaurante",
  "usuarios",
  "sesion",
];

export default function ProveedorTiempoReal({ children }) {
  const clienteConsultas = useQueryClient();

  useEffect(() => {
    const token = obtenerTokenSesion();

    if (!token) {
      return;
    }

    const socket = conectarSocket(token);

    if (!socket) {
      return;
    }

    async function invalidarRecurso(recurso) {
      const clave = CLAVES_POR_RECURSO[recurso];

      if (!clave) {
        return;
      }

      await clienteConsultas.invalidateQueries({
        queryKey: clave,
      });

      await clienteConsultas.refetchQueries({
        queryKey: clave,
        type: "active",
      });
    }

    function resincronizarEstadoCompleto() {
      /*
       * Cuando Socket.IO recupera la conexión
       * no asumimos que recibimos todos los
       * eventos ocurridos durante el corte.
       *
       * Consultamos nuevamente el estado real.
       */
      for (const recurso of RECURSOS_PRINCIPALES) {
        invalidarRecurso(recurso);
      }
    }

    function manejarConexion() {
      console.info("SmartTable tiempo real conectado.");

      /*
       * "connect" ocurre tanto en la primera
       * conexión como después de reconectarse.
       *
       * La invalidación inicial es barata y
       * garantiza que la interfaz parta del
       * estado real del servidor.
       */
      resincronizarEstadoCompleto();
    }

    function manejarConfirmacionServidor(datos) {
      console.info("SmartTable confirmó la conexión realtime.", datos ?? "");
    }

    async function manejarActualizacion(datos) {
      const recursos = Array.isArray(datos?.recursos) ? datos.recursos : [];

      if (recursos.length === 0) {
        return;
      }

      console.info("Actualización SmartTable recibida:", datos);

      for (const recurso of recursos) {
        await invalidarRecurso(recurso);
      }
    }

    function manejarErrorConexion(error) {
      /*
       * Socket.IO tiene reconexión automática.
       *
       * Un "xhr poll error" puede aparecer por
       * un reinicio del backend, Fast Refresh,
       * suspensión de la pestaña, etc.
       *
       * Se registra como advertencia para que
       * Next.js no lo trate como una excepción
       * fatal de nuestra aplicación.
       */
      console.warn(
        "Socket.IO perdió temporalmente la conexión:",
        error?.message ?? error,
      );
    }

    function manejarDesconexion(motivo) {
      /*
       * Si nosotros mismos cerramos la conexión
       * no hace falta mostrar una advertencia.
       */
      if (motivo === "io client disconnect") {
        return;
      }

      console.warn("SmartTable tiempo real desconectado:", motivo);
    }

    socket.on("connect", manejarConexion);

    socket.on("smarttable:conectado", manejarConfirmacionServidor);

    socket.on("smarttable:actualizacion", manejarActualizacion);

    socket.on("connect_error", manejarErrorConexion);

    socket.on("disconnect", manejarDesconexion);

    return () => {
      socket.off("connect", manejarConexion);

      socket.off("smarttable:conectado", manejarConfirmacionServidor);

      socket.off("smarttable:actualizacion", manejarActualizacion);

      socket.off("connect_error", manejarErrorConexion);

      socket.off("disconnect", manejarDesconexion);

      desconectarSocket();
    };
  }, [clienteConsultas]);

  return children;
}
