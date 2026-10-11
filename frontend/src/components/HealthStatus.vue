<script setup lang="ts">
import { onMounted, ref } from 'vue'

interface HealthResponse {
  status: 'ok'
  uptime: number
  timestamp: string
}

// O backend sempre é acessado por /api (o nginx repassa ao container do backend)
const apiUrl = '/api'

const health = ref<HealthResponse | null>(null)
const erro = ref<string | null>(null)
const carregando = ref(false)

async function verificar() {
  carregando.value = true
  erro.value = null
  try {
    const resposta = await fetch(`${apiUrl}/health`)
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`)
    health.value = await resposta.json()
  } catch (e) {
    health.value = null
    erro.value = e instanceof Error ? e.message : String(e)
  } finally {
    carregando.value = false
  }
}

onMounted(verificar)
</script>

<template>
  <section class="health" :class="health ? 'online' : erro ? 'offline' : ''">
    <div class="linha">
      <span class="indicador" />
      <strong>Backend</strong>
      <span v-if="carregando">verificando…</span>
      <span v-else-if="health">online</span>
      <span v-else-if="erro">offline</span>
      <button type="button" :disabled="carregando" @click="verificar">Verificar de novo</button>
    </div>

    <dl v-if="health" class="detalhes">
      <dt>status</dt>
      <dd>{{ health.status }}</dd>
      <dt>uptime</dt>
      <dd>{{ health.uptime }}s</dd>
      <dt>timestamp</dt>
      <dd>{{ health.timestamp }}</dd>
    </dl>
    <p v-else-if="erro" class="detalhes">
      Não foi possível acessar <code>{{ apiUrl }}/health</code> ({{ erro }})
    </p>
  </section>
</template>

<style scoped>
.health {
  --cor-status: var(--color-border-hover);
  padding: 1rem 1.25rem;
  margin-bottom: 2rem;
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--cor-status);
  border-radius: 8px;
  background: var(--color-background-soft);
}

.health.online {
  --cor-status: #2e9e5b;
}

.health.offline {
  --cor-status: #d64545;
}

.linha {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.indicador {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--cor-status);
}

.linha strong {
  color: var(--color-heading);
}

.linha button {
  margin-left: auto;
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--color-border-hover);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
}

.linha button:disabled {
  opacity: 0.5;
  cursor: default;
}

.detalhes {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 1rem;
  margin-top: 0.75rem;
  font-size: 0.9rem;
}

dt {
  color: var(--color-heading);
}
</style>
