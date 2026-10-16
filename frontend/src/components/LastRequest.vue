<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { mensagemDeErro, type Resposta } from '@/lib/api'

defineProps<{
  ultima: Resposta<unknown> | null
  erroRede: string | null
}>()

const json = (valor: unknown) => (typeof valor === 'string' ? valor : JSON.stringify(valor, null, 2))
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Última requisição</CardTitle>
      <CardDescription>O que o frontend enviou e o que o backend respondeu.</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <p v-if="erroRede" class="text-destructive">Sem resposta do servidor: {{ erroRede }}</p>
      <p v-else-if="!ultima" class="text-muted-foreground">Nenhuma requisição ainda.</p>

      <template v-if="ultima && !erroRede">
        <div class="flex flex-wrap items-center gap-2">
          <Badge variant="outline" class="font-mono">{{ ultima.metodo }}</Badge>
          <code class="font-mono text-sm break-all">{{ ultima.url }}</code>
          <Badge v-if="ultima.ok" class="bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-400">
            {{ ultima.status }}
          </Badge>
          <Badge v-else variant="destructive">{{ ultima.status }}</Badge>
          <span class="text-sm text-muted-foreground">{{ ultima.ms }} ms</span>
        </div>

        <p v-if="!ultima.ok" class="text-destructive">{{ mensagemDeErro(ultima.dados) }}</p>

        <div class="grid gap-4" :class="{ 'md:grid-cols-2': ultima.corpo !== undefined }">
          <div v-if="ultima.corpo !== undefined" class="min-w-0 space-y-2">
            <h3 class="text-sm font-medium">Corpo enviado</h3>
            <pre class="overflow-x-auto rounded-lg bg-muted p-3 font-mono text-xs">{{ json(ultima.corpo) }}</pre>
          </div>
          <div class="min-w-0 space-y-2">
            <h3 class="text-sm font-medium">Resposta</h3>
            <pre class="max-h-80 overflow-auto rounded-lg bg-muted p-3 font-mono text-xs">{{ json(ultima.dados) }}</pre>
          </div>
        </div>
      </template>
    </CardContent>
  </Card>
</template>
