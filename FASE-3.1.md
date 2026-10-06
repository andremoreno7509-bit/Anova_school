# A-NOVA School · Fase 3.1 · Assignments

Versión: 0.3.0

## Incluido
- Profesor publica tareas con instrucciones, fecha y puntos.
- Profesor adjunta materiales (PDF, Word, PowerPoint, Excel, imágenes, TXT y ZIP).
- Alumno descarga materiales y adjunta su entrega.
- Estado por alumno: pendiente, entregada, entregada tarde y calificada.
- Profesor consulta entregas, descarga archivos, califica y escribe retroalimentación.
- Alumno consulta calificación y retroalimentación.
- Archivos privados con Vercel Blob; PostgreSQL conserva sólo metadatos y relaciones.
- Autorización por sesión para subida y descarga.
- Límite inicial por archivo: 4 MB.

## Infraestructura requerida en producción
Conectar un Vercel Blob Store privado al proyecto `anova-school`. La aplicación usa `@vercel/blob` y acceso privado. En proyectos nuevos Vercel puede autenticar Blob mediante OIDC; no se deben exponer credenciales al navegador.

## Modelos nuevos
- TaskAttachment
- TaskSubmission
- SubmissionAttachment

AcademicTask ahora incluye `status`, `updatedAt`, adjuntos y entregas.

## Flujo
Profesor -> publica -> adjunta material -> Alumno -> descarga -> adjunta/entrega -> Profesor -> revisa/califica -> Alumno -> recibe resultado.
