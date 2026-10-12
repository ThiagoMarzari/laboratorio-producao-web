<div align="center">

# 🧪 Laboratório de Produção Web

**Um espaço de estudos para colocar uma aplicação web em produção de verdade:**
containers, servidor web, reverse proxy, banco de dados e deploy.

![Vue](https://img.shields.io/badge/Vue_3-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![nginx](https://img.shields.io/badge/nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL_18-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 📑 Sumário

- [Visão geral](#-visão-geral)
- [Arquitetura](#️-arquitetura)
  - [Os containers](#os-containers)
  - [O caminho de uma requisição](#o-caminho-de-uma-requisição)
  - [Rede interna do Docker](#rede-interna-do-docker)
  - [Ordem de inicialização](#ordem-de-inicialização)
  - [Build das imagens](#build-das-imagens)
- [Stack](#-stack)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Como rodar na sua máquina](#-como-rodar-na-sua-máquina)
  - [Com Docker (recomendado)](#opção-1--com-docker-recomendado)
  - [Sem Docker (desenvolvimento)](#opção-2--sem-docker-desenvolvimento)
- [Rotas e endpoints](#-rotas-e-endpoints)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Comandos úteis](#-comandos-úteis)
- [Solução de problemas](#-solução-de-problemas)
- [Estado atual e próximos passos](#-estado-atual-e-próximos-passos)

---

## 🔭 Visão geral

O projeto é um monorepo com duas aplicações e um banco, orquestrados pelo **Docker Compose**:

| Serviço | O que é | Porta no container | Acessível do seu computador? |
|---|---|---|---|
| **frontend** | nginx servindo o build do Vue + reverse proxy para a API | `80` | ✅ sim, em **http://localhost** (porta 80) |
| **backend** | API em NestJS | `3000` | ❌ não, só pela rede interna (via nginx) |
| **postgres** | Banco PostgreSQL 18 | `5432` | ❌ não, só pela rede interna |

> 💡 **A ideia central:** existe **uma única porta de entrada** (o nginx). O navegador nunca fala direto com o backend ou com o banco. Tudo passa pelo nginx, que decide para onde mandar.

---

## 🏗️ Arquitetura

### Os containers

```mermaid
flowchart LR
    user(["👤 Navegador"])

    subgraph host["💻 Seu computador"]
        port["localhost:80"]

        subgraph net["🔒 Rede interna do Docker (laboratorio-producao-web_default)"]
            subgraph fe["📦 frontend (nginx:alpine)"]
                nginx["nginx :80"]
                static[("dist/<br/>HTML · JS · CSS")]
            end

            subgraph be["📦 backend (node:24-alpine)"]
                nest["NestJS :3000"]
            end

            subgraph db["📦 postgres (postgres:18-alpine)"]
                pg[("PostgreSQL :5432")]
            end
        end

        vol[/"💾 volume pgdata"/]
    end

    user -->|"http://localhost"| port
    port -->|"mapeamento 80 → 80"| nginx
    nginx -->|"/  → arquivos estáticos"| static
    nginx -->|"/api/*  → proxy_pass"| nest
    nest -.->|"em breve: DATABASE_URL"| pg
    pg --- vol

    classDef container fill:#f5f7ff,stroke:#5b6ee1,stroke-width:1px,color:#1a1a1a
    classDef storage fill:#fff7e6,stroke:#d4a017,color:#1a1a1a
    class fe,be,db container
    class vol,static storage
```

- **Linha cheia**: conexão que já existe e funciona.
- **Linha tracejada**: planejada. O Postgres já sobe, mas o backend ainda não se conecta a ele (falta escolher o ORM, veja [próximos passos](#-estado-atual-e-próximos-passos)).

### O caminho de uma requisição

Exemplo: a página inicial mostra o card **"Backend online"**. Isso acontece porque o componente `HealthStatus.vue` faz `fetch('/api/health')`:

```mermaid
sequenceDiagram
    autonumber
    participant B as 👤 Navegador
    participant N as nginx (frontend:80)
    participant A as NestJS (backend:3000)

    B->>N: GET http://localhost/
    N-->>B: index.html + JS/CSS (da pasta dist/)

    Note over B: O Vue carrega e o HealthStatus<br/>chama fetch('/api/health')

    B->>N: GET /api/health
    Note over N: location /api/ casa com a URL<br/>proxy_pass troca "/api/" por "/"
    N->>A: GET http://backend:3000/health
    A-->>N: 200 {"status":"ok","uptime":…,"timestamp":…}
    N-->>B: 200 {"status":"ok",…}
```

**Por que `/api` e não `http://localhost:3000`?**

- O `fetch` roda **no navegador**, ou seja, no seu computador, fora do Docker. A porta 3000 do backend não está exposta, então o navegador não alcança o backend diretamente.
- Como `/api` é um caminho relativo, o navegador chama o mesmo endereço de onde veio a página (o nginx). Resultado: **mesma origem, sem CORS e sem URL fixa no código**.

**O detalhe da barra no `proxy_pass`** ([frontend/nginx.conf](frontend/nginx.conf)):

| Configuração | O navegador pede | O backend recebe |
|---|---|---|
| `proxy_pass http://backend:3000;` (sem `/`) | `/api/health` | `/api/health` ❌ 404 |
| `proxy_pass http://backend:3000/;` (com `/`) | `/api/health` | `/health` ✅ |

Com um caminho no final (a `/`), o nginx **substitui** o trecho que casou com o `location` (`/api/`) por esse caminho.

### Rede interna do Docker

```mermaid
flowchart TB
    subgraph mac["💻 Seu computador"]
        browser["Navegador"]
    end

    subgraph docker["🐳 Rede: laboratorio-producao-web_default"]
        dns{{"DNS interno do Docker<br/>127.0.0.11"}}
        frontend["frontend<br/>172.x.x.a"]
        backend["backend<br/>172.x.x.b"]
        postgres["postgres<br/>172.x.x.c"]
    end

    browser -->|"localhost:80 (ports)"| frontend
    frontend -->|"1. qual o IP de 'backend'?"| dns
    dns -->|"2. 172.x.x.b"| frontend
    frontend -->|"3. conecta em :3000"| backend
    backend -.->|"postgres:5432"| postgres
```

- O Compose cria **uma rede privada** para o projeto e conecta todos os serviços nela.
- O **nome do serviço** no `docker-compose.yml` vira um **nome de host**: `backend`, `postgres`, `frontend`.
- Dentro de um container, **`localhost` é o próprio container**. Por isso o nginx usa `http://backend:3000` e não `http://localhost:3000`.
- O `ports:` do compose serve **só** para ligar uma porta do seu computador a um container. Entre containers ele não é necessário.

### Ordem de inicialização

```mermaid
flowchart LR
    pg["postgres"] -->|"healthcheck: pg_isready"| ok{{"healthy ✅"}}
    be["backend"]
    fe["frontend"]
    be -->|"depends_on"| fe

    style ok fill:#e8f7ee,stroke:#2e9e5b,color:#1a1a1a
```

- O **frontend** só sobe depois do **backend** (`depends_on`).
- O **postgres** tem um **healthcheck**: a cada 5s o Docker roda `pg_isready` e marca o container como `healthy` quando o banco aceita conexões.
- Quando o backend passar a usar o banco, ele vai ganhar `depends_on: postgres: condition: service_healthy`, para só subir com o banco pronto.

### Build das imagens

Os dois Dockerfiles usam **multi-stage build**: um estágio pesado compila, e a imagem final leva só o resultado. Cada linha dos Dockerfiles está comentada.

```mermaid
flowchart LR
    subgraph s1["Estágio 1: build (node:24-alpine)"]
        direction TB
        a["COPY package.json + package-lock.json"] --> b["npm ci<br/>(cacheado se as deps não mudaram)"]
        b --> c["COPY código"]
        c --> d["npm run build"]
    end

    subgraph s2["Estágio 2: imagem final"]
        direction TB
        e["COPY --from=build<br/>só o resultado"] --> f["CMD"]
    end

    d -->|"só o build atravessa"| e
    trash["🗑️ código-fonte, ferramentas de dev<br/>ficam para trás"]
    s1 -.-> trash
```

| | [frontend/Dockerfile](frontend/Dockerfile) | [backend/Dockerfile](backend/Dockerfile) |
|---|---|---|
| Estágio `build` | `npm ci` + `npm run build` (type-check + vite build) | `npm ci` + `npm run build` + `npm prune --omit=dev` |
| Base da imagem final | `nginx:alpine` (sem Node) | `node:24-alpine` |
| O que vai para a imagem final | `dist/` + `nginx.conf` | `dist/` + `node_modules` de produção + `package.json` |
| Roda como | nginx | usuário `node` (não root), `NODE_ENV=production` |
| Comando | `nginx -g 'daemon off;'` | `node dist/main.js` |

---

## 🧰 Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | Vue 3 + TypeScript + Vue Router | Vue `^3.5`, Router `^5.3` |
| Build do frontend | Vite | `^8.2` |
| UI do frontend | Tailwind CSS + shadcn-vue (Reka UI, ícones lucide) | Tailwind `^4.3`, shadcn-vue `^2.8` |
| Backend | NestJS (ESM, strict) | `^12.0` |
| Testes do backend | Vitest + Supertest | `^4.1` |
| Lint do backend | oxlint | `^1.58` |
| Servidor web / proxy | nginx | `alpine` |
| Banco | PostgreSQL | `18-alpine` |
| Runtime | Node.js | `24` (`^22.18.0 \|\| >=24.12.0`) |
| Orquestração | Docker Compose | — |

**Gerenciador de pacotes:** **npm** no frontend e no backend (`package-lock.json` em cada um).

---

## 📂 Estrutura de pastas

```text
laboratorio-producao-web/
├── docker-compose.yml        # orquestra postgres, backend e frontend
├── .env.example              # modelo das variáveis (copie para .env)
├── .env                      # credenciais do Postgres (ignorado pelo git)
├── .gitignore
├── README.md
│
├── backend/                  # API NestJS
│   ├── Dockerfile            # multi-stage: build + node dist/main.js como usuário node
│   ├── package.json          # npm
│   ├── src/
│   │   ├── main.ts           # bootstrap: sobe o Nest na porta $PORT ou 3000
│   │   ├── app.module.ts     # módulo raiz
│   │   ├── app.controller.ts # GET /  → "Hello World!"
│   │   └── health/
│   │       ├── health.module.ts
│   │       └── health.controller.ts   # GET /health → status, uptime, timestamp
│   └── test/                 # testes e2e (Vitest + Supertest)
│
└── frontend/                 # SPA Vue 3
    ├── Dockerfile            # multi-stage: build com Node → serve com nginx
    ├── nginx.conf            # arquivos estáticos + fallback SPA + proxy /api
    ├── vite.config.ts        # alias @, Tailwind e proxy /api para o `npm run dev`
    ├── components.json       # configuração do shadcn-vue (usada pelo CLI)
    ├── index.html            # aplica o tema salvo antes do Vue carregar (sem flash)
    ├── package.json          # npm
    └── src/
        ├── App.vue           # layout: barra de navegação + seletor de tema
        ├── assets/main.css   # Tailwind + variáveis de tema (claro/escuro)
        ├── lib/utils.ts      # cn(): junta classes do Tailwind
        ├── router/index.ts   # rotas: /, /deploy e /docker
        ├── data/
        │   ├── roadmap.ts    # fases e etapas do roadmap da Home
        │   └── docker.ts     # conteúdo da página Docker
        ├── views/
        │   ├── HomeView.vue  # página inicial (roadmap + status do backend)
        │   ├── DeployView.vue
        │   └── DockerView.vue # Docker × Compose: imagens, containers e comandos
        └── components/
            ├── CommandBlock.vue   # bloco de comando com botão de copiar
            ├── HealthStatus.vue   # chama /api/health e mostra online/offline
            ├── ModeToggle.vue     # claro / escuro / sistema
            └── ui/                # componentes do shadcn-vue (gerados pelo CLI)
```

---

## 🚀 Como rodar na sua máquina

### Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (ou Docker Engine + plugin Compose)
- Para rodar **sem Docker**: Node.js `24` (ou `^22.18.0`) e npm

### Opção 1 · Com Docker (recomendado)

Sobe tudo (banco, API e frontend) do mesmo jeito que seria em produção.

**1. Crie o arquivo `.env` na raiz do projeto, a partir do modelo:**

```sh
cp .env.example .env
```

Depois abra o `.env` e troque a senha.

> ⚠️ O `.env` contém senha e **não vai para o git**: ele está no `.gitignore` da raiz. Só o `.env.example`, sem senhas reais, é versionado.

**2. Suba os containers:**

```sh
docker compose up --build
```

- `--build` faz o build das imagens de novo, se algo mudou. Sem ele, o Compose reaproveita as imagens antigas.
- Para rodar em segundo plano e liberar o terminal, use `docker compose up --build -d`.

**3. Acesse:**

| O quê | URL |
|---|---|
| 🌐 Aplicação | http://localhost |
| ❤️ Health check da API (via nginx) | http://localhost/api/health |

Se o card na página inicial mostrar **"Backend online"** em verde, o caminho inteiro (navegador → nginx → NestJS) está funcionando.

**4. Confira o estado dos containers:**

```sh
docker compose ps
```

Saída esperada (resumida):

```text
SERVICE    STATUS                    PORTS
backend    Up                        3000/tcp
frontend   Up                        0.0.0.0:80->80/tcp
postgres   Up (healthy)              5432/tcp
```

### Opção 2 · Sem Docker (desenvolvimento)

Útil para desenvolver com **hot reload**: você salva o arquivo e a tela atualiza na hora.

```mermaid
flowchart LR
    browser["Navegador"] -->|"localhost:5173"| vite["Vite dev server"]
    vite -->|"/api/* → proxy do Vite<br/>(remove o /api)"| nest["NestJS<br/>localhost:3000"]
```

O proxy configurado no [vite.config.ts](frontend/vite.config.ts) faz o mesmo papel do nginx: `/api/health` vira `http://localhost:3000/health`. Assim o código do frontend é **igual** nos dois modos.

**Terminal 1: backend**

```sh
cd backend
npm install
npm run start:dev     # http://localhost:3000, reinicia a cada alteração
```

**Terminal 2: frontend**

```sh
cd frontend
npm install
npm run dev           # http://localhost:5173, hot reload
```

> ℹ️ Nesse modo o banco não fica acessível do seu computador, porque o serviço `postgres` não tem `ports`. Quando o backend passar a usar o banco, adicione `ports: ["5432:5432"]` ao `postgres` no compose (ou `"5433:5432"` se já tiver um Postgres instalado localmente).

> ℹ️ Os dois modos podem rodar juntos: o Docker usa a porta **80** e o Vite a **5173** (o backend do Docker não publica a 3000).

---

## 🧭 Rotas e endpoints

### Frontend (Vue Router)

| Rota | Página | Descrição |
|---|---|---|
| `/` | `HomeView` | Roadmap e progresso do projeto + card de status do backend |
| `/deploy` | `DeployView` | Anotações de deploy (carregada sob demanda) |
| `/docker` | `DockerView` | Docker × Docker Compose: imagem vs container, Dockerfile e comandos (carregada sob demanda) |

Como é uma SPA, o nginx usa `try_files $uri /index.html`: qualquer rota que não seja um arquivo real devolve o `index.html`, e o Vue Router decide o que mostrar. É isso que permite dar F5 em `/deploy` sem receber 404.

### Backend (NestJS)

| Método | Rota no backend | Pelo navegador (via nginx) | Resposta |
|---|---|---|---|
| `GET` | `/` | `/api/` | `Hello World!` |
| `GET` | `/health` | `/api/health` | `{ "status": "ok", "uptime": 42, "timestamp": "2026-…" }` |

---

## 🔐 Variáveis de ambiente

Lidas do arquivo `.env` na raiz pelo Docker Compose (`${NOME}` no `docker-compose.yml`):

| Variável | Usada por | Para quê |
|---|---|---|
| `POSTGRES_USER` | postgres | Usuário criado na primeira inicialização do banco |
| `POSTGRES_PASSWORD` | postgres | Senha desse usuário |
| `POSTGRES_DB` | postgres | Banco criado na primeira inicialização |

> ℹ️ O backend também lê `PORT` (padrão `3000`), mas o compose não repassa essa variável: no Docker ele sempre usa a 3000.

> 📌 As variáveis `POSTGRES_*` **só têm efeito na primeira vez** que o volume `pgdata` é criado. Se você mudar a senha depois, precisa recriar o volume (veja `docker compose down -v` abaixo, que **apaga os dados**).

---

## 🛠️ Comandos úteis

Todos rodam **na raiz do projeto** (onde está o `docker-compose.yml`).

### Ciclo de vida

| Comando | O que faz |
|---|---|
| `docker compose up --build` | Faz o build do que mudou e sobe tudo |
| `docker compose up -d --build frontend` | Faz o build e recria só o frontend, em segundo plano |
| `docker compose ps` | Lista os containers do projeto e o status |
| `docker compose stop backend` | Para o backend (o container continua existindo) |
| `docker compose start backend` | Sobe de novo um container parado |
| `docker compose restart frontend` | Reinicia o container (não faz o build de novo) |
| `docker compose down` | Para e **remove** os containers e a rede. Os dados do banco são mantidos |
| `docker compose down -v` | ⚠️ Faz o mesmo **e apaga o volume do banco** (perde todos os dados) |

### Logs e inspeção

| Comando | O que faz |
|---|---|
| `docker compose logs -f` | Acompanha os logs de todos os serviços |
| `docker compose logs -f backend` | Só os logs do backend |
| `docker compose exec frontend sh` | Abre um terminal dentro do container do nginx |
| `docker compose exec frontend wget -qO- http://backend:3000/health` | Testa o backend **pela rede interna** |
| `docker compose exec postgres psql -U app -d laboratorio` | Abre o `psql` no banco |
| `docker network inspect laboratorio-producao-web_default` | Mostra os containers e IPs da rede interna |

### Quando algo estiver estranho (rebuild do zero)

```sh
docker compose down
docker compose build --no-cache
docker compose up
```

### Frontend e backend (fora do Docker)

| Frontend (`cd frontend`) | Backend (`cd backend`) |
|---|---|
| `npm run dev`: Vite com hot reload | `npm run start:dev`: Nest em modo watch |
| `npm run build`: type-check + build de produção | `npm run build`: compila para `dist/` |
| `npm run type-check`: só checa os tipos | `npm test` / `npm run test:e2e`: testes |
| `npm run preview`: serve a `dist/` localmente | `npm run lint`: oxlint |

---

## 🩺 Solução de problemas

<details>
<summary><b>O navegador não abre <code>localhost</code> ("Empty reply" ou "connection refused")</b></summary>

O mapeamento de porta precisa apontar para a porta em que **o nginx escuta (80)**, não para a do Vite:

```yaml
ports:
  - "80:80"   # seu computador:80 → container:80
```

Confira com `docker compose ps`: deve aparecer `0.0.0.0:80->80/tcp`. Se outro programa já usa a porta 80 no seu computador, troque o lado esquerdo (ex.: `"8080:80"`) e acesse `localhost:8080`.
</details>

<details>
<summary><b><code>/api/health</code> retorna 404 com <code>"Cannot GET /api/health"</code></b></summary>

A mensagem vem do **NestJS**, então o nginx alcançou o backend, mas repassou o caminho com `/api`. Falta a `/` no final do `proxy_pass`:

```nginx
location /api/ {
    proxy_pass http://backend:3000/;
}
```

Depois faça o build da imagem de novo: `docker compose up -d --build frontend` (o `nginx.conf` vai dentro da imagem).
</details>

<details>
<summary><b><code>/api/...</code> retorna 502 Bad Gateway</b></summary>

O nginx não conseguiu falar com o backend. Verifique:

1. O backend está rodando? `docker compose ps` e `docker compose logs backend`.
2. O `proxy_pass` usa o **nome do serviço** (`backend`) e não `localhost`.
</details>

<details>
<summary><b>O card mostra "Backend offline"</b></summary>

1. Abra http://localhost/api/health direto no navegador. Se responder `{"status":"ok"}`, o problema está no frontend.
2. O frontend precisa chamar `/api/...`, nunca `http://localhost:3000`. O navegador roda fora do Docker e não alcança o backend diretamente.
3. A imagem pode estar desatualizada: `docker compose up -d --build frontend`.
</details>

<details>
<summary><b>Alterei o código, mas nada mudou</b></summary>

Na Opção 1 (Docker), o código é **copiado para dentro da imagem no build**. Toda alteração exige build de novo:

```sh
docker compose up -d --build
```

Para ver alterações na hora, use a [Opção 2 (sem Docker)](#opção-2--sem-docker-desenvolvimento).
</details>

<details>
<summary><b>Erro <code>Conflict. The container name ... is already in use</code></b></summary>

Normalmente acontece quando dois `docker compose up` rodam ao mesmo tempo (por exemplo, em dois terminais). Rode um de cada vez. Se persistir:

```sh
docker compose down
docker compose up --build
```
</details>

<details>
<summary><b>O <code>npm run build</code> falha com <code>Task not found: "vite"</code></b></summary>

O `run-p` (do `npm-run-all2`) executa **scripts do `package.json` pelo nome**, não comandos soltos. O script `build` precisa chamar o script `build-only`:

```json
"build": "run-p type-check \"build-only {@}\" --",
"build-only": "vite build"
```
</details>

<details>
<summary><b>Mudei a senha no <code>.env</code> e o Postgres não aceita</b></summary>

As variáveis `POSTGRES_*` só são aplicadas quando o banco é criado pela primeira vez. Para recriar (⚠️ **apaga os dados**):

```sh
docker compose down -v
docker compose up -d postgres
```
</details>

---

## 🗺️ Estado atual e próximos passos

```mermaid
flowchart LR
    A["✅ Frontend em produção<br/>(multi-stage + nginx)"] --> B["✅ Reverse proxy /api<br/>(sem CORS)"]
    B --> C["✅ Postgres no compose<br/>(volume + healthcheck)"]
    C --> E["✅ Backend em modo produção<br/>(node dist/main.js)"]
    E --> D["⏳ Backend conectado ao banco<br/>(escolher ORM)"]
    D --> F["🔮 Redis, filas, SSE,<br/>cluster do Node"]

    style A fill:#e8f7ee,stroke:#2e9e5b,color:#1a1a1a
    style B fill:#e8f7ee,stroke:#2e9e5b,color:#1a1a1a
    style C fill:#e8f7ee,stroke:#2e9e5b,color:#1a1a1a
    style D fill:#fff7e6,stroke:#d4a017,color:#1a1a1a
    style E fill:#e8f7ee,stroke:#2e9e5b,color:#1a1a1a
    style F fill:#f3f0ff,stroke:#7c5cdb,color:#1a1a1a
```

### ✅ Pronto

- Frontend com **build de produção**: multi-stage, servido pelo nginx com fallback de SPA.
- Interface com **Tailwind CSS + shadcn-vue**, tema claro/escuro/sistema.
- Backend com **build de produção**: multi-stage, `node dist/main.js` como usuário `node`.
- Containers com `restart: unless-stopped` (voltam sozinhos se caírem ou se a máquina reiniciar).
- **Uma única porta de entrada**: o nginx repassa `/api/*` ao backend pela rede interna.
- Backend e banco **sem portas expostas**.
- **PostgreSQL 18** com dados persistidos em volume e healthcheck.

### ⏳ Pendente

- [ ] **Conectar o backend ao Postgres**: escolher um ORM (Prisma, TypeORM ou Drizzle), passar `DATABASE_URL=postgres://USER:SENHA@postgres:5432/DB` ao backend e adicionar `depends_on: postgres: condition: service_healthy`.
- [x] **Backend em modo produção**: o [backend/Dockerfile](backend/Dockerfile) é multi-stage (`npm ci` + `npm run build` + `npm prune --omit=dev`) e roda `node dist/main.js` como usuário `node`, com `NODE_ENV=production`; no compose, `init: true` e `restart: unless-stopped`.
- [x] **Ajustes no [frontend/Dockerfile](frontend/Dockerfile)**: `package.json` e `package-lock.json` copiados antes do código (cache do `npm ci`), caminho absoluto `/usr/share/nginx/html` e sem `mime.types` customizado (o da imagem do nginx cobre `.woff2`, `.svg`, `.ico`...).
- [ ] **Ambiente de desenvolvimento em Docker** (opcional): um `Dockerfile.dev` com volume montado para hot reload dentro do container.

### 🔮 Tópicos avançados (roadmap de estudo)

Filas · Redis · Pub/Sub do Redis · Server-Sent Events · Workers em tempo real · Cluster do Node · Load balancing com `upstream` no nginx
