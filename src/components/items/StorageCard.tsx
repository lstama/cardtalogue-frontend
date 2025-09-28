import { Storage } from '../../types'
import { Card, CardContent } from '../ui/Card'

interface StorageCardProps {
  storage: Storage
}

export const StorageCard = ({ storage }: StorageCardProps) => {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        {/* Storage Name */}
        <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[48px] dark:text-gray-300">
          {storage.code} | {storage.name}
        </h3>
        
        {/* Storage description */}
        <div className="relative mb-3">
          <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[48px] dark:text-gray-300">
          {storage.description}
          </h3>
        </div>
        
        {/* Storage, Language, Code */}
        {/* <div className="text-sm text-gray-600 space-y-1 dark:text-gray-300"> */}
          {/* <div className="flex items-center justify-between"> */}
            {/* <div className="flex items-center">
                <StaticTag text={pack.code} color='green'/>
                <StaticTag text={pack.storage_name} color='blue'/>
                <StaticTag text={pack.language_name} color='red'/>
          </div>
        </div> */}
      </CardContent>
    </Card>
  )
}
