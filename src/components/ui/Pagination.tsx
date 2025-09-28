import { Button } from './Button'

interface PaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
}

export const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  if (totalPages <= 1) return null
  
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []
    
    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i)
    }
    
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }
    
    rangeWithDots.push(...range)
    
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }
    
    return rangeWithDots
  }
  
  return (
    <nav className="flex items-center justify-center space-x-1 mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      
      {getVisiblePages().map((page, index) => (
        <div key={index}>
          {page === '...' ? (
            <span className="px-3 py-2 text-gray-500">...</span>
          ) : (
            <Button
              variant={page === currentPage ? 'primary' : 'outline'}
              size="sm"
              onClick={() => typeof page === 'number' && onPageChange(page)}
            >
              {page}
            </Button>
          )}
        </div>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </nav>
  )
}
