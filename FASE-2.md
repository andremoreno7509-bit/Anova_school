# A-NOVA School · Fase 2

Versión 0.2.0 inicia la conversión del MVP en un sistema de control escolar administrable.

## Fase 2.1 · Usuarios
- Alta de alumnos, profesores y administradores.
- Contraseña temporal opcional.
- Búsqueda por nombre, correo o matrícula/número de empleado.
- Filtro por rol.
- Edición de nombre, correo, rol, código y grupo.
- Cambio opcional de contraseña desde edición.
- Activación y desactivación de cuentas.
- Protección para impedir que el administrador se desactive o quite su propio rol.
- Etiquetas de rol y estado en español.

## Despliegue
Mantener en Vercel:
`npm run db:generate:prod && npm run db:push:prod && npm run build`

No volver a agregar `node prisma/seed.js` al Build Command para uso normal.

## v0.2.1 — Fase 2.2
- Gestión reforzada de grupos con edición/activación y protección de integridad.
- Catálogo de materias con edición/activación y bloqueo si existen asignaciones.
- Asignaciones validadas Profesor + Materia + Grupo y opción de eliminación.
- Datos de grupo ampliados: alumnos inscritos, docentes y materias asociadas.
- Validaciones multi-escuela y de estado activo en las API administrativas.
