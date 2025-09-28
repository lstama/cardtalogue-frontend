import { Button } from './Button'

interface ErrorMessageProps {
  error: Error | null
  retry?: () => void
}

export const ErrorMessage = ({ error, retry }: ErrorMessageProps) => {
  return (
    <div className="text-center py-8">
      <div className="text-red-600 mb-4">
        <p className="text-lg font-medium">Oops! Something went wrong</p>
        <p className="text-sm text-gray-600 mt-1">
          {error?.message || 'An unexpected error occurred'}
        </p>
      </div>
      {retry && (
        <Button onClick={retry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  )
}
