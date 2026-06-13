import { PrismaClient, rol_usuario } from '@prisma/client';

export type DatosExtensionRol = {
  grupoId?: string;
  codigo?: string;
  institucionId?: string;
};

export class RolRepositorio {
  constructor(private readonly prisma: PrismaClient) {}

  async obtenerUsuariosPorRol(
    rolBuscado: rol_usuario,
  ): Promise<{ id: string; nombres: string; apellidos: string; correo: string; rol: rol_usuario }[]> {
    return this.prisma.usuarios.findMany({
      where: {
        rol: rolBuscado,
        esta_activo: true,
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        correo: true,
        rol: true,
      },
      orderBy: { nombres: 'asc' },
    });
  }

  async actualizarRolUsuario(
    usuarioId: string,
    nuevoRol: rol_usuario,
  ): Promise<{ id: string; nombres: string; correo: string; rol: rol_usuario }> {
    return this.prisma.usuarios.update({
      where: { id: usuarioId },
      data: {
        rol: nuevoRol,
        actualizado_en: new Date(),
      },
      select: {
        id: true,
        nombres: true,
        correo: true,
        rol: true,
      },
    });
  }

  async verificarUsuarioExiste(usuarioId: string): Promise<{ id: string } | null> {
    return this.prisma.usuarios.findUnique({
      where: { id: usuarioId },
      select: { id: true },
    });
  }

  async obtenerUsuarioConRol(
    usuarioId: string,
  ): Promise<{ id: string; correo: string; rol: rol_usuario } | null> {
    return this.prisma.usuarios.findUnique({
      where: { id: usuarioId, esta_activo: true },
      select: { id: true, correo: true, rol: true },
    });
  }

  async contarAdministradores(): Promise<number> {
    return this.prisma.usuarios.count({
      where: { rol: 'administrador', esta_activo: true },
    });
  }

  async cambiarRolConExtensiones(
    usuarioId: string,
    rolActual: rol_usuario,
    nuevoRol: rol_usuario,
    datosAdicionales: DatosExtensionRol,
  ): Promise<{ id: string; correo: string; rol: rol_usuario }> {
    return this.prisma.$transaction(async (tx) => {
      if (rolActual === 'estudiante') {
        await tx.estudiantes.deleteMany({ where: { usuario_id: usuarioId } });
      } else if (rolActual === 'profesor') {
        await tx.profesores.deleteMany({ where: { usuario_id: usuarioId } });
      }

      if (nuevoRol === 'estudiante') {
        await tx.estudiantes.upsert({
          where: { usuario_id: usuarioId },
          update: {
            grupo_id: datosAdicionales.grupoId ?? null,
            codigo: datosAdicionales.codigo ?? null,
            institucion_id: datosAdicionales.institucionId ?? null,
            actualizado_en: new Date(),
          },
          create: {
            usuario_id: usuarioId,
            grupo_id: datosAdicionales.grupoId ?? null,
            codigo: datosAdicionales.codigo ?? null,
            institucion_id: datosAdicionales.institucionId ?? null,
          },
        });
      } else if (nuevoRol === 'profesor') {
        await tx.profesores.upsert({
          where: { usuario_id: usuarioId },
          update: {
            institucion_id: datosAdicionales.institucionId ?? null,
            actualizado_en: new Date(),
          },
          create: {
            usuario_id: usuarioId,
            institucion_id: datosAdicionales.institucionId ?? null,
          },
        });
      }

      return tx.usuarios.update({
        where: { id: usuarioId },
        data: { rol: nuevoRol, actualizado_en: new Date() },
        select: { id: true, correo: true, rol: true },
      });
    });
  }
}