import { Accion, PERMISOS_POR_ROL } from '../../src/shared/permisos';

describe('PERMISOS_POR_ROL', () => {
  describe('administrador', () => {
    const permisos = PERMISOS_POR_ROL.administrador;

    it('deberia poder crear, listar y eliminar usuarios', () => {
      expect(permisos.has(Accion.CREAR_USUARIO)).toBe(true);
      expect(permisos.has(Accion.LISTAR_USUARIOS)).toBe(true);
      expect(permisos.has(Accion.ELIMINAR_USUARIO)).toBe(true);
    });

    it('deberia poder activar y desactivar usuarios', () => {
      expect(permisos.has(Accion.ACTIVAR_DESACTIVAR_USUARIO)).toBe(true);
    });

    it('deberia poder cambiar roles', () => {
      expect(permisos.has(Accion.CAMBIAR_ROL)).toBe(true);
    });

    it('deberia poder gestionar instituciones completamente', () => {
      expect(permisos.has(Accion.CREAR_INSTITUCION)).toBe(true);
      expect(permisos.has(Accion.EDITAR_INSTITUCION)).toBe(true);
      expect(permisos.has(Accion.ELIMINAR_INSTITUCION)).toBe(true);
    });

    it('deberia poder gestionar el banco de preguntas completamente', () => {
      expect(permisos.has(Accion.CREAR_PREGUNTA)).toBe(true);
      expect(permisos.has(Accion.EDITAR_PREGUNTA)).toBe(true);
      expect(permisos.has(Accion.ELIMINAR_PREGUNTA)).toBe(true);
    });

    it('deberia acceder a estadisticas globales y enviar notificaciones masivas', () => {
      expect(permisos.has(Accion.VER_ESTADISTICAS_GLOBALES)).toBe(true);
      expect(permisos.has(Accion.ENVIAR_NOTIFICACION_MASIVA)).toBe(true);
    });

    it('NO deberia poder rendir examenes ni acceder a practica como estudiante', () => {
      expect(permisos.has(Accion.RENDIR_EXAMEN)).toBe(false);
      expect(permisos.has(Accion.ACCEDER_PRACTICA)).toBe(false);
    });
  });

  describe('coordinador', () => {
    const permisos = PERMISOS_POR_ROL.coordinador;

    it('deberia poder crear y listar usuarios (dentro de su institucion)', () => {
      expect(permisos.has(Accion.CREAR_USUARIO)).toBe(true);
      expect(permisos.has(Accion.LISTAR_USUARIOS)).toBe(true);
    });

    it('deberia poder ver su institucion y generar reporte de institucion', () => {
      expect(permisos.has(Accion.VER_INSTITUCION)).toBe(true);
      expect(permisos.has(Accion.VER_REPORTE_INSTITUCION)).toBe(true);
    });

    it('NO deberia poder eliminar usuarios ni cambiar roles', () => {
      expect(permisos.has(Accion.ELIMINAR_USUARIO)).toBe(false);
      expect(permisos.has(Accion.CAMBIAR_ROL)).toBe(false);
    });

    it('NO deberia poder crear, editar o eliminar instituciones', () => {
      expect(permisos.has(Accion.CREAR_INSTITUCION)).toBe(false);
      expect(permisos.has(Accion.EDITAR_INSTITUCION)).toBe(false);
      expect(permisos.has(Accion.ELIMINAR_INSTITUCION)).toBe(false);
    });

    it('NO deberia poder crear o eliminar preguntas', () => {
      expect(permisos.has(Accion.CREAR_PREGUNTA)).toBe(false);
      expect(permisos.has(Accion.ELIMINAR_PREGUNTA)).toBe(false);
    });

    it('NO deberia acceder a estadisticas globales', () => {
      expect(permisos.has(Accion.VER_ESTADISTICAS_GLOBALES)).toBe(false);
    });
  });

  describe('profesor', () => {
    const permisos = PERMISOS_POR_ROL.profesor;

    it('deberia poder ver usuarios y examenes de sus grupos', () => {
      expect(permisos.has(Accion.LISTAR_USUARIOS)).toBe(true);
      expect(permisos.has(Accion.VER_EXAMEN_ASIGNADO)).toBe(true);
    });

    it('deberia poder generar reportes de sus grupos', () => {
      expect(permisos.has(Accion.VER_REPORTE_GRUPO)).toBe(true);
    });

    it('NO deberia poder crear usuarios ni cambiar roles', () => {
      expect(permisos.has(Accion.CREAR_USUARIO)).toBe(false);
      expect(permisos.has(Accion.CAMBIAR_ROL)).toBe(false);
    });

    it('NO deberia poder configurar examenes ni ver estadisticas globales', () => {
      expect(permisos.has(Accion.CONFIGURAR_EXAMEN)).toBe(false);
      expect(permisos.has(Accion.VER_ESTADISTICAS_GLOBALES)).toBe(false);
    });

    it('NO deberia poder eliminar usuarios ni instituciones', () => {
      expect(permisos.has(Accion.ELIMINAR_USUARIO)).toBe(false);
      expect(permisos.has(Accion.ELIMINAR_INSTITUCION)).toBe(false);
    });
  });

  describe('estudiante', () => {
    const permisos = PERMISOS_POR_ROL.estudiante;

    it('deberia poder rendir examenes y acceder a practica', () => {
      expect(permisos.has(Accion.RENDIR_EXAMEN)).toBe(true);
      expect(permisos.has(Accion.ACCEDER_PRACTICA)).toBe(true);
    });

    it('deberia poder ver sus propios resultados y descargar su certificado', () => {
      expect(permisos.has(Accion.VER_RESULTADOS_PROPIOS)).toBe(true);
      expect(permisos.has(Accion.DESCARGAR_CERTIFICADO_PROPIO)).toBe(true);
    });

    it('deberia poder editar solo su propio perfil', () => {
      expect(permisos.has(Accion.EDITAR_USUARIO_PROPIO)).toBe(true);
    });

    it('NO deberia poder crear usuarios, cambiar roles ni ver datos de otros', () => {
      expect(permisos.has(Accion.CREAR_USUARIO)).toBe(false);
      expect(permisos.has(Accion.CAMBIAR_ROL)).toBe(false);
      expect(permisos.has(Accion.LISTAR_USUARIOS)).toBe(false);
    });

    it('NO deberia poder tocar instituciones ni preguntas', () => {
      expect(permisos.has(Accion.CREAR_INSTITUCION)).toBe(false);
      expect(permisos.has(Accion.CREAR_PREGUNTA)).toBe(false);
      expect(permisos.has(Accion.ELIMINAR_PREGUNTA)).toBe(false);
    });

    it('NO deberia acceder a estadisticas globales ni reportes de institucion', () => {
      expect(permisos.has(Accion.VER_ESTADISTICAS_GLOBALES)).toBe(false);
      expect(permisos.has(Accion.VER_REPORTE_INSTITUCION)).toBe(false);
    });
  });
});

