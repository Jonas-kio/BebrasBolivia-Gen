import type { rol_usuario } from '@prisma/client';
import type { RequestHandler } from 'express';

import { Accion, PERMISOS_POR_ROL } from '../shared/permisos';
import { ErrorNoAutenticado, ErrorProhibido } from '../utilidades/errores';

export const verificarRol =
  (...roles: rol_usuario[]): RequestHandler =>
  (req, _res, next): void => {
    if (!req.usuario) {
      next(new ErrorNoAutenticado());
      return;
    }

    if (!roles.includes(req.usuario.rol)) {
      next(new ErrorProhibido(`Se requiere uno de los roles: ${roles.join(', ')}`));
      return;
    }

    next();
  };

export const verificarPermiso =
  (accion: Accion): RequestHandler =>
  (req, _res, next): void => {
    if (!req.usuario) {
      next(new ErrorNoAutenticado());
      return;
    }

    const permisosDelRol = PERMISOS_POR_ROL[req.usuario.rol];

    if (!permisosDelRol.has(accion)) {
      next(new ErrorProhibido(`Tu rol no tiene permiso para: ${accion}`));
      return;
    }

    next();
  };
