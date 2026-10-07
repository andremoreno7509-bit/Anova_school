# A-NOVA Fase 5 · Enterprise / v0.5.0

Fase 5 convierte A-NOVA en una plataforma preparada para operar como producto escolar multi-tenant.

## Incluido
- White-label por escuela: nombre, nombre corto, logo, colores, contacto, dirección y pie de reportes.
- Branding dinámico en login, sidebar y documentos.
- Auditoría persistente de accesos y operaciones Enterprise, con actor, IP, fecha y entidad.
- Reporte ejecutivo institucional con PDF y exportación CSV de alumnos/indicadores.
- Seguridad avanzada: bloqueo temporal tras intentos fallidos, historial de último acceso e IP, desbloqueo administrativo y política de contraseña fuerte.
- Integraciones: fuentes API/Connector, SQL Server, MySQL, PostgreSQL, CSV/SIS y tokens rotables.
- Push API `/api/integrations/push` para sincronizar alumnos desde un A-NOVA Connector con token Bearer.
- Historial de sincronizaciones con creados, actualizados, omitidos y errores.
- Licencia/tenant con límites de alumnos y staff.
- Base multi-colegio mediante aislamiento por `schoolId`.
- Endpoint de onboarding `/api/platform/register-school`, deshabilitado salvo que exista `PLATFORM_SETUP_KEY`.
- Tutor demo en seed local: `tutor@anova.edu.mx` / `Nova2026!`.

## Variables opcionales
- `BLOB_READ_WRITE_TOKEN`: permite subir logo y archivos mediante Vercel Blob.
- `PLATFORM_SETUP_KEY`: habilita onboarding controlado de nuevas escuelas.
- `NEXT_PUBLIC_SCHOOL_CODE` o `SCHOOL_CODE`: fija el tenant de branding para despliegues dedicados.

## Seguridad
No se almacenan tokens de integración en texto plano. Sólo se conserva un hash bcrypt y un prefijo identificador. El token completo se muestra una única vez al crearlo o rotarlo.
