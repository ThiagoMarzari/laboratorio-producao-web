# Dockerfile de produção em 2 estágios: o 1º compila (cozinha),
# o 2º leva só o resultado (prato pronto) -> imagem menor e mais segura.

# ---------- Estágio 1: build ----------
# FROM: imagem base (Node 24 em Linux Alpine). "AS build" nomeia o estágio.
FROM node:24-alpine AS build
# WORKDIR: pasta de trabalho no container (tipo "cd /app").
WORKDIR /app

# Copia só as deps antes do código: se só src/ mudar, o Docker reusa o cache do npm ci.
COPY package.json package-lock.json ./
# RUN: executa no BUILD. npm ci = instala exatamente o que está no lockfile.
RUN npm ci

# Copia o resto do projeto (o .dockerignore exclui node_modules, dist e .env).
COPY . .
# Compila TS -> JS em dist/ e remove as devDependencies (TypeScript, Nest CLI, vitest...).
RUN npm run build && npm prune --omit=dev

# ---------- Estágio 2: imagem final ----------
# Novo FROM = imagem limpa; nada do estágio 1 vem junto sem COPY --from.
FROM node:24-alpine
WORKDIR /app
# ENV: variável de ambiente; avisa as libs que é produção (mais rápido, menos verboso).
ENV NODE_ENV=production

# --from=build: copia do estágio 1. --chown: dono vira o usuário "node".
# package.json é obrigatório: tem o "type": "module" que o dist/ precisa.
COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
# Migrations SQL geradas pelo drizzle-kit; o dist/db/migrate.js (rodado no CMD) lê daqui.
COPY --from=build --chown=node:node /app/drizzle ./drizzle

# USER: roda como usuário comum em vez de root (mais seguro).
USER node
# EXPOSE: só documenta a porta; quem expõe de fato é o docker-compose.yml.
EXPOSE 3000
# CMD: executa quando o CONTAINER SOBE. Aplica as migrations e, só se der certo (&&), sobe a API.
# Se a migration falhar, o container sai com erro e o restart tenta de novo (a API nunca sobe com schema velho).
# exec: o node da API substitui o sh e vira o PID principal, então recebe o sinal de stop (shutdown limpo).
CMD ["sh", "-c", "node dist/db/migrate.js && exec node dist/main.js"]
