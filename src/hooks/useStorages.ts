import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { storagesAPI } from '../services/api'

export const useStorages = (limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ['storages', limit, offset],
    queryFn: () => storagesAPI.getStorages(limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: false,
  })
}
