import app from './app';

// Escuchar en 0.0.0.0 para que funcione dentro de Docker
const PORT = process.env.USER_SERVICE_PORT || 4102;
app.listen(Number(PORT), '0.0.0.0', () => {
    console.warn(`Servidor de usuarios corriendo en el puerto ${PORT}`);
});

