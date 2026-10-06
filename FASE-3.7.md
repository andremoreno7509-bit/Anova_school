# Fase 3.7 — A-NOVA Assess (v0.3.6)

Módulo de evaluaciones y exámenes. Incluye creación por profesor, ventana de aplicación, duración, intentos, preguntas de opción múltiple, verdadero/falso y respuesta abierta, autocorrección de reactivos objetivos, intentos persistentes y resultados.

## Seguridad
Las operaciones validan sesión, rol, asignación docente, inscripción activa, ventana de aplicación y máximo de intentos en backend.

## Despliegue
Antes de desplegar ejecutar Prisma generate/push para crear Exam, ExamQuestion, ExamAttempt y ExamAnswer. Esta versión conserva los requisitos de Vercel Blob introducidos en Fase 3.1.

## Hotfix 0.3.6.1

Corrige relaciones MessageSender/MessageRecipient declaradas incorrectamente en School. Se conservan en User, que es el lado correcto de sender/recipient.
