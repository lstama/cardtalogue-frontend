import { useState } from "react"
import { useClickOutside } from '../../hooks/useClickOutside'

type Option = { id: number; name: string }

function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]/gi, "")
}

export function SearchableSelect({
  label,
  value,
  options,
  onChange,
  onSearchQueryChange,
}: {
  label: string
  value: number
  options: Option[]
  onChange: (id: number) => void
  onSearchQueryChange: (query: string) => void
}) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)

  const filtered = options.filter((opt) =>
    normalize(opt.name).includes(normalize(search))
  )

  const selected = options.find((opt) => opt.id === value)

  const closeClickOutside = useClickOutside(() => {
          setOpen(false)
      })

  return (
    <div className="relative" ref={closeClickOutside}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border p-2 rounded bg-gray-200 dark:bg-gray-700 
                   border-gray-300 dark:border-gray-700 
                   text-gray-900 dark:text-gray-100 text-left"
      >
        {selected ? selected.name : label}
      </button>

      {open && (
        <div className="absolute z-10 mt-1 w-full border rounded bg-white dark:bg-gray-800 
                        border-gray-300 dark:border-gray-700 shadow-lg">
          {/* Search input */}
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              onSearchQueryChange(e.target.value)
            }}
            placeholder={`Search ${label.replace("Select ","")}...`}
            className="w-full p-2 border-b 
                       border-gray-200 dark:border-gray-700 
                       bg-white dark:bg-gray-800 
                       text-gray-900 dark:text-gray-100"
          />

          {/* Scrollable list */}
          <ul className="max-h-40 overflow-y-auto">
            {filtered.map((opt) => (
              <li
                key={opt.id}
                onClick={() => {
                  onChange(opt.id)
                  setOpen(false)
                  setSearch("")
                }}
                className={`px-3 py-2 cursor-pointer 
                            hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 
                            ${opt.id === value ? "bg-gray-200 dark:bg-gray-600" : ""}`}
              >
                {opt.name}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-gray-500 dark:text-gray-400">
                No results
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
