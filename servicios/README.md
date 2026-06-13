# Services Workspace

Esta carpeta contiene el backend en arquitectura de microservicios.

## Microservicios disponibles

- `auth-service`
- `user-service`
- `team-service`

## Estructura base por servicio

```text
<service>/
|-- src/
|   |-- app.ts
|   |-- server.ts
|   |-- config/
|   |-- modules/<domain>/
|   `-- shared/http/
|-- pruebas/
|   |-- unitarias/
|   `-- integracion/
|-- jest.config.cjs
|-- tsconfig.json
`-- package.json
```

## Variables de entorno

Archivo recomendado: `services/.env` basado en `services/.env.example`.

```env
AUTH_SERVICE_PORT=4101
USER_SERVICE_PORT=4102
TEAM_SERVICE_PORT=4103
```

## Scripts (desde `services/`)

```bash
npm run dev
npm run dev:auth
npm run dev:user
npm run dev:team

npm run test
npm run lint
npm run build
```

## Tests por microservicio

```bash
npm --prefix auth-service run test:unit
npm --prefix auth-service run test:integration

npm --prefix user-service run test:unit
npm --prefix user-service run test:integration

npm --prefix team-service run test:unit
npm --prefix team-service run test:integration
```

## Puertos por defecto

- `auth-service`: `4101`
- `user-service`: `4102`
- `team-service`: `4103`

## Docker Compose

Desde la raiz del repositorio:

```bash
docker compose up
```

Actualmente el compose incluye PostgreSQL y `auth-service`.

## Convenciones de colaboración

- Node.js 22.22.2 es la version objetivo del monorepo.

- Mantener contratos de negocio en `domain`.
- Orquestar casos de uso en `application`.
- Implementaciones concretas en `infrastructure`.
- Mantener `server.ts` y `app.ts` sin lógica de negocio.
- Reutilizar `pruebas/integracion/fixtures` para escenarios integrados.

## Validación mínima antes de PR

```bash
npm run lint
npm run test
npm run build
```
