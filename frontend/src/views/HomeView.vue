<script setup lang="ts">
import { Check, Circle, CircleCheck, CircleDot } from '@lucide/vue'
import HealthStatus from '@/components/HealthStatus.vue'
import { Badge, type BadgeVariants } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { fases, statusDaFase, type StatusFase, type StatusItem } from '@/data/roadmap'
import { cn } from '@/lib/utils'

const stack = ['Vue 3', 'NestJS', 'PostgreSQL', 'Docker', 'nginx']

const roadmap = fases.map((fase, indice) => ({
  ...fase,
  numero: indice + 1,
  status: statusDaFase(fase),
  feitos: fase.itens.filter((item) => item.status === 'feito').length,
}))

// Primeira fase ainda não concluída; undefined quando o roadmap inteiro estiver feito
const faseAtual = roadmap.find((fase) => fase.status !== 'concluida')

const itens = fases.flatMap((fase) => fase.itens)
const contar = (status: StatusItem) => itens.filter((item) => item.status === status).length
const percentual = Math.round((contar('feito') / itens.length) * 100)

const resumo = [
  { rotulo: 'Concluídas', valor: contar('feito'), icone: CircleCheck },
  { rotulo: 'Em andamento', valor: contar('fazendo'), icone: CircleDot },
  { rotulo: 'A fazer', valor: contar('pendente'), icone: Circle },
]

const visualFase: Record<StatusFase, { rotulo: string; badge: BadgeVariants['variant'] }> = {
  concluida: { rotulo: 'Concluída', badge: 'secondary' },
  'em-andamento': { rotulo: 'Em andamento', badge: 'default' },
  planejada: { rotulo: 'Planejada', badge: 'outline' },
}

const visualItem: Record<StatusItem, { rotulo: string; icone: typeof Circle; classe: string }> = {
  feito: { rotulo: 'Concluído', icone: CircleCheck, classe: 'text-primary' },
  fazendo: { rotulo: 'Em andamento', icone: CircleDot, classe: 'text-primary animate-pulse' },
  pendente: { rotulo: 'A fazer', icone: Circle, classe: 'text-muted-foreground/60' },
}
</script>

<template>
  <div class="space-y-12">
    <section class="relative isolate space-y-5 pt-4">
      <!-- Grade decorativa que some em direção às bordas -->
      <div
        aria-hidden="true"
        class="absolute -inset-x-4 -top-8 -bottom-6 -z-10 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_70%_90%_at_50%_0%,black,transparent)]"
      />

      <Badge v-if="faseAtual" variant="outline" class="gap-2 bg-background">
        <span class="relative flex size-2">
          <span class="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
          <span class="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        Fase {{ faseAtual.numero }} de {{ roadmap.length }} · {{ faseAtual.titulo }}
      </Badge>

      <h1 class="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Laboratório de Produção</h1>
      <p class="max-w-2xl text-lg text-pretty text-muted-foreground">
        Espaço de estudos para colocar uma aplicação web em produção de verdade: containers, servidor web, banco de dados, deploy
        numa VPS e, depois, tempo real e escala.
      </p>

      <ul class="flex flex-wrap gap-2">
        <li v-for="tecnologia in stack" :key="tecnologia">
          <Badge variant="secondary">{{ tecnologia }}</Badge>
        </li>
      </ul>
    </section>

    <section class="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Progresso geral</CardTitle>
          <CardDescription>{{ contar('feito') }} de {{ itens.length }} etapas concluídas</CardDescription>
          <CardAction>
            <span class="text-3xl font-semibold tracking-tight tabular-nums">{{ percentual }}%</span>
          </CardAction>
        </CardHeader>
        <CardContent class="space-y-4">
          <Progress :model-value="percentual" class="h-2" />
          <div class="grid grid-cols-3 gap-2">
            <div v-for="item in resumo" :key="item.rotulo" class="rounded-lg bg-muted/50 p-3">
              <component :is="item.icone" class="size-4 text-muted-foreground" />
              <p class="mt-2 text-2xl font-semibold tabular-nums">{{ item.valor }}</p>
              <p class="text-xs text-muted-foreground">{{ item.rotulo }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <HealthStatus />
    </section>

    <section class="space-y-6">
      <div class="space-y-1">
        <h2 class="text-2xl font-semibold tracking-tight">Roadmap</h2>
        <p class="text-muted-foreground">O que já foi feito, o que está em andamento e o que vem pela frente.</p>
      </div>

      <ol>
        <li
          v-for="fase in roadmap"
          :key="fase.titulo"
          class="relative grid grid-cols-[2.5rem_1fr] gap-x-4 pb-8 last:pb-0"
        >
          <!-- Linha do tempo ligando as fases -->
          <span
            v-if="fase.numero < roadmap.length"
            aria-hidden="true"
            :class="
              cn(
                'absolute top-10 bottom-0 left-5 w-px -translate-x-1/2',
                fase.status === 'concluida' ? 'bg-primary' : 'bg-border',
              )
            "
          />

          <div
            :class="
              cn('flex size-10 items-center justify-center rounded-full text-sm font-semibold', {
                'bg-primary text-primary-foreground': fase.status === 'concluida',
                'bg-background outline-2 outline-offset-2 outline-primary': fase.status === 'em-andamento',
                'bg-muted text-muted-foreground': fase.status === 'planejada',
              })
            "
          >
            <Check v-if="fase.status === 'concluida'" class="size-5" />
            <template v-else>{{ fase.numero }}</template>
          </div>

          <Card :class="cn(fase.status === 'em-andamento' && 'ring-2 ring-primary/25')">
            <CardHeader>
              <p class="text-xs font-medium tracking-wide text-muted-foreground uppercase">Fase {{ fase.numero }}</p>
              <CardTitle class="text-lg">{{ fase.titulo }}</CardTitle>
              <CardDescription>{{ fase.descricao }}</CardDescription>
              <CardAction>
                <Badge :variant="visualFase[fase.status].badge">
                  {{ visualFase[fase.status].rotulo }} · {{ fase.feitos }}/{{ fase.itens.length }}
                </Badge>
              </CardAction>
            </CardHeader>

            <CardContent>
              <ul class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <li v-for="item in fase.itens" :key="item.titulo" class="flex gap-3">
                  <component
                    :is="visualItem[item.status].icone"
                    aria-hidden="true"
                    :class="cn('mt-0.5 size-4 shrink-0', visualItem[item.status].classe)"
                  />
                  <div class="space-y-0.5">
                    <p class="flex flex-wrap items-center gap-2 leading-snug font-medium">
                      <span class="sr-only">{{ visualItem[item.status].rotulo }}:</span>
                      {{ item.titulo }}
                      <Badge v-if="item.status === 'fazendo'" variant="outline">agora</Badge>
                    </p>
                    <p class="text-muted-foreground">{{ item.descricao }}</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </li>
      </ol>
    </section>
  </div>
</template>
