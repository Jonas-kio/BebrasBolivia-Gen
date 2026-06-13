export class ErrorAplicacion extends Error {
    public readonly status: number;
    public readonly codigo: string;
  
    constructor(mensaje: string, status = 500, codigo = 'ERROR_INTERNO') {
      super(mensaje);
      this.status = status;
      this.codigo = codigo;
      this.name = 'ErrorAplicacion';
    }
  }
  
  export function crearErrorNoAutorizado(
    mensaje = 'Debes iniciar sesión para acceder a este recurso.',
  ): ErrorAplicacion {
    return new ErrorAplicacion(mensaje, 401, 'NO_AUTORIZADO');
  }
  
  export function crearErrorAccesoDenegado(
    mensaje = 'No tienes permisos para realizar esta acción.',
  ): ErrorAplicacion {
    return new ErrorAplicacion(mensaje, 403, 'ACCESO_DENEGADO');
  }
  
  export function crearErrorNoEncontrado(
    mensaje = 'Ruta no encontrada',
  ): ErrorAplicacion {
    return new ErrorAplicacion(mensaje, 404, 'RUTA_NO_ENCONTRADA');
  }