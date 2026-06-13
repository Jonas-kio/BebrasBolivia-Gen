/**
 * Error de negocio controlado. Lo lanzan las capas de servicio cuando una
 * regla del dominio no se cumple (ej. correo duplicado, rol invalido).
 * El middleware de errores lo traduce a una respuesta HTTP segura sin
 * exponer detalles internos al cliente.
 */
export class ErrorNegocio extends Error {
  public readonly codigo: number;

  constructor(mensaje: string, codigo = 400) {
    super(mensaje);
    this.name = 'ErrorNegocio';
    this.codigo = codigo;
  }
}

/**
 * El solicitante no tiene identidad reconocida en el sistema.
 * Se lanza cuando falta el token/header de autenticacion o el usuario
 * no existe en BD. Siempre produce HTTP 401.
 */
export class ErrorNoAutenticado extends ErrorNegocio {
  constructor(mensaje = 'No autenticado') {
    super(mensaje, 401);
    this.name = 'ErrorNoAutenticado';
  }
}

/**
 * El solicitante esta autenticado pero no tiene permisos para esta operacion.
 * Se lanza cuando el rol o el scope no cubren la accion solicitada. Siempre produce HTTP 403.
 */
export class ErrorProhibido extends ErrorNegocio {
  constructor(mensaje = 'Acceso prohibido') {
    super(mensaje, 403);
    this.name = 'ErrorProhibido';
  }
}
