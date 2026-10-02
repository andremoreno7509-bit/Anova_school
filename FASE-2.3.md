# A-NOVA Fase 2.3 · Portal del Profesor · v0.2.2

Esta versión incorpora operación docente real sobre Prisma/PostgreSQL:

- Mis grupos y materias asignadas.
- Captura de calificaciones por periodo (0–10).
- Pase de lista por fecha: presente, falta, retardo y justificada.
- Creación y archivado de tareas por grupo/materia.
- Validación de permisos: un profesor solo puede modificar alumnos pertenecientes a sus asignaciones.
- Nuevos modelos: Grade, AttendanceRecord y AcademicTask.

Para actualizar una base existente, ejecutar `prisma db push` (local) o el comando de producción ya configurado antes del build.
