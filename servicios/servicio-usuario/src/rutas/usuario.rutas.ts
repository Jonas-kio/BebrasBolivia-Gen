import { Router } from 'express';
import multer from 'multer';

import { CargaMasivaControlador }
from '../controladores/carga-masiva.controlador';
import { UsuarioControlador }
from '../controladores/usuario.controlador';
import { verificarPermiso }
from '../middlewares/autorizar';
import { UsuarioRepositorioMock }
from '../repositorios/usuario.repositorio.mock';
import { UsuarioServicio }
from '../servicios/usuario.servicio';
import { Accion }
from '../shared/permisos';

const router = Router();

/*
|--------------------------------------------------------------------------
| CONFIGURACION MULTER
|--------------------------------------------------------------------------
*/

const upload = multer({
  storage: multer.memoryStorage(),
});

/*
|--------------------------------------------------------------------------
| DEPENDENCIAS USUARIO
|--------------------------------------------------------------------------
*/

const usuarioRepositorio =
  new UsuarioRepositorioMock();

const usuarioServicio =
  new UsuarioServicio(
    usuarioRepositorio,
  );

const usuarioControlador =
  new UsuarioControlador(
    usuarioServicio,
  );

/*
|--------------------------------------------------------------------------
| CONTROLADOR CARGA MASIVA
|--------------------------------------------------------------------------
*/

const cargaMasivaControlador =
  new CargaMasivaControlador();

/*
|--------------------------------------------------------------------------
| RUTAS USUARIO
|--------------------------------------------------------------------------
*/

router.get(
  '/',
  (req, res, next) => {

    void usuarioControlador.listar(
      req,
      res,
      next,
    );

  },
);

router.patch(
  '/:id/estado',

  verificarPermiso(
    Accion.ACTIVAR_DESACTIVAR_USUARIO,
  ),

  (req, res, next) => {

    void usuarioControlador
      .cambiarEstadoUsuario(
        req,
        res,
        next,
      );

  },
);

/*
|--------------------------------------------------------------------------
| CARGA MASIVA
|--------------------------------------------------------------------------
*/

router.post(
  '/carga-masiva',

  upload.single('file'),

  (req, res) => {

    void cargaMasivaControlador.cargar(
      req,
      res,
    );

  },
);

router.post(
  '/carga-masiva',
  upload.single('file'),
  (req, res) => {
    void cargaMasivaControlador.cargar(req, res);
  },
);

export default router;