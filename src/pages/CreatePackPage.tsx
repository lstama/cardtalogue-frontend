import { useEffect, useState } from 'react'
import { useCreatePack } from '../hooks/usePacks'
import { gamesAPI, languagesAPI } from '../services/api'
import { SearchableSelect } from '../components/ui/SearchableSelect'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export const CreatePackPage = () => {
  const [form, setForm] = useState({
    code: '',
    name: '',
    image_url: 'https://picsum.photos/230/330.webp',
    description: '',
    game_id: 0,
    language_id: 0,
  })

  const [games, setGames] = useState<{ id: number; name: string }[]>([])
  const [languages, setLanguages] = useState<{ id: number; name: string }[]>([])
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createPack = useCreatePack()

  useEffect(() => {
    gamesAPI.getGames(100, 0).then((res) => setGames(res.data))
    languagesAPI.getLanguages(100, 0).then((res) => setLanguages(res.data))
  }, [])

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    setIsConfirmOpen(true)
  }

  const confirmSubmit = () => {
    createPack.mutate(form, {
      onSuccess: () => {
        alert('Pack created successfully!')
        setForm({
          code: '',
          name: '',
          image_url: 'https://picsum.photos/230/330.webp',
          description: '',
          game_id: 0,
          language_id: 0,
        })
        setPreviewUrl(null)
      },
      onError: (err: any) => {
        const message =
          err.response?.data?.message || err.message || 'Unexpected error'
        setError(message)
      },
    })
    setIsConfirmOpen(false)
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Create Pack
      </h1>

      <div className="space-y-4">
        <input
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 
                     border-gray-300 dark:border-gray-700 
                     text-gray-900 dark:text-gray-100"
          placeholder="Code"
          value={form.code}
          onChange={(e) => handleChange('code', e.target.value)}
        />
        <input
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 
                     border-gray-300 dark:border-gray-700 
                     text-gray-900 dark:text-gray-100"
          placeholder="Name"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />

        {/* Image input with check button */}
        <div className="flex gap-2">
          <input
            className="flex-1 border p-2 rounded bg-white dark:bg-gray-800 
                       border-gray-300 dark:border-gray-700 
                       text-gray-900 dark:text-gray-100"
            placeholder="Image URL"
            value={form.image_url}
            onChange={(e) => handleChange('image_url', e.target.value)}
          />
          <button
            type="button"
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 
                       text-gray-900 dark:text-gray-100 
                       rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={() => setPreviewUrl(form.image_url)}
          >
            Check
          </button>
        </div>

        {/* Image preview */}
        {previewUrl && (
          <div className="mt-2">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 border rounded 
                         border-gray-300 dark:border-gray-700"
              onError={() => setPreviewUrl(null)}
            />
          </div>
        )}

        <textarea
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 
                     border-gray-300 dark:border-gray-700 
                     text-gray-900 dark:text-gray-100"
          placeholder="Description"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />

        <SearchableSelect
          label="Select Game"
          value={form.game_id}
          options={games}
          onChange={(id) => handleChange("game_id", id)}
        />

        <SearchableSelect
          label="Select Language"
          value={form.language_id}
          options={languages}
          onChange={(id) => handleChange("language_id", id)}
        />

        <button
          className="w-full bg-blue-600 text-white p-2 rounded 
                     hover:bg-blue-700 dark:hover:bg-blue-500 
                     flex justify-center items-center"
          onClick={handleSubmit}
          disabled={createPack.isPending}
        >
          {createPack.isPending ? <LoadingSpinner size="sm" /> : 'Submit'}
        </button>
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center 
                        bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 
                          p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
              Are these data correct?
            </h2>
            <pre className="bg-gray-100 dark:bg-gray-700 
                            p-2 rounded text-sm mb-4 
                            text-gray-900 dark:text-gray-100">
              {JSON.stringify(form, null, 2)}
            </pre>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 
                           text-gray-900 dark:text-gray-100 
                           rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 dark:bg-green-700 
                           text-white rounded 
                           hover:bg-green-700 dark:hover:bg-green-600 
                           flex justify-center items-center"
                onClick={confirmSubmit}
                disabled={createPack.isPending}
              >
                {createPack.isPending ? <LoadingSpinner size="sm" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 flex items-center justify-center 
                        bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 
                          p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4 text-red-600">
              Error
            </h2>
            <p className="text-gray-900 dark:text-gray-100 mb-4">
              {error}
            </p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-red-600 dark:bg-red-700 
                           text-white rounded 
                           hover:bg-red-700 dark:hover:bg-red-600"
                onClick={() => setError(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
