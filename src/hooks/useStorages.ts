import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { STALE_TIME_MS } from '../config/query'
import { storagesAPI } from '../services/api'

export const useStorages = (limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ['storages', limit, offset],
    queryFn: () => storagesAPI.getStorages(limit, offset),
    staleTime: STALE_TIME_MS,
  })
}

export const useSearchStorages = (
  query: string,
  limit: number = 20,
  offset: number = 0
) => {
  return useQuery({
    queryKey: ['storages/search', query, limit, offset],
    queryFn: () => storagesAPI.searchStorages(query, limit, offset),
    staleTime: STALE_TIME_MS,
    placeholderData: keepPreviousData,
    enabled: false,
  })
}
