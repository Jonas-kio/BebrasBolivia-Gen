import { Router } from 'express';
import multer from 'multer';

import { CargaMasivaControlador } from '../controladores/carga-masiva.controlador';
import { usuarioControlador } from '../controladores/usuario-controlador';
import { verificarPermiso, verificarRol } from '../middlewares/autorizar';
import { resolverIdentidad } from '../middlewares/resolver-identidad';
import { Accion } from '../shared/permisos';

const usuarioRutas: Router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

const cargaMasivaControlador = new CargaMasivaControlador();

/**
 * Rutas del modulo de usuarios.
 *
 * GET / - Listar usuarios con paginación y filtros (REQ-010)
 * POST / - Crear usuario manualmente (REQ-004)
 * DELETE /:id - Eliminar usuario (REQ-002)
 * GET /:id/rol - Obtener rol del usuario (REQ-008)
 * PATCH /:id/rol - Modificar rol del usuario (REQ-008)
 * POST /carga-masiva - Carga masiva de usuarios (REQ-005)
 */

// GET: Listar usuarios con paginación y filtros (REQ-010) - TU ENDPOINT
usuarioRutas.get('/', (req, res, next) => {
  void usuarioControlador.listar(req, res, next);
});

// POST: Crear usuario manualmente (REQ-004)
usuarioRutas.post(
  '/',
  resolverIdentidad,
  verificarPermiso(Accion.CREAR_USUARIO),
  (req, res, next) => {
    void usuarioControlador.crear(req, res, next);
  },
);

// DELETE: Eliminar usuario (REQ-002)
usuarioRutas.delete('/:id', resolverIdentidad, verificarRol('administrador'), (req, res, next) => {
  void usuarioControlador.eliminar(req, res, next);
});

// GET: Obtener rol de usuario (REQ-008)
usuarioRutas.get('/:id/rol', resolverIdentidad, verificarRol('administrador'), (req, res, next) => {
  void usuarioControlador.obtenerRolUsuario(req, res, next);
});

// PATCH: Activar/desactivar usuario (REQ-006)
usuarioRutas.patch(
  '/:id/estado',
  resolverIdentidad,
  verificarRol('administrador'),
  (req, res, next) => {
    void usuarioControlador.cambiarEstadoUsuario(req, res, next);
  },
);

// PATCH: Modificar rol de usuario (REQ-008)
usuarioRutas.patch(
  '/:id/rol',
  resolverIdentidad,
  verificarRol('administrador'),
  (req, res, next) => {
    void usuarioControlador.modificarRolUsuario(req, res, next);
  },
);

// POST: Carga masiva de usuarios (REQ-005)
usuarioRutas.post('/carga-masiva', upload.single('file'), (req, res) => {
  void cargaMasivaControlador.cargar(req, res);
});

// GET: Mostrar usuarios (extra)
usuarioRutas.get(
  '/:id',

  resolverIdentidad,

  verificarRol('administrador'),

  (req, res, next) => {
    void usuarioControlador.obtener(req, res, next);
  },
);

// PATCH: Modificar datos de un usuario(REQ-001-Editar Perfil de Usuario)
usuarioRutas.patch(
  '/:id',

  resolverIdentidad,

  verificarRol('administrador'),

  (req, res, next) => {
    void usuarioControlador.actualizar(req, res, next);
  },
);

export default usuarioRutas;
