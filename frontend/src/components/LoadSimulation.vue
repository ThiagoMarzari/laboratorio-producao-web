<script setup lang="ts">
import { Zap } from '@lucide/vue'
import { computed, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'
import { reportsApi } from '@/lib/reports'

interface Disparo {
  id: number
  estado: 'aguardando' | 'ok' | 'erro'
  ms?: number
  status?: number
}

const quantidade = ref(20)
const meses = ref(12)
const disparos = ref<Disparo[]>([])
const rodando = ref(false)
const totalMs = ref<number | null>(null)
// Tempo do GET /health antes de disparar e logo depois: mostra se a API inteira ficou lenta, não só o relatório
const saude = ref<{ antes: number; durante: number } | null>(null)

async function disparar() {
  rodando.value = true
  totalMs.value = null
  saude.value = null
  disparos.value = Array.from({ length: quantidade.value }, (_, i) => ({ id: i + 1, estado: 'aguardando' }))

  try {
    const antes = (await api('GET', '/health')).ms
    const inicio = performance.now()

    // Todas as chamadas saem juntas (o navegador libera ~6 por vez por host; o resto espera na fila dele)
    const todas = disparos.value.map(async (disparo) => {
      try {
        const resposta = await reportsApi.vendas(meses.value)
        disparo.ms = resposta.ms
        disparo.status = resposta.status
        disparo.estado = resposta.ok ? 'ok' : 'erro'
      } catch {
        disparo.estado = 'erro'
      }
    })

    await new Promise((resolve) => setTimeout(resolve, 300))
    const durante = (await api('GET', '/health').catch(() => ({ ms: NaN }))).ms
    saude.value = { antes, durante }

    await Promise.all(todas)
    totalMs.value = Math.round(performance.now() - inicio)
  } finally {
    rodando.value = false
  }
}

const concluidos = computed(() => disparos.value.filter((d) => d.estado !== 'aguardando'))
const erros = computed(() => disparos.value.filter((d) => d.estado === 'erro').length)
const tempos = computed(() => disparos.value.flatMap((d) => (d.estado === 'ok' && d.ms !== undefined ? [d.ms] : [])))
const minimo = computed(() => (tempos.value.length ? Math.min(...tempos.value) : null))
const maximo = computed(() => (tempos.value.length ? Math.max(...tempos.value) : null))
const media = computed(() =>
  tempos.value.length ? Math.round(tempos.value.reduce((a, b) => a + b, 0) / tempos.value.length) : null,
)

const segundos = (ms: number | null) => (ms === null ? '–' : `${(ms / 1000).toFixed(1)} s`)
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Simulação de carga</CardTitle>
      <CardDescription>
        Dispara o mesmo <code class="font-mono">GET /reports/sales</code> várias vezes ao mesmo tempo para ver a API
        engasgar: cada relatório ocupa o Postgres, as conexões do pool acabam e o resto espera na fila.
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <form class="flex flex-wrap items-end gap-4" @submit.prevent="disparar">
        <div class="space-y-2">
          <Label for="quantidade">Requisições simultâneas (1 a 200)</Label>
          <Input id="quantidade" v-model.number="quantidade" type="number" min="1" max="200" class="w-48" />
        </div>
        <div class="space-y-2">
          <Label for="meses-carga">Período (meses)</Label>
          <Input id="meses-carga" v-model.number="meses" type="number" min="1" max="24" class="w-32" />
        </div>
        <Button type="submit" variant="destructive" :disabled="rodando">
          <Zap />
          {{ rodando ? 'Disparando…' : 'Disparar' }}
        </Button>
      </form>

      <template v-if="disparos.length">
        <dl class="grid grid-cols-2 gap-4 md:grid-cols-5">
          <div>
            <dt class="text-sm text-muted-foreground">Concluídas</dt>
            <dd class="text-xl font-semibold">{{ concluidos.length }} / {{ disparos.length }}</dd>
          </div>
          <div>
            <dt class="text-sm text-muted-foreground">Erros</dt>
            <dd class="text-xl font-semibold" :class="{ 'text-destructive': erros > 0 }">{{ erros }}</dd>
          </div>
          <div>
            <dt class="text-sm text-muted-foreground">Mín / média / máx</dt>
            <dd class="text-xl font-semibold">{{ segundos(minimo) }} / {{ segundos(media) }} / {{ segundos(maximo) }}</dd>
          </div>
          <div>
            <dt class="text-sm text-muted-foreground">Tempo total</dt>
            <dd class="text-xl font-semibold">{{ segundos(totalMs) }}</dd>
          </div>
          <div>
            <dt class="text-sm text-muted-foreground">/health antes → durante</dt>
            <dd class="text-xl font-semibold">
              <template v-if="saude">{{ saude.antes }} → {{ Number.isNaN(saude.durante) ? 'falhou' : saude.durante }} ms</template>
              <template v-else>–</template>
            </dd>
          </div>
        </dl>

        <ul class="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2">
          <li
            v-for="disparo in disparos"
            :key="disparo.id"
            class="flex flex-col gap-1 rounded-lg border p-2 text-xs"
            :class="{ 'border-destructive/50': disparo.estado === 'erro' }"
          >
            <span class="flex items-center justify-between font-mono text-muted-foreground">
              #{{ disparo.id }}
              <Badge v-if="disparo.estado === 'ok'" class="bg-emerald-600 px-1.5 text-white dark:bg-emerald-500/20 dark:text-emerald-400">
                {{ disparo.status }}
              </Badge>
              <Badge v-else-if="disparo.estado === 'erro'" variant="destructive" class="px-1.5">
                {{ disparo.status ?? 'rede' }}
              </Badge>
              <Badge v-else variant="outline" class="px-1.5">…</Badge>
            </span>
            <span class="font-mono">{{ disparo.ms !== undefined ? segundos(disparo.ms) : 'aguardando' }}</span>
          </li>
        </ul>
      </template>
    </CardContent>
  </Card>
</template>
