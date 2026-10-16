// Popula o banco com dados de venda para os relatórios terem o que processar.
// Uso (precisa do postgres no ar): npm run db:seed        (SEED_ORDERS=2000000 npm run db:seed para mais)
// Idempotente: apaga e recria products/orders; só completa os users até SEED_USERS.
// Tudo é gerado dentro do Postgres com generate_series: milhões de linhas em segundos, sem trafegar dados.
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

const totalUsers = Number(process.env.SEED_USERS ?? 500);
const totalOrders = Number(process.env.SEED_ORDERS ?? 1_000_000);

const db = drizzle({ connection: process.env.DATABASE_URL! });

try {
  await db.execute(sql`
    insert into users (first_name, last_name, is_active)
    select
      (array['Ana','Bruno','Carla','Diego','Elisa','Fábio','Gabriela','Hugo','Inês','João'])[1 + floor(random() * 10)::int],
      (array['Silva','Souza','Lima','Costa','Pereira','Alves','Rocha','Dias','Nunes','Melo'])[1 + floor(random() * 10)::int],
      random() > 0.1
    from generate_series(1, greatest(${totalUsers} - (select count(*) from users), 0)::int)
  `);

  await db.execute(sql`truncate orders, products restart identity cascade`);

  await db.execute(sql`
    insert into products (name, category, price_cents)
    select
      c.category || ' ' || g,
      c.category,
      (990 + floor(random() * 49000))::int
    from generate_series(1, 15) g
    cross join (values ('Eletrônicos'), ('Livros'), ('Casa'), ('Moda'), ('Esportes'), ('Brinquedos')) as c(category)
  `);

  // Sorteia o usuário e o produto por posição (row_number) e junta: uma passada, sem subquery por linha.
  await db.execute(sql`
    with u as (select id, row_number() over (order by id) rn from users),
         p as (select id, price_cents, row_number() over (order by id) rn from products),
         gen as (
           select
             1 + floor(random() * (select count(*) from users))::int as urn,
             1 + floor(random() * (select count(*) from products))::int as prn,
             1 + floor(random() * 5)::int as quantity,
             now() - random() * interval '730 days' as created_at
           from generate_series(1, ${totalOrders}::int)
         )
    insert into orders (user_id, product_id, quantity, total_cents, created_at)
    select u.id, p.id, gen.quantity, gen.quantity * p.price_cents, gen.created_at
    from gen join u on u.rn = gen.urn join p on p.rn = gen.prn
  `);

  await db.execute(sql`analyze orders`);
  console.log(`Seed ok: ${totalUsers} users (mínimo), 90 produtos, ${totalOrders} pedidos`);
} finally {
  await db.$client.end();
}
