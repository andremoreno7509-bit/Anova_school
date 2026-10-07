# A-NOVA v0.5.1 · CSB Pedregal Edition

Personalización institucional del Colegio Simón Bolívar del Pedregal sobre A-NOVA Enterprise.

## Identidad visual
- Nombre visible: Colegio Simón Bolívar del Pedregal.
- Nombre corto: CSB Pedregal.
- Logotipo institucional incluido en `public/csb-logo.jpg`.
- Favicon institucional incluido en `public/csb-favicon.png`.
- Paleta tomada del escudo proporcionado:
  - Guinda: `#670337`
  - Azul marino: `#02244A`
  - Dorado: `#D4AD22`
  - Verde de apoyo: `#BBD037`
- Lema utilizado en login: “Formar para construir un mundo fraterno”.
- Powered by A-NOVA se mantiene visible.

## Cambios de interfaz
- Login premium CSB.
- Sidebar y navegación con identidad CSB.
- Dashboard, tarjetas, botones y estados adaptados a la paleta institucional.
- Título y favicon del navegador personalizados.
- Reportes y boletas toman el nombre, logo y pie institucional normalizado.
- Configuración institucional conserva el modelo white-label de Fase 5.

## Compatibilidad
Esta versión no agrega tablas ni campos nuevos al esquema Prisma. Puede desplegarse sobre la base de datos utilizada por v0.5.0 Enterprise.

## Nota de tenant demo
El tenant `ANOVA-DEMO` recibe automáticamente el preset CSB cuando aún conserva la identidad legacy de A-NOVA. Al guardar Configuración institucional, los valores quedan persistidos en `SchoolSettings`.
