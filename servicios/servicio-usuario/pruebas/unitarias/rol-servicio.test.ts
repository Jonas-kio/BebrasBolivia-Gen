import { rol_usuario } from '@prisma/client';

import { RolServicio } from '../../src/servicios/rol-servicio';
import { ErrorNegocio } from '../../src/utilidades/errores';

/*
 * REQ-08: Modificar Roles
 *   Task 1. Mostrar rol actual del usuario
 *   Task 2. Permitir el cambio de rol
 *   Task 3. Validar reglas (no quitar admin principal)
 *   Task 4. Guardar cambios
 *   Task 5. Confirmar actualización
 */

// ─── Mock del repositorio ─────────────────────────────────────────────────────

const mockRolRepositorio = {
  obtenerUsuariosPorRol: jest.fn(),
  actualizarRolUsuario: jest.fn(),
  verificarUsuarioExiste: jest.fn(),
  obtenerUsuarioConRol: jest.fn(),
  contarAdministradores: jest.fn(),
  cambiarRolConExtensiones: jest.fn(),
};

const servicio = new RolServicio(mockRolRepositorio as never);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const correoAdminPrincipal = 'admin.principal@bebras.org';

const usuarioEstudiante = {
  id: 'uuid-est-001',
  correo: 'estudiante@bebras.org',
  rol: rol_usuario.estudiante,
};

const usuarioCoordinador = {
  id: 'uuid-coord-001',
  correo: 'coordinador@bebras.org',
  rol: rol_usuario.coordinador,
};

const usuarioAdministrador = {
  id: 'uuid-admin-001',
  correo: 'otro.admin@bebras.org',
  rol: rol_usuario.administrador,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('RolServicio - REQ-08: Modificar Roles', () => {
  beforeAll(() => {
    process.env['ROOT_ADMIN_EMAIL'] = correoAdminPrincipal;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Task 1: Mostrar rol actual ─────────────────────────────────────────────

  describe('obtenerRolUsuario — Task 1: Mostrar rol actual del usuario', () => {
    it('debe devolver el id, correo y rol del usuario cuando existe', async () => {
      // Arrange
      mockRolRepositorio.obtenerUsuarioConRol.mockResolvedValue(usuarioEstudiante);

      // Act
      const resultado = await servicio.obtenerRolUsuario(usuarioEstudiante.id);

      // Assert
      expect(mockRolRepositorio.obtenerUsuarioConRol).toHaveBeenCalledWith(usuarioEstudiante.id);
      expect(resultado).toEqual(usuarioEstudiante);
    });

    it('debe lanzar ErrorNegocio 404 cuando el usuario no existe', async () => {
      // Arrange
      mockRolRepositorio.obtenerUsuarioConRol.mockResolvedValue(null);

      // Act & Assert
      await expect(servicio.obtenerRolUsuario('uuid-inexistente')).rejects.toThrow(
        new ErrorNegocio('Usuario no encontrado', 404),
      );
    });
  });

  // ── Tasks 2 y 4: Permitir cambio y guardar ────────────────────────────────

  describe('modificarRolConValidaciones — Tasks 2 y 4: Permitir cambio y guardar', () => {
    it('debe cambiar el rol cuando los datos son validos y el rol cambia', async () => {
      // Arrange
      mockRolRepositorio.obtenerUsuarioConRol.mockResolvedValue(usuarioEstudiante);
      const usuarioActualizado = { ...usuarioEstudiante, rol: rol_usuario.coordinador };
      mockRolRepositorio.cambiarRolConExtensiones.mockResolvedValue(usuarioActualizado);

      // Act
      const resultado = await servicio.modificarRolConValidaciones(usuarioEstudiante.id, {
        nuevoRol: rol_usuario.coordinador,
      });

      // Assert
      expect(mockRolRepositorio.cambiarRolConExtensiones).toHaveBeenCalledWith(
        usuarioEstudiante.id,
        rol_usuario.estudiante,
        rol_usuario.coordinador,
        {},
      );
      expect(resultado.rol).toBe(rol_usuario.coordinador);
    });

    it('debe retornar el usuario sin modificar cuando el rol ya es el mismo (idempotente)', async () => {
      // Arrange
      mockRolRepositorio.obtenerUsuarioConRol.mockResolvedValue(usuarioCoordinador);

      // Act
      const resultado = await servicio.modificarRolConValidaciones(usuarioCoordinador.id, {
        nuevoRol: rol_usuario.coordinador,
      });

      // Assert
      expect(mockRolRepositorio.cambiarRolConExtensiones).not.toHaveBeenCalled();
      expect(resultado).toEqual(usuarioCoordinador);
    });

    it('debe pasar los datosAdicionales al repositorio cuando se cambia a estudiante', async () => {
      // Arrange
      mockRolRepositorio.obtenerUsuarioConRol.mockResolvedValue(usuarioCoordinador);
      mockRolRepositorio.cambiarRolConExtensiones.mockResolvedValue({
        ...usuarioCoordinador,
        rol: rol_usuario.estudiante,
      });

      const datosAdicionales = { grupoId: 'grupo-001', codigo: 'EST-001', institucionId: 'inst-001' };

      // Act
      await servicio.modificarRolConValidaciones(usuarioCoordinador.id, {
        nuevoRol: rol_usuario.estudiante,
        datosAdicionales,
      });

      // Assert
      expect(mockRolRepositorio.cambiarRolConExtensiones).toHaveBeenCalledWith(
        usuarioCoordinador.id,
        rol_usuario.coordinador,
        rol_usuario.estudiante,
        datosAdicionales,
      );
    });

    it('debe lanzar ErrorNegocio 400 cuando el rol recibido no existe en el enum', async () => {
      // Arrange
      mockRolRepositorio.obtenerUsuarioConRol.mockResolvedValue(usuarioEstudiante);

      // Act & Assert
      await expect(
        servicio.modificarRolConValidaciones(usuarioEstudiante.id, {
          nuevoRol: 'superadmin' as rol_usuario,
        }),
      ).rejects.toThrow(ErrorNegocio);
    });

    it('debe lanzar ErrorNegocio 404 cuando el usuario no existe', async () => {
      // Arrange
      mockRolRepositorio.obtenerUsuarioConRol.mockResolvedValue(null);

      // Act & Assert
      await expect(
        servicio.modificarRolConValidaciones('uuid-inexistente', {
          nuevoRol: rol_usuario.coordinador,
        }),
      ).rejects.toThrow(new ErrorNegocio('Usuario no encontrado', 404));
    });
  });

  // ── Task 3: Validar reglas ────────────────────────────────────────────────

  describe('modificarRolConValidaciones — Task 3: Validar reglas de negocio', () => {
    it('debe lanzar ErrorNegocio 403 al intentar cambiar el rol del administrador principal', async () => {
      // Arrange
      const adminPrincipal = {
        id: 'uuid-root',
        correo: correoAdminPrincipal,
        rol: rol_usuario.administrador,
      };
      mockRolRepositorio.obtenerUsuarioConRol.mockResolvedValue(adminPrincipal);

      // Act & Assert
      await expect(
        servicio.modificarRolConValidaciones(adminPrincipal.id, {
          nuevoRol: rol_usuario.coordinador,
        }),
      ).rejects.toThrow(
        new ErrorNegocio('No se puede modificar el rol del administrador principal', 403),
      );
      expect(mockRolRepositorio.cambiarRolConExtensiones).not.toHaveBeenCalled();
    });

    it('debe lanzar ErrorNegocio 400 al intentar quitar el rol al ultimo administrador', async () => {
      // Arrange
      mockRolRepositorio.obtenerUsuarioConRol.mockResolvedValue(usuarioAdministrador);
      mockRolRepositorio.contarAdministradores.mockResolvedValue(1);

      // Act & Assert
      await expect(
        servicio.modificarRolConValidaciones(usuarioAdministrador.id, {
          nuevoRol: rol_usuario.coordinador,
        }),
      ).rejects.toThrow(
        new ErrorNegocio('No se puede quitar el rol al último administrador del sistema', 400),
      );
      expect(mockRolRepositorio.cambiarRolConExtensiones).not.toHaveBeenCalled();
    });

    it('debe permitir cambiar el rol de un admin si hay mas de uno en el sistema', async () => {
      // Arrange
      mockRolRepositorio.obtenerUsuarioConRol.mockResolvedValue(usuarioAdministrador);
      mockRolRepositorio.contarAdministradores.mockResolvedValue(2);
      mockRolRepositorio.cambiarRolConExtensiones.mockResolvedValue({
        ...usuarioAdministrador,
        rol: rol_usuario.coordinador,
      });

      // Act
      const resultado = await servicio.modificarRolConValidaciones(usuarioAdministrador.id, {
        nuevoRol: rol_usuario.coordinador,
      });

      // Assert
      expect(resultado.rol).toBe(rol_usuario.coordinador);
      expect(mockRolRepositorio.cambiarRolConExtensiones).toHaveBeenCalled();
    });
  });

  // ── Métodos existentes: listarRolesDisponibles ────────────────────────────

  describe('listarRolesDisponibles', () => {
    it('debe retornar todos los valores del enum rol_usuario', () => {
      const roles = servicio.listarRolesDisponibles();
      expect(roles).toEqual(Object.values(rol_usuario));
    });
  });

  // ── Métodos existentes: obtenerUsuariosDeRol ─────────────────────────────

  describe('obtenerUsuariosDeRol', () => {
    it('debe lanzar ErrorNegocio 400 si el rol no es valido', async () => {
      await expect(servicio.obtenerUsuariosDeRol('fantasma')).rejects.toThrow(ErrorNegocio);
    });

    it('debe delegar al repositorio si el rol es valido', async () => {
      // Arrange
      mockRolRepositorio.obtenerUsuariosPorRol.mockResolvedValue([]);

      // Act
      await servicio.obtenerUsuariosDeRol('profesor');

      // Assert
      expect(mockRolRepositorio.obtenerUsuariosPorRol).toHaveBeenCalledWith('profesor');
    });
  });
});
