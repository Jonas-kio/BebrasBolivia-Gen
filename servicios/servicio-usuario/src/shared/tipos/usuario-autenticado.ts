import type { rol_usuario } from '@prisma/client';

/**
 * Representa al usuario ya autenticado y su scope de accion.
 * Lo construye resolver-identidad y lo consumen los middlewares de autorizacion.
 * No contiene contrasenas ni datos sensibles.
 */
export interface UsuarioAutenticado {
  id: string;
  rol: rol_usuario;
  institucionIds: string[];
  grupoIds: string[];
}

// Express requiere namespace para augmentar Request. Al ser este archivo un modulo
// (tiene imports/exports), el declare global se aplica transitivamente a cualquier
// archivo que lo importe. Es el patron estandar de Passport.js y Express Session.
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioAutenticado;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */
