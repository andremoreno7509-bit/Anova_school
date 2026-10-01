# Publicar A-NOVA 0.1.7

## Estado
El proyecto está preparado como MVP. En local usa SQLite. Para una publicación multiusuario se recomienda PostgreSQL.

## Variables de producción
- `DATABASE_URL`: conexión PostgreSQL suministrada por tu proveedor.
- `AUTH_SECRET`: cadena larga y aleatoria que solo debe existir en las variables privadas del hosting.

## Prisma en producción
La definición PostgreSQL está en `prisma/schema.postgresql.prisma`.

```bash
npm install
npm run db:generate:prod
npm run db:push:prod
npm run build
npm start
```

Antes de una publicación real cambia las contraseñas demo y decide si las cuentas de demostración permanecerán habilitadas.
