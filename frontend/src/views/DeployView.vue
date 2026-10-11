<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const comandos = [
  { rotulo: 'Desenvolvimento (Vite)', cmd: 'docker build -f Dockerfile.dev -t lab-web:dev .\ndocker run -p 5173:5173 lab-web:dev' },
  { rotulo: 'Produção (nginx)', cmd: 'docker build -t lab-web:prod .\ndocker run -p 8080:80 lab-web:prod' },
]
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-3xl font-semibold tracking-tight">Deploy</h1>
      <p class="text-muted-foreground">
        Anotações práticas de como subir este frontend. Rode a partir de
        <code class="rounded bg-muted px-1 py-0.5 font-mono text-sm">frontend/</code>.
      </p>
    </div>

    <Card v-for="item in comandos" :key="item.rotulo">
      <CardHeader>
        <CardTitle>{{ item.rotulo }}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre class="overflow-x-auto rounded-md bg-muted p-4 font-mono text-sm">{{ item.cmd }}</pre>
      </CardContent>
    </Card>
  </div>
</template>
