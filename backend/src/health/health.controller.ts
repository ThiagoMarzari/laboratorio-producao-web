import { Controller, Get, Logger, ServiceUnavailableException } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { sql } from 'drizzle-orm';
import type { Database } from '../db/database.js';

export interface HealthResponse {
  status: 'ok' | 'error';
  database: 'up' | 'down';
  uptime: number;
  timestamp: string;
}

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    @InjectDrizzle()
    private readonly db: Database,
  ) {}

  @Get()
  async check(): Promise<HealthResponse> {
    const database = await this.pingDatabase();
    const response: HealthResponse = {
      status: database === 'up' ? 'ok' : 'error',
      database,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };
    // 503 (e não 200) para que healthchecks e balanceadores enxerguem a falha
    if (response.status === 'error') throw new ServiceUnavailableException(response);
    return response;
  }

  private async pingDatabase(): Promise<'up' | 'down'> {
    try {
      await this.db.execute(sql`select 1`);
      return 'up';
    } catch (error) {
      this.logger.error('Falha ao consultar o Postgres', error instanceof Error ? error.stack : error);
      return 'down';
    }
  }
}
