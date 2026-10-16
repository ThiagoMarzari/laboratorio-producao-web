import { ServiceUnavailableException } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  let healthController: HealthController;
  const db = { execute: vi.fn() };

  beforeEach(async () => {
    db.execute.mockReset();
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: getDrizzleToken(), useValue: db }],
    }).compile();

    healthController = app.get<HealthController>(HealthController);
  });

  it('should return status "ok" when the database answers', async () => {
    db.execute.mockResolvedValue([]);
    const result = await healthController.check();
    expect(result.status).toBe('ok');
    expect(result.database).toBe('up');
  });

  it('should throw 503 when the database is down', async () => {
    db.execute.mockRejectedValue(new Error('connection refused'));
    await expect(healthController.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
