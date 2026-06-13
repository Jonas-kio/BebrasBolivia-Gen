import request from 'supertest';

import app from '../../src/app';

describe('Infraestructura del servicio', () => {
  it('debe responder en ruta /health', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);
    
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'servicio-usuario');
  });

  it('debe retornar 404 en ruta inexistente', async () => {
    await request(app)
      .get('/ruta-que-no-existe')
      .expect(404);
  });
});