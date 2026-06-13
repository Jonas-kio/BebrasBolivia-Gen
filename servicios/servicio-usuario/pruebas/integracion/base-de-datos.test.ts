import { PrismaClient } from '@prisma/client';

const tieneConfiguracionBD =
  typeof process.env.DATABASE_URL === 'string' &&
  process.env.DATABASE_URL.length > 0 &&
  !process.env.DATABASE_URL.includes('USER:PASSWORD@HOST');

const pruebasBDHabilitadas = process.env.RUN_DB_INTEGRATION_TESTS === 'true';
const describeConBD = tieneConfiguracionBD && pruebasBDHabilitadas ? describe : describe.skip;

describeConBD('Conectividad de base de datos', () => {
  it('deberia conectar y responder un SELECT 1', async () => {
    const prisma = new PrismaClient();

    try {
      const resultados = await prisma.$queryRaw<Array<{ valor: number }>>`SELECT 1 as valor`;
      expect(resultados[0]?.valor).toBe(1);
    } finally {
      await prisma.$disconnect();
    }
  });
});
