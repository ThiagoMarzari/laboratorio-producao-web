<script setup lang="ts">
import HealthStatus from '@/components/HealthStatus.vue'

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
</script>

<template>
  <main>
    <h1>Laboratório de Produção</h1>
    <p class="subtitulo">
      Espaço de estudos para colocar uma aplicação web em produção: containers, servidor web e deploy.
    </p>

    <HealthStatus />

    <section class="cards">
      <article v-for="item in topicos" :key="item.titulo" class="card">
        <strong class="card-titulo">{{ item.titulo }}</strong>
        <span>{{ item.descricao }}</span>
      </article>
    </section>

    <h2 class="secao">Tópicos avançados</h2>
    <section class="cards">
      <article v-for="item in avancados" :key="item.titulo" class="card">
        <strong class="card-titulo">{{ item.titulo }}</strong>
        <span>{{ item.descricao }}</span>
      </article>
    </section>
  </main>
</template>

<style scoped>
.subtitulo {
  margin-bottom: 1.5rem;
}

.secao {
  margin: 2rem 0 1rem;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
}

.card-titulo {
  font-size: 1.1rem;
  color: var(--color-heading);
}
</style>
