# A-NOVA v0.3.6.3 Hotfix

Corrige caracteres de escape literales `\\n` introducidos en `app/page.js` que provocaban `Expected unicode escape` durante el build de Next.js/Vercel.

También se ejecutó `node --check` sobre todos los archivos JavaScript de `app`, `lib` y `prisma` sin errores de sintaxis.
