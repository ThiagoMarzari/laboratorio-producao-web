<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <header class="topbar">
    <span class="brand">Laboratório de Produção</span>

    <nav>
      <RouterLink to="/">Início</RouterLink>
      <RouterLink to="/deploy">Deploy</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 0;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 2rem;
}

.brand {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-heading);
}

nav a {
  display: inline-block;
  padding: 0.25rem 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}
</style>
