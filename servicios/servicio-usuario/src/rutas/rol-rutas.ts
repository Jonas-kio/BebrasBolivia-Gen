import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { manejarErrorNegocio, RolControlador } from 'src/controladores/rol-controlador.js';

import { verificarRol } from '../middlewares/autorizar.js';
import { resolverIdentidad } from '../middlewares/resolver-identidad.js';
import { RolRepositorio } from '../repositorios/rol-repositorio.js';
import { RolServicio } from '../servicios/rol-servicio.js';

const prisma = new PrismaClient();
const rolRepositorio = new RolRepositorio(prisma);
const rolServicio = new RolServicio(rolRepositorio);
const rolControlador = new RolControlador(rolServicio);

const rolRutas: Router = Router();

// GET /api/v1/roles — lista todos los valores del enum rol_usuario
rolRutas.get('/', rolControlador.listarRolesDisponibles);

// GET /api/v1/roles/:rol/usuarios — lista usuarios que tienen ese rol
rolRutas.get('/:rol/usuarios', resolverIdentidad, verificarRol('administrador'), (req, res, next) => {
    void rolControlador.obtenerUsuariosPorRol(req, res, next);
});

// PATCH /api/v1/roles/asignar — cambia el rol de un usuario (basico, sin extensiones)
rolRutas.patch('/asignar', resolverIdentidad, verificarRol('administrador'), (req, res, next) => {
    void rolControlador.cambiarRol(req, res, next);
});

// Middleware de manejo de errores de negocio especifico de este router
rolRutas.use(manejarErrorNegocio);

export default rolRutas;