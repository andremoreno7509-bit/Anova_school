# Publicar A-NOVA v0.5.0 Enterprise

## Base de producción
- Next.js 15.5.7
- PostgreSQL / Neon mediante `DATABASE_URL`
- Prisma schema de producción: `prisma/schema.postgresql.prisma`
- Vercel recomendado para despliegue

## Variables obligatorias
- `DATABASE_URL`: conexión PostgreSQL de Neon.
- `AUTH_SECRET`: secreto largo y privado para las sesiones.

## Variables opcionales de Fase 5
- `BLOB_READ_WRITE_TOKEN`: habilita archivos privados y carga del logo institucional con Vercel Blob.
- `PLATFORM_SETUP_KEY`: habilita el endpoint controlado `/api/platform/register-school` para dar de alta nuevos colegios. Si no existe, el endpoint permanece bloqueado.
- `NEXT_PUBLIC_SCHOOL_CODE` o `SCHOOL_CODE`: fija el colegio cuyo branding se muestra antes de iniciar sesión en un despliegue dedicado.

## Build Command de Vercel
```bash
npm run db:generate:prod && npm run db:push:prod && npm run build
```

## Cambios de base de datos v0.5.0
Fase 5 agrega tablas nuevas para configuración institucional, auditoría, integraciones, historial de sincronización y licencia. También agrega campos de seguridad a `User` con valores por defecto u opcionales, por lo que la actualización está diseñada para conservar los usuarios existentes.

No usar `--force-reset` en producción.

## Multi-colegio
Cada registro académico continúa aislado mediante `schoolId`. Para onboarding automatizado de una nueva escuela se requiere `PLATFORM_SETUP_KEY`; nunca debe exponerse en el navegador ni almacenarse en el repositorio.

## v0.5.1 · CSB Pedregal Edition
No requiere cambios de esquema adicionales respecto a v0.5.0. Incluye assets estáticos de branding en `public/` y un preset CSB para el tenant demo existente. El Build Command de Vercel puede permanecer igual:

`npm run db:generate:prod && npm run db:push:prod && npm run build`
