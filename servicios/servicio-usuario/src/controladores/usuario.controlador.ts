import type { NextFunction, Request, Response } from 'express';

import type { CambiarEstadoUsuarioDto } from '../dtos/cambiar-estado-usuario.dto';
import { UsuarioServicio } from '../servicios/usuario.servicio';

export class UsuarioControlador {
  constructor(private usuarioServicio: UsuarioServicio) {}

  async listar(_req: Request, res: Response, next: NextFunction): Promise<void> {
    const usuarios = await this.usuarioServicio.obtenerUsuarios().catch(next);
    if (usuarios) res.status(200).json(usuarios);
  }

  async cambiarEstadoUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const { estaActivo } = req.body as CambiarEstadoUsuarioDto;
    const resultado = await this.usuarioServicio.cambiarEstadoUsuario(id, estaActivo).catch(next);
    if (resultado) res.status(200).json(resultado);
  }
}
