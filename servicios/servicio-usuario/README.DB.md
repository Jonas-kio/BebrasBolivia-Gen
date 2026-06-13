# Base de Datos - Servicio Usuario (Prisma + Neon)

## 1. Alcance
Este documento define el flujo oficial de base de datos para `servicio-usuario`.

- Prisma `6.18.0`
- PostgreSQL en Neon
- Entornos separados: `dev`, `test`, `production`

## 2. Estado actual del proyecto
- Actualmente, el unico microservicio backend implementado es `servicio-usuario`.
- Las referencias a posibles servicios futuros son solo ejemplos de arquitectura.
- La division final de microservicios aun no esta cerrada.

## 3. Principios de arquitectura BD
- Cada servicio debe ser dueño exclusivo de sus tablas y migraciones.
- No compartir carpeta `prisma/` entre servicios.
- No acoplar servicios por acceso directo a tablas de otro dominio.
- La comunicacion entre dominios debe ser por API, no por joins entre bases de datos.
- Mantener migraciones independientes por servicio facilita separacion futura sin rehacer codigo.

## 4. Componentes BD en servicio-usuario
- `prisma/schema.prisma`: definicion actual introspectada desde BD.
- `prisma/migrations/`: historial versionado de cambios.
- `prisma/seed.ts`: seed de datos base.
- `prisma.config.ts`: ruta de schema y seed para Prisma CLI.
- `src/config/base-de-datos.ts`: instancia unica de `PrismaClient`.
- `src/repositorios/`: acceso a datos por entidad.
- `pruebas/integracion/base-de-datos.test.ts`: conectividad de BD.

## 5. Repositorios base
Repositorios de ejemplo ya implementados:
- `usuario-repositorio.ts`
- `institucion-repositorio.ts`
- `pregunta-repositorio.ts`

Patron para nuevos repositorios:
- Usar `crearXxxRepositorio(conexionBD)` para permitir inyeccion de dependencias en tests.
- Importar tipos desde `@prisma/client`.
- No instanciar `PrismaClient` dentro del repositorio.
- Usar siempre `src/config/base-de-datos.ts`.

## 6. Variables de entorno
Archivos:
- `.env` (`dev`)
- `.env.test` (`test`)
- `.env.production` (`production`)
- `.env*.example` (plantillas)

Variables requeridas:
- `DATABASE_URL`
- `SHADOW_DATABASE_URL` (obligatoria para `migrate dev` y `migrate reset`)
- `RUN_DB_INTEGRATION_TESTS` (`true` para habilitar prueba de conectividad BD)

Reglas:
- `SHADOW_DATABASE_URL` debe ser diferente de `DATABASE_URL`.
- Usar bases separadas por entorno.
- No versionar `.env` reales; solo `.env*.example`.

## 7. Scripts BD disponibles
- `npm run prisma:generate`: genera Prisma Client.
- `npm run db:migrate:dev`: crea/aplica migraciones en `dev`.
- `npm run db:migrate:deploy`: aplica migraciones en `production`.
- `npm run db:seed`: ejecuta seed en `dev`.
- `npm run db:seed:test`: ejecuta seed en `test`.
- `npm run db:reset:test`: resetea y reaplica migraciones en `test`.
- `npm run db:test`: prueba de conectividad BD.
- `npm run db:smoke:test`: generate + reset + seed + test BD + integracion.
- `npm test`: ejecuta `pretest` (`prisma:generate`) y luego Jest.

## 8. Flujo recomendado por entorno
`dev`:
1. `npm run db:migrate:dev`
2. `npm run prisma:generate`
3. `npm run db:seed`
4. `npm test`

`test`:
1. `npm run db:reset:test`
2. `npm run db:seed:test`
3. `npm run db:test`
4. `npm run test:integration`

`production`:
1. `npm run db:migrate:deploy`

## 9. Flujo para cambios de esquema
1. Cambiar estructura de BD mediante migracion versionada.
2. Aplicar cambios en `dev` (`db:migrate:dev` o `migrate deploy`, segun el caso).
3. Sincronizar `schema.prisma`:
   - `npx prisma db pull --schema prisma/schema.prisma`
4. Regenerar cliente:
   - `npx prisma generate --schema prisma/schema.prisma`
5. Validar:
   - `npm run lint && npm test`

## 10. Migraciones actuales
`20260507210000_init`
- Baseline inicial.
- Crea schema `bebras` y extension `pgcrypto`.

`20260511123000_estandares_63_campos_base`
- Estandarización de campos base:
- `activo` -> `esta_activo`
- `creado_en`, `actualizado_en`, `esta_activo` donde faltaban.

`20260513090000_estandares_26_booleanos`
- Estandarización de variables booleanas:
- `verificado` -> `esta_verificado`
- `leida` -> `esta_leida`
- `marcada` -> `esta_marcada`
- `permite_reanudar` -> `puede_reanudar`

## 11. Pruebas
- `pruebas/unitarias/`: tests unitarios de repositorios con mock de PrismaClient.
- `pruebas/integracion/base-de-datos.test.ts`: conectividad BD real.

## 12. Notas operativas
- No modificar migraciones ya aplicadas.
- No ejecutar SQL manual en production fuera de migraciones.
- `migration_lock.toml` debe permanecer versionado.
- `db pull` regenera modelos desde la BD real; revisar diff antes de commitear.
- Todo repositorio nuevo debe incluir tests unitarios en `pruebas/unitarias/`.

## 13. Aclaraciones BD para futuros microservicios
Estas definiciones aplican cuando se creen nuevos servicios.

Estado actual:
- Toda la implementacion de BD de esta etapa se mantiene en `servicio-usuario`.
- No se movera de forma inmediata mientras no existan otros servicios implementados.
- La distribucion de tablas y responsabilidades se ajustara progresivamente y con migraciones versionadas.

Definiciones obligatorias por servicio nuevo:
- `prisma/schema.prisma` propio.
- `prisma/migrations/` propio.
- `prisma.config.ts` propio.
- `src/config/base-de-datos.ts` propio.
- `.env*.example` propios.
- No compartir `prisma/` ni `PrismaClient` entre servicios.

Propiedad de datos:
- Cada servicio es dueño de sus tablas.
- Un servicio no migra ni escribe tablas de otro servicio.
- Si un servicio requiere datos de otro dominio, debe consumir API del otro servicio.

Implementacion:
- Si se mantiene una sola instancia PostgreSQL/Neon, el aislamiento sigue siendo por servicio/dominio.
- Esto permite separar a futuro en instancias distintas sin rehacer la capa de aplicacion.
