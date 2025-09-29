// pages/StoragesPage.tsx
import { SearchLayout } from "../components/layout/Search"
import { StorageCard } from "../components/items/StorageCard"
import { useSearchStorages } from "../hooks/useStorages"

export const StoragesPage = () => {
  return (
    <SearchLayout
      title="Card Storages"
      description="Card Storages location information"
      useSearch={(query, limit, offset) =>
        useSearchStorages(query, limit, offset)
      }
      renderItem={(storage) => <StorageCard key={storage.id} storage={storage} />}
      noResultsText= "No storage found"
    />
  )
}
