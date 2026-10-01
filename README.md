# A-NOVA School — MVP 0.1.7

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
