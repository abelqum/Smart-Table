"use client";

import { useState } from "react";

import {
  KeyRound,
  Pencil,
  Plus,
  Power,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Swal from "sweetalert2";

import Modal from "@/components/ui/Modal";

import FormularioUsuario from "@/components/usuarios/FormularioUsuario";

import {
  actualizarUsuario,
  crearUsuario,
  obtenerUsuarios,
  restablecerContrasenaUsuario,
} from "@/services/usuariosService";

import { obtenerPerfil } from "@/services/authService";

const nombresRol = {
  ADMIN: "Administrador",

  HOSTESS: "Hostess",

  WAITER: "Mesero",

  CLEANING: "Limpieza",
};

export default function PaginaUsuarios() {
  const clienteConsultas = useQueryClient();

  const [modalAbierto, setModalAbierto] = useState(false);

  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const {
    data: usuarios = [],

    isLoading,
    isError,
  } = useQuery({
    queryKey: ["usuarios"],

    queryFn: obtenerUsuarios,
  });

  const { data: usuarioSesion } = useQuery({
    queryKey: ["sesion"],

    queryFn: obtenerPerfil,

    staleTime: 5 * 60 * 1000,
  });

  function refrescarUsuarios() {
    clienteConsultas.invalidateQueries({
      queryKey: ["usuarios"],
    });
  }

  const mutacionCrear = useMutation({
    mutationFn: crearUsuario,

    onSuccess: refrescarUsuarios,
  });

  const mutacionActualizar = useMutation({
    mutationFn: ({ idUsuario, datos }) => actualizarUsuario(idUsuario, datos),

    onSuccess: refrescarUsuarios,
  });

  const mutacionRestablecer = useMutation({
    mutationFn: ({ idUsuario, nuevaContrasena }) =>
      restablecerContrasenaUsuario(idUsuario, nuevaContrasena),
  });

  function abrirNuevoUsuario() {
    setUsuarioEditando(null);

    setModalAbierto(true);
  }

  function abrirEdicion(usuario) {
    setUsuarioEditando(usuario);

    setModalAbierto(true);
  }

  function cerrarModal() {
    setModalAbierto(false);

    setUsuarioEditando(null);
  }

  async function guardarUsuario(datos) {
    try {
      if (usuarioEditando) {
        await mutacionActualizar.mutateAsync({
          idUsuario: usuarioEditando.id,

          datos,
        });

        cerrarModal();

        await Swal.fire({
          icon: "success",

          title: "Usuario actualizado",

          timer: 1300,

          showConfirmButton: false,
        });

        return true;
      }

      await mutacionCrear.mutateAsync(datos);

      cerrarModal();

      await Swal.fire({
        icon: "success",

        title: "Usuario creado",

        text: "La cuenta ya puede iniciar sesión en SmartTable.",
      });

      return true;
    } catch (error) {
      await Swal.fire({
        icon: "error",

        title: "No se pudo guardar",

        text: error.message,
      });

      return false;
    }
  }

  async function cambiarEstado(usuario) {
    const nuevoEstado = !usuario.activo;

    const confirmacion = await Swal.fire({
      icon: nuevoEstado ? "question" : "warning",

      title: nuevoEstado ? "¿Activar usuario?" : "¿Desactivar usuario?",

      html: `
          <strong>${usuario.nombre}</strong><br />
          ${usuario.correo}

          ${
            !nuevoEstado
              ? `
                <p style="
                  margin-top:12px;
                  color:#64748b;
                  font-size:14px;
                ">
                  Ya no podrá iniciar sesión,
                  pero su historial permanecerá
                  registrado.
                </p>
              `
              : ""
          }
        `,

      showCancelButton: true,

      confirmButtonText: nuevoEstado ? "Sí, activar" : "Sí, desactivar",

      cancelButtonText: "Cancelar",

      confirmButtonColor: nuevoEstado ? "#059669" : "#e11d48",
    });

    if (!confirmacion.isConfirmed) {
      return;
    }

    try {
      await mutacionActualizar.mutateAsync({
        idUsuario: usuario.id,

        datos: {
          activo: nuevoEstado,
        },
      });

      await Swal.fire({
        icon: "success",

        title: nuevoEstado ? "Usuario activado" : "Usuario desactivado",

        timer: 1200,

        showConfirmButton: false,
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",

        title: "No se pudo actualizar",

        text: error.message,
      });
    }
  }

  async function restablecerContrasena(usuario) {
    const resultado = await Swal.fire({
      icon: "question",

      title: "Restablecer contraseña",

      text: `${usuario.nombre} · ${usuario.correo}`,

      input: "password",

      inputLabel: "Nueva contraseña",

      inputPlaceholder: "Mínimo 6 caracteres",

      inputAttributes: {
        autocomplete: "new-password",
      },

      showCancelButton: true,

      confirmButtonText: "Guardar contraseña",

      cancelButtonText: "Cancelar",

      inputValidator(valor) {
        if (!valor || valor.length < 6) {
          return "La contraseña debe contener al menos 6 caracteres.";
        }

        return null;
      },
    });

    if (!resultado.isConfirmed) {
      return;
    }

    try {
      await mutacionRestablecer.mutateAsync({
        idUsuario: usuario.id,

        nuevaContrasena: resultado.value,
      });

      await Swal.fire({
        icon: "success",

        title: "Contraseña restablecida",

        text: "El usuario podrá utilizar la nueva contraseña en su próximo inicio de sesión.",
      });
    } catch (error) {
      await Swal.fire({
        icon: "error",

        title: "No se pudo restablecer",

        text: error.message,
      });
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="mt-4 text-sm text-slate-500">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
        No se pudieron cargar los usuarios.
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-emerald-600">
              Administración
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
              Usuarios
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Administra las cuentas del personal. Cada empleado utilizará su
              propia cuenta para que SmartTable pueda registrar quién realizó
              cada acción.
            </p>
          </div>

          <button
            type="button"
            onClick={abrirNuevoUsuario}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus size={18} />
            Nuevo usuario
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {usuarios.map((usuario) => {
            const esMiCuenta = usuario.id === usuarioSesion?.id;

            return (
              <article
                key={usuario.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${
                  usuario.activo
                    ? "border-slate-200"
                    : "border-slate-200 opacity-65"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                      <UserRound size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {usuario.nombre}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {usuario.correo}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      usuario.activo
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {usuario.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-slate-400" />

                  <span className="text-sm font-medium text-slate-700">
                    {nombresRol[usuario.rol] ?? usuario.rol}
                  </span>

                  {esMiCuenta && (
                    <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                      Tu cuenta
                    </span>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => abrirEdicion(usuario)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <Pencil size={14} />
                    Editar
                  </button>

                  <button
                    type="button"
                    disabled={esMiCuenta}
                    onClick={() => restablecerContrasena(usuario)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <KeyRound size={14} />
                    Clave
                  </button>

                  <button
                    type="button"
                    disabled={esMiCuenta}
                    onClick={() => cambiarEstado(usuario)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
                      usuario.activo
                        ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    <Power size={14} />

                    {usuario.activo ? "Quitar" : "Activar"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {usuarios.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <Users size={36} className="mx-auto text-slate-300" />

            <p className="mt-4 font-semibold text-slate-700">No hay usuarios</p>
          </div>
        )}
      </div>

      <Modal
        abierto={modalAbierto}
        titulo={usuarioEditando ? "Editar usuario" : "Nuevo usuario"}
        descripcion={
          usuarioEditando
            ? "Modifica los datos o el rol del empleado."
            : "Crea una cuenta para un integrante del personal."
        }
        onCerrar={cerrarModal}
      >
        <FormularioUsuario
          key={usuarioEditando?.id ?? "nuevo-usuario"}
          usuarioInicial={usuarioEditando}
          onGuardar={guardarUsuario}
          onCancelar={cerrarModal}
        />
      </Modal>
    </>
  );
}
