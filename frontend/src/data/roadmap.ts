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
      { titulo: 'ORM', descricao: 'Escolher e configurar o ORM no NestJS.', status: 'fazendo' },
      { titulo: 'Conexão com o Postgres', descricao: 'NestJS lendo as credenciais do .env.', status: 'pendente' },
      { titulo: 'Migrations', descricao: 'Schema versionado e aplicado no deploy.', status: 'pendente' },
      { titulo: 'Health do banco', descricao: '/health também verificando o Postgres.', status: 'pendente' },
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
]

export function statusDaFase(fase: FaseRoadmap): StatusFase {
  if (fase.itens.every((item) => item.status === 'feito')) return 'concluida'
  if (fase.itens.some((item) => item.status !== 'pendente')) return 'em-andamento'
  return 'planejada'
}
