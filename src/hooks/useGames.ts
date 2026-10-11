import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { STALE_TIME_MS } from '../config/query'
import { gamesAPI } from '../services/api'

export const useGames = (limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ['games', limit, offset],
    queryFn: () => gamesAPI.getGames(limit, offset),
    staleTime: STALE_TIME_MS,
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
    staleTime: STALE_TIME_MS,
    placeholderData: keepPreviousData,
    enabled: false,
  })
}
