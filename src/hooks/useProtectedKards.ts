import { useQuery } from '@tanstack/react-query'
import { STALE_TIME_MS } from '../config/query'
import { protectedKardsAPI } from '../services/api'

export const useProtectedKards = (limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ['protected-kards', limit, offset],
    queryFn: () => protectedKardsAPI.getKards(limit, offset),
    staleTime: STALE_TIME_MS,
  })
}

export const useProtectedKard = (id: number = 1) => {
  return useQuery({
    queryKey: ['protected-kard', id],
    queryFn: () => protectedKardsAPI.getKard(id),
    staleTime: STALE_TIME_MS,
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
//     staleTime: STALE_TIME_MS,
//     placeholderData: keepPreviousData,
//     enabled: false,
//   })
// }
