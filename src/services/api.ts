import axios from 'axios'
import {
  ApiResponse,
  Kard,
  CreateKardRequest,
  ProtectedKard,
  Pack,
  CreatePackRequest,
  Game,
  Language,
  Rarity,
  Storage,
  LoginRequest,
  LoginResponse,
  RefreshRequest,
  RefreshResponse,
  MediaUploadResponse,
  MediaScanResponse,
} from '../types'
import { API_BASE_URL } from '../config/api'

const REQUEST_TIMEOUT_MS = 1_000_000
const REFRESH_WINDOW_MS = 5 * 60 * 1000

// Separate axios instances keep separate cookie jars, so auth cookies set by one
// group do not leak into another (and interceptors cannot re-trigger themselves).
const createClient = () =>
  axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT_MS,
    withCredentials: true,
  })

const publicApiClient = createClient()
const privateApiClient = createClient()
const authApiClient = createClient()

type Client = typeof publicApiClient

export const isTokenExpiringSoon = (token: string | null) => {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 - Date.now() < REFRESH_WINDOW_MS
  } catch {
    return true // If it can't be parsed, assume expired
  }
}

export const authAPI = {
  login: async (payload: LoginRequest): Promise<ApiResponse<LoginResponse>> =>
    (await authApiClient.post('/auth/login', payload)).data,
  refresh: async (payload: RefreshRequest): Promise<ApiResponse<RefreshResponse>> =>
    (await authApiClient.post('/auth/refresh', payload)).data,
  logout: async (): Promise<void> => {
    // If the backend doesn't provide a logout endpoint, ignore and clear cookies client-side
    await authApiClient.post('/auth/logout').catch(() => {})
  },
}

const storeTokens = (accessToken: string, refreshToken?: string | null) => {
  localStorage.setItem('accessToken', accessToken)
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
}

const clearTokensAndGoToLogin = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  window.location.href = '/login'
}

// Shared by both interceptors: exchange the stored refresh token for a fresh access token.
const refreshAccessToken = async (reason: string): Promise<string> => {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) throw new Error(`No refresh token available (${reason})`)

  const apiResponse = await authAPI.refresh({ refresh_token: refreshToken })
  const data: RefreshResponse = apiResponse.data
  if (!data.access_token) throw new Error('No access token in refresh response')

  storeTokens(data.access_token, data.refresh_token)
  return data.access_token
}

privateApiClient.interceptors.request.use(async (config) => {
  try {
    const token = localStorage.getItem('accessToken')
    if (!token) return config

    const effective = isTokenExpiringSoon(token) ? await refreshAccessToken('request') : token
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${effective}`
    return config
  } catch (error) {
    console.error('Token refresh failed:', error)
    clearTokensAndGoToLogin()
    return Promise.reject(error)
  }
})

// Response interceptor for handling unexpected 401s
privateApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const accessToken = await refreshAccessToken('401 retry')
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return axios.request(originalRequest)
      } catch (refreshError) {
        clearTokensAndGoToLogin()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

// --- request helpers (every group below is the same shape: verb + path + params) ---

const getList = async (client: Client, path: string, limit: number, offset: number) =>
  (await client.get(path, { params: { limit, offset } })).data

const getOne = async (client: Client, path: string) => (await client.get(path)).data

const searchList = async (client: Client, path: string, params: Record<string, number | string>) =>
  (await client.get(path, { params })).data

const create = async (client: Client, path: string, body: unknown) =>
  (await client.post(path, body)).data

const update = async (client: Client, path: string, body: unknown) =>
  (await client.put(path, body)).data

const uploadMedia = async (client: Client, path: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file) // 'file' matches the backend field name
  return (await client.post(path, formData)).data
}

export const packsAPI = {
  getPacks: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Pack[]>> =>
    getList(publicApiClient, '/packs', limit, offset),
  searchPacks: async (
    game_id: number = 0,
    language_id: number = 0,
    query: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<ApiResponse<Pack[]>> =>
    searchList(publicApiClient, '/packs/search', { game_id, language_id, query, limit, offset }),
  createPack: async (data: CreatePackRequest) => create(privateApiClient, '/packs', data),
}

export const kardsAPI = {
  getKards: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Kard[]>> =>
    getList(publicApiClient, '/cards', limit, offset),
  getKard: async (id: number = 1): Promise<ApiResponse<Kard>> =>
    getOne(publicApiClient, `/cards/${id}`),
  searchKards: async (
    game_id: number = 0,
    language_id: number = 0,
    pack_id: number = 0,
    query: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<ApiResponse<Kard[]>> =>
    searchList(publicApiClient, '/cards/search', { game_id, language_id, pack_id, query, limit, offset }),
  createKard: async (data: CreateKardRequest) => create(privateApiClient, '/cards', data),
  updateKard: async (id: number, data: CreateKardRequest) =>
    update(privateApiClient, `/cards/${id}`, data),
}

export const protectedKardsAPI = {
  getKards: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<ProtectedKard[]>> =>
    getList(privateApiClient, '/cards/protected', limit, offset),

  // TODO: search
  getKard: async (id: number = 1): Promise<ApiResponse<ProtectedKard>> =>
    getOne(privateApiClient, `/cards/protected/${id}`),
  updateKard: async (id: number, data: CreateKardRequest) =>
    update(privateApiClient, `/cards/protected/${id}`, data),
}

export const gamesAPI = {
  getGames: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Game[]>> =>
    getList(publicApiClient, '/games', limit, offset),
  searchGames: async (query: string, limit: number = 10, offset: number = 0): Promise<ApiResponse<Game[]>> =>
    searchList(publicApiClient, '/games/search', { query, limit, offset }),
}

export const languagesAPI = {
  getLanguages: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Language[]>> =>
    getList(publicApiClient, '/languages', limit, offset),
  searchLanguages: async (query: string, limit: number = 10, offset: number = 0): Promise<ApiResponse<Language[]>> =>
    searchList(publicApiClient, '/languages/search', { query, limit, offset }),
}

export const raritiesAPI = {
  getRarities: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Rarity[]>> =>
    getList(publicApiClient, '/rarities', limit, offset),
}

export const storagesAPI = {
  getStorages: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Storage[]>> =>
    getList(privateApiClient, '/storages', limit, offset),
  getStorage: async (id: number): Promise<ApiResponse<Storage>> =>
    getOne(privateApiClient, `/storages/${id}`),
  searchStorages: async (query: string, limit: number = 10, offset: number = 0): Promise<ApiResponse<Storage[]>> =>
    searchList(privateApiClient, '/storages/search', { query, limit, offset }),
  createStorage: async (data: { code: string; name: string; description: string }): Promise<ApiResponse<Storage>> =>
    create(privateApiClient, '/storages', data),
}

export const mediaAPI = {
  uploadImage: async (file: File): Promise<MediaUploadResponse> => {
    const data = await uploadMedia(privateApiClient, '/media/upload', file)
    return data.data
  },
}

export const mediaAPIScan = {
  uploadImage: async (file: File) =>
    uploadMedia(privateApiClient, '/media/upload?also_scan=true', file), // full body: nested scan object
  scanImage: async (file: File, capToken: string): Promise<MediaScanResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    return (
      await publicApiClient.post('/media/scan', formData, { headers: { 'X-Cap-Token': capToken } })
    ).data
  },
}
