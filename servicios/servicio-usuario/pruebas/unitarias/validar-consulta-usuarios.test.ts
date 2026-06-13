import { ErrorNegocio } from '../../src/utilidades/errores';
import { validarConsultaUsuarios } from '../../src/utilidades/validar-consulta-usuarios';

describe('validarConsultaUsuarios', () => {
  it('debería retornar valores por defecto si la query está vacía', () => {
    const query = {};
    const resultado = validarConsultaUsuarios(query);
    expect(resultado.page).toBe(1);
    expect(resultado.limit).toBe(10);
  });

  it('debería parsear correctamente page y limit válidos', () => {
    const query = { page: '2', limit: '20' };
    const resultado = validarConsultaUsuarios(query);
    expect(resultado.page).toBe(2);
    expect(resultado.limit).toBe(20);
  });

  it('debería lanzar error si page es menor a 1', () => {
    const query = { page: '0' };
    expect(() => validarConsultaUsuarios(query)).toThrow(ErrorNegocio);
    expect(() => validarConsultaUsuarios(query)).toThrow('El parámetro page debe ser un número entero mayor o igual a 1');
  });

  it('debería lanzar error si limit es menor a 1', () => {
    const query = { limit: '0' };
    expect(() => validarConsultaUsuarios(query)).toThrow(ErrorNegocio);
    expect(() => validarConsultaUsuarios(query)).toThrow('El parámetro limit debe ser un número entero positivo');
  });

  it('debería ajustar limit al máximo permitido (50) si se excede', () => {
    const query = { limit: '100' };
    const resultado = validarConsultaUsuarios(query);
    expect(resultado.limit).toBe(50);
  });

  it('debería lanzar error si orderDir no es asc ni desc', () => {
    const query = { orderDir: 'invalid' };
    expect(() => validarConsultaUsuarios(query)).toThrow(ErrorNegocio);
    expect(() => validarConsultaUsuarios(query)).toThrow('El parámetro orderDir debe ser "asc" o "desc"');
  });

  it('debería normalizar correctamente los filtros booleanos y de búsqueda', () => {
    const query = { 
      rol: 'estudiante', 
      estaActivo: 'true', 
      search: 'juan',
      orderBy: 'nombres'
    };
    const resultado = validarConsultaUsuarios(query);
    expect(resultado.rol).toBe('estudiante');
    expect(resultado.estaActivo).toBe(true);
    expect(resultado.search).toBe('juan');
    expect(resultado.orderBy).toBe('nombres');
  });

  it('debería manejar estaActivo "false" correctamente', () => {
    const query = { estaActivo: 'false' };
    const resultado = validarConsultaUsuarios(query);
    expect(resultado.estaActivo).toBe(false);
  });
});
