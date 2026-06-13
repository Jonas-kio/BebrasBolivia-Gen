import request from 'supertest';

import app from '../../src/app';

describe('Infraestructura - Aplicación Express (Usuario)', () => {
  describe('Configuración base de la aplicación', () => {
    it('debería crear una instancia de aplicación Express válida', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function');
    });

    it('debería responder con 404 para rutas no definidas', async () => {
      await request(app).get('/ruta-inexistente').expect(404);
    });
  });
});
