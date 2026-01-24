import { useEffect, useState } from 'react'
import { useCreateKard, useUpdateKard, useProtectedKard } from '../hooks/useKards'
import { raritiesAPI, storagesAPI, mediaAPIScan } from '../services/api'
import { SearchableSelect } from '../components/ui/SearchableSelect'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import TCGCameraModal from '../components/ui/TCGCamera'
import { CardMatch } from '../types'
import { useParams, useNavigate } from 'react-router-dom'

export const CreateKardPage = () => {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id
  const kardId = id ? parseInt(id, 10) : null

  const defaultFormState = () => {
    return {
      code: '',
      name: '',
      price: 100,
      price_multiplier: 100,
      quantity: 1,
      image_url: 'https://picsum.photos/230/330.webp',
      media_id: undefined, // Added for scan support
      description: '',
      status: 'enabled',
      for_sale: 'yes',
      game_id: 1,
      language_id: 1,
      pack_id: 1,
      rarity_id: 1,
      storage_id: 1,
    }
  }

  const [form, setForm] = useState(defaultFormState)
  const [rarities, setRarities] = useState<{ id: number; name: string; code: string }[]>([])
  const [storages, setStorages] = useState<{ id: number; name: string }[]>([])
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showNewStorageModal, setShowNewStorageModal] = useState(false)
  const [newStorageName, setNewStorageName] = useState('')
  const [newStorageCode, setNewStorageCode] = useState('')
  const [newStorageDesc, setNewStorageDesc] = useState('')
  const [isCreatingStorage, setIsCreatingStorage] = useState(false)

  // Scan specific state
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [cardMatches, setCardMatches] = useState<CardMatch[]>([])
  const [selectedMatchIndex, setSelectedMatchIndex] = useState(0)
  const [showMatchSelector, setShowMatchSelector] = useState(false)

  const createKard = useCreateKard()
  const updateKard = useUpdateKard(kardId || 0)
  const { data: protectedKardData, isLoading: isLoadingKard } = useProtectedKard(kardId)

  useEffect(() => {
    storagesAPI.getStorages(100, 0).then((res) => setStorages(res.data))
    raritiesAPI.getRarities(100, 0).then((res) => setRarities(res.data.map((rarity) => ({ ...rarity }))))
  }, [])

  // Load card data in edit mode
  useEffect(() => {
    if (isEditMode && protectedKardData?.data) {
      const kard = protectedKardData.data
      setForm({
        code: kard.code,
        name: kard.name,
        price: kard.price,
        price_multiplier: kard.price_multiplier,
        quantity: kard.quantity,
        image_url: kard.image_url,
        media_id: undefined,
        description: kard.description,
        status: kard.status,
        for_sale: kard.for_sale,
        game_id: kard.game_id,
        language_id: kard.language_id,
        pack_id: kard.pack_id,
        rarity_id: kard.rarity_id,
        storage_id: kard.storage_id,
      })
      setPreviewUrl(kard.image_url)
    }
  }, [isEditMode, protectedKardData])

  const handleChange = (field: string, value: string | number | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateNewStorage = async () => {
    if (!newStorageName.trim()) {
      setError('Storage name is required')
      return
    }
    
    try {
      setIsCreatingStorage(true)
      const response = await storagesAPI.createStorage({
        code: newStorageCode || newStorageName.toUpperCase(),
        name: newStorageName,
        description: newStorageDesc,
      })
      
      const newStorage = response.data
      setStorages([...storages, newStorage])
      handleChange('storage_id', newStorage.id)
      setShowNewStorageModal(false)
      setNewStorageName('')
      setNewStorageCode('')
      setNewStorageDesc('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create storage')
    } finally {
      setIsCreatingStorage(false)
    }
  }

  // Autofill Logic
  const applyMatch = (matchIndex: number, matchesSource?: CardMatch[]) => {
    const list = matchesSource || cardMatches
    const match = list[matchIndex]
    if (match) {
      handleChange('name', match.name)
      const detail = (match as any).detail || {}
      const desc = detail.monster_effect || detail.effect || detail.pendulum_effect || ''
      handleChange('description', desc)
      setSelectedMatchIndex(matchIndex)
    }
  }

  const onCaptured = async (file: File, originalBase64: string) => {
    setIsCameraOpen(false)
    setIsUploading(true)
    setPreviewUrl(originalBase64)
    setError(null)

    try {
      const response = await mediaAPIScan.uploadImage(file)
      const mediaId = response.data?.id
      const matches = response.scan?.scan?.matches || []

      if (mediaId) handleChange('media_id', mediaId)

      if (matches.length > 0) {
        setCardMatches(matches)
        setSelectedMatchIndex(0)
        applyMatch(0, matches)
        setShowMatchSelector(true)
      } else {
        setError("Image uploaded, but no matches were found in the database.")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = () => {
    setIsConfirmOpen(true)
  }

  const confirmSubmit = () => {
    const submitData = { ...form }
    // If we have a scanned media_id, we usually don't send the default placeholder image_url
    if (submitData.media_id) delete (submitData as any).image_url

    if (isEditMode && kardId) {
      updateKard.mutate(submitData as any, {
        onSuccess: () => {
          alert('Card updated successfully!')
          navigate('/')
        },
        onError: (err: any) => {
          setError(err.response?.data?.message || err.message || 'Unexpected error')
        },
      })
    } else {
      createKard.mutate(submitData as any, {
        onSuccess: () => {
          alert('Card created successfully!')
          setForm(defaultFormState())
          setPreviewUrl(null)
          setShowMatchSelector(false)
        },
        onError: (err: any) => {
          setError(err.response?.data?.message || err.message || 'Unexpected error')
        },
      })
    }
    setIsConfirmOpen(false)
  }

  if (isEditMode && isLoadingKard) {
    return (
      <div className="max-w-xl mx-auto p-4 mt-7 flex justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-4 mt-7">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        {isEditMode ? 'Edit Card' : 'Add Card'}
      </h1>

      {/* Camera/Scanner UI */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <button
          type="button"
          onClick={() => setIsCameraOpen(true)}
          disabled={isUploading}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
        >
          {isUploading ? <><LoadingSpinner size="sm" /> Scanning...</> : "📸 Scan Card for Autofill"}
        </button>
      </div>

      {/* Match Selector Modal (Integrated inside the flow) */}
      {showMatchSelector && cardMatches.length > 0 && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-green-500 shadow-xl">
          <h3 className="font-bold text-green-700 dark:text-green-400 mb-4">Confirm Scanned Identity</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {cardMatches.map((match, index) => (
              <button
                key={index}
                onClick={() => applyMatch(index)}
                className={`w-full p-3 rounded-lg text-left border-2 transition-all ${selectedMatchIndex === index
                    ? 'border-green-600 bg-green-50 dark:bg-green-900/40'
                    : 'border-gray-100 dark:border-gray-700 hover:border-green-200'
                  }`}
              >
                <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-gray-100">
                  <span>{match.name}</span>
                  <span className="text-green-600 font-mono">{Math.round((match as any).confidence * 100)}%</span>
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

      <div className="space-y-1">
        <h5 className='text-sm dark:text-gray-100 font-semibold'>Code</h5>
        <input
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 uppercase"
          placeholder="Code"
          value={form.code}
          onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
        />

        <h5 className='text-sm dark:text-gray-100 font-semibold'>Name</h5>
        <input
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="Name"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />

        <h5 className='text-sm dark:text-gray-100 font-semibold'>Price (Yen, for now x100)</h5>
        <input
          type="number"
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          value={form.price}
          onChange={(e) => handleChange('price', Math.max(1, Number(e.target.value)))}
        />

        {/* <h5 className='text-sm dark:text-gray-100 font-semibold'>Price Multiplier (to calculate Rupiah)</h5>
        <input
          type="number"
          min={1}
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          value={form.price_multiplier}
          onChange={(e) => handleChange('price_multiplier', Math.max(1, Number(e.target.value)))}
        /> */}

        {/* <h5 className='text-sm dark:text-gray-100 font-semibold'>Quantity</h5>
        <input
          type="number"
          min={0}
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          value={form.quantity}
          onChange={(e) => handleChange('quantity', Math.max(0, Number(e.target.value)))}
        /> */}

        <h5 className='text-sm dark:text-gray-100 font-semibold'>Quantity</h5>
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4, 5].map((qty) => (
            <button
              key={qty}
              type="button"
              onClick={() => handleChange('quantity', qty)}
              className={`w-10 h-10 rounded-lg font-bold border transition-all
        ${form.quantity === qty
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-green-400 dark:text-gray-100'
                }
      `}
            >
              {qty}
            </button>
          ))}
        </div>


        {/* <h5 className='text-sm dark:text-gray-100 font-semibold'>Status</h5>
        <Select
          label="Select Status"
          value={form.status}
          options={[{id: "enabled", name:"Enabled"}, {id: "disabled", name:"Disabled"}]}
          onChange={(id) => handleChange("status", id)}
        /> */}

        {/* <h5 className='text-sm dark:text-gray-100 font-semibold'>For Sale?</h5>
        <Select
          label="Select For Sale"
          value={form.for_sale}
          options={[{id: "yes", name:"Yes"}, {id: "no", name:"No"}]}
          onChange={(id) => handleChange("for_sale", id)}
        /> */}

        <h5 className='text-sm dark:text-gray-100 font-semibold'>For Sale?</h5>
        <div className="flex gap-2">
          {['yes', 'no'].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleChange('for_sale', val)}
              className={`flex-1 py-2 rounded-lg font-bold border transition-all
        ${form.for_sale === val
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:text-gray-100'
                }
      `}
            >
              {val === 'yes' ? 'Yes' : 'No'}
            </button>
          ))}
        </div>

        <h5 className='text-sm dark:text-gray-100 font-semibold'>Show card to public?</h5>
        <div className="flex gap-2">
          {['enabled', 'disabled'].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleChange('status', val)}
              className={`flex-1 py-2 rounded-lg font-bold border transition-all
        ${form.status === val
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-green-400 dark:text-gray-100'
                }
      `}
            >
              {val === 'enabled' ? 'Yes' : 'No'}
            </button>
          ))}
        </div>

        <h5 className='text-sm dark:text-gray-100 font-semibold'>Image URL</h5>
        <div className="flex gap-2">
          <input
            className="flex-1 border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Image URL"
            value={form.image_url}
            onChange={(e) => handleChange('image_url', e.target.value)}
          />
          <button
            type="button"
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={() => setPreviewUrl(form.image_url)}
          >
            Check
          </button>
        </div>

        {previewUrl && (
          <div className="mt-2 flex justify-center">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-64 border-4 rounded-lg border-gray-300 dark:border-gray-700 shadow-md"
              onError={() => setPreviewUrl(null)}
            />
          </div>
        )}

        <h5 className='text-sm dark:text-gray-100 font-semibold'>Description</h5>
        <textarea
          className="w-full border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="Description"
          rows={4}
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />

        {/* <h5 className='text-sm dark:text-gray-100 font-semibold'>Game</h5>
        <SearchableSelect
          label="Select Game"
          value={form.game_id}
          options={games}
          onChange={(id) => {
            handleChange("game_id", id)
            setGameId(id as number)
          }}
          onSearchQueryChange={() => { }}
        /> */}

        {/* <h5 className='text-sm dark:text-gray-100 font-semibold'>Language</h5>
        <SearchableSelect
          label="Select Language"
          value={form.language_id}
          options={languages}
          onChange={(id) => {
            handleChange("language_id", id)
            setLanguageId(id as number)
          }}
          onSearchQueryChange={() => { }}
        /> */}

        {/* <h5 className='text-sm dark:text-gray-100 font-semibold'>Pack</h5>
        <SearchableSelect
          label="Select Pack"
          value={form.pack_id}
          options={packs}
          onChange={(id) => handleChange("pack_id", id)}
          onSearchQueryChange={(q) => setPacksQuery(q)}
        /> */}

        {/* <h5 className='text-sm dark:text-gray-100 font-semibold'>Rarity</h5>
        <SearchableSelect
          label="Select Rarity"
          value={form.rarity_id}
          options={rarities}
          onChange={(id) => handleChange("rarity_id", id)}
          onSearchQueryChange={() => { }}
        /> */}

        <h5 className='text-sm dark:text-gray-100 font-semibold'>Rarity</h5>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {rarities
            .filter(r => ['N', 'R', 'SR', 'UR', 'SE', 'UL', 'PSE', 'QCSE'].includes(r.code))
            .map((rarity) => (
              <button
                key={rarity.id}
                type="button"
                onClick={() => handleChange('rarity_id', rarity.id)}
                className={`py-2 rounded-lg font-bold border transition-all
          ${form.rarity_id === rarity.id
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:text-gray-100'
                  }
        `}
              >
                {rarity.code}
              </button>
            ))}
        </div>

        <SearchableSelect
          label="Other Rarity"
          value={
            rarities.some(r =>
              !['N', 'R', 'SR', 'UR', 'SE', 'UL', 'PSE', 'QCSE'].includes(r.code) &&
              r.id === form.rarity_id
            )
              ? form.rarity_id
              : 0
          }
          options={rarities.filter(r =>
            !['N', 'R', 'SR', 'UR', 'SE', 'UL', 'PSE', 'QCSE'].includes(r.code)
          )}
          onChange={(id) => handleChange('rarity_id', id)}
          onSearchQueryChange={() => { }}
        />


        <h5 className='text-sm dark:text-gray-100 font-semibold'>Storage</h5>
        <div className="flex gap-2">
          <SearchableSelect
            label="Select Storage"
            value={form.storage_id}
            options={storages}
            onChange={(id) => handleChange("storage_id", id)}
            onSearchQueryChange={() => { }}
          />
          <button
            type="button"
            onClick={() => setShowNewStorageModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm whitespace-nowrap"
          >
            + New
          </button>
        </div>

        <button
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 flex justify-center items-center mt-8 font-bold shadow-lg transition-all"
          onClick={handleSubmit}
          disabled={createKard.isPending || updateKard.isPending}
        >
          {createKard.isPending || updateKard.isPending ? <LoadingSpinner size="sm" /> : isEditMode ? 'Update Card' : 'Submit Card'}
        </button>
      </div>

      {/* Modals */}
      {isCameraOpen && <TCGCameraModal onProcessed={onCaptured} onClose={() => setIsCameraOpen(false)} />}

      {showNewStorageModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Create New Storage</h2>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Storage Code</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 uppercase"
                  placeholder="e.g., SHELF-A"
                  value={newStorageCode}
                  onChange={(e) => setNewStorageCode(e.target.value.toUpperCase())}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Storage Name</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Shelf A"
                  value={newStorageName}
                  onChange={(e) => setNewStorageName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  className="w-full border p-2 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                  placeholder="Optional description..."
                  rows={3}
                  value={newStorageDesc}
                  onChange={(e) => setNewStorageDesc(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400"
                onClick={() => setShowNewStorageModal(false)}
                disabled={isCreatingStorage}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex justify-center items-center font-bold disabled:opacity-50"
                onClick={handleCreateNewStorage}
                disabled={isCreatingStorage}
              >
                {isCreatingStorage ? <LoadingSpinner size="sm" /> : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Are these data correct?</h2>
            <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs mb-4 text-gray-900 dark:text-gray-100 overflow-auto max-h-60">
              {JSON.stringify(form, null, 2)}
            </pre>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400"
                onClick={() => setIsConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex justify-center items-center font-bold"
                onClick={confirmSubmit}
                disabled={createKard.isPending}
              >
                {createKard.isPending ? <LoadingSpinner size="sm" /> : 'Confirm & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[110]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full border-t-4 border-red-600">
            <h2 className="text-lg font-bold mb-4 text-red-600">Error</h2>
            <p className="text-gray-900 dark:text-gray-100 mb-4">{error}</p>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
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
