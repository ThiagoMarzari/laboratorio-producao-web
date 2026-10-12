// Conteúdo da página /docker: comandos e conceitos usados no laboratório.
// Os nomes de imagem/container seguem o padrão do Compose: <pasta do projeto>-<serviço>(-<n>).

export interface Comando {
  cmd: string
  descricao: string
  // Apaga algo que não volta (ex.: volume com os dados do banco)
  perigoso?: boolean
}

export interface GrupoComandos {
  titulo: string
  descricao: string
  comandos: Comando[]
}

export interface Comparacao {
  aspecto: string
  imagem: string
  container: string
}

export interface InstrucaoDockerfile {
  instrucao: string
  quando: 'build' | 'run' | 'doc'
  descricao: string
}

export interface ServicoCompose {
  nome: string
  origem: string
  detalhes: string[]
}

export interface Equivalencia {
  acao: string
  docker: string
  compose: string
}

export const comparacao: Comparacao[] = [
  { aspecto: 'O que é', imagem: 'Um molde: sistema de arquivos + configuração', container: 'Uma instância em execução criada a partir da imagem' },
  { aspecto: 'Analogia', imagem: 'Classe / receita', container: 'Objeto / prato pronto' },
  { aspecto: 'Nasce com', imagem: 'docker build (a partir do Dockerfile)', container: 'docker run (a partir de uma imagem)' },
  { aspecto: 'Muda?', imagem: 'Não: é somente leitura, feita de camadas', container: 'Sim: tem uma camada gravável e um estado' },
  { aspecto: 'Ciclo de vida', imagem: 'Existe até ser removida (docker rmi)', container: 'Criado, rodando, parado, removido' },
  { aspecto: 'Quantos', imagem: 'Uma imagem…', container: '…pode gerar vários containers' },
]

export const comandosImagens: GrupoComandos = {
  titulo: 'Imagens',
  descricao: 'Construir, listar, baixar e limpar os moldes.',
  comandos: [
    { cmd: 'docker build -t laboratorio-backend ./backend', descricao: 'Lê o Dockerfile da pasta e gera uma imagem com a tag informada.' },
    { cmd: 'docker images', descricao: 'Lista as imagens locais com tag e tamanho (o mesmo que docker image ls).' },
    { cmd: 'docker pull postgres:18-alpine', descricao: 'Baixa uma imagem pronta do Docker Hub sem criar container.' },
    { cmd: 'docker history laboratorio-backend', descricao: 'Mostra as camadas da imagem e quanto cada instrução adicionou.' },
    { cmd: 'docker rmi laboratorio-backend', descricao: 'Remove a imagem (falha se algum container ainda a usa).' },
    { cmd: 'docker image prune', descricao: 'Apaga imagens órfãs (<none>) que sobram de builds antigos.' },
  ],
}

export const comandosContainers: GrupoComandos = {
  titulo: 'Containers',
  descricao: 'Rodar, inspecionar, entrar e parar as instâncias.',
  comandos: [
    { cmd: 'docker run -d -p 3000:3000 --name backend laboratorio-backend', descricao: 'Cria e inicia um container em background, publicando a porta 3000.' },
    { cmd: 'docker ps', descricao: 'Lista os containers rodando; com -a inclui os parados.' },
    { cmd: 'docker logs -f backend', descricao: 'Acompanha a saída do processo principal (stdout/stderr).' },
    { cmd: 'docker exec -it backend sh', descricao: 'Abre um shell dentro do container que já está rodando.' },
    { cmd: 'docker stop backend\ndocker start backend', descricao: 'Para (SIGTERM, depois SIGKILL) e inicia de novo o mesmo container.' },
    { cmd: 'docker rm backend', descricao: 'Remove o container parado; a imagem continua lá.' },
  ],
}

export const instrucoesDockerfile: InstrucaoDockerfile[] = [
  { instrucao: 'FROM', quando: 'build', descricao: 'Imagem base. Vários FROM = multi-stage: cada um começa uma imagem limpa.' },
  { instrucao: 'WORKDIR', quando: 'build', descricao: 'Pasta de trabalho dentro da imagem (como um cd).' },
  { instrucao: 'COPY', quando: 'build', descricao: 'Copia arquivos para a imagem; --from=build pega de outro estágio.' },
  { instrucao: 'RUN', quando: 'build', descricao: 'Executa durante o build e grava o resultado numa camada (npm ci, npm run build).' },
  { instrucao: 'ENV', quando: 'build', descricao: 'Variável de ambiente que fica na imagem (NODE_ENV=production).' },
  { instrucao: 'USER', quando: 'run', descricao: 'Usuário que roda o processo do container (node em vez de root).' },
  { instrucao: 'EXPOSE', quando: 'doc', descricao: 'Só documenta a porta; quem publica é -p ou o ports do Compose.' },
  { instrucao: 'CMD', quando: 'run', descricao: 'Comando executado quando o container sobe (node dist/main.js).' },
]

export const servicosCompose: ServicoCompose[] = [
  {
    nome: 'postgres',
    origem: 'image: postgres:18-alpine',
    detalhes: ['Volume pgdata guarda os dados', 'healthcheck com pg_isready', 'Credenciais vindas do .env'],
  },
  {
    nome: 'backend',
    origem: 'build: ./backend',
    detalhes: ['Sem ports: só acessível pela rede interna', 'init: true repassa sinais ao node'],
  },
  {
    nome: 'frontend',
    origem: 'build: ./frontend',
    detalhes: ['nginx publicado em 80:80', 'Proxy de /api para backend:3000', 'depends_on: backend'],
  },
]

export const comandosCompose: GrupoComandos[] = [
  {
    titulo: 'Subir e derrubar',
    descricao: 'O ciclo de vida da stack inteira de uma vez.',
    comandos: [
      { cmd: 'docker compose up -d --build', descricao: 'Builda o que mudou, cria rede/volumes e sobe todos os serviços em background.' },
      { cmd: 'docker compose stop\ndocker compose start', descricao: 'Para e retoma os containers sem removê-los.' },
      { cmd: 'docker compose down', descricao: 'Para e remove containers e a rede. Volumes (dados do banco) ficam.' },
      { cmd: 'docker compose down -v', descricao: 'Também apaga os volumes: o banco volta vazio.', perigoso: true },
    ],
  },
  {
    titulo: 'Acompanhar',
    descricao: 'Ver o estado e a saída dos serviços.',
    comandos: [
      { cmd: 'docker compose ps', descricao: 'Lista os containers do projeto, status, health e portas.' },
      { cmd: 'docker compose logs -f backend', descricao: 'Segue os logs de um serviço; sem nome, mostra todos intercalados.' },
      { cmd: 'docker compose config', descricao: 'Mostra o YAML final com as variáveis do .env já substituídas.' },
    ],
  },
  {
    titulo: 'Um serviço por vez',
    descricao: 'Mexer só no que mudou, pelo nome do serviço.',
    comandos: [
      { cmd: 'docker compose build backend', descricao: 'Reconstrói só a imagem do backend.' },
      { cmd: 'docker compose up -d --build frontend', descricao: 'Rebuilda e recria só o frontend; o resto continua no ar.' },
      { cmd: 'docker compose restart backend', descricao: 'Reinicia o container sem rebuild (não pega código novo).' },
      { cmd: 'docker compose exec backend sh', descricao: 'Abre um shell no container do serviço.' },
      { cmd: 'docker compose exec postgres psql -U app -d laboratorio', descricao: 'Entra no psql do banco usando o usuário do .env.' },
    ],
  },
]

export const equivalencias: Equivalencia[] = [
  { acao: 'Construir imagem', docker: 'docker build -t nome ./pasta', compose: 'docker compose build' },
  { acao: 'Criar e iniciar', docker: 'docker run -d -p 80:80 nome', compose: 'docker compose up -d' },
  { acao: 'Listar', docker: 'docker ps', compose: 'docker compose ps' },
  { acao: 'Ver logs', docker: 'docker logs -f container', compose: 'docker compose logs -f serviço' },
  { acao: 'Entrar', docker: 'docker exec -it container sh', compose: 'docker compose exec serviço sh' },
  { acao: 'Remover', docker: 'docker stop + docker rm', compose: 'docker compose down' },
]
