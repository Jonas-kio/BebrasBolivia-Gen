import express, { type ErrorRequestHandler, Router } from 'express';
import request from 'supertest';

import { crearUsuarioControlador } from '../../src/controladores/usuario-controlador';
import { verificarRol } from '../../src/middlewares/autorizar';
import { crearResolverIdentidad } from '../../src/middlewares/resolver-identidad';
import { RolServicio } from '../../src/servicios/rol-servicio';
import { ErrorNegocio } from '../../src/utilidades/errores';

/*
 * Prueba de integracion HTTP para los endpoints REQ-08:
 *   GET  /api/v1/usuarios/:id/rol
 *   PATCH /api/v1/usuarios/:id/rol
 *
 * Siguiendo el patron de autorizacion.test.ts: se crea una mini-app
 * de prueba con los middlewares reales (resolverIdentidad, verificarRol)
 * pero con repositorios mockeados.
 */

// ─── Datos de prueba ──────────────────────────────────────────────────────────

const correoAdminPrincipal = 'admin.principal@bebras.org';

const usuarioBD = {
    id: 'uuid-admin-001',
    correo: 'admin@bebras.org',
    rol: 'administrador' as const,
    esta_activo: true,
    coordinadores_institucion: [],
    profesores: null,
};

const usuarioObjetivo = {
    id: 'uuid-target-001',
    correo: 'target@bebras.org',
    rol: 'estudiante' as const,
};

// ─── Fabrica de app de prueba ─────────────────────────────────────────────────

const crearAppDePrueba = (
    usuarioAutenticado: unknown,
    mockRolServicio: Partial<RolServicio>,
) => {
    // Resolver de identidad con BD mockeada
    const findUnique = jest.fn().mockResolvedValue(usuarioAutenticado);
    const resolver = crearResolverIdentidad({ usuarios: { findUnique } } as never);

    const controlador = crearUsuarioControlador(
        {} as never,
        mockRolServicio as never,
    );

    const router = Router();

    router.get('/:id/rol', resolver, verificarRol('administrador'), (req, res, next) => {
        void controlador.obtenerRolUsuario(req, res, next);
    });

    router.patch('/:id/rol', resolver, verificarRol('administrador'), (req, res, next) => {
        void controlador.modificarRolUsuario(req, res, next);
    });

    const manejadorErrores: ErrorRequestHandler = (err: ErrorNegocio, _req, res, _next) => {
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

describe('Integracion - Endpoints REQ-08: Modificar Roles', () => {
    beforeAll(() => {
        process.env['ROOT_ADMIN_EMAIL'] = correoAdminPrincipal;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // ── GET /api/v1/usuarios/:id/rol ──────────────────────────────────────────

    describe('GET /api/v1/usuarios/:id/rol', () => {
        it('debe responder 401 si no se envia el header x-usuario-id', async () => {
            // Arrange
            const app = crearAppDePrueba(null, {});

            // Act
            const respuesta = await request(app).get('/api/v1/usuarios/uuid-target-001/rol');

            // Assert
            expect(respuesta.status).toBe(401);
        });

        it('debe responder 403 si el usuario autenticado no es administrador', async () => {
            // Arrange
            const coordinador = { ...usuarioBD, id: 'uuid-coord-001', rol: 'coordinador' as const };
            const app = crearAppDePrueba(coordinador, {});

            // Act
            const respuesta = await request(app)
                .get('/api/v1/usuarios/uuid-target-001/rol')
                .set('x-usuario-id', coordinador.id);

            // Assert
            expect(respuesta.status).toBe(403);
        });

        it('debe responder 200 con el rol cuando el usuario autenticado es administrador', async () => {
            // Arrange
            const rolEsperado = { id: usuarioObjetivo.id, correo: usuarioObjetivo.correo, rol: 'estudiante' };
            const mockRolServicio = {
                obtenerRolUsuario: jest.fn().mockResolvedValue(rolEsperado),
            };
            const app = crearAppDePrueba(usuarioBD, mockRolServicio);

            // Act
            const respuesta = await request(app)
                .get(`/api/v1/usuarios/${usuarioObjetivo.id}/rol`)
                .set('x-usuario-id', usuarioBD.id);

            // Assert
            expect(respuesta.status).toBe(200);
            expect(respuesta.body).toHaveProperty('data');
            expect(respuesta.body.data.rol).toBe('estudiante');
        });

        it('debe responder 404 cuando el usuario objetivo no existe', async () => {
            // Arrange
            const mockRolServicio = {
                obtenerRolUsuario: jest
                    .fn()
                    .mockRejectedValue(new ErrorNegocio('Usuario no encontrado', 404)),
            };
            const app = crearAppDePrueba(usuarioBD, mockRolServicio);

            // Act
            const respuesta = await request(app)
                .get('/api/v1/usuarios/uuid-inexistente/rol')
                .set('x-usuario-id', usuarioBD.id);

            // Assert
            expect(respuesta.status).toBe(404);
        });
    });

    // ── PATCH /api/v1/usuarios/:id/rol ───────────────────────────────────────

    describe('PATCH /api/v1/usuarios/:id/rol', () => {
        it('debe responder 401 si no se envia el header x-usuario-id', async () => {
            // Arrange
            const app = crearAppDePrueba(null, {});

            // Act
            const respuesta = await request(app)
                .patch('/api/v1/usuarios/uuid-target-001/rol')
                .send({ nuevoRol: 'coordinador' });

            // Assert
            expect(respuesta.status).toBe(401);
        });

        it('debe responder 403 si el usuario autenticado no es administrador', async () => {
            // Arrange
            const profesor = { ...usuarioBD, id: 'uuid-prof-001', rol: 'profesor' as const };
            const app = crearAppDePrueba(profesor, {});

            // Act
            const respuesta = await request(app)
                .patch('/api/v1/usuarios/uuid-target-001/rol')
                .set('x-usuario-id', profesor.id)
                .send({ nuevoRol: 'coordinador' });

            // Assert
            expect(respuesta.status).toBe(403);
        });

        it('debe responder 200 y confirmar la actualizacion cuando el cambio es exitoso', async () => {
            // Arrange
            const usuarioActualizado = {
                id: usuarioObjetivo.id,
                correo: usuarioObjetivo.correo,
                rol: 'coordinador',
            };
            const mockRolServicio = {
                modificarRolConValidaciones: jest.fn().mockResolvedValue(usuarioActualizado),
            };
            const app = crearAppDePrueba(usuarioBD, mockRolServicio);

            // Act
            const respuesta = await request(app)
                .patch(`/api/v1/usuarios/${usuarioObjetivo.id}/rol`)
                .set('x-usuario-id', usuarioBD.id)
                .send({ nuevoRol: 'coordinador' });

            // Assert
            expect(respuesta.status).toBe(200);
            expect(respuesta.body.mensaje).toBe('Rol actualizado correctamente');
            expect(respuesta.body.data.rol).toBe('coordinador');
        });

        it('debe responder 403 si se intenta cambiar el rol del administrador principal', async () => {
            // Arrange
            const mockRolServicio = {
                modificarRolConValidaciones: jest
                    .fn()
                    .mockRejectedValue(
                        new ErrorNegocio('No se puede modificar el rol del administrador principal', 403),
                    ),
            };
            const app = crearAppDePrueba(usuarioBD, mockRolServicio);

            // Act
            const respuesta = await request(app)
                .patch('/api/v1/usuarios/uuid-root/rol')
                .set('x-usuario-id', usuarioBD.id)
                .send({ nuevoRol: 'coordinador' });

            // Assert
            expect(respuesta.status).toBe(403);
            expect(respuesta.body.error).toBe(
                'No se puede modificar el rol del administrador principal',
            );
        });

        it('debe responder 400 si se intenta quitar el rol al ultimo administrador', async () => {
            // Arrange
            const mockRolServicio = {
                modificarRolConValidaciones: jest
                    .fn()
                    .mockRejectedValue(
                        new ErrorNegocio(
                            'No se puede quitar el rol al último administrador del sistema',
                            400,
                        ),
                    ),
            };
            const app = crearAppDePrueba(usuarioBD, mockRolServicio);

            // Act
            const respuesta = await request(app)
                .patch('/api/v1/usuarios/uuid-admin-001/rol')
                .set('x-usuario-id', usuarioBD.id)
                .send({ nuevoRol: 'coordinador' });

            // Assert
            expect(respuesta.status).toBe(400);
            expect(respuesta.body.error).toContain('último administrador');
        });

        it('debe responder 404 si el usuario objetivo no existe', async () => {
            // Arrange
            const mockRolServicio = {
                modificarRolConValidaciones: jest
                    .fn()
                    .mockRejectedValue(new ErrorNegocio('Usuario no encontrado', 404)),
            };
            const app = crearAppDePrueba(usuarioBD, mockRolServicio);

            // Act
            const respuesta = await request(app)
                .patch('/api/v1/usuarios/uuid-inexistente/rol')
                .set('x-usuario-id', usuarioBD.id)
                .send({ nuevoRol: 'coordinador' });

            // Assert
            expect(respuesta.status).toBe(404);
        });
    });
});
