import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed minimo para validar que la BD esta accesible y el esquema aplicado.
  const resultado = await prisma.$queryRaw<Array<{ ahora: Date }>>`SELECT now() as ahora`;
  console.log(
    'Seed ejecutado. Hora de BD:',
    resultado[0]?.ahora?.toISOString?.() ?? resultado[0]?.ahora,
  );
}

main()
  .catch((error) => {
    console.error('Error en seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
