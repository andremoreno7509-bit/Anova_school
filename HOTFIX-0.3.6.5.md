# A-NOVA v0.3.6.5 — Build hotfix

Corrección del error de compilación reportado por Next.js en `app/page.js` (`Expected ';', got 'if'`).

La rama de `StudentModule` para Evaluaciones no terminaba la sentencia JSX antes de iniciar la condición de Horario. Se añadió el separador correcto:

`if(page==='Evaluaciones') return <ExamCenter role="Alumno"/>;`

No modifica el esquema de base de datos.
