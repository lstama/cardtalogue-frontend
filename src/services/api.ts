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
  MediaScanResponse
} from '../types'
import { API_BASE_URL } from '../config/api'

const privateApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000000,
  withCredentials: true,
})

const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000000,
  withCredentials: true,
})

// Prevent intercerptors loop
const authApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000000,
  withCredentials: true,
})

export const isTokenExpiringSoon = (token: string | null) => {
  if (!token) return true

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const expirationTime = payload.exp * 1000 // Convert to milliseconds
    const currentTime = Date.now()
    const fiveMinutes = 5 * 60 * 1000 // 5 minutes in milliseconds

    return expirationTime - currentTime < fiveMinutes
  } catch (error) {
    return true // If can't parse, assume expired
  }
}

export const authAPI = {
  login: async (payload: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await authApiClient.post('/auth/login', payload)
    return response.data
  },
  refresh: async (payload: RefreshRequest): Promise<ApiResponse<RefreshResponse>> => {
    const response = await authApiClient.post('/auth/refresh', payload)
    return response.data
  },
  logout: async (): Promise<void> => {
    // If backend doesn’t provide logout endpoint, just clear cookies client-side
    await authApiClient.post('/auth/logout').catch(() => {
      // Optional: ignore error if logout not implemented
    })
  }
}

privateApiClient.interceptors.request.use(async (config) => {
  try {
    let token = localStorage.getItem('accessToken')

    // If no token at all, just proceed without auth
    if (!token) {
      return config
    }

    // Check if token needs refresh
    if (isTokenExpiringSoon(token)) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      console.log('Token expiring soon, refreshing...')

      const api_response = await authAPI.refresh({ refresh_token: refreshToken })
      const response: RefreshResponse = api_response.data

      if (!response.access_token) {
        throw new Error('No access token in refresh response')
      }

      // Update tokens
      localStorage.setItem('accessToken', response.access_token)
      if (response.refresh_token) {
        localStorage.setItem('refreshToken', response.refresh_token)
      }

      // Use the new token
      token = response.access_token
      console.log('Token refreshed successfully')
    }

    // Set authorization header
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config

  } catch (error) {
    console.error('Token refresh failed:', error)

    // Clear all auth data
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')

    // Redirect to login
    window.location.href = '/login'

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
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')

        const api_response = await authAPI.refresh({ refresh_token: refreshToken })
        const response: RefreshResponse = api_response.data
        localStorage.setItem('accessToken', response.access_token)
        if (response.refresh_token) {
          localStorage.setItem('refreshToken', response.refresh_token)
        }

        // Retry original request with new token
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

export const packsAPI = {
  getPacks: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Pack[]>> => {
    const response = await publicApiClient.get('/packs', {
      params: { limit, offset }
    })
    return response.data
  },
  searchPacks: async (game_id: number = 0, language_id: number = 0, query: string, limit: number = 10, offset: number = 0): Promise<ApiResponse<Pack[]>> => {
    const response = await publicApiClient.get('/packs/search', {
      params: { game_id: game_id, language_id: language_id, query: query, limit, offset }
    })
    return response.data
  },
  createPack: async (data: CreatePackRequest) => {
    const response = await privateApiClient.post('/packs', data)
    return response.data
  },
}

export const kardsAPI = {
  getKards: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Kard[]>> => {
    const response = await publicApiClient.get('/cards', {
      params: { limit, offset }
    })
    return response.data
  },
  getKard: async (id: number = 1): Promise<ApiResponse<Kard[]>> => {
    const response = await publicApiClient.get('/cards/' + id)
    return response.data
  },
  searchKards: async (game_id: number = 0, language_id: number = 0, pack_id: number = 0, query: string, limit: number = 10, offset: number = 0): Promise<ApiResponse<Kard[]>> => {
    const response = await publicApiClient.get('/cards/search', {
      params: { game_id: game_id, language_id: language_id, pack_id: pack_id, query: query, limit, offset }
    })
    return response.data
  },
  createPack: async (data: CreateKardRequest) => {
    const response = await privateApiClient.post('/cards', data)
    return response.data
  },
  updateKard: async (id: number, data: CreateKardRequest) => {
    const response = await privateApiClient.put('/cards/' + id, data)
    return response.data
  },
}

export const protectedKardsAPI = {
  getKards: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<ProtectedKard[]>> => {
    const response = await privateApiClient.get('/cards/protected', {
      params: { limit, offset }
    })
    return response.data
  },

  // TODO: search
  getKard: async (id: number = 1): Promise<ApiResponse<ProtectedKard>> => {
    const response = await privateApiClient.get('/cards/protected/' + id)
    return response.data
  },
  updateKard: async (id: number, data: CreateKardRequest) => {
    const response = await privateApiClient.put('/cards/protected/' + id, data)
    return response.data
  },
}

export const gamesAPI = {
  getGames: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Game[]>> => {
    const response = await publicApiClient.get('/games', {
      params: { limit, offset }
    })
    return response.data
  },
  searchGames: async (query: string, limit: number = 10, offset: number = 0): Promise<ApiResponse<Game[]>> => {
    const response = await publicApiClient.get('/games/search', {
      params: { query: query, limit, offset }
    })
    return response.data
  }
}

export const languagesAPI = {
  getLanguages: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Language[]>> => {
    const response = await publicApiClient.get('/languages', {
      params: { limit, offset }
    })
    return response.data
  },
  searchLanguages: async (query: string, limit: number = 10, offset: number = 0): Promise<ApiResponse<Language[]>> => {
    const response = await publicApiClient.get('/languages/search', {
      params: { query: query, limit, offset }
    })
    return response.data
  }
}

export const raritiesAPI = {
  getRarities: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Rarity[]>> => {
    const response = await publicApiClient.get('/rarities', {
      params: { limit, offset }
    })
    return response.data
  }
}

export const storagesAPI = {
  getStorages: async (limit: number = 20, offset: number = 0): Promise<ApiResponse<Storage[]>> => {
    const response = await privateApiClient.get('/storages', {
      params: { limit, offset }
    })
    return response.data
  },
  getStorage: async (id: number): Promise<ApiResponse<Storage>> => {
    const response = await privateApiClient.get('/storages/' + id)
    return response.data
  },
  searchStorages: async (query: string, limit: number = 10, offset: number = 0): Promise<ApiResponse<Storage[]>> => {
    const response = await privateApiClient.get('/storages/search', {
      params: { query: query, limit, offset }
    })
    return response.data
  },
  createStorage: async (data: { code: string; name: string; description: string }): Promise<ApiResponse<Storage>> => {
    const response = await privateApiClient.post('/storages', data)
    return response.data
  }
}

export const mediaAPI = {
  uploadImage: async (file: File): Promise<MediaUploadResponse> => {
    const formData = new FormData()
    // Change 'image' to 'file' to match backend requirements
    formData.append('file', file) 
    
    const response = await privateApiClient.post('/media/upload', formData)
    return response.data.data
  }
}

export const mediaAPIScan = {
  uploadImage: async (file: File): Promise<any> => { // Using any here because of the nested scan object
    const formData = new FormData()
    formData.append('file', file) 

    const response = await privateApiClient.post('/media/upload?also_scan=true', formData)
    return response.data
  },
  scanImage: async (file: File, capToken: string): Promise<MediaScanResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await publicApiClient.post('/media/scan', formData, {
      headers: { 'X-Cap-Token': capToken }
    })
    return response.data
  }
}
