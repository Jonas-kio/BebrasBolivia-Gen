import { rol_usuario } from '@prisma/client';

export interface CambiarRolDto {
    usuarioId: string; 
    nuevoRol: rol_usuario;
}