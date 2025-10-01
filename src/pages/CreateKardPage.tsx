import { useEffect, useState } from 'react'
import { useCreateKard } from '../hooks/useKards'
import { gamesAPI, languagesAPI, raritiesAPI, storagesAPI, packsAPI } from '../services/api'
import { SearchableSelect } from '../components/ui/SearchableSelect'
import { Select } from '../components/ui/Select'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

// Code            string `json:"code" validate:"required,min=1,max=255"`
// Name            string `json:"name" validate:"required,min=1,max=255"`
// Price           uint   `json:"price" validate:"min=0,max=1000000000"`
// PriceMultiplier uint   `json:"price_multiplier" validate:"min=1,max=100000"`
// Quantity        uint   `json:"quantity" validate:"min=0,max=1000000"`
// ImageURL        string `json:"image_url" validate:"required,min=1,max=255"`
// Description     string `json:"description"`
// Status          string `json:"status" validate:"oneof=enabled disabled"`
// ForSale         string `json:"for_sale" validate:"required,oneof=yes no"`
// GameID          uint   `json:"game_id" validate:"required,min=1"`
// LanguageID      uint   `json:"language_id,omitempty" validate:"omitempty,min=1"`
// PackID          uint   `json:"pack_id,omitempty" validate:"omitempty,min=1"`
// RarityID        uint   `json:"rarity_id,omitempty" validate:"omitempty,min=1"`
// StorageID       uint   `json:"storage_id,omitempty" validate:"omitempty,min=1"`

export const CreateKardPage = () => {
  const defaultFormState = () => {
    return {
      code: '',
      name: '',
      price: 100,
      price_multiplier: 100,
      quantity: 1,
      image_url: 'https://picsum.photos/230/330.webp',
      description: '',
      status: 'enabled',
      for_sale: 'yes',
      game_id: 0,
      language_id: 0,
      pack_id: 0,
      rarity_id: 0,
      storage_id: 0,
    }
  }
  const [form, setForm] = useState(defaultFormState)

  const [games, setGames] = useState<{ id: number; name: string }[]>([])
  const [gameId, setGameId] = useState(0)
  const [languageId, setLanguageId] = useState(0)
  const [languages, setLanguages] = useState<{ id: number; name: string }[]>([])
  const [packs, setPacks] = useState<{ id: number; name: string }[]>([])
  // const [allPacks, setAllPacks] = useState<{ id: number; name: string, game_id: number, language_id: number }[]>([])
  const [rarities, setRarities] = useState<{ id: number; name: string }[]>([])
  const [storages, setStorages] = useState<{ id: number; name: string }[]>([])
  const [packsQuery, setPacksQuery] = useState('')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const createKard = useCreateKard()

  useEffect(() => {
    gamesAPI.getGames(100, 0).then((res) => setGames(res.data))
    languagesAPI.getLanguages(100, 0).then((res) => setLanguages(res.data))
    storagesAPI.getStorages(100, 0).then((res) => setStorages(res.data))
    raritiesAPI.getRarities(100, 0).then((res) => setRarities(res.data.map((rarity) => ({ ...rarity, name: rarity.code + '|' + rarity.name }))))
    packsAPI.searchPacks(gameId, languageId, packsQuery, 100, 0).then((res) =>
      setPacks(res.data)
    )
  }, [])

  useEffect(() => {
    packsAPI.searchPacks(gameId, languageId, packsQuery, 100, 0).then((res) =>
      setPacks(res.data)
    )
  }, [gameId, languageId, packsQuery])

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    setIsConfirmOpen(true)
  }

  const confirmSubmit = () => {
    createKard.mutate(form, {
      onSuccess: () => {
        alert('Card created successfully!')
        setForm(defaultFormState())
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
    <div className="max-w-xl mx-auto p-4 mt-7">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Create Card
      </h1>

      <div className="space-y-1">
        <h5 className='text-sm dark:text-gray-100'>Code</h5>
        <input
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 
                     border-gray-300 dark:border-gray-700 
                     text-gray-900 dark:text-gray-100"
          placeholder="Code"
          value={form.code}
          onChange={(e) => handleChange('code', e.target.value)}
        />
        <h5 className='text-sm dark:text-gray-100'>Name</h5>
        <input
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 
                     border-gray-300 dark:border-gray-700 
                     text-gray-900 dark:text-gray-100"
          placeholder="Name"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        <h5 className='text-sm dark:text-gray-100'>Price (Yen)</h5>
        <input
          type="number"
          min={1}
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 
             border-gray-300 dark:border-gray-700 
             text-gray-900 dark:text-gray-100"
          placeholder="Price"
          value={form.price}
          onChange={(e) => {
            const value = Math.max(1, Number(e.target.value)); // ensure min=1
            handleChange('price', value);
          }}
        />
        <h5 className='text-sm dark:text-gray-100'>Price Multiplier (to calculate Rupiah)</h5>
        <input
          type="number"
          min={1}
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 
             border-gray-300 dark:border-gray-700 
             text-gray-900 dark:text-gray-100"
          placeholder="Price Multiplier"
          value={form.price_multiplier}
          onChange={(e) => {
            const value = Math.max(1, Number(e.target.value)); // ensure min=1
            handleChange('price_multiplier', value);
          }}
        />
        <h5 className='text-sm dark:text-gray-100'>Quantity</h5>
        <input
          type="number"
          min={0}
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 
             border-gray-300 dark:border-gray-700 
             text-gray-900 dark:text-gray-100"
          placeholder="Quantity"
          value={form.quantity}
          onChange={(e) => {
            const value = Math.max(1, Number(e.target.value)); // ensure min=1
            handleChange('quantity', value);
          }}
        />
        <h5 className='text-sm dark:text-gray-100'>Status</h5>
        <Select
          label="Select Status"
          value={form.status}
          options={[{id: "enabled", name:"Enabled"}, {id: "disabled", name:"Disabled"}]}
          onChange={(id) => {
            handleChange("status", id)
          }}
        />
        <h5 className='text-sm dark:text-gray-100'>For Sale?</h5>
        <Select
          label="Select For Sale"
          value={form.for_sale}
          options={[{id: "yes", name:"Yes"}, {id: "no", name:"No"}]}
          onChange={(id) => {
            handleChange("for_sale", id)
          }}
        />
        <h5 className='text-sm dark:text-gray-100'>Image URL</h5>
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
        <h5 className='text-sm dark:text-gray-100'>Description</h5>
        <textarea
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 
                     border-gray-300 dark:border-gray-700 
                     text-gray-900 dark:text-gray-100"
          placeholder="Description"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
        <h5 className='text-sm dark:text-gray-100'>Game</h5>
        <SearchableSelect
          label="Select Game"
          value={form.game_id}
          options={games}
          onChange={(id) => {
            handleChange("game_id", id)
            setGameId(id)
          }}
          onSearchQueryChange={() => { }}
        />
        <h5 className='text-sm dark:text-gray-100'>Language</h5>
        <SearchableSelect
          label="Select Language"
          value={form.language_id}
          options={languages}
          onChange={(id) => {
            handleChange("language_id", id)
            setLanguageId(id)
          }}
          onSearchQueryChange={() => { }}
        />
        <h5 className='text-sm dark:text-gray-100'>Pack</h5>
        {/* Select pack should be here */}
        <SearchableSelect
          label="Select Pack"
          value={form.pack_id}
          options={packs}
          onChange={(id) => handleChange("pack_id", id)}
          onSearchQueryChange={(q) => setPacksQuery(q)}
        />
        <h5 className='text-sm dark:text-gray-100'>Rarity</h5>
        <SearchableSelect
          label="Select Rarity"
          value={form.rarity_id}
          options={rarities}
          onChange={(id) => handleChange("rarity_id", id)}
          onSearchQueryChange={() => { }}
        />
        <h5 className='text-sm dark:text-gray-100'>Storage</h5>
        <SearchableSelect
          label="Select Storage"
          value={form.storage_id}
          options={storages}
          onChange={(id) => handleChange("storage_id", id)}
          onSearchQueryChange={() => { }}
        />
        <button
          className="w-full bg-blue-600 text-white p-2 rounded 
                     hover:bg-blue-700 dark:hover:bg-blue-500 
                     flex justify-center items-center mt-8"
          onClick={handleSubmit}
          disabled={createKard.isPending}
        >
          {createKard.isPending ? <LoadingSpinner size="sm" /> : 'Submit'}
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
                disabled={createKard.isPending}
              >
                {createKard.isPending ? <LoadingSpinner size="sm" /> : 'Confirm'}
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
