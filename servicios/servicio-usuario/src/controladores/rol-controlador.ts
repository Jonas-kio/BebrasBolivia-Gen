import type { NextFunction, Request, Response } from 'express';

import type { CambiarRolDto } from '../dtos/rol.dto.js';
import { RolServicio } from '../servicios/rol-servicio.js';
import { ErrorNegocio } from '../utilidades/errores.js';

export class RolControlador {
    constructor(private readonly rolServicio: RolServicio) { }

    // GET /api/v1/roles
    listarRolesDisponibles = (_req: Request, res: Response, next: NextFunction): void => {
        try {
            // Ya no es asíncrono porque solo devuelve el ENUM
            const roles = this.rolServicio.listarRolesDisponibles();
            res.status(200).json({ data: roles });
        } catch (error) {
            next(error);
        }
    };

    // GET /api/v1/roles/:rol/usuarios (Ej: /api/v1/roles/profesor/usuarios)
    obtenerUsuariosPorRol = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const rolParam = req.params.rol;
            if (!rolParam) {
                res.status(400).json({ error: 'El parámetro rol en la URL es requerido' });
                return;
            }
            
            const usuarios = await this.rolServicio.obtenerUsuariosDeRol(rolParam);
            res.status(200).json({ data: usuarios });
        } catch (error) {
            next(error);
        }
    };

    // PATCH /api/v1/roles/asignar
    cambiarRol = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const body = req.body as Partial<CambiarRolDto>;
            
            if (!body.usuarioId || !body.nuevoRol) {
                res.status(400).json({ error: 'Los campos usuarioId y nuevoRol son requeridos' });
                return;
            }

            const datos: CambiarRolDto = {
                usuarioId: body.usuarioId,
                nuevoRol: body.nuevoRol,
            };

            const usuarioActualizado = await this.rolServicio.cambiarRol(datos);
            res.status(200).json({ 
                mensaje: 'Rol actualizado correctamente',
                data: usuarioActualizado 
            });
        } catch (error) {
            next(error);
        }
    };
}

export function manejarErrorNegocio(
    error: unknown,
    _req: Request,
    res: Response,
    next: NextFunction,
): void {
    if (error instanceof ErrorNegocio) {
        res.status(error.codigo).json({ error: error.message });
        return;
    }
    next(error);
}