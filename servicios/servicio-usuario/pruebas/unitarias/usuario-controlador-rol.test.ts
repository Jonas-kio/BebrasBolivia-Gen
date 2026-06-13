import { rol_usuario } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

import { crearUsuarioControlador } from '../../src/controladores/usuario-controlador';
import { ErrorNegocio } from '../../src/utilidades/errores';

/*
 * Pruebas unitarias para los nuevos metodos del UsuarioControlador (REQ-08):
 *   obtenerRolUsuario  — GET /api/v1/usuarios/:id/rol
 *   modificarRolUsuario — PATCH /api/v1/usuarios/:id/rol
 *
 * Task 5: Confirmar actualización (el controlador responde con 200 y el estado actualizado)
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockRolServicio = {
    obtenerRolUsuario: jest.fn(),
    modificarRolConValidaciones: jest.fn(),
};

// El servicio de usuario no es relevante en estas pruebas
const mockUsuarioServicio = {} as never;

const controlador = crearUsuarioControlador(mockUsuarioServicio, mockRolServicio as never);

// ─── Helpers de request/response ─────────────────────────────────────────────

const crearReqRes = (
    params: Record<string, string> = {},
    body: Record<string, unknown> = {},
): { req: Partial<Request>; res: Partial<Response>; next: NextFunction } => ({
    req: { params, body },
    res: {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    },
    next: jest.fn(),
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('UsuarioControlador - REQ-08: Endpoints de rol', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // ── obtenerRolUsuario ──────────────────────────────────────────────────────

    describe('obtenerRolUsuario — GET /api/v1/usuarios/:id/rol', () => {
        it('debe responder 200 con los datos del rol cuando el usuario existe', async () => {
            // Arrange
            const { req, res, next } = crearReqRes({ id: 'uuid-001' });
            const rolEsperado = { id: 'uuid-001', correo: 'usuario@bebras.org', rol: rol_usuario.estudiante };
            mockRolServicio.obtenerRolUsuario.mockResolvedValue(rolEsperado);

            // Act
            await controlador.obtenerRolUsuario(req as Request, res as Response, next);

            // Assert
            expect(mockRolServicio.obtenerRolUsuario).toHaveBeenCalledWith('uuid-001');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ data: rolEsperado });
        });

        it('debe llamar a next con el error cuando el servicio lanza ErrorNegocio 404', async () => {
            // Arrange
            const { req, res, next } = crearReqRes({ id: 'uuid-inexistente' });
            const error = new ErrorNegocio('Usuario no encontrado', 404);
            mockRolServicio.obtenerRolUsuario.mockRejectedValue(error);

            // Act
            await controlador.obtenerRolUsuario(req as Request, res as Response, next);

            // Assert
            expect(next).toHaveBeenCalledWith(error);
            expect(res.status).not.toHaveBeenCalled();
        });
    });

    // ── modificarRolUsuario ────────────────────────────────────────────────────

    describe('modificarRolUsuario — PATCH /api/v1/usuarios/:id/rol', () => {
        it('debe responder 200 y el mensaje de confirmacion cuando el cambio es exitoso', async () => {
            // Arrange
            const { req, res, next } = crearReqRes(
                { id: 'uuid-001' },
                { nuevoRol: rol_usuario.coordinador },
            );
            const usuarioActualizado = { id: 'uuid-001', correo: 'usuario@bebras.org', rol: rol_usuario.coordinador };
            mockRolServicio.modificarRolConValidaciones.mockResolvedValue(usuarioActualizado);

            // Act
            await controlador.modificarRolUsuario(req as Request, res as Response, next);

            // Assert
            expect(mockRolServicio.modificarRolConValidaciones).toHaveBeenCalledWith(
                'uuid-001',
                { nuevoRol: rol_usuario.coordinador, datosAdicionales: undefined },
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                mensaje: 'Rol actualizado correctamente',
                data: usuarioActualizado,
            });
        });

        it('debe responder 200 pasando datosAdicionales cuando estan presentes en el body', async () => {
            // Arrange
            const datosAdicionales = { grupoId: 'grupo-001', institucionId: 'inst-001' };
            const { req, res, next } = crearReqRes(
                { id: 'uuid-001' },
                { nuevoRol: rol_usuario.estudiante, datosAdicionales },
            );
            const usuarioActualizado = { id: 'uuid-001', correo: 'usuario@bebras.org', rol: rol_usuario.estudiante };
            mockRolServicio.modificarRolConValidaciones.mockResolvedValue(usuarioActualizado);

            // Act
            await controlador.modificarRolUsuario(req as Request, res as Response, next);

            // Assert
            expect(mockRolServicio.modificarRolConValidaciones).toHaveBeenCalledWith(
                'uuid-001',
                { nuevoRol: rol_usuario.estudiante, datosAdicionales },
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('debe llamar a next con un error de validacion cuando falta nuevoRol en el body', async () => {
            // Arrange
            const { req, res, next } = crearReqRes({ id: 'uuid-001' }, {});

            // Act
            await controlador.modificarRolUsuario(req as Request, res as Response, next);

            // Assert
            expect(next).toHaveBeenCalled();
            expect(mockRolServicio.modificarRolConValidaciones).not.toHaveBeenCalled();
        });

        it('debe llamar a next con el error cuando el servicio lanza ErrorNegocio 403 (admin principal)', async () => {
            // Arrange
            const { req, res, next } = crearReqRes(
                { id: 'uuid-root' },
                { nuevoRol: rol_usuario.coordinador },
            );
            const error = new ErrorNegocio('No se puede modificar el rol del administrador principal', 403);
            mockRolServicio.modificarRolConValidaciones.mockRejectedValue(error);

            // Act
            await controlador.modificarRolUsuario(req as Request, res as Response, next);

            // Assert
            expect(next).toHaveBeenCalledWith(error);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('debe llamar a next con el error cuando el servicio lanza ErrorNegocio 400 (ultimo admin)', async () => {
            // Arrange
            const { req, res, next } = crearReqRes(
                { id: 'uuid-admin-001' },
                { nuevoRol: rol_usuario.coordinador },
            );
            const error = new ErrorNegocio(
                'No se puede quitar el rol al último administrador del sistema',
                400,
            );
            mockRolServicio.modificarRolConValidaciones.mockRejectedValue(error);

            // Act
            await controlador.modificarRolUsuario(req as Request, res as Response, next);

            // Assert
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
