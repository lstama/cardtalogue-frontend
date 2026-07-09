import { useQuery, keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query'
import { packsAPI } from '../services/api'

/**
 * Fetch a list of Packs.
 */
export const usePacks = (limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ['packs', limit, offset],
    queryFn: () => packsAPI.getPacks(limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch a single Pack by ID.
 */
export const usePack = (id: number = 1) => {
  return useQuery({
    queryKey: ['pack', id],
    queryFn: () => packsAPI.getPack(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Search Packs with various filters.
 */
export const useSearchPacks = (
  gameId: number,
  languageId: number,
  query: string,
  limit: number = 20,
  offset: number = 0
) => {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['packs/search', gameId, languageId, query, limit, offset],
    queryFn: () => packsAPI.searchPacks(gameId, languageId, query, limit, offset),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: false, // Only run when manually triggered via refetch
  })
}

/**
 * Create a new Pack.
 */
export const useCreatePack = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: packsAPI.createPack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packs'] })
    },
  })
}
