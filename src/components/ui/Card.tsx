import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export const Card = ({ children, className = '', onClick }: CardProps) => {
  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''} ${className} dark:bg-gray-800 dark:border-gray-700`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export const CardContent = ({ children, className = '' }: { children: ReactNode, className?: string }) => {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  )
}
