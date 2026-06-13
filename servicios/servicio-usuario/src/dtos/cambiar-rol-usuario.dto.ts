import type { rol_usuario } from '@prisma/client';

export interface DatosExtensionEstudianteDto {
  grupoId?: string;
  codigo?: string;
  institucionId?: string;
}

export interface DatosExtensionProfesorDto {
  institucionId?: string;
}

export interface CambiarRolUsuarioDto {
  nuevoRol: rol_usuario;
  datosAdicionales?: DatosExtensionEstudianteDto | DatosExtensionProfesorDto;
}