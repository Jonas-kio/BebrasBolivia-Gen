import cors from 'cors'; 
import express from 'express';

import {
  manejadorErrorHttp,
  manejadorRutaNoEncontrada,
} from './compartido/infraestructura/http/manejador-error-http';
import rutasRol from './rutas/rol-rutas';
import rutasUsuario from './rutas/usuario-rutas';

const app = express();

// CORS: permite al frontend (puerto 3000) conectarse
app.use(cors({
    origin: process.env.URL_CLIENTE ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — Docker lo usa para verificar que el servicio está vivo
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'servicio-usuario' });
});

// Rutas de la API
app.use('/api/v1/roles', rutasRol);
app.use('/api/v1/usuarios', rutasUsuario);

// Manejo de rutas no encontradas (404)
app.use(manejadorRutaNoEncontrada);

// Middleware centralizado de errores HTTP
app.use(manejadorErrorHttp);

// Escuchar en 0.0.0.0 para que funcione dentro de Docker
const PORT = process.env.USER_SERVICE_PORT || 4102;
app.listen(Number(PORT), '0.0.0.0', () => {
    console.warn(`Servidor de usuarios corriendo en el puerto ${PORT}`);
});

export default app;
