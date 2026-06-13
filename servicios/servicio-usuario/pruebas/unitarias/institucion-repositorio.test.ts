import { crearInstitucionRepositorio } from '../../src/repositorios/institucion-repositorio';

describe('InstitucionRepositorio', () => {
  it('deberia buscar por id', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'i1' });
    const repositorio = crearInstitucionRepositorio({
      instituciones: { findUnique },
    } as never);

    const resultado = await repositorio.buscarPorId('i1');

    expect(findUnique).toHaveBeenCalledWith({ where: { id: 'i1' } });
    expect(resultado).toEqual({ id: 'i1' });
  });

  it('deberia buscar por codigo', async () => {
    const findUnique = jest.fn().mockResolvedValue({ codigo: 'UMSS-01' });
    const repositorio = crearInstitucionRepositorio({
      instituciones: { findUnique },
    } as never);

    const resultado = await repositorio.buscarPorCodigo('UMSS-01');

    expect(findUnique).toHaveBeenCalledWith({ where: { codigo: 'UMSS-01' } });
    expect(resultado).toEqual({ codigo: 'UMSS-01' });
  });
});
