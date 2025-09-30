import { useEffect, useState } from 'react'
import { useCreatePack } from '../hooks/usePacks'
import { gamesAPI, languagesAPI } from '../services/api'

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null) // for manual image check

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
        setPreviewUrl(null) // reset preview
      },
    })
    setIsConfirmOpen(false)
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      {/* Margin top */}
      <h1 className="mb-7"></h1>
      <h1 className="text-2xl font-bold mb-4">Create Pack</h1>

      <div className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="Code"
          value={form.code}
          onChange={(e) => handleChange('code', e.target.value)}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Name"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />

        {/* Image input with check button */}
        <div className="flex gap-2">
          <input
            className="flex-1 border p-2 rounded"
            placeholder="Image URL"
            value={form.image_url}
            onChange={(e) => handleChange('image_url', e.target.value)}
          />
          <button
            type="button"
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
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
              className="max-h-48 border rounded"
              onError={() => setPreviewUrl(null)} // clear preview if broken link
            />
          </div>
        )}

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
        <select
          className="w-full border p-2 rounded"
          value={form.game_id}
          onChange={(e) => handleChange('game_id', Number(e.target.value))}
        >
          <option value={0}>Select Game</option>
          {games.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <select
          className="w-full border p-2 rounded"
          value={form.language_id}
          onChange={(e) => handleChange('language_id', Number(e.target.value))}
        >
          <option value={0}>Select Language</option>
          {languages.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        <button
          className="w-full bg-blue-600 text-white p-2 rounded"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Are these data correct?</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm mb-4">
              {JSON.stringify(form, null, 2)}
            </pre>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={confirmSubmit}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
