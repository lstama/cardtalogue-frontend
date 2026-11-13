// Confirmation modal shown when the user asks to log out.
// The caller owns the visibility state and the side effects (cancel / logout).
type LogoutModalProps = {
  onCancel: () => void
  onConfirm: () => void
}

export const LogoutModal = ({ onCancel, onConfirm }: LogoutModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[150]">
    <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-sm w-full">
      <h2 className="text-lg font-bold mb-4 dark:text-gray-200">Confirm Logout</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to logout?</p>
      <div className="flex justify-end space-x-2">
        <button
          data-testid="logout-cancel"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded hover:bg-gray-400 dark:hover:bg-gray-600 font-bold"
        >
          Cancel
        </button>
        <button
          data-testid="logout-confirm"
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
)
