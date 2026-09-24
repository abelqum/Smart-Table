# SmartTable

SmartTable es un prototipo web para la gestión operativa de mesas en restaurantes.

El sistema permite administrar la lista de espera, asignar grupos a mesas, representar gráficamente la distribución del restaurante y controlar el ciclo operativo de cada mesa.

## Prototipo 1

Esta versión corresponde a la primera revisión del proyecto.

### Funcionalidades

- Inicio y cierre de sesión
- Dashboard operativo
- Gestión de lista de espera
- Asignación automática de grupos según capacidad
- Asignación manual con excepciones de capacidad
- Gestión del estado de las mesas
- Flujo Disponible → Ocupada → Pendiente de limpieza → En limpieza → Disponible
- Historial de eventos
- Configuración del restaurante
- Gestión de pisos y mesas
- Editor gráfico de distribución
- Visualización del croquis durante la operación
- Persistencia simulada mediante API Mock

## Tecnologías

- Next.js
- React
- JavaScript
- Tailwind CSS
- TanStack Query
- React Hook Form
- Zod
- SweetAlert2
- React Konva
- Lucide React

## Arquitectura actual

El frontend utiliza una capa de servicios y un cliente API desacoplados de la interfaz.

Actualmente:

Frontend → Services → clienteApi → API Mock

Posteriormente:

Frontend → Services → clienteApi → Express → PostgreSQL

## Ejecutar localmente

Instalar dependencias:

```bash
npm install
```
