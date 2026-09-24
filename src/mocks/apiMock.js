/**
 * API simulada de SmartTable.
 *
 * Su objetivo NO es sustituir al backend.
 *
 * Sólo permite desarrollar el frontend utilizando el mismo
 * contrato HTTP que posteriormente implementaremos con
 * Node.js, Express y PostgreSQL.
 */

const CLAVE_ALMACENAMIENTO = "smarttable-api-mock";

/**
 * Datos utilizados la primera vez que se ejecuta el prototipo.
 */
function crearDatosIniciales() {
  return {
    restaurante: {
      id: 1,
      nombre: "Restaurante Demo",
      telefono: "55 1234 5678",
      direccion: "Ciudad de México",
    },

    pisos: [
      {
        id: 1,
        nombre: "Planta baja",
        orden: 1,
      },
      {
        id: 2,
        nombre: "Terraza",
        orden: 2,
      },
    ],

    mesas: [
      {
        id: 1,
        numero: "01",
        capacidad: 4,
        estado: "AVAILABLE",
        pisoId: 1,
        posicionX: 80,
        posicionY: 80,
        forma: "RECTANGLE",
        turnoAsignado: null,
      },
      {
        id: 2,
        numero: "02",
        capacidad: 2,
        estado: "OCCUPIED",
        pisoId: 1,
        posicionX: 270,
        posicionY: 80,
        forma: "ROUND",

        turnoAsignado: {
          turno: "A018",
          nombre: "Fernanda",
          personas: 2,
        },
      },
      {
        id: 3,
        numero: "03",
        capacidad: 6,
        estado: "DIRTY",
        pisoId: 1,
        posicionX: 460,
        posicionY: 80,
        forma: "RECTANGLE",
        turnoAsignado: null,
      },
      {
        id: 4,
        numero: "04",
        capacidad: 4,
        estado: "CLEANING",
        pisoId: 1,
        posicionX: 160,
        posicionY: 270,
        forma: "RECTANGLE",
        turnoAsignado: null,
      },
      {
        id: 5,
        numero: "05",
        capacidad: 4,
        estado: "AVAILABLE",
        pisoId: 1,
        posicionX: 390,
        posicionY: 270,
        forma: "ROUND",
        turnoAsignado: null,
      },
      {
        id: 6,
        numero: "06",
        capacidad: 2,
        estado: "OCCUPIED",
        pisoId: 1,
        posicionX: 590,
        posicionY: 270,
        forma: "ROUND",

        turnoAsignado: {
          turno: "A019",
          nombre: "Roberto",
          personas: 2,
        },
      },

      {
        id: 7,
        numero: "T01",
        capacidad: 4,
        estado: "AVAILABLE",
        pisoId: 2,
        posicionX: 100,
        posicionY: 100,
        forma: "ROUND",
        turnoAsignado: null,
      },
      {
        id: 8,
        numero: "T02",
        capacidad: 4,
        estado: "OCCUPIED",
        pisoId: 2,
        posicionX: 320,
        posicionY: 100,
        forma: "RECTANGLE",

        turnoAsignado: {
          turno: "A020",
          nombre: "Mariana",
          personas: 4,
        },
      },
      {
        id: 9,
        numero: "T03",
        capacidad: 2,
        estado: "AVAILABLE",
        pisoId: 2,
        posicionX: 540,
        posicionY: 100,
        forma: "ROUND",
        turnoAsignado: null,
      },
    ],

    turnos: [
      {
        id: 21,
        turno: "A021",
        nombre: "Gerardo",
        personas: 2,
        fechaHoraLlegada: new Date().toISOString(),
        estado: "WAITING",
      },
      {
        id: 22,
        turno: "A022",
        nombre: "Mauricio",
        personas: 5,
        fechaHoraLlegada: new Date().toISOString(),
        estado: "WAITING",
      },
      {
        id: 23,
        turno: "A023",
        nombre: "Ana",
        personas: 3,
        fechaHoraLlegada: new Date().toISOString(),
        estado: "WAITING",
      },
    ],

    siguienteNumeroTurno: 24,

    eventos: [],
  };
}

let datosEnMemoria = null;

/**
 * Obtiene la base simulada.
 *
 * Como esta función sólo será utilizada desde Client Components,
 * aquí sí podemos trabajar con localStorage de forma segura.
 */
function obtenerDatos() {
  if (datosEnMemoria) {
    return datosEnMemoria;
  }

  if (typeof window !== "undefined") {
    const almacenados = localStorage.getItem(CLAVE_ALMACENAMIENTO);

    if (almacenados) {
      datosEnMemoria = JSON.parse(almacenados);

      return datosEnMemoria;
    }
  }

  datosEnMemoria = crearDatosIniciales();

  guardarDatos();

  return datosEnMemoria;
}

function guardarDatos() {
  if (typeof window !== "undefined" && datosEnMemoria) {
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(datosEnMemoria));
  }
}

function esperar(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function crearEvento({
  mesa = null,
  tipo,
  descripcion,
  usuario = "Administrador Demo",
  origen = "WEB",
}) {
  const datos = obtenerDatos();

  datos.eventos.unshift({
    id: Date.now(),
    mesaId: mesa?.id ?? null,
    mesaNumero: mesa?.numero ?? null,
    tipo,
    descripcion,
    usuario,
    origen,
    fechaHora: new Date().toISOString(),
  });
}

function respuestaError(mensaje, estado = 400) {
  const error = new Error(mensaje);

  error.status = estado;

  throw error;
}

/**
 * Simula las llamadas HTTP que posteriormente realizará Express.
 */
export async function ejecutarApiMock({
  endpoint,
  metodo = "GET",
  cuerpo = null,
  token = null,
}) {
  await esperar();

  const datos = obtenerDatos();

  /*
   * AUTENTICACIÓN
   *
   * Estas credenciales existen únicamente para
   * la demostración del Prototipo 1.
   *
   * El backend real utilizará usuarios almacenados
   * en PostgreSQL y contraseñas hasheadas.
   */
  if (endpoint === "/auth/login" && metodo === "POST") {
    const correo = cuerpo?.correo?.trim().toLowerCase();

    const contrasena = cuerpo?.contrasena;

    if (correo !== "admin@smarttable.com" || contrasena !== "123456") {
      respuestaError("Correo o contraseña incorrectos.", 401);
    }

    return {
      token: "jwt-prototipo-smarttable",

      usuario: {
        id: 1,
        nombre: "Administrador SmartTable",
        correo: "admin@smarttable.com",
        rol: "ADMIN",
      },
    };
  }

  if (endpoint === "/auth/me" && metodo === "GET") {
    if (token !== "jwt-prototipo-smarttable") {
      respuestaError("La sesión no es válida o ha expirado.", 401);
    }

    return {
      id: 1,
      nombre: "Administrador SmartTable",
      correo: "admin@smarttable.com",
      rol: "ADMIN",
    };
  }

  /*
   * DASHBOARD
   */
  if (endpoint === "/dashboard/resumen" && metodo === "GET") {
    const disponibles = datos.mesas.filter(
      (mesa) => mesa.estado === "AVAILABLE",
    ).length;

    const ocupadas = datos.mesas.filter(
      (mesa) => mesa.estado === "OCCUPIED",
    ).length;

    const pendientesLimpieza = datos.mesas.filter(
      (mesa) => mesa.estado === "DIRTY",
    ).length;

    const enLimpieza = datos.mesas.filter(
      (mesa) => mesa.estado === "CLEANING",
    ).length;

    return {
      totalMesas: datos.mesas.length,
      disponibles,
      ocupadas,
      pendientesLimpieza,
      enLimpieza,
      turnosEsperando: datos.turnos.filter(
        (turno) => turno.estado === "WAITING",
      ).length,

      porcentajeOcupacion:
        datos.mesas.length > 0
          ? Math.round((ocupadas / datos.mesas.length) * 100)
          : 0,
    };
  }

  /*
   * RESTAURANTE
   */
  if (endpoint === "/restaurante" && metodo === "GET") {
    return datos.restaurante;
  }

  if (endpoint === "/restaurante" && metodo === "PATCH") {
    datos.restaurante = {
      ...datos.restaurante,
      ...cuerpo,
    };

    guardarDatos();

    return datos.restaurante;
  }

  /*
   * PISOS
   */
  if (endpoint === "/pisos" && metodo === "GET") {
    return [...datos.pisos].sort((a, b) => a.orden - b.orden);
  }

  if (endpoint === "/pisos" && metodo === "POST") {
    const nuevoPiso = {
      id: Date.now(),
      nombre: cuerpo.nombre,
      orden: Math.max(0, ...datos.pisos.map((piso) => piso.orden)) + 1,
    };

    datos.pisos.push(nuevoPiso);

    guardarDatos();

    return nuevoPiso;
  }

  const coincidenciaPiso = endpoint.match(/^\/pisos\/(\d+)$/);

  if (coincidenciaPiso && metodo === "PATCH") {
    const idPiso = Number(coincidenciaPiso[1]);

    const indice = datos.pisos.findIndex((piso) => piso.id === idPiso);

    if (indice === -1) {
      respuestaError("El piso no existe.", 404);
    }

    datos.pisos[indice] = {
      ...datos.pisos[indice],
      ...cuerpo,
    };

    guardarDatos();

    return datos.pisos[indice];
  }

  if (coincidenciaPiso && metodo === "DELETE") {
    const idPiso = Number(coincidenciaPiso[1]);

    const tieneMesas = datos.mesas.some((mesa) => mesa.pisoId === idPiso);

    if (tieneMesas) {
      respuestaError("No se puede eliminar un piso que contiene mesas.");
    }

    datos.pisos = datos.pisos.filter((piso) => piso.id !== idPiso);

    guardarDatos();

    return {
      mensaje: "Piso eliminado.",
    };
  }

  /*
   * MESAS
   */
  if (endpoint.startsWith("/mesas") && metodo === "GET") {
    const partes = endpoint.split("?");

    const ruta = partes[0];

    if (ruta === "/mesas") {
      if (!partes[1]) {
        return datos.mesas;
      }

      const parametros = new URLSearchParams(partes[1]);

      const pisoId = parametros.get("pisoId");

      if (!pisoId) {
        return datos.mesas;
      }

      return datos.mesas.filter((mesa) => mesa.pisoId === Number(pisoId));
    }
  }

  if (endpoint === "/mesas" && metodo === "POST") {
    const nuevaMesa = {
      id: Date.now(),
      numero: cuerpo.numero,
      capacidad: Number(cuerpo.capacidad),
      estado: "AVAILABLE",
      pisoId: Number(cuerpo.pisoId),

      posicionX: cuerpo.posicionX ?? 100,

      posicionY: cuerpo.posicionY ?? 100,

      forma: cuerpo.forma ?? "RECTANGLE",

      turnoAsignado: null,
    };

    datos.mesas.push(nuevaMesa);

    guardarDatos();

    return nuevaMesa;
  }

  /*
   * ASIGNACIÓN DE MESA
   *
   * Existen dos modalidades:
   *
   * 1. Normal:
   *    personas <= capacidad
   *
   * 2. Excepción manual:
   *    personas > capacidad
   *    pero permitirExcesoCapacidad === true
   *
   * Nunca se modifica la capacidad configurada de la mesa.
   * La excepción pertenece únicamente a esa asignación.
   */
  const coincidenciaAsignar = endpoint.match(/^\/mesas\/(\d+)\/asignar$/);

  if (coincidenciaAsignar && metodo === "POST") {
    const idMesa = Number(coincidenciaAsignar[1]);

    const mesa = datos.mesas.find((item) => item.id === idMesa);

    const turno = datos.turnos.find(
      (item) => item.id === Number(cuerpo?.turnoId),
    );

    if (!mesa) {
      respuestaError("La mesa no existe.", 404);
    }

    if (!turno) {
      respuestaError("El turno no existe.", 404);
    }

    if (turno.estado !== "WAITING") {
      respuestaError("El turno ya no se encuentra en espera.");
    }

    if (mesa.estado !== "AVAILABLE") {
      respuestaError("La mesa no está disponible.");
    }

    const personasExtra = Math.max(0, turno.personas - mesa.capacidad);

    const excedeCapacidad = personasExtra > 0;

    const permitirExcesoCapacidad = cuerpo?.permitirExcesoCapacidad === true;

    /*
     * Una asignación normal jamás puede superar
     * la capacidad configurada.
     *
     * Para hacerlo se necesita una decisión manual explícita.
     */
    if (excedeCapacidad && !permitirExcesoCapacidad) {
      respuestaError(
        `El grupo tiene ${turno.personas} personas y la Mesa ${mesa.numero} tiene capacidad para ${mesa.capacidad}. Se requiere autorización manual para exceder la capacidad.`,
      );
    }

    mesa.estado = "OCCUPIED";

    mesa.turnoAsignado = {
      turno: turno.turno,
      nombre: turno.nombre,
      personas: turno.personas,

      fechaHoraAsignacion: new Date().toISOString(),

      excedeCapacidad,

      personasExtra,

      asignacionManual: excedeCapacidad,
    };

    turno.estado = "SEATED";

    crearEvento({
      mesa,

      tipo: excedeCapacidad
        ? "TABLE_ASSIGNED_CAPACITY_OVERRIDE"
        : "TABLE_ASSIGNED",

      descripcion: excedeCapacidad
        ? `${turno.turno} - ${turno.nombre} asignado manualmente a Mesa ${mesa.numero} con ${personasExtra} persona(s) sobre su capacidad configurada`
        : `${turno.turno} - ${turno.nombre} asignado a Mesa ${mesa.numero}`,

      usuario: "Hostess",
      origen: "WEB",
    });

    guardarDatos();

    return mesa;
  }

  /*
   * CLIENTES RETIRADOS
   */
  const coincidenciaSalida = endpoint.match(
    /^\/mesas\/(\d+)\/clientes-retirados$/,
  );

  if (coincidenciaSalida && metodo === "POST") {
    const idMesa = Number(coincidenciaSalida[1]);

    const mesa = datos.mesas.find((item) => item.id === idMesa);

    if (!mesa || mesa.estado !== "OCCUPIED") {
      respuestaError("La mesa no está ocupada.");
    }

    mesa.estado = "DIRTY";

    mesa.turnoAsignado = null;

    crearEvento({
      mesa,
      tipo: "CUSTOMERS_LEFT",
      descripcion: `Clientes se retiraron de Mesa ${mesa.numero}`,
      usuario: "Mesero Demo",
      origen: "APP",
    });

    guardarDatos();

    return mesa;
  }

  /*
   * INICIAR LIMPIEZA
   */
  const coincidenciaInicioLimpieza = endpoint.match(
    /^\/mesas\/(\d+)\/limpieza\/iniciar$/,
  );

  if (coincidenciaInicioLimpieza && metodo === "POST") {
    const idMesa = Number(coincidenciaInicioLimpieza[1]);

    const mesa = datos.mesas.find((item) => item.id === idMesa);

    if (!mesa || mesa.estado !== "DIRTY") {
      respuestaError("La mesa no está pendiente de limpieza.");
    }

    mesa.estado = "CLEANING";

    crearEvento({
      mesa,
      tipo: "CLEANING_STARTED",
      descripcion: `Limpieza iniciada en Mesa ${mesa.numero}`,
      usuario: "Limpieza Demo",
      origen: "APP",
    });

    guardarDatos();

    return mesa;
  }

  /*
   * FINALIZAR LIMPIEZA
   */
  const coincidenciaFinLimpieza = endpoint.match(
    /^\/mesas\/(\d+)\/limpieza\/finalizar$/,
  );

  if (coincidenciaFinLimpieza && metodo === "POST") {
    const idMesa = Number(coincidenciaFinLimpieza[1]);

    const mesa = datos.mesas.find((item) => item.id === idMesa);

    if (!mesa || mesa.estado !== "CLEANING") {
      respuestaError("La mesa no está en limpieza.");
    }

    mesa.estado = "AVAILABLE";

    crearEvento({
      mesa,
      tipo: "CLEANING_FINISHED",
      descripcion: `Limpieza finalizada en Mesa ${mesa.numero}`,
      usuario: "Limpieza Demo",
      origen: "APP",
    });

    guardarDatos();

    return mesa;
  }

  /*
   * ACTUALIZAR / ELIMINAR MESA
   */
  const coincidenciaMesa = endpoint.match(/^\/mesas\/(\d+)$/);

  if (coincidenciaMesa && metodo === "GET") {
    const idMesa = Number(coincidenciaMesa[1]);

    const mesa = datos.mesas.find((item) => item.id === idMesa);

    if (!mesa) {
      respuestaError("La mesa no existe.", 404);
    }

    return mesa;
  }

  if (coincidenciaMesa && metodo === "PATCH") {
    const idMesa = Number(coincidenciaMesa[1]);

    const indice = datos.mesas.findIndex((mesa) => mesa.id === idMesa);

    if (indice === -1) {
      respuestaError("La mesa no existe.", 404);
    }

    datos.mesas[indice] = {
      ...datos.mesas[indice],
      ...cuerpo,
    };

    guardarDatos();

    return datos.mesas[indice];
  }

  if (coincidenciaMesa && metodo === "DELETE") {
    const idMesa = Number(coincidenciaMesa[1]);

    const mesa = datos.mesas.find((item) => item.id === idMesa);

    if (!mesa) {
      respuestaError("La mesa no existe.", 404);
    }

    if (mesa.estado !== "AVAILABLE") {
      respuestaError("Sólo pueden eliminarse mesas disponibles.");
    }

    datos.mesas = datos.mesas.filter((item) => item.id !== idMesa);

    guardarDatos();

    return {
      mensaje: "Mesa eliminada.",
    };
  }

  /*
   * TURNOS
   */
  if (endpoint === "/turnos" && metodo === "GET") {
    return datos.turnos.filter((turno) => turno.estado === "WAITING");
  }

  if (endpoint === "/turnos" && metodo === "POST") {
    const numero = datos.siguienteNumeroTurno;

    const turno = {
      id: Date.now(),

      turno: `A${String(numero).padStart(3, "0")}`,

      nombre: cuerpo.nombre.trim(),

      personas: Number(cuerpo.personas),

      fechaHoraLlegada: new Date().toISOString(),

      estado: "WAITING",
    };

    datos.siguienteNumeroTurno++;

    datos.turnos.push(turno);

    crearEvento({
      tipo: "WAITLIST_CREATED",
      descripcion: `${turno.turno} registrado para ${turno.nombre}`,
      usuario: "Hostess",
    });

    guardarDatos();

    return turno;
  }

  const coincidenciaCancelar = endpoint.match(/^\/turnos\/(\d+)\/cancelar$/);

  if (coincidenciaCancelar && metodo === "POST") {
    const idTurno = Number(coincidenciaCancelar[1]);

    const turno = datos.turnos.find((item) => item.id === idTurno);

    if (!turno) {
      respuestaError("El turno no existe.", 404);
    }

    turno.estado = "CANCELLED";

    crearEvento({
      tipo: "WAITLIST_CANCELLED",
      descripcion: `${turno.turno} - ${turno.nombre} salió de la lista de espera`,
      usuario: "Hostess",
    });

    guardarDatos();

    return turno;
  }

  /*
   * EVENTOS / HISTORIAL
   */
  if (endpoint.startsWith("/eventos") && metodo === "GET") {
    return datos.eventos;
  }

  respuestaError(`Endpoint Mock no implementado: ${metodo} ${endpoint}`, 404);
}

/**
 * Permite recuperar el escenario de demostración.
 */
export function reiniciarApiMock() {
  datosEnMemoria = crearDatosIniciales();

  guardarDatos();
}
