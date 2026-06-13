import { crearUsuarioRepositorio } from '../../src/repositorios/usuario-repositorio';

describe('UsuarioRepositorio', () => {
  it('deberia buscar por id', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'u1' });
    const repositorio = crearUsuarioRepositorio({
      usuarios: { findUnique, findFirst: jest.fn() },
    } as never);

    const resultado = await repositorio.buscarPorId('u1');

    expect(findUnique).toHaveBeenCalledWith({ where: { id: 'u1' } });
    expect(resultado).toEqual({ id: 'u1' });
  });

  it('deberia buscar por correo', async () => {
    const findFirst = jest.fn().mockResolvedValue({ correo: 'a@b.com' });
    const repositorio = crearUsuarioRepositorio({
      usuarios: { findUnique: jest.fn(), findFirst },
    } as never);

    const resultado = await repositorio.buscarPorCorreo('a@b.com');

    expect(findFirst).toHaveBeenCalledWith({ where: { correo: 'a@b.com' } });
    expect(resultado).toEqual({ correo: 'a@b.com' });
  });

  it('deberia crear un usuario delegando en create', async () => {
    const datos = { correo: 'nuevo@b.com', nombres: 'Ana' };
    const create = jest.fn().mockResolvedValue({ id: 'u9', ...datos });
    const repositorio = crearUsuarioRepositorio({
      usuarios: { findUnique: jest.fn(), findFirst: jest.fn(), create },
    } as never);

    const resultado = await repositorio.crear(datos as never);

    expect(create).toHaveBeenCalledWith({ data: datos });
    expect(resultado).toEqual({ id: 'u9', ...datos });
  });

  // ─── Tests para buscarPorCorreoExcluyendo ────────────────────────────

  it('deberia buscar por correo excluyendo un id especifico', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const repositorio = crearUsuarioRepositorio({
      usuarios: { findUnique: jest.fn(), findFirst },
    } as never);

    const resultado = await repositorio.buscarPorCorreoExcluyendo('a@b.com', 'u1');

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        correo: 'a@b.com',
        id: { not: 'u1' },
      },
    });
    expect(resultado).toBeNull();
  });

  it('deberia retornar el usuario cuando otro tiene el correo', async () => {
    const otroUsuario = { id: 'u2', correo: 'a@b.com' };
    const findFirst = jest.fn().mockResolvedValue(otroUsuario);
    const repositorio = crearUsuarioRepositorio({
      usuarios: { findUnique: jest.fn(), findFirst },
    } as never);

    const resultado = await repositorio.buscarPorCorreoExcluyendo('a@b.com', 'u1');

    expect(resultado).toEqual(otroUsuario);
  });

  // ─── Tests para actualizarPerfil ─────────────────────────────────────

  it('deberia actualizar perfil delegando en update con actualizado_en', async () => {
    const datosActualizar = {
      nombres: 'Carlos',
      apellidos: 'Mendez',
      correo: 'carlos@bebras.com',
      telefono: '70000000',
    };
    const usuarioActualizado = { id: 'u1', ...datosActualizar };
    const update = jest.fn().mockResolvedValue(usuarioActualizado);
    const repositorio = crearUsuarioRepositorio({
      usuarios: { findUnique: jest.fn(), findFirst: jest.fn(), update },
    } as never);

    const resultado = await repositorio.actualizarPerfil('u1', datosActualizar);

    expect(update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: expect.objectContaining({
        ...datosActualizar,
        actualizado_en: expect.any(Date),
      }),
    });
    expect(resultado).toEqual(usuarioActualizado);
  });

  it('deberia actualizar perfil con telefono null cuando no se envia', async () => {
    const datosActualizar = {
      nombres: 'Ana',
      apellidos: 'Perez',
      correo: 'ana@bebras.com',
    };
    const update = jest.fn().mockResolvedValue({ id: 'u2', ...datosActualizar });
    const repositorio = crearUsuarioRepositorio({
      usuarios: { findUnique: jest.fn(), findFirst: jest.fn(), update },
    } as never);

    await repositorio.actualizarPerfil('u2', datosActualizar);

    expect(update).toHaveBeenCalledWith({
      where: { id: 'u2' },
      data: expect.objectContaining({
        nombres: 'Ana',
        apellidos: 'Perez',
        correo: 'ana@bebras.com',
      }),
    });
  });

  // ─── Tests para eliminar ─────────────────────────────────────────────

  it('deberia eliminar logicamente un usuario (esta_activo = false)', async () => {
    const update = jest.fn().mockResolvedValue({ id: 'u1', esta_activo: false });
    const repositorio = crearUsuarioRepositorio({
      usuarios: { findUnique: jest.fn(), findFirst: jest.fn(), update },
    } as never);

    const resultado = await repositorio.eliminar('u1');

    expect(update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { esta_activo: false },
    });
    expect(resultado.esta_activo).toBe(false);
  });
});
