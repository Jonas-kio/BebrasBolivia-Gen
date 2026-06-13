import express, { type ErrorRequestHandler, Router } from 'express';
import request from 'supertest';

import { crearUsuarioControlador } from '../../src/controladores/usuario-controlador';
import { verificarPermiso, verificarRol } from '../../src/middlewares/autorizar';
import { crearResolverIdentidad } from '../../src/middlewares/resolver-identidad';
import { crearUsuarioServicio } from '../../src/servicios/usuario-servicio';
import { Accion } from '../../src/shared/permisos';
import { ErrorNegocio } from '../../src/utilidades/errores';

const usuarioAdmin = {
  id: 'uuid-admin-001',
  rol: 'administrador' as const,
  esta_activo: true,
  coordinadores_institucion: [],
  profesores: null,
};

const usuarioEstudiante = {
  ...usuarioAdmin,
  id: 'uuid-est-001',
  rol: 'estudiante' as const,
};

const usuarioObjetivo = {
  id: 'uuid-target-001',
  rol: 'estudiante' as const,
  esta_activo: true,
};

const dtoUsuarioValido = {
  correo: 'nuevo@bebras.com',
  nombres: 'Ana',
  apellidos: 'Lopez',
  contrasena: 'claveSegura1',
  rol: 'estudiante',
};

// ─── Fabrica de app de prueba ─────────────────────────────────────────────────

const crearAppDePrueba = (usuarioBD: unknown) => {
  const findUnique = jest.fn().mockResolvedValue(usuarioBD);
  const resolver = crearResolverIdentidad({ usuarios: { findUnique } } as never);

  const servicio = crearUsuarioServicio({
    repositorio: {
      buscarPorCorreo: jest.fn().mockResolvedValue(null),
      buscarPorId: jest
        .fn()
        .mockResolvedValueOnce(usuarioAdmin)
        .mockResolvedValueOnce(usuarioObjetivo),
      crear: jest.fn().mockResolvedValue({
        id: 'nuevo-uuid',
        correo: 'nuevo@bebras.com',
        nombres: 'Ana',
        apellidos: 'Lopez',
        rol: 'estudiante',
        nombre_usuario: null,
        telefono: null,
        esta_activo: true,
        esta_verificado: false,
        creado_en: new Date(),
      }),
      eliminar: jest.fn().mockResolvedValue({ ...usuarioObjetivo, esta_activo: false }),
    } as never,
    hasheador: { hashear: jest.fn().mockResolvedValue('hash-seguro') },
  });

  const controlador = crearUsuarioControlador(servicio);
  const router = Router();

  router.post('/', resolver, verificarPermiso(Accion.CREAR_USUARIO), (req, res, next) => {
    void controlador.crear(req, res, next);
  });

  router.delete('/:id', resolver, verificarRol('administrador'), (req, res, next) => {
    void controlador.eliminar(req, res, next);
  });

  const errorHandler: ErrorRequestHandler = (err: ErrorNegocio, _req, res, _next) => {
    const status = err instanceof ErrorNegocio ? err.codigo : 500;
    res.status(status).json({ error: err.message, status });
  };

  const app = express();
  app.use(express.json());
  app.use('/api/v1/usuarios', router);
  app.use(errorHandler);

  return app;
};

// ─── Tests POST /api/v1/usuarios ─────────────────────────────────────────────

describe('POST /api/v1/usuarios — autorizacion', () => {
  it('deberia responder 401 si no se envia el header x-usuario-id', async () => {
    const app = crearAppDePrueba(null);

    const res = await request(app).post('/api/v1/usuarios').send(dtoUsuarioValido);

    expect(res.status).toBe(401);
  });

  it('deberia responder 401 si el usuario no existe en BD', async () => {
    const app = crearAppDePrueba(null);

    const res = await request(app)
      .post('/api/v1/usuarios')
      .set('x-usuario-id', 'uuid-inexistente')
      .send(dtoUsuarioValido);

    expect(res.status).toBe(401);
  });

  it('deberia responder 401 si el usuario esta inactivo', async () => {
    const app = crearAppDePrueba({ ...usuarioAdmin, esta_activo: false });

    const res = await request(app)
      .post('/api/v1/usuarios')
      .set('x-usuario-id', usuarioAdmin.id)
      .send(dtoUsuarioValido);

    expect(res.status).toBe(401);
  });

  it('deberia responder 403 si el rol es estudiante', async () => {
    const app = crearAppDePrueba(usuarioEstudiante);

    const res = await request(app)
      .post('/api/v1/usuarios')
      .set('x-usuario-id', usuarioEstudiante.id)
      .send(dtoUsuarioValido);

    expect(res.status).toBe(403);
  });

  it('deberia responder 201 si el rol es administrador y los datos son validos', async () => {
    const app = crearAppDePrueba(usuarioAdmin);

    const res = await request(app)
      .post('/api/v1/usuarios')
      .set('x-usuario-id', usuarioAdmin.id)
      .send(dtoUsuarioValido);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).not.toHaveProperty('contrasena_hash');
  });
});

// ─── Tests DELETE /api/v1/usuarios/:id ───────────────────────────────────────

describe('DELETE /api/v1/usuarios/:id — autorizacion', () => {
  it('deberia responder 401 si no se envia el header x-usuario-id', async () => {
    const app = crearAppDePrueba(null);

    const res = await request(app).delete(`/api/v1/usuarios/${usuarioObjetivo.id}`);

    expect(res.status).toBe(401);
  });

  it('deberia responder 403 si el rol es coordinador', async () => {
    const coordinador = { ...usuarioAdmin, id: 'uuid-coord-001', rol: 'coordinador' as const };
    const app = crearAppDePrueba(coordinador);

    const res = await request(app)
      .delete(`/api/v1/usuarios/${usuarioObjetivo.id}`)
      .set('x-usuario-id', coordinador.id);

    expect(res.status).toBe(403);
  });

  it('deberia responder 403 si el rol es profesor', async () => {
    const profesor = { ...usuarioAdmin, id: 'uuid-prof-001', rol: 'profesor' as const };
    const app = crearAppDePrueba(profesor);

    const res = await request(app)
      .delete(`/api/v1/usuarios/${usuarioObjetivo.id}`)
      .set('x-usuario-id', profesor.id);

    expect(res.status).toBe(403);
  });

  it('deberia responder 403 si el rol es estudiante', async () => {
    const app = crearAppDePrueba(usuarioEstudiante);

    const res = await request(app)
      .delete(`/api/v1/usuarios/${usuarioObjetivo.id}`)
      .set('x-usuario-id', usuarioEstudiante.id);

    expect(res.status).toBe(403);
  });

  it('deberia responder 200 si el rol es administrador', async () => {
    const app = crearAppDePrueba(usuarioAdmin);

    const res = await request(app)
      .delete(`/api/v1/usuarios/${usuarioObjetivo.id}`)
      .set('x-usuario-id', usuarioAdmin.id);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('mensaje');
  });
});
