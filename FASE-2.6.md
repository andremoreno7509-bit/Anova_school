# A-NOVA — Fase 2.6 / v0.2.5

Versión de integración y estabilización de la Fase 2.

## Cierre funcional
- Flujo integrado Administrador → Profesor → Alumno.
- La captura de calificaciones valida el periodo real del ciclo escolar.
- Un periodo cerrado bloquea nuevas capturas/modificaciones de calificaciones.
- Validación de escala 0–10 y pertenencia del alumno al grupo del profesor.
- Asistencia, tareas e incidencias conservan validación por asignación docente.
- El alumno consulta únicamente datos vinculados a su sesión e inscripción activa.
- Administración mantiene separación por escuela en sus consultas.
- Versionado visual y de paquete actualizado a 0.2.5.

## Prueba recomendada
1. Admin: crear/abrir un periodo, verificar grupo, materia y asignación.
2. Profesor: capturar calificación, asistencia, tarea e incidencia.
3. Admin: cerrar el periodo y comprobar que una nueva captura de nota sea rechazada.
4. Alumno: comprobar calificaciones, asistencia, tareas, horario e incidencias.
5. Reabrir el periodo únicamente si se requieren correcciones.

## Antes de producción
Respaldar la base de datos y probar `db:generate:prod`, `db:push:prod` y `npm run build` con variables de entorno de staging/producción.
