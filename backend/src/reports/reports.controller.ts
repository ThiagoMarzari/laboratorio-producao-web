import { Controller, Get, Query } from '@nestjs/common';
import { z } from 'zod';
import { ReportsService } from './reports.service.js';

export const monthsSchema = z.coerce.number().int().min(1).max(24).default(12);

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Gera na hora e responde só quando termina (síncrono).
  @Get('sales')
  sales(@Query('months', { schema: monthsSchema }) months: number) {
    return this.reportsService.sales(months);
  }
}
