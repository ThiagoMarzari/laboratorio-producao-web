# Dockerfile de produção em 2 estágios: o 1º gera o build do Vue com Node,
# o 2º serve só os arquivos estáticos (dist/) com nginx -> imagem pequena, sem Node.

# ---------- Estágio 1: build ----------
FROM node:24-alpine AS build
WORKDIR /app

# Deps antes do código: se só src/ mudar, o Docker reusa o cache do npm ci.
COPY package.json package-lock.json ./
RUN npm ci

# Copia o resto (o .dockerignore exclui node_modules, dist e .env)
# e gera o build: type-check + vite build -> HTML/CSS/JS estáticos em dist/.
COPY . .
RUN npm run build

# ---------- Estágio 2: nginx ----------
# Imagem limpa só com o nginx; o Node e o node_modules ficam para trás.
FROM nginx:alpine

# Nossa config: serve o SPA e repassa /api para o backend.
# O mime.types (tipos de .js, .css, .woff2, .svg...) já vem completo na imagem.
COPY nginx.conf /etc/nginx/nginx.conf
# Pega só o resultado do build do estágio 1 e põe na pasta que o nginx serve.
COPY --from=build /app/dist /usr/share/nginx/html

# Só documenta a porta; quem publica é o "ports" do docker-compose.yml.
EXPOSE 80
# "daemon off" mantém o nginx em primeiro plano: se ele fosse para o
# background, o container acharia que o processo terminou e pararia.
CMD ["nginx", "-g", "daemon off;"]
