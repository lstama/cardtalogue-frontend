import { useEffect, useState } from 'react'
import { useCreateKard, useUpdateKard, useProtectedKard } from '../hooks/useKards'
import { raritiesAPI, storagesAPI } from '../services/api'
import { SearchableSelect } from '../components/ui/SearchableSelect'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { ScanPanel } from '../components/ui/ScanPanel'
import { ChoiceButtons } from '../components/ui/ChoiceButtons'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { ErrorModal } from '../components/ui/ErrorModal'
import { NewStorageModal } from '../components/ui/NewStorageModal'
import { useParams, useNavigate } from 'react-router-dom'

const RARITY_CODES = ['N', 'R', 'SR', 'UR', 'SE', 'UL', 'PSE', 'QCSE']

const defaultFormState = () => ({
  code: '',
  name: '',
  price: 100,
  price_multiplier: 100,
  quantity: 1,
  image_url: 'https://picsum.photos/230/330.webp',
  media_id: undefined, // set by the scanner, sent instead of image_url
  description: '',
  status: 'enabled',
  for_sale: 'yes',
  game_id: 1,
  language_id: 1,
  pack_id: 1,
  rarity_id: 1,
  storage_id: 1,
})

export const CreateKardPage = () => {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEditMode = !!id
  const kardId = id ? parseInt(id, 10) : null

  const [form, setForm] = useState(defaultFormState)
  const [rarities, setRarities] = useState<{ id: number; name: string; code: string }[]>([])
  const [storages, setStorages] = useState<{ id: number; name: string }[]>([])
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showNewStorageModal, setShowNewStorageModal] = useState(false)

  const createKard = useCreateKard()
  const updateKard = useUpdateKard(kardId || 0)
  const { data: protectedKardData, isLoading: isLoadingKard } = useProtectedKard(kardId)

  useEffect(() => {
    storagesAPI.getStorages(100, 0).then((res) => setStorages(res.data))
    raritiesAPI.getRarities(100, 0).then((res) => setRarities(res.data))
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

  const handleSubmit = () => {
    setIsConfirmOpen(true)
  }

  const confirmSubmit = () => {
    const submitData = { ...form }
    // A scanned media_id replaces the placeholder image_url
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

  const otherRarities = rarities.filter((r) => !RARITY_CODES.includes(r.code))

  return (
    <div className="mx-auto mt-7 max-w-5xl p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        {isEditMode ? 'Edit Card' : 'Add Card'}
      </h1>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
        <div>
          {/* Camera/Scanner UI */}
          <ScanPanel
            onFieldChange={handleChange}
            onError={setError}
            previewUrl={previewUrl}
            onPreview={setPreviewUrl}
          />
        </div>

        <div className="space-y-1">
          <h5 className="text-sm dark:text-gray-100 font-semibold">Code</h5>
          <input
            data-testid="card-code"
            className="w-full border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 uppercase"
            placeholder="Code"
            value={form.code}
            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
          />

          <h5 className="text-sm dark:text-gray-100 font-semibold">Name</h5>
          <input
            data-testid="card-name"
            className="w-full border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />

          <h5 className="text-sm dark:text-gray-100 font-semibold">
            Price (Yen, for now x100)
          </h5>
          <input
            data-testid="card-price"
            type="number"
            className="w-full border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            value={form.price}
            onChange={(e) => handleChange('price', Math.max(1, Number(e.target.value)))}
          />

          <h5 className="text-sm dark:text-gray-100 font-semibold">Quantity</h5>
          <ChoiceButtons
            testId="card-quantity"
            values={[0, 1, 2, 3, 4, 5]}
            selected={form.quantity}
            onChange={(qty) => handleChange('quantity', qty)}
            itemClass="w-10 h-10 rounded-lg font-bold border transition-all"
            accent="green"
          />

          <h5 className="text-sm dark:text-gray-100 font-semibold">For Sale?</h5>
          <ChoiceButtons
            testId="card-for-sale"
            values={['yes', 'no']}
            selected={form.for_sale}
            onChange={(val) => handleChange('for_sale', val)}
            labelFor={(val) => (val === 'yes' ? 'Yes' : 'No')}
          />

          <h5 className="text-sm dark:text-gray-100 font-semibold">Show card to public?</h5>
          <ChoiceButtons
            testId="card-status"
            values={['enabled', 'disabled']}
            selected={form.status}
            onChange={(val) => handleChange('status', val)}
            labelFor={(val) => (val === 'enabled' ? 'Yes' : 'No')}
            accent="green"
          />

          <h5 className="text-sm dark:text-gray-100 font-semibold">Image URL</h5>
          <div className="flex gap-2">
            <input
              data-testid="card-image-url"
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

          <h5 className="text-sm dark:text-gray-100 font-semibold">Description</h5>
          <textarea
            data-testid="card-description"
            className="w-full border p-2 rounded bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Description"
            rows={4}
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />

          <h5 className="text-sm dark:text-gray-100 font-semibold">Rarity</h5>
          <ChoiceButtons
            testId="card-rarity"
            values={rarities.filter((r) => RARITY_CODES.includes(r.code)).map((r) => r.id)}
            selected={form.rarity_id}
            onChange={(id) => handleChange('rarity_id', id)}
            itemClass="py-2 rounded-lg font-bold border transition-all"
            containerClass="grid grid-cols-4 gap-2 mb-3"
            labelFor={(id) => rarities.find((r) => r.id === id)?.code ?? String(id)}
            accent="purple"
          />

          <SearchableSelect
            label="Other Rarity"
            value={
              otherRarities.some((r) => r.id === form.rarity_id) ? form.rarity_id : 0
            }
            options={otherRarities}
            onChange={(id) => handleChange('rarity_id', id)}
            onSearchQueryChange={() => {}}
          />

          <h5 className="text-sm dark:text-gray-100 font-semibold">Storage</h5>
          <div className="flex gap-2">
            <SearchableSelect
              label="Select Storage"
              value={form.storage_id}
              options={storages}
              onChange={(id) => handleChange('storage_id', id)}
              onSearchQueryChange={() => {}}
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
            data-testid="card-submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 flex justify-center items-center mt-8 font-bold shadow-lg transition-all"
            onClick={handleSubmit}
            disabled={createKard.isPending || updateKard.isPending}
          >
            {createKard.isPending || updateKard.isPending
              ? <LoadingSpinner size="sm" />
              : isEditMode ? 'Update Card' : 'Submit Card'}
          </button>
        </div>
      </div>

      {/* Modals */}
      {showNewStorageModal && (
        <NewStorageModal
          onClose={() => setShowNewStorageModal(false)}
          onCreated={(created) => setStorages((prev) => [...prev, created])}
          onFieldChange={handleChange}
          onError={setError}
        />
      )}

      {isConfirmOpen && (
        <ConfirmModal
          title="Are these data correct?"
          body={JSON.stringify(form, null, 2)}
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={confirmSubmit}
          busy={createKard.isPending}
          confirmDisabled={createKard.isPending}
        />
      )}

      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </div>
  )
}
