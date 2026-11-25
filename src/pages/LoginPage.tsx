import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CaptchaWidget } from '../components/ui/CaptchaWidget'
import { CAPTCHA_REQUIRED } from '../config/app'
import { ApiError, isCaptchaError } from '../services/api'
import type { FormEvent } from 'react'
import type { CaptchaWidgetHandle } from '../components/ui/CaptchaWidget'

// Map a failed login to a message. CAPTCHA rejections get their own wording so
// they are not reported as bad credentials; 401 keeps the generic
// bad-credential message. With CAPTCHA_MODE=on the backend gate runs inline in
// the login handler *before* the credential check and answers 400 with
// `{ error: "captcha required" | "captcha failed" | "captcha unavailable" }`
// (the unused `RequireCaptcha` middleware's 403/502 is not the enforcement path).
function loginErrorMessage(error: unknown): string {
  if (isCaptchaError(error)) {
    const message = error instanceof Error ? error.message.toLowerCase() : ''
    if (message.includes('unavailable')) {
      return 'Verification is temporarily unavailable. Please try again in a moment.'
    }
    if (message.includes('required')) {
      return 'Verification required. Complete the CAPTCHA, then sign in.'
    }
    return 'Verification failed or expired. Solve the CAPTCHA again and retry.'
  }

  if (error instanceof ApiError) {
    if (error.status === 401) return 'Invalid email or password'
    if (error.status === 400) return error.message || 'Invalid email or password'
    return 'Login failed. Please try again.'
  }

  // A fetch/network failure (offline, DNS failure, blocked or aborted request)
  // rejects with a TypeError (or a DOMException such as AbortError) rather than
  // an ApiError. Surface the "unreachable server" copy instead of the generic
  // failure, and never silently swallow it as bad credentials.
  if (error instanceof TypeError) return 'Unable to reach the server. Please try again.'
  if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
    return 'Unable to reach the server. Please try again.'
  }

  return 'Login failed. Please try again.'
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [capToken, setCapToken] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const captchaRef = useRef<CaptchaWidgetHandle>(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  // Fail closed: with the gate on, the form cannot be submitted before the
  // widget yields a token.
  const verificationPending = CAPTCHA_REQUIRED && !capToken

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting || verificationPending) return

    setError('')
    setSubmitting(true)
    // Capture the token for this attempt only; the widget is remounted below so
    // a consumed token is never reused.
    const token = capToken ?? undefined

    try {
      await login({email: email, password: password}, CAPTCHA_REQUIRED ? token : undefined)
      navigate('/') // redirect after login
    } catch (err) {
      setError(loginErrorMessage(err))
    } finally {
      setSubmitting(false)
      if (CAPTCHA_REQUIRED) {
        captchaRef.current?.reset()
      }
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
          <div role="alert" data-testid="login-error" className="bg-red-100 text-red-700 p-2 rounded">{error}</div>
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

        <CaptchaWidget
          ref={captchaRef}
          enabled={CAPTCHA_REQUIRED}
          onChange={setCapToken}
        />

        <button
          data-testid="login-submit"
          type="submit"
          disabled={submitting || verificationPending}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-600"
        >
          {submitting ? 'Signing in…' : 'Login'}
        </button>
      </form>
    </div>
  )
}
