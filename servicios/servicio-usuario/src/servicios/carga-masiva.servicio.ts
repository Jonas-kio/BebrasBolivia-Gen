import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as XLSX from 'xlsx';

export class CargaMasivaServicio {

  private prisma = new PrismaClient();

  public async procesarArchivo(
    archivo: Buffer,
  ): Promise<unknown> {

    const workbook = XLSX.read(archivo, {
      type: 'buffer',
    });

    const nombreHoja =
      workbook.SheetNames[0];

    const hoja =
      workbook.Sheets[nombreHoja];

    const datos =
      XLSX.utils.sheet_to_json(hoja);

    const columnasRequeridas = [
      'nombres',
      'apellidos',
      'correo',
      'rol',
      'contraseña',
    ];

    if (datos.length === 0) {

      return {
        mensaje: 'El archivo Excel esta vacio',
      };

    }

    const primeraFila =
      datos[0] as Record<string, unknown>;

    const columnasExcel =
      Object.keys(primeraFila);

    const faltantes =
      columnasRequeridas.filter(
        (columna) =>
          !columnasExcel.includes(columna),
      );

    if (faltantes.length > 0) {

      return {
        mensaje:
          'Faltan columnas obligatorias',

        faltantes,
      };

    }

    const errores: string[] = [];

    const rolesPermitidos = [
      'administrador',
      'coordinador',
      'profesor',
      'estudiante',
    ];

    const correos = new Set<string>();

    for (
      const [index, fila]
      of (
        datos as Record<
          string,
          unknown
        >[]
      ).entries()
    ) {

      const numeroFila = index + 2;

      if (
        !fila.nombres ||
        String(fila.nombres).trim() === ''
      ) {

        errores.push(
          `Fila ${numeroFila}: nombres vacio`,
        );

      }

      if (
        !fila.apellidos ||
        String(fila.apellidos).trim() === ''
      ) {

        errores.push(
          `Fila ${numeroFila}: apellidos vacio`,
        );

      }

      if (
        !fila.correo ||
        !String(fila.correo).includes('@')
      ) {

        errores.push(
          `Fila ${numeroFila}: correo invalido`,
        );

      }

      if (
        !rolesPermitidos.includes(
          String(fila.rol),
        )
      ) {

        errores.push(
          `Fila ${numeroFila}: rol invalido`,
        );

      }

      if (
        !fila.contraseña ||
        String(
          fila.contraseña,
        ).length < 6
      ) {

        errores.push(
          `Fila ${numeroFila}: contraseña muy corta`,
        );

      }

      const correo =
        String(fila.correo);

      if (correos.has(correo)) {

        errores.push(
          `Fila ${numeroFila}: correo duplicado`,
        );

      }

      correos.add(correo);

      const usuarioExistente =
        await this.prisma
          .usuarios
          .findUnique({
            where: {
              correo,
            },
          });

      if (usuarioExistente) {

        errores.push(
          `Fila ${numeroFila}: correo ya registrado`,
        );

      }

    }

    if (errores.length > 0) {

      return {
        mensaje:
          'Errores encontrados',

        errores,
      };

    }

    const usuariosGuardados = [];

    for (
      const fila
      of datos as Record<
        string,
        unknown
      >[]
    ) {

      try {

        const contrasenaHash =
          await bcrypt.hash(
            String(
              fila.contraseña,
            ),
            10,
          );

        const usuario =
          await this.prisma
            .usuarios
            .create({
              data: {
                nombres: String(
                  fila.nombres,
                ),

                apellidos: String(
                  fila.apellidos,
                ),

                correo: String(
                  fila.correo,
                ),

                rol: String(
                  fila.rol,
                ) as
                  | 'administrador'
                  | 'coordinador'
                  | 'profesor'
                  | 'estudiante',

                contrasena_hash:
                  contrasenaHash,
              },
            });

        usuariosGuardados.push({
          id: usuario.id,
          correo:
            usuario.correo,
        });

      } catch {

        errores.push(
          `Error guardando usuario ${fila.correo}`,
        );

      }

    }

    return {
      mensaje:
        'Usuarios registrados correctamente',

      totalProcesados:
        datos.length,

      insertados:
        usuariosGuardados.length,

      errores,

      usuarios:
        usuariosGuardados,
    };

  }

}