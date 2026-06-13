# Frontend - BebrasBolivia UI

Aplicación frontend construida con Next.js, Tailwind y TypeScript.

## Requisitos

- Node.js 22.22.2
- npm >= 9

## Instalación

Desde la carpeta `client`:

```bash
npm ci
```

Desde la raíz del monorepo (alternativa recomendada):

```bash
npm ci
npm run install:all
```

## Variables de entorno

Crear `client/.env` usando `client/.env.example`.

Valor actual en `.env.example`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"
```

Variables también soportadas por el cliente (recomendadas con microservicios):

```env
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:4101
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:4102
NEXT_PUBLIC_TEAM_SERVICE_URL=http://localhost:4103
```

## Desarrollo

Desde `client/`:

```bash
npm run dev
```

Abre `http://localhost:3000`.

## Scripts disponibles

- `npm run dev`: servidor de desarrollo
- `npm run build`: build de producción
- `npm start`: levantar build de producción
- `npm run lint`: revisión ESLint
- `npm run format:check`: validar formato Prettier
- `npm run format`: aplicar formato Prettier
- `npm run test`: tests (Jest)
- `npm run type-check`: verificación TypeScript

## Integración con microservicios

El frontend consume los servicios del backend en `services/`.

Puertos por defecto esperados:
- `auth-service`: `4101`
- `user-service`: `4102`
- `team-service`: `4103`

Si el frontend no conecta, revisa:
1. Que los microservicios estén corriendo.
2. Que `client/.env` tenga URLs correctas.
3. Que no haya conflictos de puertos locales.

## Calidad mínima antes de PR

Desde `client/`:

```bash
npm run lint
npm run type-check
npm run build
```
