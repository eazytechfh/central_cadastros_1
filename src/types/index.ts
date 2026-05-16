export type UserRole = 'admin' | 'member'

export interface Profile {
  id: string
  name: string
  email: string
  role: UserRole
  slug: string
  created_at: string
}

export interface Contact {
  id: string
  nome: string
  telefone: string
  bairro: string
  created_by: string
  created_at: string
  profiles?: { name: string }
}

export interface ContactFormData {
  nome: string
  telefone: string
  bairro: string
}

export interface ChartItem {
  name: string
  total: number
}
