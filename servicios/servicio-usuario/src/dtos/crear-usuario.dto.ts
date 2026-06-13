import type { rol_usuario } from '@prisma/client';

/**
 * Contrato de entrada para crear un usuario manualmente (REQ-004 / RF-21).
 * Refleja los campos que el administrador completa en el formulario.
 * La contrasena llega en texto plano; el hasheo es responsabilidad de la
 * capa de servicios, nunca del controlador ni del repositorio.
 */
export interface CrearUsuarioDto {
  correo: string;
  nombres: string;
  apellidos: string;
  contrasena: string;
  rol: rol_usuario;
  nombreUsuario?: string;
  telefono?: string;
}
