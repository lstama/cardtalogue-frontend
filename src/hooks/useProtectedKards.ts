import { useQuery } from '@tanstack/react-query'
import { protectedKardsAPI } from '../services/api'

export const useProtectedKards = (limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ['kards', limit, offset],
    queryFn: () => protectedKardsAPI.getKards(limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useProtectedKard = (id: number = 1) => {
  return useQuery({
    queryKey: ['kard', id],
    queryFn: () => protectedKardsAPI.getKard(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// export const useProtectedSearchKards = (
//   gameId: number,
//   languageId: number,
//   query: string,
//   limit: number = 20,
//   offset: number = 0
// ) => {
//   return useQuery({
//     queryKey: ['kards/search', gameId, languageId, query, limit, offset],
//     queryFn: () => protectedKardsAPI.searchKards(gameId, languageId, query, limit, offset),
//     staleTime: 5 * 60 * 1000,
//     placeholderData: keepPreviousData,
//     enabled: false,
//   })
// }
