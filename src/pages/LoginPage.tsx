import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { FormEvent } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login({email: email, password: password})
      navigate('/') // redirect after login
    } catch (err) {
      console.log(err)
      setError('Invalid email or password')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md w-96 space-y-4 dark:bg-gray-800"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">Login</h1>

        {error && (
          <div data-testid="login-error" className="bg-red-100 text-red-700 p-2 rounded">{error}</div>
        )}

        <input
          data-testid="login-email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 text-sm text-gray-900 bg-gray-50 
              border border-gray-300 focus:ring-blue-500 focus:border-blue-500 
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
          required
        />

        <input
          data-testid="login-password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 text-sm text-gray-900 bg-gray-50 
              border border-gray-300 focus:ring-blue-500 focus:border-blue-500 
              dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
          required
        />

        <button
          data-testid="login-submit"
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  )
}
