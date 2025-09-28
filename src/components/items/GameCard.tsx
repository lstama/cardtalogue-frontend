import { Game } from '../../types'
import { Card, CardContent } from '../ui/Card'

interface GameCardProps {
  game: Game
}

export const GameCard = ({ game }: GameCardProps) => {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        {/* Game Name */}
        <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[48px] dark:text-gray-300">
          {game.name}
        </h3>
        
        {/* Image Container - Fixed aspect ratio */}
        {/* <div className="relative mb-3">
          <div className="aspect-[230/330] w-full bg-gray-100 rounded-md overflow-hidden">
            <img
              src={game.image_url}
              alt={game.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div> */}
        
        {/* Game, Language, Code */}
        {/* <div className="text-sm text-gray-600 space-y-1 dark:text-gray-300"> */}
          {/* <div className="flex items-center justify-between"> */}
            {/* <div className="flex items-center">
                <StaticTag text={pack.code} color='green'/>
                <StaticTag text={pack.game_name} color='blue'/>
                <StaticTag text={pack.language_name} color='red'/>
          </div>
        </div> */}
      </CardContent>
    </Card>
  )
}
