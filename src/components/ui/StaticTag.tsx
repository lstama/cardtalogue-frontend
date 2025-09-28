interface StaticTagProps {
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple'
    text?: string
}

export const StaticTag = ({ color = 'blue', text = 'Default' }: StaticTagProps) => {
    const colors = {
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    }

    return (
        <span className={`text-xs font-medium me-1 px-2.5 py-0.5 rounded-sm ${colors[color]}`}>
            {text}
        </span>
    )
}
