<script setup lang="ts">
import { Play } from '@lucide/vue'
import { computed, ref } from 'vue'
import LastRequest from '@/components/LastRequest.vue'
import LoadSimulation from '@/components/LoadSimulation.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { type Resposta } from '@/lib/api'
import { reportsApi, type RelatorioVendas } from '@/lib/reports'

const meses = ref(12)
const relatorio = ref<RelatorioVendas | null>(null)
const ultima = ref<Resposta<unknown> | null>(null)
const erroRede = ref<string | null>(null)
const gerando = ref(false)

// A chamada só volta quando o backend termina de calcular (o botão fica travado enquanto isso)
async function gerar() {
  gerando.value = true
  erroRede.value = null
  try {
    const resposta = await reportsApi.vendas(meses.value)
    ultima.value = resposta
    if (resposta.ok) relatorio.value = resposta.dados
  } catch (e) {
    // fetch só lança quando nem chega resposta HTTP (ex.: dev server parado)
    erroRede.value = e instanceof Error ? e.message : String(e)
  } finally {
    gerando.value = false
  }
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const numero = new Intl.NumberFormat('pt-BR')
const dinheiro = (centavos: number) => brl.format(centavos / 100)
const maiorMes = computed(() => Math.max(1, ...(relatorio.value?.byMonth.map((m) => m.revenueCents) ?? [])))
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h1 class="text-3xl font-semibold tracking-tight">Relatório de vendas</h1>
      <p class="max-w-2xl text-muted-foreground">
        <code class="font-mono text-sm">GET /api/reports/sales</code> faz 5 agregações no Postgres sobre a tabela
        <code class="font-mono text-sm">orders</code> e responde quando termina. Popule o banco com
        <code class="font-mono text-sm">npm run db:seed</code> (no backend).
      </p>
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Gerar relatório</CardTitle>
        <CardDescription><code class="font-mono">GET /reports/sales?months={{ meses }}</code></CardDescription>
      </CardHeader>
      <CardContent>
        <form class="flex flex-wrap items-end gap-2" @submit.prevent="gerar">
          <div class="space-y-2">
            <Label for="meses">Período (meses, 1 a 24)</Label>
            <Input id="meses" v-model.number="meses" type="number" min="1" max="24" class="w-40" />
          </div>
          <Button type="submit" :disabled="gerando">
            <Play />
            {{ gerando ? 'Gerando…' : 'Gerar' }}
          </Button>
        </form>
      </CardContent>
    </Card>

    <Card v-if="relatorio">
      <CardHeader>
        <CardTitle>Vendas dos últimos {{ relatorio.months }} meses</CardTitle>
        <CardDescription>Gerado em {{ new Date(relatorio.generatedAt).toLocaleString('pt-BR') }}</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-6">
          <dl class="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <dt class="text-sm text-muted-foreground">Faturamento</dt>
              <dd class="text-xl font-semibold">{{ dinheiro(relatorio.totals.revenueCents) }}</dd>
            </div>
            <div>
              <dt class="text-sm text-muted-foreground">Pedidos</dt>
              <dd class="text-xl font-semibold">{{ numero.format(relatorio.totals.orders) }}</dd>
            </div>
            <div>
              <dt class="text-sm text-muted-foreground">Ticket médio</dt>
              <dd class="text-xl font-semibold">{{ dinheiro(relatorio.totals.avgTicketCents) }}</dd>
            </div>
            <div>
              <dt class="text-sm text-muted-foreground">Clientes</dt>
              <dd class="text-xl font-semibold">{{ numero.format(relatorio.totals.customers) }}</dd>
            </div>
          </dl>

          <div class="space-y-2">
            <h3 class="text-sm font-medium">Faturamento por mês</h3>
            <ul class="space-y-1">
              <li v-for="mes in relatorio.byMonth" :key="mes.month" class="flex items-center gap-3 text-sm">
                <span class="w-16 font-mono text-muted-foreground">{{ mes.month }}</span>
                <Progress :model-value="(mes.revenueCents / maiorMes) * 100" :aria-label="`Faturamento de ${mes.month}`" />
                <span class="w-32 text-right font-mono">{{ dinheiro(mes.revenueCents) }}</span>
              </li>
            </ul>
          </div>

          <div class="grid gap-6 md:grid-cols-3">
            <div class="min-w-0 space-y-2">
              <h3 class="text-sm font-medium">Por categoria</h3>
              <Table>
                <TableBody>
                  <TableRow v-for="c in relatorio.byCategory" :key="c.category">
                    <TableCell>{{ c.category }}</TableCell>
                    <TableCell class="text-right font-mono">{{ dinheiro(c.revenueCents) }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div class="min-w-0 space-y-2">
              <h3 class="text-sm font-medium">Top 10 produtos</h3>
              <Table>
                <TableBody>
                  <TableRow v-for="p in relatorio.topProducts" :key="p.name">
                    <TableCell>{{ p.name }}</TableCell>
                    <TableCell class="text-right font-mono">{{ dinheiro(p.revenueCents) }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <div class="min-w-0 space-y-2">
              <h3 class="text-sm font-medium">Top 10 clientes</h3>
              <Table>
                <TableBody>
                  <TableRow v-for="c in relatorio.topCustomers" :key="c.name">
                    <TableCell>{{ c.name }}</TableCell>
                    <TableCell class="text-right font-mono">{{ dinheiro(c.revenueCents) }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <LoadSimulation />

    <LastRequest :ultima="ultima" :erro-rede="erroRede" />
  </div>
</template>
