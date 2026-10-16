// Roadmap do laboratório: para atualizar a Home, basta mudar o `status` dos itens aqui.
// O status de cada fase e o progresso geral são calculados a partir dos itens.

export type StatusItem = 'feito' | 'fazendo' | 'pendente'
export type StatusFase = 'concluida' | 'em-andamento' | 'planejada'

export interface ItemRoadmap {
  titulo: string
  descricao: string
  status: StatusItem
}

export interface FaseRoadmap {
  titulo: string
  descricao: string
  itens: ItemRoadmap[]
}

export const fases: FaseRoadmap[] = [
  {
    titulo: 'Fundação',
    descricao: 'Esqueleto do projeto: frontend, backend e a base visual.',
    itens: [
      { titulo: 'Monorepo', descricao: 'frontend/ e backend/ no mesmo repositório, com .env.example.', status: 'feito' },
      { titulo: 'Frontend Vue 3', descricao: 'Vite + TypeScript, rotas com lazy-loading.', status: 'feito' },
      { titulo: 'UI com shadcn-vue', descricao: 'Tailwind v4, tema claro/escuro sem flash, fonte Geist.', status: 'feito' },
      { titulo: 'Backend NestJS', descricao: 'Projeto ESM em strict mode com GET /health.', status: 'feito' },
    ],
  },
  {
    titulo: 'Containers',
    descricao: 'Tudo rodando em produção localmente com Docker Compose.',
    itens: [
      { titulo: 'Imagem do frontend', descricao: 'Build multi-stage: npm ci + build, depois nginx servindo dist/.', status: 'feito' },
      { titulo: 'Imagem do backend', descricao: 'Build multi-stage com npm prune, rodando como usuário node.', status: 'feito' },
      { titulo: 'nginx como porta de entrada', descricao: 'Fallback de SPA e proxy de /api para o backend.', status: 'feito' },
      { titulo: 'Rede interna', descricao: 'Backend sem porta publicada: só o nginx o alcança.', status: 'feito' },
      { titulo: 'Compose resiliente', descricao: 'restart: unless-stopped, init: true e Postgres com healthcheck.', status: 'feito' },
    ],
  },
  {
    titulo: 'Dados',
    descricao: 'Ligar o backend ao Postgres que já está no compose.',
    itens: [
      { titulo: 'ORM', descricao: 'Drizzle ORM no NestJS com @nestjs/drizzle.', status: 'feito' },
      { titulo: 'Conexão com o Postgres', descricao: 'NestJS lendo a DATABASE_URL do .env via ConfigModule.', status: 'feito' },
      { titulo: 'Migrations', descricao: 'Schema versionado e aplicado a cada start do backend, antes da API subir.', status: 'feito' },
      { titulo: 'Health do banco', descricao: '/health roda select 1 no Postgres e responde 503 se o banco cair.', status: 'feito' },
    ],
  },
  {
    titulo: 'Deploy na VPS',
    descricao: 'Colocar a aplicação no ar numa VPS Oracle Cloud Always Free (ARM).',
    itens: [
      { titulo: 'Criar a VPS', descricao: 'Instância Ampere A1 com Docker instalado.', status: 'pendente' },
      { titulo: 'Firewall', descricao: 'Security list da VCN + iptables da instância liberando 80/443.', status: 'pendente' },
      { titulo: 'Segredos', descricao: '.env na VPS, fora do repositório.', status: 'pendente' },
      { titulo: 'HTTPS', descricao: 'Certificado com Caddy ou Cloudflare Tunnel.', status: 'pendente' },
      { titulo: 'Cache e compressão', descricao: 'gzip e cache longo para os assets com hash no nginx.', status: 'pendente' },
      { titulo: 'Backup do banco', descricao: 'Rotina de backup do volume pgdata.', status: 'pendente' },
    ],
  },
  {
    titulo: 'Tópicos avançados',
    descricao: 'Tempo real, processamento assíncrono e escala.',
    itens: [
      { titulo: 'Filas', descricao: 'Tarefas pesadas fora do ciclo da requisição.', status: 'pendente' },
      { titulo: 'Redis', descricao: 'Cache, estruturas em memória e armazenamento de filas.', status: 'pendente' },
      { titulo: 'Pub/Sub do Redis', descricao: 'Distribuir eventos entre processos.', status: 'pendente' },
      { titulo: 'SSE', descricao: 'Servidor enviando atualizações em tempo real ao navegador.', status: 'pendente' },
      { titulo: 'Workers em tempo real', descricao: 'Workers consumindo a fila e notificando via pub/sub e SSE.', status: 'pendente' },
      { titulo: 'Cluster do Node', descricao: 'Vários processos usando todos os núcleos na mesma porta.', status: 'pendente' },
    ],
  },
  {
    titulo: 'Banco a fundo',
    descricao: 'Entender o que o Postgres faz por baixo antes de jogar cache em cima.',
    itens: [
      { titulo: 'EXPLAIN ANALYZE', descricao: 'Ler o plano do relatório de vendas: seq scan, hash join, custo vs tempo real.', status: 'pendente' },
      { titulo: 'Índices', descricao: 'Índice em orders.created_at, composto e parcial; medir antes e depois com o seed de 1M.', status: 'pendente' },
      { titulo: 'Transações e concorrência', descricao: 'Criar pedido baixando estoque: race condition, SELECT ... FOR UPDATE e níveis de isolamento.', status: 'pendente' },
      { titulo: 'Paginação por cursor', descricao: 'Trocar offset por keyset em /users e comparar em tabela grande.', status: 'pendente' },
      { titulo: 'Pool de conexões', descricao: 'Tamanho do pool do pg vs a simulação de carga; quando entra um PgBouncer.', status: 'pendente' },
      { titulo: 'View materializada', descricao: 'Relatório pré-agregado com REFRESH CONCURRENTLY; comparar com cache no Redis.', status: 'pendente' },
    ],
  },
  {
    titulo: 'Qualidade e testes',
    descricao: 'Confiança para mudar o código sem medo.',
    itens: [
      { titulo: 'Validação de entrada', descricao: 'Schemas zod no decorator (@Body({ schema })) com o StandardSchemaValidationPipe nativo do Nest 12.', status: 'feito' },
      { titulo: 'Testes de integração', descricao: 'Backend contra um Postgres real com Testcontainers, em vez de mock.', status: 'pendente' },
      { titulo: 'Testes no frontend', descricao: 'Vitest + Vue Test Utils nos componentes; Playwright para o fluxo de ponta a ponta.', status: 'pendente' },
      { titulo: 'Contrato da API', descricao: 'OpenAPI com @nestjs/swagger e tipos do frontend gerados a partir dele.', status: 'pendente' },
      { titulo: 'Teste de carga', descricao: 'k6 contra /reports/sales: p50, p95, p99 e o ponto em que a API satura.', status: 'pendente' },
      { titulo: 'CI', descricao: 'GitHub Actions rodando lint, type-check, testes e build das imagens a cada push.', status: 'pendente' },
    ],
  },
  {
    titulo: 'Segurança',
    descricao: 'Usuários de verdade, acesso controlado e superfície de ataque menor.',
    itens: [
      { titulo: 'Autenticação', descricao: 'Senha com argon2; sessão em cookie httpOnly vs JWT, e os trade-offs de cada um.', status: 'pendente' },
      { titulo: 'Autorização', descricao: 'Guards e papéis no NestJS: quem pode ver e alterar o quê.', status: 'pendente' },
      { titulo: 'Rate limiting', descricao: '@nestjs/throttler ou limit_req no nginx, testado com a simulação de carga.', status: 'pendente' },
      { titulo: 'Headers e CSP', descricao: 'helmet e Content-Security-Policy no nginx; CORS e CSRF entendidos de verdade.', status: 'pendente' },
      { titulo: 'Dependências e imagens', descricao: 'npm audit, Dependabot e scan das imagens Docker com Trivy.', status: 'pendente' },
    ],
  },
  {
    titulo: 'Observabilidade',
    descricao: 'Saber o que está acontecendo em produção sem adivinhar.',
    itens: [
      { titulo: 'Logs estruturados', descricao: 'pino em JSON com request id propagado do nginx até a query.', status: 'pendente' },
      { titulo: 'Métricas', descricao: 'Prometheus + Grafana: latência p95, taxa de erro, event loop lag e pool do banco.', status: 'pendente' },
      { titulo: 'Tracing', descricao: 'OpenTelemetry mostrando onde o tempo de uma requisição é gasto.', status: 'pendente' },
      { titulo: 'Liveness vs readiness', descricao: 'Separar "o processo está vivo" de "pode receber tráfego" no /health.', status: 'pendente' },
      { titulo: 'Alertas', descricao: 'Uptime externo e alerta quando o p95 ou a taxa de erro passarem do limite.', status: 'pendente' },
    ],
  },
  {
    titulo: 'Frontend a fundo',
    descricao: 'Além de funcionar: rápido, acessível e com estado bem cuidado.',
    itens: [
      { titulo: 'Estado do servidor', descricao: 'TanStack Query: cache, revalidação, invalidação e atualização otimista em /usuarios.', status: 'pendente' },
      { titulo: 'Formulários', descricao: 'vee-validate com o mesmo schema zod usado no backend.', status: 'pendente' },
      { titulo: 'Performance', descricao: 'Lighthouse, Core Web Vitals e análise do bundle (rollup-plugin-visualizer).', status: 'pendente' },
      { titulo: 'Acessibilidade', descricao: 'Navegação por teclado, foco, aria e contraste nos dois temas.', status: 'pendente' },
      { titulo: 'Erros globais', descricao: 'app.config.errorHandler e onErrorCaptured com uma tela de erro amigável.', status: 'pendente' },
    ],
  },
  {
    titulo: 'Infra a fundo',
    descricao: 'Deploy repetível, servidor endurecido e recuperação testada.',
    itens: [
      { titulo: 'CD', descricao: 'Imagens multi-arch (ARM) no GHCR e deploy automático na VPS a cada merge.', status: 'pendente' },
      { titulo: 'Deploy sem downtime', descricao: 'Blue/green atrás do proxy e migrations no padrão expand/contract.', status: 'pendente' },
      { titulo: 'Hardening da VPS', descricao: 'SSH só com chave, usuário não-root, fail2ban e unattended-upgrades.', status: 'pendente' },
      { titulo: 'Limites de recursos', descricao: 'mem_limit e cpus no compose; provocar um OOM e ver o restart agir.', status: 'pendente' },
      { titulo: 'Restore testado', descricao: 'Subir um banco do zero a partir do backup e medir o tempo de recuperação.', status: 'pendente' },
      { titulo: 'Infra como código', descricao: 'Terraform criando a VPS e a rede na Oracle Cloud.', status: 'pendente' },
    ],
  },
]

export function statusDaFase(fase: FaseRoadmap): StatusFase {
  if (fase.itens.every((item) => item.status === 'feito')) return 'concluida'
  if (fase.itens.some((item) => item.status !== 'pendente')) return 'em-andamento'
  return 'planejada'
}
