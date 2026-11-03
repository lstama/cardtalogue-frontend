import createClient from 'openapi-fetch'
import type { paths, components } from '@contract/backend'
import { API_BASE_URL } from '../config/api'
import type {
  ApiResponse,
  Kard,
  Game,
  LoginRequest,
  MediaScanResponse,
  Pack,
  Storage,
  Language,
  Rarity,
  CreatePackRequest,
  CreateKardRequest,
  ProtectedKard,
  MediaUploadResponse,
  LoginResponse,
  RefreshResponse,
} from '../types'

// ---------------------------------------------------------------------------
// Auth token helpers (JWT, localStorage)
// ---------------------------------------------------------------------------

// Refresh proactively when fewer than this many seconds remain on the access token.
const TOKEN_EXPIRY_THRESHOLD_MS = 5 * 60 * 1000

function decodeJwtExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const decoded = JSON.parse(json)
    return typeof decoded.exp === 'number' ? decoded.exp : null
  } catch {
    return null
  }
}

export function isTokenExpiringSoon(token: string): boolean {
  const exp = decodeJwtExpiry(token)
  if (exp === null) return false
  return exp * 1000 - Date.now() < TOKEN_EXPIRY_THRESHOLD_MS
}

function clearTokens(): void {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

// Refresh lock: only one refresh in flight at a time (mirrors the previous
// axios interceptor queue so concurrent requests share a single refresh).
let refreshing: Promise<string> | null = null

function refreshAccessToken(): Promise<string> {
  if (!refreshing) {
    refreshing = (async () => {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        clearTokens()
        throw new Error('No refresh token available')
      }
      const resp = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
      if (!resp.ok) {
        throw new Error('Token refresh failed')
      }
      const json = (await resp.json()) as { data?: { access_token?: string; refresh_token?: string } }
      const token = json.data?.access_token
      if (!token) {
        throw new Error('No access token in refresh response')
      }
      localStorage.setItem('accessToken', token)
      if (json.data?.refresh_token) {
        localStorage.setItem('refreshToken', json.data.refresh_token)
      }
      return token
    })()
    refreshing.finally(() => {
      refreshing = null
    })
  }
  return refreshing
}

// ---------------------------------------------------------------------------
// openapi-fetch client with auth + 401-retry loader
// ---------------------------------------------------------------------------

const client = createClient<paths>({
  baseUrl: API_BASE_URL,
  fetch: async (req: Request): Promise<Response> => {
    // Add the auth header; proactively refresh if the token is about to expire.
    let token = localStorage.getItem('accessToken')
    if (token && isTokenExpiringSoon(token)) {
      token = await refreshAccessToken()
    }
    if (token) {
      req.headers.set('Authorization', `Bearer ${token}`)
    }

    // Clone before consuming the body so a 401 retry can re-send the request.
    const retryReq = req.clone()

    let res = await fetch(req)

    // On 401, refresh once and retry (guarded so we never loop).
    if (res.status === 401 && retryReq.headers.get('x-retry') !== 'true') {
      try {
        const newToken = await refreshAccessToken()
        retryReq.headers.set('Authorization', `Bearer ${newToken}`)
        retryReq.headers.set('x-retry', 'true')
        res = await fetch(retryReq)
      } catch {
        clearTokens()
      }
    }

    return res
  },
})

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

function requireData<T>(result: { data?: unknown; error?: unknown; response?: Response }): T {
  const { data, error, response } = result
  if (error || data === undefined) {
    throw new Error(response?.statusText || 'Request failed')
  }
  return data as T
}

// ---------------------------------------------------------------------------
// Games
// ---------------------------------------------------------------------------

export const gamesAPI = {
  getGames(limit: number, offset: number): Promise<ApiResponse<Game[]>> {
    return client
      .GET('/games', { params: { query: { limit, offset } } })
      .then((res) => requireData<ApiResponse<Game[]>>(res))
  },
  searchGames(query: string, limit: number, offset: number): Promise<ApiResponse<Game[]>> {
    return client
      .GET('/games/search', { params: { query: { query, limit, offset } } })
      .then((res) => requireData<ApiResponse<Game[]>>(res))
  },
}

// ---------------------------------------------------------------------------
// Languages
// ---------------------------------------------------------------------------

export const languagesAPI = {
  getLanguages(limit: number, offset: number): Promise<ApiResponse<Language[]>> {
    return client
      .GET('/languages', { params: { query: { limit, offset } } })
      .then((res) => requireData<ApiResponse<Language[]>>(res))
  },
  searchLanguages(query: string, limit: number, offset: number): Promise<ApiResponse<Language[]>> {
    return client
      .GET('/languages/search', { params: { query: { query, limit, offset } } })
      .then((res) => requireData<ApiResponse<Language[]>>(res))
  },
}

// ---------------------------------------------------------------------------
// Rarities
// ---------------------------------------------------------------------------

export const raritiesAPI = {
  getRarities(limit: number, offset: number): Promise<ApiResponse<Rarity[]>> {
    return client
      .GET('/rarities', { params: { query: { limit, offset } } })
      .then((res) => requireData<ApiResponse<Rarity[]>>(res))
  },
}

// ---------------------------------------------------------------------------
// Packs
// ---------------------------------------------------------------------------

export const packsAPI = {
  getPacks(limit: number, offset: number): Promise<ApiResponse<Pack[]>> {
    return client
      .GET('/packs', { params: { query: { limit, offset } } })
      .then((res) => requireData<ApiResponse<Pack[]>>(res))
  },
  searchPacks(game_id: number, language_id: number, query: string, limit: number, offset: number): Promise<ApiResponse<Pack[]>> {
    return client
      .GET('/packs/search', { params: { query: { game_id, language_id, query, limit, offset } } })
      .then((res) => requireData<ApiResponse<Pack[]>>(res))
  },
  createPack(data: CreatePackRequest): Promise<ApiResponse<Pack>> {
    return client
      .POST('/packs', { body: data as unknown as { name: string; image_url?: string } })
      .then((res) => requireData<ApiResponse<Pack>>(res))
  },
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------

export const kardsAPI = {
  getKards(limit: number, offset: number): Promise<ApiResponse<Kard[]>> {
    return client
      .GET('/cards', { params: { query: { limit, offset } } })
      .then((res) => requireData<ApiResponse<Kard[]>>(res))
  },
  getKard(id: number): Promise<ApiResponse<Kard>> {
    return client
      .GET('/cards/{id}', { params: { path: { id } } })
      .then((res) => requireData<ApiResponse<Kard>>(res))
  },
  searchKards(game_id: number, language_id: number, pack_id: number, query: string, limit: number, offset: number): Promise<ApiResponse<Kard[]>> {
    return client
      .GET('/cards/search', { params: { query: { game_id, language_id, pack_id, query, limit, offset } } })
      .then((res) => requireData<ApiResponse<Kard[]>>(res))
  },
  createKard(data: CreateKardRequest): Promise<ApiResponse<Kard>> {
    return client
      .POST('/cards', { body: data as unknown as Record<string, unknown> })
      .then((res) => requireData<ApiResponse<Kard>>(res))
  },
  updateKard(id: number, data: CreateKardRequest): Promise<ApiResponse<Kard>> {
    return client
      .POST('/cards/{id}', { params: { path: { id } }, body: data as unknown as Record<string, unknown> })
      .then((res) => requireData<ApiResponse<Kard>>(res))
  },
}

// ---------------------------------------------------------------------------
// Protected cards (authorized callers only)
// ---------------------------------------------------------------------------

export const protectedKardsAPI = {
  getKards(limit: number, offset: number): Promise<ApiResponse<ProtectedKard[]>> {
    return client
      .GET('/cards/protected', { params: { query: { limit, offset } } })
      .then((res) => requireData<ApiResponse<ProtectedKard[]>>(res))
  },
  getKard(id: number): Promise<ApiResponse<ProtectedKard>> {
    return client
      .GET('/cards/protected/{id}', { params: { path: { id } } })
      .then((res) => requireData<ApiResponse<ProtectedKard>>(res))
  },
  updateKard(id: number, data: CreateKardRequest): Promise<ApiResponse<ProtectedKard>> {
    return client
      .POST('/cards/protected/{id}', { params: { path: { id } }, body: data as unknown as Record<string, unknown> })
      .then((res) => requireData<ApiResponse<ProtectedKard>>(res))
  },
}

// ---------------------------------------------------------------------------
// Storages
// ---------------------------------------------------------------------------

export const storagesAPI = {
  getStorages(limit: number, offset: number): Promise<ApiResponse<Storage[]>> {
    return client
      .GET('/storages', { params: { query: { limit, offset } } })
      .then((res) => requireData<ApiResponse<Storage[]>>(res))
  },
  getStorage(id: number): Promise<ApiResponse<Storage>> {
    return client
      .GET('/storages/{id}', { params: { path: { id } } })
      .then((res) => requireData<ApiResponse<Storage>>(res))
  },
  searchStorages(query: string, limit: number, offset: number): Promise<ApiResponse<Storage[]>> {
    return client
      .GET('/storages/search', { params: { query: { query, limit, offset } } })
      .then((res) => requireData<ApiResponse<Storage[]>>(res))
  },
  createStorage(data: components['schemas']['CreateStorageRequest']): Promise<ApiResponse<Storage>> {
    return client
      .POST('/storages', { body: data as unknown as { name: string } })
      .then((res) => requireData<ApiResponse<Storage>>(res))
  },
}

// ---------------------------------------------------------------------------
// Media (upload) — private
// ---------------------------------------------------------------------------

export const mediaAPI = {
  uploadImage(file: File): Promise<MediaUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    return client
      .POST('/media/upload', { body: formData as unknown as { file: string } })
      .then((res) => requireData<MediaUploadResponse>(res))
  },
}

// ---------------------------------------------------------------------------
// Media (scan) — public
// ---------------------------------------------------------------------------

export const mediaAPIScan = {
  uploadImage(file: File): Promise<MediaUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    return client
      .POST('/media/upload', { body: formData as unknown as { file: string } })
      .then((res) => requireData<MediaUploadResponse>(res))
  },
  scanImage(file: File, capToken?: string): Promise<MediaScanResponse> {
    const formData = new FormData()
    formData.append('file', file)
    return client
      .POST('/media/scan', {
        body: formData as unknown as { file: string },
        headers: capToken ? { 'X-Cap-Token': capToken } : {},
      })
      .then((res) => requireData<MediaScanResponse>(res))
  },
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const authAPI = {
  login(payload: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return client
      .POST('/auth/login', { body: payload as unknown as { email: string; password: string } })
      .then((res) => requireData<ApiResponse<LoginResponse>>(res))
  },
  refresh(payload: { refresh_token: string }): Promise<ApiResponse<RefreshResponse>> {
    return client
      .POST('/auth/refresh', { body: payload as unknown as { refresh_token: string } })
      .then((res) => requireData<ApiResponse<RefreshResponse>>(res))
  },
  logout(): Promise<void> {
    return client
      .POST('/auth/logout', { body: {} as Record<string, never> })
      .then(() => undefined)
  },
}
