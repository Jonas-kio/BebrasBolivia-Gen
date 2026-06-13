import type { Request, Response } from 'express';

import { crearResolverIdentidad } from '../../src/middlewares/resolver-identidad';
import { ErrorNoAutenticado } from '../../src/utilidades/errores';

const next = jest.fn();

const crearReq = (id?: string): Partial<Request> => ({
  headers: id ? { 'x-usuario-id': id } : {},
});

const res = {} as Response;

const usuarioActivoMock = {
  id: 'uuid-admin-001',
  rol: 'administrador' as const,
  esta_activo: true,
  coordinadores_institucion: [],
  profesores: null,
};

const crearConexionMock = (resultado: unknown) => ({
  usuarios: {
    findUnique: jest.fn().mockResolvedValue(resultado),
  },
});

describe('resolverIdentidad', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deberia llamar next(ErrorNoAutenticado) si no hay header x-usuario-id', async () => {
    const middleware = crearResolverIdentidad(crearConexionMock(null) as never);

    await middleware(crearReq() as Request, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ErrorNoAutenticado));
  });

  it('deberia llamar next(ErrorNoAutenticado) si el header es solo espacios', async () => {
    const middleware = crearResolverIdentidad(crearConexionMock(null) as never);

    await middleware(crearReq('   ') as Request, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ErrorNoAutenticado));
  });

  it('deberia llamar next(ErrorNoAutenticado) si el usuario no existe en BD', async () => {
    const middleware = crearResolverIdentidad(crearConexionMock(null) as never);

    await middleware(crearReq('uuid-inexistente') as Request, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ErrorNoAutenticado));
  });

  it('deberia llamar next(ErrorNoAutenticado) si el usuario esta inactivo', async () => {
    const inactivo = { ...usuarioActivoMock, esta_activo: false };
    const middleware = crearResolverIdentidad(crearConexionMock(inactivo) as never);

    await middleware(crearReq('uuid-admin-001') as Request, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ErrorNoAutenticado));
  });

  it('deberia poblar req.usuario y llamar next() sin error cuando el usuario es valido', async () => {
    const req = crearReq('uuid-admin-001') as Request;
    const middleware = crearResolverIdentidad(crearConexionMock(usuarioActivoMock) as never);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.usuario).toEqual({
      id: 'uuid-admin-001',
      rol: 'administrador',
      institucionIds: [],
      grupoIds: [],
    });
  });

  it('deberia cargar institucionIds para un coordinador', async () => {
    const coordinador = {
      ...usuarioActivoMock,
      id: 'uuid-coord-001',
      rol: 'coordinador' as const,
      coordinadores_institucion: [
        { institucion_id: 'inst-001' },
        { institucion_id: 'inst-002' },
      ],
    };
    const req = crearReq('uuid-coord-001') as Request;
    const middleware = crearResolverIdentidad(crearConexionMock(coordinador) as never);

    await middleware(req, res, next);

    expect(req.usuario?.institucionIds).toEqual(['inst-001', 'inst-002']);
    expect(req.usuario?.grupoIds).toEqual([]);
  });

  it('deberia cargar grupoIds para un profesor', async () => {
    const profesor = {
      ...usuarioActivoMock,
      id: 'uuid-prof-001',
      rol: 'profesor' as const,
      coordinadores_institucion: [],
      profesores: {
        profesores_grupos: [{ grupo_id: 'grupo-001' }, { grupo_id: 'grupo-002' }],
      },
    };
    const req = crearReq('uuid-prof-001') as Request;
    const middleware = crearResolverIdentidad(crearConexionMock(profesor) as never);

    await middleware(req, res, next);

    expect(req.usuario?.grupoIds).toEqual(['grupo-001', 'grupo-002']);
    expect(req.usuario?.institucionIds).toEqual([]);
  });

  it('deberia propagar errores inesperados de BD a next()', async () => {
    const errorBD = new Error('Conexion perdida');
    const conexion = {
      usuarios: { findUnique: jest.fn().mockRejectedValue(errorBD) },
    };
    const middleware = crearResolverIdentidad(conexion as never);

    await middleware(crearReq('uuid-admin-001') as Request, res, next);

    expect(next).toHaveBeenCalledWith(errorBD);
  });
});
