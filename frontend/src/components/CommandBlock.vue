<script setup lang="ts">
import { Check, Copy, TriangleAlert } from '@lucide/vue'
import { useClipboard } from '@vueuse/core'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Comando } from '@/data/docker'
import { cn } from '@/lib/utils'

const props = defineProps<{ comando: Comando }>()

const { copy, copied, isSupported } = useClipboard({ copiedDuring: 1500 })
</script>

<template>
  <div class="space-y-1.5">
    <div
      :class="
        cn(
          'flex items-start gap-2 rounded-md bg-muted py-1 pr-1 pl-3',
          props.comando.perigoso && 'bg-destructive/10 ring-1 ring-destructive/30',
        )
      "
    >
      <pre class="min-w-0 flex-1 overflow-x-auto py-1.5 font-mono text-sm"><code>{{ props.comando.cmd }}</code></pre>
      <Button
        v-if="isSupported"
        variant="ghost"
        size="icon-sm"
        :aria-label="copied ? 'Copiado' : 'Copiar comando'"
        @click="copy(props.comando.cmd)"
      >
        <Check v-if="copied" class="text-primary" />
        <Copy v-else />
      </Button>
    </div>
    <p class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <Badge v-if="props.comando.perigoso" variant="destructive">
        <TriangleAlert />
        cuidado
      </Badge>
      {{ props.comando.descricao }}
    </p>
  </div>
</template>
