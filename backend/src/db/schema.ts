import { boolean, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const photos = pgTable('photos', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  url: text().notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
});

export const products = pgTable('products', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  category: text().notNull(),
  priceCents: integer('price_cents').notNull(),
});

export type Product = typeof products.$inferSelect;

// Base dos relatórios de vendas. Sem índice em created_at de propósito: o relatório varre a
// tabela inteira, que é o que torna o trabalho realmente pesado (popule com `npm run db:seed`).
export const orders = pgTable(
  'orders',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id),
    quantity: integer().notNull(),
    totalCents: integer('total_cents').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('orders_user_id_idx').on(t.userId), index('orders_product_id_idx').on(t.productId)],
);

export type Order = typeof orders.$inferSelect;
