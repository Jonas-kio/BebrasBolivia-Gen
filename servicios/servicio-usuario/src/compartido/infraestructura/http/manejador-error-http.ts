import type { ErrorRequestHandler, RequestHandler } from 'express';

import { crearErrorNoEncontrado } from './error-aplicacion';

interface ErrorHttp extends Error {
  status?: number;
  statusCode?: number;
  codigo?: string;
}

function obtenerEstadoHttp(error: ErrorHttp): number {
  return error.status ?? error.statusCode ?? 500;
}

function obtenerMensajeSeguro(error: ErrorHttp, estado: number): string {
  if (estado === 500) {
    return 'Error interno del servidor';
  }

  return error.message || 'Ocurrió un error inesperado';
}

function obtenerCodigoError(error: ErrorHttp, estado: number): string {
  if (error.codigo) {
    return error.codigo;
  }

  if (estado === 401) {
    return 'NO_AUTORIZADO';
  }

  if (estado === 403) {
    return 'ACCESO_DENEGADO';
  }

  if (estado === 404) {
    return 'RUTA_NO_ENCONTRADA';
  }

  return 'ERROR_INTERNO';
}

export const manejadorRutaNoEncontrada: RequestHandler = (req, _res, next): void => {
  next(crearErrorNoEncontrado(`Ruta no encontrada: ${req.originalUrl}`));
};

export const manejadorErrorHttp: ErrorRequestHandler = (
  error: ErrorHttp,
  _req,
  res,
  _next,
): void => {
  const estado = obtenerEstadoHttp(error);
  const mensaje = obtenerMensajeSeguro(error, estado);
  const codigo = obtenerCodigoError(error, estado);

  if (estado >= 500) {
    console.error('Error interno:', error);
  }

  res.status(estado).json({
    error: mensaje,
    status: estado,
    codigo,
  });
};