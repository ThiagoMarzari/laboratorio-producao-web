<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const comandos = [
  { rotulo: 'Produção (Docker Compose)', cmd: 'cp .env.example .env\ndocker compose up -d --build\n# http://localhost' },
  { rotulo: 'Desenvolvimento (sem Docker)', cmd: '# terminal 1\ncd backend && npm install && npm run start:dev\n\n# terminal 2\ncd frontend && npm install && npm run dev\n# http://localhost:5173' },
]
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-3xl font-semibold tracking-tight">Deploy</h1>
      <p class="text-muted-foreground">
        Anotações práticas de como subir o projeto. Rode a partir da raiz do repositório.
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
