<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import ModeToggle from '@/components/ModeToggle.vue'
import { Button } from '@/components/ui/button'

const links = [
  { to: '/', rotulo: 'Início' },
  { to: '/deploy', rotulo: 'Deploy' },
]
</script>

<template>
  <header class="border-b">
    <div class="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
      <span class="truncate font-semibold">Laboratório de Produção</span>

      <nav class="ml-auto flex shrink-0 items-center gap-1">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          v-slot="{ href, navigate, isExactActive }"
          :to="link.to"
          custom
        >
          <Button
            as="a"
            :href="href"
            :variant="isExactActive ? 'secondary' : 'ghost'"
            :aria-current="isExactActive ? 'page' : undefined"
            @click="navigate"
          >
            {{ link.rotulo }}
          </Button>
        </RouterLink>
      </nav>

      <ModeToggle class="shrink-0" />
    </div>
  </header>

  <main class="mx-auto max-w-5xl px-4 py-8">
    <RouterView />
  </main>
</template>
