import { ErrorNegocio } from '../../src/utilidades/errores';
import { validarCrearUsuario } from '../../src/utilidades/validar-crear-usuario';

const cuerpoValido = {
  correo: 'Admin@Bebras.com',
  nombres: 'Maria',
  apellidos: 'Lopez',
  contrasena: 'claveSegura1',
  rol: 'administrador',
};

describe('validarCrearUsuario', () => {
  it('deberia retornar el dto normalizado cuando los datos son validos', () => {
    const dto = validarCrearUsuario({ ...cuerpoValido });

    expect(dto.correo).toBe('admin@bebras.com');
    expect(dto.nombres).toBe('Maria');
    expect(dto.rol).toBe('administrador');
  });

  it('deberia incluir campos opcionales cuando se envian', () => {
    const dto = validarCrearUsuario({
      ...cuerpoValido,
      nombreUsuario: '  marial  ',
      telefono: '70000000',
    });

    expect(dto.nombreUsuario).toBe('marial');
    expect(dto.telefono).toBe('70000000');
  });

  it('deberia lanzar ErrorNegocio cuando el cuerpo no es un objeto', () => {
    expect(() => validarCrearUsuario(null)).toThrow(ErrorNegocio);
  });

  it('deberia lanzar ErrorNegocio cuando falta el correo', () => {
    const { correo: _correo, ...sinCorreo } = cuerpoValido;

    expect(() => validarCrearUsuario(sinCorreo)).toThrow('El correo es obligatorio');
  });

  it('deberia lanzar ErrorNegocio cuando el correo tiene formato invalido', () => {
    expect(() => validarCrearUsuario({ ...cuerpoValido, correo: 'no-es-correo' })).toThrow(
      'El correo no tiene un formato valido',
    );
  });

  it('deberia lanzar ErrorNegocio cuando faltan los nombres', () => {
    expect(() => validarCrearUsuario({ ...cuerpoValido, nombres: '   ' })).toThrow(
      'Los nombres son obligatorios',
    );
  });

  it('deberia lanzar ErrorNegocio cuando la contrasena es muy corta', () => {
    expect(() => validarCrearUsuario({ ...cuerpoValido, contrasena: '123' })).toThrow(
      'La contrasena debe tener al menos 8 caracteres',
    );
  });

  it('deberia lanzar ErrorNegocio cuando el rol no es valido', () => {
    expect(() => validarCrearUsuario({ ...cuerpoValido, rol: 'superusuario' })).toThrow(
      /El rol debe ser uno de/,
    );
  });
});
