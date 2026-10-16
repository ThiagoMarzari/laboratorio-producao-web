import { api } from '@/lib/api'

// Espelham as tabelas de backend/src/db/schema.ts (o JSON usa os nomes em camelCase do Drizzle)
export interface User {
  id: number
  firstName: string
  lastName: string
  isActive: boolean
}

export interface Photo {
  id: number
  url: string
  userId: number
}

export type UserComFotos = User & { photos: Photo[] }

export type UserInput = Omit<User, 'id'>

// Um método por rota do UsersController
export const usersApi = {
  listar: () => api<User[]>('GET', '/users'),
  buscar: (id: number | string) => api<UserComFotos>('GET', `/users/${encodeURIComponent(id)}`),
  criar: (input: UserInput) => api<User>('POST', '/users', input),
  atualizar: (id: number, input: Partial<UserInput>) => api<User>('PATCH', `/users/${id}`, input),
  excluir: (id: number) => api<User>('DELETE', `/users/${id}`),
}
