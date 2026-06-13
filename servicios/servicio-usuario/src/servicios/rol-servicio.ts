import { rol_usuario } from '@prisma/client';

import type { CambiarRolUsuarioDto } from '../dtos/cambiar-rol-usuario.dto';
import type { CambiarRolDto } from '../dtos/rol.dto';
import type { RolRepositorio } from '../repositorios/rol-repositorio';
import { ErrorNegocio } from '../utilidades/errores';

export class RolServicio {
  constructor(private readonly rolRepositorio: RolRepositorio) {}

  listarRolesDisponibles(): string[] {
    return Object.values(rol_usuario);
  }

  async obtenerUsuariosDeRol(
    rol: string,
  ): Promise<{ id: string; nombres: string; apellidos: string; correo: string; rol: rol_usuario }[]> {
    if (!Object.values(rol_usuario).includes(rol as rol_usuario)) {
      throw new ErrorNegocio(`El rol '${rol}' no es válido.`, 400);
    }
    return this.rolRepositorio.obtenerUsuariosPorRol(rol as rol_usuario);
  }

  async cambiarRol(
    datos: CambiarRolDto,
  ): Promise<{ id: string; nombres: string; correo: string; rol: rol_usuario }> {
    if (!Object.values(rol_usuario).includes(datos.nuevoRol)) {
      throw new ErrorNegocio(`El rol '${datos.nuevoRol}' no es válido.`, 400);
    }

    const usuario = await this.rolRepositorio.verificarUsuarioExiste(datos.usuarioId);
    if (!usuario) {
      throw new ErrorNegocio(`Usuario con id ${datos.usuarioId} no encontrado`, 404);
    }

    return this.rolRepositorio.actualizarRolUsuario(datos.usuarioId, datos.nuevoRol);
  }

  async obtenerRolUsuario(
    usuarioId: string,
  ): Promise<{ id: string; correo: string; rol: rol_usuario }> {
    const usuario = await this.rolRepositorio.obtenerUsuarioConRol(usuarioId);
    if (!usuario) {
      throw new ErrorNegocio('Usuario no encontrado', 404);
    }
    return usuario;
  }

  async modificarRolConValidaciones(
    usuarioId: string,
    datos: CambiarRolUsuarioDto,
  ): Promise<{ id: string; correo: string; rol: rol_usuario }> {
    if (!Object.values(rol_usuario).includes(datos.nuevoRol)) {
      throw new ErrorNegocio(`El rol '${datos.nuevoRol}' no es válido.`, 400);
    }

    const usuario = await this.rolRepositorio.obtenerUsuarioConRol(usuarioId);
    if (!usuario) {
      throw new ErrorNegocio('Usuario no encontrado', 404);
    }

    const correoAdminPrincipal = process.env['ROOT_ADMIN_EMAIL'];
    if (correoAdminPrincipal !== undefined && correoAdminPrincipal !== '' &&
      usuario.correo === correoAdminPrincipal) {
      throw new ErrorNegocio('No se puede modificar el rol del administrador principal', 403);
    }

    if (usuario.rol === 'administrador' && datos.nuevoRol !== 'administrador') {
      const totalAdministradores = await this.rolRepositorio.contarAdministradores();
      if (totalAdministradores <= 1) {
        throw new ErrorNegocio('No se puede quitar el rol al último administrador del sistema', 400);
      }
    }

    if (usuario.rol === datos.nuevoRol) {
      return usuario;
    }

    const datosAdicionales = datos.datosAdicionales ?? {};

    return this.rolRepositorio.cambiarRolConExtensiones(
      usuarioId,
      usuario.rol,
      datos.nuevoRol,
      datosAdicionales,
    );
  }
}