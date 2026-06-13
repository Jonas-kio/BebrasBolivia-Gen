import type { PrismaClient } from '@prisma/client';
import type { RequestHandler } from 'express';

import baseDeDatos from '../config/base-de-datos';
import type { UsuarioAutenticado } from '../shared/tipos/usuario-autenticado';
import { ErrorNoAutenticado } from '../utilidades/errores';

type ConexionBD = Pick<PrismaClient, 'usuarios'>;

export const crearResolverIdentidad = (conexionBD: ConexionBD): RequestHandler =>
  async (req, _res, next): Promise<void> => {
    try {
      const idSinProcesar = req.headers['x-usuario-id'];

      if (!idSinProcesar || typeof idSinProcesar !== 'string' || idSinProcesar.trim() === '') {
        next(new ErrorNoAutenticado());
        return;
      }

      const id = idSinProcesar.trim();

      const registro = await conexionBD.usuarios.findUnique({
        where: { id },
        include: {
          coordinadores_institucion: {
            where: { esta_activo: true },
            select: { institucion_id: true },
          },
          profesores: {
            select: {
              profesores_grupos: {
                where: { esta_activo: true },
                select: { grupo_id: true },
              },
            },
          },
        },
      });

      if (!registro || !registro.esta_activo) {
        next(new ErrorNoAutenticado());
        return;
      }

      const usuario: UsuarioAutenticado = {
        id: registro.id,
        rol: registro.rol,
        institucionIds: registro.coordinadores_institucion.map((c) => c.institucion_id),
        grupoIds: registro.profesores?.profesores_grupos.map((g) => g.grupo_id) ?? [],
      };

      req.usuario = usuario;
      next();
    } catch (error) {
      next(error);
    }
  };

export const resolverIdentidad = crearResolverIdentidad(baseDeDatos);
