import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDrizzleToken } from '@nestjs/drizzle';
import { DrizzleQueryError } from 'drizzle-orm';
import { DatabaseError } from 'pg';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;
  // Imita a cadeia db.delete(users).where(...).returning() do Drizzle.
  const returning = vi.fn();
  const db = { delete: () => ({ where: () => ({ returning }) }) };

  beforeEach(async () => {
    returning.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: getDrizzleToken(), useValue: db }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('turns a foreign key violation on delete into 409', async () => {
    const pgError = new DatabaseError('violates foreign key constraint', 0, 'error');
    pgError.code = '23503';
    returning.mockRejectedValue(new DrizzleQueryError('delete from "users" ...', [1], pgError));

    await expect(service.remove(1)).rejects.toBeInstanceOf(ConflictException);
  });

  it('rethrows other database errors', async () => {
    returning.mockRejectedValue(new Error('connection refused'));
    await expect(service.remove(1)).rejects.toThrow('connection refused');
  });
});
