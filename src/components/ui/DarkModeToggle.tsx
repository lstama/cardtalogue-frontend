// src/components/DarkModeToggle.tsx
import { useTheme } from '../../contexts/ThemeContext'

export const DarkModeToggle = () => {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    >
      <div className="text-sm font-medium text-gray-800 dark:text-gray-300">
              {theme === "light" ? "☀️ Light": "🌙 Dark"}
              </div>
    </button>
  )
}
