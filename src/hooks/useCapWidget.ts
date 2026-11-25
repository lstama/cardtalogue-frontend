import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

// How long to wait for the captcha widget's CDN script / custom element to
// register before failing closed. The widget is loaded from a <script defer> in
// index.html, so `customElements.whenDefined('cap-widget')` never settles when
// that request fails (offline, blocked CDN) — without a timeout the gate would
// hang forever with the submit button disabled and no explanation.
export const CAP_WIDGET_LOAD_TIMEOUT_MS = 10_000

const CAP_WIDGET_TAG = 'cap-widget'
const CAP_SOLVE_EVENT = 'solve'
const CAP_ERROR_EVENT = 'error'

const LOAD_FAILED_MESSAGE =
  'The verification widget could not be loaded. Check your connection and retry.'
const SOLVE_FAILED_MESSAGE =
  'Verification could not be completed. Please retry the verification.'

export type CapWidgetStatus = 'disabled' | 'loading' | 'ready' | 'error'

export interface UseCapWidgetResult {
  /** Attach to the element that hosts the `<cap-widget>` custom element. */
  containerRef: RefObject<HTMLDivElement | null>
  /** Proof-of-work token from the last successful solve, or null. */
  token: string | null
  status: CapWidgetStatus
  error: string | null
  /**
   * Clear the token and remount the widget (a consumed token must not be
   * reused). Also invalidates the current widget run synchronously, so a
   * pending solve/error from the old widget cannot write back into state.
   */
  reset: () => void
  /** Same as reset, used to recover after a load/solve failure. */
  retry: () => void
}

/**
 * Owns the Cap proof-of-work widget lifecycle: creates the `<cap-widget>`
 * element, points it at `endpoint`, tracks the solved token, and remounts it
 * when a token is consumed. Fail-closed: the status becomes `error` if the
 * custom element does not register within `CAP_WIDGET_LOAD_TIMEOUT_MS`.
 *
 * State is only written from event handlers and async callbacks, never
 * synchronously in the effect body.
 *
 * Every effect run captures a generation id. `reset()`/`retry()` bump the
 * generation synchronously, so callbacks from an attached-but-doomed widget are
 * invalidated immediately — before React runs the passive effect cleanup — and
 * cannot restore a consumed token (or a stale error) into the fresh widget.
 */
export function useCapWidget(endpoint: string, enabled = true): UseCapWidgetResult {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [status, setStatus] = useState<CapWidgetStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)

  // Monotonically increasing run id (see the hook comment). A ref, so `reset()`
  // can invalidate the live run in the same tick, without waiting for a render.
  const generationRef = useRef(0)

  useEffect(() => {
    if (!enabled) return

    const generation = ++generationRef.current
    let disposed = false
    let widget: HTMLElement | null = null
    let handleSolve: ((event: Event) => void) | null = null
    let handleError: (() => void) | null = null

    // Stale means either the passive cleanup already ran (`disposed`) or a newer
    // run superseded this one — `reset()`/`retry()` bump the generation before
    // that cleanup exists, closing the reset-to-cleanup window.
    const isStale = () => disposed || generation !== generationRef.current

    const fail = (message: string) => {
      if (isStale()) return
      setToken(null)
      setError(message)
      setStatus('error')
    }

    if (typeof customElements === 'undefined' || typeof customElements.whenDefined !== 'function') {
      fail(LOAD_FAILED_MESSAGE)
      return () => {
        disposed = true
      }
    }

    const timeoutId = setTimeout(() => {
      fail(LOAD_FAILED_MESSAGE)
    }, CAP_WIDGET_LOAD_TIMEOUT_MS)

    customElements.whenDefined(CAP_WIDGET_TAG).then((constructor) => {
      if (isStale()) return
      // The element registered before the deadline, so cancel the fail-closed
      // timer before the container check below (otherwise it would still fire
      // `fail()` after a successful registration).
      clearTimeout(timeoutId)
      if (!constructor || !containerRef.current) return

      widget = document.createElement(CAP_WIDGET_TAG)
      widget.setAttribute('data-cap-api-endpoint', endpoint)

      // Guard every listener with `isStale` (disposed or superseded run) and
      // remove them on cleanup: a detached, or attached-but-doomed, widget must
      // never write a token or an error into the state of the remounted widget.
      handleSolve = (event) => {
        if (isStale()) return
        const solved = (event as CustomEvent<{ token?: string }>).detail?.token
        if (!solved) return
        setToken(solved)
        setError(null)
        setStatus('ready')
      }
      handleError = () => {
        if (isStale()) return
        fail(SOLVE_FAILED_MESSAGE)
      }

      widget.addEventListener(CAP_SOLVE_EVENT, handleSolve)
      widget.addEventListener(CAP_ERROR_EVENT, handleError)

      containerRef.current.replaceChildren(widget)
      setError(null)
      setStatus('ready')
    })

    return () => {
      disposed = true
      clearTimeout(timeoutId)
      if (widget) {
        if (handleSolve) widget.removeEventListener(CAP_SOLVE_EVENT, handleSolve)
        if (handleError) widget.removeEventListener(CAP_ERROR_EVENT, handleError)
        widget.remove()
      }
    }
  }, [enabled, endpoint, revision])

  const reset = useCallback(() => {
    // Invalidate the current widget run synchronously: React only runs the
    // passive cleanup (which sets `disposed`) after the render below, so the
    // old widget's listeners are still live until then.
    generationRef.current += 1
    setToken(null)
    setError(null)
    setStatus('loading')
    setRevision((current) => current + 1)
  }, [])

  return {
    containerRef,
    token: enabled ? token : null,
    status: enabled ? status : 'disabled',
    error: enabled ? error : null,
    reset,
    retry: reset,
  }
}
