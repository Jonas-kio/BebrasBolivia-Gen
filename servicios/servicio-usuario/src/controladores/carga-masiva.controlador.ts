import { Request, Response } from 'express';

import { CargaMasivaServicio }
from '../servicios/carga-masiva.servicio';

export class CargaMasivaControlador {

  private readonly cargaMasivaServicio:
    CargaMasivaServicio;

  constructor() {

    this.cargaMasivaServicio =
      new CargaMasivaServicio();

  }

  public async cargar(
    req: Request,
    res: Response,
  ): Promise<void> {

    try {

      const archivo =
        (req as Request & {
          file?: Express.Multer.File
        }).file;

      if (!archivo) {

        res.status(400).json({
          mensaje:
            'No se envio ningun archivo',
        });

        return;

      }

      const resultado =
        await this.cargaMasivaServicio
          .procesarArchivo(
            archivo.buffer,
          );

      res.status(200).json(resultado);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        mensaje:
          'Error interno del servidor',

        error:
          error instanceof Error
            ? error.message
            : error,
      });

    }

  }

}