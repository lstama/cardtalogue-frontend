import { LoadingSpinner } from './LoadingSpinner'

// Generic "review these values before saving" modal.
// `busy` is true while the underlying request is still pending.
export const ConfirmModal = ({
  title,
  body,
  onCancel,
  onConfirm,
  busy = false,
  confirmDisabled = false,
}: {
  title: string
  body: string
  onCancel: () => void
  onConfirm: () => void
  busy?: boolean
  confirmDisabled?: boolean
}) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[100]">
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full">
      <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">{title}</h2>
      <pre
        className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs mb-4 text-gray-900 dark:text-gray-100 overflow-auto max-h-60"
      >
        {body}
      </pre>
      <div className="flex justify-end space-x-2">
        <button
          data-testid="confirm-cancel"
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          data-testid="confirm-save"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex justify-center items-center font-bold"
          onClick={onConfirm}
          disabled={confirmDisabled}
        >
          {busy ? <LoadingSpinner size="sm" /> : 'Confirm & Save'}
        </button>
      </div>
    </div>
  </div>
)
