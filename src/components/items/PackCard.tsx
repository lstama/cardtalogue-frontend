import { Pack } from '../../types'
import { Card, CardContent } from '../ui/Card'
import { StaticTag } from '../ui/StaticTag'

interface PackCardProps {
  pack: Pack
}

export const PackCard = ({ pack }: PackCardProps) => {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        {/* Pack Name */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[36px] dark:text-gray-300">
          {pack.name}
        </h3>

        {/* Image Container - Fixed aspect ratio */}
        <div className="relative mb-2 mt-0">
          <div className="aspect-[230/330] w-full bg-gray-100 rounded-md overflow-hidden relative">
            <img
              src={pack.image_url}
              alt={pack.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <span
              className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-gray-900 opacity-50 transform rotate-45"
            >
              SAMPLE
            </span>
          </div>
        </div>

        {/* Game, Language, Code */}
        <div className="text-sm text-gray-600 space-y-1 dark:text-gray-300">
          {/* <div className="flex items-center justify-between"> */}
          <div className="flex flex-wrap items-center gap-1">
            <StaticTag text={pack.code} color='green' />
            <StaticTag text={pack.game_name} color='blue' />
            <StaticTag text={pack.language_name} color='red' />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
