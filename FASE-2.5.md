# A-NOVA · Fase 2.5 · v0.2.4

## Incluido
- Periodos de evaluación administrables por ciclo, con apertura/cierre de captura.
- Horario escolar por asignación docente, día, hora y aula.
- Reportes e incidencias con categoría, severidad, estado, alumno y responsable.
- Profesores pueden registrar incidencias únicamente para alumnos de sus grupos.
- Alumnos consultan su horario y sus reportes desde su propio portal.
- Nuevos modelos Prisma: EvaluationPeriod, ScheduleEntry e Incident.

## Nota
Antes de usar esta versión sobre una base existente, ejecutar `npm run db:push` en local o los comandos de producción indicados en DEPLOYMENT.md para sincronizar el esquema.
