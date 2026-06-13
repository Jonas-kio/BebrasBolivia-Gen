import type { CrearUsuarioDto } from '../../src/dtos/crear-usuario.dto';
import type { ActualizarUsuarioDto } from '../../src/dtos/actualizar-usuario.dto'
import { crearUsuarioServicio, crearPerfilServicio } from '../../src/servicios/usuario-servicio';
import { ErrorNegocio } from '../../src/utilidades/errores';




const dto: CrearUsuarioDto = {
  correo: 'nuevo@bebras.com',
  nombres: 'Carlos',
  apellidos: 'Vargas',
  contrasena: 'claveSegura1',
  rol: 'profesor',
};

describe('UsuarioServicio', () => {
  describe('crear', () => {
    it('deberia crear el usuario cuando el correo no esta registrado', async () => {
      const buscarPorCorreo = jest.fn().mockResolvedValue(null);
      const crear = jest.fn().mockResolvedValue({ id: 'u1', correo: dto.correo });
      const hashear = jest.fn().mockResolvedValue('hash-fake');
      const servicio = crearUsuarioServicio({
        repositorio: { buscarPorCorreo, crear } as never,
        hasheador: { hashear },
      });

      const resultado = await servicio.crear(dto);

      expect(buscarPorCorreo).toHaveBeenCalledWith(dto.correo);
      expect(hashear).toHaveBeenCalledWith(dto.contrasena);
      expect(crear).toHaveBeenCalledWith(
        expect.objectContaining({ correo: dto.correo, contrasena_hash: 'hash-fake' }),
      );
      expect(resultado).toEqual({ id: 'u1', correo: dto.correo });
    });

    it('deberia lanzar ErrorNegocio cuando el correo ya esta registrado', async () => {
      const buscarPorCorreo = jest.fn().mockResolvedValue({ id: 'existente' });
      const crear = jest.fn();
      const servicio = crearUsuarioServicio({
        repositorio: { buscarPorCorreo, crear } as never,
        hasheador: { hashear: jest.fn() },
      });

      await expect(servicio.crear(dto)).rejects.toThrow(ErrorNegocio);
      expect(crear).not.toHaveBeenCalled();
    });

    it('deberia asegurarse que la contrasena se guarde encriptada y no en texto plano', async () => {
      const buscarPorCorreo = jest.fn().mockResolvedValue(null);
      const crear = jest.fn().mockResolvedValue({ id: 'u2', correo: dto.correo });
      const hashSimulado = 'hash-completamente-seguro-123';
      const hashear = jest.fn().mockResolvedValue(hashSimulado);

      const servicio = crearUsuarioServicio({
        repositorio: { buscarPorCorreo, crear } as never,
        hasheador: { hashear },
      });

      await servicio.crear(dto);

      expect(crear).toHaveBeenCalledWith(
        expect.objectContaining({
          contrasena_hash: hashSimulado,
        }),
      );
      expect(crear).not.toHaveBeenCalledWith(
        expect.objectContaining({
          contrasena_hash: dto.contrasena,
        }),
      );
    });

    it('deberia propagar el error y cancelar la creacion si el servicio de hasheo falla', async () => {
      const buscarPorCorreo = jest.fn().mockResolvedValue(null);
      const crear = jest.fn();
      const errorBcrypt = new Error('Fallo interno al encriptar la contrasena');
      const hashear = jest.fn().mockRejectedValue(errorBcrypt);

      const servicio = crearUsuarioServicio({
        repositorio: { buscarPorCorreo, crear } as never,
        hasheador: { hashear },
      });

      await expect(servicio.crear(dto)).rejects.toThrow('Fallo interno al encriptar la contrasena');
      
      expect(crear).not.toHaveBeenCalled();
    });
  });

  describe('eliminarUsuario', () => {
    const adminMock = {
      id: 'uuid-admin-123',
      rol: 'administrador' as const,
      esta_activo: true,
    };

    const usuarioObjetivoMock = {
      id: 'uuid-usuario-456',
      rol: 'estudiante' as const,
      esta_activo: true,
    };

    it('deberia eliminar logicamente un usuario cuando el solicitante es administrador', async () => {
      const buscarPorId = jest
        .fn()
        .mockResolvedValueOnce(adminMock)
        .mockResolvedValueOnce(usuarioObjetivoMock);
      const eliminar = jest.fn().mockResolvedValue({ ...usuarioObjetivoMock, esta_activo: false });
      const servicio = crearUsuarioServicio({
        repositorio: { buscarPorId, eliminar } as never,
        hasheador: { hashear: jest.fn() },
      });

      const resultado = await servicio.eliminarUsuario(usuarioObjetivoMock.id, adminMock.id);

      expect(resultado.esta_activo).toBe(false);
      expect(eliminar).toHaveBeenCalledWith(usuarioObjetivoMock.id);
    });

    it('deberia lanzar ErrorNegocio 403 cuando el solicitante no es administrador', async () => {
      const buscarPorId = jest.fn().mockResolvedValue({ ...adminMock, rol: 'profesor' });
      const servicio = crearUsuarioServicio({
        repositorio: { buscarPorId } as never,
        hasheador: { hashear: jest.fn() },
      });

      await expect(servicio.eliminarUsuario(usuarioObjetivoMock.id, adminMock.id)).rejects.toThrow(
        new ErrorNegocio('No tiene permisos para eliminar usuarios', 403),
      );
    });

    it('deberia lanzar ErrorNegocio 404 cuando el usuario a eliminar no existe', async () => {
      const buscarPorId = jest.fn().mockResolvedValueOnce(adminMock).mockResolvedValueOnce(null);
      const servicio = crearUsuarioServicio({
        repositorio: { buscarPorId } as never,
        hasheador: { hashear: jest.fn() },
      });

      await expect(servicio.eliminarUsuario('uuid-inexistente', adminMock.id)).rejects.toThrow(
        new ErrorNegocio('Usuario no encontrado', 404),
      );
    });

    it('deberia lanzar ErrorNegocio 400 cuando el usuario ya estaba eliminado', async () => {
      const usuarioYaEliminado = { ...usuarioObjetivoMock, esta_activo: false };
      const buscarPorId = jest
        .fn()
        .mockResolvedValueOnce(adminMock)
        .mockResolvedValueOnce(usuarioYaEliminado);
      const servicio = crearUsuarioServicio({
        repositorio: { buscarPorId } as never,
        hasheador: { hashear: jest.fn() },
      });

      await expect(servicio.eliminarUsuario(usuarioObjetivoMock.id, adminMock.id)).rejects.toThrow(
        new ErrorNegocio('El usuario ya fue eliminado', 400),
      );
    });
  });

  describe('listar', () => {
    it('deberia llamar al repositorio con los parametros recibidos y retornar la paginacion calculada', async () => {
      const mockUsuarios = [{ id: '1' }, { id: '2' }];
      const listar = jest.fn().mockResolvedValue({ usuarios: mockUsuarios, total: 2 });
      const servicio = crearUsuarioServicio({
        repositorio: { listar } as never,
      });

      const query = { page: 1, limit: 10, rol: 'estudiante' };
      const resultado = await servicio.listar(query);

      expect(listar).toHaveBeenCalledWith(query);
      expect(resultado.usuarios).toEqual(mockUsuarios);
      expect(resultado.paginacion).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('deberia usar valores por defecto para page y limit si no se proporcionan', async () => {
      const listar = jest.fn().mockResolvedValue({ usuarios: [], total: 0 });
      const servicio = crearUsuarioServicio({
        repositorio: { listar } as never,
      });

      await servicio.listar({});

      expect(listar).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 10,
        }),
      );
    });

    it('deberia calcular correctamente totalPages cuando el total no es multiplo de limit', async () => {
      const listar = jest.fn().mockResolvedValue({ usuarios: [], total: 25 });
      const servicio = crearUsuarioServicio({
        repositorio: { listar } as never,
      });

      const resultado = await servicio.listar({ page: 1, limit: 10 });

      expect(resultado.paginacion.totalPages).toBe(3); // 25 / 10 = 2.5 -> 3
    });
  });
});

// ─── Tests para PerfilServicio (obtener + actualizar / PATCH) ───────────

describe('PerfilServicio', () => {
  const adminMock = {
    id: 'uuid-admin-123',
    rol: 'administrador' as const,
    esta_activo: true,
    correo: 'admin@bebras.com',
    nombres: 'Admin',
    apellidos: 'Principal',
  };

  const usuarioMock = {
    id: 'uuid-usuario-456',
    correo: 'usuario@bebras.com',
    nombres: 'Juan',
    apellidos: 'Perez',
    rol: 'estudiante' as const,
    telefono: null,
    esta_activo: true,
  };

  describe('obtener', () => {
    it('deberia retornar el usuario cuando existe', async () => {
      const buscarPorId = jest.fn().mockResolvedValue(usuarioMock);
      const servicio = crearPerfilServicio({
        repositorio: { buscarPorId } as never,
      });

      const resultado = await servicio.obtener(usuarioMock.id);

      expect(buscarPorId).toHaveBeenCalledWith(usuarioMock.id);
      expect(resultado).toEqual(usuarioMock);
    });

    it('deberia lanzar ErrorNegocio 404 cuando el usuario no existe', async () => {
      const buscarPorId = jest.fn().mockResolvedValue(null);
      const servicio = crearPerfilServicio({
        repositorio: { buscarPorId } as never,
      });

      await expect(servicio.obtener('uuid-inexistente')).rejects.toThrow(
        new ErrorNegocio('Usuario no encontrado', 404),
      );
    });
  });

  describe('actualizar', () => {
    const dtoActualizar: ActualizarUsuarioDto = {
      nombres: 'Juan Carlos',
      apellidos: 'Perez Lopez',
      correo: 'juancarlos@bebras.com',
      telefono: '70000001',
    };

    it('deberia actualizar cuando el solicitante es administrador y el correo es unico', async () => {
      const usuarioActualizado = { ...usuarioMock, ...dtoActualizar };
      const buscarPorId = jest
        .fn()
        .mockResolvedValueOnce(adminMock)       // solicitante
        .mockResolvedValueOnce(usuarioMock);     // usuario objetivo
      const buscarPorCorreoExcluyendo = jest.fn().mockResolvedValue(null);
      const actualizarPerfil = jest.fn().mockResolvedValue(usuarioActualizado);
      const servicio = crearPerfilServicio({
        repositorio: { buscarPorId, buscarPorCorreoExcluyendo, actualizarPerfil } as never,
      });

      const resultado = await servicio.actualizar(usuarioMock.id, dtoActualizar, adminMock.id);

      expect(buscarPorId).toHaveBeenCalledWith(adminMock.id);
      expect(buscarPorId).toHaveBeenCalledWith(usuarioMock.id);
      expect(buscarPorCorreoExcluyendo).toHaveBeenCalledWith(dtoActualizar.correo, usuarioMock.id);
      expect(actualizarPerfil).toHaveBeenCalledWith(usuarioMock.id, {
        nombres: dtoActualizar.nombres,
        apellidos: dtoActualizar.apellidos,
        correo: dtoActualizar.correo,
        telefono: dtoActualizar.telefono,
      });
      expect(resultado).toEqual(usuarioActualizado);
    });

    it('deberia actualizar con telefono null cuando no se envia', async () => {
      const dtoSinTelefono: ActualizarUsuarioDto = {
        nombres: 'Ana',
        apellidos: 'Garcia',
        correo: 'ana@bebras.com',
      };
      const buscarPorId = jest
        .fn()
        .mockResolvedValueOnce(adminMock)
        .mockResolvedValueOnce(usuarioMock);
      const buscarPorCorreoExcluyendo = jest.fn().mockResolvedValue(null);
      const actualizarPerfil = jest.fn().mockResolvedValue({ ...usuarioMock, ...dtoSinTelefono });
      const servicio = crearPerfilServicio({
        repositorio: { buscarPorId, buscarPorCorreoExcluyendo, actualizarPerfil } as never,
      });

      await servicio.actualizar(usuarioMock.id, dtoSinTelefono, adminMock.id);

      expect(actualizarPerfil).toHaveBeenCalledWith(usuarioMock.id, expect.objectContaining({
        telefono: null,
      }));
    });

    it('deberia lanzar ErrorNegocio 403 cuando el solicitante no es administrador', async () => {
      const noAdmin = { ...adminMock, rol: 'profesor' as const };
      const buscarPorId = jest.fn().mockResolvedValue(noAdmin);
      const servicio = crearPerfilServicio({
        repositorio: { buscarPorId } as never,
      });

      await expect(
        servicio.actualizar(usuarioMock.id, dtoActualizar, noAdmin.id),
      ).rejects.toThrow(new ErrorNegocio('No tiene permisos para actualizar usuarios', 403));
    });

    it('deberia lanzar ErrorNegocio 403 cuando el solicitante no existe', async () => {
      const buscarPorId = jest.fn().mockResolvedValue(null);
      const servicio = crearPerfilServicio({
        repositorio: { buscarPorId } as never,
      });

      await expect(
        servicio.actualizar(usuarioMock.id, dtoActualizar, 'uuid-fantasma'),
      ).rejects.toThrow(new ErrorNegocio('No tiene permisos para actualizar usuarios', 403));
    });

    it('deberia lanzar ErrorNegocio 404 cuando el usuario a actualizar no existe', async () => {
      const buscarPorId = jest
        .fn()
        .mockResolvedValueOnce(adminMock)
        .mockResolvedValueOnce(null);
      const servicio = crearPerfilServicio({
        repositorio: { buscarPorId } as never,
      });

      await expect(
        servicio.actualizar('uuid-inexistente', dtoActualizar, adminMock.id),
      ).rejects.toThrow(new ErrorNegocio('Usuario no encontrado', 404));
    });

    it('deberia lanzar ErrorNegocio 409 cuando el correo ya esta registrado por otro usuario', async () => {
      const buscarPorId = jest
        .fn()
        .mockResolvedValueOnce(adminMock)
        .mockResolvedValueOnce(usuarioMock);
      const buscarPorCorreoExcluyendo = jest.fn().mockResolvedValue({ id: 'otro-usuario' });
      const servicio = crearPerfilServicio({
        repositorio: { buscarPorId, buscarPorCorreoExcluyendo } as never,
      });

      await expect(
        servicio.actualizar(usuarioMock.id, dtoActualizar, adminMock.id),
      ).rejects.toThrow(new ErrorNegocio('El correo ya esta registrado por otro usuario', 409));
    });
  });
});
