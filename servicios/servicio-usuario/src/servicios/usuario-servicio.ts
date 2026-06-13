import type { usuarios } from '@prisma/client';
import bcrypt from 'bcrypt';
import type { ActualizarUsuarioDto } from 'src/dtos/actualizar-usuario.dto';

import type { ConsultaUsuariosQuery, PaginacionResponse } from '../dtos/consulta-usuarios.dto';
import type { CrearUsuarioDto } from '../dtos/crear-usuario.dto';
import {
  crearUsuarioRepositorio,
  usuarioRepositorio as repositorioPorDefecto,
} from '../repositorios/usuario-repositorio';
import { ErrorNegocio } from '../utilidades/errores';

type UsuarioRepositorio = ReturnType<typeof crearUsuarioRepositorio>;

interface DependenciasPerfilServicio {
  repositorio?: UsuarioRepositorio;
}

interface PerfilServicio {
  obtener(id: string): Promise<usuarios>;
  actualizar(id: string, dto: ActualizarUsuarioDto, idSolicitante: string): Promise<usuarios>;
}
/**
 * Puerto de hasheo de contrasenas.
 */
export interface HasheadorContrasena {
  hashear(contrasenaPlana: string): Promise<string>;
}

/**
 * Implementacion hasheo usando bcrypt (REQ-04).
 */
const hasheadorBcrypt: HasheadorContrasena = {
  async hashear(contrasenaPlana: string): Promise<string> {
    const rondasSal = 10;
    return bcrypt.hash(contrasenaPlana, rondasSal);
  }
};

interface DependenciasUsuarioServicio {
  repositorio?: UsuarioRepositorio;
  hasheador?: HasheadorContrasena;
}

interface UsuarioServicio {
  crear(dto: CrearUsuarioDto): Promise<usuarios>;
  listar(query: ConsultaUsuariosQuery): Promise<{
    usuarios: usuarios[];
    paginacion: PaginacionResponse;
  }>;
  eliminarUsuario(idUsuario: string, idSolicitante: string): Promise<usuarios>;
  cambiarEstadoUsuario(idUsuario: string, idSolicitante: string, estaActivo: boolean): Promise<usuarios>;
}

export const crearUsuarioServicio = (
  dependencias: DependenciasUsuarioServicio = {},
): UsuarioServicio => {
  const repositorio = dependencias.repositorio ?? repositorioPorDefecto;
  const hasheador = dependencias.hasheador ?? hasheadorBcrypt;

  return {
    /**
     * Crea un usuario nuevo a partir de los datos validados del formulario.
     * Aplica la regla de negocio de correo unico antes de persistir.
     */
    async crear(dto: CrearUsuarioDto): Promise<usuarios> {
      const correoRegistrado = await repositorio.buscarPorCorreo(dto.correo);
      if (correoRegistrado !== null) {
        throw new ErrorNegocio('El correo ya esta registrado', 409);
      }

      const contrasenaHash = await hasheador.hashear(dto.contrasena);

      return repositorio.crear({
        correo: dto.correo,
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        contrasena_hash: contrasenaHash,
        rol: dto.rol,
        nombre_usuario: dto.nombreUsuario ?? null,
        telefono: dto.telefono ?? null,
      });
    },

    /**
     * Lista usuarios con paginación y filtros (REQ-010)
     */
    async listar(query: ConsultaUsuariosQuery): Promise<{
      usuarios: usuarios[];
      paginacion: PaginacionResponse;
    }> {
      const { page = 1, limit = 10 } = query;
      const { usuarios, total } = await repositorio.listar({ ...query, page, limit });
      
      return {
        usuarios,
        paginacion: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    },

    /**
     * Elimina logicamente un usuario (REQ-002)
     */
    async eliminarUsuario(idUsuario: string, idSolicitante: string): Promise<usuarios> {
      const solicitante = await repositorio.buscarPorId(idSolicitante);

      if (!solicitante || solicitante.rol !== 'administrador') {
        throw new ErrorNegocio('No tiene permisos para eliminar usuarios', 403);
      }

      const usuario = await repositorio.buscarPorId(idUsuario);

      if (!usuario) {
        throw new ErrorNegocio('Usuario no encontrado', 404);
      }

      if (!usuario.esta_activo) {
        throw new ErrorNegocio('El usuario ya fue eliminado', 400);
      }

      return repositorio.eliminar(idUsuario);
    },

    /**
     * Activa o desactiva un usuario (REQ-006)
     * Solo un administrador puede realizar esta accion.
     */
    async cambiarEstadoUsuario(
      idUsuario: string,
      idSolicitante: string,
      estaActivo: boolean,
    ): Promise<usuarios> {
      const solicitante = await repositorio.buscarPorId(idSolicitante);

      if (!solicitante || solicitante.rol !== 'administrador') {
        throw new ErrorNegocio('No tiene permisos para cambiar el estado del usuario', 403);
      }

      const usuario = await repositorio.buscarPorId(idUsuario);

      if (!usuario) {
        throw new ErrorNegocio('Usuario no encontrado', 404);
      }

      return repositorio.actualizarEstadoActivo(idUsuario, estaActivo);
    },
  };
};

export const crearPerfilServicio = (
  dependencias: DependenciasPerfilServicio = {},
): PerfilServicio => {
  const repositorio = dependencias.repositorio ?? repositorioPorDefecto;

  return {
    async obtener(id: string): Promise<usuarios> {
      const usuario = await repositorio.buscarPorId(id);
      if (usuario === null) {
        throw new ErrorNegocio('Usuario no encontrado', 404);
      }
      return usuario;
    },

    async actualizar(id: string, dto: ActualizarUsuarioDto, idSolicitante: string): Promise<usuarios> {
      const solicitante = await repositorio.buscarPorId(idSolicitante);
      if (!solicitante || solicitante.rol !== 'administrador') {
        throw new ErrorNegocio('No tiene permisos para actualizar usuarios', 403);
      }

      const usuario = await repositorio.buscarPorId(id);
      if (usuario === null) {
        throw new ErrorNegocio('Usuario no encontrado', 404);
      }

      const correoEnUso = await repositorio.buscarPorCorreoExcluyendo(dto.correo, id);
      if (correoEnUso !== null) {
        throw new ErrorNegocio('El correo ya esta registrado por otro usuario', 409);
      }

      return repositorio.actualizarPerfil(id, {
        nombres: dto.nombres,
        apellidos: dto.apellidos,
        correo: dto.correo,
        telefono: dto.telefono ?? null,
      });
    },
  };
};

export const usuarioServicio = crearUsuarioServicio();