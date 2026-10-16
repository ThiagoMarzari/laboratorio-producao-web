// O backend sempre é acessado por /api (em prod o nginx repassa ao container; no dev, o proxy do Vite)
export const apiUrl = '/api'

export type Metodo = 'GET' | 'POST' | 'PATCH' | 'DELETE'

// Formato dos erros HTTP do NestJS (NotFoundException, ParseIntPipe…)
export interface ErroApi {
  statusCode: number
  message: string | string[]
  error?: string
}

// Tudo de uma chamada: o que foi enviado e o que voltou. Erro HTTP não lança exceção,
// vira ok: false, para a tela poder mostrar o 400/404 como resposta normal.
export type Resposta<T> = {
  metodo: Metodo
  url: string
  corpo?: unknown
  status: number
  ms: number
} & ({ ok: true; dados: T } | { ok: false; dados: ErroApi | string })

export async function api<T>(metodo: Metodo, caminho: string, corpo?: unknown): Promise<Resposta<T>> {
  const url = `${apiUrl}${caminho}`
  const inicio = performance.now()
  const resposta = await fetch(url, {
    method: metodo,
    headers: corpo === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  })
  // Com o backend fora do ar, o nginx/Vite devolve texto ou HTML, não JSON
  const ehJson = resposta.headers.get('content-type')?.includes('application/json')
  const dados = ehJson ? await resposta.json() : await resposta.text()

  return {
    metodo,
    url,
    corpo,
    status: resposta.status,
    ms: Math.round(performance.now() - inicio),
    ok: resposta.ok,
    dados,
  }
}

export function mensagemDeErro(dados: ErroApi | string): string {
  if (typeof dados === 'string') return dados || 'Sem resposta do backend'
  return Array.isArray(dados.message) ? dados.message.join(', ') : dados.message
}
