<script setup lang="ts">
import { ArrowRight, Boxes, Container, Database, FileCode, Globe, Layers, Server } from '@lucide/vue'
import CommandBlock from '@/components/CommandBlock.vue'
import { Badge, type BadgeVariants } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  comandosCompose,
  comandosContainers,
  comandosImagens,
  comparacao,
  equivalencias,
  instrucoesDockerfile,
  servicosCompose,
  type InstrucaoDockerfile,
} from '@/data/docker'

const fluxoDocker = [
  { rotulo: 'Dockerfile', detalhe: 'a receita', icone: FileCode },
  { rotulo: 'Imagem', detalhe: 'o molde, somente leitura', icone: Layers, comando: 'docker build' },
  { rotulo: 'Container', detalhe: 'a instância rodando', icone: Container, comando: 'docker run' },
]

const gruposDocker = [
  { ...comandosImagens, icone: Layers, prefixo: 'docker image …' },
  { ...comandosContainers, icone: Container, prefixo: 'docker container …' },
]

const iconesServico: Record<string, typeof Database> = { postgres: Database, backend: Server, frontend: Globe }

const visualQuando: Record<InstrucaoDockerfile['quando'], { rotulo: string; badge: BadgeVariants['variant'] }> = {
  build: { rotulo: 'build', badge: 'secondary' },
  run: { rotulo: 'run', badge: 'default' },
  doc: { rotulo: 'só doc', badge: 'outline' },
}
</script>

<template>
  <div class="space-y-8">
    <div class="space-y-2">
      <h1 class="text-3xl font-semibold tracking-tight">Docker</h1>
      <p class="max-w-2xl text-muted-foreground">
        Os conceitos e comandos que mais usamos no laboratório. O <strong class="font-medium text-foreground">Docker</strong>
        cuida de uma imagem ou de um container por vez; o
        <strong class="font-medium text-foreground">Docker Compose</strong> orquestra a stack inteira a partir do
        <code class="font-mono text-sm">docker-compose.yml</code>.
      </p>
    </div>

    <Tabs default-value="docker" class="gap-8">
      <TabsList>
        <TabsTrigger value="docker" class="px-3">
          <Container />
          Docker
        </TabsTrigger>
        <TabsTrigger value="compose" class="px-3">
          <Boxes />
          Docker Compose
        </TabsTrigger>
      </TabsList>

      <!-- ===================== Docker ===================== -->
      <TabsContent value="docker" class="space-y-12">
        <section class="space-y-6">
          <div class="space-y-1">
            <h2 class="text-2xl font-semibold tracking-tight">Imagem × container</h2>
            <p class="text-muted-foreground">
              A confusão mais comum: a imagem é o que você constrói; o container é o que você roda.
            </p>
          </div>

          <!-- Fluxo Dockerfile -> imagem -> container -->
          <ol class="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <template v-for="(etapa, indice) in fluxoDocker" :key="etapa.rotulo">
              <li v-if="etapa.comando" class="flex items-center justify-center gap-2 sm:flex-col sm:gap-1" aria-hidden="true">
                <code class="font-mono text-xs text-muted-foreground">{{ etapa.comando }}</code>
                <ArrowRight class="size-4 rotate-90 text-muted-foreground sm:rotate-0" />
              </li>
              <li class="flex flex-1 items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <component :is="etapa.icone" class="size-5" />
                </div>
                <div>
                  <p class="font-medium">
                    <span class="sr-only">{{ indice + 1 }}. </span>{{ etapa.rotulo }}
                    <span v-if="etapa.comando" class="sr-only">(via {{ etapa.comando }})</span>
                  </p>
                  <p class="text-sm text-muted-foreground">{{ etapa.detalhe }}</p>
                </div>
              </li>
            </template>
          </ol>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead class="w-32" />
                    <TableHead>
                      <span class="flex items-center gap-2"><Layers class="size-4" /> Imagem</span>
                    </TableHead>
                    <TableHead>
                      <span class="flex items-center gap-2"><Container class="size-4" /> Container</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="linha in comparacao" :key="linha.aspecto">
                    <TableCell class="font-medium text-muted-foreground">{{ linha.aspecto }}</TableCell>
                    <TableCell class="whitespace-normal">{{ linha.imagem }}</TableCell>
                    <TableCell class="whitespace-normal">{{ linha.container }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        <section class="space-y-6">
          <div class="space-y-1">
            <h2 class="text-2xl font-semibold tracking-tight">Comandos</h2>
            <p class="text-muted-foreground">Separados pelo que manipulam: o molde ou a instância.</p>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <Card v-for="grupo in gruposDocker" :key="grupo.titulo">
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <component :is="grupo.icone" class="size-4" />
                  {{ grupo.titulo }}
                </CardTitle>
                <CardDescription>{{ grupo.descricao }}</CardDescription>
                <CardAction>
                  <Badge variant="outline" class="font-mono">{{ grupo.prefixo }}</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <ul class="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <li v-for="comando in grupo.comandos" :key="comando.cmd">
                    <CommandBlock :comando="comando" />
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section class="space-y-6">
          <div class="space-y-1">
            <h2 class="text-2xl font-semibold tracking-tight">Dockerfile</h2>
            <p class="text-muted-foreground">
              As instruções dos nossos Dockerfiles e em que momento cada uma age: no build da imagem ou quando o container
              sobe.
            </p>
          </div>

          <Card>
            <CardContent>
              <dl class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <div v-for="item in instrucoesDockerfile" :key="item.instrucao" class="flex gap-3">
                  <dt class="flex w-24 shrink-0 flex-col items-start gap-1">
                    <code class="font-mono text-sm font-semibold">{{ item.instrucao }}</code>
                    <Badge :variant="visualQuando[item.quando].badge">{{ visualQuando[item.quando].rotulo }}</Badge>
                  </dt>
                  <dd class="text-muted-foreground">{{ item.descricao }}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <p class="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            <strong class="font-medium text-foreground">RUN × CMD:</strong> o <code class="font-mono">RUN</code> executa uma
            vez, no <code class="font-mono">docker build</code>, e o resultado vira camada da imagem. O
            <code class="font-mono">CMD</code> não executa nada no build: fica gravado na imagem e roda a cada
            <code class="font-mono">docker run</code>.
          </p>
        </section>
      </TabsContent>

      <!-- ===================== Docker Compose ===================== -->
      <TabsContent value="compose" class="space-y-12">
        <section class="space-y-6">
          <div class="space-y-1">
            <h2 class="text-2xl font-semibold tracking-tight">Nossa stack</h2>
            <p class="text-muted-foreground">
              O Compose lê o <code class="font-mono text-sm">docker-compose.yml</code> e, com um comando, cria a rede interna,
              os volumes e um container por serviço. Cada serviço vem de uma imagem pronta ou de um build local.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <Card v-for="servico in servicosCompose" :key="servico.nome">
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <component :is="iconesServico[servico.nome]" class="size-4" />
                  {{ servico.nome }}
                </CardTitle>
                <CardDescription>
                  <code class="font-mono text-xs">{{ servico.origem }}</code>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul class="list-disc space-y-1 pl-4 text-muted-foreground marker:text-muted-foreground/50">
                  <li v-for="detalhe in servico.detalhes" :key="detalhe">{{ detalhe }}</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <p class="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
            <strong class="font-medium text-foreground">Nomes:</strong> o Compose prefixa tudo com o nome da pasta do
            projeto. A imagem do backend vira <code class="font-mono">laboratorio-producao-web-backend</code> e o container,
            <code class="font-mono">laboratorio-producao-web-backend-1</code>. Nos comandos do Compose, basta usar o nome do
            serviço (<code class="font-mono">backend</code>).
          </p>
        </section>

        <section class="space-y-6">
          <div class="space-y-1">
            <h2 class="text-2xl font-semibold tracking-tight">Comandos</h2>
            <p class="text-muted-foreground">Sempre a partir da raiz do repositório, onde está o docker-compose.yml.</p>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <Card v-for="grupo in comandosCompose" :key="grupo.titulo">
              <CardHeader>
                <CardTitle>{{ grupo.titulo }}</CardTitle>
                <CardDescription>{{ grupo.descricao }}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul class="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <li v-for="comando in grupo.comandos" :key="comando.cmd">
                    <CommandBlock :comando="comando" />
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section class="space-y-6">
          <div class="space-y-1">
            <h2 class="text-2xl font-semibold tracking-tight">Docker × Compose</h2>
            <p class="text-muted-foreground">
              A mesma ação nos dois mundos: no Docker você passa flags na mão; no Compose elas já estão no YAML.
            </p>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ação</TableHead>
                    <TableHead>Docker</TableHead>
                    <TableHead>Docker Compose</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="linha in equivalencias" :key="linha.acao">
                    <TableCell class="font-medium">{{ linha.acao }}</TableCell>
                    <TableCell><code class="font-mono text-xs">{{ linha.docker }}</code></TableCell>
                    <TableCell><code class="font-mono text-xs">{{ linha.compose }}</code></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </TabsContent>
    </Tabs>
  </div>
</template>
