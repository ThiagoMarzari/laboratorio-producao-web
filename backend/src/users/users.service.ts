import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { DrizzleQueryError, eq } from 'drizzle-orm';
import { DatabaseError } from 'pg';
import type { Database } from '../db/database.js';
import { users } from '../db/schema.js';
import type { CreateUserDto, UpdateUserDto } from './users.schemas.js';

// Código do Postgres para violação de foreign key (tabela de códigos: "Appendix A" da doc do Postgres).
const FOREIGN_KEY_VIOLATION = '23503';

@Injectable()
export class UsersService {
  constructor(
    @InjectDrizzle()
    private readonly db: Database,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // returning(): o Postgres devolve a linha inserida (com o id gerado) na mesma query.
    const [user] = await this.db.insert(users).values(createUserDto).returning();
    return user;
  }

  findAll() {
    // Sem order by o Postgres não garante ordem: um UPDATE grava uma versão nova da linha
    // e ela pode "pular" para o fim da lista.
    return this.db.select().from(users).orderBy(users.id);
  }

  async findOne(id: number) {
    const user = await this.db.query.users.findFirst({
      where: { id },
      with: { photos: true },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const [user] = await this.db
      .update(users)
      .set(updateUserDto)
      .where(eq(users.id, id))
      .returning();
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async remove(id: number) {
    try {
      const [user] = await this.db.delete(users).where(eq(users.id, id)).returning();
      if (!user) throw new NotFoundException(`User ${id} not found`);
      return user;
    } catch (error) {
      // Pedidos (orders) e fotos apontam para o usuário: o Postgres recusa o DELETE.
      // O Drizzle embrulha o erro do pg em DrizzleQueryError; o código fica no cause.
      if (
        error instanceof DrizzleQueryError &&
        error.cause instanceof DatabaseError &&
        error.cause.code === FOREIGN_KEY_VIOLATION
      ) {
        throw new ConflictException(`User ${id} tem pedidos ou fotos e não pode ser excluído`);
      }
      throw error;
    }
  }
}
