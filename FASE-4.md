# A-NOVA v0.4.0 — Intelligence · Fase 4 completa

La Fase 4 convierte la información operativa de A-NOVA en indicadores académicos explicables y accionables sin cambiar el esquema de base de datos.

## Incluye
- Intelligence Dashboard por rol: Dirección, profesor, alumno y tutor.
- KPIs de promedio, asistencia, aprobación y tareas vencidas.
- Tendencia de promedio por periodo.
- Academic Risk Engine con niveles LOW / MEDIUM / HIGH.
- Factores explicables: promedio, asistencia, tareas vencidas, caída entre periodos e incidencias.
- Recomendaciones automáticas de intervención.
- Comparativa de grupos.
- Comparativa de materias y porcentaje de reprobación.
- Alertas automáticas de riesgo, asistencia, rezago y entregas.
- Intelligence Assistant beta para consultas sobre los datos autorizados de cada usuario.
- Reporte ejecutivo descargable en PDF.
- Seguridad por alcance: Admin ve su escuela; profesor únicamente sus asignaciones; tutor sólo alumnos vinculados; alumno sólo su información.

## Motor de riesgo
El riesgo es determinista, no generativo. La clasificación se calcula con reglas transparentes y una puntuación de 0 a 100. El asistente beta interpreta las métricas ya calculadas y no envía información a un proveedor externo.

## Privacidad
A-NOVA Intelligence reutiliza los datos existentes en PostgreSQL/Neon. Esta versión no requiere nuevas tablas ni una migración adicional de Prisma.

## Producción
Antes de reemplazar producción ejecutar:

```bash
npm install
npm run db:generate:prod
npm run build
```

El comando de Vercel puede mantenerse como:

```bash
npm run db:generate:prod && npm run db:push:prod && npm run build
```
