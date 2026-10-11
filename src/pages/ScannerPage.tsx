import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import TCGCameraModal from '../components/ui/TCGCamera'
import { mediaAPIScan } from '../services/api'
import type { CardMatch } from '../types'

const CAP_API_ENDPOINT = 'https://cap.tama.id/b486d0c417/'

export const ScannerPage = () => {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [matches, setMatches] = useState<CardMatch[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [capToken, setCapToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [widgetRevision, setWidgetRevision] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const capContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let disposed = false
    let widget: HTMLElement | null = null

    customElements.whenDefined('cap-widget').then(() => {
      if (disposed || !capContainerRef.current) return

      widget = document.createElement('cap-widget')
      widget.setAttribute('data-cap-api-endpoint', CAP_API_ENDPOINT)
      widget.addEventListener('solve', (event) => {
        const token = (event as CustomEvent<{ token?: string }>).detail?.token
        if (token) setCapToken(token)
      })
      capContainerRef.current.replaceChildren(widget)
    })

    return () => {
      disposed = true
      widget?.remove()
    }
  }, [widgetRevision])

  const onProcessed = (capturedFile: File, croppedPreview: string) => {
    setFile(capturedFile)
    setPreview(croppedPreview)
    setMatches([])
    setSelectedIndex(0)
    setError(null)
    setCapToken(null)
    setIsCameraOpen(false)
    setWidgetRevision((revision) => revision + 1)
  }

  const scanImage = async () => {
    if (!file || !capToken) return

    setLoading(true)
    setError(null)
    setMatches([])
    setCapToken(null)

    try {
      const response = await mediaAPIScan.scanImage(file, capToken)
      if (!response.data.success) {
        throw new Error('The scan could not identify any cards.')
      }
      setMatches(response.data.matches)
      setSelectedIndex(0)
      if (response.data.matches.length === 0) {
        setError('No matching cards found. Try another image.')
      }
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : 'Unable to scan this image.')
    } finally {
      setLoading(false)
      setWidgetRevision((revision) => revision + 1)
    }
  }

  const selectedMatch = matches[selectedIndex]
  const effects = selectedMatch?.detail
    ? Object.entries(selectedMatch.detail).filter(([, value]) => value)
    : []

  return (
    <section className="mx-auto max-w-5xl">
      <header className="mb-7 border-b border-gray-200 pb-5 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Card scanner</h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)]">
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => setIsCameraOpen(true)}
            aria-label={preview ? 'Retake card photo' : 'Open camera to capture a card'}
            className="group relative mx-auto flex aspect-[2.4/3.4] w-full max-w-xs items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-gray-100 text-center transition hover:border-blue-600 hover:ring-2 hover:ring-blue-600/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/50 dark:border-gray-600 dark:bg-gray-800"
          >
            {preview ? (
              <>
                <img src={preview} alt="" className="absolute inset-0 h-full w-full object-contain transition group-hover:scale-[1.02]" />
                <span className="absolute inset-0 bg-gray-950/40 transition group-hover:bg-gray-950/50" />
                <span className="relative rounded-md bg-white px-5 py-3 text-sm font-bold text-gray-900 shadow-lg transition group-hover:bg-blue-600 group-hover:text-white">
                  Retake photo
                </span>
              </>
            ) : (
              <span className="px-6 py-3 text-sm font-bold text-blue-700 transition group-hover:text-blue-900 dark:text-blue-300 dark:group-hover:text-white">
                Open camera
              </span>
            )}
          </button>

          <div className="border-t border-gray-200 pt-5 dark:border-gray-700">
            <div ref={capContainerRef} />
            <button
              type="button"
              onClick={scanImage}
              disabled={!file || !capToken || loading}
              className="mt-4 w-full rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? 'Scanning…' : 'Scan image'}
            </button>
            {!capToken && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Complete the verification before scanning.</p>}
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-4 flex items-baseline justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Matches</h2>
            {matches.length > 0 && <span className="text-sm text-gray-500">{matches.length} found</span>}
          </div>

          {error && (
            <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {error}
            </p>
          )}

          {matches.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-[minmax(180px,0.8fr)_minmax(0,1.2fr)]">
              <ul className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                {matches.map((match, index) => (
                  <li key={`${match.konami_id ?? match.name}-${index}`}>
                    <button
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      aria-pressed={selectedIndex === index}
                      className={`w-full px-3 py-3 text-left ${selectedIndex === index ? 'bg-blue-50 dark:bg-blue-950' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">{match.name}</span>
                      <span className="mt-1 block text-xs text-gray-500">Match confidence: {(match.confidence * 100).toFixed(0)}%</span>
                    </button>
                  </li>
                ))}
              </ul>

              {selectedMatch && (
                <article aria-live="polite">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{selectedMatch.name}</h3>
                  {selectedMatch.konami_id && <p className="mt-1 text-xs text-gray-500">Card ID: {selectedMatch.konami_id}</p>}
                  <div className="mt-4 space-y-4">
                    {effects.length > 0 ? effects.map(([key, value]) => (
                      <div key={key}>
                        <h4 className="text-xs font-bold uppercase text-gray-500">{key.replace('_', ' ')}</h4>
                        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-700 dark:text-gray-300">{value}</p>
                      </div>
                    )) : <p className="text-sm text-gray-500">No description available.</p>}
                  </div>
                  <Link
                    to={`/?q=${encodeURIComponent(selectedMatch.name)}`}
                    className="mt-6 inline-flex rounded-md bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
                  >
                    Search this title in cards
                  </Link>
                </article>
              )}
            </div>
          ) : !error && (
            <p className="py-8 text-sm text-gray-500 dark:text-gray-400">
              {loading ? 'Looking for cards in the image…' : 'Scan an image to see matching cards here.'}
            </p>
          )}
        </div>
      </div>

      {isCameraOpen && <TCGCameraModal onProcessed={onProcessed} onClose={() => setIsCameraOpen(false)} />}
    </section>
  )
}