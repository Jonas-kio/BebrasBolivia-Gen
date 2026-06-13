import type { PrismaClient, instituciones } from '@prisma/client';

import baseDeDatos from '../config/base-de-datos';

type ConexionBD = Pick<PrismaClient, 'instituciones'>;

// Ejemplo base: agregar nuevos metodos segun necesidades de cada modulo.
type InstitucionRepositorio = {
  buscarPorId(id: string): Promise<instituciones | null>;
  buscarPorCodigo(id: string): Promise<instituciones | null>;
};

export const crearInstitucionRepositorio = (conexionBD: ConexionBD): InstitucionRepositorio => ({
  async buscarPorId(id: string): Promise<instituciones | null> {
    return conexionBD.instituciones.findUnique({ where: { id } });
  },

  async buscarPorCodigo(codigo: string): Promise<instituciones | null> {
    return conexionBD.instituciones.findUnique({ where: { codigo } });
  },
});

export const institucionRepositorio = crearInstitucionRepositorio(baseDeDatos);
