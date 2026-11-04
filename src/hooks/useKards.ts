import { useQuery, keepPreviousData, useMutation } from '@tanstack/react-query'
import { STALE_TIME_MS } from '../config/query'
import { kardsAPI, protectedKardsAPI } from '../services/api'

export const useKards = (limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ['kards', limit, offset],
    queryFn: () => kardsAPI.getKards(limit, offset),
    staleTime: STALE_TIME_MS,
  })
}

export const useKard = (id: number = 1) => {
  return useQuery({
    queryKey: ['kard', id],
    queryFn: () => kardsAPI.getKard(id),
    staleTime: STALE_TIME_MS,
  })
}

export const useProtectedKard = (id: number | null) => {
  return useQuery({
    queryKey: ['protected-kard', id],
    queryFn: () => {
      if (id === null) throw new Error('ID is required')
      return protectedKardsAPI.getKard(id)
    },
    staleTime: STALE_TIME_MS,
    enabled: id !== null,
  })
}

export const useSearchKards = (
  gameId: number,
  languageId: number,
  packId: number,
  query: string,
  limit: number = 20,
  offset: number = 0
) => {
  return useQuery({
    queryKey: ['kards/search', gameId, languageId, packId, query, limit, offset],
    queryFn: () => kardsAPI.searchKards(gameId, languageId, packId, query, limit, offset),
    staleTime: STALE_TIME_MS,
    placeholderData: keepPreviousData,
    enabled: false,
  })
}

// ✅ Create a new kard (mutation)
export const useCreateKard = () => {

  return useMutation({
    mutationFn: kardsAPI.createKard,
    // onSuccess: () => {
    //   // Invalidate and refetch packs list after creation
    //   queryClient.invalidateQueries({ queryKey: ['packs'] })
    // },
  })
}

// ✅ Update a card (mutation)
export const useUpdateKard = (id: number) => {
  return useMutation({
    mutationFn: (data: any) => protectedKardsAPI.updateKard(id, data),
  })
}
