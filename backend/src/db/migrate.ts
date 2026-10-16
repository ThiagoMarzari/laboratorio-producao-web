// Aplica as migrations de drizzle/ e sai. Roda em prod no CMD do container do backend,
// antes da API subir (o drizzle-kit é devDependency e não existe na imagem final).
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const db = drizzle({ connection: process.env.DATABASE_URL! });

try {
  // Caminho relativo ao WORKDIR do container (/app), para onde o Dockerfile copia drizzle/.
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations aplicadas');
} finally {
  // fecha o pool mesmo em caso de erro; o erro continua propagando e o processo sai com código != 0
  await db.$client.end();
}
