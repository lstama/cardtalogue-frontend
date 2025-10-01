import { useState } from "react"
import { useClickOutside } from '../../hooks/useClickOutside'

type Option = { id: number|string; name: string }

export function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: number | string
  options: Option[]
  onChange: (id: number | string) => void
}) {
  const [open, setOpen] = useState(false)

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

          {/* Scrollable list */}
          <ul className="max-h-40 overflow-y-auto">
            {options.map((opt) => (
              <li
                key={opt.id}
                onClick={() => {
                  onChange(opt.id)
                  setOpen(false)
                }}
                className={`px-3 py-2 cursor-pointer 
                            hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 
                            ${opt.id === value ? "bg-gray-200 dark:bg-gray-600" : ""}`}
              >
                {opt.name}
              </li>
            ))}
            {options.length === 0 && (
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
