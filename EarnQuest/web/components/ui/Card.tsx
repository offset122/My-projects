import { ReactNode } from 'react'
import { classNames } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: boolean
}

export default function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={classNames(
      'bg-white rounded-xl shadow-sm border border-gray-200',
      padding ? 'p-6' : '',
      className
    )}>
      {children}
    </div>
  )
}
