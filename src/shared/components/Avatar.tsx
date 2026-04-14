import { getInitials } from '@/shared/utils/helpers'

const sizeMap: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
}

const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
  'bg-amber-500', 'bg-cyan-500', 'bg-red-500', 'bg-indigo-500',
]

function getColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
}

export function Avatar({ name, size = 'md' }: AvatarProps) {
  return (
    <div
      className={`${sizeMap[size]} ${getColor(name)} inline-flex items-center justify-center rounded-full font-medium text-white`}
      title={name}
    >
      {getInitials(name)}
    </div>
  )
}
