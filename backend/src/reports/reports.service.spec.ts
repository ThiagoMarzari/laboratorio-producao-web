import { getDrizzleToken } from '@nestjs/drizzle';
import { Test } from '@nestjs/testing';
import { ReportsService } from './reports.service.js';

describe('ReportsService', () => {
  it('runs the 5 queries and assembles the report', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce({ rows: [{ orders: 10, customers: 3, revenueCents: 5000, avgTicketCents: 500 }] })
      .mockResolvedValueOnce({ rows: [{ month: '2026-09', orders: 10, revenueCents: 5000 }] })
      .mockResolvedValueOnce({ rows: [{ category: 'Livros', orders: 10, revenueCents: 5000 }] })
      .mockResolvedValueOnce({ rows: [{ name: 'Livros 1', category: 'Livros', units: 20, revenueCents: 5000 }] })
      .mockResolvedValueOnce({ rows: [{ name: 'Ana Silva #1', orders: 4, revenueCents: 2000 }] });
    const module = await Test.createTestingModule({
      providers: [ReportsService, { provide: getDrizzleToken(), useValue: { execute } }],
    }).compile();

    const result = await module.get(ReportsService).sales(6);

    expect(execute).toHaveBeenCalledTimes(5);
    expect(result.months).toBe(6);
    expect(result.totals.orders).toBe(10);
    expect(result.topCustomers[0].name).toBe('Ana Silva #1');
  });
});
