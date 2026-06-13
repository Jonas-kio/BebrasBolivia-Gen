import type { rol_usuario, usuarios } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

import baseDeDatos from '../config/base-de-datos';
import type { CambiarEstadoUsuarioDto } from '../dtos/cambiar-estado-usuario.dto';
import type { CambiarRolUsuarioDto } from '../dtos/cambiar-rol-usuario.dto';
import type { CrearUsuarioDto } from '../dtos/crear-usuario.dto';
import { RolRepositorio } from '../repositorios/rol-repositorio';
import { RolServicio } from '../servicios/rol-servicio';
import { crearPerfilServicio, crearUsuarioServicio } from '../servicios/usuario-servicio';
import { validarActualizarPerfil } from '../utilidades/validar-actualizar-perfil';
import { validarConsultaUsuarios } from '../utilidades/validar-consulta-usuarios';
import { validarCrearUsuario } from '../utilidades/validar-crear-usuario';

type UsuarioServicio = ReturnType<typeof crearUsuarioServicio>;
type PerfilServicio = ReturnType<typeof crearPerfilServicio>;

interface UsuarioPublico {
  id: string;
  correo: string;
  nombres: string;
  apellidos: string;
  rol: usuarios['rol'];
  nombreUsuario: string | null;
  telefono: string | null;
  estaActivo: boolean;
  estaVerificado: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

interface UsuarioControlador {
  crear(req: Request, res: Response, next: NextFunction): Promise<void>;
  listar(req: Request, res: Response, next: NextFunction): Promise<void>;
  eliminar(req: Request, res: Response, next: NextFunction): Promise<void>;
  obtener(req: Request, res: Response, next: NextFunction): Promise<void>;
  actualizar(req: Request, res: Response, next: NextFunction): Promise<void>;
  obtenerRolUsuario(req: Request, res: Response, next: NextFunction): Promise<void>;
  modificarRolUsuario(req: Request, res: Response, next: NextFunction): Promise<void>;
  cambiarEstadoUsuario(req: Request, res: Response, next: NextFunction): Promise<void>;
}

// Nunca se expone contrasena_hash al cliente (regla de seguridad del estandar).
const aRespuestaPublica = (usuario: usuarios): UsuarioPublico => ({
  id: usuario.id,
  correo: usuario.correo,
  nombres: usuario.nombres,
  apellidos: usuario.apellidos,
  rol: usuario.rol,
  nombreUsuario: usuario.nombre_usuario,
  telefono: usuario.telefono,
  estaActivo: usuario.esta_activo,
  estaVerificado: usuario.esta_verificado,
  creadoEn: usuario.creado_en,
  actualizadoEn: usuario.actualizado_en,
});

/**
 * Valida y normaliza el cuerpo de la peticion PATCH /:id/rol.
 * Retorna el DTO tipado o lanza un error de validacion.
 */
const validarCambiarRolUsuario = (body: unknown): CambiarRolUsuarioDto => {
  const datos = body as Record<string, unknown>;

  if (!datos['nuevoRol'] || typeof datos['nuevoRol'] !== 'string') {
    throw Object.assign(new Error('El campo nuevoRol es requerido'), { status: 400 });
  }

  return {
    nuevoRol: datos['nuevoRol'] as rol_usuario,
    datosAdicionales:
      datos['datosAdicionales'] !== undefined &&
      typeof datos['datosAdicionales'] === 'object' &&
      datos['datosAdicionales'] !== null
        ? datos['datosAdicionales']
        : undefined,
  };
};

export const crearUsuarioControlador = (
  servicio: UsuarioServicio = crearUsuarioServicio(),
  rolServicio: RolServicio = new RolServicio(new RolRepositorio(baseDeDatos)),
  perfilServicio: PerfilServicio = crearPerfilServicio(),
): UsuarioControlador => ({
  /**
   * POST /api/v1/usuarios
   * Recibe la peticion, valida el cuerpo y delega en el servicio.
   * No contiene logica de negocio (flujo: Controlador -> Servicio -> Repositorio).
   */
  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: CrearUsuarioDto = validarCrearUsuario(req.body);
      const usuarioCreado = await servicio.crear(dto);
      res.status(201).json({ data: aRespuestaPublica(usuarioCreado) });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/usuarios
   * Lista usuarios con paginación y filtros (REQ-010)
   */
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = validarConsultaUsuarios(req.query);

      const resultado = await servicio.listar(query);
      res.status(200).json({
        data: resultado.usuarios.map(aRespuestaPublica),
        paginacion: resultado.paginacion,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/v1/usuarios/:id
   * Elimina logicamente un usuario (REQ-002)
   */
  async eliminar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idSolicitante = req.usuario!.id;
      await servicio.eliminarUsuario(req.params.id, idSolicitante);
      res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
      next(error);
    }
  },

  async obtener(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuario = await perfilServicio.obtener(req.params.id);
      res.status(200).json({ data: aRespuestaPublica(usuario) });
    } catch (error) {
      next(error);
    }
  },

  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idSolicitante = req.headers['x-usuario-id'];

      if (!idSolicitante || typeof idSolicitante !== 'string') {
        res.status(400).json({ mensaje: 'Falta el identificador del solicitante' });
        return;
      }

      const dto = validarActualizarPerfil(req.body);
      const actualizado = await perfilServicio.actualizar(req.params.id, dto, idSolicitante);
      res.status(200).json({ data: aRespuestaPublica(actualizado) });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/v1/usuarios/:id/rol
   * Retorna el rol actual del usuario identificado por :id (REQ-08 Task 1).
   * Solo accesible por administradores.
   */
  async obtenerRolUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await rolServicio.obtenerRolUsuario(req.params.id);
      res.status(200).json({ data: resultado });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/v1/usuarios/:id/estado
  // Activa o desactiva un usuario (REQ-006)
  async cambiarEstadoUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { estaActivo } = req.body as CambiarEstadoUsuarioDto;
      const idSolicitante = req.usuario!.id;

      if (typeof estaActivo !== 'boolean') {
        res.status(400).json({ mensaje: 'El campo estaActivo debe ser un booleano' });
        return;
      }
      if (!id || typeof id !== 'string') {
        res.status(400).json({ mensaje: 'El id del usuario es requerido' });
        return;
      }

      const resultado = await servicio.cambiarEstadoUsuario(id, idSolicitante, estaActivo);
      res.status(200).json({ data: aRespuestaPublica(resultado) });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/v1/usuarios/:id/rol
   * Cambia el rol del usuario aplicando validaciones del REQ-08:
   *  - No modificar el admin principal.
   *  - No dejar el sistema sin admins.
   *  - Gestionar extensiones en transaccion.
   * Solo accesible por administradores.
   */
  async modificarRolUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = validarCambiarRolUsuario(req.body);
      const resultado = await rolServicio.modificarRolConValidaciones(req.params.id, dto);
      res.status(200).json({ mensaje: 'Rol actualizado correctamente', data: resultado });
    } catch (error) {
      next(error);
    }
  },
});

export const usuarioControlador = crearUsuarioControlador();
