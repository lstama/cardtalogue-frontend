import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { kardsAPI, protectedKardsAPI } from '../services/api'
import { CreateKardRequest } from '../types'

/**
 * Fetch a list of Kards with optional filters.
 */
export const useKards = (
  gameId: number = 0,
  languageId: number = 0,
  packId: number = 0,
  query: string = '',
  limit: number = 20,
  offset: number = 0
) => {
  return useQuery({
    queryKey: ['kards', gameId, languageId, packId, query, limit, offset],
    queryFn: () => kardsAPI.searchKards(gameId, languageId, packId, query, limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch a single Kard by ID.
 */
export const useKard = (id: number = 1) => {
  return useQuery({
    queryKey: ['kard', id],
    queryFn: () => kardsAPI.getKard(id),
    staleTime: 5 * 60 * 1000, // 5 minutes,
  })
}

/**
 * Fetch a single Protected Kard by ID.
 */
export const useProtectedKard = (id: number | null) => {
  return useQuery({
    queryKey: ['protected-kard', id],
    queryFn: () => {
      if (id === null) throw new Error('ID is required')
      return protectedKardsAPI.getKard(id)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes,
    enabled: id !== null,
  })
}

/**
 * Create a new Kard.
 */
export const useCreateKard = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: kardsAPI.createKard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kards'] })
    },
  })
}

/**
 * Update a Protected Kard (e.g., updating stock).
 */
export const useUpdateKard = (id: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateKardRequest) => protectedKardsAPI.updateKard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protected-kard', id] })
      queryClient.invalidateQueries({ queryKey: ['kards'] })
    },
  })
}
