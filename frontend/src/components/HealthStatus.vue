<script setup lang="ts">
import { RefreshCw } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface HealthResponse {
  status: 'ok' | 'error'
  database: 'up' | 'down'
  uptime: number
  timestamp: string
}

// O backend sempre é acessado por /api (o nginx repassa ao container do backend)
const apiUrl = '/api'

const health = ref<HealthResponse | null>(null)
const erro = ref<string | null>(null)
const carregando = ref(false)

async function verificar() {
  carregando.value = true
  erro.value = null
  try {
    const resposta = await fetch(`${apiUrl}/health`)
    // 503 = backend no ar, mas sem o banco: o corpo (HealthResponse) vem dentro de .response
    const corpo = await resposta.json().catch(() => null)
    const dados: HealthResponse | undefined = resposta.ok ? corpo : corpo?.response
    if (!dados) throw new Error(`HTTP ${resposta.status}`)
    health.value = dados
  } catch (e) {
    health.value = null
    erro.value = e instanceof Error ? e.message : String(e)
  } finally {
    carregando.value = false
  }
}

onMounted(verificar)
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        Backend
        <Badge v-if="carregando" variant="outline">verificando…</Badge>
        <Badge
          v-else-if="health?.status === 'ok'"
          class="bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-400"
        >
          online
        </Badge>
        <Badge v-else-if="health" variant="destructive">degradado</Badge>
        <Badge v-else-if="erro" variant="destructive">offline</Badge>
      </CardTitle>
      <CardAction>
        <Button variant="outline" size="sm" :disabled="carregando" @click="verificar">
          <RefreshCw :class="{ 'animate-spin': carregando }" />
          Verificar de novo
        </Button>
      </CardAction>
    </CardHeader>

    <CardContent v-if="health || erro">
      <dl v-if="health" class="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
        <dt class="text-muted-foreground">status</dt>
        <dd>{{ health.status }}</dd>
        <dt class="text-muted-foreground">banco</dt>
        <dd>{{ health.database === 'up' ? 'conectado' : 'sem conexão' }}</dd>
        <dt class="text-muted-foreground">uptime</dt>
        <dd>{{ health.uptime }}s</dd>
        <dt class="text-muted-foreground">timestamp</dt>
        <dd>{{ health.timestamp }}</dd>
      </dl>
      <p v-else class="text-muted-foreground">
        Não foi possível acessar <code class="font-mono">{{ apiUrl }}/health</code> ({{ erro }})
      </p>
    </CardContent>
  </Card>
</template>
