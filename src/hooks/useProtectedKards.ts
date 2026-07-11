import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { protectedKardsAPI } from '../services/api'

/**
 * Fetch a list of Protected Kards.
 */
export const useProtectedKards = (limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ['protected-kards', limit, offset],
    queryFn: () => protectedKardsAPI.getKards(limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
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
 * Update a Protected Kard (e.g., updating stock).
 * Note: This is shared logic with useUpdateKard in useKards.ts but kept here for specific context if needed.
 * We will primarily use the one in useKards.ts for stock updates.
 */
export const useUpdateProtectedKard = (id: number) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => protectedKardsAPI.updateKard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protected-kard', id] })
      queryClient.invalidateQueries({ queryKey: ['protected-kards'] })
    },
  })
}
