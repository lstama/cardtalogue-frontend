import { useQuery, keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query'
import { storagesAPI } from '../services/api'

/**
 * Fetch a list of Storages.
 */
export const useStorages = (limit: number = 20, offset: number = 0, query: string = '') => {
  return useQuery({
    queryKey: ['storages', query, limit, offset],
    queryFn: () => {
      if (query) {
        return storagesAPI.searchStorages(query, limit, offset)
      }
      return storagesAPI.getStorages(limit, offset)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch a single Storage by ID.
 */
export const useStorage = (id: number = 1) => {
  return useQuery({
    queryKey: ['storage', id],
    queryFn: () => storagesAPI.getStorage(id),
    staleTime: 5 * 60 * 1000, // 5 minutes,
  })
}

/**
 * Search Storages with various filters.
 */
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
    enabled: false, // Only run when manually triggered via refetch
  })
}

/**
 * Create a new Storage.
 */
export const useCreateStorage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: storagesAPI.createStorage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storages'] })
    },
  })
}
