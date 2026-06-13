import { crearPreguntaRepositorio } from '../../src/repositorios/pregunta-repositorio';

describe('PreguntaRepositorio', () => {
  it('deberia buscar por id', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'p1' });
    const repositorio = crearPreguntaRepositorio({
      preguntas: { findUnique, findMany: jest.fn() },
    } as never);

    const resultado = await repositorio.buscarPorId('p1');

    expect(findUnique).toHaveBeenCalledWith({ where: { id: 'p1' } });
    expect(resultado).toEqual({ id: 'p1' });
  });

  it('deberia listar preguntas activas', async () => {
    const findMany = jest.fn().mockResolvedValue([{ id: 'p1' }]);
    const repositorio = crearPreguntaRepositorio({
      preguntas: { findUnique: jest.fn(), findMany },
    } as never);

    const resultado = await repositorio.listarActivas();

    expect(findMany).toHaveBeenCalledWith({
      where: { esta_activo: true },
      orderBy: { creado_en: 'desc' },
    });
    expect(resultado).toEqual([{ id: 'p1' }]);
  });
});
