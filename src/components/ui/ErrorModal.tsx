// Full-screen error dialog. The page owns the message and closes it.
export const ErrorModal = ({ message, onClose }: {
  message: string
  onClose: () => void
}) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[110]">
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-md w-full border-t-4 border-red-600">
      <h2 className="text-lg font-bold mb-4 text-red-600">Error</h2>
      <p className="text-gray-900 dark:text-gray-100 mb-4">{message}</p>
      <div className="flex justify-end">
        <button
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)
