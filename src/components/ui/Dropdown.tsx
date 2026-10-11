import { useState } from 'react'
import { useClickOutside } from '../../hooks/useClickOutside'

type Option = { id: number | string; name: string }

const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/gi, '')

const BUTTON =
  'w-full border p-2 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-left'
const PANEL =
  'absolute z-10 mt-1 w-full border rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 shadow-lg'
const ROW = 'px-3 py-2 cursor-pointer hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700'
const INPUT =
  'w-full p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'

// Shared dropdown used by Select and SearchableSelect.
// When `onSearch` is provided the dropdown gains a search input that filters the options.
export const Dropdown = ({
  label,
  value,
  options,
  onChange,
  onSearch,
}: {
  label: string
  value: number | string
  options: Option[]
  onChange: (id: number | string) => void
  onSearch?: (query: string) => void
}) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = query
    ? options.filter((opt) => normalize(opt.name).includes(normalize(query)))
    : options
  const selected = options.find((opt) => opt.id === value)
  const closeClickOutside = useClickOutside(() => setOpen(false))

  return (
    <div className="relative" ref={closeClickOutside}>
      <button type="button" onClick={() => setOpen(!open)} className={BUTTON}>
        {selected ? selected.name : label}
      </button>

      {open && (
        <div className={PANEL}>
          {onSearch && (
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                onSearch(e.target.value)
              }}
              placeholder={`Search ${label.replace('Select ', '')}...`}
              className={INPUT}
            />
          )}

          <ul className="max-h-40 overflow-y-auto">
            {filtered.map((opt) => (
              <li
                key={opt.id}
                onClick={() => {
                  onChange(opt.id)
                  setOpen(false)
                  setQuery('')
                }}
                className={`${ROW} ${opt.id === value ? 'bg-gray-200 dark:bg-gray-600' : ''}`}
              >
                {opt.name}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-gray-500 dark:text-gray-400">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
