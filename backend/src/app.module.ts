import { Module, StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { DrizzleModule } from '@nestjs/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { relations } from './db/relations.js';
import { HealthModule } from './health/health.module.js';
import { ReportsModule } from './reports/reports.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    // Lê backend/.env no dev; no container as variáveis vêm do compose (não há .env na imagem).
    ConfigModule.forRoot({ isGlobal: true }),
    // forRootAsync: a factory roda depois do ConfigModule carregar o .env.
    // Com forRoot, process.env.DATABASE_URL seria lido no import, antes disso.
    DrizzleModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        drizzle,
        // getOrThrow: sem DATABASE_URL a app nem sobe, em vez de falhar na 1ª query.
        connection: config.getOrThrow<string>('DATABASE_URL'),
        relations,
      }),
    }),
    HealthModule,
    ReportsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Pipe global via APP_PIPE (e não app.useGlobalPipes no main.ts): assim vale também nos testes e2e.
    // Parâmetro sem { schema } no decorator passa direto, sem validação.
    { provide: APP_PIPE, useValue: new StandardSchemaValidationPipe() },
  ],
})
export class AppModule {}
