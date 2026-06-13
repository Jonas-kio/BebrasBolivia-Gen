# BebrasBolivia-Gen

Monorepo: Frontend Next.js + Backend Express + Testing Jest

## Requisitos

- Node.js 22.22.2
- npm 10.9.7
- Git
- nvm (para gestionar versiones de Node)

## Inicio Rápido

```bash
# 1. Activar versión de Node
nvm use

# 2. Instalar dependencias exactas (IMPORTANTE: usa npm ci, NO npm install)
npm ci

# 3. Ejecutar frontend (Next.js) - http://localhost:3000
npm run dev --workspace=cliente

# 4. Ejecutar backend (Express) - http://localhost:4102/health
npm --prefix servicios/servicio-usuario run dev

# 5. Ejecutar tests
npm run validate
```

**¿Por qué `npm ci` y no `npm install`?**

- `npm ci` (Clean Install): Instala **versiones exactas** del `package-lock.json`. Garantiza que todos en el equipo tengan exactamente las mismas versiones. **ESTO ES LO QUE DEBES USAR.**
- `npm install`: Puede actualizar versiones según los rangos (`^`, `~`). Puede causar diferencias entre máquinas del equipo.

**Resumen**: Siempre usa `npm ci` en el setup inicial. Solo usa `npm install` si necesitas agregar una dependencia nueva.

## Comandos Principales

```bash
# Tests y validación completa (ejecutar antes de push)
npm run validate

# Tests por workspace
npm run test --workspace=cliente
npm run test --workspace=servicios

# Build
npm run build

# Lint
npm run lint

# Format
npm run format
```

## Git Workflow

- `main`: rama estable
- `develop`: rama de integración
- Crear PR con formato: `feat/nombre-feature` o `fix/nombre-bug`
- Usar Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Todo commit ejecuta hooks automáticos (lint, format, tests)

## Estructura

```
BebrasBolivia-Gen/
├── cliente/              # Frontend Next.js + React
├── servicios/
│   └── servicio-usuario/ # Backend Express (puerto 4102)
├── .husky/               # Git hooks
├── .github/workflows/    # CI/CD
└── package.json          # Monorepo root
```
- Evitar cambios innecesarios en archivos raiz compartidos.
- Correr `npm test` y `npm run build` antes de abrir PR.
- Mantener dominio/aplicacion desacoplados de infraestructura en cada servicio.
