export interface Pack {
  id: number
  code: string
  name: string
  image_url: string
  description: string
  game_id: number
  game_name: string
  language_id: number
  language_name: string
  language_code: string
  created_at: string
  updated_at: string
}

export interface Kard {
  id: number
  code: string
  name: string
  price: number
  price_multiplier: number
  quantity: number
  status: string
  for_sale: string
  pack_id: number
  pack_name: string
  pack_code: string
  rarity_id: number
  rarity_name: string
  rarity_code: string
  image_url: string
  description: string
  game_id: number
  game_name: string
  language_id: number
  language_name: string
  language_code: string
  created_at: string
  updated_at: string
}

export interface ProtectedKard {
  id: number
  code: string
  name: string
  price: number
  price_multiplier: number
  quantity: number
  status: string
  for_sale: string
  pack_id: number
  pack_name: string
  pack_code: string
  rarity_id: number
  rarity_name: string
  rarity_code: string
  image_url: string
  description: string
  game_id: number
  game_name: string
  language_id: number
  language_name: string
  language_code: string
  storage_id: number
  storage_name: string
  storage_code: string
  created_at: string
  updated_at: string
}

export interface Game {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface Language {
  id: number
  code: string
  name: string
  created_at: string
  updated_at: string
}

export interface Storage {
  id: number
  code: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data: T
  meta: {
    limit: number
    offset: number
    total: number
  }
}

export interface User {
  id: number
  name: string
  email: string
  age: number
  role: string
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

export interface RefreshRequest {
  refresh_token: string
}

export interface RefreshResponse {
  access_token: string
  refresh_token: string | null
}
