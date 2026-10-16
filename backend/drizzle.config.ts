import { existsSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

// O drizzle-kit não lê .env sozinho; loadEnvFile é nativo do Node (sem dotenv).
// Só se o arquivo existir: generate e check não usam o banco e podem rodar sem .env (ex.: num CI).
if (existsSync('.env')) process.loadEnvFile();

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
