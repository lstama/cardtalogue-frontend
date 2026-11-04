import { useQuery, keepPreviousData, useMutation, useQueryClient } from '@tanstack/react-query'
import { STALE_TIME_MS } from '../config/query'
import { packsAPI } from '../services/api'

export const usePacks = (limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ['packs', limit, offset],
    queryFn: () => packsAPI.getPacks(limit, offset),
    staleTime: STALE_TIME_MS,
  })
}

export const useSearchPacks = (
  gameId: number,
  languageId: number,
  query: string,
  limit: number = 20,
  offset: number = 0
) => {
  return useQuery({
    queryKey: ['packs/search', gameId, languageId, query, limit, offset],
    queryFn: () => packsAPI.searchPacks(gameId, languageId, query, limit, offset),
    staleTime: STALE_TIME_MS,
    placeholderData: keepPreviousData,
    enabled: false,
  })
}

// Create a new pack (mutation)
export const useCreatePack = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: packsAPI.createPack,
    onSuccess: () => {
      // Invalidate and refetch packs list after creation
      queryClient.invalidateQueries({ queryKey: ['packs'] })
    },
  })
}
