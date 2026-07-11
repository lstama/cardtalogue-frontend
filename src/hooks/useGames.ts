import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { gamesAPI } from '../services/api'

/**
 * Fetch a list of Games.
 */
export const useGames = (limit: number = 20, offset: number = 0, query: string = '') => {
  return useQuery({
    queryKey: ['games', query, limit, offset],
    queryFn: () => {
      if (query) {
        return gamesAPI.searchGames(query, limit, offset)
      }
      return gamesAPI.getGames(limit, offset)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch a single Game by ID (if available in API).
 * Note: Currently no getGame endpoint in gamesAPI.
 */
export const useGame = (id: number = 1) => {
  // Placeholder for future implementation
  return useQuery({
    queryKey: ['game', id],
    queryFn: () => { throw new Error('GetGame API not implemented') },
    enabled: false,
  })
}

/**
 * Search Games with various filters.
 */
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
    enabled: false, // Only run when manually triggered via refetch
  })
}
