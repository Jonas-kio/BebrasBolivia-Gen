import type { PrismaClient, preguntas } from '@prisma/client';

import baseDeDatos from '../config/base-de-datos';

type ConexionBD = Pick<PrismaClient, 'preguntas'>;

// Ejemplo base: agregar nuevos metodos segun necesidades de cada modulo.
type PreguntaRepositorio = {
  buscarPorId(id: string): Promise<preguntas | null>;
  listarActivas(): Promise<preguntas[]>;
};

export const crearPreguntaRepositorio = (conexionBD: ConexionBD): PreguntaRepositorio => ({
  async buscarPorId(id: string): Promise<preguntas | null> {
    return conexionBD.preguntas.findUnique({ where: { id } });
  },

  async listarActivas(): Promise<preguntas[]> {
    return conexionBD.preguntas.findMany({
      where: { esta_activo: true },
      orderBy: { creado_en: 'desc' },
    });
  },
});

export const preguntaRepositorio = crearPreguntaRepositorio(baseDeDatos);
