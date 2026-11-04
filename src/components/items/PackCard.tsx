import { Pack } from '../../types'
import { ItemCard } from './ItemCard'

export const PackCard = ({ pack }: { pack: Pack }) =>
  ItemCard({
    title: pack.name,
    titleClass: 'line-clamp-2 min-h-[36px]',
    image: pack.image_url,
    watermark: true,
    tags: [pack.code, pack.game_name, pack.language_name],
  })
