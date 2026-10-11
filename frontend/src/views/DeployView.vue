<script setup lang="ts">
const comandos = [
  { rotulo: 'Desenvolvimento (Vite)', cmd: 'docker build -f Dockerfile.dev -t lab-web:dev .\ndocker run -p 5173:5173 lab-web:dev' },
  { rotulo: 'Produção (nginx)', cmd: 'docker build -t lab-web:prod .\ndocker run -p 8080:80 lab-web:prod' },
]
</script>

<template>
  <main>
    <h1>Deploy</h1>
    <p>Anotações práticas de como subir este frontend. Rode a partir de <code>frontend/</code>.</p>

    <section v-for="item in comandos" :key="item.rotulo" class="bloco">
      <h2>{{ item.rotulo }}</h2>
      <pre>{{ item.cmd }}</pre>
    </section>
  </main>
</template>

<style scoped>
.bloco {
  margin-top: 1.5rem;
}

pre {
  margin-top: 0.5rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
  overflow-x: auto;
}
</style>
