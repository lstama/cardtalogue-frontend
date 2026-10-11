const ACCENTS = {
  green: {
    active: 'bg-green-600 text-white border-green-600',
    idle:
      'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-green-400 dark:text-gray-100',
  },
  blue: {
    active: 'bg-blue-600 text-white border-blue-600',
    idle:
      'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:text-gray-100',
  },
  purple: {
    active: 'bg-purple-600 text-white border-purple-600',
    idle:
      'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:text-gray-100',
  },
}

// A row of "pick one of these values" buttons: the selected one is highlighted.
// Used for quantity, for-sale, visibility, rarity and storage choices.
export const ChoiceButtons = ({
  values,
  selected,
  onChange,
  accent = 'blue',
  itemClass = 'flex-1 py-2 rounded-lg font-bold border transition-all',
  containerClass = 'flex gap-2',
  labelFor,
}: {
  values: any[]
  selected: any
  onChange: (value: any) => void
  accent?: 'green' | 'blue' | 'purple'
  itemClass?: string
  containerClass?: string
  labelFor?: (value: any) => string
}) => (
  <div className={containerClass}>
    {values.map((value) => (
      <button
        key={String(value)}
        type="button"
        onClick={() => onChange(value)}
        className={`${itemClass} ${ACCENTS[accent][selected === value ? 'active' : 'idle']}`}
      >
        {labelFor ? labelFor(value) : String(value)}
      </button>
    ))}
  </div>
)
