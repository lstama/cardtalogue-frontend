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
  MediaUploadResponse
} from '../types'
import { API_BASE_URL } from '../config/api'

/**
 * Base configuration for all API clients.
 */
const apiClientConfig = {
  baseURL: API_BASE_URL,
  timeout: 1000000,
  withCredentials: true,
}

/**
 * API Clients
 * We use different instances to manage different behaviors (e.g. auth vs public).
 */
export const privateApiClient = axios.create(apiClientConfig)
export const publicApiClient = axios.create(apiClientConfig)

// Dedicated client for Auth to prevent interceptor loops during refresh
const authApiClient = axios.create(apiClientConfig)

/**
 * Utility to check if the JWT access token is expiring within the next 5 minutes.
 */
export const isTokenExpiringSoon = (token: string | null): boolean => {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000
    const currentTime = Date.now()
    const fiveMinutes = 5 * 60 * 1000

    return expirationTime - currentTime < fiveMinutes
  } catch {
    // If we can't parse the token, assume it's expired or invalid
    return true
  }
}

export const authAPI = {
  login: async (payload: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const { data } = await authApiClient.post('/auth/login', payload)
    return data
  },
  refresh: async (payload: RefreshRequest): Promise<ApiResponse<RefreshResponse>> => {
    const { data } = await authApiClient.post('/auth/refresh', payload)
    return data
  },
  logout: async (): Promise<void> => {
    await authApiClient.post('/auth/logout').catch(() => {
      // Optional: ignore error if logout is not implemented on backend
    })
  }
}

/**
 * Request Interceptors
 */
privateApiClient.interceptors.request.use(async (config) => {
  try {
    let token = localStorage.getItem('accessToken')

    if (!token) return config

    if (isTokenExpiringSoon(token)) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      console.log('Token expiring soon, refreshing...')

      const apiResponse = await authAPI.refresh({ refresh_token: refreshToken })
      const response: RefreshResponse = apiResponse.data

      if (!response.access_token) {
        throw new Error('No access token in refresh response')
      }

      localStorage.setItem('accessToken', response.access_token)
      if (response.refresh_token) {
        localStorage.setItem('refreshToken', response.refresh_token)
      }

      token = response.access_token
      console.log('Token refreshed successfully')
    }

    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  } catch (error) {
    console.error('Token refresh failed:', error)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/login'
    return Promise.reject(error)
  }
})

/**
 * Response Interceptors
 * Handles unexpected 401s by attempting a refresh.
 */
privateApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const apiResponse = await authAPI.refresh({ refresh_token: refreshToken })
        const response: RefreshResponse = apiResponse.data
        
        localStorage.setItem('accessToken', response.access_token)
        if (response.refresh_token) {
          localStorage.setItem('refreshToken', response.refresh_token)
        }

        originalRequest.headers.Authorization = `Bearer ${response.access_token}`
        return axios.request(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

/**
 * Packs API
 */
export const packsAPI = {
  getPacks: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Pack[]>> => {
    const { data } = await publicApiClient.get('/packs', {
      params: { limit, offset }
    })
    return data
  },
  searchPacks: async (game_id: number = 0, language_id: number = 0, query: string, limit: number = 10, offset: number = 0): Promise<ApiResponse<Pack[]>> => {
    const { data } = await publicApiClient.get('/packs/search', {
      params: { game_id, language_id, query, limit, offset }
    })
    return data
  },
  createPack: async (data: CreatePackRequest) => {
    const { data } = await privateApiClient.post('/packs', data)
    return data
  },
}

/**
 * Kards API
 */
export const kardsAPI = {
  getKards: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Kard[]>> => {
    const { data } = await publicApiClient.get('/cards', {
      params: { limit, offset }
    })
    return data
  },
  getKard: async (id: number = 1): Promise<ApiResponse<Kard>> => {
    const { data } = await publicApiClient.get('/cards/' + id)
    return data
  },
  searchKards: async (game_id: number = 0, language_id: number = 0, pack_id: number = 0, query: string, limit: number = 10, offset: number = 0): Promise<ApiResponse<Kard[]>> => {
    const { data } = await privateApiClient.get('/cards/search', {
      params: { game_id, language_id, pack_id, query, limit, offset }
    })
    return data
  },
  createKard: async (data: CreateKardRequest) => {
    const { data } = await privateApiClient.post('/cards', data)
    return data
  },
  updateKard: async (id: number, data: CreateKardRequest) => {
    const { data } = await privateApiClient.put('/cards/' + id, data)
    return data
  },
}

/**
 * Protected Kards API
 */
export const protectedKardsAPI = {
  getKards: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<ProtectedKard[]>> => {
    const { data } = await privateApiClient.get('/cards/protected', {
      params: { limit, offset }
    })
    return data
  },
  getKard: async (id: number = 1): Promise<ApiResponse<ProtectedKard>> => {
    const { data } = await privateApiClient.get('/cards/protected/' + id)
    return data
  },
  updateKard: async (id: number, data: CreateKardRequest) => {
    const { data } = await privateApiClient.put('/cards/protected/' + id, data)
    return data
  },
}

/**
 * Games API
 */
export const gamesAPI = {
  getGames: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Game[]>> => {
    const { data } = await publicApiClient.get('/games', {
      params: { limit, offset }
    })
    return data
  },
  searchGames: async (query: string, limit: number = 10, offset: number = 0): Promise<ApiResponse<Game[]>> => {
    const { data } = await publicApiClient.get('/games/search', {
      params: { query, limit, offset }
    })
    return data
  }
}

/**
 * Languages API
 */
export const languagesAPI = {
  getLanguages: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Language[]>> => {
    const { data } = await publicApiClient.get('/languages', {
      params: { limit, offset }
    })
    return data
  },
  searchLanguages: async (query: string, limit: number = 10, offset: number = 0): Promise<ApiResponse<Language[]>> => {
    const { data } = await publicApiClient.get('/languages/search', {
      params: { query, limit, offset }
    })
    return data
  }
}

/**
 * Rarities API
 */
export const raritiesAPI = {
  getRarities: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Rarity[]>> => {
    const { data } = await publicApiClient.get('/rarities', {
      params: { limit, offset }
    })
    return data
  }
}

/**
 * Storages API
 */
export const storagesAPI = {
  getStorages: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Storage[]>> => {
    const { data } = await privateApiClient.get('/storages', {
      params: { limit, offset }
    })
    return data
  },
  getStorage: async (id: number): Promise<ApiResponse<Storage>> => {
    const { data } = await privateApiClient.get('/storages/' + id)
    return data
  },
  searchStorages: async (query: string, limit: number = 10, offset: number = 0): Promise<ApiResponse<Storage[]>> => {
    const { data } = await privateApiClient.get('/storages/search', {
      params: { query, limit, offset }
    })
    return data
  },
  createStorage: async (data: { code: string; name: string; description: string }): Promise<ApiResponse<Storage>> => {
    const { data } = await privateApiClient.post('/storages', data)
    return data
  }
}

/**
 * Media API
 */
export const mediaAPI = {
  uploadImage: async (file: File): Promise<MediaUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file) 
    const { data } = await privateApiClient.post('/media/upload', formData)
    return data
  }
}

export const mediaAPIScan = {
  uploadImage: async (file: File): Promise<MediaUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file) 
    const { data } = await privateApiClient.post('/media/upload?also_scan=true', formData)
    return data
  }
}
