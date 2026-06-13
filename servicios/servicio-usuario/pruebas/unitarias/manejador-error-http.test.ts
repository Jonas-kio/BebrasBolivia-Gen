import express from 'express';
import request from 'supertest';

import {
  crearErrorAccesoDenegado,
  crearErrorNoAutorizado,
} from '../../src/compartido/infraestructura/http/error-aplicacion';
import {
  manejadorErrorHttp,
  manejadorRutaNoEncontrada,
} from '../../src/compartido/infraestructura/http/manejador-error-http';

describe('REQ-009 - Manejo de errores de acceso', () => {
  const app = express();

  app.get('/sin-sesion', (_req, _res, next) => {
    next(crearErrorNoAutorizado());
  });

  app.get('/sin-permiso', (_req, _res, next) => {
    next(crearErrorAccesoDenegado());
  });

  app.get('/error-interno', (_req, _res, next) => {
    next(new Error('Error sensible de base de datos'));
  });

  app.use(manejadorRutaNoEncontrada);
  app.use(manejadorErrorHttp);

  it('debería retornar 401 cuando el usuario no está autenticado', async () => {
    const res = await request(app).get('/sin-sesion').expect(401);

    expect(res.body).toEqual({
      error: 'Debes iniciar sesión para acceder a este recurso.',
      status: 401,
      codigo: 'NO_AUTORIZADO',
    });
  });

  it('debería retornar 403 cuando el usuario no tiene permisos', async () => {
    const res = await request(app).get('/sin-permiso').expect(403);

    expect(res.body).toEqual({
      error: 'No tienes permisos para realizar esta acción.',
      status: 403,
      codigo: 'ACCESO_DENEGADO',
    });
  });

  it('debería retornar 404 cuando la ruta no existe', async () => {
    const res = await request(app).get('/ruta-inexistente').expect(404);

    expect(res.body).toEqual({
      error: 'Ruta no encontrada: /ruta-inexistente',
      status: 404,
      codigo: 'RUTA_NO_ENCONTRADA',
    });
  });

  it('debería ocultar detalles internos cuando ocurre un error 500', async () => {
    const res = await request(app).get('/error-interno').expect(500);

    expect(res.body).toEqual({
      error: 'Error interno del servidor',
      status: 500,
      codigo: 'ERROR_INTERNO',
    });
  });
});