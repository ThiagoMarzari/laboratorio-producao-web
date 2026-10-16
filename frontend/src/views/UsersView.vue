<script setup lang="ts">
import { Eye, Pencil, Plus, RefreshCw, Save, Search, Trash2, X } from '@lucide/vue'
import { onMounted, reactive, ref } from 'vue'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import LastRequest from '@/components/LastRequest.vue'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { type Resposta } from '@/lib/api'
import { usersApi, type User, type UserInput } from '@/lib/users'

const usuarios = ref<User[]>([])
const ultima = ref<Resposta<unknown> | null>(null)
const erroRede = ref<string | null>(null)
const ocupado = ref(false)

// Faz a chamada, guarda o resultado para o painel "Última requisição" e devolve os dados só se deu certo
async function chamar<T>(requisicao: () => Promise<Resposta<T>>): Promise<T | null> {
  ocupado.value = true
  erroRede.value = null
  try {
    const resposta = await requisicao()
    ultima.value = resposta
    return resposta.ok ? resposta.dados : null
  } catch (e) {
    // fetch só lança quando nem chega resposta HTTP (ex.: dev server parado)
    erroRede.value = e instanceof Error ? e.message : String(e)
    return null
  } finally {
    ocupado.value = false
  }
}

async function listar() {
  const lista = await chamar(usersApi.listar)
  if (lista) usuarios.value = lista
}

// Depois de criar/editar/excluir, a lista é atualizada localmente com a resposta,
// sem um novo GET: assim o painel continua mostrando a resposta da própria ação.
function substituir(user: User) {
  usuarios.value = usuarios.value.map((u) => (u.id === user.id ? user : u))
}

const vazio = (): UserInput => ({ firstName: '', lastName: '', isActive: true })
const form = reactive<UserInput>(vazio())
const editando = ref<User | null>(null)

function editar(user: User) {
  editando.value = user
  Object.assign(form, { firstName: user.firstName, lastName: user.lastName, isActive: user.isActive })
}

function limparForm() {
  editando.value = null
  Object.assign(form, vazio())
}

async function salvar() {
  const input = { ...form }
  const id = editando.value?.id
  if (id === undefined) {
    const criado = await chamar(() => usersApi.criar(input))
    if (!criado) return
    usuarios.value = [...usuarios.value, criado]
  } else {
    const atualizado = await chamar(() => usersApi.atualizar(id, input))
    if (!atualizado) return
    substituir(atualizado)
  }
  limparForm()
}

// PATCH só com o campo que mudou: mostra que o UpdateUserDto aceita atualização parcial
async function alternarAtivo(user: User, isActive: boolean) {
  const atualizado = await chamar(() => usersApi.atualizar(user.id, { isActive }))
  if (atualizado) substituir(atualizado)
}

const ver = (id: number) => chamar(() => usersApi.buscar(id))

// Aceita qualquer texto de propósito, para testar o 400 do ParseIntPipe e o 404 do service
const idBusca = ref('')
function buscarPorId() {
  if (idBusca.value.trim()) chamar(() => usersApi.buscar(idBusca.value.trim()))
}

// paraExcluir não é zerado ao fechar: o texto do diálogo continua certo durante a animação de saída
const paraExcluir = ref<User | null>(null)
const dialogAberto = ref(false)

function pedirExclusao(user: User) {
  paraExcluir.value = user
  dialogAberto.value = true
}

async function confirmarExclusao() {
  const user = paraExcluir.value
  if (!user) return
  const excluido = await chamar(() => usersApi.excluir(user.id))
  dialogAberto.value = false
  if (!excluido) return
  usuarios.value = usuarios.value.filter((u) => u.id !== user.id)
  if (editando.value?.id === user.id) limparForm()
}

onMounted(listar)
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h1 class="text-3xl font-semibold tracking-tight">Usuários</h1>
      <p class="max-w-2xl text-muted-foreground">
        CRUD completo em <code class="font-mono text-sm">/api/users</code>: cada ação chama o backend NestJS, que grava
        no Postgres via Drizzle. A requisição e a resposta aparecem no painel abaixo.
      </p>
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <Card>
        <CardHeader>
          <CardTitle>{{ editando ? `Editando #${editando.id}` : 'Novo usuário' }}</CardTitle>
          <CardDescription>
            <code class="font-mono">{{ editando ? `PATCH /users/${editando.id}` : 'POST /users' }}</code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-4" @submit.prevent="salvar">
            <div class="space-y-2">
              <Label for="firstName">Nome</Label>
              <Input id="firstName" v-model="form.firstName" required autocomplete="off" />
            </div>
            <div class="space-y-2">
              <Label for="lastName">Sobrenome</Label>
              <Input id="lastName" v-model="form.lastName" required autocomplete="off" />
            </div>
            <div class="flex items-center gap-2">
              <Switch id="isActive" v-model="form.isActive" />
              <Label for="isActive">Ativo</Label>
            </div>
            <div class="flex gap-2">
              <Button type="submit" :disabled="ocupado">
                <component :is="editando ? Save : Plus" />
                {{ editando ? 'Salvar' : 'Criar' }}
              </Button>
              <Button v-if="editando" type="button" variant="outline" @click="limparForm">
                <X />
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista</CardTitle>
          <CardDescription><code class="font-mono">GET /users</code></CardDescription>
          <CardAction>
            <Button variant="outline" size="sm" :disabled="ocupado" @click="listar">
              <RefreshCw :class="{ 'animate-spin': ocupado }" />
              Recarregar
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent class="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Ativo</TableHead>
                <TableHead class="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="user in usuarios"
                :key="user.id"
                :data-state="editando?.id === user.id ? 'selected' : undefined"
              >
                <TableCell class="font-mono text-muted-foreground">{{ user.id }}</TableCell>
                <TableCell class="font-medium">{{ user.firstName }} {{ user.lastName }}</TableCell>
                <TableCell>
                  <Switch
                    :model-value="user.isActive"
                    :disabled="ocupado"
                    :aria-label="`Ativar ou desativar ${user.firstName}`"
                    @update:model-value="(ativo: boolean) => alternarAtivo(user, ativo)"
                  />
                </TableCell>
                <TableCell class="text-right">
                  <Button variant="ghost" size="icon-sm" aria-label="Ver (GET /users/:id)" @click="ver(user.id)">
                    <Eye />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Editar" @click="editar(user)">
                    <Pencil />
                  </Button>
                  <Button variant="ghost" size="icon-sm" aria-label="Excluir" @click="pedirExclusao(user)">
                    <Trash2 class="text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
              <TableEmpty v-if="usuarios.length === 0" :colspan="4">
                <span class="text-muted-foreground">Nenhum usuário. Crie um no formulário.</span>
              </TableEmpty>
            </TableBody>
          </Table>

          <form class="flex gap-2" @submit.prevent="buscarPorId">
            <Input v-model="idBusca" placeholder="Buscar por ID (teste 999 ou abc)" aria-label="ID para buscar" />
            <Button type="submit" variant="outline" :disabled="ocupado">
              <Search />
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>

    <LastRequest :ultima="ultima" :erro-rede="erroRede" />

    <AlertDialog v-model:open="dialogAberto">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {{ paraExcluir?.firstName }} {{ paraExcluir?.lastName }}?</AlertDialogTitle>
          <AlertDialogDescription>
            Envia <code class="font-mono">DELETE /users/{{ paraExcluir?.id }}</code>. A linha some do Postgres de vez.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button variant="destructive" :disabled="ocupado" @click="confirmarExclusao">Excluir</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
