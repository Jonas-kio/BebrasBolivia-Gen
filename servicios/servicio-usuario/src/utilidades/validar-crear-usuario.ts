import { rol_usuario } from '@prisma/client';

import type { CrearUsuarioDto } from '../dtos/crear-usuario.dto';

import { ErrorNegocio } from './errores';

// Limites tomados del esquema Prisma (modelo usuarios) para no exceder la BD.
const LONGITUD_MAXIMA_CORREO = 255;
const LONGITUD_MAXIMA_NOMBRE = 100;
const LONGITUD_MAXIMA_TELEFONO = 20;
const LONGITUD_MINIMA_CONTRASENA = 8;
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLES_VALIDOS = Object.values(rol_usuario);

const esTextoConContenido = (valor: unknown): valor is string =>
  typeof valor === 'string' && valor.trim().length > 0;

/**
 * Valida y normaliza el cuerpo recibido para crear un usuario.
 * Lanza ErrorNegocio (codigo 400) ante el primer campo invalido.
 * No hace acceso a datos: es una funcion pura y testeable.
 */
export function validarCrearUsuario(cuerpo: unknown): CrearUsuarioDto {
  if (typeof cuerpo !== 'object' || cuerpo === null) {
    throw new ErrorNegocio('El cuerpo de la peticion es invalido');
  }

  const datos = cuerpo as Record<string, unknown>;

  if (!esTextoConContenido(datos.correo)) {
    throw new ErrorNegocio('El correo es obligatorio');
  }
  const correo = datos.correo.trim().toLowerCase();
  if (correo.length > LONGITUD_MAXIMA_CORREO) {
    throw new ErrorNegocio('El correo excede la longitud permitida');
  }
  if (!PATRON_CORREO.test(correo)) {
    throw new ErrorNegocio('El correo no tiene un formato valido');
  }

  if (!esTextoConContenido(datos.nombres)) {
    throw new ErrorNegocio('Los nombres son obligatorios');
  }
  const nombres = datos.nombres.trim();
  if (nombres.length > LONGITUD_MAXIMA_NOMBRE) {
    throw new ErrorNegocio('Los nombres exceden la longitud permitida');
  }

  if (!esTextoConContenido(datos.apellidos)) {
    throw new ErrorNegocio('Los apellidos son obligatorios');
  }
  const apellidos = datos.apellidos.trim();
  if (apellidos.length > LONGITUD_MAXIMA_NOMBRE) {
    throw new ErrorNegocio('Los apellidos exceden la longitud permitida');
  }

  if (!esTextoConContenido(datos.contrasena)) {
    throw new ErrorNegocio('La contrasena es obligatoria');
  }
  const contrasena = datos.contrasena;
  if (contrasena.length < LONGITUD_MINIMA_CONTRASENA) {
    throw new ErrorNegocio(
      `La contrasena debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres`,
    );
  }

  if (!esTextoConContenido(datos.rol)) {
    throw new ErrorNegocio('El rol es obligatorio');
  }
  if (!ROLES_VALIDOS.includes(datos.rol as rol_usuario)) {
    throw new ErrorNegocio(`El rol debe ser uno de: ${ROLES_VALIDOS.join(', ')}`);
  }
  const rol = datos.rol as rol_usuario;

  const dto: CrearUsuarioDto = { correo, nombres, apellidos, contrasena, rol };

  if (datos.nombreUsuario !== undefined && datos.nombreUsuario !== null) {
    if (!esTextoConContenido(datos.nombreUsuario)) {
      throw new ErrorNegocio('El nombre de usuario no puede estar vacio');
    }
    const nombreUsuario = datos.nombreUsuario.trim();
    if (nombreUsuario.length > LONGITUD_MAXIMA_NOMBRE) {
      throw new ErrorNegocio('El nombre de usuario excede la longitud permitida');
    }
    dto.nombreUsuario = nombreUsuario;
  }

  if (datos.telefono !== undefined && datos.telefono !== null) {
    if (!esTextoConContenido(datos.telefono)) {
      throw new ErrorNegocio('El telefono no puede estar vacio');
    }
    const telefono = datos.telefono.trim();
    if (telefono.length > LONGITUD_MAXIMA_TELEFONO) {
      throw new ErrorNegocio('El telefono excede la longitud permitida');
    }
    dto.telefono = telefono;
  }

  return dto;
}
