import { Card, CardContent } from '../ui/Card'
import { StaticTag } from '../ui/StaticTag'

type TagColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple'

const TAG_COLORS: TagColor[] = ['green', 'blue', 'red']

// Shared shell for the "item" cards (games, packs, storages).
// Everything optional is skipped, so each item type only passes what it has.
export const ItemCard = ({
  title,
  titleClass = 'mb-3 line-clamp-2 min-h-[48px]',
  image,
  watermark = false,
  tags = [],
  description,
}: {
  title: string
  titleClass?: string
  image?: string
  watermark?: boolean
  tags?: string[]
  description?: string
}) => (
  <Card className="h-full">
    <CardContent className="p-4">
      <h3 className={`font-semibold text-gray-900 dark:text-gray-300 ${titleClass}`}>{title}</h3>

      {image && (
        <div className="relative mb-2 mt-0">
          <div className="aspect-[230/330] w-full bg-gray-100 rounded-md overflow-hidden relative">
            <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />
            {watermark && (
              <span
                className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-gray-900 opacity-50 transform rotate-45"
              >
                SAMPLE
              </span>
            )}
          </div>
        </div>
      )}

      {description && (
        <div className="relative mb-3">
          <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[48px] dark:text-gray-300">
            {description}
          </h3>
        </div>
      )}

      {tags.length > 0 && (
        <div className="text-sm text-gray-600 space-y-1 dark:text-gray-300">
          <div className="flex flex-wrap items-center gap-1">
            {tags.map((text, i) => (
              <StaticTag text={text} color={TAG_COLORS[i % TAG_COLORS.length]} />
            ))}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
)
