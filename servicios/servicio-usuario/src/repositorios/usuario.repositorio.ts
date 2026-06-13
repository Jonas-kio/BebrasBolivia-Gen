import { Usuario } from '../modelos/usuario';

export interface UsuarioRepositorio {
  listar(): Promise<Usuario[]>;
  cambiarEstado(id: string, estaActivo: boolean): Promise<Usuario>;
}
