import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { sql } from 'drizzle-orm';
import type { Database } from '../db/database.js';

// Valores em centavos.
export interface SalesReport {
  months: number;
  totals: { orders: number; customers: number; revenueCents: number; avgTicketCents: number };
  byMonth: { month: string; orders: number; revenueCents: number }[];
  byCategory: { category: string; orders: number; revenueCents: number }[];
  topProducts: { name: string; category: string; units: number; revenueCents: number }[];
  topCustomers: { name: string; orders: number; revenueCents: number }[];
  generatedAt: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectDrizzle()
    private readonly db: Database,
  ) {}

  // 5 agregações sobre `orders` (varredura da tabela inteira, sem índice em created_at), uma depois da outra.
  // Com o seed de 1M de pedidos leva cerca de 1 s. Popule com `npm run db:seed`.
  async sales(months: number): Promise<SalesReport> {
    const since = sql`now() - make_interval(months => ${months}::int)`;

    const [totals] = (
      await this.db.execute(sql`
        select count(*)::int as orders, count(distinct user_id)::int as customers,
               coalesce(sum(total_cents), 0)::float8 as "revenueCents",
               coalesce(avg(total_cents), 0)::float8 as "avgTicketCents"
        from orders where created_at >= ${since}`)
    ).rows;

    const byMonth = (
      await this.db.execute(sql`
        select to_char(date_trunc('month', created_at), 'YYYY-MM') as month, count(*)::int as orders,
               sum(total_cents)::float8 as "revenueCents"
        from orders where created_at >= ${since} group by 1 order by 1`)
    ).rows;

    const byCategory = (
      await this.db.execute(sql`
        select p.category, count(*)::int as orders, sum(o.total_cents)::float8 as "revenueCents"
        from orders o join products p on p.id = o.product_id
        where o.created_at >= ${since} group by 1 order by 3 desc`)
    ).rows;

    const topProducts = (
      await this.db.execute(sql`
        select p.name, p.category, sum(o.quantity)::int as units, sum(o.total_cents)::float8 as "revenueCents"
        from orders o join products p on p.id = o.product_id
        where o.created_at >= ${since} group by p.id order by 4 desc limit 10`)
    ).rows;

    const topCustomers = (
      await this.db.execute(sql`
        select u.first_name || ' ' || u.last_name || ' #' || u.id as name, count(*)::int as orders,
               sum(o.total_cents)::float8 as "revenueCents"
        from orders o join users u on u.id = o.user_id
        where o.created_at >= ${since} group by u.id order by 3 desc limit 10`)
    ).rows;

    return {
      months,
      totals,
      byMonth,
      byCategory,
      topProducts,
      topCustomers,
      generatedAt: new Date().toISOString(),
    } as SalesReport;
  }
}
