<script setup lang="ts">
import HealthStatus from '@/components/HealthStatus.vue'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const topicos = [
  { titulo: 'Docker', descricao: 'Imagens, camadas e build multi-stage (Dockerfile e Dockerfile.dev).' },
  { titulo: 'nginx', descricao: 'Servir o build estático, fallback de SPA e cache de assets.' },
  { titulo: 'docker compose', descricao: 'Orquestrar frontend e, no futuro, o backend.' },
  { titulo: 'Ambientes', descricao: 'Diferenças entre desenvolvimento e produção.' },
]

const avancados = [
  { titulo: 'Filas', descricao: 'Processamento assíncrono de tarefas pesadas fora do ciclo da requisição.' },
  { titulo: 'Redis', descricao: 'Cache, estruturas de dados em memória e armazenamento de filas.' },
  { titulo: 'Pub/Sub do Redis', descricao: 'Publicar e assinar canais para distribuir eventos entre processos.' },
  { titulo: 'SSE', descricao: 'Server-Sent Events: servidor enviando atualizações em tempo real ao navegador.' },
  { titulo: 'Tempo real e workers', descricao: 'Workers consumindo a fila e notificando clientes via pub/sub e SSE.' },
  { titulo: 'Cluster do Node', descricao: 'Vários processos Node usando todos os núcleos e compartilhando a porta.' },
]

const secoes = [
  { titulo: 'Tópicos', itens: topicos },
  { titulo: 'Tópicos avançados', itens: avancados },
]
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h1 class="text-3xl font-semibold tracking-tight">Laboratório de Produção</h1>
      <p class="text-muted-foreground">
        Espaço de estudos para colocar uma aplicação web em produção: containers, servidor web e deploy.
      </p>
    </div>

    <HealthStatus />

    <section v-for="secao in secoes" :key="secao.titulo" class="space-y-4">
      <h2 class="text-xl font-semibold tracking-tight">{{ secao.titulo }}</h2>
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card v-for="item in secao.itens" :key="item.titulo">
          <CardHeader>
            <CardTitle>{{ item.titulo }}</CardTitle>
            <CardDescription>{{ item.descricao }}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </section>
  </div>
</template>
