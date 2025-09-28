import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { DarkModeToggle } from '../ui/DarkModeToggle'

export default function Navbar() {
  const { accessToken, logout } = useAuth()

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
      <div className="space-x-4">
        <Link to="/games" className="hover:text-blue-300">
          Games
        </Link>
        <Link to="/packs" className="hover:text-blue-300">
          Packs
        </Link>

        {accessToken && (
          <Link to="/storages" className="hover:text-blue-300">
            Storages
          </Link>
        )}
      </div>

      {accessToken ? (
        <button
          onClick={logout}
          className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
        >
          Logout
        </button>
      ) : (
        <Link
          to="/"
          className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
        >
          Login
        </Link>
      )}
      <DarkModeToggle />
    </nav>
  )
}
