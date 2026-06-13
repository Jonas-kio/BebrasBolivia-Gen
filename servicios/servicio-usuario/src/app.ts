/**
 * Configuración base de la aplicación Express
 * Inicialización minimalista de middleware y rutas
 */

import express, { type Application } from 'express';

import {
  manejadorErrorHttp,
  manejadorRutaNoEncontrada,
} from './compartido/infraestructura/http/manejador-error-http';

const app: Application = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas básicas (placeholder)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'servicio-usuario' });
});

// Manejo de rutas no encontradas
app.use(manejadorRutaNoEncontrada);

// Middleware centralizado de errores HTTP
app.use(manejadorErrorHttp);

export default app;