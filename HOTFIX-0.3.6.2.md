# A-NOVA v0.3.6.2 Hotfix

Corrige el despliegue sobre una base existente: `AcademicTask.updatedAt` ahora tiene `@default(now()) @updatedAt`, permitiendo que PostgreSQL asigne un valor a tareas ya existentes durante `prisma db push`.

No requiere `--force-reset` y no elimina datos.
