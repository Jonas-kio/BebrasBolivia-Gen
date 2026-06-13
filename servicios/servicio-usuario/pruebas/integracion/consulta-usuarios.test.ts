import express, { type ErrorRequestHandler, Router } from 'express';
import request from 'supertest';

import { crearUsuarioControlador } from '../../src/controladores/usuario-controlador';
import { ErrorNegocio } from '../../src/utilidades/errores';

/*
 * Prueba de integración para el endpoint REQ-010:
 *   GET /api/v1/usuarios
 *
 * Verifica que el controlador use correctamente la utilidad de validación
 * y el servicio para listar usuarios con paginación y filtros.
 */

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const mockUsuarios = [
  {
    id: '1',
    correo: 'user1@test.com',
    nombres: 'User',
    apellidos: 'One',
    rol: 'administrador',
    nombre_usuario: 'user1',
    telefono: '123',
    esta_activo: true,
    esta_verificado: true,
    creado_en: new Date(),
  },
  {
    id: '2',
    correo: 'user2@test.com',
    nombres: 'User',
    apellidos: 'Two',
    rol: 'estudiante',
    nombre_usuario: 'user2',
    telefono: '456',
    esta_activo: false,
    esta_verificado: false,
    creado_en: new Date(),
  },
];

// ─── Fábrica de app de prueba ─────────────────────────────────────────────────

const crearAppDePrueba = (mockUsuarioServicio: any) => {
  const controlador = crearUsuarioControlador(mockUsuarioServicio);
  const router = Router();

  router.get('/', (req, res, next) => {
    void controlador.listar(req, res, next);
  });

  const manejadorErrores: ErrorRequestHandler = (err: any, _req, res, _next) => {
    const estado = err instanceof ErrorNegocio ? err.codigo : 500;
    res.status(estado).json({ error: err.message, status: estado });
  };

  const app = express();
  app.use(express.json());
  app.use('/api/v1/usuarios', router);
  app.use(manejadorErrores);

  return app;
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Integración - Endpoint REQ-010: Listar Usuarios', () => {
  const mockServicio = {
    listar: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe responder con parámetros por defecto cuando no se envían queries', async () => {
    // Arrange
    const paginacionEsperada = { page: 1, limit: 10, total: 2, totalPages: 1 };
    mockServicio.listar.mockResolvedValue({
      usuarios: mockUsuarios,
      paginacion: paginacionEsperada,
    });
    const app = crearAppDePrueba(mockServicio);

    // Act
    const respuesta = await request(app).get('/api/v1/usuarios');

    // Assert
    expect(respuesta.status).toBe(200);
    expect(respuesta.body.data).toHaveLength(2);
    expect(respuesta.body.paginacion).toEqual(paginacionEsperada);
    expect(mockServicio.listar).toHaveBeenCalledWith(expect.objectContaining({
      page: 1,
      limit: 10
    }));
  });

  it('debe manejar correctamente page y limit válidos', async () => {
    // Arrange
    mockServicio.listar.mockResolvedValue({
      usuarios: [mockUsuarios[0]],
      paginacion: { page: 2, limit: 1, total: 2, totalPages: 2 },
    });
    const app = crearAppDePrueba(mockServicio);

    // Act
    const respuesta = await request(app).get('/api/v1/usuarios?page=2&limit=1');

    // Assert
    expect(respuesta.status).toBe(200);
    expect(mockServicio.listar).toHaveBeenCalledWith(expect.objectContaining({
      page: 2,
      limit: 1
    }));
  });

  it('debe responder 400 cuando page es inválido (0 o negativo)', async () => {
    // Arrange
    const app = crearAppDePrueba(mockServicio);

    // Act & Assert
    const res0 = await request(app).get('/api/v1/usuarios?page=0');
    expect(res0.status).toBe(400);
    expect(res0.body.error).toContain('page debe ser un número entero mayor o igual a 1');

    const resNeg = await request(app).get('/api/v1/usuarios?page=-5');
    expect(resNeg.status).toBe(400);
  });

  it('debe responder 400 cuando limit es inválido (0 o negativo)', async () => {
    // Arrange
    const app = crearAppDePrueba(mockServicio);

    // Act & Assert
    const res0 = await request(app).get('/api/v1/usuarios?limit=0');
    expect(res0.status).toBe(400);
    expect(res0.body.error).toContain('limit debe ser un número entero positivo');
  });

  it('debe ajustar el límite al máximo (50) si se excede', async () => {
    // Arrange
    mockServicio.listar.mockResolvedValue({ usuarios: [], paginacion: {} });
    const app = crearAppDePrueba(mockServicio);

    // Act
    await request(app).get('/api/v1/usuarios?limit=100');

    // Assert
    expect(mockServicio.listar).toHaveBeenCalledWith(expect.objectContaining({
      limit: 50
    }));
  });

  it('debe filtrar correctamente por rol y estado', async () => {
    // Arrange
    mockServicio.listar.mockResolvedValue({ usuarios: [], paginacion: {} });
    const app = crearAppDePrueba(mockServicio);

    // Act
    await request(app).get('/api/v1/usuarios?rol=administrador&estaActivo=true');

    // Assert
    expect(mockServicio.listar).toHaveBeenCalledWith(expect.objectContaining({
      rol: 'administrador',
      estaActivo: true
    }));
  });

  it('debe manejar correctamente la búsqueda y ordenamiento', async () => {
    // Arrange
    mockServicio.listar.mockResolvedValue({ usuarios: [], paginacion: {} });
    const app = crearAppDePrueba(mockServicio);

    // Act
    await request(app).get('/api/v1/usuarios?search=juan&orderBy=correo&orderDir=asc');

    // Assert
    expect(mockServicio.listar).toHaveBeenCalledWith(expect.objectContaining({
      search: 'juan',
      orderBy: 'correo',
      orderDir: 'asc'
    }));
  });

  it('debe responder 400 si orderDir es inválido', async () => {
    // Arrange
    const app = crearAppDePrueba(mockServicio);

    // Act
    const respuesta = await request(app).get('/api/v1/usuarios?orderDir=invalido');

    // Assert
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toContain('orderDir debe ser "asc" o "desc"');
  });
});
