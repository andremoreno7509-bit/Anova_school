# A-NOVA School — v0.4.0 Intelligence

Primera versión usable de A-NOVA antes de iniciar la Fase 2 académica.

## Incluye
- Login real con correo y contraseña cifrada.
- Sesión persistente mediante cookie HTTP-only.
- Roles Alumno / Profesor / Administrador.
- Dashboard independiente por rol.
- Alumno conectado a ciclo, grupo, materias y profesores.
- Panel administrativo para usuarios, grupos, materias, ciclos y asignaciones.
- Activación/desactivación lógica de registros.
- Pantallas de carga, error y 404.
- Interfaz responsive.
- Configuración local SQLite y esquema PostgreSQL separado para producción.

## Ejecutar localmente
```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```
Abre http://localhost:3000

## Cuentas demo
- Alumno: andre@anova.edu.mx
- Profesor: edgar@anova.edu.mx
- Administrador: admin@anova.edu.mx
- Contraseña demo: Nova2026!

## Publicación
Consulta `DEPLOYMENT.md`. Una URL pública requiere un proveedor de hosting y una base PostgreSQL accesible por ese hosting.

A-NOVA School © 2026 — Developed by André Moreno


## Fase 3.1 · A-NOVA Assignments
La v0.3.0 incorpora entregas de tareas, archivos privados, calificación y retroalimentación. Consulta `FASE-3.1.md`.

## Fase 3.3 · v0.3.3
Incluye centro de notificaciones persistente y eventos académicos automáticos para alumno y tutor.

## Fase 3.4
Boletas académicas descargables en PDF con permisos por rol.


## Fase 4 · A-NOVA Intelligence
La v0.4.0 incorpora dashboard ejecutivo, Academic Risk Engine, tendencias, comparativas, alertas, recomendaciones, reporte PDF y un asistente analítico determinista con alcance por rol. Consulta `FASE-4.md`.
