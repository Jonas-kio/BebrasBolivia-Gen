import { Usuario } from '../modelos/usuario';
import { ErrorNegocio } from '../utilidades/errores';

import { UsuarioRepositorio } from './usuario.repositorio';

export class UsuarioRepositorioMock implements UsuarioRepositorio {
  private usuarios: Usuario[] = [
    {
      id: '1',
      nombre: 'Juan Perez',
      email: 'juan@example.com',
      fechaCreacion: new Date(),
      estaActivo: true,
    },
    {
      id: '2',
      nombre: 'Maria Garcia',
      email: 'maria@example.com',
      fechaCreacion: new Date(),
      estaActivo: false,
    },
  ];

  async listar(): Promise<Usuario[]> {
    return this.usuarios;
  }

  async cambiarEstado(id: string, estaActivo: boolean): Promise<Usuario> {
    const usuario = this.usuarios.find((usuarioEncontrado) => usuarioEncontrado.id === id);
    if (!usuario) {
      throw new ErrorNegocio(`Usuario con id ${id} no encontrado`, 404);
    }
    usuario.estaActivo = estaActivo;
    return usuario;
  }
}


