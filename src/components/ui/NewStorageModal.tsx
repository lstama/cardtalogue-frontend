import { useState } from 'react'
import { LoadingSpinner } from './LoadingSpinner'
import { storagesAPI } from '../../services/api'

// Modal for creating a storage that does not exist yet.
// The page owns the "modal is open" flag (onClose) and the storages list (onCreated).
export const NewStorageModal = ({
  onClose,
  onCreated,
  onFieldChange,
  onError,
}: {
  onClose: () => void
  onCreated: (storage: { id: number; name: string }) => void
  onFieldChange: (field: string, value: number) => void
  onError: (message: string) => void
}) => {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) {
      onError('Storage name is required')
      return
    }

    try {
      setIsCreating(true)
      const response = await storagesAPI.createStorage({
        code: code || name.toUpperCase(),
        name,
        description,
      })
      const created = response.data
      onCreated(created)
      onFieldChange('storage_id', created.id)
      onClose()
      setCode('')
      setName('')
      setDescription('')
    } catch (err: any) {
      onError(err.response?.data?.message || 'Failed to create storage')
    } finally {
      setIsCreating(false)
    }
  }

  const FIELD =
    'w-full border p-2 rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100'
  const LABEL = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1'

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
          Create New Storage
        </h2>

        <div className="space-y-3">
          <div>
            <label className={LABEL}>Storage Code</label>
            <input
              type="text"
              className={`${FIELD} uppercase`}
              placeholder="e.g., SHELF-A"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>
          <div>
            <label className={LABEL}>Storage Name</label>
            <input
              type="text"
              className={FIELD}
              placeholder="e.g., Shelf A"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL}>Description</label>
            <textarea
              className={FIELD}
              placeholder="Optional description..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400"
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex justify-center items-center font-bold disabled:opacity-50"
            onClick={handleCreate}
            disabled={isCreating}
          >
            {isCreating ? <LoadingSpinner size="sm" /> : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}
