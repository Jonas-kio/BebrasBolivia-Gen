#!/usr/bin/env bash
set -Eeuo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/deploy.sh --db-user USER --db-password PASSWORD --db-name NAME [options]

Required:
  --db-user VALUE              PostgreSQL user.
  --db-password VALUE          PostgreSQL password.
  --db-name VALUE              PostgreSQL database name.

Options:
  --db-port VALUE              Host PostgreSQL port. Default: 5432.
  --backend-port VALUE         Host backend port. Default: 4102.
  --frontend-port VALUE        Host frontend port. Default: 3000.
  --url-cliente VALUE          Backend CORS/client URL. Default: http://localhost:3000.
  --next-public-api-url VALUE  Frontend public API URL. Default: http://localhost:4102/api/v1.
  -h, --help                   Show this help.
USAGE
}

fail() {
  echo "ERROR: $1" >&2
  exit 1
}

DB_USER=""
DB_PASSWORD=""
DB_NAME=""
DB_PORT="5432"
BACKEND_PORT="4102"
FRONTEND_PORT="3000"
URL_CLIENTE="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:4102/api/v1"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --db-user)
      DB_USER="${2:-}"
      shift 2
      ;;
    --db-password)
      DB_PASSWORD="${2:-}"
      shift 2
      ;;
    --db-name)
      DB_NAME="${2:-}"
      shift 2
      ;;
    --db-port)
      DB_PORT="${2:-}"
      shift 2
      ;;
    --backend-port)
      BACKEND_PORT="${2:-}"
      shift 2
      ;;
    --frontend-port)
      FRONTEND_PORT="${2:-}"
      shift 2
      ;;
    --url-cliente)
      URL_CLIENTE="${2:-}"
      shift 2
      ;;
    --next-public-api-url)
      NEXT_PUBLIC_API_URL="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "Parametro desconocido: $1"
      ;;
  esac
done

[[ -n "$DB_USER" ]] || fail "Falta --db-user"
[[ -n "$DB_PASSWORD" ]] || fail "Falta --db-password"
[[ -n "$DB_NAME" ]] || fail "Falta --db-name"

command -v docker >/dev/null 2>&1 || fail "Docker no esta instalado o no esta en PATH"
docker compose version >/dev/null 2>&1 || fail "Docker Compose no esta disponible"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

export DB_USER
export DB_PASSWORD
export DB_NAME
export DB_PORT
export BACKEND_PORT
export FRONTEND_PORT
export URL_CLIENTE
export NEXT_PUBLIC_API_URL

cat > .env <<ENV_FILE
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DB_PORT=${DB_PORT}
BACKEND_PORT=${BACKEND_PORT}
FRONTEND_PORT=${FRONTEND_PORT}
URL_CLIENTE=${URL_CLIENTE}
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV_FILE

echo "Deteniendo contenedores previos..."
docker compose down --remove-orphans

echo "Construyendo imagenes sin cache..."
docker compose build --no-cache

echo "Levantando servicios..."
docker compose up -d

echo "Estado final:"
docker compose ps
