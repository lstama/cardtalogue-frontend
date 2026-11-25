import { useEffect, useImperativeHandle, useRef } from 'react'
import type { Ref } from 'react'
import { CAP_API_ENDPOINT } from '../../config/app'
import { useCapWidget } from '../../hooks/useCapWidget'

export interface CaptchaWidgetHandle {
  /** Clear the solved token and remount the widget (a consumed token must not be reused). */
  reset: () => void
  /** Recover from a widget load/solve failure by remounting the widget. */
  retry: () => void
}

export interface CaptchaWidgetProps {
  /** Called with the solved token, or null when the widget is pending/reset/failed. */
  onChange: (token: string | null) => void
  /** When false the widget is not mounted at all (used when the gate is off). */
  enabled?: boolean
  /** Cap server endpoint; defaults to the app-wide CAP_API_ENDPOINT. */
  endpoint?: string
  ref?: Ref<CaptchaWidgetHandle>
}

/**
 * Reusable Cap proof-of-work widget. Wraps `useCapWidget` and renders the widget
 * host plus its load/solve failure state, with a retry path.
 */
export const CaptchaWidget = ({
  onChange,
  enabled = true,
  endpoint = CAP_API_ENDPOINT,
  ref,
}: CaptchaWidgetProps) => {
  const { containerRef, token, status, error, reset, retry } = useCapWidget(endpoint, enabled)

  // Keep the latest callback without re-running the notification effect.
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  useEffect(() => {
    onChangeRef.current(token)
  }, [token])

  useImperativeHandle(ref, () => ({ reset, retry }), [reset, retry])

  if (!enabled) return null

  return (
    <div className="space-y-2" data-testid="captcha-widget">
      <div ref={containerRef} />
      {error ? (
        <div
          role="alert"
          className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={retry}
            className="rounded border border-amber-400 px-2 py-1 font-semibold hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900"
          >
            Retry verification
          </button>
        </div>
      ) : status === 'loading' ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">Loading verification…</p>
      ) : null}
    </div>
  )
}
