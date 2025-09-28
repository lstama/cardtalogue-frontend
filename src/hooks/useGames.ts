import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { gamesAPI } from '../services/api'

export const useGames = (limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ['games', limit, offset],
    queryFn: () => gamesAPI.getGames(limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useSearchGames = (
  query: string,
  limit: number = 20,
  offset: number = 0
) => {
  return useQuery({
    queryKey: ['games/search', query, limit, offset],
    queryFn: () => gamesAPI.searchGames(query, limit, offset),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: false,
  })
}
