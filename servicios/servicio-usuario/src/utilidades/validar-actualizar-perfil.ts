import type { ActualizarUsuarioDto } from '../dtos/actualizar-usuario.dto';

import { ErrorNegocio } from './errores';

const LONGITUD_MAXIMA_CORREO = 255;
const LONGITUD_MAXIMA_NOMBRE = 100;
const LONGITUD_MAXIMA_TELEFONO = 20;
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PATRON_TELEFONO = /^\+?[0-9]{7,15}$/;

const esTextoConContenido = (valor: unknown): valor is string =>
  typeof valor === 'string' && valor.trim().length > 0;

/**
 * Valida y normaliza el cuerpo recibido para actualizar perfil.
 */
export function validarActualizarPerfil(cuerpo: unknown): ActualizarUsuarioDto {
  if (typeof cuerpo !== 'object' || cuerpo === null) {
    throw new ErrorNegocio('El cuerpo de la peticion es invalido');
  }

  const datos = cuerpo as Record<string, unknown>;

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

  const dto: ActualizarUsuarioDto = { nombres, apellidos, correo };

  if (datos.telefono !== undefined && datos.telefono !== null) {
    if (!esTextoConContenido(datos.telefono)) {
      throw new ErrorNegocio('El telefono no puede estar vacio si se envia');
    }
    const telefono = datos.telefono.trim();
    if (telefono.length > LONGITUD_MAXIMA_TELEFONO) {
      throw new ErrorNegocio('El telefono excede la longitud permitida');
    }
    if (!PATRON_TELEFONO.test(telefono)) {
      throw new ErrorNegocio('El telefono no tiene un formato valido');
    }
    dto.telefono = telefono;
  }

  return dto;
}