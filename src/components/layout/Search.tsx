// components/layout/SearchLayout.tsx
import { ReactNode, useState, useEffect } from "react"
import { SearchBar } from "../ui/SearchBar"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { ErrorMessage } from "../ui/ErrorMessage"
import { Pagination } from "../ui/Pagination"

type FilterOption = { id: number; name: string }
type Filter = {
  label: string
  value: number
  onChange: (val: number) => void
  options: FilterOption[]
}

type SearchLayoutProps<T> = {
  title: string
  description: string
  useSearch: (query: string, limit: number, offset: number) => {
    data?: { data: T[]; meta: { total: number } }
    isLoading: boolean
    error: unknown
    refetch: () => void
    isFetching: boolean
  }
  renderItem: (item: T) => ReactNode
  filters?: Filter[]
  itemsPerPage?: number
  noResultsText?: string
  initialQuery?: string
}

export function SearchLayout<T>({
  title,
  description,
  useSearch,
  renderItem,
  filters = [],
  itemsPerPage = 20,
  noResultsText = "No results found",
  initialQuery = "",
}: SearchLayoutProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)
  const [query, setQuery] = useState(initialQuery)

  const offset = (currentPage - 1) * itemsPerPage
  const { data, isLoading, error, refetch, isFetching } = useSearch(
    query,
    itemsPerPage,
    offset
  )

  const handleSearch = () => {
    setCurrentPage(1)
    refetch()
  }

   // Run search once on mount
  useEffect(() => {
    handleSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl dark:text-gray-300">
          {title}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      {/* Search Bar */}
      <SearchBar
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
        filters={filters}
      />

      <div className="my-6 border-t border-gray-200" />

      {/* Content */}
      {isLoading || isFetching ? (
        <div className="flex justify-center items-center min-h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorMessage error={error as Error} retry={handleSearch} />
      ) : data?.data?.length ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {data.data.map(renderItem)}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={data.meta.total}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => {
              setCurrentPage(page)
              refetch()
            }}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">{noResultsText}</p>
        </div>
      )}
    </div>
  )
}
