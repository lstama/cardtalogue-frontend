import { useState } from "react"
import { useClickOutside } from "../../hooks/useClickOutside"

type FilterOption = {
  id: number
  name: string
}

type SearchBarProps = {
  filters?: {
    label: string
    options: FilterOption[]
    value: number
    onChange: (val: number) => void
  }[]
  query: string
  setQuery: (val: string) => void
  onSearch: () => void
}

export const SearchBar = ({ filters = [], query, setQuery, onSearch }: SearchBarProps) => {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const closeClickOutside = useClickOutside(() => setOpenDropdown(null))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSearch()
      }}
      className="mx-auto"
    >
      <div className="flex">
        {/* Render filters */}
        {filters.map((filter, idx) => {
          const isFirst = idx === 0
          return (
            <div key={filter.label} className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === idx ? null : idx)}
                className={`whitespace-nowrap overflow-hidden shrink-0 z-10 inline-flex items-center
                    py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-50 border-r border-t border-b border-gray-300 dark:border-gray-600
                    hover:bg-gray-200 focus:ring-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white dark:focus:border-gray-600"
                  ${isFirst ? "rounded-s-lg border-l" : ""}`}
              >
                {filter.options.find((o) => o.id === filter.value)?.name || filter.label}
                <svg
                  className="w-2.5 h-2.5 ml-2.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>

              {openDropdown === idx && (
                <div ref={closeClickOutside}>
                <div className="absolute z-10 mt-1 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700">
                  <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                    {filter.options.map((opt) => (
                      <li key={opt.id}>
                        <button
                          type="button"
                          className="inline-flex w-full px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          onClick={() => {
                            filter.onChange(opt.id)
                            setOpenDropdown(null)
                          }}
                        >
                          {opt.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Search input */}
        <div className="relative w-full">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 
              border border-gray-300 focus:ring-blue-500 focus:border-blue-500 
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500
              ${
                filters.length > 0
                  ? "rounded-none border-l-0 rounded-e-lg"
                  : "rounded-s-lg rounded-e-lg"
              }`}
            placeholder="Search..."
          />
          <button
            type="submit"
            className="absolute top-0 right-0 p-2.5 text-sm font-medium h-full text-white 
              bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 
              focus:ring-4 focus:outline-none focus:ring-blue-300 
              dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            <svg
              className="w-4 h-4"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
            <span className="sr-only">Search</span>
          </button>
        </div>
      </div>
    </form>
  )
}
