import { Storage } from '../../types'
import { ItemCard } from './ItemCard'

export const StorageCard = ({ storage }: { storage: Storage }) =>
  ItemCard({ title: `${storage.code} | ${storage.name}`, description: storage.description })
