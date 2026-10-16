import { ReportsController } from './reports.controller.js';
import type { ReportsService } from './reports.service.js';

describe('ReportsController', () => {
  const sales = vi.fn().mockResolvedValue({ months: 6 });
  const controller = new ReportsController({ sales } as unknown as ReportsService);

  it('delegates to the service', async () => {
    await expect(controller.sales(6)).resolves.toEqual({ months: 6 });
    expect(sales).toHaveBeenCalledWith(6);
  });
});
