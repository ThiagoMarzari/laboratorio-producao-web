import { z } from 'zod';
import type { NewUser } from '../db/schema.js';

export const createUserSchema = z.strictObject({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  isActive: z.boolean().optional(),
}) satisfies z.ZodType<NewUser>; // se o schema da tabela mudar, o TypeScript acusa o zod desatualizado

// PATCH {} passaria (tudo é opcional), mas o Drizzle não monta UPDATE sem campos.
export const updateUserSchema = createUserSchema
  .partial()
  .refine((dto) => Object.keys(dto).length > 0, 'Nenhum campo para atualizar');

export const userIdSchema = z.coerce.number().int().positive();

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
