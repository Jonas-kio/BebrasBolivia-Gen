import { ErrorNegocio, ErrorNoAutenticado, ErrorProhibido } from '../../src/utilidades/errores';

describe('ErrorNegocio', () => {
  it('deberia tener codigo 400 por defecto', () => {
    const error = new ErrorNegocio('algo fallo');

    expect(error.codigo).toBe(400);
    expect(error.message).toBe('algo fallo');
    expect(error.name).toBe('ErrorNegocio');
    expect(error).toBeInstanceOf(Error);
  });

  it('deberia usar el codigo proporcionado', () => {
    const error = new ErrorNegocio('no encontrado', 404);

    expect(error.codigo).toBe(404);
  });
});

describe('ErrorNoAutenticado', () => {
  it('deberia tener codigo 401 fijo', () => {
    const error = new ErrorNoAutenticado();

    expect(error.codigo).toBe(401);
    expect(error.name).toBe('ErrorNoAutenticado');
  });

  it('deberia aceptar mensaje personalizado', () => {
    const error = new ErrorNoAutenticado('Token invalido');

    expect(error.message).toBe('Token invalido');
    expect(error.codigo).toBe(401);
  });

  it('deberia ser instancia de ErrorNegocio y de Error', () => {
    const error = new ErrorNoAutenticado();

    expect(error).toBeInstanceOf(ErrorNegocio);
    expect(error).toBeInstanceOf(Error);
  });
});

describe('ErrorProhibido', () => {
  it('deberia tener codigo 403 fijo', () => {
    const error = new ErrorProhibido();

    expect(error.codigo).toBe(403);
    expect(error.name).toBe('ErrorProhibido');
  });

  it('deberia aceptar mensaje personalizado', () => {
    const error = new ErrorProhibido('Solo administradores');

    expect(error.message).toBe('Solo administradores');
    expect(error.codigo).toBe(403);
  });

  it('deberia ser instancia de ErrorNegocio y de Error', () => {
    const error = new ErrorProhibido();

    expect(error).toBeInstanceOf(ErrorNegocio);
    expect(error).toBeInstanceOf(Error);
  });
});
