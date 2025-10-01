import { useQuery, keepPreviousData, useMutation } from '@tanstack/react-query'
import { kardsAPI } from '../services/api'

export const useKards = (limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ['kards', limit, offset],
    queryFn: () => kardsAPI.getKards(limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useKard = (id: number = 1) => {
  return useQuery({
    queryKey: ['kard', id],
    queryFn: () => kardsAPI.getKard(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: false,
  })
}

// ✅ Create a new pack (mutation)
export const useCreateKard = () => {

  return useMutation({
    mutationFn: kardsAPI.createPack,
    // onSuccess: () => {
    //   // Invalidate and refetch packs list after creation
    //   queryClient.invalidateQueries({ queryKey: ['packs'] })
    // },
  })
}
