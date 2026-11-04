import { useState } from 'react'
import { LoadingSpinner } from './LoadingSpinner'
import TCGCameraModal from './TCGCamera'
import { mediaAPIScan } from '../../services/api'
import { CardMatch } from '../../types'

// The "scan a card for autofill" panel: camera -> upload -> matches -> apply to form.
// It owns its own state and talks to the page through the callbacks below.
export const ScanPanel = ({
  onFieldChange,
  onError,
  previewUrl,
  onPreview,
}: {
  onFieldChange: (field: string, value: string | number | undefined) => void
  onError: (message: string | null) => void
  previewUrl: string | null
  onPreview: (url: string | null) => void
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [cardMatches, setCardMatches] = useState<CardMatch[]>([])
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0)
  const [showMatchSelector, setShowMatchSelector] = useState(false)

  const applyMatch = (matchIndex: number) => {
    const match = cardMatches[matchIndex]
    if (!match) return
    onFieldChange('name', match.name)
    const detail = (match as any).detail || {}
    onFieldChange(
      'description',
      detail.monster_effect || detail.effect || detail.pendulum_effect || '',
    )
    setSelectedMatchIndex(matchIndex)
  }

  const onCaptured = async (file: File, originalBase64: string) => {
    setIsCameraOpen(false)
    setIsUploading(true)
    onPreview(originalBase64)
    onError(null)

    try {
      const response = await mediaAPIScan.uploadImage(file)
      const mediaId = response.data?.id
      const matches = response.scan?.scan?.matches || []

      if (mediaId) onFieldChange('media_id', mediaId)

      if (matches.length > 0) {
        setCardMatches(matches)
        setSelectedMatchIndex(0)
        applyMatch(0)
        setShowMatchSelector(true)
      } else {
        onError('Image uploaded, but no matches were found in the database.')
      }
    } catch (err: any) {
      onError(err.response?.data?.message || err.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const scanningLabel = (
    <>
      <LoadingSpinner size="sm" /> Scanning...
    </>
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setIsCameraOpen(true)}
        disabled={isUploading}
        aria-label={
          previewUrl
            ? 'Retake card photo for autofill'
            : 'Open camera to scan card for autofill'
        }
        className="group relative mx-auto mb-6 flex aspect-[2.4/3.4] w-full max-w-xs items-center justify-center overflow-hidden rounded-lg border border-gray-300 bg-gray-100 text-center transition hover:border-blue-600 hover:ring-2 hover:ring-blue-600/30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/50 disabled:cursor-wait dark:border-gray-600 dark:bg-gray-800"
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt=""
              onError={() => onPreview(null)}
              className="absolute inset-0 h-full w-full object-contain transition group-hover:scale-[1.02]"
            />
            <span className="absolute inset-0 bg-gray-950/40 transition group-hover:bg-gray-950/50" />
            <span
              className="relative flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-bold text-gray-900 shadow-lg transition group-hover:bg-blue-600 group-hover:text-white"
            >
              {isUploading ? scanningLabel : 'Retake photo'}
            </span>
          </>
        ) : (
          <span
            className="rounded-md bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-lg transition group-hover:bg-blue-800"
          >
            {isUploading ? scanningLabel : 'Scan card for autofill'}
          </span>
        )}
      </button>

      {showMatchSelector && cardMatches.length > 0 && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-green-500 shadow-xl">
          <h3 className="font-bold text-green-700 dark:text-green-400 mb-4">
            Confirm Scanned Identity
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {cardMatches.map((match, index) => (
              <button
                key={index}
                onClick={() => applyMatch(index)}
                className={`w-full p-3 rounded-lg text-left border-2 transition-all ${
                  selectedMatchIndex === index
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/40'
                    : 'border-gray-100 dark:border-gray-700 hover:border-green-200'
                }`}
              >
                <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-gray-100">
                  <span>{match.name}</span>
                  <span className="text-green-600 font-mono">
                    {Math.round((match as any).confidence * 100)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowMatchSelector(false)}
            className="w-full mt-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700"
          >
            Confirm Selection
          </button>
        </div>
      )}

      {isCameraOpen && (
        <TCGCameraModal
          onProcessed={onCaptured}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </>
  )
}
